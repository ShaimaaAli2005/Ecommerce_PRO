import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export default function OrdersSummaryCard({ cart, loading, isRtl, onSubmit }) {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-200 dark:border-gray-700 p-6 space-y-6 shadow-xs sticky top-28">
      <h3 className="text-base font-bold font-['Poppins'] text-slate-900 dark:text-white border-b border-slate-100 dark:border-gray-700 pb-4">
        {t('store.checkout.order_summary', 'Order Summary')}
      </h3>

      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {cart.items?.map((item, idx) => (
          <div key={item._id || idx} className="flex items-center gap-3 text-xs text-slate-600 dark:text-gray-400">
            <img 
              src={item.image || 'https://placehold.co/50'} 
              alt={item.name || 'Product'} 
              className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-gray-700 shrink-0" 
            />
            <span className="line-clamp-1 flex-1 font-medium text-slate-800 dark:text-gray-200">
              {item.name || 'Product'} <strong className="text-[#E89A5B]">× {item.quantity}</strong>
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">${(Number(item.price || 0) * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3 text-xs pt-4 border-t border-slate-100 dark:border-gray-700">
        <div className="flex justify-between text-slate-600 dark:text-gray-400">
          <span>{t('store.cart_page.subtotal', 'Subtotal')}</span>
          <span className="font-mono font-bold">${Number(cart.subtotal || 0).toFixed(2)}</span>
        </div>
        {cart.discountAmount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
            <span>{t('store.cart_page.discount', 'Discount')}</span>
            <span className="font-mono">-${Number(cart.discountAmount || 0).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-slate-900 dark:text-white text-sm font-bold pt-3 border-t border-slate-100 dark:border-gray-700">
          <span>{t('store.cart_page.total', 'Total')}</span>
          <span className="font-mono text-base text-[#E89A5B]">${Number(cart.total || 0).toFixed(2)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading || !cart.items || cart.items.length === 0}
        className="w-full py-3.5 px-6 rounded-xl bg-[#17233C] dark:bg-[#E89A5B] hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xl cursor-pointer disabled:opacity-50"
      >
        <span>{loading ? (isRtl ? 'جاري إتمام الطلب...' : 'Placing Order...') : (isRtl ? 'تأكيد وإتمام الطلب' : 'Place Order')}</span>
        {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
      </button>

      <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 dark:text-gray-500 pt-2 text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>{t('store.checkout.secure_checkout', 'Secure SSL Checkout & Guaranteed Delivery')}</span>
      </div>
    </div>
  );
}