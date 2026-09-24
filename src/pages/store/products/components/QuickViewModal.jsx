import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, Star, Heart, ShoppingBag, Check, Flame } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QuickViewModal({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart, 
  onToggleWishlist, 
  isWishlisted 
}) {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const navigate = useNavigate();

  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // إغلاق النافذة بزر Escape وقفل تمرير الصفحة الخلفية
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // إعادة ضبط مؤشر الصورة والكمية عند فتح منتج جديد
  useEffect(() => {
    setSelectedImgIndex(0);
    setQuantity(1);
    setIsAdded(false);
  }, [product]);

  if (!isOpen || !product) return null;

  const prodId = product._id || product.id;

  // تجميع ومعالجة الصور
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map((img) => (typeof img === 'string' ? img : img?.url || 'https://placehold.co/600x600?text=No+Image'))
    : [product.image || product.imageUrl || 'https://placehold.co/600x600?text=No+Image'];

  const price = Number(product.price) || 0;
  const discountPrice = Number(product.discountPrice) || 0;
  const hasDiscount = discountPrice > 0 && discountPrice < price;
  const finalPrice = hasDiscount ? discountPrice : price;

  const rating = Number(product.averageRating || product.rating || 4.8);
  const numReviews = Number(product.numReviews || product.reviewsCount || (product.reviews ? product.reviews.length : 0));

  const stock = product.stock !== undefined && product.stock !== null ? Number(product.stock) : 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  const categoryName = typeof product.category === 'object'
    ? product.category?.name || product.category?.slug || 'Luxury'
    : product.category || 'Luxury';

  const handleAddToCart = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
    if (!token) {
      toast.error(t('store.auth.unauthorized', 'Please sign in first'));
      navigate('/login');
      return;
    }

    if (isOutOfStock) {
      toast.error(t('store.catalog.out_of_stock_error', 'Product is out of stock'));
      return;
    }

    onAddToCart?.(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-['Poppins']" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* الخلفية المظلمة */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* نافذة المودال */}
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 shadow-2xl z-10 transition-all">
        
        {/* زر الإغلاق */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} z-20 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-gray-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
          
          {/* معرض الصور المصغر */}
          <div className="space-y-4">
            <div className="aspect-square w-full overflow-hidden rounded-2xl bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 shadow-sm relative">
              <img
                src={images[selectedImgIndex]}
                alt={product.name || 'Product'}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://placehold.co/600x600?text=No+Image';
                }}
              />
              {isOutOfStock && (
                <div className="absolute inset-x-0 bottom-0 bg-rose-600/90 text-white text-xs font-black uppercase tracking-wider py-1.5 text-center backdrop-blur-xs">
                  {t('store.catalog.out_of_stock', 'Out of Stock')}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImgIndex(idx)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition cursor-pointer bg-white dark:bg-gray-800 ${
                      selectedImgIndex === idx
                        ? 'border-[#E89A5B] shadow-sm'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt="" 
                      onError={(e) => { e.currentTarget.src = 'https://placehold.co/100'; }}
                      className="h-full w-full object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* تفاصيل المنتج وخيارات الشراء */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#E89A5B]">
                  {t(`store.categories.${String(categoryName).toLowerCase().replace(/[\s-_]+/g, '')}`, categoryName)}
                </span>

                {isLowStock && !isOutOfStock && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider animate-pulse">
                    <Flame className="w-3 h-3 fill-current" />
                    <span>{isRtl ? `متبقي ${stock} قطع فقط` : `Only ${stock} left`}</span>
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {product.name || product.title}
              </h2>

              {/* التقييم */}
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
                <div className="flex text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                </div>
                <span className="font-bold text-slate-800 dark:text-gray-200 font-mono">
                  {rating.toFixed(1)}
                </span>
                <span>({numReviews} {t('store.reviews.count_label', 'reviews')})</span>
              </div>

              {/* السعر */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  ${finalPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-slate-400 line-through font-mono">
                    ${price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* الوصف */}
              <p className="mt-4 text-xs text-slate-600 dark:text-gray-300 leading-relaxed line-clamp-4 font-light">
                {product.description || product.shortDescription || t('store.product_view.default_desc', 'Experience the premium quality and exceptional design crafted for modern lifestyles.')}
              </p>
            </div>

            {/* أزرار التحكم والكمية */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  {t('store.product.quantity', 'Quantity')}:
                </span>
                <div className="flex items-center rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={isOutOfStock}
                    className="px-3 py-1.5 text-slate-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition cursor-pointer font-bold disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 text-xs font-black text-slate-900 dark:text-white font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => (stock > 0 ? Math.min(stock, q + 1) : q + 1))}
                    disabled={isOutOfStock || quantity >= stock}
                    className="px-3 py-1.5 text-slate-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition cursor-pointer font-bold disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleWishlist?.(product)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-gray-700 transition cursor-pointer shadow-xs ${
                    isWishlisted ? 'bg-rose-50 text-rose-500 border-rose-200' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-gray-700'
                  }`}
                  title={t('store.catalog.wishlist_btn', 'Wishlist')}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdded || isOutOfStock}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 px-5 text-xs font-black uppercase tracking-wider transition-all shadow-md ${
                    isOutOfStock
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed shadow-none'
                      : isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] hover:opacity-90 active:scale-95 cursor-pointer'
                  }`}
                >
                  {isAdded ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                  <span>
                    {isOutOfStock 
                      ? t('store.catalog.out_of_stock', 'Out of Stock') 
                      : isAdded 
                      ? t('store.product.added_success', 'Added to Cart ✓') 
                      : t('store.catalog.add_to_cart', 'Add to Cart')}
                  </span>
                </button>

                <Link
                  to={`/products/${prodId}`}
                  onClick={onClose}
                  className="flex items-center justify-center px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 transition cursor-pointer"
                >
                  {t('store.product.full_details', 'Full Details')}
                </Link>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}