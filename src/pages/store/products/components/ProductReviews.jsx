import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, MessageSquarePlus, User, Trash2 } from 'lucide-react';
import AddReviewModal from '../components/AddReviewModal';
import productService from '../../../../services/productService';
import toast from 'react-hot-toast';

export default function ProductReviews({ 
  productId, 
  reviews = [], 
  averageRating = 0, 
  onReviewAdded,
  onReviewDeleted 
}) {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const reviewList = Array.isArray(reviews) ? reviews : [];
  const safeAvgRating = Number(averageRating || 0);

  // استخراج المستخدم المسجل الحالي من التخزين لمقارنة الصلاحيات
  let currentUserId = null;
  let currentUserRole = null;
  try {
    const rawUserData = localStorage.getItem('userData');
    if (rawUserData) {
      const parsed = JSON.parse(rawUserData);
      currentUserId = parsed?._id || parsed?.id;
      currentUserRole = parsed?.role;
    }
  } catch (e) {
    // تجاهل أخطاء JSON
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm(isRtl ? 'هل أنت متأكد من حذف هذا التقييم؟' : 'Are you sure you want to delete this review?')) {
      return;
    }

    try {
      setDeletingId(reviewId);
      const res = await productService.deleteProductReview(productId, reviewId);
      if (res && res.success) {
        toast.success(t('store.reviews.deleted_success', 'Review deleted successfully'));
        if (typeof onReviewDeleted === 'function') {
          onReviewDeleted(reviewId);
        }
      }
    } catch (err) {
      const msg = err?.response?.data?.message || t('common.error', 'Failed to delete review');
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

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
                  className={`w-4 h-4 ${star <= Math.round(safeAvgRating) ? 'fill-current' : 'text-slate-300 dark:text-gray-600'}`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-gray-300 font-mono">
              {safeAvgRating.toFixed(1)} ({reviewList.length} {t('store.reviews.count_label', 'reviews')})
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-xs font-black uppercase tracking-wider transition hover:opacity-90 flex items-center justify-center gap-2 shadow-md cursor-pointer"
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
          {reviewList.map((review, idx) => {
            const reviewId = review._id || review.id || idx;
            const authorName = review.username || review.user?.username || review.userName || t('store.reviews.verified_buyer', 'Verified Buyer');
            const reviewUserId = typeof review.user === 'object' ? review.user?._id : review.user;
            const isOwnerOrAdmin = (currentUserId && currentUserId === reviewUserId) || currentUserRole === 'admin';

            return (
              <div 
                key={reviewId} 
                className="bg-white dark:bg-gray-800 rounded-2xl border border-black/5 dark:border-white/10 p-5 space-y-3 shadow-xs relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#E89A5B]/10 text-[#E89A5B] flex items-center justify-center text-xs font-bold">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {authorName}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(review.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${star <= Number(review.rating || 5) ? 'fill-current' : 'text-slate-300 dark:text-gray-600'}`}
                        />
                      ))}
                    </div>

                    {/* زر حذف التقييم للصاحب أو المشرف */}
                    {isOwnerOrAdmin && (
                      <button
                        type="button"
                        disabled={deletingId === reviewId}
                        onClick={() => handleDeleteReview(reviewId)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer disabled:opacity-40"
                        title={t('common.delete', 'Delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed font-light">
                  {review.comment}
                </p>
              </div>
            );
          })}
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