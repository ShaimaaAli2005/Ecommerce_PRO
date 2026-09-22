import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import wishlistService from '../services/wishlistService';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const navigate = useNavigate();

  const [wishlistIds, setWishlistIds] = useState([]);

  const checkAuth = () => {
    return Boolean(localStorage.getItem('token') || localStorage.getItem('admin_token'));
  };

  const fetchWishlist = useCallback(async () => {
    if (!checkAuth()) {
      setWishlistIds([]);
      return;
    }

    try {
      const res = await wishlistService.getWishlist();
      let rawList = [];
      if (res && res.products) {
        rawList = res.products;
      } else if (res && res.data) {
        rawList = res.data;
      } else if (Array.isArray(res)) {
        rawList = res;
      }

      const ids = rawList.map(p => String(p._id || p.id || p));
      setWishlistIds(ids);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setWishlistIds([]);
      }
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = useCallback((productId) => {
    if (!productId) return false;
    const cleanId = String(typeof productId === 'object' ? (productId._id || productId.id || productId.product) : productId);
    return wishlistIds.some(id => String(id) === cleanId);
  }, [wishlistIds]);

  const toggleWishlist = async (productId) => {
    if (!checkAuth()) {
      toast.error(isRtl ? 'يرجى تسجيل الدخول أولاً لإدارة المفضلة' : 'Please sign in first to manage wishlist');
      navigate('/login');
      return;
    }

    const cleanId = String(typeof productId === 'object' ? (productId._id || productId.id || productId.product) : productId);
    const isExist = isInWishlist(cleanId);

    // تحديث بصري فوري (Optimistic Update)
    setWishlistIds(prev => 
      isExist ? prev.filter(id => String(id) !== cleanId) : [...prev, cleanId]
    );

    if (isExist) {
      toast.success(isRtl ? 'تمت إزالة المنتج من المفضلة' : 'Removed from wishlist');
    } else {
      toast.success(isRtl ? 'تمت إضافة المنتج إلى المفضلة' : 'Added to wishlist');
    }

    try {
      if (isExist) {
        await wishlistService.removeFromWishlist(cleanId);
      } else {
        await wishlistService.addToWishlist(cleanId);
      }
    } catch (err) {
      fetchWishlist();
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setWishlistIds([]);
        navigate('/login');
      } else {
        toast.error(isRtl ? 'تعذر مزامنة المفضلة' : 'Failed to sync wishlist');
      }
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isInWishlist, setWishlistIds, fetchWishlist }}>
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