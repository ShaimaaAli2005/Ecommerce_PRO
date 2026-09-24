import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, ArrowRight, ArrowLeft, Package, Sparkles } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';

export default function OrderSuccess() {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const location = useLocation();
  const navigate = useNavigate();
  const { formatPrice, currencyLabel } = useSettings();

  const rawOrder = location.state?.order;
  const order = rawOrder?.order || rawOrder || {};

  // حماية الصفحة: إذا دخل المستخدم الرابط مباشرة بدون طلب
  useEffect(() => {
    if (!rawOrder) {
      const timer = setTimeout(() => {
        navigate('/my-orders', { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [rawOrder, navigate]);

  const orderId = order._id || order.id || 'N/A';
  const totalPrice = Number(order.totalPrice || order.total || order.subtotal || 0);
  const status = order.status || order.orderStatus || 'CONFIRMED';

  return (
    <div 
      className="min-h-[85vh] bg-[#FAF8F5] dark:bg-[#070D1E] text-[#0B132B] dark:text-white flex items-center justify-center p-4 font-['Poppins'] transition-colors duration-300 selection:bg-[#E89A5B]/30"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-xl bg-white dark:bg-[#121c38] rounded-[36px] border border-black/5 dark:border-white/10 p-8 sm:p-12 shadow-2xl text-center space-y-8 animate-fadeIn">
        
        {/* أيقونة التأكيد الفاخرة */}
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-inner">
          <div className="w-12 h-12 rounded-full border-2 border-emerald-500 flex items-center justify-center">
            <Check className="w-7 h-7 stroke-[2.5]" />
          </div>
        </div>

        {/* الترويسة المترجمة */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B132B] dark:text-white">
            {t('store.order_success.title', 'Order Placed Successfully!')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed max-w-md mx-auto">
            {t('store.order_success.subtitle', 'Thank you for your purchase. Your order has been received and is being processed.')}
          </p>
        </div>

        {/* بطاقة بيانات الطلب */}
        <div className="bg-[#FAF8F5] dark:bg-[#070D1E] rounded-2xl p-6 border border-black/5 dark:border-white/5 space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {t('store.order_success.order_id', 'Order ID')}:
            </span>
            <span className="font-mono font-bold text-[#E89A5B] tracking-wide">
              #{orderId}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {t('store.order_success.total_price', 'Total Price')}:
            </span>
            <span className="font-mono font-black text-sm text-[#0B132B] dark:text-white">
              {currencyLabel} {formatPrice(totalPrice)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {t('store.order_success.status', 'Status')}:
            </span>
            <span className="font-black text-[11px] text-emerald-600 dark:text-emerald-400 tracking-wider uppercase bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
              {status.toUpperCase() === 'CONFIRMED' 
                ? t('store.order_success.status_confirmed', 'CONFIRMED')
                : status}
            </span>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <Link
            to="/products"
            className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-xs font-black uppercase tracking-wider hover:opacity-90 transition shadow-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('store.order_success.continue_shopping', 'Continue Shopping')}</span>
            {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Link>

          <Link
            to="/my-orders"
            className="w-full sm:flex-1 py-4 px-6 rounded-2xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold uppercase tracking-wider text-center transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Package className="w-4 h-4 text-[#E89A5B]" />
            <span>{t('store.order_success.view_orders', 'View My Orders')}</span>
          </Link>
        </div>

      </div>
    </div>
  );
}