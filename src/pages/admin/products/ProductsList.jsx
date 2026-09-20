import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  RefreshCw,
  Edit3,
  Eye,
  Star,
  Package,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Grid,
  List,
} from "lucide-react";
import api from "../../../api/axiosInstance";
import { useSettings } from "../../../context/SettingsContext";

// دالة شاملة لاستخراج رابط الصورة من أي صيغة يرجعها الباك إند
const extractImageUrl = (item) => {
  if (!item) return null;

  if (Array.isArray(item.images) && item.images.length > 0) {
    const first = item.images[0];
    if (typeof first === "string" && first.trim()) return first;
    if (first && typeof first === "object") {
      return first.url || first.secure_url || first.src || null;
    }
  }

  if (typeof item.image === "string" && item.image.trim()) return item.image;
  if (item.image && typeof item.image === "object") {
    return item.image.url || item.image.secure_url || null;
  }
  if (typeof item.coverImage === "string" && item.coverImage.trim()) return item.coverImage;
  if (typeof item.thumbnail === "string" && item.thumbnail.trim()) return item.thumbnail;

  return null;
};

// دالة استخراج اسم التصنيف بمرونة فائقة
const extractCategoryName = (category) => {
  if (!category) return "";
  if (typeof category === "string") return category.trim();
  if (typeof category === "object") {
    return category.name || category.title || category.slug || "";
  }
  return "";
};

