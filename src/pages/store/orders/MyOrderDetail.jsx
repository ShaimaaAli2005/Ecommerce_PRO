import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, ArrowLeft, ArrowRight, Truck, MapPin, CreditCard, Clock, CheckCircle2, XCircle, Ban } from 'lucide-react';
import orderService from '../../../services/orderService';
import toast from 'react-hot-toast';

export default function MyOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await orderService.getMyOrderById(id);
      if (res && res.success) {
        setOrder(res.order || res);
      }
    } catch (err) {
      toast.error(isRtl ? 'تعذر جلب تفاصيل الطلب' : 'Failed to fetch order details');
      navigate('/my-orders');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, isRtl]);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [id, fetchOrderDetails]);

  const handleCancelOrder = async () => {
    if (!window.confirm(isRtl ? 'هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟' : 'Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCancelling(true);
      const res = await orderService.cancelMyOrder(id);
      if (res && res.success) {
        toast.success(isRtl ? 'تم إلغاء الطلب بنجاح' : 'Order cancelled successfully');
        fetchOrderDetails();
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || (isRtl ? 'لا يمكن إلغاء الطلب في حالته الحالية' : 'Cannot cancel order in current status');
      toast.error(errorMsg);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#17233C] dark:border-[#E89A5B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) return null;

  const address = order.shippingAddress || {};
  const items = order.items || [];
  const canCancel = order.status === 'pending' || order.status === 'confirmed';

  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#0F172A] text-slate-900 dark:text-white py-10 px-4 sm:px-6 lg:px-8 font-['Inter'] transition-colors duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* زر العودة والترويسة */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-gray-800 pb-6">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => navigate('/my-orders')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer mb-2"
            >
              {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              <span>{t('store.order_detail.back', 'Back to My Orders')}</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold font-['Poppins'] text-[#17233C] dark:text-white">
              {t('store.order_detail.title', 'Order Details')} <span className="font-mono text-[#E89A5B]">#{order._id || order.id}</span>
            </h1>
          </div>

          {canCancel && (
            <button
              type="button"
              disabled={cancelling}
              onClick={handleCancelOrder}
              className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-2 cursor-pointer self-start sm:self-auto disabled:opacity-50"
            >
              <Ban className="w-4 h-4" />
              <span>{cancelling ? (isRtl ? 'جاري الإلغاء...' : 'Cancelling...') : (isRtl ? 'إلغاء الطلب' : 'Cancel Order')}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* تفاصيل المنتجات وعنوان الشحن */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* المنتجات */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-200 dark:border-gray-700 p-6 space-y-4 shadow-xs">
              <h2 className="text-sm font-bold font-['Poppins'] text-slate-900 dark:text-white border-b border-slate-100 dark:border-gray-700 pb-3">
                {t('store.order_detail.items_list', 'Ordered Items')} ({items.length})
              </h2>

              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700">
                    <img src={item.image || 'https://placehold.co/100'} alt={item.name} className="w-16 h-16 object-cover rounded-xl shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#E89A5B]">${(Number(item.price || 0) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* عنوان الشحن */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-200 dark:border-gray-700 p-6 space-y-4 shadow-xs">
              <h2 className="text-sm font-bold font-['Poppins'] text-slate-900 dark:text-white border-b border-slate-100 dark:border-gray-700 pb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E89A5B]" />
                <span>{t('store.order_detail.shipping_info', 'Shipping Address')}</span>
              </h2>

              <div className="text-xs space-y-1.5 text-slate-600 dark:text-gray-300">
                <p className="font-bold text-slate-900 dark:text-white">{address.fullName}</p>
                <p>{address.address}, {address.city}, {address.country}</p>
                <p className="font-mono">Phone: {address.phone}</p>
              </div>
            </div>

          </div>

          {/* ملخص الفاتورة والحالة */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-200 dark:border-gray-700 p-6 space-y-6 shadow-xs">
            <h3 className="text-base font-bold font-['Poppins'] text-slate-900 dark:text-white border-b border-slate-100 dark:border-gray-700 pb-4">
              {t('store.order_detail.summary', 'Order Summary')}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">{t('store.order_detail.status_label', 'Status')}</span>
                <span className="font-bold uppercase text-[#E89A5B]">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('store.order_detail.payment', 'Payment')}</span>
                <span className="font-bold uppercase">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-gray-400 pt-2 border-t border-slate-100 dark:border-gray-700">
                <span>{t('store.cart_page.subtotal', 'Subtotal')}</span>
                <span className="font-mono font-bold">${Number(order.subtotal || 0).toFixed(2)}</span>
              </div>
              {order.shippingFee > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-gray-400">
                  <span>Shipping Fee</span>
                  <span className="font-mono">${Number(order.shippingFee || 0).toFixed(2)}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-gray-400">
                  <span>Tax</span>
                  <span className="font-mono">${Number(order.tax || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 dark:text-white text-sm font-bold pt-3 border-t border-slate-100 dark:border-gray-700">
                <span>{t('store.cart_page.total', 'Total')}</span>
                <span className="font-mono text-base text-[#E89A5B]">${Number(order.totalPrice || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}