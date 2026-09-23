import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, ArrowRight, ArrowLeft, ShieldCheck, Truck, RefreshCw, Star, ShoppingBag, Heart } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addToCartGlobal } = useCart();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/products?featured=true&limit=8');
        if (res && res.data) {
          setFeaturedProducts(res.data.products || res.data || []);
        }
      } catch (err) {
        try {
          const fallbackRes = await axiosInstance.get('/products?limit=8');
          setFeaturedProducts(fallbackRes.data?.products || fallbackRes.data || []);
        } catch (e) {
          console.error(e);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B132B] text-[#0B132B] dark:text-white font-['Poppins'] transition-colors duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* القسم الرئيسي (Hero Section) */}
      <section className="relative overflow-hidden py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#E89A5B]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E89A5B]/10 text-[#E89A5B] text-xs font-bold uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('store.home.badge')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            {t('store.home.hero_title')}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {t('store.home.hero_subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/products"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-xs font-bold uppercase tracking-wider hover:opacity-90 transition shadow-xl flex items-center justify-center gap-2"
            >
              <span>{t('store.home.explore_btn')}</span>
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Link>

            <Link
              to="/my-orders"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2"
            >
              <span>{t('store.home.orders_btn')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* قسم الميزات والضمانات */}
      <section className="border-y border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-black/5 dark:border-white/10">
            <div className="w-12 h-12 rounded-xl bg-[#E89A5B]/10 text-[#E89A5B] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase">{t('store.home.feature_shipping')}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">{t('store.home.feature_shipping_desc')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-black/5 dark:border-white/10">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase">{t('store.home.feature_payment')}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">{t('store.home.feature_payment_desc')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-black/5 dark:border-white/10">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase">{t('store.home.feature_returns')}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">{t('store.home.feature_returns_desc')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-black/5 dark:border-white/10">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase">{t('store.home.feature_quality')}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">{t('store.home.feature_quality_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* قسم المنتجات المميزة (Featured Products) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              {t('store.home.featured_title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">
              {t('store.home.featured_subtitle')}
            </p>
          </div>

          <Link
            to="/products"
            className="text-xs font-bold text-[#E89A5B] hover:underline flex items-center gap-1.5 uppercase tracking-wider"
          >
            <span>{t('store.home.view_all')}</span>
            {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#0B132B] dark:border-[#E89A5B] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs font-bold">{t('store.home.no_products')}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => {
              const pId = product._id || product.id;
              const isWishlisted = wishlistIds.includes(pId);
              const imageUrl = product.images?.[0]?.url || product.image || 'https://placehold.co/300';

              return (
                <div key={pId} className="bg-white dark:bg-gray-800 rounded-3xl border border-black/5 dark:border-white/10 overflow-hidden shadow-xs hover:shadow-xl transition-all group flex flex-col justify-between">
                  <div>
                    <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-gray-900">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        type="button"
                        onClick={() => toggleWishlist(pId)}
                        className={`absolute top-3 end-3 p-2.5 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                          isWishlisted ? 'bg-rose-500 text-white' : 'bg-white/80 dark:bg-gray-800/80 text-slate-700 dark:text-white hover:bg-white'
                        }`}
                        title="Wishlist"
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="p-5 space-y-2">
                      <span className="text-[10px] font-bold text-[#E89A5B] uppercase tracking-wider">{product.category || 'Luxury'}</span>
                      <h3 className="font-bold text-xs line-clamp-1">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-[#0B132B] dark:text-white">${product.price}</span>
                        {product.discountPrice && (
                          <span className="font-mono text-xs text-slate-400 line-through">${product.discountPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      type="button"
                      onClick={() => addToCartGlobal(pId, 1)}
                      className="w-full py-2.5 rounded-xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-xs font-bold uppercase tracking-wider transition hover:opacity-90 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{t('store.home.add_to_cart')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}