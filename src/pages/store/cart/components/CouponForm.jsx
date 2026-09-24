import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, X, CheckCircle2, Loader2 } from 'lucide-react';
import { useCart } from '../../../../context/CartContext';
import { useSettings } from '../../../../context/SettingsContext';

export default function CouponForm() {
  const { t } = useTranslation();
  const { formatPrice } = useSettings();
  const { cart, applyCouponGlobal, removeCouponGlobal } = useCart();
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  // استخراج رمز الكوبون بأمان مهما كان نوعه القادم من السيرفر (String أو Object)
  const activeCouponCode = typeof cart?.coupon === 'object' 
    ? cart.coupon?.code 
    : cart?.coupon;

  const discountAmount = Number(cart?.discountAmount || 0);

  const handleApply = async (e) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    try {
      setLoading(true);
      await applyCouponGlobal(cleanCode);
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setLoading(true);
      await removeCouponGlobal();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 space-y-3 shadow-xs font-['Poppins']">
      
      {/* عنوان الترويسة والتلميح */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-gray-300">
        <Tag className="w-4 h-4 text-[#E89A5B]" />
        <span>{t('store.coupon_form.label', 'Discount Coupon')}</span>
      </div>

      {/* عرض الكوبون المفعل أو نموذج الإدخال */}
      {activeCouponCode ? (
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-xs font-bold transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <span className="font-mono tracking-wider">{activeCouponCode}</span>
              {discountAmount > 0 && (
                <span className="ms-1.5 text-[11px] font-mono opacity-90">
                  (-${formatPrice ? formatPrice(discountAmount) : discountAmount.toFixed(2)})
                </span>
              )}
            </span>
          </div>

          <button 
            type="button" 
            onClick={handleRemove}
            disabled={loading}
            className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg transition cursor-pointer text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-50"
            title={t('common.remove', 'Remove')}
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
          </button>
        </div>
      ) : (
        <form onSubmit={handleApply} className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={t('store.coupon_form.placeholder', 'Enter promo code...')}
            className="flex-1 px-3 py-2.5 text-xs font-mono font-bold uppercase bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl outline-none text-slate-900 dark:text-white transition-colors focus:border-[#E89A5B] placeholder:normal-case placeholder:font-normal"
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="px-4 py-2.5 bg-[#17233C] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-xs font-black uppercase tracking-wider rounded-xl hover:opacity-90 transition cursor-pointer disabled:opacity-50 shrink-0 flex items-center justify-center gap-1.5 shadow-sm"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{loading ? t('store.coupon_form.loading_btn', 'Applying...') : t('store.coupon_form.apply_btn', 'Apply')}</span>
          </button>
        </form>
      )}

      {/* تلميح الأكواد الترويجية التجريبية إن لم يكن هناك كوبون نشط */}
      {!activeCouponCode && (
        <p className="text-[10px] text-slate-400 dark:text-gray-500 font-light">
          {t('store.coupon_form.hint', 'Try: SAVE10, SAVE20, SAVE50, OFF50')}
        </p>
      )}

    </div>
  );
}