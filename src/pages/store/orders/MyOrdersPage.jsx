import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // تم إضافة useNavigate هنا
import { useTranslation } from 'react-i18next';
import { Package, Clock, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import orderService from '../../../services/orderService';
import toast from 'react-hot-toast';

export default function MyOrdersPage() {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const navigate = useNavigate(); // تفعيل التوجيه

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // التحقق من تسجيل الدخول عند تحميل الصفحة
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error(isRtl ? 'يرجى تسجيل الدخول لعرض طلباتك' : 'Please sign in to view your orders');
      navigate('/login');
    }
  }, [navigate, isRtl]);

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const res = await orderService.getMyOrders(page, 10, statusFilter);
      if (res && res.success) {
        setOrders(res.orders || []);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      toast.error(isRtl ? 'تعذر جلب قائمة الطلبات' : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, isRtl]);

  useEffect(() => {
    fetchOrders();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchOrders]);

  const getStatusBadge = (status) => {
    const st = status?.toLowerCase();
    switch (st) {
      case 'confirmed':
      case 'processing':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[11px] font-bold uppercase flex items-center gap-1.5 w-fit shadow-xs">
            <Clock className="w-3 h-3" />
            {t(`store.order_status.${st}`, status)}
          </span>
        );
      case 'delivered':
      case 'shipped':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold uppercase flex items-center gap-1.5 w-fit shadow-xs">
            <CheckCircle2 className="w-3 h-3" />
            {t(`store.order_status.${st}`, status)}
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[11px] font-bold uppercase flex items-center gap-1.5 w-fit shadow-xs">
            <XCircle className="w-3 h-3" />
            {t(`store.order_status.${st}`, status)}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 text-[11px] font-bold uppercase w-fit shadow-xs">
            {t('store.order_status.pending', status || 'Pending')}
          </span>
        );
    }
  };

  const filterOptions = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#0F172A] text-slate-900 dark:text-white py-12 px-4 sm:px-6 lg:px-8 font-['Inter'] transition-colors duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* الترويسة العليا */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-gray-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-['Poppins'] text-[#17233C] dark:text-white tracking-tight">
              {t('store.my_orders.title', 'My Orders')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">
              {t('store.my_orders.subtitle', 'Track and manage your past and current store orders.')}
            </p>
          </div>

          {/* فلاتر حالات الطلب */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {filterOptions.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => { setStatusFilter(st); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer shrink-0 shadow-xs ${
                  statusFilter === st 
                    ? 'bg-[#17233C] dark:bg-[#E89A5B] text-white shadow-md scale-105' 
                    : 'bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-700'
                }`}
              >
                {t(`store.order_status_filter.${st}`, st)}
              </button>
            ))}
          </div>
        </div>

        {/* محتوى الصفحة */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-10 h-10 border-4 border-[#17233C] dark:border-[#E89A5B] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-200 dark:border-gray-700 p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-[#E89A5B] flex items-center justify-center mx-auto shadow-inner">
              <Package className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Poppins']">
              {t('store.my_orders.empty_title', 'No orders found')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
              {t('store.my_orders.empty_desc', 'You have not placed any orders yet. Explore our catalog and start shopping.')}
            </p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 bg-[#17233C] hover:bg-[#E89A5B] dark:bg-[#E89A5B] dark:hover:bg-[#d4894d] text-white text-xs font-semibold rounded-xl transition shadow-md cursor-pointer"
            >
              {t('store.cart_page.explore_catalog', 'Explore Catalog')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order._id || order.id}
                className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-200 dark:border-gray-700 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs hover:shadow-md transition-all duration-300"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs font-bold text-[#E89A5B] bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-lg">
                      #{order._id || order.id}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="relative group shrink-0" title={item.name}>
                          <img 
                            src={item.image || 'https://placehold.co/60'} 
                            alt={item.name || 'Product'} 
                            className="w-12 h-12 object-cover rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50"
                          />
                          <span className="absolute -bottom-1 -end-1 bg-[#17233C] dark:bg-[#E89A5B] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                            {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-gray-400">
                    <span>
                      {t('store.my_orders.date', 'Date:')} <strong className="text-slate-700 dark:text-gray-300">{new Date(order.createdAt || Date.now()).toLocaleDateString()}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      {order.items?.length || 0} {t('store.my_orders.items_count', 'items')}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-sm font-bold text-[#E89A5B]">
                      ${Number(order.totalPrice || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-gray-700">
                  <Link
                    to={`/orders/${order._id || order.id}`}
                    className="w-full md:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Eye className="w-4 h-4 text-[#E89A5B]" />
                    <span>{t('store.my_orders.view_details', 'View Details')}</span>
                  </Link>
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-6">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-700 dark:text-white disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
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
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-700 dark:text-white disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
                >
                  {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}