import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Package, 
  ArrowLeft, 
  ArrowRight, 
  Truck, 
  MapPin, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  Ban,
  FileText,
  ShieldCheck,
  Calendar,
  Sparkles,
  Phone,
  User,
  ShoppingBag
} from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';
import orderService from '../../../services/orderService';
import toast from 'react-hot-toast';

export default function MyOrderDetail() {
  const params = useParams();
  const orderId = params.id || params.orderId;
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const { formatPrice, currencyLabel } = useSettings();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [hasError, setHasError] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setHasError(false);

      // تجربة الدالة المحددة للطلب الفردي
      const res = await (orderService.getMyOrderById ? orderService.getMyOrderById(orderId) : orderService.getOrderById(orderId));
      
      // استخراج مرن للبيانات لضمان العمل مع كافة أنماط استجابة السيرفر
      const data = res?.order || res?.data?.order || res?.data || res;

      if (data && (data._id || data.id)) {
        setOrder(data);
      } else {
        throw new Error("Invalid order payload structure");
      }
    } catch (err) {
      console.error("Order fetch failure:", err);
      setHasError(true);
      toast.error(t('store.order_detail.fetch_error', 'Failed to retrieve order details'));
      // لا نقوم بعمل navigate مباشر حتى لا يظن العميل أن الزر لم يفتح شيئاً
    } finally {
      setLoading(false);
    }
  }, [orderId, t]);

  useEffect(() => {
    fetchOrderDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchOrderDetails]);

  const handleCancelOrder = async () => {
    if (!window.confirm(t('store.order_detail.cancel_confirm', 'Are you sure you want to cancel this order?'))) {
      return;
    }

    try {
      setCancelling(true);
      const res = await orderService.cancelMyOrder(orderId);
      if (res?.success || res?.status === 'cancelled' || res?.data?.status === 'cancelled') {
        toast.success(t('store.order_detail.cancel_success', 'Order cancelled successfully'));
        fetchOrderDetails();
      } else {
        toast.success(t('store.order_detail.cancel_success', 'Order cancelled successfully'));
        fetchOrderDetails();
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || t('store.order_detail.cancel_error', 'Cannot cancel order in current status');
      toast.error(errorMsg);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4 font-['Poppins']">
        <div className="w-10 h-10 border-3 border-[#0B132B] dark:border-[#E89A5B] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          {isRtl ? 'جاري تحضير وثيقة الطلب...' : 'Securing Dossier...'}
        </p>
      </div>
    );
  }

  if (hasError || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4 font-['Poppins']">
        <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-500 flex items-center justify-center">
          <Ban className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-black uppercase tracking-tight">
          {t('store.order_detail.fetch_error', 'Failed to retrieve order details')}
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => fetchOrderDetails()}
            className="px-6 py-2.5 rounded-xl bg-[#0B132B] dark:bg-white text-white dark:text-[#0B132B] text-xs font-black uppercase tracking-wider cursor-pointer"
          >
            {isRtl ? 'إعادة المحاولة' : 'Retry'}
          </button>
          <button
            onClick={() => navigate('/my-orders')}
            className="px-6 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-black uppercase tracking-wider cursor-pointer"
          >
            {t('store.order_detail.back', 'Back to My Orders')}
          </button>
        </div>
      </div>
    );
  }

  const address = order.shippingAddress || {};
  const items = order.items || [];
  const normalizedStatus = String(order.status || '').toLowerCase();
  const canCancel = normalizedStatus === 'pending' || normalizedStatus === 'confirmed';

  // خطوات تتبع الطلب
  const steps = [
    { key: 'pending', label: t('store.order_detail.timeline.placed', 'Order Placed') },
    { key: 'confirmed', label: t('store.order_detail.timeline.confirmed', 'Confirmed') },
    { key: 'shipped', label: t('store.order_detail.timeline.shipped', 'In Transit') },
    { key: 'delivered', label: t('store.order_detail.timeline.delivered', 'Delivered') }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  };

  const currentStep = getStepIndex(normalizedStatus);
  const isCancelled = normalizedStatus === 'cancelled';

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#070D1E] text-[#0B132B] dark:text-white py-12 px-4 sm:px-6 lg:px-8 font-['Poppins'] transition-colors duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* شريط العودة ورأس الوثيقة */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-6">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => navigate('/my-orders')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#121c38] border border-black/5 dark:border-white/10 text-xs font-bold hover:border-[#E89A5B] transition-all cursor-pointer shadow-xs active:scale-95"
            >
              {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>{t('store.order_detail.back', 'Back to My Orders')}</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E89A5B]" />
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                {t('store.order_detail.badge', 'Official Order Dossier')}
              </h1>
            </div>
            
            <p className="text-xs text-slate-400 font-mono">
              {t('store.order_detail.order_number', 'Order Ref')}: <span className="font-bold text-[#0B132B] dark:text-white">#{order._id || order.id}</span>
              {order.createdAt && (
                <span className="ms-3">
                  • {t('store.order_detail.placed_on', 'Placed on')} {new Date(order.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </p>
          </div>

          {canCancel && !isCancelled && (
            <button
              type="button"
              disabled={cancelling}
              onClick={handleCancelOrder}
              className="px-5 py-3 rounded-2xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 self-start sm:self-auto"
            >
              <Ban className="w-4 h-4" />
              <span>{cancelling ? t('store.order_detail.cancelling', 'Cancelling...') : t('store.order_detail.cancel_btn', 'Cancel Order')}</span>
            </button>
          )}
        </div>

        {/* شريط مراحل الطلب الحي (Status Timeline Tracker) */}
        {!isCancelled ? (
          <div className="bg-white dark:bg-[#121c38] p-6 sm:p-8 rounded-[32px] border border-black/5 dark:border-white/10 shadow-xs">
            <div className="relative flex justify-between items-center max-w-3xl mx-auto">
              {/* الخط الرابط */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-black/5 dark:bg-white/10 -translate-y-1/2 z-0" />
              <div 
                className="absolute top-1/2 left-0 h-1 bg-[#E89A5B] -translate-y-1/2 transition-all duration-700 z-0"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              />

              {steps.map((step, idx) => {
                const isPassed = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={step.key} className="relative z-10 flex flex-col items-center">
                    <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isPassed 
                        ? 'bg-[#E89A5B] text-[#0B132B] shadow-md scale-105' 
                        : 'bg-white dark:bg-[#070D1E] border border-black/10 dark:border-white/10 text-slate-400'
                    }`}>
                      {isPassed ? <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-wider mt-2.5 whitespace-nowrap ${
                      isCurrent ? 'text-[#E89A5B]' : isPassed ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-3">
            <Ban className="w-5 h-5 shrink-0" />
            <span className="text-xs font-black uppercase tracking-wider">
              {t('store.order_detail.timeline.cancelled', 'This order was officially cancelled')}
            </span>
          </div>
        )}

        {/* تفاصيل الطلب والفاتورة */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. قائمة القطع المقتناة */}
            <div className="bg-white dark:bg-[#121c38] rounded-[32px] border border-black/5 dark:border-white/10 p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <Package className="w-5 h-5 text-[#E89A5B]" />
                  <h2 className="text-sm font-black uppercase tracking-wider">
                    {t('store.order_detail.items_list', 'Acquired Pieces')}
                  </h2>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {items.length} {isRtl ? 'قطع' : 'items'}
                </span>
              </div>

              <div className="divide-y divide-black/5 dark:divide-white/5 space-y-4">
                {items.map((item, idx) => {
                  const itemImg = item.image || item.product?.images?.[0]?.url || item.product?.image || 'https://placehold.co/200';
                  const itemName = item.name || item.product?.name || item.product?.title || 'Luxury Piece';
                  const itemPrice = Number(item.price || item.product?.discountPrice || item.product?.price || 0);

                  return (
                    <div key={idx} className="flex items-center gap-5 pt-4 first:pt-0">
                      <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-black/30 overflow-hidden shrink-0 border border-black/5 dark:border-white/10">
                        <img 
                          src={itemImg} 
                          alt={itemName} 
                          className="w-full h-full object-cover" 
                        />
                      </div>

                      <div className="flex-1 space-y-1">
                        <h3 className="text-sm font-black uppercase tracking-tight text-[#0B132B] dark:text-white line-clamp-1">
                          {itemName}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono">
                          {isRtl ? 'الكمية:' : 'Qty:'} <span className="font-bold text-[#0B132B] dark:text-white">{item.quantity}</span>
                        </p>
                      </div>

                      <div className="text-end">
                        <span className="font-mono text-sm font-black text-[#0B132B] dark:text-white block">
                          {currencyLabel} {formatPrice(itemPrice * item.quantity)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {currencyLabel} {formatPrice(itemPrice)} / piece
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. وجهة الشحن والتوصيل */}
            <div className="bg-white dark:bg-[#121c38] rounded-[32px] border border-black/5 dark:border-white/10 p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-2.5 border-b border-black/5 dark:border-white/10 pb-4">
                <MapPin className="w-5 h-5 text-[#E89A5B]" />
                <h2 className="text-sm font-black uppercase tracking-wider">
                  {t('store.order_detail.shipping_info', 'Delivery Destination')}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold block">{isRtl ? 'المستلم:' : 'Recipient:'}</span>
                  <p className="font-black text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{address.fullName || order.user?.name || 'Authorized Client'}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-bold block">{isRtl ? 'رقم الاتصال:' : 'Contact Phone:'}</span>
                  <p className="font-mono font-bold flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{address.phone || 'Direct Courier Dispatch'}</span>
                  </p>
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-black/5 dark:border-white/5 space-y-1">
                  <span className="text-slate-400 font-bold block">{isRtl ? 'العنوان التفصيلي:' : 'Physical Address:'}</span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                    {address.address ? `${address.address}, ${address.city || ''}, ${address.country || ''}` : (isRtl ? 'تسليم خاص ومباشر' : 'Private Courier Handover')}
                    {address.postalCode && ` (${address.postalCode})`}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. ملاحظات الطلب الخاصة (إن وجدت) */}
            {order.customerNote && (
              <div className="bg-white dark:bg-[#121c38] rounded-[32px] border border-black/5 dark:border-white/10 p-6 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-[#E89A5B]" />
                  <span>{isRtl ? 'ملاحظات وتوجيهات العميل' : 'Client Instructions'}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic font-light">
                  "{order.customerNote}"
                </p>
              </div>
            )}

          </div>

          {/* ملخص الفاتورة وحالة الدفع */}
          <div className="bg-white dark:bg-[#121c38] rounded-[32px] border border-black/5 dark:border-white/10 p-6 sm:p-8 space-y-6 shadow-xs sticky top-28">
            <h3 className="text-base font-black uppercase tracking-wider border-b border-black/5 dark:border-white/10 pb-4">
              {t('store.order_detail.summary', 'Financial Settlement')}
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{t('store.order_detail.status_label', 'Order Status')}</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isCancelled 
                    ? 'bg-rose-500/10 text-rose-500' 
                    : 'bg-[#E89A5B]/15 text-[#E89A5B]'
                }`}>
                  {order.status}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">{t('store.order_detail.payment_info', 'Payment Method')}</span>
                <span className="font-mono font-black uppercase">
                  {order.paymentMethod || 'Cash On Delivery'}
                </span>
              </div>

              {order.paymentStatus && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">{isRtl ? 'حالة الدفع' : 'Payment Status'}</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 uppercase">
                    {order.paymentStatus}
                  </span>
                </div>
              )}

              <div className="pt-4 border-t border-black/5 dark:border-white/10 space-y-2.5">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>{t('store.order_detail.subtotal', 'Subtotal')}</span>
                  <span className="font-mono font-bold">
                    {currencyLabel} {formatPrice(order.subtotal || order.totalPrice || 0)}
                  </span>
                </div>

                {Number(order.discount || order.discountAmount || 0) > 0 && (
                  <div className="flex justify-between text-emerald-500 font-bold">
                    <span>{t('store.order_detail.discount', 'Discount')}</span>
                    <span className="font-mono">
                      -{currencyLabel} {formatPrice(order.discount || order.discountAmount)}
                    </span>
                  </div>
                )}

                {Number(order.shippingFee || 0) > 0 && (
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>{t('store.order_detail.shipping_fee', 'Shipping')}</span>
                    <span className="font-mono font-bold">
                      {currencyLabel} {formatPrice(order.shippingFee)}
                    </span>
                  </div>
                )}

                {Number(order.tax || 0) > 0 && (
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>{t('store.order_detail.tax', 'Tax')}</span>
                    <span className="font-mono font-bold">
                      {currencyLabel} {formatPrice(order.tax)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-baseline pt-4 border-t border-black/5 dark:border-white/10">
                <span className="text-sm font-black uppercase tracking-wider">
                  {t('store.order_detail.total', 'Total Settlement')}
                </span>
                <span className="font-mono text-xl font-black text-[#0B132B] dark:text-[#E89A5B]">
                  {currencyLabel} {formatPrice(order.totalPrice || order.total || 0)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{isRtl ? 'معاملة موثقة ومحمية بالكامل' : 'Verified & Authenticated'}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}