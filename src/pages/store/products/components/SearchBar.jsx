import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';

export default function SearchBar({ initialQuery = '', onSearch }) {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const navigate = useNavigate();

  const [query, setQuery] = useState(initialQuery);

  // مزامنة حالة البحث عند تغيير الـ Prop الخارجي
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();

    if (typeof onSearch === 'function') {
      onSearch(trimmed);
    } else {
      if (trimmed) {
        navigate(`/products?search=${encodeURIComponent(trimmed)}`);
      } else {
        navigate('/products');
      }
    }
  };

  const handleClear = () => {
    setQuery('');
    if (typeof onSearch === 'function') {
      onSearch('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="relative flex items-center w-full max-w-xl mx-auto font-['Poppins']"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* أيقونة البحث في بداية الحقل */}
      <Search className="w-4 h-4 text-slate-400 absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none" />

      {/* حقل الإدخال */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('store.search_placeholder', 'Search luxury items...')}
        className="w-full py-3.5 ps-11 pe-11 rounded-2xl bg-white dark:bg-[#121c38] border border-black/10 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-[#E89A5B] transition-all shadow-xs placeholder:text-slate-400 dark:placeholder:text-gray-500"
      />

      {/* زر مسح النص عند وجود كتابة */}
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute end-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
          title={t('common.clear', 'Clear')}
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* زر Submit مخفي برمجياً لتسهيل الإرسال عبر كيبورد الهواتف */}
      <button type="submit" className="sr-only" tabIndex={-1}>
        {t('common.search', 'Search')}
      </button>
    </form>
  );
}