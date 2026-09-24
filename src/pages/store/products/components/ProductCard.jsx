import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Heart, Share2, Flame } from 'lucide-react';
import { useCart } from '../../../../context/CartContext';
import { useWishlist } from '../../../../context/WishlistContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product, onWishlistToggle }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const isRtl = currentLang === 'ar';
  const navigate = useNavigate();

  const { addToCartGlobal } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isActionLoading, setIsActionLoading] = useState(false);

  const productId = product?._id || product?.id;
  const isSaved = productId && typeof isInWishlist === 'function' ? isInWishlist(productId) : false;

  const imageUrl = 
    product?.images?.[0]?.url || 
    (typeof product?.images?.[0] === 'string' ? product.images[0] : null) || 
    product?.image || 
    product?.imageUrl || 
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

  const categoryName = typeof product?.category === 'object' 
    ? product?.category?.name || product?.category?.slug || 'Luxury'
    : product?.category || 'Luxury';

  const price = Number(product?.price) || 0;
  const discountPrice = Number(product?.discountPrice) || 0;
  const hasDiscount = discountPrice > 0 && discountPrice < price;

  // فحص المخزون الفعلي
  const stock = product?.stock !== undefined && product?.stock !== null ? Number(product.stock) : 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!productId) return;

    const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
    if (!token) {
      toast.error(t('store.auth.unauthorized', 'Please sign in first'));
      navigate('/login');
      return;
    }

    setIsActionLoading(true);
    try {
      if (typeof toggleWishlist === 'function') {
        await toggleWishlist(productId);
      }
      if (onWishlistToggle) {
        onWishlistToggle(productId, !isSaved);
      }
    } catch (err) {
      toast.error(t('common.error', 'An error occurred, please try again'));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const productUrl = `${window.location.origin}/products/${productId}`;
    navigator.clipboard.writeText(productUrl);
    toast.success(t('store.product.link_copied', 'Product link copied to clipboard!'));
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!productId || isOutOfStock) return;

    const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
    if (!token) {
      toast.error(t('store.auth.unauthorized', 'Please sign in first'));
      navigate('/login');
      return;
    }

    await addToCartGlobal(productId, 1);
  };

  return (
    <Link
      to={`/products/${productId}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      className="group bg-white dark:bg-[#111A35] rounded-3xl border border-[#E5E7EB] dark:border-white/10 overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-500 flex flex-col justify-between font-['Poppins']"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-white/5">
        <img
          src={imageUrl}
          alt={product?.name || 'Product'}
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/600x450';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />

        {/* أزرار التحكم العلوية (مفضلة + مشاركة) */}
        <div className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} flex flex-col gap-2 z-10`}>
          <button
            type="button"
            onClick={handleWishlistToggle}
            disabled={isActionLoading}
            aria-label="Wishlist toggle"
            className="w-9 h-9 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md hover:scale-110"
          >
            <Heart className={`w-4 h-4 transition-colors ${isSaved ? 'text-rose-500 fill-rose-500 scale-110' : 'text-gray-600 dark:text-white hover:text-rose-500'}`} />
          </button>
          
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share product"
            className="w-9 h-9 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md hover:scale-110 text-gray-600 dark:text-white hover:text-[#E89A5B]"
            title={t('store.product.share', 'Share')}
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* مؤشر نفاد المخزون أو الندرة الفورية */}
        {isOutOfStock ? (
          <div className="absolute inset-x-0 bottom-0 bg-rose-600/90 text-white backdrop-blur-md text-[10px] font-black py-1.5 text-center uppercase tracking-wider">
            {t('store.catalog.out_of_stock', 'Out of Stock')}
          </div>
        ) : isLowStock ? (
          <div className="absolute top-3 start-3 bg-amber-500/90 text-white backdrop-blur-md text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow flex items-center gap-1 animate-pulse">
            <Flame className="w-3 h-3 fill-current" />
            <span>{isRtl ? `متبقي ${stock} قطع فقط` : `Only ${stock} left`}</span>
          </div>
        ) : null}

        {/* شارة التخفيض */}
        {hasDiscount && !isOutOfStock && !isLowStock && (
          <span className="absolute bottom-3 start-3 bg-[#E89A5B] text-[#0B132B] text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow">
            {t('store.catalog.sale_badge', 'Sale')}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#E89A5B] block">
            {t(`store.categories.${String(categoryName).toLowerCase().replace(/[\s-_]+/g, '')}`, categoryName)}
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
              ${(hasDiscount ? discountPrice : price).toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 dark:text-slate-500 line-through font-mono">
                ${price.toFixed(2)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-2.5 rounded-xl transition shadow-sm flex items-center justify-center ${
              isOutOfStock
                ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                : 'bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] hover:opacity-90 cursor-pointer'
            }`}
            title={isOutOfStock ? t('store.catalog.out_of_stock', 'Out of Stock') : t('store.catalog.add_to_cart', 'Add to Cart')}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}