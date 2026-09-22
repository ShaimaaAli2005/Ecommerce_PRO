import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Star, Heart } from 'lucide-react';
import { useCart } from '../../../../context/CartContext';
import wishlistService from '../../../../services/wishlistService';
import toast from 'react-hot-toast';

export default function ProductCard({ product, onWishlistToggle }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const isRtl = currentLang === 'ar';

  const { addToCartGlobal } = useCart();
  const [isSaved, setIsSaved] = useState(product?.isSaved || false);
  const [isLoading, setIsLoading] = useState(false);

  const productId = product?._id || product?.id;
  const imageUrl = product?.images?.[0]?.url || product?.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
  const categoryName = product?.category || 'Luxury';

  // معالجة الضغط على المفضلة (Wishlist) مع التعامل الآمن مع الأخطاء والمصادقة
  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productId) return;

    setIsLoading(true);
    try {
      if (isSaved) {
        const res = await wishlistService.removeFromWishlist(productId);
        if (res?.success) {
          setIsSaved(false);
          toast.success(isRtl ? 'تمت إزالة المنتج من المفضلة' : 'Removed from wishlist');
          if (onWishlistToggle) onWishlistToggle(productId, false);
        }
      } else {
        const res = await wishlistService.addToWishlist(productId);
        if (res?.success) {
          setIsSaved(true);
          toast.success(isRtl ? 'تمت إضافة المنتج إلى المفضلة' : 'Added to wishlist');
          if (onWishlistToggle) onWishlistToggle(productId, true);
        }
      }
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error(isRtl ? 'يرجى تسجيل الدخول أولاً' : 'Please sign in first');
      } else {
        toast.error(isRtl ? 'حدث خطأ ما، يرجى المحاولة مجدداً' : 'An error occurred, please try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // معالجة الإضافة السريعة للسلة
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (productId) {
      addToCartGlobal(productId, 1);
    }
  };

  return (
    <Link
      to={`/products/${productId}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      className="group bg-white dark:bg-[#111A35] rounded-3xl border border-[#E5E7EB] dark:border-white/10 overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-500 flex flex-col justify-between font-['Poppins']"
    >
      {/* صورة المنتج وشارات التخفيض والمفضلة */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-white/5">
        <img
          src={imageUrl}
          alt={product?.name || 'Product'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* زر المفضلة الديناميكي */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          disabled={isLoading}
          aria-label="Wishlist toggle"
          className={`absolute top-3 ${
            isRtl ? 'left-3' : 'right-3'
          } w-10 h-10 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md hover:scale-110`}
        >
          <Heart className={`w-4 h-4 transition-colors ${isSaved ? 'text-rose-500 fill-rose-500 scale-110' : 'text-gray-600 dark:text-white hover:text-rose-500'}`} />
        </button>

        {/* شارة التخفيض */}
        {product?.discountPrice && (
          <span className="absolute bottom-3 start-3 bg-[#E89A5B] text-[#0B132B] text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow">
            {isRtl ? 'تخفيض' : 'Sale'}
          </span>
        )}
      </div>

      {/* تفاصيل المنتج */}
      <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#E89A5B] block">
            {t(`store.categories.${categoryName.toLowerCase()}`, categoryName)}
          </span>
          <h3 className="text-sm font-bold text-[#17233C] dark:text-white line-clamp-1 group-hover:text-[#E89A5B] transition-colors">
            {product?.name || 'Luxury Item'}
          </h3>
          <p className="text-xs text-[#7B8190] dark:text-slate-400 line-clamp-1 font-light">
            {product?.shortDescription || product?.description || ''}
          </p>
        </div>

        <div className="pt-3 border-t border-[#E5E7EB] dark:border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-[#17233C] dark:text-white font-mono">
              ${product?.discountPrice || product?.price || '0.00'}
            </span>
            {product?.discountPrice && (
              <span className="text-xs text-gray-400 dark:text-slate-500 line-through font-mono">
                ${product?.price}
              </span>
            )}
          </div>

          {/* زر إضافة سريع للسلة */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="p-2.5 rounded-xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] hover:opacity-90 transition shadow-sm flex items-center justify-center cursor-pointer"
            title={t('store.catalog.add_to_cart', 'Add to Cart')}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}