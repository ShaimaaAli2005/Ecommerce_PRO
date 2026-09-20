import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Package,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  Truck,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  ArrowUpRight,
  MapPin,
  Calendar,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import api from "../../../api/axiosInstance";
import { useSettings } from "../../../context/SettingsContext";

// مستخرج فائق الدقة لروابط صور عناصر الطلب
const extractThumbUrl = (it) => {
  if (!it) return null;
  if (typeof it.image === "string" && it.image.trim()) return it.image;
  if (it.image?.url) return it.image.url;
  if (typeof it.product?.image === "string" && it.product.image.trim()) return it.product.image;
  if (it.product?.image?.url) return it.product.image.url;
  if (Array.isArray(it.product?.images) && it.product.images.length > 0) {
    const first = it.product.images[0];
    return typeof first === "string" ? first : first?.url;
  }
  return null;
};

// مكون عرض الصور المصغرة الفاخر والمحصن ضد الانهيار
const EditorialThumb = ({ src, alt = "", className = "" }) => {
  const initial = (alt || "L").trim().charAt(0).toUpperCase();
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`bg-gradient-to-br from-[#0B132B]/10 via-[#E89A5B]/15 to-[#0B132B]/20 dark:from-white/5 dark:to-[#E89A5B]/20 flex items-center justify-center font-black text-[#0B132B] dark:text-[#E89A5B] shrink-0 select-none border border-black/5 dark:border-white/5 ${className}`}
        title={alt}
      >
        <span className="font-['Poppins',sans-serif] text-[10px]">{initial}</span>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden shrink-0 relative group bg-slate-100 dark:bg-slate-900 border border-black/5 dark:border-white/5 ${className}`}>
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
    </div>
  );
};

export const AdminOrdersPage = () => {
  const { currencyLabel, formatPrice, formatDigits } = useSettings();
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // حالات الفلترة والبحث
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // الترقيم
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchOrders = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get("/orders/admin");
      const list =
        res.data?.orders ||
        res.data?.data ||
        (Array.isArray(res.data) ? res.data : []);
      setOrders(list);
    } catch (err) {
      console.error("Failed to load admin orders:", err);
      setError(t("admin.orders_page.no_matching_desc"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  // شارات الحالات وتسمياتها عبر ملف الترجمة
  const getStatusVisuals = (status) => {
    const normalized = (status || "").toLowerCase();
    switch (normalized) {
      case "delivered":
        return {
          label: t("status.delivered"),
          dot: "bg-emerald-500",
          badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        };
      case "shipped":
        return {
          label: t("status.shipped"),
          dot: "bg-sky-500",
          badge: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
        };
      case "processing":
      case "confirmed":
        return {
          label: t("status.processing"),
          dot: "bg-[#E89A5B] animate-pulse",
          badge: "bg-[#E89A5B]/15 text-[#E89A5B] border-[#E89A5B]/30",
        };
      case "pending":
        return {
          label: t("status.pending"),
          dot: "bg-amber-400",
          badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        };
      default:
        return {
          label: t("status.cancelled"),
          dot: "bg-rose-400",
          badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        };
    }
  };

  // ─── ذكاء الأعمال والتحليلات المشتقة من الطلبات ───
  const analytics = useMemo(() => {
    let totalVolume = 0;
    let paidVolume = 0;
    let pendingCODVolume = 0;

    let pendingCount = 0;
    let processingCount = 0;
    let inTransitCount = 0;
    let deliveredCount = 0;
    let cancelledCount = 0;

    const clientMap = new Map();

    orders.forEach((o) => {
      const price = Number(o.totalPrice) || 0;
      totalVolume += price;

      if (o.paymentStatus === "paid") {
        paidVolume += price;
      } else {
        pendingCODVolume += price;
      }

      if (o.status === "pending") pendingCount++;
      else if (o.status === "processing" || o.status === "confirmed") processingCount++;
      else if (o.status === "shipped") inTransitCount++;
      else if (o.status === "delivered") deliveredCount++;
      else if (o.status === "cancelled") cancelledCount++;

      const clientIdentifier =
        o.shippingAddress?.fullName ||
        o.user?.name ||
        o.user?.username ||
        t("common.guest_client");
      const clientEmail = o.user?.email || o.shippingAddress?.phone || "";

      if (!clientMap.has(clientIdentifier)) {
        clientMap.set(clientIdentifier, {
          name: clientIdentifier,
          contact: clientEmail,
          ordersCount: 0,
          totalSpent: 0,
          city: o.shippingAddress?.city || "Cairo",
        });
      }
      const cData = clientMap.get(clientIdentifier);
      cData.ordersCount += 1;
      cData.totalSpent += price;
    });

    const topClients = Array.from(clientMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 4);

    const collectionRate = totalVolume > 0 ? Math.round((paidVolume / totalVolume) * 100) : 0;
    const deliveryRate = orders.length > 0 ? Math.round((deliveredCount / orders.length) * 100) : 0;

    return {
      totalOrders: orders.length,
      totalVolume,
      paidVolume,
      pendingCODVolume,
      collectionRate,
      deliveryRate,
      pendingCount,
      processingCount,
      inTransitCount,
      deliveredCount,
      cancelledCount,
      topClients,
    };
  }, [orders, t]);

  // التصفية والبحث
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderId = (order._id || "").toLowerCase();
      const customerName = (
        order.shippingAddress?.fullName ||
        order.user?.name ||
        order.user?.username ||
        ""
      ).toLowerCase();
      const city = (order.shippingAddress?.city || "").toLowerCase();
      const phone = (order.shippingAddress?.phone || "").toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !query ||
        orderId.includes(query) ||
        customerName.includes(query) ||
        city.includes(query) ||
        phone.includes(query);

      let matchesStatus = true;
      if (statusFilter === "pending") matchesStatus = order.status === "pending";
      if (statusFilter === "processing")
        matchesStatus = order.status === "processing" || order.status === "confirmed";
      if (statusFilter === "shipped") matchesStatus = order.status === "shipped";
      if (statusFilter === "delivered") matchesStatus = order.status === "delivered";
      if (statusFilter === "cancelled") matchesStatus = order.status === "cancelled";

      let matchesPayment = true;
      if (paymentFilter === "paid") matchesPayment = order.paymentStatus === "paid";
      if (paymentFilter === "pending") matchesPayment = order.paymentStatus === "pending";

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, searchQuery, statusFilter, paymentFilter]);

  // الترقيم
  const totalPages = Math.max(Math.ceil(filteredOrders.length / itemsPerPage), 1);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  return (
    <div
      className="space-y-8 pb-12 selection:bg-[#E89A5B]/20 selection:text-[#0B132B]"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* ─── Hero Executive Header ─── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0B132B] via-[#111A38] to-[#1C2541] p-8 sm:p-10 text-white shadow-2xl border border-white/10">
        <div className="absolute -top-24 -end-24 w-96 h-96 bg-[#E89A5B]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -start-24 w-80 h-80 bg-sky-500/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-[#E89A5B]/20 text-[#E89A5B] border border-[#E89A5B]/30 flex items-center gap-2 backdrop-blur-md">
                <Truck className="w-3.5 h-3.5" />
                <span>{t("admin.orders_page.badge")}</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white/90 border border-white/10">
                <span className="font-['Poppins',sans-serif]">
                  {formatDigits(analytics.totalOrders)}
                </span>{" "}
                {t("admin.carts_page.logged_carts")}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-['Poppins',sans-serif]">
              {t("admin.orders_page.title")}
            </h1>
            <p className="text-sm sm:text-base text-white/70 max-w-2xl font-normal leading-relaxed">
              {t("admin.orders_page.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center shrink-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all backdrop-blur-md cursor-pointer shadow-lg active:scale-95"
              title={t("common.retry")}
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin text-[#E89A5B]" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ─── Fulfillment Telemetry Bento Strip ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-3xl bg-white dark:bg-[#121B35] p-6 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary-muted">
              {t("admin.orders_page.total_volume")}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-[#0B132B] dark:text-white tracking-tight font-['Poppins',sans-serif]">
              {formatPrice(analytics.totalVolume, true)}
            </p>
            <span className="text-xs font-bold text-secondary-muted">{currencyLabel}</span>
          </div>
          <p className="text-xs text-secondary-muted">
            {t("admin.orders_page.total_volume_desc")}
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#121B35] p-6 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary-muted">
              {t("admin.orders_page.requires_action")}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight font-['Poppins',sans-serif]">
            {formatDigits(analytics.pendingCount + analytics.processingCount)}
          </p>
          <p className="text-xs text-secondary-muted">
            {formatDigits(analytics.pendingCount)} {t("admin.orders_page.pending_tab")} • {formatDigits(analytics.processingCount)} {t("admin.orders_page.processing_tab")}
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#121B35] p-6 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary-muted">
              {t("admin.orders_page.in_transit")}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#0B132B] dark:text-white tracking-tight font-['Poppins',sans-serif]">
            {formatDigits(analytics.inTransitCount)}
          </p>
          <p className="text-xs text-sky-600 dark:text-sky-400 font-bold">
            {t("admin.orders_page.in_transit_desc")}
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#121B35] p-6 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary-muted">
              {t("admin.orders_page.delivered")}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#E89A5B]/15 text-[#E89A5B] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#0B132B] dark:text-[#E89A5B] tracking-tight font-['Poppins',sans-serif]">
            {formatDigits(analytics.deliveredCount)}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold font-['Poppins',sans-serif]">
            {formatDigits(analytics.deliveryRate)}% {t("admin.orders_page.fulfillment_rate")}
          </p>
        </div>
      </div>

      {/* ─── قسم التحليلات المالية والمقارنة ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* مخطط مقارنة السيولة المحصلة بالمعلقة */}
        <div className="lg:col-span-2 rounded-[2rem] bg-white dark:bg-[#121B35] p-8 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#0B132B] dark:text-white font-['Poppins',sans-serif]">
                {t("admin.orders_page.liquidity_title")}
              </h3>
              <p className="text-xs text-secondary-muted mt-1">
                {t("admin.orders_page.liquidity_desc")}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-secondary-muted">
              <BarChart3 className="w-5 h-5 text-[#E89A5B]" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* بطاقة المبالغ المحصلة */}
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t("admin.orders_page.settled_cash")}</span>
                </span>
                <span className="text-xs font-black text-emerald-600 font-['Poppins',sans-serif]">
                  {formatDigits(analytics.collectionRate)}%
                </span>
              </div>
              <p className="text-2xl font-black text-[#0B132B] dark:text-white font-['Poppins',sans-serif]">
                {formatPrice(analytics.paidVolume, true)}{" "}
                <span className="text-xs font-normal text-secondary-muted">{currencyLabel}</span>
              </p>
              <div className="w-full bg-emerald-500/20 rounded-full h-2 overflow-hidden mt-2">
                <div
                  style={{ width: `${analytics.collectionRate}%` }}
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                />
              </div>
            </div>

            {/* بطاقة المبالغ المعلقة */}
            <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{t("admin.orders_page.pending_cod")}</span>
                </span>
                <span className="text-xs font-black text-amber-600 font-['Poppins',sans-serif]">
                  {formatDigits(100 - analytics.collectionRate)}%
                </span>
              </div>
              <p className="text-2xl font-black text-[#0B132B] dark:text-white font-['Poppins',sans-serif]">
                {formatPrice(analytics.pendingCODVolume, true)}{" "}
                <span className="text-xs font-normal text-secondary-muted">{currencyLabel}</span>
              </p>
              <div className="w-full bg-amber-500/20 rounded-full h-2 overflow-hidden mt-2">
                <div
                  style={{ width: `${100 - analytics.collectionRate}%` }}
                  className="h-full bg-amber-500 rounded-full transition-all duration-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* قائمة كبار العملاء طلباً وإنفاقاً */}
        <div className="rounded-[2rem] bg-white dark:bg-[#121B35] p-8 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#0B132B] dark:text-white font-['Poppins',sans-serif]">
                {t("admin.orders_page.top_clients_title")}
              </h3>
              <p className="text-xs text-secondary-muted mt-0.5">
                {t("admin.orders_page.top_clients_subtitle")}
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#E89A5B]/15 text-[#E89A5B] flex items-center justify-center font-bold">
              ★
            </div>
          </div>

          <div className="space-y-3.5">
            {analytics.topClients.length > 0 ? (
              analytics.topClients.map((client, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#FAFAFA] dark:bg-slate-900/60 border border-black/5 dark:border-white/5 hover:border-[#E89A5B]/40 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B132B] to-[#1E294B] text-white flex items-center justify-center font-black text-xs shrink-0 font-['Poppins',sans-serif]">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0B132B] dark:text-white truncate">
                        {client.name}
                      </p>
                      <p className="text-[10px] text-secondary-muted mt-0.5 font-['Poppins',sans-serif]">
                        {client.city} • {formatDigits(client.ordersCount)} {t("admin.carts_page.logged_carts")}
                      </p>
                    </div>
                  </div>

                  <div className="text-end shrink-0">
                    <span className="text-xs font-black text-[#0B132B] dark:text-[#E89A5B] block font-['Poppins',sans-serif]">
                      {formatPrice(client.totalSpent, true)}
                    </span>
                    <span className="text-[9px] text-secondary-muted uppercase">
                      {currencyLabel}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-secondary-muted text-center py-8">
                {t("admin.orders_page.no_clients")}
              </p>
            )}
          </div>
        </div>

      </div>

      {/* ─── Control Bar: Pipeline Tabs & Filters ─── */}
      <div className="rounded-3xl bg-white dark:bg-[#121B35] p-5 border border-black/5 dark:border-white/5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute start-4 top-1/2 -translate-y-1/2 text-secondary-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t("admin.orders_page.search_placeholder")}
              className="w-full ps-11 pe-4 py-2.5 text-sm rounded-2xl border border-black/5 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white outline-none focus:ring-2 focus:ring-[#0B132B] dark:focus:ring-[#E89A5B]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 text-xs font-bold rounded-2xl border border-black/5 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white outline-none cursor-pointer"
            >
              <option value="all">{t("admin.orders_page.all_payments")}</option>
              <option value="paid">{t("admin.orders_page.paid_status")}</option>
              <option value="pending">{t("admin.orders_page.cod_status")}</option>
            </select>
          </div>
        </div>

        {/* أزرار مسار الحالات السريع Pipeline Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-black/5 dark:border-white/5 overflow-x-auto">
          {[
            { id: "all", label: t("admin.orders_page.all_orders_tab"), count: analytics.totalOrders },
            { id: "pending", label: t("admin.orders_page.pending_tab"), count: analytics.pendingCount },
            { id: "processing", label: t("admin.orders_page.processing_tab"), count: analytics.processingCount },
            { id: "shipped", label: t("admin.orders_page.shipped_tab"), count: analytics.inTransitCount },
            { id: "delivered", label: t("admin.orders_page.delivered_tab"), count: analytics.deliveredCount },
            { id: "cancelled", label: t("admin.orders_page.cancelled_tab"), count: analytics.cancelledCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] shadow-md"
                  : "bg-slate-50 dark:bg-slate-900 text-secondary-muted hover:text-[#0B132B] dark:hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] opacity-75 font-['Poppins',sans-serif]">
                ({formatDigits(tab.count)})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Orders Main Data Table ─── */}
      {loading ? (
        <div className="rounded-3xl bg-white dark:bg-[#121B35] p-16 text-center border border-black/5 dark:border-white/5 animate-pulse space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 mx-auto" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mx-auto" />
        </div>
      ) : paginatedOrders.length > 0 ? (
        <div className="rounded-[2rem] bg-white dark:bg-[#121B35] border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-[#FAFAFA] dark:bg-slate-900/40 text-[10px] uppercase font-bold text-secondary-muted border-b border-black/5 dark:border-white/5">
                <tr>
                  <th className="px-6 py-4 text-start">{t("admin.orders_page.th_reference")}</th>
                  <th className="px-6 py-4 text-start">{t("admin.orders_page.th_customer")}</th>
                  <th className="px-6 py-4 text-start">{t("admin.orders_page.th_items")}</th>
                  <th className="px-6 py-4 text-start">{t("admin.orders_page.th_amount")}</th>
                  <th className="px-6 py-4 text-start">{t("admin.orders_page.th_state")}</th>
                  <th className="px-6 py-4 text-end">{t("admin.orders_page.th_actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {paginatedOrders.map((order) => {
                  const visuals = getStatusVisuals(order.status);
                  const items = order.items || [];
                  const clientName =
                    order.shippingAddress?.fullName ||
                    order.user?.name ||
                    order.user?.username ||
                    t("common.guest_client");
                  const dateStr = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString(
                        isRtl ? "ar-EG" : "en-US",
                        { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                      )
                    : "";

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors group"
                    >
                      {/* رقم الطلب والتاريخ */}
                      <td className="px-6 py-4">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="font-mono font-black text-sm text-[#0B132B] dark:text-white hover:text-[#E89A5B] transition-colors block"
                        >
                          #{order._id?.slice(-6).toUpperCase()}
                        </Link>
                        <span className="text-[10px] text-secondary-muted flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 opacity-60" />
                          <span>{dateStr}</span>
                        </span>
                      </td>

                      {/* العميل والوجهة */}
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm text-[#0B132B] dark:text-white">
                          {clientName}
                        </p>
                        <p className="text-[11px] text-secondary-muted flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 opacity-60 shrink-0" />
                          <span className="truncate max-w-[180px]">
                            {order.shippingAddress?.city || "Cairo"},{" "}
                            {order.shippingAddress?.country || "Egypt"}
                          </span>
                        </p>
                      </td>

                      {/* القطع المطلوبة */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {items.slice(0, 3).map((it, idx) => (
                            <EditorialThumb
                              key={idx}
                              src={extractThumbUrl(it)}
                              alt={it.name}
                              className="w-8 h-8 rounded-xl shadow-xs"
                            />
                          ))}
                          {items.length > 3 && (
                            <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-secondary-muted font-['Poppins',sans-serif]">
                              +{formatDigits(items.length - 3)}
                            </span>
                          )}
                          <span className="ms-2 text-xs font-semibold text-secondary-muted">
                            <span className="font-['Poppins',sans-serif]">{formatDigits(items.length)}</span> {t("common.items")}
                          </span>
                        </div>
                      </td>

                      {/* المبلغ والدفع */}
                      <td className="px-6 py-4">
                        <p className="font-black text-sm text-[#0B132B] dark:text-[#E89A5B] font-['Poppins',sans-serif]">
                          {formatPrice(order.totalPrice, true)}{" "}
                          <span className="text-[10px] font-normal text-secondary-muted">{currencyLabel}</span>
                        </p>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold mt-0.5 ${
                            order.paymentStatus === "paid"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {order.paymentStatus === "paid"
                            ? t("admin.orders_page.paid_status")
                            : t("admin.orders_page.cod_status")}
                        </span>
                      </td>

                      {/* موقف الشحنة */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${visuals.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${visuals.dot}`} />
                          <span>{visuals.label}</span>
                        </span>
                      </td>

                      {/* الإجراءات */}
                      <td className="px-6 py-4 text-end">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#0B132B] hover:text-white dark:hover:bg-[#E89A5B] dark:hover:text-[#0B132B] text-secondary-muted transition-all inline-block shadow-sm cursor-pointer"
                          title={t("admin.orders_page.inspect_tooltip")}
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-[2.5rem] bg-white dark:bg-[#121B35] p-16 text-center border border-black/5 dark:border-white/5 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-secondary-muted">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#0B132B] dark:text-white">
            {t("admin.orders_page.no_matching")}
          </h3>
          <p className="text-xs text-secondary-muted max-w-sm mx-auto">
            {t("admin.orders_page.no_matching_desc")}
          </p>
        </div>
      )}

      {/* ─── Pagination Footer ─── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-black/5 dark:border-white/5">
          <span className="text-xs font-medium text-secondary-muted">
            {t("common.page")} {formatDigits(currentPage)} {t("common.of")} {formatDigits(totalPages)}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage <= 1}
              className="p-2.5 rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#121B35] disabled:opacity-30 hover:border-[#E89A5B] text-[#0B132B] dark:text-white transition-all cursor-pointer"
            >
              {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            <span className="px-3 text-xs font-bold font-['Poppins',sans-serif]">
              {formatDigits(currentPage)} / {formatDigits(totalPages)}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-2.5 rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#121B35] disabled:opacity-30 hover:border-[#E89A5B] text-[#0B132B] dark:text-white transition-all cursor-pointer"
            >
              {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;