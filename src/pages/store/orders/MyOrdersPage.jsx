import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Package, 
  ChevronRight, 
  ChevronLeft, 
  Eye, 
  Ban, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ShoppingBag,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';
import orderService from '../../../services/orderService';
import toast from 'react-hot-toast';

export default function MyOrdersPage() {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const navigate = useNavigate();
  const { formatPrice, currencyLabel } = useSettings();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // قفل لحماية كل طلب بمفرده أثناء الإلغاء ومنع إلغاء أي طلبات أخرى بالخطأ
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await (orderService.getMyOrders ? orderService.getMyOrders() : orderService.getOrders());
      const rawOrders = Array.isArray(res) ? res : (res?.orders || res?.data?.orders || res?.data || []);
      setOrders(Array.isArray(rawOrders) ? rawOrders : []);
    } catch (err) {
      toast.error(t('store.orders.fetch_error', isRtl ? 'تعذر جلب سجل الطلبات' : 'Failed to retrieve orders ledger'));
    } finally {
      setLoading(false);
    }
  }, [t, isRtl]);

  useEffect(() => {
    fetchOrders();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchOrders]);

  // 🌟 الفرز الذكي الحاسم: الفعّال والنشط في الصدارة، والملغي في القاع
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const getPriority = (status) => {
        const s = String(status || '').toLowerCase();
        if (s === 'pending' || s === 'confirmed') return 3; // أولوية قصوى
        if (s === 'shipped' || s === 'processing') return 2; // قيد النقل
        if (s === 'delivered') return 1;                     // تم بنجاح
        if (s === 'cancelled') return 0;                     // ملغي في القاع
        return 1;
      };

      const priorityA = getPriority(a.status);
      const priorityB = getPriority(b.status);

      // أولاً: الترتيب بحسب الأولوية والحالة
      if (priorityA !== priorityB) {
        return priorityB - priorityA;
      }

      // ثانياً: الأحدث تاريخاً أولاً
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [orders]);

  // دالة الإلغاء المحمية بقفل المعرف
  const handleCancelOrder = async (e, orderId) => {
    e.preventDefault();
    e.stopPropagation();

    if (cancellingOrderId) return; // منع الضغط المزدوج التام

    const confirmMsg = t('store.order_detail.cancel_confirm', isRtl ? 'هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟' : 'Are you sure you want to cancel this order?');
    if (!window.confirm(confirmMsg)) return;

    try {
      setCancellingOrderId(orderId);
      const res = await orderService.cancelMyOrder(orderId);
      
      toast.success(t('store.order_detail.cancel_success', isRtl ? 'تم إلغاء الطلب بنجاح' : 'Order cancelled successfully'));
      
      // تحديث الحالة محلياً فوراً لمنع أي تكرار
      setOrders(prev => prev.map(o => {
        const currentId = o._id || o.id;
        if (currentId === orderId) {
          return { ...o, status: 'cancelled' };
        }
        return o;
      }));
    } catch (err) {
      const errorMsg = err?.response?.data?.message || t('store.order_detail.cancel_error', isRtl ? 'لا يمكن إلغاء الطلب في حالته الحالية' : 'Cannot cancel order in current state');
      toast.error(errorMsg);
      fetchOrders();
    } finally {
      setCancellingOrderId(null);
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'pending':
        return {
          label: isRtl ? 'قيد الانتظار' : 'Pending Verification',
          className: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
        };
      case 'confirmed':
        return {
          label: isRtl ? 'تم التأكيد' : 'Confirmed',
          className: 'bg-[#E89A5B]/15 text-[#E89A5B] border-[#E89A5B]/30'
        };
      case 'shipped':
        return {
          label: isRtl ? 'قيد التوصيل' : 'In Transit',
          className: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        };
      case 'delivered':
        return {
          label: isRtl ? 'تم الاستلام' : 'Delivered',
          className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        };
      case 'cancelled':
        return {
          label: isRtl ? 'ملغي' : 'Cancelled',
          className: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
        };
      default:
        return {
          label: status,
          className: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#070D1E] text-[#0B132B] dark:text-white py-12 px-4 sm:px-6 lg:px-8 font-['Poppins'] transition-colors duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* الترويسة الرئيسية */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E89A5B]/10 text-[#E89A5B] text-[11px] font-black uppercase tracking-wider mb-1">
              <Package className="w-3.5 h-3.5" />
              <span>{isRtl ? 'أرشيف المقتنيات الخاصة' : 'Private Acquisitions Ledger'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
              {isRtl ? 'طلباتي' : 'My Orders & Archives'}
            </h1>
          </div>

          {/* زر الترويسة العلوي */}
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-xs font-black uppercase tracking-wider shadow-md hover:opacity-90 active:scale-95 transition cursor-pointer self-start sm:self-auto"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isRtl ? 'تسوق الآن' : 'Shop Now'}</span>
          </Link>
        </div>

        {/* حالة التحميل */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-32 bg-white dark:bg-[#121c38] rounded-3xl border border-black/5 dark:border-white/10 animate-pulse" />
            ))}
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="text-center py-24 rounded-[32px] bg-white dark:bg-[#121c38] border border-dashed border-black/10 dark:border-white/10 space-y-4">
            <Package className="w-12 h-12 text-slate-400 mx-auto opacity-40 animate-bounce" />
            <h3 className="text-base font-black uppercase tracking-wider">
              {isRtl ? 'لا توجد طلبات مسجلة حتى الآن' : 'No Order History Established'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-light leading-relaxed">
              {isRtl ? 'لم تقم بإنشاء أي طلبات شراء بعد. تصفح مجموعاتنا الحصرية لاقتناء قطعك المفضلة.' : 'You have not placed any acquisitions yet. Explore our curated archive.'}
            </p>
            <Link
              to="/catalog"
              className="inline-block px-7 py-3 rounded-2xl bg-[#0B132B] dark:bg-white text-white dark:text-[#0B132B] text-xs font-black uppercase tracking-wider shadow-md"
            >
              {isRtl ? 'تسوق الآن' : 'Acquire Now'}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedOrders.map((order) => {
              const orderId = order._id || order.id;
              const items = order.items || [];
              const statusInfo = getStatusBadge(order.status);
              const normalizedStatus = String(order.status || '').toLowerCase();
              const canCancel = normalizedStatus === 'pending' || normalizedStatus === 'confirmed';
              const isCurrentlyCancelling = cancellingOrderId === orderId;

              return (
                <div
                  key={orderId}
                  className={`bg-white dark:bg-[#121c38] p-5 sm:p-6 rounded-[28px] border transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs hover:shadow-md ${
                    normalizedStatus === 'cancelled' 
                      ? 'border-black/5 dark:border-white/5 opacity-70 bg-slate-50/50 dark:bg-[#121c38]/40' 
                      : 'border-black/5 dark:border-white/10 hover:border-[#E89A5B]/40'
                  }`}
                >
                  {/* يسار البطاقة: تفاصيل الطلب والصور */}
                  <div className="space-y-4 flex-1 w-full">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 dark:border-white/5 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-slate-400">
                          #{orderId}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      {order.createdAt && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(order.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>

                    {/* مصغرات صور المنتجات والمبلغ */}
                    <div className="flex items-center justify-between gap-4">
                      {/* عرض حتى 4 صور من المنتجات */}
                      <div className="flex items-center -space-x-3 rtl:space-x-reverse overflow-hidden">
                        {items.slice(0, 4).map((item, idx) => {
                          const img = item.image || item.product?.images?.[0]?.url || item.product?.image || 'https://placehold.co/100';
                          return (
                            <img
                              key={idx}
                              src={img}
                              alt={item.name || 'Item'}
                              className="w-12 h-12 rounded-xl object-cover border-2 border-white dark:border-[#121c38] shadow-xs bg-slate-100 dark:bg-black/30"
                            />
                          );
                        })}
                        {items.length > 4 && (
                          <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] dark:bg-[#070D1E] border-2 border-white dark:border-[#121c38] flex items-center justify-center text-[10px] font-black text-slate-500 font-mono">
                            +{items.length - 4}
                          </div>
                        )}
                      </div>

                      <div className="text-end">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                          {items.length} {isRtl ? 'قطع' : 'pieces'}
                        </span>
                        <span className="font-mono text-base font-black text-[#0B132B] dark:text-[#E89A5B]">
                          {currencyLabel} {formatPrice(order.totalPrice || order.total || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* يمين البطاقة: أزرار الإجراءات */}
                  <div className="flex sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-black/5 dark:border-white/5">
                    {/* زر عرض التفاصيل الذي ينقل إلى صفحة MyOrderDetail */}
                    <Link
                      to={`/my-orders/${orderId}`}
                      className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-center"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#E89A5B]" />
                      <span>{isRtl ? 'عرض التفاصيل' : 'View Dossier'}</span>
                    </Link>

                    {/* زر الإلغاء إذا كان متاحاً */}
                    {canCancel && (
                      <button
                        type="button"
                        disabled={cancellingOrderId !== null}
                        onClick={(e) => handleCancelOrder(e, orderId)}
                        className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 active:scale-95"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>{isCurrentlyCancelling ? (isRtl ? 'جاري الإلغاء...' : 'Cancelling...') : (isRtl ? 'إلغاء الطلب' : 'Cancel Order')}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}