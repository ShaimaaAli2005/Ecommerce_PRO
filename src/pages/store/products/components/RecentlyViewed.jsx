import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

// دالة مساعدة لاستخراج رابط الصورة بأمان
const resolveImage = (prod) => {
  if (!prod) return 'https://placehold.co/150x150?text=Product';
  if (Array.isArray(prod.images) && prod.images.length > 0) {
    const first = prod.images[0];
    return typeof first === 'string' ? first : first?.url || 'https://placehold.co/150x150?text=Product';
  }
  return prod.image || prod.imageUrl || 'https://placehold.co/150x150?text=Product';
};

export default function RecentlyViewed({ items = [], onAddToCart }) {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const navigate = useNavigate();

  if (!Array.isArray(items) || items.length === 0) return null;

  const handleAddToCartClick = (e, prod) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
    if (!token) {
      toast.error(t('store.auth.unauthorized', 'Please sign in first'));
      navigate('/login');
      return;
    }

    const stock = prod.stock !== undefined && prod.stock !== null ? Number(prod.stock) : 0;
    if (stock <= 0) {
      toast.error(t('store.catalog.out_of_stock_error', 'Product is out of stock'));
      return;
    }

    onAddToCart?.(prod, 1);
  };

  return (
    <section className="pt-10 border-t border-black/5 dark:border-white/10 font-['Poppins']" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#E89A5B]" />
            <span>{t('store.recently_viewed.title', 'Recently Viewed')}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 font-light mt-0.5">
            {t('store.recently_viewed.subtitle', 'Products you checked out during this visit')}
          </p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-thin">
        {items.map((prod) => {
          const pId = prod._id || prod.id;
          const img = resolveImage(prod);

          const price = Number(prod.price || 0);
          const discountPrice = Number(prod.discountPrice || 0);
          const hasDiscount = discountPrice > 0 && discountPrice < price;
          const finalPrice = hasDiscount ? discountPrice : price;

          const stock = prod.stock !== undefined && prod.stock !== null ? Number(prod.stock) : 0;
          const isOutOfStock = stock <= 0;

          return (
            <div
              key={pId}
              className="w-48 sm:w-52 shrink-0 bg-white dark:bg-[#121c38] rounded-3xl border border-black/5 dark:border-white/10 p-3.5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <Link to={`/products/${pId}`} className="block group">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-gray-900 mb-3 border border-black/5 dark:border-white/10">
                  <img 
                    src={img} 
                    alt={prod.name || 'Product'} 
                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/150x150?text=Product'; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    loading="lazy"
                  />
                  {isOutOfStock && (
                    <div className="absolute inset-x-0 bottom-0 bg-rose-600/90 text-white text-[9px] font-black uppercase tracking-wider py-1 text-center">
                      {t('store.catalog.out_of_stock', 'Out of Stock')}
                    </div>
                  )}
                </div>

                <h4 className="text-xs font-bold text-slate-800 dark:text-gray-200 line-clamp-1 group-hover:text-[#E89A5B] transition">
                  {prod.name || prod.title || 'Product'}
                </h4>

                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                    ${finalPrice.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <span className="text-[10px] text-slate-400 line-through font-mono">
                      ${price.toFixed(2)}
                    </span>
                  )}
                </div>
              </Link>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={(e) => handleAddToCartClick(e, prod)}
                className={`mt-3.5 w-full py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-sm ${
                  isOutOfStock
                    ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    : 'bg-[#0B132B] dark:bg-[#E89A5B] hover:opacity-90 text-white dark:text-[#0B132B] cursor-pointer'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{isOutOfStock ? t('store.catalog.unavailable', 'Unavailable') : t('store.catalog.add_to_cart', 'Add to Cart')}</span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}