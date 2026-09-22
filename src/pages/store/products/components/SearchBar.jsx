import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';

export default function SearchBar({ initialQuery = '', onSearch }) {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const navigate = useNavigate();

  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (onSearch) {
      onSearch(trimmed);
    } else if (trimmed) {
      navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="relative flex items-center w-full max-w-xl mx-auto font-['Poppins']"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('store.search_placeholder', 'Search luxury items...') || 'Search luxury items...'}
        className={`w-full py-3.5 ${isRtl ? 'pe-12 ps-12' : 'ps-12 pe-12'} rounded-2xl bg-white dark:bg-gray-800 border border-black/10 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-[#E89A5B] transition-all shadow-sm`}
      />
      
      {/* أيقونة البحث */}
      <Search className={`w-4 h-4 text-slate-400 absolute ${isRtl ? 'end-4' : 'start-4'} top-1/2 -translate-y-1/2 pointer-events-none`} />

      {/* زر مسح النص */}
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className={`absolute ${isRtl ? 'start-4' : 'end-4'} top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer`}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
}