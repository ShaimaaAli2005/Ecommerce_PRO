import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  TrendingUp,
  DollarSign,
  Package,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  ArrowUpRight,
  AlertCircle,
  Calendar,
  Sparkles,
  Zap,
  ArrowRight,
  ArrowLeft,
  Activity,
  Award,
} from "lucide-react";
import orderService from "../../../services/orderService";
import { useSettings } from "../../../context/SettingsContext";

// مكون عرض الصور الفاخر والمحصن ضد أخطاء 404
const EditorialImage = ({ src, alt = "", className = "" }) => {
  const initial = (alt || "L").trim().charAt(0).toUpperCase();

  let resolvedSrc = src;
  if (Array.isArray(src) && src.length > 0) {
    resolvedSrc = src[0]?.url || src[0];
  } else if (typeof src === "object" && src !== null) {
    resolvedSrc = src.url || src.secure_url || "";
  }

  const isBrokenOrOldCloudinary =
    !resolvedSrc ||
    typeof resolvedSrc !== "string" ||
    resolvedSrc.includes("cloudinary.com/dvaos6oyh");

  const [hasError, setHasError] = useState(isBrokenOrOldCloudinary);

  if (hasError || isBrokenOrOldCloudinary) {
    return (
      <div
        className={`bg-gradient-to-br from-[#0B132B]/10 via-[#E89A5B]/15 to-[#0B132B]/20 dark:from-white/5 dark:to-[#E89A5B]/20 flex items-center justify-center font-black text-[#0B132B] dark:text-[#E89A5B] shrink-0 select-none border border-black/5 dark:border-white/5 ${className}`}
        title={alt}
      >
        <span>{initial}</span>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden shrink-0 relative group bg-slate-100 dark:bg-slate-900 border border-black/5 dark:border-white/5 ${className}`}>
      <img
        src={resolvedSrc}
        alt={alt}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        loading="lazy"
      />
    </div>
  );
};

export const DashboardOverview = () => {
  const { currencyLabel, formatPrice, formatDigits } = useSettings();
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const res = await orderService.getDashboardStats();
      const dashboardPayload = res?.dashboard || res?.data || res;
      setData(dashboardPayload);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(t("admin.orders_page.no_matching_desc"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const orders = data?.orders || {};
  const revenue = data?.revenue || {};
  const recentOrders = data?.recentOrders || [];
  const topProducts = data?.topProducts || [];
  const rawDailyRevenue = data?.dailyRevenue || [];
  const totalCustomers = data?.totalCustomers || 0;

  // مؤشرات أداء إضافية
  const averageOrderValue = useMemo(() => {
    if (!orders.total || orders.total === 0) return 0;
    return (revenue.total || 0) / orders.total;
  }, [orders.total, revenue.total]);

  const fulfillmentRate = useMemo(() => {
    if (!orders.total || orders.total === 0) return 0;
    return Math.round(((orders.delivered || 0) / orders.total) * 100);
  }, [orders.total, orders.delivered]);

  // بناء أسبوع مالي متكامل من 7 أيام
  const normalizedWeeklyData = useMemo(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const found = rawDailyRevenue.find((item) => item._id === dateStr);
      
      days.push({
        date: dateStr,
        dayLabel: d.toLocaleDateString(isRtl ? "ar-EG" : "en-US", { weekday: "short" }),
        revenue: found ? found.revenue : 0,
        orders: found ? found.orders : 0,
      });
    }
    return days;
  }, [rawDailyRevenue, isRtl]);

  const maxRevenueValue = useMemo(() => {
    return Math.max(...normalizedWeeklyData.map((d) => d.revenue), 1000);
  }, [normalizedWeeklyData]);

  // شارات الحالات المتوافقة عبر ملف الترجمة
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

  const displayedOrders = recentOrders.filter((ord) => {
    if (activeTab === "pending") return ord.status === "pending";
    if (activeTab === "processing") return ord.status === "processing" || ord.status === "confirmed";
    if (activeTab === "delivered") return ord.status === "delivered";
    return true;
  });

  return (
    <div className="space-y-8 pb-12 selection:bg-[#E89A5B]/20 selection:text-[#0B132B]" dir={isRtl ? "rtl" : "ltr"}>
      
      {/* ─── Hero Executive Header ─── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0B132B] via-[#111A38] to-[#1C2541] p-8 sm:p-10 text-white shadow-2xl border border-white/10">
        <div className="absolute -top-24 -end-24 w-96 h-96 bg-[#E89A5B]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -start-24 w-80 h-80 bg-sky-500/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-[#E89A5B]/20 text-[#E89A5B] border border-[#E89A5B]/30 flex items-center gap-2 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t("admin.dashboard_page.badge")}</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs text-white/70 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>{t("admin.dashboard_page.live_sync")}</span>
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-['Poppins',sans-serif]">
              {t("admin.dashboard_page.title")}
            </h1>
            <p className="text-sm sm:text-base text-white/70 max-w-2xl font-normal leading-relaxed">
              {t("admin.dashboard_page.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center shrink-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all backdrop-blur-md cursor-pointer shadow-lg active:scale-95"
              title={t("common.retry")}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#E89A5B]" : ""}`} />
            </button>

            <Link
              to="/admin/products/add"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#E89A5B] to-[#F1B382] hover:brightness-105 text-[#0B132B] text-xs font-black tracking-wide uppercase shadow-[0_10px_25px_-5px_rgba(232,154,91,0.4)] flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t("admin.products_management.add_new")}</span>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ─── Bento Grid: Core KPI Metrics ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* إجمالي الإيرادات */}
        <div className="group relative overflow-hidden rounded-3xl bg-white dark:bg-[#121B35] p-7 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary-muted">
              {t("admin.kpi.total_revenue")}
            </span>
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-transform group-hover:scale-110">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <p className="text-3xl font-black text-[#0B132B] dark:text-white tracking-tight font-['Poppins',sans-serif]">
              {formatPrice(revenue.total, true)}
            </p>
            <span className="text-xs font-bold text-secondary-muted">
              {currencyLabel}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-bold">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 border border-emerald-500/20 font-['Poppins',sans-serif]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{formatDigits(revenue.growthPercent)}%</span>
            </span>
            <span className="text-secondary-muted font-medium">
              {t("admin.kpi.growth_vs_last_month")}
            </span>
          </div>
        </div>

        {/* مبيعات الشهر الحالي */}
        <div className="group relative overflow-hidden rounded-3xl bg-white dark:bg-[#121B35] p-7 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary-muted">
              {t("admin.kpi.current_month_sales")}
            </span>
            <div className="w-11 h-11 rounded-2xl bg-[#E89A5B]/15 text-[#E89A5B] flex items-center justify-center transition-transform group-hover:scale-110">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <p className="text-3xl font-black text-[#0B132B] dark:text-[#E89A5B] tracking-tight font-['Poppins',sans-serif]">
              {formatPrice(revenue.thisMonth, true)}
            </p>
            <span className="text-xs font-bold text-secondary-muted">
              {currencyLabel}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-secondary-muted">
            <span>{t("admin.kpi.last_month")}</span>
            <span className="font-bold text-[#0B132B] dark:text-white font-['Poppins',sans-serif]">
              {formatPrice(revenue.lastMonth, true)} {currencyLabel}
            </span>
          </div>
        </div>

        {/* حجم الطلبات */}
        <div className="group relative overflow-hidden rounded-3xl bg-white dark:bg-[#121B35] p-7 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary-muted">
              {t("admin.kpi.total_orders")}
            </span>
            <div className="w-11 h-11 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center transition-transform group-hover:scale-110">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-[#0B132B] dark:text-white tracking-tight font-['Poppins',sans-serif]">
              {formatDigits(orders.total)}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              <span className="font-['Poppins',sans-serif]">{formatDigits(orders.delivered)}</span> {t("status.delivered")}
            </span>
          </div>
        </div>

        {/* مجتمع العملاء */}
        <div className="group relative overflow-hidden rounded-3xl bg-white dark:bg-[#121B35] p-7 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary-muted">
              {t("admin.kpi.client_base")}
            </span>
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-transform group-hover:scale-110">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-[#0B132B] dark:text-white tracking-tight font-['Poppins',sans-serif]">
              {formatDigits(totalCustomers)}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>
              <span className="font-['Poppins',sans-serif]">{formatDigits(orders.pending)}</span> {t("admin.kpi.pending_review")}
            </span>
          </div>
        </div>

      </div>

      {/* ─── Executive Operational Strip ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-3xl bg-white dark:bg-[#121B35] p-6 border border-black/5 dark:border-white/5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-secondary-muted">
                {t("admin.kpi.delivery_success_rate")}
              </span>
              <p className="text-xl font-black text-[#0B132B] dark:text-white mt-0.5 font-['Poppins',sans-serif]">
                {formatDigits(fulfillmentRate)}%
              </p>
            </div>
          </div>
          <div className="w-28 bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden">
            <div
              style={{ width: `${fulfillmentRate}%` }}
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
            />
          </div>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#121B35] p-6 border border-black/5 dark:border-white/5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E89A5B]/15 text-[#E89A5B] flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-secondary-muted">
                {t("admin.kpi.average_order_value")}
              </span>
              <p className="text-xl font-black text-[#0B132B] dark:text-white mt-0.5 font-['Poppins',sans-serif]">
                {formatPrice(averageOrderValue, true)} <span className="text-xs font-normal text-secondary-muted">{currencyLabel}</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {t("admin.kpi.optimal_return")}
          </span>
        </div>
      </div>

      {/* ─── Visual Velocity & Breakdown ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* مخطط حركة الأيام السبعة */}
        <div className="lg:col-span-2 rounded-[2rem] bg-white dark:bg-[#121B35] p-8 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between space-y-8">
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#0B132B] dark:text-white font-['Poppins',sans-serif]">
                {t("admin.dashboard_page.weekly_pulse_title")}
              </h3>
              <p className="text-xs text-secondary-muted mt-1">
                {t("admin.dashboard_page.weekly_pulse_subtitle")}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-secondary-muted">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="grid grid-cols-7 gap-3 items-end min-h-[200px] pt-4">
            {normalizedWeeklyData.map((d, idx) => {
              const barHeight = Math.max(Math.round((d.revenue / maxRevenueValue) * 100), 8);

              return (
                <div key={idx} className="flex flex-col items-center gap-2.5 group">
                  <span className="text-[11px] font-bold text-[#0B132B] dark:text-[#E89A5B] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-['Poppins',sans-serif]">
                    {formatPrice(d.revenue, true)}
                  </span>
                  <div className="w-full bg-[#FAFAFA] dark:bg-slate-900/80 rounded-2xl h-44 flex items-end p-1.5 border border-black/5 dark:border-white/5">
                    <div
                      style={{ height: `${barHeight}%` }}
                      className="w-full bg-gradient-to-t from-[#0B132B] via-[#1A264F] to-[#E89A5B] rounded-xl transition-all duration-700 ease-out group-hover:brightness-125"
                    />
                  </div>
                  <span className="text-xs font-bold text-secondary-muted group-hover:text-[#0B132B] dark:group-hover:text-white transition-colors">
                    {d.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* مؤشرات دورة التجهيز (Fulfillment Stages) */}
        <div className="rounded-[2rem] bg-white dark:bg-[#121B35] p-8 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
          <div className="border-b border-black/5 dark:border-white/5 pb-4">
            <h3 className="text-lg font-bold text-[#0B132B] dark:text-white font-['Poppins',sans-serif]">
              {t("admin.dashboard_page.fulfillment_stages_title")}
            </h3>
            <p className="text-xs text-secondary-muted mt-1">
              {t("admin.dashboard_page.fulfillment_stages_subtitle")}
            </p>
          </div>

          <div className="space-y-4 pt-1">
            {[
              { key: "pending", label: t("admin.orders_page.pending_tab"), color: "bg-amber-400", count: orders.pending || 0 },
              { key: "processing", label: t("admin.orders_page.processing_tab"), color: "bg-[#E89A5B]", count: (orders.processing || 0) + (orders.confirmed || 0) },
              { key: "shipped", label: t("admin.orders_page.shipped_tab"), color: "bg-sky-500", count: orders.shipped || 0 },
              { key: "delivered", label: t("admin.orders_page.delivered_tab"), color: "bg-emerald-500", count: orders.delivered || 0 },
              { key: "cancelled", label: t("admin.orders_page.cancelled_tab"), color: "bg-rose-500", count: orders.cancelled || 0 },
            ].map((st) => {
              const percent = orders.total > 0 ? Math.round((st.count / orders.total) * 100) : 0;
              return (
                <div key={st.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0B132B] dark:text-white flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${st.color}`}></span>
                      {st.label}
                    </span>
                    <span className="text-secondary-muted font-bold font-['Poppins',sans-serif]">
                      {formatDigits(st.count)} <span className="text-[11px] font-normal">({formatDigits(percent)}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-[#FAFAFA] dark:bg-slate-900 rounded-full h-2 overflow-hidden border border-black/5 dark:border-white/5">
                    <div style={{ width: `${percent}%` }} className={`h-full ${st.color} transition-all duration-700`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ─── Action Center: Inbound Orders & Curated Bestsellers ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* جدول أحدث الطلبات */}
        <div className="lg:col-span-2 rounded-[2rem] bg-white dark:bg-[#121B35] border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col justify-between">
          <div className="p-7 border-b border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#0B132B] dark:text-white font-['Poppins',sans-serif]">
                {t("admin.dashboard_page.live_dispatch_title")}
              </h3>
              <p className="text-xs text-secondary-muted mt-0.5">
                {t("admin.dashboard_page.live_dispatch_subtitle")}
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-[#FAFAFA] dark:bg-slate-900/90 rounded-2xl border border-black/5 dark:border-white/5">
              {[
                { id: "all", label: t("admin.dashboard_page.all_tab") },
                { id: "pending", label: t("admin.dashboard_page.pending_tab") },
                { id: "processing", label: t("admin.dashboard_page.prep_tab") },
                { id: "delivered", label: t("admin.dashboard_page.completed_tab") },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] shadow-md"
                      : "text-secondary-muted hover:text-[#0B132B] dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-start text-xs">
              <thead className="bg-[#FAFAFA] dark:bg-slate-900/40 text-[10px] uppercase font-bold text-secondary-muted border-b border-black/5 dark:border-white/5">
                <tr>
                  <th className="px-6 py-4 text-start">{t("admin.dashboard_page.reference_th")}</th>
                  <th className="px-6 py-4 text-start">{t("admin.dashboard_page.destination_th")}</th>
                  <th className="px-6 py-4 text-start">{t("admin.dashboard_page.amount_th")}</th>
                  <th className="px-6 py-4 text-start">{t("admin.dashboard_page.state_th")}</th>
                  <th className="px-6 py-4 text-end">{t("admin.dashboard_page.inspect_th")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {displayedOrders.length > 0 ? (
                  displayedOrders.slice(0, 5).map((ord) => {
                    const visuals = getStatusVisuals(ord.status);
                    return (
                      <tr key={ord._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="px-6 py-4.5 font-mono font-bold text-[#0B132B] dark:text-white">
                          #{ord._id?.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-6 py-4.5">
                          <p className="font-bold text-[#0B132B] dark:text-white">
                            {ord.shippingAddress?.fullName || ord.user?.username || t("common.guest_client")}
                          </p>
                          <p className="text-[10px] text-secondary-muted mt-0.5">
                            {ord.shippingAddress?.city || "Cairo"}, {ord.shippingAddress?.country || "Egypt"}
                          </p>
                        </td>
                        <td className="px-6 py-4.5 font-bold text-[#0B132B] dark:text-[#E89A5B] font-['Poppins',sans-serif]">
                          {formatPrice(ord.totalPrice, true)}{" "}
                          <span className="text-[10px] font-normal text-secondary-muted">{currencyLabel}</span>
                        </td>
                        <td className="px-6 py-4.5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${visuals.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${visuals.dot}`} />
                            <span>{visuals.label}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-end">
                          <Link
                            to={`/admin/orders/${ord._id}`}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#0B132B] hover:text-white dark:hover:bg-[#E89A5B] dark:hover:text-[#0B132B] text-secondary-muted transition-all inline-block shadow-sm cursor-pointer"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-14 text-center text-secondary-muted">
                      {t("admin.orders_page.no_matching")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-black/5 dark:border-white/5 bg-[#FAFAFA]/50 dark:bg-slate-900/30 flex justify-end">
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-[#0B132B] dark:text-[#E89A5B] hover:underline flex items-center gap-1"
            >
              <span>{t("admin.dashboard_page.manage_all_orders")}</span>
              {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </Link>
          </div>
        </div>

        {/* المجموعة الأكثر طلباً (Curated Bestsellers) */}
        <div className="rounded-[2rem] bg-white dark:bg-[#121B35] p-8 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#0B132B] dark:text-white font-['Poppins',sans-serif]">
                {t("admin.dashboard_page.bestsellers_title")}
              </h3>
              <p className="text-xs text-secondary-muted mt-0.5">
                {t("admin.dashboard_page.bestsellers_subtitle")}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#E89A5B]/15 text-[#E89A5B] font-['Poppins',sans-serif]">
              {t("admin.dashboard_page.top_5")}
            </span>
          </div>

          <div className="space-y-3.5">
            {topProducts.length > 0 ? (
              topProducts.slice(0, 5).map((prod, idx) => {
                const productImg =
                  prod?.image ||
                  prod?.images?.[0]?.url ||
                  prod?.images?.[0] ||
                  prod?.coverImage;

                return (
                  <div
                    key={prod._id || idx}
                    className="flex items-center justify-between gap-3.5 p-3.5 rounded-2xl bg-[#FAFAFA] dark:bg-slate-900/60 border border-black/5 dark:border-white/5 hover:border-[#E89A5B]/40 transition-all group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <EditorialImage
                        src={productImg}
                        alt={prod.name}
                        className="w-12 h-12 rounded-2xl shadow-sm"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#0B132B] dark:text-white truncate group-hover:text-[#E89A5B] transition-colors">
                          {prod.name}
                        </p>
                        <p className="text-[11px] text-secondary-muted mt-0.5 font-['Poppins',sans-serif]">
                          {formatDigits(prod.totalSold || 0)} {t("admin.dashboard_page.units_dispatched")}
                        </p>
                      </div>
                    </div>

                    <div className="text-end shrink-0">
                      <span className="text-xs font-black text-[#0B132B] dark:text-[#E89A5B] block font-['Poppins',sans-serif]">
                        {formatPrice(prod.revenue, true)}
                      </span>
                      <span className="text-[10px] text-secondary-muted uppercase">
                        {currencyLabel}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-secondary-muted text-center py-12">
                {t("admin.dashboard_page.no_bestsellers")}
              </p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardOverview;