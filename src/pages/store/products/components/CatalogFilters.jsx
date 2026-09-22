import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ProductFilters from '../../../../Components/shop/ProductFilters';

export default function MobileFiltersDrawer({ isOpen, onClose, filters, onFilterChange, onReset, totalProducts }) {
  const { t, i18n } = useTranslation('shop');
  const isRtl = i18n.language === 'ar';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" role="dialog" aria-modal="true" dir={isRtl ? 'rtl' : 'ltr'}>
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className={`fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} max-w-full flex`}>
        <div className="w-screen max-w-xs bg-white shadow-2xl flex flex-col justify-between">
          
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              {t('filterProducts', 'Filter Products')}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-5 py-6 overflow-y-auto flex-1">
            <ProductFilters
              filters={filters}
              onFilterChange={onFilterChange}
              onReset={onReset}
            />
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow transition"
            >
              {t('viewResults', 'Show Results')} {totalProducts !== undefined ? `(${totalProducts})` : ''}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}import React from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, X, RotateCcw } from 'lucide-react';

export default function CatalogFilters({ 
  categories = [], 
  selectedCategory, 
  setSelectedCategory, 
  maxPrice, 
  setMaxPrice, 
  inStockOnly, 
  setInStockOnly, 
  onReset, 
  isRtl 
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-black/5 dark:border-white/10 p-6 space-y-6 shadow-xs sticky top-28 font-['Poppins']">
      
      {/* الترويسة وزر إعادة التعيين */}
      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#E89A5B]" />
          <h3 className="text-xs font-black uppercase tracking-wider">
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
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
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
            const catName = typeof cat === 'string' ? cat : (cat.name || cat.slug);
            const isSelected = selectedCategory === catName;
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
                {t(`store.categories.${catName.toLowerCase()}`, catName)}
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

      {/* المنتجات المتوفرة فقط (In Stock Only) */}
      <div className="pt-4 border-t border-black/5 dark:border-white/10">
        <label className="flex items-center gap-3 text-xs font-bold cursor-pointer text-slate-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 accent-[#E89A5B] rounded-sm cursor-pointer"
          />
          <span>{t('store.catalog.in_stock_only', 'In Stock Only')}</span>
        </label>
      </div>

    </div>
  );
}