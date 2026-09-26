import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import cartService from '../services/cartService';
import toast from 'react-hot-toast';

const CartContext = createContext();

const CART_STORAGE_KEY = 'luma_cart_state';

export const CartProvider = ({ children }) => {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const navigate = useNavigate();

  // 1. استعادة السلة محلياً فوراً لضمان 0ms عند بدء التشغيل
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return {
      items: [],
      itemCount: 0,
      subtotal: 0,
      discountAmount: 0,
      total: 0,
      coupon: null
    };
  });

  const [loading, setLoading] = useState(false);

  // حفظ الحالة محلياً دائماً
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore
    }
  }, [cart]);

  const checkAuth = () => {
    return Boolean(
      localStorage.getItem('token') || 
      localStorage.getItem('admin_token') || 
      localStorage.getItem('luma_token')
    );
  };

  const getCleanId = (target) => {
    if (!target) return "";
    if (typeof target === "string") return target.trim();
    if (typeof target === "object") {
      return String(
        target.productId || 
        target.product?._id || 
        target.product?.id || 
        target.product || 
        target._id || 
        target.id || 
        ""
      ).trim();
    }
    return String(target).trim();
  };

  // دالة مساعدة لحساب القيم والمجاميع الرياضية محلياً بدقة متناهية
  const calculateTotals = (items, discount = 0, coupon = null) => {
    const itemCount = items.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0);
    const subtotal = items.reduce((acc, i) => acc + (Number(i.price || 0) * (Number(i.quantity) || 1)), 0);
    const total = Math.max(0, subtotal - Number(discount || 0));

    return {
      items,
      itemCount,
      subtotal,
      discountAmount: Number(discount || 0),
      total,
      coupon
    };
  };

  // جلب السلة من السيرفر فقط عند أول تحميل للصفحة (Initial Hydration)
  const fetchCart = useCallback(async (silent = false) => {
    if (!checkAuth()) {
      const empty = { items: [], itemCount: 0, subtotal: 0, discountAmount: 0, total: 0, coupon: null };
      setCart(empty);
      localStorage.removeItem(CART_STORAGE_KEY);
      return;
    }

    try {
      if (!silent) setLoading(true);
      const res = await cartService.getMyCart();
      const rawItems = res?.items || res?.cart?.items || res?.data?.items || [];
      const discount = Number(res?.discountAmount || res?.cart?.discountAmount || 0);
      const coupon = res?.coupon || res?.cart?.coupon || null;

      if (Array.isArray(rawItems) && rawItems.length > 0) {
        const normalized = rawItems.map(item => {
          const isPopulated = typeof item.product === 'object' && item.product !== null;
          const baseProduct = isPopulated ? item.product : item;
          const pId = getCleanId(baseProduct);
          const price = Number(item.price || baseProduct.discountPrice || baseProduct.price || 0);

          return {
            _id: item._id || pId,
            productId: pId,
            product: isPopulated ? item.product : {
              _id: pId,
              id: pId,
              name: item.name || baseProduct.name || baseProduct.title || t('store.cart_item.default_name', 'Piece'),
              title: item.title || baseProduct.title || baseProduct.name || t('store.cart_item.default_name', 'Piece'),
              price,
              image: item.image || baseProduct.image || baseProduct.images?.[0]?.url || ''
            },
            name: item.name || baseProduct.name || baseProduct.title || t('store.cart_item.default_name', 'Piece'),
            price,
            quantity: Math.max(1, Number(item.quantity) || 1),
            image: item.image || baseProduct.image || baseProduct.images?.[0]?.url || ''
          };
        });

        setCart(calculateTotals(normalized, discount, coupon));
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem('token');
        setCart({ items: [], itemCount: 0, subtotal: 0, discountAmount: 0, total: 0, coupon: null });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart(true);
  }, [fetchCart]);

  // ─── 1. إضافة للمنتج (فورية 0ms بدون انتظار وبدون تراجع) ───
  const addToCartGlobal = async (productOrId, quantity = 1) => {
    if (!checkAuth()) {
      toast.error(t('store.auth.unauthorized', isRtl ? 'يرجى تسجيل الدخول أولاً' : 'Please sign in first'));
      navigate('/login');
      return;
    }

    const pId = getCleanId(productOrId);
    if (!pId) return;

    let prodName = t('store.cart_item.default_name', 'Piece');
    let prodPrice = 0;
    let prodImg = '';
    let maxStock = 100;

    if (typeof productOrId === 'object' && productOrId !== null) {
      prodName = productOrId.title || productOrId.name || prodName;
      prodPrice = Number(productOrId.discountPrice && productOrId.discountPrice > 0 ? productOrId.discountPrice : (productOrId.price || 0));
      prodImg = productOrId.images?.[0]?.url || productOrId.image || '';
      maxStock = Number(productOrId.stock ?? 100);
    }

    // التنفيذ الفوري على الشاشة دون انتظار السيرفر مطلقاً
    setCart((prev) => {
      const idx = prev.items.findIndex(i => i.productId === pId || i._id === pId);
      let updated = [...prev.items];

      if (idx > -1) {
        const nextQty = updated[idx].quantity + quantity;
        if (maxStock > 0 && nextQty > maxStock) {
          toast.error(isRtl ? `الحد الأقصى المتاح بالمخزون هو ${maxStock}` : `Max available stock is ${maxStock}`);
          return prev;
        }
        updated[idx] = {
          ...updated[idx],
          quantity: nextQty
        };
      } else {
        updated.push({
          _id: pId,
          productId: pId,
          product: { _id: pId, id: pId, name: prodName, price: prodPrice, image: prodImg, stock: maxStock },
          name: prodName,
          price: prodPrice,
          quantity: Math.max(1, quantity),
          image: prodImg
        });
      }

      return calculateTotals(updated, prev.discountAmount, prev.coupon);
    });

    toast.success(t('store.cart_toast.added_success', isRtl ? 'تمت الإضافة إلى الحقيبة' : 'Item added to bag'));

    // إرسال للسيرفر في الخلفية لتثبيت الحجز في الداتابيز فقط دون التعديل على الواجهة
    cartService.addToCart(pId, quantity).catch((err) => {
      console.warn("Background cart sync failed:", err?.message);
    });
  };

  // ─── 2. تحديث الكمية (فوري 0ms وبثبات مطلق) ───
  const updateQuantityGlobal = async (productOrId, newQty) => {
    const pId = getCleanId(productOrId);
    if (!pId) return;

    if (newQty <= 0) {
      return removeFromCartGlobal(pId);
    }

    // تحديث فوري مباشر
    setCart((prev) => {
      const updated = prev.items.map(item => {
        if (item.productId === pId || item._id === pId) {
          return { ...item, quantity: newQty };
        }
        return item;
      });
      return calculateTotals(updated, prev.discountAmount, prev.coupon);
    });

    // إرسال للسيرفر في الخلفية
    cartService.updateCartItem(pId, newQty).catch((err) => {
      console.warn("Background update sync failed:", err?.message);
    });
  };

  // ─── 3. حذف العنصر (فوري 0ms ويختفي نهائياً دون رجوع) ───
  const removeFromCartGlobal = async (productOrId) => {
    const pId = getCleanId(productOrId);
    if (!pId) return;

    // مسح فوري من الشاشة
    setCart((prev) => {
      const filtered = prev.items.filter(item => item.productId !== pId && item._id !== pId);
      return calculateTotals(filtered, prev.discountAmount, prev.coupon);
    });

    toast.success(t('store.cart_toast.remove_success', isRtl ? 'تم حذف العنصر من الحقيبة' : 'Item removed'));

    // إرسال للسيرفر في الخلفية
    cartService.removeFromCart(pId).catch((err) => {
      console.warn("Background remove sync failed:", err?.message);
    });
  };

  // ─── 4. تفريغ السلة بالكامل ───
  const clearCartGlobal = async () => {
    const empty = { items: [], itemCount: 0, subtotal: 0, discountAmount: 0, total: 0, coupon: null };
    setCart(empty);
    localStorage.removeItem(CART_STORAGE_KEY);
    toast.success(t('store.cart_toast.clear_success', 'Cart cleared'));

    cartService.clearCart().catch((err) => {
      console.warn("Background clear sync failed:", err?.message);
    });
  };

  // ─── 5. تطبيق الكوبون ───
  const applyCouponGlobal = async (code) => {
    try {
      const res = await cartService.applyCoupon(code);
      if (res) {
        const discount = Number(res.discountAmount || res.cart?.discountAmount || 0);
        setCart(prev => calculateTotals(prev.items, discount, res.coupon || code));
        toast.success(res.message || t('store.cart_toast.coupon_success', 'Coupon applied!'));
        return true;
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || t('store.cart_toast.coupon_error', 'Invalid coupon'));
      return false;
    }
  };

  // ─── 6. إزالة الكوبون ───
  const removeCouponGlobal = async () => {
    setCart(prev => calculateTotals(prev.items, 0, null));
    toast.success(t('store.cart_toast.coupon_removed', 'Coupon removed'));
    cartService.removeCoupon().catch(() => {});
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