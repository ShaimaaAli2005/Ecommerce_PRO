import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, ArrowLeftRight, ShoppingBag, CheckCircle, Award } from 'lucide-react';

// دالة مساعدة لاستخراج رابط الصورة بأمان
const resolveCompareImage = (prod) => {
  if (!prod) return 'https://placehold.co/100x100?text=P';
  if (Array.isArray(prod.images) && prod.images.length > 0) {
    const first = prod.images[0];
    return typeof first === 'string' ? first : first?.url || 'https://placehold.co/100x100?text=P';
  }
  return prod.image || prod.imageUrl || 'https://placehold.co/100x100?text=P';
};

// حساب السعر النهائي الفعلي
const getEffectivePrice = (item) => {
  const price = Number(item.price || 0);
  const discountPrice = Number(item.discountPrice || 0);
  return discountPrice > 0 && discountPrice < price ? discountPrice : price;
};

export default function ProductComparison({
  compareList = [],
  onRemove = () => {},
  onClear = () => {},
  isOpenModal = false,
  setIsOpenModal = () => {},
  onAddToCart = () => {},
}) {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');

  if (!Array.isArray(compareList) || compareList.length === 0) return null;

  // استخراج الأفضل ذكياً لمقارنة المصفوفة
  const effectivePrices = compareList.map(getEffectivePrice);
  const minPrice = effectivePrices.length > 0 ? Math.min(...effectivePrices) : 0;

  const ratings = compareList.map(item => Number(item.averageRating || item.rating || 4.8));
  const maxRating = ratings.length > 0 ? Math.max(...ratings) : 5;

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="font-['Poppins']">
      
      {/* شريط المعاينة العائم السفلي */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#17233C] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-700 animate-slide-up max-w-[95vw] sm:max-w-max overflow-x-auto">
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E89A5B] text-xs font-black text-[#0B132B]">
            {compareList.length}
          </span>
          <span className="text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap">
            <ArrowLeftRight className="w-4 h-4 text-[#E89A5B]" />
            <span>{t('store.comparison.title', 'Compare Products')}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {compareList.map((prod) => {
            const prodId = prod._id || prod.id;
            return (
              <div key={prodId} className="relative group shrink-0">
                <img
                  src={resolveCompareImage(prod)}
                  alt=""
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100?text=P'; }}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-600 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => onRemove(prodId)}
                  className="absolute -top-1.5 -end-1.5 h-4 w-4 rounded-full bg-rose-500 text-[10px] text-white flex items-center justify-center hover:scale-110 transition cursor-pointer shadow"
                  title={t('common.remove', 'Remove')}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        <div className={`flex items-center gap-3 shrink-0 ${isRtl ? 'border-r' : 'border-l'} border-slate-700 ${isRtl ? 'pr-3' : 'pl-3'}`}>
          <button
            type="button"
            disabled={compareList.length < 2}
            onClick={() => setIsOpenModal(true)}
            className="px-4 py-2 bg-[#E89A5B] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-black text-[#0B132B] transition cursor-pointer shadow whitespace-nowrap"
          >
            {t('store.comparison.compare_now', 'Compare Now')}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-bold text-slate-400 hover:text-rose-400 transition cursor-pointer whitespace-nowrap"
          >
            {t('common.clear', 'Clear')}
          </button>
        </div>
      </div>

      {/* نافذة المقارنة الذكية المنبثقة (Smart Matrix Modal) */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpenModal(false)}
          />

          <div className="relative w-full max-w-5xl bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-gray-700 z-10 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-[#E89A5B]" />
                <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  {t('store.comparison.modal_title', 'Smart Product Comparison Matrix')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpenModal(false)}
                className="h-9 w-9 rounded-full bg-slate-100 dark:bg-gray-700 text-slate-500 hover:text-black dark:hover:text-white flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {compareList.map((item) => {
                const prodId = item._id || item.id;
                const effectivePrice = getEffectivePrice(item);
                const originalPrice = Number(item.price || 0);
                const hasDiscount = effectivePrice < originalPrice;
                const itemRating = Number(item.averageRating || item.rating || 4.8);
                const isBestPrice = effectivePrice === minPrice;
                const isBestRating = itemRating === maxRating;

                const stock = item.stock !== undefined && item.stock !== null ? Number(item.stock) : 0;
                const isOutOfStock = stock <= 0;

                const categoryText = typeof item.category === 'object'
                  ? item.category?.name || item.category?.slug || 'General'
                  : item.category || 'General';

                return (
                  <div
                    key={prodId}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-4 relative ${
                      isBestPrice 
                        ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/10' 
                        : 'border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900'
                    }`}
                  >
                    {/* شارة الأفضل سعراً أو تقييماً */}
                    {isBestPrice && (
                      <span className="absolute top-2 start-2 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow flex items-center gap-1 z-10">
                        <CheckCircle className="w-3 h-3" />
                        <span>{isRtl ? 'الأفضل سعراً' : 'Best Price'}</span>
                      </span>
                    )}

                    <div className="space-y-3">
                      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5">
                        <img
                          src={resolveCompareImage(item)}
                          alt=""
                          onError={(e) => { e.currentTarget.src = 'https://placehold.co/300x300?text=Product'; }}
                          className="w-full h-full object-cover shadow-sm border border-black/5 dark:border-white/10"
                        />
                        {isOutOfStock && (
                          <div className="absolute inset-x-0 bottom-0 bg-rose-600/90 text-white text-[9px] font-black uppercase tracking-wider py-1 text-center">
                            {t('store.catalog.out_of_stock', 'Out of Stock')}
                          </div>
                        )}
                      </div>

                      <span className="text-[10px] font-black text-[#E89A5B] uppercase tracking-wider block truncate">
                        {categoryText}
                      </span>
                      
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white line-clamp-2">
                        {item.name || item.title || 'Product'}
                      </h4>
                      
                      {/* السعر النهائي ومؤشر الخصم */}
                      <div className="flex items-baseline gap-2">
                        <p className={`text-sm font-black font-mono ${isBestPrice ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                          ${effectivePrice.toFixed(2)}
                        </p>
                        {hasDiscount && (
                          <span className="text-xs text-slate-400 line-through font-mono">
                            ${originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-gray-400 space-y-1.5 pt-2 border-t border-slate-200 dark:border-gray-800">
                        <div className="flex justify-between">
                          <span>{t('store.comparison.brand', 'Brand')}:</span>
                          <span className="font-bold text-slate-700 dark:text-gray-300">{item.brand || 'Generic'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('store.comparison.rating', 'Rating')}:</span>
                          <span className={`font-bold font-mono ${isBestRating ? 'text-amber-500' : 'text-slate-700 dark:text-gray-300'}`}>
                            ⭐ {itemRating.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('store.comparison.stock', 'Stock Status')}:</span>
                          <span className={`font-bold ${isOutOfStock ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {isOutOfStock ? t('store.catalog.out_of_stock', 'Out of Stock') : `${stock} in stock`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => onAddToCart?.(item, 1)}
                      className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm ${
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
          </div>
        </div>
      )}

    </div>
  );
}