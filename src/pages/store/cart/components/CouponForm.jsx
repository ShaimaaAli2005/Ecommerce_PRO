import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, X } from 'lucide-react';
import { useCart } from '../../../../context/CartContext';

export default function CouponForm() {
  const { t } = useTranslation();
  const { cart, applyCouponGlobal, removeCouponGlobal } = useCart();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    await applyCouponGlobal(code.trim());
    setCode('');
    setLoading(false);
  };

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 space-y-3 shadow-xs">
      
      {/* عنوان الترويسة والتلميح */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-gray-300">
        <Tag className="w-4 h-4 text-[#E89A5B]" />
        <span>{t('store.coupon_form.label', 'Discount Coupon (Demo: SAVE10, SAVE20, SAVE50, SAVE80, OFF50)')}</span>
      </div>

      {/* عرض الكوبون المفعل أو نموذج الإدخال */}
      {cart.coupon ? (
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
          <span>{t('store.coupon_form.active_label', 'Active Coupon:')} {cart.coupon}</span>
          <button 
            type="button" 
            onClick={removeCouponGlobal}
            className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg transition cursor-pointer"
            title="إزالة الكوبون"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleApply} className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t('store.coupon_form.placeholder', 'Enter coupon code...')}
            className="flex-1 px-3 py-2.5 text-xs bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl outline-none text-slate-900 dark:text-white transition-colors focus:border-[#E89A5B]"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-[#17233C] dark:bg-[#E89A5B] text-white text-xs font-bold rounded-xl hover:opacity-90 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? t('store.coupon_form.loading_btn', 'Applying...') : t('store.coupon_form.apply_btn', 'Apply')}
          </button>
        </form>
      )}

    </div>
  );
}