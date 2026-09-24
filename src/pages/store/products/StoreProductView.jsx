import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, ShoppingBag, Star, ArrowLeft, ArrowRight, ShieldCheck, Truck, RotateCcw, Share2, Flame } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';
import { useWishlist } from '../../../context/WishlistContext';
import { useCart } from '../../../context/CartContext';
import productService from '../../../services/productService';
import toast from 'react-hot-toast';
import ProductReviews from '../products/components/ProductReviews';

// دالة مساعدة لتنظيف واستخراج مسارات الصور بأمان تام
const resolveImageSource = (img) => {
  if (!img) return 'https://placehold.co/600';
  if (typeof img === 'string') return img;
  return img.url || 'https://placehold.co/600';
};

export const StoreProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const { formatPrice } = useSettings();
  
  const wishlistContext = useWishlist();
  const isInWishlist = wishlistContext?.isInWishlist;
  const toggleWishlist = wishlistContext?.toggleWishlistGlobal || wishlistContext?.toggleWishlist;
  
  const { addToCartGlobal } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  const fetchProductDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await productService.getProductById(id);
      const item = res?.product || res?.data?.product || res?.data || res;
      if (item && (item._id || item.id)) {
        setProduct(item);
        
        let initialImg = 'https://placehold.co/600';
        if (Array.isArray(item.images) && item.images.length > 0) {
          initialImg = resolveImageSource(item.images[0]);
        } else if (item.image || item.imageUrl) {
          initialImg = resolveImageSource(item.image || item.imageUrl);
        }
        setSelectedImage(initialImg);
      } else {
        throw new Error('Product not found');
      }
    } catch (err) {
      toast.error(t('store.product_view.fetch_error', 'Failed to load product details'));
      navigate('/products');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, t]);

  useEffect(() => {
    if (id) {
      fetchProductDetails();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [id, fetchProductDetails]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0B132B] dark:border-[#E89A5B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) return null;

  const prodId = product._id || product.id;
  const isWish = typeof isInWishlist === 'function' ? isInWishlist(prodId) : false;
  const title = product.title || product.name || 'Product';
  const desc = product.description || '';
  const price = Number(product.price) || 0;
  const discountPrice = Number(product.discountPrice) || 0;
  const hasDiscount = discountPrice > 0 && discountPrice < price;
  const finalPrice = hasDiscount ? discountPrice : price;
  const rating = Number(product.averageRating || product.rating || 4.8);
  const numReviews = Number(product.numReviews || (product.reviews ? product.reviews.length : 0));
  
  const stock = product.stock !== undefined && product.stock !== null ? Number(product.stock) : 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  const imagesList = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map(resolveImageSource)
    : [selectedImage || 'https://placehold.co/600'];

  const categoryLabel = typeof product.category === 'object'
    ? product.category?.name || product.category?.slug || 'General'
    : product.category || t('store.product_view.exclusive_tag', 'LUMA Exclusive');

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(t('store.product.link_copied', 'Product link copied to clipboard!'));
  };

  const handleWishlistToggle = async () => {
    const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
    if (!token) {
      toast.error(t('store.auth.unauthorized', 'Please sign in first'));
      navigate("/login");
      return;
    }
    if (typeof toggleWishlist === 'function') {
      await toggleWishlist(prodId);
    }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
    if (!token) {
      toast.error(t('store.auth.unauthorized', 'Please sign in first'));
      navigate("/login");
      return;
    }
    if (isOutOfStock) {
      toast.error(t('store.catalog.out_of_stock_error', 'Product is out of stock'));
      return;
    }
    await addToCartGlobal(prodId, quantity);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 font-['Inter']" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* زر العودة ومشاركة الرابط */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold transition cursor-pointer"
        >
          {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{t('store.product_view.back_to_catalog', 'Back to Catalog')}</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold transition cursor-pointer text-slate-700 dark:text-gray-200"
        >
          <Share2 className="w-4 h-4 text-[#E89A5B]" />
          <span>{t('store.product.share', 'Share Asset')}</span>
        </button>
      </div>

      {/* تفاصيل المنتج الرئيسية والصور */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        
        {/* صور المنتج */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-3xl overflow-hidden bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-lg relative">
            <img 
              src={selectedImage} 
              alt={title} 
              className="w-full h-full object-cover" 
              loading="eager"
              onError={(e) => { e.currentTarget.src = 'https://placehold.co/600'; }}
            />
            <button
              type="button"
              onClick={handleWishlistToggle}
              className={`absolute top-4 end-4 p-3 rounded-full transition shadow-xl cursor-pointer backdrop-blur-md ${isWish ? "bg-rose-500 text-white" : "bg-black/40 text-white hover:bg-black/60"}`}
              title={t('store.catalog.wishlist_btn', 'Wishlist')}
            >
              <Heart className={`w-5 h-5 ${isWish ? "fill-current" : ""}`} />
            </button>

            {isOutOfStock && (
              <div className="absolute inset-x-0 bottom-0 bg-rose-600/90 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider py-2 text-center">
                {t('store.catalog.out_of_stock', 'Out of Stock')}
              </div>
            )}
          </div>

          {imagesList.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${selectedImage === img ? 'border-[#E89A5B]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img 
                    src={img} 
                    alt="" 
                    className="w-full h-full object-cover" 
                    loading="lazy" 
                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/100'; }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* معلومات المنتج والتسعير والشراء */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-block px-3 py-1 rounded-full bg-[#E89A5B]/10 text-[#E89A5B] text-[11px] font-black uppercase tracking-wider">
                {categoryLabel}
              </span>

              {isLowStock && !isOutOfStock && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-black uppercase tracking-wider animate-pulse">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{isRtl ? `متبقي ${stock} قطع فقط في المخزون!` : `Only ${stock} items left in stock!`}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black uppercase font-['Poppins']">{title}</h1>
            
            <div className="flex items-center gap-2 text-[#E89A5B] pt-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-current' : 'text-gray-300 dark:text-gray-700'}`} />
                ))}
              </div>
              <span className="text-xs font-bold text-secondary-muted font-mono">
                ({rating.toFixed(1)}) {numReviews > 0 && `• ${numReviews} ${t('store.product.reviews', 'reviews')}`}
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-4 py-4 border-y border-black/5 dark:border-white/10">
            <span className="text-3xl font-black text-[#E89A5B] font-mono">${formatPrice(finalPrice)}</span>
            {hasDiscount && (
              <span className="text-base text-secondary-muted line-through font-mono">${formatPrice(price)}</span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-secondary-muted leading-relaxed font-light">
            {desc || t('store.product_view.default_desc', 'Luxury product crafted with premium quality standards.')}
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-black/10 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-[#0B132B]">
                <button 
                  type="button" 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={isOutOfStock}
                  className="px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition font-bold cursor-pointer disabled:opacity-30"
                >
                  -
                </button>
                <span className="px-4 text-xs font-black font-mono">{quantity}</span>
                <button 
                  type="button" 
                  onClick={() => setQuantity(q => (stock > 0 ? Math.min(stock, q + 1) : q + 1))}
                  disabled={isOutOfStock || quantity >= stock}
                  className="px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition font-bold cursor-pointer disabled:opacity-30"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3.5 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xl ${
                  isOutOfStock
                    ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed opacity-60'
                    : 'bg-[#0B132B] dark:bg-white text-white dark:text-[#0B132B] hover:brightness-125 cursor-pointer'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-[#E89A5B]" />
                <span>{isOutOfStock ? t('store.catalog.out_of_stock', 'Out of Stock') : t('store.product_view.add_to_bag', 'Add to Bag')}</span>
              </button>
            </div>
          </div>

          {/* مميزات إضافية */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-black/5 dark:border-white/10 text-center">
            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1">
              <Truck className="w-5 h-5 mx-auto text-[#E89A5B]" />
              <span className="text-[10px] font-bold block">{t('store.product_view.fast_shipping', 'Fast Shipping')}</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1">
              <ShieldCheck className="w-5 h-5 mx-auto text-[#E89A5B]" />
              <span className="text-[10px] font-bold block">{t('store.product_view.authentic', 'Authentic')}</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1">
              <RotateCcw className="w-5 h-5 mx-auto text-[#E89A5B]" />
              <span className="text-[10px] font-bold block">{t('store.product_view.easy_return', 'Easy Return')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* قسم التقييمات والمراجعات المرتبط بالـ API */}
      <ProductReviews
        productId={prodId}
        reviews={product.reviews || []}
        averageRating={product.averageRating || product.rating || 0}
        onReviewAdded={() => fetchProductDetails()}
        onReviewDeleted={() => fetchProductDetails()}
      />

    </div>
  );
};

export default StoreProductView;