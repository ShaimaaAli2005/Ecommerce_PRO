import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ShoppingBag, ArrowRight, ArrowLeft, Package, Clock } from 'lucide-react';

export default function OrdersSuccess() {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const location = useLocation();
  const navigate = useNavigate();
  
  const order = location.state?.order;

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-['Inter']" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-xl w-full bg-white dark:bg-gray-800 rounded-3xl border border-slate-200 dark:border-gray-700 p-8 sm:p-10 text-center space-y-6 shadow-xl">
        
        <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold font-['Poppins'] text-slate-900 dark:text-white">
            {t('store.order_success.title', 'Order Placed Successfully!')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
            {t('store.order_success.subtitle', 'Thank you for your purchase. Your order has been received and is being processed.')}
          </p>
        </div>

        {order && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 text-start space-y-2 text-xs">
            <div className="flex justify-between font-bold">
              <span className="text-slate-500">{t('store.order_success.order_id', 'Order ID:')}</span>
              <span className="font-mono text-[#E89A5B]">#{order._id || order.id}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-slate-500">{t('store.order_success.total_price', 'Total Price:')}</span>
              <span className="font-mono">${Number(order.totalPrice || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-slate-500">{t('store.order_success.status', 'Status:')}</span>
              <span className="text-amber-600 dark:text-amber-400 uppercase">{order.status || 'Confirmed'}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Link
            to="/my-orders"
            className="flex-1 py-3 px-6 rounded-xl bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-900 dark:text-white text-xs font-bold transition text-center flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4 text-[#E89A5B]" />
            <span>{t('store.order_success.view_orders', 'View My Orders')}</span>
          </Link>

          <Link
            to="/products"
            className="flex-1 py-3 px-6 rounded-xl bg-[#17233C] dark:bg-[#E89A5B] text-white text-xs font-bold transition text-center flex items-center justify-center gap-2 shadow-lg"
          >
            <span>{t('store.order_success.continue_shopping', 'Continue Shopping')}</span>
            {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Link>
        </div>

      </div>
    </div>
  );
}