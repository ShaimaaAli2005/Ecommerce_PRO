import React, { useState } from 'react';

export default function ImageGallery({ images = [], productName = 'Product' }) {
  const [activeImage, setActiveImage] = useState(images[0] || 'https://placehold.co/600');

  // إذا لم تكن هناك صور، نضع صورة افتراضية
  const imageList = images.length > 0 ? images : ['https://placehold.co/600'];

  return (
    <div className="space-y-4">
      {/* الصورة الكبرى النشطة */}
      <div className="aspect-square w-full rounded-3xl overflow-hidden bg-white dark:bg-gray-800 border border-black/5 dark:border-white/10 shadow-sm flex items-center justify-center">
        <img
          src={typeof activeImage === 'string' ? activeImage : (activeImage.url || 'https://placehold.co/600')}
          alt={productName}
          className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
        />
      </div>

      {/* صور المعرض المصغرة (Thumbnails) */}
      {imageList.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {imageList.map((img, idx) => {
            const imgUrl = typeof img === 'string' ? img : img.url;
            const isActive = activeImage === img || activeImage?.url === imgUrl;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(img)}
                className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer bg-white dark:bg-gray-800 ${
                  isActive ? 'border-[#E89A5B] scale-95 shadow-md' : 'border-black/10 dark:border-white/10 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt={`${productName} ${idx}`} className="w-full h-full object-cover" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}