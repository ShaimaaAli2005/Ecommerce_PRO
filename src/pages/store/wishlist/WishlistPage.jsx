import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, ShoppingBag, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useWishlist } from '../../../context/WishlistContext';
import { useCart } from '../../../context/CartContext';
import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');

  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addToCartGlobal } = useCart();

  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      try {
        setLoading(true);
        if (!wishlistIds || wishlistIds.length === 0) {
          setWishlistProducts([]);
          setLoading(false);
          return;
        }

        // جلب تفاصيل المنتجات الموجودة في قائمة المفضلة
        const res = await axiosInstance.get('/products');
        const allProducts = res.data?.products || res.data || [];
        const filtered = allProducts.filter((p) => wishlistIds.includes(p._id || p.id));
        setWishlistProducts(filtered);
      } catch (err) {
        console.error(err);
        toast.error(isRtl ? 'تعذر جلب منتجات المفضلة' : 'Failed to load wishlist items');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [wishlistIds, isRtl]);

  return (
    <div className="min-h-[80vh] bg-[#FDFBF7] dark:bg-[#0B132B] text-[#0B132B] dark:text-white py-16 px-4 sm:px-6 lg:px-8 font-['Poppins'] flex flex-col items-center" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* حاوية مركزية تضمن توسيط وتناسق المحتوى في وسط الشاشة */}
      <div className="w-full max-w-6xl space-y-10">
        
        {/* الترويسة */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold uppercase tracking-widest">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>{t('store.nav.wishlist', 'Wishlist')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
            {isRtl ? 'قائمة المنتجات المفضلة لديك' : 'Your Curated Wishlist'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
            {isRtl ? 'جميع القطع الفاخرة التي قمت بحفظها لاستعراضها لاحقاً أو نقلها مباشرة إلى السلة.' : 'All luxury assets you saved for later or quick acquisition.'}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-4 border-[#0B132B] dark:border-[#E89A5B] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : wishlistProducts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-black/5 dark:border-white/10 p-12 text-center max-w-lg mx-auto space-y-6 shadow-sm">
            <div className="w-20 h-20 mx-auto rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Heart className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-black uppercase tracking-wider">{isRtl ? 'قائمة المفضلة فارغة حالياً' : 'Your Wishlist is Empty'}</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                {isRtl ? 'استكشف الكتالوج الفاخر وأضف قطعك المفضلة بضغط زر القلب لتظهر هنا.' : 'Explore our luxury catalog and tap the heart icon on any asset to save it here.'}
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-xs font-bold uppercase tracking-wider transition hover:opacity-90 shadow-lg"
            >
              <span>{isRtl ? 'استعراض الكتالوج' : 'Explore Catalog'}</span>
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
            {wishlistProducts.map((product) => {
              const pId = product._id || product.id;
              const imageUrl = product.images?.[0]?.url || product.image || 'https://placehold.co/400';

              return (
                <div key={pId} className="bg-white dark:bg-gray-800 rounded-3xl border border-black/5 dark:border-white/10 overflow-hidden shadow-xs hover:shadow-xl transition-all group flex flex-col justify-between">
                  <div>
                    <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-gray-900">
                      <Link to={`/products/${pId}`}>
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleWishlist(pId)}
                        className="absolute top-3 end-3 p-2.5 rounded-full bg-rose-500 text-white shadow-md hover:scale-110 transition cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-5 space-y-2">
                      <span className="text-[10px] font-bold text-[#E89A5B] uppercase tracking-wider">{product.category || 'Luxury'}</span>
                      <Link to={`/products/${pId}`}>
                        <h3 className="font-bold text-xs line-clamp-1 hover:text-[#E89A5B] transition-colors">{product.name}</h3>
                      </Link>
                      <span className="font-mono text-sm font-black text-[#0B132B] dark:text-white">${product.price}</span>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      type="button"
                      onClick={() => addToCartGlobal(pId, 1)}
                      className="w-full py-2.5 rounded-xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-xs font-bold uppercase tracking-wider transition hover:opacity-90 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'نقل إلى السلة' : 'Move to Cart'}</span>
                    </button>
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