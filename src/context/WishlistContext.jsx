import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import wishlistService from '../services/wishlistService';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const navigate = useNavigate();

  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const checkAuth = () => {
    return Boolean(
      localStorage.getItem('token') || 
      localStorage.getItem('admin_token') || 
      localStorage.getItem('luma_token')
    );
  };

  const fetchWishlist = useCallback(async () => {
    if (!checkAuth()) {
      setWishlistIds([]);
      setWishlistProducts([]);
      return;
    }

    try {
      setLoading(true);
      const res = await wishlistService.getMyWishlist();
      
      // استخراج المنتجات بدقة متوافقة 100% مع رد الـ API الموثق في Swagger
      const rawList = res?.wishlist?.products || res?.products || res?.data || (Array.isArray(res) ? res : []);
      const validArray = Array.isArray(rawList) ? rawList : [];

      setWishlistProducts(validArray);
      
      const ids = validArray.map(p => {
        if (!p) return '';
        if (typeof p === 'object') return String(p._id || p.id || p.productId || '');
        return String(p);
      }).filter(Boolean);

      setWishlistIds(ids);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setWishlistIds([]);
        setWishlistProducts([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = useCallback((productOrId) => {
    if (!productOrId) return false;
    const cleanId = String(
      typeof productOrId === 'object' 
        ? (productOrId._id || productOrId.id || productOrId.productId || productOrId.product) 
        : productOrId
    ).trim();

    return wishlistIds.some(id => String(id) === cleanId);
  }, [wishlistIds]);

  // دالة تبديل حالة المفضلة (إضافة / حذف) مع Optimistic Update
  const toggleWishlist = async (productOrId) => {
    if (!checkAuth()) {
      toast.error(t('store.auth.unauthorized', isRtl ? 'يرجى تسجيل الدخول أولاً لإدارة المفضلة' : 'Please sign in first'));
      navigate('/login');
      return false;
    }

    const cleanId = String(
      typeof productOrId === 'object' 
        ? (productOrId._id || productOrId.id || productOrId.productId || productOrId.product) 
        : productOrId
    ).trim();

    if (!cleanId) return false;

    const isExist = isInWishlist(cleanId);
    const previousIds = [...wishlistIds];
    const previousProducts = [...wishlistProducts];

    // تحديث تفاؤلي فوري
    if (isExist) {
      setWishlistIds(prev => prev.filter(id => String(id) !== cleanId));
      setWishlistProducts(prev => prev.filter(p => String(p._id || p.id) !== cleanId));
      toast.success(t('store.wishlist.removed_success', isRtl ? 'تمت إزالة المنتج من المفضلة' : 'Removed from wishlist'));
    } else {
      setWishlistIds(prev => [...prev, cleanId]);
      if (typeof productOrId === 'object') {
        setWishlistProducts(prev => [...prev, productOrId]);
      }
      toast.success(t('store.wishlist.added_success', isRtl ? 'تمت إضافة المنتج إلى المفضلة' : 'Added to wishlist'));
    }

    try {
      if (isExist) {
        await wishlistService.removeFromWishlist(cleanId);
      } else {
        await wishlistService.addToWishlist(cleanId);
      }
      return !isExist;
    } catch (err) {
      // استعادة الحالة السابقة عند الفشل
      setWishlistIds(previousIds);
      setWishlistProducts(previousProducts);

      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error(isRtl ? 'تعذر مزامنة المفضلة مع السيرفر' : 'Failed to sync wishlist');
      }
      return isExist;
    }
  };

  // حذف صريح لعنصر محدد
  const removeFromWishlistGlobal = async (productOrId) => {
    const cleanId = String(
      typeof productOrId === 'object' 
        ? (productOrId._id || productOrId.id || productOrId.productId) 
        : productOrId
    ).trim();

    if (!cleanId) return;

    setWishlistIds(prev => prev.filter(id => String(id) !== cleanId));
    setWishlistProducts(prev => prev.filter(p => String(p._id || p.id) !== cleanId));

    try {
      await wishlistService.removeFromWishlist(cleanId);
    } catch (err) {
      fetchWishlist();
      throw err;
    }
  };

  // تفريغ المفضلة بالكامل
  const clearWishlistGlobal = async () => {
    setWishlistIds([]);
    setWishlistProducts([]);

    try {
      await wishlistService.clearWishlist();
    } catch (err) {
      fetchWishlist();
      throw err;
    }
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlistIds, 
      wishlistProducts,
      wishlistCount: wishlistIds.length,
      toggleWishlist, 
      toggleWishlistGlobal: toggleWishlist, 
      removeFromWishlistGlobal,
      clearWishlistGlobal,
      isInWishlist, 
      setWishlistIds, 
      fetchWishlist,
      loading 
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;