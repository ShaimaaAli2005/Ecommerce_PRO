import React from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, RotateCcw, Star, Percent } from 'lucide-react';

export default function CatalogFilters({ 
  categories = [], 
  selectedCategory = 'all', 
  setSelectedCategory = () => {}, 
  maxPrice = 5000, 
  setMaxPrice = () => {}, 
  minRating = 0,
  setMinRating = () => {},
  inStockOnly = false, 
  setInStockOnly = () => {}, 
  onSaleOnly = false,
  setOnSaleOnly = () => {},
  onReset = () => {}, 
  isRtl = false 
}) {
  const { t } = useTranslation();

  const formatCategoryLabel = (rawCategory) => {
    if (!rawCategory || rawCategory === 'all') return t('store.catalog.all', 'All Categories');
    const catName = typeof rawCategory === 'object' ? (rawCategory.name || rawCategory.slug || 'general') : rawCategory;
    const cleanKey = String(catName).toLowerCase().trim().replace(/[\s-_]+/g, '');
    const translationKey = `store.categories.${cleanKey}`;
    const translated = t(translationKey);
    return translated && translated !== translationKey ? translated : catName;
  };

  return (
    <div className="bg-white dark:bg-[#121c38] rounded-3xl border border-black/5 dark:border-white/10 p-6 space-y-6 shadow-xs sticky top-28 font-['Poppins']" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* الترويسة وزر إعادة التعيين */}
      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#E89A5B]" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
            {t('store.catalog.filters_title', 'Filter Options')}
          </h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] text-slate-400 hover:text-[#E89A5B] flex items-center gap-1 transition cursor-pointer"
          title={t('store.catalog.clear_filters', 'Clear Filters')}
        >
          <RotateCcw className="w-3 h-3" />
          <span>{t('store.catalog.clear_filters', 'Reset')}</span>
        </button>
      </div>

      {/* الفلترة بحسب الفئات (Categories) */}
      <div className="space-y-3">
        <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300">
          {t('store.catalog.categories', 'Categories')}
        </label>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`w-full text-start px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] shadow-xs'
                : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-gray-400'
            }`}
          >
            {t('store.catalog.all', 'All Categories')}
          </button>
          
          {categories.map((cat) => {
            const catName = typeof cat === 'object' ? (cat.name || cat.slug || '') : String(cat);
            const isSelected = String(selectedCategory).toLowerCase() === catName.toLowerCase();
            return (
              <button
                key={catName}
                type="button"
                onClick={() => setSelectedCategory(catName)}
                className={`w-full text-start px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer truncate ${
                  isSelected
                    ? 'bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] shadow-xs'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-gray-400'
                }`}
              >
                {formatCategoryLabel(catName)}
              </button>
            );
          })}
        </div>
      </div>

      {/* الفلترة بحسب السعر (Price Range) */}
      <div className="space-y-3 pt-4 border-t border-black/5 dark:border-white/10">
        <div className="flex justify-between items-center text-xs">
          <label className="font-black uppercase tracking-wider text-slate-700 dark:text-gray-300">
            {t('store.catalog.max_price', 'Max Price')}
          </label>
          <span className="font-mono font-bold text-[#E89A5B]">${maxPrice}</span>
        </div>
        <input
          type="range"
          min="50"
          max="5000"
          step="50"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#E89A5B] cursor-pointer"
        />
      </div>

      {/* الفلترة بحسب الحد الأدنى للتقييم (Min Rating) */}
      <div className="space-y-3 pt-4 border-t border-black/5 dark:border-white/10">
        <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300">
          {t('store.catalog.min_rating', 'Min Rating')}
        </label>
        <div className="flex items-center gap-1.5 flex-wrap">
          {[0, 3, 4, 4.5].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => setMinRating(rate)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                minRating === rate
                  ? 'bg-[#E89A5B] text-[#0B132B] shadow-xs'
                  : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-black/10'
              }`}
            >
              {rate === 0 ? t('store.catalog.all', 'All') : (
                <>
                  <span>{rate}+</span>
                  <Star className="w-3 h-3 fill-current" />
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* خيارات التوفر والتخفيضات (Toggles) */}
      <div className="space-y-3 pt-4 border-t border-black/5 dark:border-white/10">
        <label className="flex items-center gap-3 text-xs font-bold cursor-pointer text-slate-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 accent-[#E89A5B] rounded cursor-pointer"
          />
          <span>{t('store.catalog.in_stock_only', 'In Stock Only')}</span>
        </label>

        <label className="flex items-center gap-3 text-xs font-bold cursor-pointer text-slate-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={onSaleOnly}
            onChange={(e) => setOnSaleOnly(e.target.checked)}
            className="w-4 h-4 accent-[#E89A5B] rounded cursor-pointer"
          />
          <span className="flex items-center gap-1">
            <Percent className="w-3 h-3 text-[#E89A5B]" />
            <span>{t('store.catalog.on_sale_only', 'On Sale & Discounts')}</span>
          </span>
        </label>
      </div>

    </div>
  );
}