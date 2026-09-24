import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, Clock, CheckCircle2, XCircle, Eye, ChevronLeft, ChevronRight, Ban, Loader2 } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';
import orderService from '../../../services/orderService';
import toast from 'react-hot-toast';

export default function MyOrdersPage() {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const navigate = useNavigate();
  const { formatPrice, currencyLabel } = useSettings();

  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
    if (!token) {
      toast.error(isRtl ? 'يرجى تسجيل الدخول لعرض طلباتك' : 'Please sign in to view your orders');
      navigate('/login');
    }
  }, [navigate, isRtl]);

  // جلب الطلبات الشاملة وحفظها في الذاكرة للتصفية اللحظية
  const fetchOrders = useCallback(async (isSilent = false) => {
    const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
    if (!token) return;

    if (!isSilent) setLoading(true);

    try {
      const res = await orderService.getMyOrders({ limit: 100 });
      const rawList = res?.orders || res?.data?.orders || (Array.isArray(res) ? res : []);
      const validOrders = Array.isArray(rawList) ? rawList.filter(o => o && (o._id || o.id)) : [];
      
      setAllOrders(validOrders);
    } catch (err) {
      if (!isSilent) {
        toast.error(isRtl ? 'تعذر جلب قائمة الطلبات' : 'Failed to fetch orders');
      }
    } finally {
      setLoading(false);
    }
  }, [isRtl]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // تصفية فورية وسريعة بالذاكرة (Instant Zero-Latency Filtering)
  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return allOrders;

    return allOrders.filter((order) => {
      const st = (order.status || order.orderStatus || 'pending').toLowerCase().trim();
      if (statusFilter === 'pending') {
        return st === 'pending';
      }
      if (statusFilter === 'confirmed') {
        return st === 'confirmed' || st === 'processing';
      }
      return st === statusFilter;
    });
  }, [allOrders, statusFilter]);

  // حساب الترقيم محلياً بدون إبطاء السيرفر
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, page, pageSize]);

  // إلغاء الطلب مع تحديث تفاؤلي فوري
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(t('store.my_orders.cancel_confirm', 'Are you sure you want to cancel this order?'))) {
      return;
    }

    try {
      setCancellingId(orderId);

      // تحديث فوري للحالة على الشاشة
      setAllOrders(prev => prev.map(o => {
        if ((o._id || o.id) === orderId) {
          return { ...o, status: 'cancelled' };
        }
        return o;
      }));

      const res = await orderService.cancelOrder(orderId);
      if (res && res.success) {
        toast.success(t('store.my_orders.cancel_success', 'Order cancelled successfully'));
      }
    } catch (err) {
      fetchOrders(true);
      const msg = err?.response?.data?.message || t('store.my_orders.cancel_failed', 'Failed to cancel order');
      toast.error(msg);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const st = (status || 'pending').toLowerCase();
    switch (st) {
      case 'confirmed':
      case 'processing':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold uppercase flex items-center gap-1.5 w-fit border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>{t(`store.order_status.${st}`, status)}</span>
          </span>
        );
      case 'delivered':
      case 'shipped':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold uppercase flex items-center gap-1.5 w-fit border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t(`store.order_status.${st}`, status)}</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-bold uppercase flex items-center gap-1.5 w-fit border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            <span>{t(`store.order_status.${st}`, status)}</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase flex items-center gap-1.5 w-fit border border-slate-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>{t('store.order_status.pending', status || 'Pending')}</span>
          </span>
        );
    }
  };

  const filterOptions = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#070D1E] text-[#0B132B] dark:text-white py-12 px-4 sm:px-6 lg:px-8 font-['Poppins'] transition-colors duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* الترويسة وأزرار التصفية الفورية */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-6">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#0B132B] dark:text-white">
              {t('store.my_orders.title', 'My Orders')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-light">
              {t('store.my_orders.subtitle', 'Track and manage your past and current store orders.')}
            </p>
          </div>

          {/* فلاتر الحالات السريعة اللحظية */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {filterOptions.map((st) => {
              const isActive = statusFilter === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => { 
                    setStatusFilter(st); 
                    setPage(1); 
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold capitalize transition-colors duration-150 cursor-pointer shrink-0 border select-none ${
                    isActive 
                      ? 'bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] border-transparent shadow-sm' 
                      : 'bg-white dark:bg-[#121c38] border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-[#E89A5B] dark:hover:border-[#E89A5B]'
                  }`}
                >
                  {t(`store.order_status_filter.${st}`, st)}
                </button>
              );
            })}
          </div>
        </div>

        {/* عرض الطلبات */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white/60 dark:bg-[#121c38]/60 rounded-3xl border border-black/5 dark:border-white/10 p-6 animate-pulse space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="w-32 h-6 bg-black/10 dark:bg-white/10 rounded-lg" />
                    <div className="w-24 h-6 bg-black/10 dark:bg-white/10 rounded-full" />
                  </div>
                  <div className="w-48 h-4 bg-black/10 dark:bg-white/10 rounded" />
                </div>
              ))}
            </div>
          ) : paginatedOrders.length === 0 ? (
            <div className="bg-white/80 dark:bg-[#121c38]/80 backdrop-blur-xl rounded-3xl border border-black/5 dark:border-white/10 p-12 text-center max-w-md mx-auto space-y-4 shadow-sm my-8">
              <div className="w-16 h-16 rounded-full bg-[#E89A5B]/10 text-[#E89A5B] flex items-center justify-center mx-auto shadow-inner">
                <Package className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-[#0B132B] dark:text-white uppercase tracking-wider">
                {t('store.my_orders.empty_title', 'No orders found')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                {t('store.my_orders.empty_desc', 'You have not placed any orders yet. Explore our catalog and start shopping.')}
              </p>
              <Link
                to="/products"
                className="inline-block px-6 py-3 bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-xs font-black uppercase tracking-wider rounded-xl transition hover:opacity-90 shadow-md cursor-pointer"
              >
                {t('store.cart_page.explore_catalog', 'Explore Catalog')}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedOrders.map((order) => {
                const orderId = order._id || order.id;
                const canCancel = ['pending', 'confirmed'].includes((order.status || '').toLowerCase());

                return (
                  <div 
                    key={orderId}
                    className="bg-white dark:bg-[#121c38] rounded-3xl border border-black/5 dark:border-white/10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-xs font-bold text-[#E89A5B] bg-[#E89A5B]/10 px-2.5 py-1 rounded-lg">
                          #{orderId}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>

                      {order.items && order.items.length > 0 && (
                        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="relative group shrink-0" title={item.name}>
                              <img 
                                src={item.image || 'https://placehold.co/60'} 
                                alt={item.name || 'Product'} 
                                onError={(e) => { e.currentTarget.src = 'https://placehold.co/60'; }}
                                className="w-12 h-12 object-cover rounded-xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-gray-900"
                              />
                              <span className="absolute -bottom-1 -end-1 bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono shadow-xs">
                                {item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span>
                          {t('store.my_orders.date', 'Date:')} <strong className="text-slate-800 dark:text-slate-200">{new Date(order.createdAt || Date.now()).toLocaleDateString()}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          {order.items?.length || 0} {t('store.my_orders.items_count', 'items')}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-sm font-black text-[#E89A5B]">
                          {currencyLabel} {formatPrice(Number(order.totalPrice || order.total || 0))}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-black/5 dark:border-white/5">
                      {canCancel && (
                        <button
                          type="button"
                          disabled={cancellingId === orderId}
                          onClick={() => handleCancelOrder(orderId)}
                          className="px-4 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {cancellingId === orderId ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Ban className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {cancellingId === orderId 
                              ? t('store.my_orders.cancelling', 'Cancelling...') 
                              : t('store.my_orders.cancel_btn', 'Cancel Order')}
                          </span>
                        </button>
                      )}

                      <Link
                        to={`/my-orders/${orderId}`}
                        className="w-full md:w-auto px-5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Eye className="w-4 h-4 text-[#E89A5B]" />
                        <span>{t('store.my_orders.view_details', 'View Details')}</span>
                      </Link>
                    </div>
                  </div>
                );
              })}

              {/* أزرار الترقيم */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-6">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    className="p-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#121c38] text-slate-700 dark:text-white disabled:opacity-30 hover:bg-black/5 transition cursor-pointer"
                  >
                    {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  </button>
                  <span className="text-xs font-bold font-mono">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    className="p-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#121c38] text-slate-700 dark:text-white disabled:opacity-30 hover:bg-black/5 transition cursor-pointer"
                  >
                    {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}