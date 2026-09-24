import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import cartService from '../services/cartService';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const navigate = useNavigate();
  
  const [cart, setCart] = useState({
    items: [],
    itemCount: 0,
    subtotal: 0,
    discountAmount: 0,
    total: 0,
    coupon: null
  });
  
  const [loading, setLoading] = useState(false);
  
  // مراجع لتخزين الضغطات المتتالية وتأخير الاستدعاءات (Debouncing)
  const pendingDeltas = useRef({});
  const syncTimeouts = useRef({});

  // تنظيف الـ Timeouts عند إغلاق المكون
  useEffect(() => {
    return () => {
      Object.values(syncTimeouts.current).forEach(clearTimeout);
    };
  }, []);

  // فحص تسجيل الدخول
  const checkAuth = () => {
    return Boolean(
      localStorage.getItem('token') || 
      localStorage.getItem('admin_token') || 
      localStorage.getItem('luma_token')
    );
  };

  // استخراج معرّف المنتج الصافي
  const getCleanId = (target) => {
    if (!target) return "";
    if (typeof target === "string") return target.trim();
    if (typeof target === "object") {
      return String(target.productId || target.product?._id || target.product?.id || target.product || target._id || target.id || "").trim();
    }
    return String(target).trim();
  };

  // دمج المنتجات المتطابقة مع الحفاظ على البيانات الكاملة
  const mergeDuplicateItems = (items) => {
    if (!Array.isArray(items)) return [];
    const map = new Map();

    items.forEach(item => {
      const pId = getCleanId(item);
      if (!pId) return;

      if (map.has(pId)) {
        const existing = map.get(pId);
        existing.quantity += (Number(item.quantity) || 1);
      } else {
        map.set(pId, { 
          ...item,
          productId: pId,
          _uniqueKey: pId,
          price: Number(item.price || item.product?.price || 0),
          quantity: Number(item.quantity || 1)
        });
      }
    });

    return Array.from(map.values());
  };

  // جلب السلة من السيرفر
  const fetchCart = useCallback(async (silent = false) => {
    if (!checkAuth()) {
      setCart({
        items: [],
        itemCount: 0,
        subtotal: 0,
        discountAmount: 0,
        total: 0,
        coupon: null
      });
      return;
    }

    try {
      if (!silent) setLoading(true);
      const res = await cartService.getMyCart();
      if (res && res.success) {
        const mergedItems = mergeDuplicateItems(res.items || res.cart?.items || []);
        const calculatedCount = mergedItems.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0);
        const calculatedSubtotal = mergedItems.reduce((acc, i) => acc + (Number(i.price || 0) * (Number(i.quantity) || 1)), 0);

        setCart({
          items: mergedItems,
          itemCount: res.itemCount !== undefined ? res.itemCount : calculatedCount,
          subtotal: res.subtotal !== undefined ? res.subtotal : calculatedSubtotal,
          discountAmount: Number(res.discountAmount || 0),
          total: res.total !== undefined ? res.total : Math.max(0, calculatedSubtotal - (res.discountAmount || 0)),
          coupon: res.coupon || null
        });
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem('token');
        setCart({
          items: [],
          itemCount: 0,
          subtotal: 0,
          discountAmount: 0,
          total: 0,
          coupon: null
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // إضافة منتج للسلة مع دعم التحديث البصري الذكي وتجميع الضغطات
  const addToCartGlobal = async (productOrId, quantity = 1) => {
    if (!checkAuth()) {
      toast.error(t('store.auth.unauthorized', isRtl ? 'يرجى تسجيل الدخول أولاً لإضافة المنتجات إلى السلة' : 'Please sign in first to add items to cart'));
      navigate('/login');
      return;
    }

    const pIdStr = getCleanId(productOrId);
    if (!pIdStr) return;

    // استخراج بيانات المنتج الأولية للتحديث البصري
    let prodMeta = { name: t('store.cart_item.default_name', 'Product'), price: 0, image: '' };
    if (typeof productOrId === 'object' && productOrId !== null) {
      prodMeta = {
        name: productOrId.name || productOrId.title || prodMeta.name,
        price: Number(productOrId.discountPrice && productOrId.discountPrice > 0 ? productOrId.discountPrice : (productOrId.price || 0)),
        image: productOrId.images?.[0]?.url || productOrId.image || productOrId.imageUrl || ''
      };
    }

    // 1. تجميع الضغطات السريعة
    pendingDeltas.current[pIdStr] = (pendingDeltas.current[pIdStr] || 0) + quantity;

    // 2. تحديث تفاؤلي فوري
    setCart(prev => {
      let updatedItems = [...prev.items];
      const existingIndex = updatedItems.findIndex(i => getCleanId(i) === pIdStr);

      if (existingIndex > -1) {
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + quantity
        };
      } else {
        updatedItems.push({ 
          product: pIdStr,
          productId: pIdStr,
          _uniqueKey: pIdStr,
          quantity, 
          price: prodMeta.price, 
          name: prodMeta.name,
          image: prodMeta.image
        });
      }

      const newCount = prev.itemCount + quantity;
      const newSubtotal = updatedItems.reduce((acc, i) => acc + (Number(i.price || 0) * i.quantity), 0);

      return {
        ...prev,
        items: updatedItems,
        itemCount: newCount,
        subtotal: newSubtotal,
        total: Math.max(0, newSubtotal - (prev.discountAmount || 0))
      };
    });

    toast.success(t('store.cart_toast.added_success', isRtl ? 'تمت إضافة المنتج إلى السلة' : 'Item added to cart successfully'));

    // 3. إرسال الطلب للخادم بعد استقرار الضغط بـ 400ms
    if (syncTimeouts.current[pIdStr]) {
      clearTimeout(syncTimeouts.current[pIdStr]);
    }

    syncTimeouts.current[pIdStr] = setTimeout(async () => {
      const totalDelta = pendingDeltas.current[pIdStr] || 0;
      pendingDeltas.current[pIdStr] = 0;

      if (totalDelta <= 0) return;

      try {
        const res = await cartService.addToCart(pIdStr, totalDelta);
        if (res && res.success) {
          const mergedItems = mergeDuplicateItems(res.items || res.cart?.items || []);
          setCart({
            items: mergedItems,
            itemCount: res.itemCount !== undefined ? res.itemCount : mergedItems.reduce((acc, i) => acc + i.quantity, 0),
            subtotal: res.subtotal !== undefined ? res.subtotal : 0,
            discountAmount: Number(res.discountAmount || 0),
            total: res.total !== undefined ? res.total : 0,
            coupon: res.coupon || null
          });
        }
      } catch (err) {
        const serverMessage = err?.response?.data?.message || '';
        if (serverMessage.toLowerCase().includes('stock') || serverMessage.toLowerCase().includes('0 items')) {
          toast.error(isRtl ? 'هذا المنتج غير متاح حالياً (نفد المخزون)' : 'This product is out of stock');
        } else {
          toast.error(serverMessage || t('store.cart_toast.add_error', 'Failed to add item'));
        }
        fetchCart(true);
      }
    }, 400);
  };

  // تحديث كمية منتج
  const updateQuantityGlobal = async (productOrId, quantity) => {
    const pIdStr = getCleanId(productOrId);
    if (!pIdStr) return;

    if (quantity <= 0) {
      return removeFromCartGlobal(pIdStr);
    }

    setCart(prev => {
      const updatedItems = prev.items.map(item => {
        if (getCleanId(item) === pIdStr) {
          return { ...item, quantity };
        }
        return item;
      });

      const newSubtotal = updatedItems.reduce((acc, item) => acc + (Number(item.price || 0) * item.quantity), 0);
      const discount = prev.discountAmount || 0;
      const newTotal = Math.max(0, newSubtotal - discount);
      const newCount = updatedItems.reduce((acc, item) => acc + item.quantity, 0);

      return {
        ...prev,
        items: updatedItems,
        itemCount: newCount,
        subtotal: newSubtotal,
        total: newTotal
      };
    });

    if (syncTimeouts.current[`update_${pIdStr}`]) {
      clearTimeout(syncTimeouts.current[`update_${pIdStr}`]);
    }

    syncTimeouts.current[`update_${pIdStr}`] = setTimeout(async () => {
      try {
        const res = await cartService.updateCartItem(pIdStr, quantity);
        if (res && res.success) {
          const mergedItems = mergeDuplicateItems(res.items || res.cart?.items || []);
          setCart(prev => ({
            ...prev,
            items: mergedItems,
            itemCount: res.itemCount !== undefined ? res.itemCount : prev.itemCount,
            subtotal: res.subtotal !== undefined ? res.subtotal : prev.subtotal,
            discountAmount: res.discountAmount !== undefined ? res.discountAmount : prev.discountAmount,
            total: res.total !== undefined ? res.total : prev.total,
            coupon: res.coupon !== undefined ? res.coupon : prev.coupon
          }));
        }
      } catch (err) {
        const serverMessage = err?.response?.data?.message || '';
        if (serverMessage.toLowerCase().includes('stock') || serverMessage.toLowerCase().includes('0 items')) {
          toast.error(isRtl ? 'الكمية المطلوبة غير متوفرة في المخزون' : 'Requested quantity is not available in stock');
        } else {
          toast.error(serverMessage || t('store.cart_toast.update_error', 'Failed to update quantity'));
        }
        fetchCart(true);
      }
    }, 400);
  };

  // حذف منتج من السلة فورياً
  const removeFromCartGlobal = async (productOrId) => {
    const pIdStr = getCleanId(productOrId);
    if (!pIdStr) return;

    setCart(prev => {
      const updatedItems = prev.items.filter(item => getCleanId(item) !== pIdStr);
      const newCount = updatedItems.reduce((acc, item) => acc + item.quantity, 0);
      const newSubtotal = updatedItems.reduce((acc, item) => acc + (Number(item.price || 0) * item.quantity), 0);
      
      return {
        ...prev,
        items: updatedItems,
        itemCount: newCount,
        subtotal: newSubtotal,
        total: Math.max(0, newSubtotal - (prev.discountAmount || 0))
      };
    });

    toast.success(t('store.cart_toast.remove_success', isRtl ? 'تم حذف العنصر من السلة' : 'Item removed from cart'));

    try {
      const res = await cartService.removeFromCart(pIdStr);
      if (res && res.success) {
        const mergedItems = mergeDuplicateItems(res.items || res.cart?.items || []);
        setCart({
          items: mergedItems,
          itemCount: res.itemCount !== undefined ? res.itemCount : mergedItems.reduce((acc, i) => acc + i.quantity, 0),
          subtotal: res.subtotal !== undefined ? res.subtotal : 0,
          discountAmount: Number(res.discountAmount || 0),
          total: res.total !== undefined ? res.total : 0,
          coupon: res.coupon || null
        });
      }
    } catch (err) {
      toast.error(t('store.cart_toast.remove_error', 'Failed to remove item'));
      fetchCart(true);
    }
  };

  // تطبيق كود كوبون
  const applyCouponGlobal = async (code) => {
    try {
      const res = await cartService.applyCoupon(code);
      if (res && res.success) {
        const mergedItems = mergeDuplicateItems(res.items || res.cart?.items || cart.items);
        setCart({
          items: mergedItems,
          itemCount: res.itemCount !== undefined ? res.itemCount : cart.itemCount,
          subtotal: res.subtotal !== undefined ? res.subtotal : cart.subtotal,
          discountAmount: Number(res.discountAmount || 0),
          total: res.total !== undefined ? res.total : cart.total,
          coupon: res.coupon || code
        });
        toast.success(res.message || t('store.cart_toast.coupon_success', 'Coupon applied successfully!'));
        return true;
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || t('store.cart_toast.coupon_error', 'Invalid coupon or empty cart'));
      return false;
    }
  };

  // إزالة الكوبون
  const removeCouponGlobal = async () => {
    try {
      const res = await cartService.removeCoupon();
      if (res && res.success) {
        setCart(prev => ({
          ...prev,
          subtotal: res.subtotal !== undefined ? res.subtotal : prev.subtotal,
          discountAmount: 0,
          total: res.total !== undefined ? res.total : prev.subtotal,
          coupon: null
        }));
        toast.success(t('store.cart_toast.coupon_removed', 'Coupon removed'));
      }
    } catch (err) {
      toast.error(t('store.cart_toast.coupon_remove_error', 'Failed to remove coupon'));
    }
  };

  // تفريغ السلة بالكامل
  const clearCartGlobal = async () => {
    try {
      await cartService.clearCart();
      setCart({
        items: [],
        itemCount: 0,
        subtotal: 0,
        discountAmount: 0,
        total: 0,
        coupon: null
      });
      toast.success(t('store.cart_toast.clear_success', 'Cart cleared successfully'));
    } catch (err) {
      toast.error(t('store.cart_toast.clear_error', 'Failed to clear cart'));
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      fetchCart,
      addToCartGlobal,
      updateQuantityGlobal,
      removeFromCartGlobal,
      applyCouponGlobal,
      removeCouponGlobal,
      clearCartGlobal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;