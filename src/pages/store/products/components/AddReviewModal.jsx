import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Star, Send } from 'lucide-react';
import productService from '../../../../services/productService';
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

    const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
    if (!token) {
      toast.error(t('store.auth.unauthorized', 'Please sign in first to review products'));
      return;
    }

    if (!comment.trim()) {
      toast.error(t('store.reviews.error_empty_comment', 'Please enter a review comment'));
      return;
    }

    try {
      setLoading(true);
      const res = await productService.addProductReview(productId, {
        rating: Number(rating),
        comment: comment.trim()
      });

      if (res && (res.success || res.review)) {
        toast.success(t('store.reviews.success_added', 'Review added successfully'));
        if (typeof onReviewAdded === 'function') {
          onReviewAdded(res.review || res.data || res);
        }
        setComment('');
        setRating(5);
        onClose();
      }
    } catch (err) {
      const status = err?.response?.status;
      const apiMessage = err?.response?.data?.message;

      if (status === 400 && String(apiMessage).toLowerCase().includes('already reviewed')) {
        toast.error(t('store.reviews.already_reviewed', 'You have already reviewed this product.'));
      } else {
        toast.error(apiMessage || t('store.reviews.error_failed', 'Failed to submit review'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-white dark:bg-[#121c38] rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl border border-black/5 dark:border-white/10 font-['Poppins']">
        
        {/* الترويسة */}
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
          <h3 className="text-base font-black uppercase tracking-wider text-[#0B132B] dark:text-white">
            {t('store.reviews.add_title', 'Add Your Review')}
          </h3>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* نموذج كتابة المراجعة */}
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          {/* اختيار التقييم بالنجوم */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 dark:text-gray-300">
              {t('store.reviews.rating_label', 'Rating Score')}
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                >
                  <Star className={`w-7 h-7 transition-colors ${star <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-gray-600'}`} />
                </button>
              ))}
              <span className="font-mono font-bold text-sm text-[#E89A5B] ms-2">
                {rating} / 5
              </span>
            </div>
          </div>

          {/* نص التعليق */}
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
              className="w-full p-4 rounded-xl bg-slate-50 dark:bg-gray-900 border border-black/10 dark:border-white/10 outline-none focus:border-[#E89A5B] text-slate-900 dark:text-white resize-none transition"
            />
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 font-bold hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer text-slate-700 dark:text-gray-300"
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