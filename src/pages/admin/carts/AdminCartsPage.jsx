import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ShoppingBag,
  Search,
  RefreshCw,
  DollarSign,
  AlertCircle,
  Tag,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MessageCircle,
  Send,
  SlidersHorizontal,
  Zap,
  Gift,
  X,
  Check,
  Sparkles,
} from "lucide-react";
import api from "../../../api/axiosInstance";
import { useSettings } from "../../../context/SettingsContext";

// مكوّن عرض الصور المحصن ضد 404
const CartProductThumb = ({ src, alt = "" }) => {
  const initial = (alt || "L").trim().charAt(0).toUpperCase();
  const isInvalid = !src || typeof src !== "string" || src.includes("cloudinary.com/dvaos6oyh");
  const [hasError, setHasError] = useState(isInvalid);

  if (hasError || isInvalid) {
    return (
      <div className="w-11 h-11 rounded-xl bg-[#0B132B]/5 dark:bg-white/5 flex items-center justify-center font-bold text-[#0B132B] dark:text-[#E89A5B] shrink-0 border border-black/5 dark:border-white/5 select-none">
        <span className="text-xs font-bold">{initial}</span>
      </div>
    );
  }

  return (
    <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-900 border border-black/5 dark:border-white/5">
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        loading="lazy"
      />
    </div>
  );
};

