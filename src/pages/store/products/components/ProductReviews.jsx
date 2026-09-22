import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, MessageSquarePlus, User } from 'lucide-react';
import AddReviewModal from './AddReviewModal';

export default function ProductReviews({ productId, reviews = [], averageRating = 0, onReviewAdded }) {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');

  const [isModalOpen, setIsModalOpen] = useState(false);

  const reviewList = reviews || [];

  return (
    <div className="space-y-6 pt-10 border-t border-black/5 dark:border-white/10 font-['Poppins']" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* رأس قسم التقييمات وزر الإضافة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black uppercase tracking-wider text-[#0B132B] dark:text-white">
            {t('store.reviews.section_title', 'Customer Reviews')}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= Math.round(averageRating) ? 'fill-current' : 'text-slate-300 dark:text-gray-600'}`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-gray-300 font-mono">
              {Number(averageRating || 0).toFixed(1)} ({reviewList.length} {t('common.items', 'reviews')})
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-xs font-bold uppercase tracking-wider transition hover:opacity-90 flex items-center justify-center gap-2 shadow-md cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>{t('store.reviews.add_btn', 'Write a Review')}</span>
        </button>
      </div>

      {/* قائمة التعليقات والتقييمات */}
      {reviewList.length === 0 ? (
        <div className="bg-white dark:bg-gray-800/50 rounded-3xl border border-black/5 dark:border-white/10 p-8 text-center text-xs text-slate-500 dark:text-gray-400">
          {t('store.reviews.no_reviews', 'No reviews yet. Be the first to share your experience!')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviewList.map((review, idx) => (
            <div key={review._id || idx} className="bg-white dark:bg-gray-800 rounded-2xl border border-black/5 dark:border-white/10 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#E89A5B]/10 text-[#E89A5B] flex items-center justify-center text-xs font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {review.user?.username || review.userName || 'Verified Buyer'}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(review.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${star <= (review.rating || 5) ? 'fill-current' : 'text-slate-300 dark:text-gray-600'}`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed font-light">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* نافذة إضافة التقييم */}
      <AddReviewModal
        productId={productId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReviewAdded={onReviewAdded}
      />

    </div>
  );
}