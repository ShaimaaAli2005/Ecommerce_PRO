import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import ProductFilters from '../components/CatalogFilters';

export default function MobileFiltersDrawer({ 
  isOpen, 
  onClose, 
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
  totalProducts 
}) {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');

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
    <div 
      className="fixed inset-0 z-50 overflow-hidden lg:hidden font-['Poppins']" 
      role="dialog" 
      aria-modal="true" 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* خلفية معتمة بتأثير الضبابية */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className={`fixed inset-y-0 ${isRtl ? 'start-0' : 'end-0'} max-w-full flex`}>
        <div className="w-screen max-w-xs bg-white dark:bg-[#121c38] shadow-2xl flex flex-col justify-between border-x border-black/5 dark:border-white/10">
          
          {/* ترويسة اللوحة الجانبية */}
          <div className="px-5 py-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
            <h2 className="text-base font-black uppercase tracking-wider text-slate-900 dark:text-white">
              {t('store.catalog.filters_title', 'Filter Options')}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 dark:text-gray-400 hover:text-slate-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* محتوى الفلاتر */}
          <div className="px-4 py-5 overflow-y-auto flex-1">
            <ProductFilters
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              minRating={minRating}
              setMinRating={setMinRating}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              onSaleOnly={onSaleOnly}
              setOnSaleOnly={setOnSaleOnly}
              onReset={onReset}
              isRtl={isRtl}
            />
          </div>

          {/* زر عرض النتائج في الأسفل */}
          <div className="p-4 border-t border-black/5 dark:border-white/10 bg-slate-50 dark:bg-gray-900/50">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 bg-[#0B132B] dark:bg-[#E89A5B] hover:opacity-90 text-white dark:text-[#0B132B] font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition cursor-pointer"
            >
              {t('store.catalog.view_results', 'View Results')} {totalProducts !== undefined ? `(${totalProducts})` : ''}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}