// مكون عرض الصور الفاخر والمحصن ضد أخطاء 404
const EditorialProductImage = ({ src, alt = "", className = "" }) => {
  const initial = (alt || "L").trim().charAt(0).toUpperCase();
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`bg-gradient-to-br from-[#0B132B]/10 via-[#E89A5B]/15 to-[#0B132B]/20 dark:from-white/5 dark:to-[#E89A5B]/20 flex items-center justify-center font-black text-[#0B132B] dark:text-[#E89A5B] shrink-0 select-none border border-black/5 dark:border-white/5 ${className}`}
        title={alt}
      >
        <span className="font-['Poppins',sans-serif]">{initial}</span>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden shrink-0 relative group bg-slate-100 dark:bg-slate-900 border border-black/5 dark:border-white/5 ${className}`}>
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        loading="lazy"
      />
    </div>
  );
};

export const ProductsList = () => {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");
  const { currencyLabel, formatPrice, formatDigits, settings } = useSettings();

  const [products, setProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // حالات العرض والتصفية
  const [viewMode, setViewMode] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  // الترقيم
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const lowStockLimit = Number(settings?.lowStockThreshold) || 5;

  // جلب المنتجات وقائمة الأقسام من السيرفر بالتوازي
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [productsRes, categoriesRes] = await Promise.allSettled([
        api.get("/products"),
        api.get("/categories"),
      ]);

      if (productsRes.status === "fulfilled") {
        const list =
          productsRes.value.data?.products ||
          productsRes.value.data?.data ||
          (Array.isArray(productsRes.value.data) ? productsRes.value.data : []);
        setProducts(list);
      }

      if (categoriesRes.status === "fulfilled") {
        const catList =
          categoriesRes.value.data?.categories ||
          categoriesRes.value.data?.data ||
          (Array.isArray(categoriesRes.value.data) ? categoriesRes.value.data : []);
        setDbCategories(catList);
      }
    } catch (err) {
      console.error("Failed to load products and categories:", err);
      setError(t("admin.products_management.toast.delete_error"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // دمج الأقسام من قاعدة البيانات مع المنتجات لضمان ظهورها جميعاً دون نقصان
  const allCategoriesMerged = useMemo(() => {
    const categoryMap = new Map();

    dbCategories.forEach((cat) => {
      const name = extractCategoryName(cat);
      if (name) {
        categoryMap.set(name, 0);
      }
    });

    products.forEach((p) => {
      const name = extractCategoryName(p.category);
      if (name) {
        categoryMap.set(name, (categoryMap.get(name) || 0) + 1);
      }
    });

    return Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, [dbCategories, products]);

  // إحصائيات سريعة للكتالوج
  const stats = useMemo(() => {
    const totalInventoryValue = products.reduce(
      (sum, p) => sum + (p.price || 0) * (p.stock || 0),
      0
    );
    const lowStockCount = products.filter(
      (p) => (p.stock || 0) > 0 && (p.stock || 0) <= lowStockLimit
    ).length;
    const outOfStockCount = products.filter((p) => (p.stock || 0) === 0).length;
    const featuredCount = products.filter((p) => p.featured === true).length;
    const activeCount = products.filter((p) => p.isActive !== false).length;

    return {
      total: products.length,
      inventoryValue: totalInventoryValue,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
      featured: featuredCount,
      active: activeCount,
    };
  }, [products, lowStockLimit]);

  // التصفية والبحث
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const name = (item.name || "").toLowerCase();
      const sku = (item.sku || "").toLowerCase();
      const brand = (item.brand || "").toLowerCase();
      const catName = extractCategoryName(item.category).toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        sku.includes(query) ||
        brand.includes(query) ||
        catName.includes(query);

      const itemCategory = extractCategoryName(item.category);
      const matchesCategory =
        selectedCategory === "all" || itemCategory === selectedCategory;

      let matchesTab = true;
      if (activeTab === "active") matchesTab = item.isActive !== false;
      if (activeTab === "featured") matchesTab = item.featured === true;
      if (activeTab === "low-stock") matchesTab = (item.stock || 0) <= lowStockLimit;

      let matchesStockFilter = true;
      if (stockStatusFilter === "in-stock") matchesStockFilter = (item.stock || 0) > lowStockLimit;
      if (stockStatusFilter === "low")
        matchesStockFilter = (item.stock || 0) > 0 && (item.stock || 0) <= lowStockLimit;
      if (stockStatusFilter === "out") matchesStockFilter = (item.stock || 0) === 0;

      return matchesSearch && matchesCategory && matchesTab && matchesStockFilter;
    });
  }, [products, searchQuery, selectedCategory, activeTab, stockStatusFilter, lowStockLimit]);

  // الترقيم
  const totalPages = Math.max(Math.ceil(filteredProducts.length / itemsPerPage), 1);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

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
                <Package className="w-3.5 h-3.5" />
                <span>LUMA CATALOG MASTER</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white/90 border border-white/10">
                <span className="font-['Poppins',sans-serif]">
                  {formatDigits(stats.total)}
                </span>{" "}
                {t("common.items")}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-['Poppins',sans-serif]">
              {t("admin.products_management.title")}
            </h1>
            <p className="text-sm sm:text-base text-white/70 max-w-2xl font-normal leading-relaxed">
              {t("admin.products_management.subtitle")}
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
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ─── Inventory Telemetry Bento Strip ─── */}
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
              {formatPrice(stats.inventoryValue, true)}
            </p>
            <span className="text-xs font-bold text-secondary-muted">
              {currencyLabel}
            </span>
          </div>
          <p className="text-xs text-secondary-muted">
            {t("admin.orders_page.total_volume_desc")}
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#121B35] p-6 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary-muted">
              {t("admin.products_management.stock_status.in_stock")}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#0B132B]/5 dark:bg-white/5 text-[#0B132B] dark:text-white flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#0B132B] dark:text-white tracking-tight font-['Poppins',sans-serif]">
            {formatDigits(stats.active)}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            {t("admin.dashboard_page.live_sync")}
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#121B35] p-6 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary-muted">
              {t("admin.products_management.stock_status.low_stock")}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight font-['Poppins',sans-serif]">
            {formatDigits(stats.lowStock)}
          </p>
          <p className="text-xs text-secondary-muted">
            {t("admin.settings_page.low_stock_hint")}
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#121B35] p-6 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary-muted">
              {t("admin.dashboard_page.bestsellers_title")}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#E89A5B]/15 text-[#E89A5B] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#0B132B] dark:text-[#E89A5B] tracking-tight font-['Poppins',sans-serif]">
            {formatDigits(stats.featured)}
          </p>
          <p className="text-xs text-secondary-muted">
            {t("admin.dashboard_page.bestsellers_subtitle")}
          </p>
        </div>
      </div>

      {/* ─── Category Carousel Pills ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-secondary-muted flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#E89A5B]" />
            <span>{t("admin.products_management.table.category")}</span>
          </span>
          <span className="text-xs text-secondary-muted font-bold">
            <span className="font-['Poppins',sans-serif]">{formatDigits(allCategoriesMerged.length)}</span> {t("common.items")}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => {
              setSelectedCategory("all");
              setCurrentPage(1);
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer shrink-0 ${
              selectedCategory === "all"
                ? "bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] shadow-md scale-105"
                : "bg-white dark:bg-[#121B35] border border-black/5 dark:border-white/5 text-secondary-muted hover:text-[#0B132B] dark:hover:text-white"
            }`}
          >
            <span>{t("admin.products_management.filter_category")}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 dark:bg-black/20 font-['Poppins',sans-serif]">
              {formatDigits(products.length)}
            </span>
          </button>

          {allCategoriesMerged.map((cat) => (
            <button
              key={cat.name}
              onClick={() => {
                setSelectedCategory(cat.name);
                setCurrentPage(1);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer shrink-0 ${
                selectedCategory === cat.name
                  ? "bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] shadow-md scale-105"
                  : "bg-white dark:bg-[#121B35] border border-black/5 dark:border-white/5 text-secondary-muted hover:text-[#0B132B] dark:hover:text-white"
              }`}
            >
              <span>{cat.name}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/5 dark:bg-white/10 font-['Poppins',sans-serif]">
                {formatDigits(cat.count)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Control Bar: Search & Stock Filter ─── */}
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
              placeholder={t("admin.products_management.search_placeholder")}
              className="w-full ps-11 pe-4 py-2.5 text-sm rounded-2xl border border-black/5 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white outline-none focus:ring-2 focus:ring-[#0B132B] dark:focus:ring-[#E89A5B]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={stockStatusFilter}
              onChange={(e) => {
                setStockStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 text-xs font-bold rounded-2xl border border-black/5 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white outline-none cursor-pointer"
            >
              <option value="all">{t("admin.products_management.table.stock")} (All)</option>
              <option value="in-stock">{t("admin.products_management.stock_status.in_stock")}</option>
              <option value="low">{t("admin.products_management.stock_status.low_stock")}</option>
              <option value="out">{t("admin.products_management.stock_status.out_of_stock")}</option>
            </select>

            <div className="flex items-center p-1 bg-[#FAFAFA] dark:bg-slate-900 rounded-2xl border border-black/5 dark:border-white/5">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white dark:bg-[#121B35] text-[#0B132B] dark:text-[#E89A5B] shadow-sm"
                    : "text-secondary-muted hover:text-[#0B132B] dark:hover:text-white"
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  viewMode === "cards"
                    ? "bg-white dark:bg-[#121B35] text-[#0B132B] dark:text-[#E89A5B] shadow-sm"
                    : "text-secondary-muted hover:text-[#0B132B] dark:hover:text-white"
                }`}
                title="Showcase View"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* فلاتر الحالات السريعة */}
        <div className="flex items-center gap-2 pt-2 border-t border-black/5 dark:border-white/5 overflow-x-auto">
          {[
            { id: "all", label: t("admin.orders_page.all_orders_tab"), count: stats.total },
            { id: "active", label: t("admin.products_management.stock_status.in_stock"), count: stats.active },
            { id: "featured", label: "Featured", count: stats.featured },
            { id: "low-stock", label: t("admin.products_management.stock_status.low_stock"), count: stats.lowStock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
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

      {/* ─── Content Presentation ─── */}
      {loading ? (
        <div className="rounded-3xl bg-white dark:bg-[#121B35] p-16 text-center border border-black/5 dark:border-white/5 animate-pulse space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 mx-auto" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mx-auto" />
        </div>
      ) : paginatedProducts.length > 0 ? (
        viewMode === "table" ? (
          /* 1. جدول الكتالوج الفاخر */
          <div className="rounded-[2rem] bg-white dark:bg-[#121B35] border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-[#FAFAFA] dark:bg-slate-900/40 text-[10px] uppercase font-bold text-secondary-muted border-b border-black/5 dark:border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-start">{t("admin.products_management.table.product")}</th>
                    <th className="px-6 py-4 text-start">{t("admin.products_management.table.category")}</th>
                    <th className="px-6 py-4 text-start">{t("admin.products_management.table.price")}</th>
                    <th className="px-6 py-4 text-start">{t("admin.products_management.table.stock")}</th>
                    <th className="px-6 py-4 text-start">Rating</th>
                    <th className="px-6 py-4 text-start">{t("admin.products_management.table.status")}</th>
                    <th className="px-6 py-4 text-end">{t("admin.products_management.table.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {paginatedProducts.map((p) => {
                    const imageUrl = extractImageUrl(p);
                    const categoryName = extractCategoryName(p.category);
                    const isLow = (p.stock || 0) <= lowStockLimit && (p.stock || 0) > 0;
                    const isOut = (p.stock || 0) === 0;

                    return (
                      <tr
                        key={p._id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <EditorialProductImage
                              src={imageUrl}
                              alt={p.name}
                              className="w-12 h-12 rounded-2xl shadow-sm"
                            />
                            <div className="min-w-0">
                              <Link
                                to={`/admin/products/${p._id}`}
                                className="font-bold text-sm text-[#0B132B] dark:text-white hover:text-[#E89A5B] transition-colors truncate block max-w-xs"
                              >
                                {p.name}
                              </Link>
                              <p className="text-[11px] text-secondary-muted mt-0.5 flex items-center gap-2">
                                <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                  {p.sku || "LUMA-SKU"}
                                </span>
                                {p.featured && (
                                  <span className="text-[#E89A5B] font-bold flex items-center gap-0.5">
                                    <Sparkles className="w-3 h-3" />
                                    <span>Featured</span>
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-semibold text-[#0B132B] dark:text-white block">
                            {categoryName || "General"}
                          </span>
                          <span className="text-[10px] text-secondary-muted">
                            {p.brand || "LUMA Edition"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {p.discountPrice && p.discountPrice < p.price ? (
                            <div>
                              <span className="font-black text-sm text-emerald-600 dark:text-emerald-400 font-['Poppins',sans-serif]">
                                {formatPrice(p.discountPrice, true)}{" "}
                                <span className="text-[10px] font-normal">{currencyLabel}</span>
                              </span>
                              <span className="block text-[11px] text-secondary-muted line-through font-['Poppins',sans-serif]">
                                {formatPrice(p.price, true)}
                              </span>
                            </div>
                          ) : (
                            <span className="font-black text-sm text-[#0B132B] dark:text-white font-['Poppins',sans-serif]">
                              {formatPrice(p.price, true)}{" "}
                              <span className="text-[10px] font-normal text-secondary-muted">{currencyLabel}</span>
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isOut
                                  ? "bg-rose-500"
                                  : isLow
                                  ? "bg-amber-400 animate-ping"
                                  : "bg-emerald-500"
                              }`}
                            />
                            <span className="font-bold text-xs font-['Poppins',sans-serif]">
                              {formatDigits(p.stock || 0)}
                            </span>
                            <span className="text-[11px] text-secondary-muted">
                              {isOut
                                ? t("admin.products_management.stock_status.out_of_stock")
                                : isLow
                                ? t("admin.products_management.stock_status.low_stock")
                                : t("common.items_count")}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 fill-[#E89A5B] text-[#E89A5B]" />
                            <span className="font-bold text-xs font-['Poppins',sans-serif]">
                              {formatDigits(p.averageRating || 5.0)}
                            </span>
                            <span className="text-[10px] text-secondary-muted font-['Poppins',sans-serif]">
                              ({formatDigits(p.numReviews || 0)})
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                              p.isActive !== false
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-slate-500/10 text-slate-600 border-slate-500/20"
                            }`}
                          >
                            <span>
                              {p.isActive !== false
                                ? t("admin.products_management.stock_status.in_stock")
                                : "Inactive"}
                            </span>
                          </span>
                        </td>

                        <td className="px-6 py-4 text-end">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/admin/products/${p._id}`}
                              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-secondary-muted hover:text-[#0B132B] dark:hover:text-white transition-colors"
                              title={t("admin.view_details")}
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/admin/products/edit/${p._id}`}
                              className="p-2 rounded-xl hover:bg-[#E89A5B]/10 text-secondary-muted hover:text-[#E89A5B] transition-colors"
                              title={t("common.edit")}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* 2. عرض البطاقات البصرية Showcase */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((p) => {
              const imageUrl = extractImageUrl(p);
              const categoryName = extractCategoryName(p.category);
              const isLow = (p.stock || 0) <= lowStockLimit && (p.stock || 0) > 0;
              const isOut = (p.stock || 0) === 0;

              return (
                <div
                  key={p._id}
                  className="rounded-[2rem] bg-white dark:bg-[#121B35] border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden hover:shadow-xl hover:border-[#E89A5B]/30 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                      <EditorialProductImage
                        src={imageUrl}
                        alt={p.name}
                        className="w-full h-full"
                      />
                      <div className="absolute top-3 start-3 flex flex-col gap-1.5">
                        {p.featured && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E89A5B] text-white shadow-md flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>Featured</span>
                          </span>
                        )}
                        {isLow && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-md">
                            {t("admin.products_management.stock_status.low_stock")}
                          </span>
                        )}
                        {isOut && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-md">
                            {t("admin.products_management.stock_status.out_of_stock")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs text-secondary-muted">
                        <span>{categoryName || "Collection"}</span>
                        <div className="flex items-center gap-1 text-[#E89A5B]">
                          <Star className="w-3 h-3 fill-[#E89A5B]" />
                          <span className="font-bold font-['Poppins',sans-serif]">
                            {formatDigits(p.averageRating || 5.0)}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-bold text-sm text-[#0B132B] dark:text-white truncate group-hover:text-[#E89A5B] transition-colors">
                        {p.name}
                      </h3>

                      <div className="flex items-baseline justify-between pt-2 border-t border-black/5 dark:border-white/5">
                        <div>
                          {p.discountPrice && p.discountPrice < p.price ? (
                            <div className="flex items-baseline gap-2">
                              <span className="text-base font-black text-emerald-600 font-['Poppins',sans-serif]">
                                {formatPrice(p.discountPrice, true)}
                              </span>
                              <span className="text-xs text-secondary-muted line-through font-['Poppins',sans-serif]">
                                {formatPrice(p.price, true)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-base font-black text-[#0B132B] dark:text-[#E89A5B] font-['Poppins',sans-serif]">
                              {formatPrice(p.price, true)}{" "}
                              <span className="text-xs font-normal text-secondary-muted">{currencyLabel}</span>
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-bold text-secondary-muted font-['Poppins',sans-serif]">
                          {formatDigits(p.stock || 0)} {t("common.items_count")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                    <Link
                      to={`/admin/products/${p._id}`}
                      className="text-xs font-bold text-secondary-muted hover:text-[#0B132B] dark:hover:text-white transition-colors"
                    >
                      {t("admin.view_details")}
                    </Link>
                    <Link
                      to={`/admin/products/edit/${p._id}`}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#121B35] border border-black/5 dark:border-white/10 hover:border-[#E89A5B] text-xs font-bold text-[#0B132B] dark:text-white transition-all"
                    >
                      {t("common.edit")}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="rounded-[2.5rem] bg-white dark:bg-[#121B35] p-16 text-center border border-black/5 dark:border-white/5 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-secondary-muted">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#0B132B] dark:text-white">
            {t("admin.products_management.no_products")}
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

export default ProductsList;