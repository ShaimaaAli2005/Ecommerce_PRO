import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Heart,
  Search,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Package,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react";
import api from "../../../api/axiosInstance";
import { useSettings } from "../../../context/SettingsContext";

// مكوّن عرض الصور المحصن ضد 404
const WishlistThumb = ({ src, alt = "" }) => {
  const initial = (alt || "W").trim().charAt(0).toUpperCase();
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

export const AdminWishlistPage = () => {
  const { currencyLabel, formatPrice, formatDigits } = useSettings();
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");

  const [wishlists, setWishlists] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // حالات البحث والترقيم
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 8;

  // جلب إحصائيات وقوائم الرغبات عبر الـ API
  const fetchData = useCallback(async () => {
    try {
      setError(null);

      try {
        const statsRes = await api.get("/wishlists/admin/stats");
        const statsData = statsRes.data?.statistics || statsRes.data?.data || statsRes.data || {};
        setStats(statsData);
      } catch (statsErr) {
        console.warn("Wishlist stats error:", statsErr);
      }

      const allRes = await api.get(`/wishlists/admin/all?page=${currentPage}&limit=${itemsPerPage}`);
      const list =
        allRes.data?.wishlists ||
        allRes.data?.data ||
        (Array.isArray(allRes.data) ? allRes.data : []);

      setWishlists(list);
      setTotalPages(allRes.data?.totalPages || Math.max(Math.ceil((allRes.data?.total || list.length) / itemsPerPage), 1));
    } catch (err) {
      console.error("Failed to load wishlist telemetry:", err);
      setError(t("admin.wishlist_page.no_wishlists_desc"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, itemsPerPage, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // فلترة السجلات المتاحة بالبحث
  const filteredWishlists = useMemo(() => {
    return wishlists.filter((w) => {
      const u = w.user || {};
      const username = String(u.username || u.name || "").toLowerCase();
      const email = String(u.email || "").toLowerCase();
      const query = searchQuery.toLowerCase().trim();
      return !query || username.includes(query) || email.includes(query);
    });
  }, [wishlists, searchQuery]);

  const totalWishlistsCount = stats?.totalWishlists ?? wishlists.length;
  const totalProductsAcrossWishlists = stats?.totalWishlistProducts ?? 0;
  const topProducts = Array.isArray(stats?.topProducts) ? stats.topProducts : [];

  return (
    <div className="space-y-6 pb-16" dir={isRtl ? "rtl" : "ltr"}>
      {/* ─── Hero Header الرأسي الموحد ─── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0B132B] via-[#111A38] to-[#1C2541] p-8 sm:p-10 text-white shadow-2xl border border-white/10">
        <div className="absolute -top-24 -end-24 w-96 h-96 bg-[#E89A5B]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -start-24 w-80 h-80 bg-rose-500/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-[#E89A5B]/20 text-[#E89A5B] border border-[#E89A5B]/30 flex items-center gap-2 backdrop-blur-md">
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>{t("admin.wishlist_page.badge")}</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white/90 border border-white/10">
                <span className="font-['Poppins',sans-serif]">{formatDigits(totalWishlistsCount)}</span> {t("admin.wishlist_page.active_wishlists_count")}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-['Poppins',sans-serif]">
              {t("admin.wishlist_page.title")}
            </h1>
            <p className="text-sm sm:text-base text-white/70 max-w-2xl font-normal leading-relaxed">
              {t("admin.wishlist_page.subtitle")}
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
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ─── كروت الإحصائيات العلوية ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-3xl bg-white dark:bg-[#121B35] p-6 border border-black/5 dark:border-white/5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-secondary-muted text-xs font-bold">
            <span>{t("admin.wishlist_page.total_wishlists_card")}</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-current" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#0B132B] dark:text-white tracking-tight font-['Poppins',sans-serif]">
            {formatDigits(totalWishlistsCount)}
          </p>
          <span className="text-[11px] text-secondary-muted block font-medium">
            {t("admin.wishlist_page.total_wishlists_desc")}
          </span>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#121B35] p-6 border border-black/5 dark:border-white/5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-secondary-muted text-xs font-bold">
            <span>{t("admin.wishlist_page.saved_products_card")}</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#0B132B] dark:text-white tracking-tight font-['Poppins',sans-serif]">
            {formatDigits(totalProductsAcrossWishlists)}
          </p>
          <span className="text-[11px] text-secondary-muted block font-medium">
            {t("admin.wishlist_page.saved_products_desc")}
          </span>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#121B35] p-6 border border-black/5 dark:border-white/5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-secondary-muted text-xs font-bold">
            <span>{t("admin.wishlist_page.top_desired_card")}</span>
            <div className="w-8 h-8 rounded-xl bg-[#E89A5B]/15 text-[#E89A5B] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#0B132B] dark:text-[#E89A5B] tracking-tight font-['Poppins',sans-serif]">
            {formatDigits(topProducts.length)}
          </p>
          <span className="text-[11px] text-secondary-muted block font-medium">
            {t("admin.wishlist_page.top_desired_desc")}
          </span>
        </div>
      </div>

      {/* ─── رادار المنتجات الأكثر رغبة ─── */}
      {topProducts.length > 0 && (
        <div className="rounded-[2.2rem] bg-white dark:bg-[#121B35] p-7 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
            <div>
              <h3 className="text-base font-bold text-[#0B132B] dark:text-white flex items-center gap-2 font-['Poppins',sans-serif]">
                <TrendingUp className="w-5 h-5 text-rose-500" />
                <span>{t("admin.wishlist_page.top_assets_title")}</span>
              </h3>
              <p className="text-xs text-secondary-muted mt-0.5">
                {t("admin.wishlist_page.top_assets_desc")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {topProducts.map((p, idx) => (
              <div
                key={p.productId || p._id || idx}
                className="p-4 rounded-2xl bg-[#FAFAFA] dark:bg-slate-900/60 border border-black/5 dark:border-white/5 flex items-center gap-3.5 hover:border-[#E89A5B]/30 transition-all"
              >
                <WishlistThumb src={p.image} alt={p.name} />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-[#0B132B] dark:text-white truncate" title={p.name}>
                    {p.name}
                  </h4>
                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 font-['Poppins',sans-serif]">
                      <Heart className="w-3 h-3 fill-current" />
                      <span>{formatDigits(p.count)} {t("admin.wishlist_page.saves_count")}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── شريط البحث ─── */}
      <div className="rounded-2xl bg-white dark:bg-[#121B35] p-4 border border-black/5 dark:border-white/5 flex items-center gap-3 shadow-xs">
        <Search className="w-4 h-4 text-secondary-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("admin.wishlist_page.search_placeholder")}
          className="w-full bg-transparent text-xs sm:text-sm text-[#0B132B] dark:text-white outline-none"
        />
      </div>

      {/* ─── شبكة بطاقات قوائم رغبات العملاء ─── */}
      {loading ? (
        <div className="p-16 text-center text-xs font-bold text-secondary-muted bg-white dark:bg-[#121B35] rounded-3xl border border-black/5 animate-pulse">
          {t("common.loading")}
        </div>
      ) : filteredWishlists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredWishlists.map((w, index) => {
            const u = w?.user || {};
            const clientName = u.username || u.name || t("common.guest_client");
            const prods = Array.isArray(w?.products) ? w.products : [];

            return (
              <div
                key={w?._id || index}
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
                        <h4 className="font-bold text-sm text-[#0B132B] dark:text-white truncate">
                          {clientName}
                        </h4>
                        <p className="text-xs text-secondary-muted truncate mt-0.5">
                          {u.email || t("admin.carts_page.active_carts_desc")}
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 flex items-center gap-1.5">
                      <Heart className="w-3 h-3 fill-current" />
                      <span className="font-['Poppins',sans-serif]">{formatDigits(prods.length)}</span> <span>{t("admin.wishlist_page.items_desired")}</span>
                    </span>
                  </div>

                  {/* قائمة القطع المرغوبة */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pe-1">
                    {prods.map((p, pIdx) => {
                      const img = Array.isArray(p?.images) ? p.images[0]?.url || p.images[0] : p?.image?.url || p?.image;
                      return (
                        <div
                          key={p?._id || pIdx}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#FAFAFA] dark:bg-slate-900/50 border border-black/5 dark:border-white/5"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <WishlistThumb src={img} alt={p?.name} />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#0B132B] dark:text-white truncate">
                                {p?.name || t("common.items")}
                              </p>
                              <p className="text-[11px] text-secondary-muted font-medium">
                                {p?.category || t("admin.products_management.table.category")}
                              </p>
                            </div>
                          </div>

                          <span className="text-xs font-black text-[#0B132B] dark:text-[#E89A5B] shrink-0 font-['Poppins',sans-serif]">
                            {formatPrice(p?.discountPrice || p?.price, true)} {currencyLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* أسفل الكارت */}
                <div className="pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-3">
                  <span className="text-xs text-secondary-muted font-medium">
                    {t("admin.wishlist_page.reengagement_label")}
                  </span>

                  {u.email ? (
                    <a
                      href={`mailto:${u.email}?subject=${encodeURIComponent(t("admin.wishlist_page.title"))}&body=${encodeURIComponent(
                        `Hello ${clientName}, your favorite pieces are waiting for you at LUMA!`
                      )}`}
                      className="px-3.5 py-2 rounded-xl bg-[#0B132B] hover:bg-[#E89A5B] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      title={t("admin.wishlist_page.send_promo_btn")}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t("admin.wishlist_page.send_promo_btn")}</span>
                    </a>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center bg-white dark:bg-[#121B35] rounded-3xl border border-black/5 space-y-2">
          <p className="text-sm font-bold text-[#0B132B] dark:text-white">
            {t("admin.wishlist_page.no_wishlists")}
          </p>
          <p className="text-xs text-secondary-muted">
            {t("admin.wishlist_page.no_wishlists_desc")}
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
    </div>
  );
};

export default AdminWishlistPage;