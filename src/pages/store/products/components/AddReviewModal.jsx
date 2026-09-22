import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Star, Send } from 'lucide-react';
import axiosInstance from '../../../../api/axiosInstance';
import toast from 'react-hot-toast';

export default function AddReviewModal({ productId, isOpen, onClose, onReviewAdded }) {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error(isRtl ? 'يرجى كتابة تعليق التقييم' : 'Please enter a review comment');
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post(`/products/${productId}/reviews`, {
        rating,
        comment
      });

      if (res && res.data) {
        toast.success(isRtl ? 'تم إضافة تقييمك بنجاح' : 'Review added successfully');
        if (onReviewAdded) onReviewAdded(res.data.review || res.data);
        onClose();
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || (isRtl ? 'تعذر إرسال التقييم' : 'Failed to submit review');
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl border border-black/5 dark:border-white/10 animate-fadeIn font-['Poppins']">
        
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
          <h3 className="text-base font-black uppercase tracking-wider text-[#0B132B] dark:text-white">
            {t('store.reviews.add_title', 'Add Your Review')}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          <div className="space-y-2">
            <label className="font-bold text-slate-700 dark:text-gray-300">
              {t('store.reviews.rating_label', 'Rating Score')}
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                >
                  <Star className={`w-7 h-7 ${star <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-gray-600'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-slate-700 dark:text-gray-300">
              {t('store.reviews.comment_label', 'Your Review / Feedback')}
            </label>
            <textarea
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('store.reviews.comment_placeholder', 'Share your experience with this product...')}
              required
              className="w-full p-4 rounded-xl bg-slate-50 dark:bg-gray-900 border border-black/10 dark:border-white/10 outline-none focus:border-[#E89A5B] text-slate-900 dark:text-white resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 font-bold hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] font-bold uppercase tracking-wider transition hover:opacity-90 flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? t('common.loading', 'Submitting...') : t('store.reviews.submit_btn', 'Submit Review')}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}