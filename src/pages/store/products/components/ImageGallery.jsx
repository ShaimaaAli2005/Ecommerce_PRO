import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// دالة مساعدة لاستخراج رابط الصورة بأمان
const resolveUrl = (img) => {
  if (!img) return 'https://placehold.co/600';
  if (typeof img === 'string') return img;
  return img.url || 'https://placehold.co/600';
};

export default function ImageGallery({ images = [], productName = 'Product' }) {
  const { i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');

  const validImages = Array.isArray(images) && images.length > 0 ? images : ['https://placehold.co/600'];
  const [activeImage, setActiveImage] = useState(() => validImages[0]);

  // تحديث الصورة المعروضة عند تغيير مصفوفة الصور من الخارج
  useEffect(() => {
    if (Array.isArray(images) && images.length > 0) {
      setActiveImage(images[0]);
    } else {
      setActiveImage('https://placehold.co/600');
    }
  }, [images]);

  const activeUrl = resolveUrl(activeImage);

  return (
    <div className="space-y-4 font-['Poppins']" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* الصورة الكبرى النشطة */}
      <div className="aspect-square w-full rounded-3xl overflow-hidden bg-white dark:bg-gray-800 border border-black/5 dark:border-white/10 shadow-sm flex items-center justify-center relative">
        <img
          src={activeUrl}
          alt={productName}
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/600';
          }}
          className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
          loading="eager"
        />
      </div>

      {/* صور المعرض المصغرة (Thumbnails) */}
      {validImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {validImages.map((img, idx) => {
            const currentUrl = resolveUrl(img);
            const isSelected = activeUrl === currentUrl;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(img)}
                className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer bg-white dark:bg-gray-800 ${
                  isSelected 
                    ? 'border-[#E89A5B] scale-95 shadow-md opacity-100' 
                    : 'border-black/10 dark:border-white/10 opacity-60 hover:opacity-100'
                }`}
              >
                <img 
                  src={currentUrl} 
                  alt={`${productName} thumbnail ${idx + 1}`} 
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/100';
                  }}
                  className="w-full h-full object-cover" 
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}