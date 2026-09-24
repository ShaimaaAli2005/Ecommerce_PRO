import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Heart, 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  Percent, 
  PackageX, 
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useWishlist } from '../../../context/WishlistContext';
import { useCart } from '../../../context/CartContext';
import { useSettings } from '../../../context/SettingsContext';
import wishlistService from '../../../services/wishlistService';
import toast from 'react-hot-toast';

const resolveProductImage = (product) => {
  if (!product) return 'https://placehold.co/400';
  if (Array.isArray(product.images) && product.images.length > 0) {
    const firstImg = product.images[0];
    return typeof firstImg === 'string' ? firstImg : firstImg?.url || 'https://placehold.co/400';
  }
  if (typeof product.image === 'string') return product.image;
  if (typeof product.imageUrl === 'string') return product.imageUrl;
  return 'https://placehold.co/400';
};

export default function WishlistPage() {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const navigate = useNavigate();
  const { formatPrice, currencyLabel } = useSettings();

  const { removeFromWishlistGlobal, clearWishlistGlobal } = useWishlist();
  const { addToCartGlobal } = useCart();

  const [wishlistProducts, setWishlistProducts] = useState(() => {
    try {
      const cached = sessionStorage.getItem('luma_wishlist_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(() => {
    try {
      const cached = sessionStorage.getItem('luma_wishlist_cache');
      return !cached;
    } catch {
      return true;
    }
  });

  const [actionBusyId, setActionBusyId] = useState(null);
  const isDeletingRef = useRef(false);

  const fetchWishlistData = useCallback(async (isSilent = false) => {
    if (isDeletingRef.current) return;

    const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
    if (!token) {
      setWishlistProducts([]);
      setLoading(false);
      return;
    }

    if (!isSilent && wishlistProducts.length === 0) {
      setLoading(true);
    }

    try {
      const res = await wishlistService.getMyWishlist();
      const rawItems = res?.wishlist?.products || res?.products || res?.data?.products || [];
      
      const normalizedItems = Array.isArray(rawItems) ? rawItems.map((item, index) => {
        if (!item) return { _id: `deleted-${index}`, isCorrupted: true };
        if (item.product && typeof item.product === 'object') {
          return { ...item.product, _wishlistEntryId: item._id };
        }
        if (item.product === null) {
          return { _id: item._id, name: t('store.wishlist.unavailable_item', 'Deleted Product'), isCorrupted: true };
        }
        if (typeof item === 'object') return item;
        return { _id: item, isCorrupted: true };
      }) : [];

      if (!isDeletingRef.current) {
        setWishlistProducts(normalizedItems);
        sessionStorage.setItem('luma_wishlist_cache', JSON.stringify(normalizedItems));
      }
    } catch (err) {
      console.error('Wishlist sync error:', err);
      if (!isSilent) {
        toast.error(t('store.wishlist.fetch_error', 'Failed to load wishlist items'));
      }
    } finally {
      setLoading(false);
    }
  }, [t, wishlistProducts.length]);

  useEffect(() => {
    fetchWishlistData(wishlistProducts.length > 0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleRemoveItem = async (e, productId) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    isDeletingRef.current = true;

    setWishlistProducts((prev) => {
      const updated = prev.filter((p) => (p._id || p.id) !== productId);
      sessionStorage.setItem('luma_wishlist_cache', JSON.stringify(updated));
      return updated;
    });

    toast.success(t('store.wishlist.removed_success', 'Removed from wishlist'), {
      duration: 1500,
      position: 'bottom-center'
    });

    try {
      if (typeof removeFromWishlistGlobal === 'function') {
        await removeFromWishlistGlobal(productId);
      } else {
        await wishlistService.removeFromWishlist(productId);
      }
    } catch (err) {
      console.error('Background removal error:', err);
    } finally {
      setTimeout(() => {
        isDeletingRef.current = false;
      }, 500);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm(t('store.wishlist.clear_confirm', 'Are you sure you want to clear your entire wishlist?'))) {
      return;
    }

    isDeletingRef.current = true;
    setWishlistProducts([]);
    sessionStorage.removeItem('luma_wishlist_cache');
    toast.success(t('store.wishlist.cleared_success', 'Wishlist cleared successfully'));

    try {
      if (typeof clearWishlistGlobal === 'function') {
        await clearWishlistGlobal();
      } else {
        await wishlistService.clearWishlist();
      }
    } catch (err) {
      console.error('Clear wishlist error:', err);
    } finally {
      setTimeout(() => {
        isDeletingRef.current = false;
      }, 500);
    }
  };

  const handleMoveToCart = async (e, product) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
    if (!token) {
      toast.error(t('store.auth.unauthorized', 'Please sign in first'));
      navigate('/login');
      return;
    }

    const prodId = product._id || product.id;
    const stock = Number(product.stock ?? 10);
    
    if (stock <= 0) {
      toast.error(t('store.catalog.out_of_stock_error', 'Product is out of stock'));
      return;
    }

    isDeletingRef.current = true;
    setActionBusyId(prodId);

    setWishlistProducts((prev) => {
      const updated = prev.filter((p) => (p._id || p.id) !== prodId);
      sessionStorage.setItem('luma_wishlist_cache', JSON.stringify(updated));
      return updated;
    });

    toast.success(t('store.wishlist.moved_to_cart_success', 'Product moved to cart successfully'), {
      icon: '🛍️',
      duration: 2000
    });

    try {
      await addToCartGlobal(product, 1);
      if (typeof removeFromWishlistGlobal === 'function') {
        await removeFromWishlistGlobal(prodId);
      } else {
        await wishlistService.removeFromWishlist(prodId);
      }
    } catch (err) {
      console.error('Move to cart error:', err);
    } finally {
      setActionBusyId(null);
      setTimeout(() => {
        isDeletingRef.current = false;
      }, 500);
    }
  };

  const itemsCount = useMemo(() => wishlistProducts.length, [wishlistProducts.length]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#070D1E] text-[#0B132B] dark:text-white py-8 px-4 sm:px-6 lg:px-8 font-['Poppins'] transition-colors duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* الترويسة الرئيسية المدمجة */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-5">
          <div className="space-y-1 text-center sm:text-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest">
              <Heart className="w-3 h-3 fill-current" />
              <span>{t('store.wishlist.badge', 'Saved Curation')}</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight">
              {t('store.wishlist.page_title', 'Your Private Wishlist')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
              {itemsCount} {t('store.wishlist.items_count_label', 'saved assets')}
            </p>
          </div>

          {itemsCount > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:underline cursor-pointer flex items-center gap-1.5 transition-colors px-3 py-2 rounded-xl hover:bg-rose-500/5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('store.wishlist.clear_all', 'Clear Wishlist')}</span>
            </button>
          )}
        </div>

        {/* حالة التحميل */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="bg-white/40 dark:bg-[#121c38]/40 rounded-2xl border border-black/5 dark:border-white/10 p-3 space-y-3 animate-pulse">
                <div className="aspect-square w-full bg-black/10 dark:bg-white/10 rounded-xl" />
                <div className="h-3 bg-black/10 dark:bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-black/10 dark:bg-white/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : itemsCount === 0 ? (
          <div className="bg-white/80 dark:bg-[#121c38]/80 backdrop-blur-xl rounded-3xl border border-black/5 dark:border-white/10 p-12 text-center max-w-md mx-auto space-y-5 shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Heart className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-black uppercase tracking-wider">{t('store.wishlist.empty_title', 'Your Wishlist is Empty')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                {t('store.wishlist.empty_desc', 'Explore our luxury catalog and tap the heart icon on any asset to save it here.')}
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-xs font-black uppercase tracking-wider transition hover:opacity-90 shadow-md cursor-pointer"
            >
              <span>{t('store.wishlist.explore_catalog', 'Explore Catalog')}</span>
              {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </Link>
          </div>
        ) : (
          /* شبكة بطاقات بحجم مدمج وأنيق (Compact Grid) */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {wishlistProducts.map((product, idx) => {
              const pId = product._id || product.id || `item-${idx}`;

              if (product.isCorrupted || !product.name) {
                return (
                  <div 
                    key={pId}
                    className="bg-white dark:bg-[#121c38] rounded-2xl border border-rose-500/20 p-4 flex flex-col justify-between space-y-3 shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-xs text-[#0B132B] dark:text-white line-clamp-1">
                        {t('store.wishlist.item_no_longer_available', 'المنتج لم يعد متوفراً')}
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        {t('store.wishlist.deleted_item_desc', 'تم حذف هذه القطعة نهائياً من المتجر.')}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleRemoveItem(e, pId)}
                      className="w-full py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{t('store.wishlist.remove_btn', 'حذف')}</span>
                    </button>
                  </div>
                );
              }

              const imageUrl = resolveProductImage(product);
              const price = Number(product.price) || 0;
              const discountPrice = Number(product.discountPrice) || 0;
              const hasDiscount = discountPrice > 0 && discountPrice < price;
              const finalPrice = hasDiscount ? discountPrice : price;

              const stock = product.stock !== undefined && product.stock !== null ? Number(product.stock) : 10;
              const isOutOfStock = stock <= 0;
              const isItemBusy = actionBusyId === pId;

              const categoryName = typeof product.category === 'object'
                ? product.category?.name || product.category?.slug || 'Curated'
                : product.category || 'Curated';

              return (
                <div 
                  key={pId} 
                  className="bg-white dark:bg-[#121c38] rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    {/* صورة مصغرة ومحكومة الأبعاد */}
                    <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-gray-900">
                      <Link to={`/products/${pId}`}>
                        <img
                          src={imageUrl}
                          alt={product.name || 'Product'}
                          loading="lazy"
                          onError={(e) => { e.currentTarget.src = 'https://placehold.co/400'; }}
                          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                        />
                      </Link>

                      {hasDiscount && !isOutOfStock && (
                        <div className="absolute top-2 start-2 z-10 bg-[#E89A5B] text-white text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5 pointer-events-none">
                          <Percent className="w-2.5 h-2.5" />
                          <span>{Math.round(((price - discountPrice) / price) * 100)}%</span>
                        </div>
                      )}

                      {isOutOfStock && (
                        <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                          <span className="bg-rose-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow flex items-center gap-1">
                            <PackageX className="w-3 h-3" />
                            <span>{t('store.catalog.out_of_stock', 'Out of Stock')}</span>
                          </span>
                        </div>
                      )}

                      {/* زر الحذف الأنيق الصغير */}
                      <button
                        type="button"
                        onClick={(e) => handleRemoveItem(e, pId)}
                        className="absolute top-2 end-2 z-30 p-1.5 rounded-full bg-white/95 dark:bg-[#070D1E]/90 text-rose-500 shadow-md hover:bg-rose-500 hover:text-white transition-all cursor-pointer backdrop-blur-md active:scale-90"
                        title={t('store.wishlist.remove_btn', 'Remove from Wishlist')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* بيانات المنتج */}
                    <div className="p-3 space-y-1">
                      <span className="text-[9px] font-black text-[#E89A5B] uppercase tracking-wider block truncate">
                        {categoryName}
                      </span>
                      <Link to={`/products/${pId}`}>
                        <h3 className="font-bold text-xs line-clamp-1 hover:text-[#E89A5B] transition-colors" title={product.name}>
                          {product.name}
                        </h3>
                      </Link>
                      
                      <div className="flex items-baseline gap-1.5 pt-0.5">
                        <span className="font-mono text-xs font-black text-[#0B132B] dark:text-white">
                          {currencyLabel} {formatPrice(finalPrice)}
                        </span>
                        {hasDiscount && (
                          <span className="font-mono text-[10px] text-slate-400 line-through">
                            {currencyLabel} {formatPrice(price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* زر الإجراء السفلي المصغر */}
                  <div className="p-3 pt-0">
                    {isOutOfStock ? (
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider text-center bg-black/5 dark:bg-white/5 text-slate-400 border border-black/5 dark:border-white/5 select-none">
                          {t('store.catalog.out_of_stock', 'Out of Stock')}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveItem(e, pId)}
                          className="p-2 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                          title={t('store.wishlist.remove_btn', 'Remove')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isItemBusy}
                        onClick={(e) => handleMoveToCart(e, product)}
                        className="w-full py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 shadow-xs bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] hover:opacity-90 active:scale-[0.98] cursor-pointer"
                      >
                        {isItemBusy ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <ShoppingBag className="w-3 h-3" />
                            <span>{t('store.wishlist.move_to_cart', 'Move to Bag')}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}