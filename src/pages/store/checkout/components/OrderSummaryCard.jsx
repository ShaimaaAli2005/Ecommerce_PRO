import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { useSettings } from '../../../../context/SettingsContext';

export default function OrdersSummaryCard({ cart, loading, isRtl, onSubmit, formId }) {
  const { t } = useTranslation();
  const { formatPrice, currencyLabel } = useSettings();

  const items = cart?.items || [];
  const subtotal = Number(cart?.subtotal || 0);
  const discountAmount = Number(cart?.discountAmount || 0);
  const total = Number(cart?.total || 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-200 dark:border-gray-700 p-6 space-y-6 shadow-xs sticky top-28">
      <h3 className="text-base font-bold font-['Poppins'] text-slate-900 dark:text-white border-b border-slate-100 dark:border-gray-700 pb-4">
        {t('store.checkout.order_summary', 'Order Summary')}
      </h3>

      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {items.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-gray-500 text-center py-4">
            {t('store.checkout.no_items', 'No items in summary')}
          </p>
        ) : (
          items.map((item, idx) => (
            <div key={item._id || item.product || idx} className="flex items-center gap-3 text-xs text-slate-600 dark:text-gray-400">
              <img 
                src={item.image || 'https://placehold.co/50'} 
                alt={item.name || 'Product'} 
                onError={(e) => { e.target.src = 'https://placehold.co/50'; }}
                className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-gray-700 shrink-0" 
              />
              <span className="line-clamp-1 flex-1 font-medium text-slate-800 dark:text-gray-200">
                {item.name || 'Product'} <strong className="text-[#E89A5B]">× {item.quantity}</strong>
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {currencyLabel} {formatPrice((Number(item.price || 0) * (item.quantity || 1)))}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="space-y-3 text-xs pt-4 border-t border-slate-100 dark:border-gray-700">
        <div className="flex justify-between text-slate-600 dark:text-gray-400">
          <span>{t('store.cart_page.subtotal', 'Subtotal')}</span>
          <span className="font-mono font-bold">{currencyLabel} {formatPrice(subtotal)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
            <span>{t('store.cart_page.discount', 'Discount')}</span>
            <span className="font-mono">-{currencyLabel} {formatPrice(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-900 dark:text-white text-sm font-bold pt-3 border-t border-slate-100 dark:border-gray-700">
          <span>{t('store.cart_page.total', 'Total')}</span>
          <span className="font-mono text-base text-[#E89A5B]">{currencyLabel} {formatPrice(total)}</span>
        </div>
      </div>

      <button
        type={formId ? 'submit' : 'button'}
        form={formId}
        onClick={!formId ? onSubmit : undefined}
        disabled={loading || items.length === 0}
        className="w-full py-3.5 px-6 rounded-xl bg-[#17233C] dark:bg-[#E89A5B] hover:opacity-90 text-white dark:text-[#0B132B] text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xl cursor-pointer disabled:opacity-50"
      >
        <span>
          {loading 
            ? t('store.checkout.placing_order', 'Placing Order...') 
            : t('store.checkout.place_order', 'Place Order')}
        </span>
        {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
      </button>

      <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 dark:text-gray-500 pt-2 text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>{t('store.checkout.secure_checkout', 'Secure SSL Checkout & Guaranteed Delivery')}</span>
      </div>
    </div>
  );
}