export const AdminCartsPage = () => {
  const { currencyLabel, formatPrice, formatDigits } = useSettings();
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");

  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // حالات الفلترة والبحث
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("value-desc");

  // الترقيم
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // نافذة كود الخصم التحفيزي
  const [activeIncentiveCart, setActiveIncentiveCart] = useState(null);
  const [couponCode, setCouponCode] = useState("RECOVER15");
  const [copied, setCopied] = useState(false);

  // جلب سلات المشرف
  const fetchCarts = useCallback(async () => {
    try {
      setError(null);
      let list = [];
      try {
        const res = await api.get("/orders/admin/carts");
        list = res.data?.carts || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      } catch (err1) {
        const resAlt = await api.get("/carts/admin");
        list = resAlt.data?.carts || resAlt.data?.data || (Array.isArray(resAlt.data) ? resAlt.data : []);
      }
      setCarts(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Cart fetch error:", err);
      setError(t("admin.carts_page.no_carts"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCarts();
  }, [fetchCarts]);

  const getCouponString = (coupon) => {
    if (!coupon) return null;
    if (typeof coupon === "object") return coupon.code || coupon.name || null;
    return String(coupon);
  };

  const calculateRecoveryScore = (cart) => {
    let score = 50;
    const items = Array.isArray(cart?.items) ? cart.items : [];
    const total = Number(cart?.total || cart?.subtotal) || 0;
    const dateRef = cart?.updatedAt || cart?.createdAt;

    let diffHours = 10;
    if (dateRef) {
      const parsedDate = new Date(dateRef).getTime();
      if (!isNaN(parsedDate)) {
        diffHours = Math.max(0, (Date.now() - parsedDate) / (1000 * 60 * 60));
      }
    }

    if (diffHours < 2) score += 30;
    else if (diffHours < 12) score += 15;
    else if (diffHours > 48) score -= 25;

    if (items.length >= 2) score += 10;
    if (cart?.coupon) score += 10;
    if (total > 1000) score += 5;

    return Math.min(Math.max(score, 15), 98);
  };

  const getHeatInfo = (dateRef) => {
    if (!dateRef) return { label: t("common.status"), badge: "bg-slate-100 text-slate-600" };
    const parsedDate = new Date(dateRef).getTime();
    if (isNaN(parsedDate)) {
      return { label: t("common.status"), badge: "bg-slate-100 text-slate-600" };
    }

    const diffHours = (Date.now() - parsedDate) / (1000 * 60 * 60);

    if (diffHours < 2) {
      return {
        label: t("admin.carts_page.tab_hot"),
        badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        dot: "bg-rose-500 animate-ping",
      };
    } else if (diffHours < 24) {
      return {
        label: t("admin.kpi.current_month_sales"),
        badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        dot: "bg-amber-500",
      };
    }
    return {
      label: t("status.pending"),
      badge: "bg-slate-100 dark:bg-slate-800 text-secondary-muted border-black/5",
      dot: "bg-slate-400",
    };
  };

  const analytics = useMemo(() => {
    let totalTrapped = 0;
    let hotCount = 0;
    let withCoupons = 0;

    carts.forEach((c) => {
      const val = Number(c?.total || c?.subtotal) || 0;
      totalTrapped += val;

      const dateRef = c?.updatedAt || c?.createdAt;
      if (dateRef) {
        const parsed = new Date(dateRef).getTime();
        if (!isNaN(parsed) && (Date.now() - parsed) / (1000 * 60 * 60) < 2) {
          hotCount++;
        }
      }

      if (c?.coupon) withCoupons++;
    });

    const avg = carts.length > 0 ? totalTrapped / carts.length : 0;

    return {
      totalCarts: carts.length,
      totalTrapped,
      avgCart: avg,
      hotCount,
      withCoupons,
    };
  }, [carts]);

  const filteredCarts = useMemo(() => {
    let result = carts.filter((c) => {
      const u = c?.user || {};
      const name = String(u.username || u.name || "").toLowerCase();
      const email = String(u.email || "").toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch = !query || name.includes(query) || email.includes(query);

      let matchesTab = true;
      const dateRef = c?.updatedAt || c?.createdAt;
      let diffHours = 99;
      if (dateRef) {
        const parsed = new Date(dateRef).getTime();
        if (!isNaN(parsed)) diffHours = (Date.now() - parsed) / (1000 * 60 * 60);
      }

      if (activeTab === "hot") matchesTab = diffHours < 2;
      else if (activeTab === "high") matchesTab = (Number(c?.total || c?.subtotal) || 0) >= (analytics.avgCart || 500);
      else if (activeTab === "with-coupon") matchesTab = Boolean(c?.coupon);

      return matchesSearch && matchesTab;
    });

    return result.sort((a, b) => {
      const valA = Number(a?.total || a?.subtotal) || 0;
      const valB = Number(b?.total || b?.subtotal) || 0;
      if (sortBy === "value-desc") return valB - valA;
      if (sortBy === "items-desc") {
        const countA = (a?.items || []).reduce((s, i) => s + (Number(i?.quantity) || 1), 0);
        const countB = (b?.items || []).reduce((s, i) => s + (Number(i?.quantity) || 1), 0);
        return countB - countA;
      }
      return 0;
    });
  }, [carts, searchQuery, activeTab, sortBy, analytics.avgCart]);

  const totalPages = Math.max(Math.ceil(filteredCarts.length / itemsPerPage), 1);
  const paginatedCarts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCarts.slice(start, start + itemsPerPage);
  }, [filteredCarts, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6 pb-16" dir={isRtl ? "rtl" : "ltr"}>
      {/* ─── Hero Header الرأسي الموحد ─── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0B132B] via-[#111A38] to-[#1C2541] p-8 sm:p-10 text-white shadow-2xl border border-white/10">
        <div className="absolute -top-24 -end-24 w-96 h-96 bg-[#E89A5B]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -start-24 w-80 h-80 bg-sky-500/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-[#E89A5B]/20 text-[#E89A5B] border border-[#E89A5B]/30 flex items-center gap-2 backdrop-blur-md">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{t("admin.carts_page.badge")}</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white/90 border border-white/10">
                <span>{formatDigits(analytics.totalCarts)}</span> {t("admin.carts_page.logged_carts")}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-['Poppins',sans-serif]">
              {t("admin.carts_page.title")}
            </h1>
            <p className="text-sm sm:text-base text-white/70 max-w-2xl font-normal leading-relaxed">
              {t("admin.carts_page.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center shrink-0">
            <button
              onClick={() => {
                setRefreshing(true);
                fetchCarts();
              }}
              disabled={refreshing}
              className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all backdrop-blur-md cursor-pointer shadow-lg active:scale-95"
              title={t("admin.carts_page.sync_tooltip")}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#E89A5B]" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── كروت الإحصائيات العلوية ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-3xl bg-white dark:bg-[#121B35] p-6 border border-black/5 dark:border-white/5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-secondary-muted text-xs font-bold">
            <span>{t("admin.carts_page.active_carts_card")}</span>
            <div className="w-8 h-8 rounded-xl bg-[#E89A5B]/15 text-[#E89A5B] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#0B132B] dark:text-white tracking-tight font-['Poppins',sans-serif]">
            {formatDigits(analytics.totalCarts)}
          </p>
          <span className="text-[11px] text-secondary-muted block font-medium">
            {t("admin.carts_page.active_carts_desc")}
          </span>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#121B35] p-6 border border-black/5 dark:border-white/5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-secondary-muted text-xs font-bold">
            <span>{t("admin.carts_page.trapped_revenue_card")}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <p className="text-3xl font-black text-[#0B132B] dark:text-white tracking-tight font-['Poppins',sans-serif]">
              {formatPrice(analytics.totalTrapped, true)}
            </p>
            <span className="text-xs font-bold text-secondary-muted">{currencyLabel}</span>
          </div>
          <span className="text-[11px] text-secondary-muted block font-medium">
            {t("admin.carts_page.trapped_revenue_desc")}
          </span>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#121B35] p-6 border border-black/5 dark:border-white/5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-secondary-muted text-xs font-bold">
            <span>{t("admin.carts_page.avg_basket_card")}</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <p className="text-3xl font-black text-[#0B132B] dark:text-[#E89A5B] tracking-tight font-['Poppins',sans-serif]">
              {formatPrice(analytics.avgCart, true)}
            </p>
            <span className="text-xs font-bold text-secondary-muted">{currencyLabel}</span>
          </div>
          <span className="text-[11px] text-secondary-muted block font-medium">
            {t("admin.carts_page.avg_basket_desc")}
          </span>
        </div>
      </div>

      {/* ─── شريط التحكم والبحث ─── */}
      <div className="rounded-2xl bg-white dark:bg-[#121B35] p-4 border border-black/5 dark:border-white/5 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-secondary-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t("admin.carts_page.search_placeholder")}
              className="w-full ps-10 pe-4 py-2 text-xs sm:text-sm rounded-xl bg-[#FAFAFA] dark:bg-slate-900/60 border border-black/5 dark:border-white/5 text-[#0B132B] dark:text-white outline-none focus:border-[#E89A5B]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1.5 text-xs text-secondary-muted font-bold">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 text-xs font-bold rounded-xl border border-black/5 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white outline-none cursor-pointer"
              >
                <option value="value-desc">{t("admin.carts_page.sort_highest_val")}</option>
                <option value="items-desc">{t("admin.carts_page.sort_most_items")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* التبويبات السريعة */}
        <div className="flex items-center gap-2 pt-2 border-t border-black/5 dark:border-white/5 overflow-x-auto">
          {[
            { id: "all", label: t("admin.carts_page.tab_all"), count: analytics.totalCarts },
            { id: "hot", label: t("admin.carts_page.tab_hot"), count: analytics.hotCount },
            { id: "high", label: t("admin.carts_page.tab_high"), count: carts.filter((c) => (Number(c?.total || c?.subtotal) || 0) >= (analytics.avgCart || 500)).length },
            { id: "with-coupon", label: t("admin.carts_page.tab_coupon"), count: analytics.withCoupons },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#0B132B] text-white dark:bg-[#E89A5B] dark:text-[#0B132B] shadow-xs"
                  : "bg-slate-50 dark:bg-slate-900 text-secondary-muted hover:text-[#0B132B]"
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[12px] font-bold opacity-90 font-['Poppins',sans-serif]">
                ({formatDigits(tab.count)})
              </span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ─── شبكة بطاقات السلات ─── */}
      {loading ? (
        <div className="p-16 text-center text-xs font-bold text-secondary-muted bg-white dark:bg-[#121B35] rounded-3xl border border-black/5 animate-pulse">
          {t("common.loading")}
        </div>
      ) : paginatedCarts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paginatedCarts.map((c, index) => {
            const u = c?.user || {};
            const clientName = u.username || u.name || t("common.guest_client");
            const items = Array.isArray(c?.items) ? c.items : [];
            const itemCount = items.reduce((sum, it) => sum + (Number(it?.quantity) || 1), 0);
            const cartTotal = Number(c?.total || c?.subtotal) || 0;
            const dateRef = c?.updatedAt || c?.createdAt;
            const heat = getHeatInfo(dateRef);
            const score = calculateRecoveryScore(c);
            const couponStr = getCouponString(c?.coupon);

            return (
              <div
                key={c?._id || index}
                className="rounded-3xl bg-white dark:bg-[#121B35] border border-black/5 dark:border-white/5 p-6 space-y-4 shadow-sm flex flex-col justify-between hover:border-[#E89A5B]/40 transition-all group"
              >
                <div className="space-y-4">
                  {/* رأس الكارت */}
                  <div className="flex items-start justify-between gap-3 border-b border-black/5 dark:border-white/5 pb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-[#0B132B] text-white dark:bg-[#E89A5B] dark:text-[#0B132B] flex items-center justify-center font-bold text-sm shrink-0">
                        {clientName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[#0B132B] dark:text-white truncate">
                            {clientName}
                          </h4>
                          {couponStr && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 flex items-center gap-1">
                              <Tag className="w-2.5 h-2.5" />
                              <span>{couponStr}</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-secondary-muted truncate mt-0.5">
                          {u.email || t("admin.carts_page.active_carts_desc")}
                        </p>
                      </div>
                    </div>

                    <div className="text-end shrink-0 space-y-1">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${heat.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${heat.dot}`} />
                        <span>{heat.label}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#0B132B]/5 dark:bg-white/5 text-[#0B132B] dark:text-white block text-center">
                        <span className="font-black font-['Poppins',sans-serif]">{formatDigits(itemCount)}</span> {t("common.items")}
                      </span>
                    </div>
                  </div>

                  {/* شريط احتمالية الاسترداد */}
                  <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-black/5 dark:border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-secondary-muted font-bold flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-[#E89A5B]" />
                        <span>{t("admin.carts_page.recovery_likelihood")}</span>
                      </span>
                      <span className={`font-black font-['Poppins',sans-serif] ${score >= 70 ? "text-emerald-600" : score >= 40 ? "text-amber-600" : "text-rose-600"}`}>
                        {formatDigits(score)}% {score >= 70 ? t("admin.carts_page.recovery_high") : t("admin.carts_page.recovery_medium")}
                      </span>
                    </div>
                    <div className="w-full bg-black/5 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div
                        style={{ width: `${score}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-rose-500"
                        }`}
                      />
                    </div>
                  </div>

                  {/* محتويات السلة */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pe-1">
                    {items.map((it, idx) => (
                      <div
                        key={it?._id || idx}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#FAFAFA] dark:bg-slate-900/50 border border-black/5 dark:border-white/5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CartProductThumb src={it?.image || it?.product?.image} alt={it?.name || it?.product?.name} />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#0B132B] dark:text-white truncate">
                              {it?.name || it?.product?.name || t("admin.products_management.table.product")}
                            </p>
                            <p className="text-[11px] text-secondary-muted flex items-center gap-1">
                              <span className="font-bold font-['Poppins',sans-serif]">{formatDigits(it?.quantity || 1)}</span>
                              <span>×</span>
                              <span className="font-bold font-['Poppins',sans-serif]">{formatPrice(it?.price, true)}</span>
                              <span className="text-[9px] font-normal">{currencyLabel}</span>
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-black text-[#0B132B] dark:text-[#E89A5B] shrink-0 font-['Poppins',sans-serif]">
                          {formatPrice((Number(it?.price) || 0) * (Number(it?.quantity) || 1), true)} {currencyLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* أسفل الكارت: الإجمالي المحول وزر التواصل */}
                <div className="pt-4 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-secondary-muted block font-bold">
                      {t("admin.carts_page.gross_total")}
                    </span>
                    <span className="text-xl font-black text-[#0B132B] dark:text-[#E89A5B] flex items-baseline gap-1 font-['Poppins',sans-serif]">
                      <span className="font-black">{formatPrice(cartTotal, true)}</span>
                      <span className="text-xs font-normal text-secondary-muted">{currencyLabel}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveIncentiveCart(c)}
                      className="p-2.5 rounded-xl bg-[#E89A5B]/15 hover:bg-[#E89A5B] text-[#0B132B] hover:text-white dark:text-[#E89A5B] dark:hover:text-[#0B132B] transition-all cursor-pointer shadow-xs"
                      title={t("admin.carts_page.incentive_coupon_tooltip")}
                    >
                      <Gift className="w-4 h-4" />
                    </button>

                    {u.phone ? (
                      <a
                        href={`https://wa.me/${String(u.phone).replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `${clientName} - LUMA: ${formatPrice(cartTotal, true)}${currencyLabel}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{t("admin.carts_page.whatsapp_action")}</span>
                      </a>
                    ) : u.email ? (
                      <a
                        href={`mailto:${u.email}?subject=${encodeURIComponent(t("admin.carts_page.title"))}&body=${encodeURIComponent(
                          `${clientName} - LUMA: ${formatPrice(cartTotal, true)}${currencyLabel}`
                        )}`}
                        className="px-3.5 py-2 rounded-xl bg-[#0B132B] hover:bg-[#E89A5B] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{t("admin.carts_page.email_action")}</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-secondary-muted bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl font-bold">
                        {t("common.guest_client")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center bg-white dark:bg-[#121B35] rounded-3xl border border-black/5 space-y-2">
          <p className="text-sm font-bold text-[#0B132B] dark:text-white">
            {t("admin.orders_page.no_matching")}
          </p>
          <p className="text-xs text-secondary-muted">
            {t("admin.orders_page.no_matching_desc")}
          </p>
        </div>
      )}

      {/* ─── الترقيم ─── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
          <span className="text-xs text-secondary-muted">
            {t("common.page")} <span className="font-bold font-['Poppins',sans-serif]">{formatDigits(currentPage)}</span> {t("common.of")} <span className="font-bold font-['Poppins',sans-serif]">{formatDigits(totalPages)}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="p-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#121B35] disabled:opacity-30 cursor-pointer"
            >
              {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#121B35] disabled:opacity-30 cursor-pointer"
            >
              {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* ─── نافذة توليد كود الخصم التحفيزي ─── */}
      {activeIncentiveCart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#121B35] rounded-[2.5rem] p-7 border border-black/5 dark:border-white/5 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#E89A5B]/15 text-[#E89A5B] flex items-center justify-center">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0B132B] dark:text-white">
                    {t("admin.carts_page.modal_title")}
                  </h3>
                  <p className="text-[11px] text-secondary-muted">
                    {t("admin.carts_page.modal_subtitle")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveIncentiveCart(null);
                  setCopied(false);
                }}
                className="p-2 rounded-xl text-secondary-muted hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 space-y-1">
                <span className="text-[10px] text-secondary-muted block font-bold uppercase">
                  {t("admin.carts_page.target_client")}
                </span>
                <p className="font-bold text-[#0B132B] dark:text-white">
                  {activeIncentiveCart.user?.username || activeIncentiveCart.user?.name || t("common.guest_client")}
                </p>
                <p className="text-[11px] text-secondary-muted flex items-baseline gap-1 font-['Poppins',sans-serif]">
                  <span>{t("admin.carts_page.gross_total")}</span>
                  <span className="font-black">
                    {formatPrice(activeIncentiveCart.total || activeIncentiveCart.subtotal, true)}
                  </span>
                  <span>{currencyLabel}</span>
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-secondary-muted mb-1.5">
                  {t("admin.carts_page.suggested_code")}
                </label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 font-mono font-bold text-[#0B132B] dark:text-white outline-none focus:border-[#E89A5B]"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] leading-relaxed">
                {t("admin.carts_page.copy_tip")}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `LUMA: [${couponCode}] 15% OFF!`
                  );
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex-1 py-3 rounded-xl bg-[#0B132B] hover:bg-[#E89A5B] text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{t("admin.carts_page.copied_btn")}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#E89A5B]" />
                    <span>{t("admin.carts_page.copy_btn")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCartsPage;