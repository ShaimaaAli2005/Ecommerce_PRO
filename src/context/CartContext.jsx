import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import cartService from '../services/cartService';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  
  const [cart, setCart] = useState({
    items: [],
    itemCount: 0,
    subtotal: 0,
    discountAmount: 0,
    total: 0,
    coupon: null
  });
  
  const [loading, setLoading] = useState(false);
  
  // مراجع لتخزين الكميات التراكمية لكل منتج لضمان عدم ضياع أي ضغطة
  const pendingDeltas = useRef({});
  const syncTimeouts = useRef({});

  // دالة دمج المنتجات المتطابقة لمنع تكرار نفس المنتج في القائمة
  const mergeDuplicateItems = (items) => {
    if (!Array.isArray(items)) return [];
    const map = new Map();
    items.forEach(item => {
      const rawProd = item.product;
      const pId = (typeof rawProd === 'object' && rawProd !== null) ? (rawProd._id || rawProd.id) : (rawProd || item._id || item.id);
      if (!pId) return;
      
      const itemIdStr = String(pId);
      if (map.has(itemIdStr)) {
        const existing = map.get(itemIdStr);
        existing.quantity += (Number(item.quantity) || 1);
      } else {
        map.set(itemIdStr, { 
          ...item, 
          _uniqueKey: itemIdStr,
          product: itemIdStr 
        });
      }
    });
    return Array.from(map.values());
  };

  // جلب السلة من السيرفر بصمت
  const fetchCart = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await cartService.getMyCart();
      if (res && res.success) {
        const mergedItems = mergeDuplicateItems(res.items || []);
        const calculatedCount = mergedItems.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0);
        const calculatedSubtotal = mergedItems.reduce((acc, i) => acc + (Number(i.price || 0) * (Number(i.quantity) || 1)), 0);

        setCart({
          items: mergedItems,
          itemCount: res.itemCount !== undefined ? res.itemCount : calculatedCount,
          subtotal: res.subtotal !== undefined ? res.subtotal : calculatedSubtotal,
          discountAmount: res.discountAmount || 0,
          total: res.total !== undefined ? res.total : calculatedSubtotal,
          coupon: res.coupon || null
        });
      }
    } catch (err) {
      // صامت
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // إضافة منتج للسلة بتجميع دقيق للضغطات السريعة دون ضياع أي ضغطة
  const addToCartGlobal = async (productId, quantity = 1) => {
    const pIdStr = String(productId);

    // 1. تجميع الضغطات فوراً محلياً لضمان عدم ضياع أي ضغطة (حتى لو ضغطت 100 مرة)
    pendingDeltas.current[pIdStr] = (pendingDeltas.current[pIdStr] || 0) + quantity;

    // 2. تحديث فوري للواجهة بصرياً
    setCart(prev => {
      let updatedItems = [...prev.items];
      const existingIndex = updatedItems.findIndex(i => String(i.product || i._id) === pIdStr);

      if (existingIndex > -1) {
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + quantity
        };
      } else {
        updatedItems.push({ 
          product: pIdStr, 
          _uniqueKey: pIdStr,
          quantity, 
          price: 0, 
          name: "منتج" 
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

    toast.success(t('store.cart_toast.added_success', 'Item added to cart successfully'));

    // 3. إرسال الحصيلة النهائية للخادم بعد توقف المستخدم عن الضغط بـ 400 ميلي ثانية
    if (syncTimeouts.current[pIdStr]) {
      clearTimeout(syncTimeouts.current[pIdStr]);
    }

    syncTimeouts.current[pIdStr] = setTimeout(async () => {
      const totalDelta = pendingDeltas.current[pIdStr] || 0;
      pendingDeltas.current[pIdStr] = 0; // تفريغ العداد المؤقت

      if (totalDelta <= 0) return;

      try {
        const res = await cartService.addToCart(productId, totalDelta);
        if (res && res.success) {
          const mergedItems = mergeDuplicateItems(res.items || []);
          setCart({
            items: mergedItems,
            itemCount: res.itemCount || mergedItems.reduce((acc, i) => acc + i.quantity, 0),
            subtotal: res.subtotal || 0,
            discountAmount: res.discountAmount || 0,
            total: res.total || 0,
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
        fetchCart(true); // مزامنة إجبارية عند الخطأ
      }
    }, 400);
  };

  // تحديث كمية منتج
  const updateQuantityGlobal = async (productId, quantity) => {
    if (quantity <= 0) {
      return removeFromCartGlobal(productId);
    }

    const pIdStr = String(productId);

    setCart(prev => {
      const updatedItems = prev.items.map(item => {
        const currentId = String(item.product || item._id);
        if (currentId === pIdStr) {
          return { ...item, quantity };
        }
        return item;
      });

      const newSubtotal = updatedItems.reduce((acc, item) => acc + (Number(item.price || 0) * item.quantity), 0);
      const discount = prev.discountAmount || 0;
      const newTotal = Math.max(0, newSubtotal - discount);
      const newCount = updatedItems.reduce((acc, item) => item.quantity, 0);

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
        const res = await cartService.updateCartItem(productId, quantity);
        if (res && res.success) {
          const mergedItems = mergeDuplicateItems(res.items || []);
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
  const removeFromCartGlobal = async (productId) => {
    const pIdStr = String(productId);

    setCart(prev => {
      const updatedItems = prev.items.filter(item => String(item.product || item._id) !== pIdStr);
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

    toast.success(t('store.cart_toast.remove_success', 'Item removed from cart'));

    try {
      const res = await cartService.removeFromCart(productId);
      if (res && res.success) {
        const mergedItems = mergeDuplicateItems(res.items || []);
        setCart({
          items: mergedItems,
          itemCount: res.itemCount || 0,
          subtotal: res.subtotal || 0,
          discountAmount: res.discountAmount || 0,
          total: res.total || 0,
          coupon: res.coupon || null
        });
      }
    } catch (err) {
      toast.error(t('store.cart_toast.remove_error', 'Failed to remove item'));
      fetchCart(true);
    }
  };

  // تطبيق كوبون
  const applyCouponGlobal = async (code) => {
    try {
      const res = await cartService.applyCoupon(code);
      if (res && res.success) {
        const mergedItems = mergeDuplicateItems(res.items || cart.items);
        setCart({
          items: mergedItems,
          itemCount: res.itemCount || cart.itemCount,
          subtotal: res.subtotal || cart.subtotal,
          discountAmount: res.discountAmount || cart.discountAmount,
          total: res.total || cart.total,
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
          subtotal: res.subtotal || prev.subtotal,
          discountAmount: 0,
          total: res.total || prev.subtotal,
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

export const useCart = () => useContext(CartContext);