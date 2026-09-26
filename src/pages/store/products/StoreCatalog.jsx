import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Sparkles, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  Heart, 
  ShoppingBag, 
  PackageX, 
  Layers, 
  Scale, 
  Star, 
  X, 
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  List,
  StretchHorizontal,
  Eye
} from "lucide-react";
import { useSettings } from "../../../context/SettingsContext";
import { useWishlist } from "../../../context/WishlistContext";
import { useCart } from "../../../context/CartContext";
import productService from "../../../services/productService";
import CatalogFilters from "../products/components/CatalogFilters";
import RecentlyViewed from "../products/components/RecentlyViewed";
import toast from "react-hot-toast";

const resolveProductImage = (product) => {
  if (!product) return "https://placehold.co/400";
  if (Array.isArray(product.images) && product.images.length > 0) {
    const firstImg = product.images[0];
    return typeof firstImg === "string" ? firstImg : firstImg?.url || "https://placehold.co/400";
  }
  if (typeof product.image === "string") return product.image;
  if (typeof product.imageUrl === "string") return product.imageUrl;
  return "https://placehold.co/400";
};

export const StoreCatalog = () => {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");
  const navigate = useNavigate();

  const { formatPrice, currencyLabel } = useSettings();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCartGlobal } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("luma_catalog_view_mode") || "shelves";
  });

  const [maxPriceFilter, setMaxPriceFilter] = useState(5000);
  const [minRatingFilter, setMinRatingFilter] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [recentItems, setRecentItems] = useState([]);

  // حالات المقارنة والمعاينة
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [addingId, setAddingId] = useState(null);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem("luma_catalog_view_mode", mode);
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await productService.getProducts({ limit: 100 });
      const items = Array.isArray(res) ? res : (res?.products || res?.data?.products || res?.data || []);
      const validItems = Array.isArray(items) ? items.filter((p) => p && (p._id || p.id)) : [];

      setProducts(validItems);
      sessionStorage.setItem("luma_catalog_cache", JSON.stringify(validItems));
    } catch {
      toast.error(t("store.catalog.fetch_error", "Failed to load collections."));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchProducts();

    try {
      const stored = localStorage.getItem("luma_recently_viewed");
      if (stored) setRecentItems(JSON.parse(stored));
    } catch {
      // Ignore
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [fetchProducts]);

  const getCategoryLabel = (rawCategory) => {
    if (!rawCategory || rawCategory === "all") return t("store.collections_page.all_categories", "All Departments");

    let catName = rawCategory;
    if (typeof rawCategory === "object") {
      catName = rawCategory.name || rawCategory.slug || rawCategory.title || "general";
    }

    const catStr = String(catName).toLowerCase().trim();
    const cleanKey = catStr.replace(/[\s-_]+/g, "");

    const translationKey = `store.categories.${cleanKey}`;
    const translated = t(translationKey);
    if (translated && translated !== translationKey) {
      return translated;
    }

    return String(catName).charAt(0).toUpperCase() + String(catName).slice(1);
  };

  const categories = useMemo(() => {
    const allCats = products.map((p) => {
      const catField = p.category || p.categoryId || p.categoryName;
      if (!catField) return null;

      if (typeof catField === "object") {
        return catField.name || catField.slug || catField.title || catField._id;
      }
      return catField;
    }).filter(Boolean);

    const uniqueMap = new Map();
    allCats.forEach((cat) => {
      const cleanKey = String(cat).toLowerCase().trim().replace(/[\s-_]+/g, "");
      if (!uniqueMap.has(cleanKey)) {
        uniqueMap.set(cleanKey, cat);
      }
    });

    return Array.from(uniqueMap.values());
  }, [products]);

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setMaxPriceFilter(5000);
    setMinRatingFilter(0);
    setInStockOnly(false);
    setOnSaleOnly(false);
  };

  const handleWishlistClick = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
    if (!token) {
      toast.error(t("store.auth.unauthorized", "Please sign in first"));
      navigate("/login");
      return;
    }

    await toggleWishlist(product);
  };

  const handleSafeAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
    if (!token) {
      toast.error(t("store.auth.unauthorized", "Please sign in first"));
      navigate("/login");
      return;
    }

    const stock = Number(product.stock !== undefined && product.stock !== null ? product.stock : 10);
    if (stock <= 0) {
      toast.error(t("store.catalog.out_of_stock_error", "Piece is temporarily out of stock"));
      return;
    }

    const prodId = product._id || product.id;
    if (addingId === prodId) return;

    try {
      setAddingId(prodId);
      await addToCartGlobal(product, 1);
    } finally {
      setAddingId(null);
    }
  };

  const toggleCompare = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    setCompareList((prev) => {
      const prodId = product.id || product._id;
      if (prev.find((p) => (p.id || p._id) === prodId)) {
        return prev.filter((p) => (p.id || p._id) !== prodId);
      }
      if (prev.length >= 3) {
        toast.error(t("store.catalog.max_compare_reached", "Maximum comparison limit is 3 products"));
        return prev;
      }
      return [...prev, product];
    });
  };

  // ─── تصفية المنتجات مع إعطاء الأولوية القصوى للمتوفر أولاً ───
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const rawCat = typeof item.category === "object" ? (item.category?.name || item.category?.slug) : item.category;
      const itemCat = String(rawCat || "").toLowerCase().trim();
      const matchesCategory = selectedCategory === "all" || itemCat === selectedCategory.toLowerCase();

      const title = item.title || item.name || "";
      const desc = item.description || "";
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase().trim()) || 
                            desc.toLowerCase().includes(searchQuery.toLowerCase().trim());

      const price = Number(item.price) || 0;
      const discountPrice = Number(item.discountPrice) || 0;
      const hasDiscount = discountPrice > 0 && discountPrice < price;

      const effectivePrice = hasDiscount ? discountPrice : price;
      const matchesPrice = effectivePrice <= maxPriceFilter;
      const matchesRating = Number(item.averageRating || item.rating || 5) >= minRatingFilter;
      
      const stockVal = Number(item.stock !== undefined && item.stock !== null ? item.stock : 10);
      const matchesStock = inStockOnly ? stockVal > 0 : true;
      const matchesSale = onSaleOnly ? hasDiscount : true;

      return matchesCategory && matchesSearch && matchesPrice && matchesRating && matchesStock && matchesSale;
    }).sort((a, b) => {
      // 🌟 أولوية الظهور للمنتج المتوفر أولاً (In-Stock First)
      const isAvailableA = Number(a.stock !== undefined && a.stock !== null ? a.stock : 10) > 0 ? 1 : 0;
      const isAvailableB = Number(b.stock !== undefined && b.stock !== null ? b.stock : 10) > 0 ? 1 : 0;

      if (isAvailableA !== isAvailableB) {
        return isAvailableB - isAvailableA; // 1 (المتوفر) يسبق 0 (غير المتوفر)
      }

      // بعد مطابقة التوفر، يطبق الترتيب المحدد
      const priceA = Number(a.discountPrice && a.discountPrice > 0 ? a.discountPrice : a.price) || 0;
      const priceB = Number(b.discountPrice && b.discountPrice > 0 ? b.discountPrice : b.price) || 0;
      if (sortBy === "price-low") return priceA - priceB;
      if (sortBy === "price-high") return priceB - priceA;
      if (sortBy === "rating") return (b.averageRating || b.rating || 5) - (a.averageRating || a.rating || 5);
      return 0;
    });
  }, [products, selectedCategory, searchQuery, sortBy, maxPriceFilter, minRatingFilter, inStockOnly, onSaleOnly]);

  const groupedShelves = useMemo(() => {
    return filteredProducts.reduce((acc, product) => {
      const rawCat = typeof product.category === "object" ? (product.category?.name || "General") : (product.category || "General");
      if (!acc[rawCat]) acc[rawCat] = [];
      acc[rawCat].push(product);
      return acc;
    }, {});
  }, [filteredProducts]);

  const scrollShelf = (catKey, direction) => {
    const container = document.getElementById(`shelf-carousel-${catKey}`);
    if (container) {
      const distance = direction === "next" ? 440 : -440;
      container.scrollBy({ left: isRtl ? -distance : distance, behavior: "smooth" });
    }
  };

  const hasActiveFilters = selectedCategory !== "all" || searchQuery !== "" || maxPriceFilter < 5000 || minRatingFilter > 0 || inStockOnly || onSaleOnly;

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#070D1E] text-[#0B132B] dark:text-white font-['Poppins'] transition-colors duration-300 py-10 px-4 sm:px-6 lg:px-8 space-y-10 selection:bg-[#E89A5B]/30" dir={isRtl ? "rtl" : "ltr"}>
      
      {/* زر المقارنة العائم */}
      <div className={`fixed bottom-8 ${isRtl ? "start-8" : "end-8"} z-50 transition-all duration-500 pointer-events-none ${compareList.length > 0 ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}`}>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); setShowCompareModal(true); }}
          className="pointer-events-auto px-6 py-4 rounded-2xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-xs font-black tracking-wider uppercase shadow-2xl hover:scale-105 transition-all flex items-center gap-3 border border-white/20 cursor-pointer backdrop-blur-xl group active:scale-95"
        >
          <Scale className="w-4 h-4 text-[#E89A5B] dark:text-[#0B132B] group-hover:rotate-12 transition-transform" />
          <span>{t("store.catalog.compare", "Compare Archives")} ({compareList.length}/3)</span>
        </button>
      </div>

      {/* 1. الترويسة الرئيسية */}
      <div className="text-center max-w-3xl mx-auto space-y-3 relative">
        <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-44 h-16 bg-[#E89A5B]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs font-black tracking-widest uppercase text-[#E89A5B] shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t("store.collections_page.badge", "Complete Collections Archive")}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight uppercase">
          {t("store.collections_page.title", "The LUMA Collections")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed font-light">
          {t("store.collections_page.subtitle", "Explore our curated departmental galleries where precision engineering meets timeless architectural beauty.")}
        </p>
      </div>

      {/* 2. شريط البحث ومبدل العرض */}
      <div className="max-w-7xl mx-auto bg-white dark:bg-[#121c38] p-4 sm:p-5 rounded-3xl border border-black/5 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full md:w-80 lg:w-96">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("store.collections_page.search_placeholder", "Filter by piece name or category across archive...")}
            className={`w-full py-2.5 ${isRtl ? "pe-4 ps-11" : "ps-4 pe-11"} rounded-xl border border-black/10 dark:border-white/10 bg-[#FAF8F5] dark:bg-[#070D1E] text-xs outline-none focus:border-[#E89A5B] transition-all font-medium`}
          />
          <Search className={`w-4 h-4 text-slate-400 absolute ${isRtl ? "start-4" : "end-4"} top-1/2 -translate-y-1/2`} />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end flex-wrap">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAF8F5] dark:bg-[#070D1E] text-xs font-bold flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#E89A5B]" />
            <span>{t("store.catalog.filters", "Filters")}</span>
          </button>

          <div className="flex items-center p-1 rounded-xl bg-[#FAF8F5] dark:bg-[#070D1E] border border-black/10 dark:border-white/10">
            <button
              type="button"
              onClick={() => handleViewModeChange("shelves")}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === "shelves" 
                  ? "bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] shadow-xs" 
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
              }`}
              title={isRtl ? "عرض أرفف الأقسام" : "Departmental Shelves View"}
            >
              <StretchHorizontal className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange("grid")}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid" 
                  ? "bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] shadow-xs" 
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
              }`}
              title={isRtl ? "عرض شبكي" : "Grid View"}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange("list")}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === "list" 
                  ? "bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] shadow-xs" 
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
              }`}
              title={isRtl ? "عرض القائمة" : "List View"}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2.5 px-4 pe-9 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAF8F5] dark:bg-[#070D1E] text-xs outline-none focus:border-[#E89A5B] transition-all cursor-pointer appearance-none font-bold"
            >
              <option value="featured" className="dark:bg-[#0B132B]">{t("store.catalog.sort_featured", "Featured")}</option>
              <option value="price-low" className="dark:bg-[#0B132B]">{t("store.catalog.sort_price_low", "Price: Low to High")}</option>
              <option value="price-high" className="dark:bg-[#0B132B]">{t("store.catalog.sort_price_high", "Price: High to Low")}</option>
              <option value="rating" className="dark:bg-[#0B132B]">{t("store.catalog.sort_rating", "Top Rated")}</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3. التخطيط الرئيسي */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div className="hidden lg:block lg:col-span-1 sticky top-28">
          <CatalogFilters
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            maxPrice={maxPriceFilter}
            setMaxPrice={setMaxPriceFilter}
            minRating={minRatingFilter}
            setMinRating={setMinRatingFilter}
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
            onSaleOnly={onSaleOnly}
            setOnSaleOnly={setOnSaleOnly}
            onReset={handleResetFilters}
            isRtl={isRtl}
          />
        </div>

        <div className="lg:col-span-3 space-y-8">
          {hasActiveFilters && (
            <div className="p-4 rounded-2xl bg-white dark:bg-[#121c38] border border-black/5 dark:border-white/10 flex items-center flex-wrap gap-2 shadow-xs">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t("store.catalog.active_filters", "Active:")}</span>
              {selectedCategory !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E89A5B]/10 text-[#E89A5B] text-[11px] font-bold">
                  <span>{getCategoryLabel(selectedCategory)}</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory("all")} />
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E89A5B]/10 text-[#E89A5B] text-[11px] font-bold">
                  <span>"{searchQuery}"</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                </span>
              )}
              {maxPriceFilter < 5000 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E89A5B]/10 text-[#E89A5B] text-[11px] font-bold">
                  <span>Max: {currencyLabel} {maxPriceFilter}</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setMaxPriceFilter(5000)} />
                </span>
              )}
              {minRatingFilter > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E89A5B]/10 text-[#E89A5B] text-[11px] font-bold">
                  <span>{minRatingFilter}+ ⭐</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setMinRatingFilter(0)} />
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E89A5B]/10 text-[#E89A5B] text-[11px] font-bold">
                  <span>{t("store.catalog.in_stock_only", "In Stock Only")}</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setInStockOnly(false)} />
                </span>
              )}
              {onSaleOnly && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E89A5B]/10 text-[#E89A5B] text-[11px] font-bold">
                  <span>{t("store.catalog.on_sale_only", "On Sale")}</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setOnSaleOnly(false)} />
                </span>
              )}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-rose-500 hover:underline ms-auto cursor-pointer"
              >
                {t("store.catalog.clear_all", "Clear All")}
              </button>
            </div>
          )}

          {loading ? (
            <div className="space-y-10">
              {[1, 2, 3].map((n) => (
                <div key={n} className="space-y-4">
                  <div className="h-6 bg-black/10 dark:bg-white/10 rounded-lg w-48 animate-pulse" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((card) => (
                      <div key={card} className="aspect-square bg-black/5 dark:bg-white/5 rounded-3xl animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24 rounded-3xl bg-white dark:bg-[#121c38] border border-dashed border-black/10 dark:border-white/10 space-y-4">
              <PackageX className="w-12 h-12 text-slate-400 mx-auto opacity-40 animate-bounce" />
              <p className="text-sm font-black uppercase tracking-wider">
                {t("store.collections_page.no_results", "No pieces found matching your criteria")}
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-7 py-3 rounded-2xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-xs font-black uppercase tracking-wider cursor-pointer shadow-md hover:opacity-90 active:scale-95 transition"
              >
                {t("store.catalog.clear_filters", "Reset Filters")}
              </button>
            </div>
          ) : (
            <>
              {/* 1. نمط الأرفف */}
              {viewMode === "shelves" && (
                <div className="space-y-12">
                  {Object.entries(groupedShelves).map(([catKey, items]) => {
                    const safeKey = catKey.replace(/[^a-zA-Z0-9]/g, "-");
                    return (
                      <section key={catKey} className="space-y-4">
                        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#E89A5B]" />
                            <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">
                              {getCategoryLabel(catKey)}
                            </h3>
                            <span className="text-[10px] text-slate-400 font-bold bg-black/5 dark:bg-white/5 px-2.5 py-0.5 rounded-full">
                              {items.length} {t("store.collections_page.items_count", "pieces")}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => scrollShelf(safeKey, "prev")}
                              className="p-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                            >
                              {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => scrollShelf(safeKey, "next")}
                              className="p-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                            >
                              {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div
                          id={`shelf-carousel-${safeKey}`}
                          className="flex gap-4 overflow-x-auto scroll-smooth pb-4 snap-x no-scrollbar"
                          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                        >
                          {items.map((product) => {
                            const prodId = product._id || product.id;
                            const isWish = isInWishlist(prodId);
                            const isCompared = compareList.some((p) => (p.id || p._id) === prodId);
                            const price = Number(product.price) || 0;
                            const discountPrice = Number(product.discountPrice) || 0;
                            const hasDiscount = discountPrice > 0 && discountPrice < price;
                            const finalPrice = hasDiscount ? discountPrice : price;
                            const stock = Number(product.stock !== undefined && product.stock !== null ? product.stock : 10);
                            const isOutOfStock = stock <= 0;
                            const imgUrl = resolveProductImage(product);
                            const title = product.title || product.name || "Luxury Item";

                            return (
                              <div
                                key={prodId}
                                className="w-52 sm:w-60 shrink-0 snap-start bg-white dark:bg-[#121c38] rounded-3xl border border-black/5 dark:border-white/10 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
                              >
                                <div>
                                  <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-black/30">
                                    <Link to={`/products/${prodId}`}>
                                      <img
                                        src={imgUrl}
                                        alt={title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                      />
                                    </Link>

                                    {hasDiscount && !isOutOfStock && (
                                      <div className="absolute top-3 start-3 bg-[#E89A5B] text-[#0B132B] text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                                        {Math.round(((price - discountPrice) / price) * 100)}% OFF
                                      </div>
                                    )}

                                    {isOutOfStock && (
                                      <div className="absolute top-3 start-3">
                                        <span className="px-2.5 py-1 rounded-full bg-[#0B132B]/90 backdrop-blur-md text-[#E89A5B] border border-[#E89A5B]/30 text-[9px] font-black uppercase tracking-wider shadow-sm">
                                          {isRtl ? 'غير متوفر' : 'Out of Stock'}
                                        </span>
                                      </div>
                                    )}

                                    <div className="absolute top-3 end-3 flex flex-col gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                                      <button
                                        type="button"
                                        onClick={(e) => handleWishlistClick(e, product)}
                                        className={`p-2 rounded-xl backdrop-blur-md transition cursor-pointer shadow-md ${
                                          isWish ? "bg-rose-500 text-white" : "bg-white/80 dark:bg-[#070D1E]/80 text-slate-700 dark:text-white hover:bg-white"
                                        }`}
                                      >
                                        <Heart className={`w-3.5 h-3.5 ${isWish ? "fill-current" : ""}`} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => toggleCompare(e, product)}
                                        className={`p-2 rounded-xl backdrop-blur-md transition cursor-pointer shadow-md ${
                                          isCompared ? "bg-[#E89A5B] text-[#0B132B]" : "bg-white/80 dark:bg-[#070D1E]/80 text-slate-700 dark:text-white hover:bg-white"
                                        }`}
                                      >
                                        <Scale className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); setQuickViewProduct(product); }}
                                        className="p-2 rounded-xl backdrop-blur-md bg-white/80 dark:bg-[#070D1E]/80 text-slate-700 dark:text-white hover:bg-white transition cursor-pointer shadow-md"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="p-4 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-black text-[#E89A5B] uppercase tracking-wider truncate">
                                        {getCategoryLabel(catKey)}
                                      </span>
                                      <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold">
                                        <Star className="w-3 h-3 fill-current" />
                                        <span>{Number(product.averageRating || product.rating || 5).toFixed(1)}</span>
                                      </div>
                                    </div>

                                    <Link to={`/products/${prodId}`}>
                                      <h4 className="font-bold text-xs line-clamp-1 hover:text-[#E89A5B] transition-colors" title={title}>
                                        {title}
                                      </h4>
                                    </Link>

                                    <div className="flex items-baseline gap-2 pt-0.5">
                                      <span className="font-mono text-xs font-black text-[#0B132B] dark:text-white">
                                        {currencyLabel} {formatPrice(finalPrice)}
                                      </span>
                                      {hasDiscount && (
                                        <span className="font-mono text-[10px] text-slate-400 line-through">
                                          {currencyLabel} {formatPrice(price)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="p-4 pt-0">
                                  <button
                                    type="button"
                                    disabled={isOutOfStock || addingId === prodId}
                                    onClick={(e) => handleSafeAddToCart(e, product)}
                                    className={`w-full py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
                                      isOutOfStock
                                        ? "bg-black/5 dark:bg-white/5 text-slate-400 border border-black/10 dark:border-white/10 cursor-not-allowed"
                                        : "bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] hover:opacity-90 shadow-md"
                                    }`}
                                  >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    <span>
                                      {addingId === prodId 
                                        ? "..." 
                                        : isOutOfStock 
                                          ? t("store.catalog.out_of_stock", "Out of Stock") 
                                          : t("store.catalog.add_to_cart", "Add to Bag")}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })}
                </div>
              )}

              {/* 2. نمط الشبكة */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => {
                    const prodId = product._id || product.id;
                    const isWish = isInWishlist(prodId);
                    const isCompared = compareList.some((p) => (p.id || p._id) === prodId);
                    const price = Number(product.price) || 0;
                    const discountPrice = Number(product.discountPrice) || 0;
                    const hasDiscount = discountPrice > 0 && discountPrice < price;
                    const finalPrice = hasDiscount ? discountPrice : price;
                    const stock = Number(product.stock !== undefined && product.stock !== null ? product.stock : 10);
                    const isOutOfStock = stock <= 0;
                    const imgUrl = resolveProductImage(product);
                    const title = product.title || product.name || "Luxury Item";

                    return (
                      <div
                        key={prodId}
                        className="bg-white dark:bg-[#121c38] rounded-3xl border border-black/5 dark:border-white/10 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-black/30">
                            <Link to={`/products/${prodId}`}>
                              <img
                                src={imgUrl}
                                alt={title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                            </Link>

                            {hasDiscount && !isOutOfStock && (
                              <div className="absolute top-3.5 start-3.5 bg-[#E89A5B] text-[#0B132B] text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                                {Math.round(((price - discountPrice) / price) * 100)}% OFF
                              </div>
                            )}

                            {isOutOfStock && (
                              <div className="absolute top-3.5 start-3.5">
                                <span className="px-3 py-1 rounded-full bg-[#0B132B]/90 backdrop-blur-md text-[#E89A5B] border border-[#E89A5B]/30 text-[9px] font-black uppercase tracking-wider shadow-sm">
                                  {isRtl ? 'غير متوفر' : 'Out of Stock'}
                                </span>
                              </div>
                            )}

                            <div className="absolute top-3.5 end-3.5 flex flex-col gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={(e) => handleWishlistClick(e, product)}
                                className={`p-2 rounded-xl backdrop-blur-md transition cursor-pointer shadow-md ${
                                  isWish ? "bg-rose-500 text-white" : "bg-white/80 dark:bg-[#070D1E]/80 text-slate-700 dark:text-white hover:bg-white"
                                }`}
                              >
                                <Heart className={`w-3.5 h-3.5 ${isWish ? "fill-current" : ""}`} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => toggleCompare(e, product)}
                                className={`p-2 rounded-xl backdrop-blur-md transition cursor-pointer shadow-md ${
                                  isCompared ? "bg-[#E89A5B] text-[#0B132B]" : "bg-white/80 dark:bg-[#070D1E]/80 text-slate-700 dark:text-white hover:bg-white"
                                }`}
                              >
                                <Scale className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); setQuickViewProduct(product); }}
                                className="p-2 rounded-xl backdrop-blur-md bg-white/80 dark:bg-[#070D1E]/80 text-slate-700 dark:text-white hover:bg-white transition cursor-pointer shadow-md"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="p-5 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-[#E89A5B] uppercase tracking-wider truncate">
                                {typeof product.category === "object" ? product.category?.name : product.category}
                              </span>
                              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                                <Star className="w-3 h-3 fill-current" />
                                <span>{Number(product.averageRating || product.rating || 5).toFixed(1)}</span>
                              </div>
                            </div>

                            <Link to={`/products/${prodId}`}>
                              <h4 className="font-black text-sm line-clamp-1 hover:text-[#E89A5B] transition-colors" title={title}>
                                {title}
                              </h4>
                            </Link>

                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 font-light leading-relaxed">
                              {product.description}
                            </p>

                            <div className="flex items-baseline gap-2 pt-1">
                              <span className="font-mono text-sm font-black text-[#0B132B] dark:text-white">
                                {currencyLabel} {formatPrice(finalPrice)}
                              </span>
                              {hasDiscount && (
                                <span className="font-mono text-xs text-slate-400 line-through">
                                  {currencyLabel} {formatPrice(price)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="p-5 pt-0">
                          <button
                            type="button"
                            disabled={isOutOfStock || addingId === prodId}
                            onClick={(e) => handleSafeAddToCart(e, product)}
                            className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer ${
                              isOutOfStock
                                ? "bg-black/5 dark:bg-white/5 text-slate-400 border border-black/10 dark:border-white/10 cursor-not-allowed"
                                : "bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] hover:opacity-90 shadow-md"
                            }`}
                          >
                            <ShoppingBag className="w-4 h-4" />
                            <span>
                              {addingId === prodId 
                                ? "..." 
                                : isOutOfStock 
                                  ? t("store.catalog.out_of_stock", "Out of Stock") 
                                  : t("store.catalog.add_to_cart", "Add to Bag")}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 3. نمط القائمة */}
              {viewMode === "list" && (
                <div className="space-y-4">
                  {filteredProducts.map((product) => {
                    const prodId = product._id || product.id;
                    const isWish = isInWishlist(prodId);
                    const isCompared = compareList.some((p) => (p.id || p._id) === prodId);
                    const price = Number(product.price) || 0;
                    const discountPrice = Number(product.discountPrice) || 0;
                    const hasDiscount = discountPrice > 0 && discountPrice < price;
                    const finalPrice = hasDiscount ? discountPrice : price;
                    const stock = Number(product.stock !== undefined && product.stock !== null ? product.stock : 10);
                    const isOutOfStock = stock <= 0;
                    const imgUrl = resolveProductImage(product);
                    const title = product.title || product.name || "Luxury Item";

                    return (
                      <div
                        key={prodId}
                        className="bg-white dark:bg-[#121c38] rounded-3xl border border-black/5 dark:border-white/10 p-5 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row items-center gap-6 group"
                      >
                        <div className="relative w-full sm:w-44 aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-black/30 shrink-0">
                          <Link to={`/products/${prodId}`}>
                            <img
                              src={imgUrl}
                              alt={title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </Link>
                          {hasDiscount && !isOutOfStock && (
                            <div className="absolute top-2.5 start-2.5 bg-[#E89A5B] text-[#0B132B] text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs">
                              {Math.round(((price - discountPrice) / price) * 100)}% OFF
                            </div>
                          )}
                          {isOutOfStock && (
                            <div className="absolute top-2.5 start-2.5">
                              <span className="px-2 py-0.5 rounded-full bg-[#0B132B]/90 backdrop-blur-md text-[#E89A5B] border border-[#E89A5B]/30 text-[9px] font-black uppercase tracking-wider shadow-sm">
                                {isRtl ? 'غير متوفر' : 'Out of Stock'}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-2 text-center sm:text-start w-full">
                          <div className="flex items-center justify-center sm:justify-start gap-3">
                            <span className="text-[10px] font-black text-[#E89A5B] uppercase tracking-wider">
                              {typeof product.category === "object" ? product.category?.name : product.category}
                            </span>
                            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                              <Star className="w-3 h-3 fill-current" />
                              <span>{Number(product.averageRating || product.rating || 5).toFixed(1)}</span>
                            </div>
                          </div>

                          <Link to={`/products/${prodId}`}>
                            <h4 className="font-black text-base hover:text-[#E89A5B] transition-colors">
                              {title}
                            </h4>
                          </Link>

                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 font-light leading-relaxed">
                            {product.description}
                          </p>

                          <div className="flex items-center justify-center sm:justify-start gap-4 pt-1">
                            <span className="font-mono text-base font-black text-[#0B132B] dark:text-white">
                              {currencyLabel} {formatPrice(finalPrice)}
                            </span>
                            {hasDiscount && (
                              <span className="font-mono text-xs text-slate-400 line-through">
                                {currencyLabel} {formatPrice(price)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex sm:flex-col gap-2 w-full sm:w-44 shrink-0">
                          <button
                            type="button"
                            disabled={isOutOfStock || addingId === prodId}
                            onClick={(e) => handleSafeAddToCart(e, product)}
                            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer ${
                              isOutOfStock
                                ? "bg-black/5 dark:bg-white/5 text-slate-400 border border-black/10 dark:border-white/10 cursor-not-allowed"
                                : "bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] hover:opacity-90 shadow-md"
                            }`}
                          >
                            <ShoppingBag className="w-4 h-4" />
                            <span>
                              {addingId === prodId 
                                ? "..." 
                                : isOutOfStock 
                                  ? t("store.catalog.out_of_stock", "Out") 
                                  : t("store.catalog.add_to_cart", "Add to Bag")}
                            </span>
                          </button>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={(e) => handleWishlistClick(e, product)}
                              className={`p-3 flex-1 rounded-xl border border-black/5 dark:border-white/10 flex items-center justify-center transition cursor-pointer ${
                                isWish ? "bg-rose-500 text-white" : "hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300"
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${isWish ? "fill-current" : ""}`} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => toggleCompare(e, product)}
                              className={`p-3 flex-1 rounded-xl border border-black/5 dark:border-white/10 flex items-center justify-center transition cursor-pointer ${
                                isCompared ? "bg-[#E89A5B] text-[#0B132B]" : "hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300"
                              }`}
                            >
                              <Scale className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); setQuickViewProduct(product); }}
                              className="p-3 flex-1 rounded-xl border border-black/5 dark:border-white/10 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer text-slate-600 dark:text-slate-300"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {recentItems.length > 0 && (
            <div className="pt-10 border-t border-black/5 dark:border-white/10">
              <RecentlyViewed 
                items={recentItems} 
                onAddToCart={(prod, qty) => addToCartGlobal(prod, qty)} 
              />
            </div>
          )}
        </div>
      </div>

      {/* 4. نافذة الفلاتر للجوال */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className={`w-80 max-w-[85%] bg-[#FAF8F5] dark:bg-[#070D1E] h-full p-6 overflow-y-auto ${isRtl ? "mr-auto" : "ml-auto"} shadow-2xl`}>
            <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 mb-6">
              <h3 className="font-black text-sm uppercase tracking-wider">{t("store.catalog.filters", "Filters")}</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1.5 rounded-full hover:bg-black/5 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <CatalogFilters
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={(cat) => { setSelectedCategory(cat); setMobileFilterOpen(false); }}
              maxPrice={maxPriceFilter}
              setMaxPrice={setMaxPriceFilter}
              minRating={minRatingFilter}
              setMinRating={setMinRatingFilter}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              onSaleOnly={onSaleOnly}
              setOnSaleOnly={setOnSaleOnly}
              onReset={handleResetFilters}
              isRtl={isRtl}
            />
          </div>
        </div>
      )}

      {/* 5. نافذة المقارنة */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn" dir={isRtl ? "rtl" : "ltr"}>
          <div className="bg-[#FAF8F5] dark:bg-[#0B132B] border border-black/10 dark:border-white/10 w-full max-w-5xl rounded-[32px] shadow-2xl p-6 sm:p-10 space-y-6 relative max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <Scale className="w-5 h-5 text-[#E89A5B]" />
                <h3 className="font-black text-base uppercase tracking-wider">
                  {t("store.catalog.compare_title", "Curated Spec Comparison")}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCompareModal(false)} 
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {compareList.map((item) => {
                const itemImg = resolveProductImage(item);
                const price = Number(item.price) || 0;
                const discountPrice = Number(item.discountPrice) || 0;
                const finalPrice = discountPrice > 0 && discountPrice < price ? discountPrice : price;
                const prodId = item.id || item._id;

                return (
                  <div key={prodId} className="bg-white dark:bg-[#121c38] p-5 rounded-3xl space-y-4 relative border border-black/5 dark:border-white/10 shadow-xs flex flex-col justify-between">
                    <div className="space-y-3">
                      <button 
                        type="button" 
                        onClick={() => setCompareList((prev) => prev.filter((p) => (p.id || p._id) !== prodId))}
                        className={`absolute top-4 ${isRtl ? "start-4" : "end-4"} p-1.5 text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 rounded-full cursor-pointer z-10`}
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 dark:bg-black/20">
                        <img 
                          src={itemImg} 
                          alt={item.title || item.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-[#E89A5B] uppercase tracking-wider">
                          {typeof item.category === "object" ? item.category?.name : item.category}
                        </span>
                        <h4 className="font-black text-sm uppercase line-clamp-1">{item.title || item.name}</h4>
                        <p className="text-base font-black text-[#0B132B] dark:text-white font-mono">
                          {currencyLabel} {formatPrice(finalPrice)}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <p className="flex justify-between">
                          <span>{t("store.catalog.rating", "Rating")}:</span>
                          <span className="font-bold text-amber-500">⭐ {Number(item.averageRating || item.rating || 5).toFixed(1)}</span>
                        </p>
                        <p className="flex justify-between">
                          <span>{t("store.catalog.stock_status", "Stock")}:</span>
                          <span className="font-bold text-emerald-500">{Number(item.stock ?? 10) > 0 ? "Available" : "Exhausted"}</span>
                        </p>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed font-light">
                        {item.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={Number(item.stock ?? 10) <= 0}
                      onClick={(e) => handleSafeAddToCart(e, item)}
                      className="w-full py-3 rounded-xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-xs font-black uppercase tracking-wider cursor-pointer shadow-md hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t("store.catalog.add_to_cart", "Add to Bag")}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="px-8 py-3.5 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-xs font-black uppercase tracking-wider cursor-pointer transition"
              >
                {t("store.catalog.close_compare", "Dismiss Drawer")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. نافذة المعاينة السريعة */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn" dir={isRtl ? "rtl" : "ltr"}>
          <div className="bg-[#FAF8F5] dark:bg-[#0B132B] border border-black/10 dark:border-white/10 w-full max-w-3xl rounded-[36px] shadow-2xl p-6 sm:p-10 space-y-6 relative max-h-[90vh] overflow-y-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setQuickViewProduct(null)}
              className={`absolute top-6 ${isRtl ? "start-6" : "end-6"} p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer z-10`}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
              <div className="aspect-square rounded-3xl overflow-hidden bg-slate-100 dark:bg-black/30 border border-black/5 dark:border-white/10">
                <img
                  src={resolveProductImage(quickViewProduct)}
                  alt={quickViewProduct.name || quickViewProduct.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <span className="text-xs font-black uppercase tracking-widest text-[#E89A5B] block">
                  {typeof quickViewProduct.category === "object" ? quickViewProduct.category?.name : quickViewProduct.category}
                </span>

                <h3 className="text-2xl font-black uppercase tracking-tight">
                  {quickViewProduct.name || quickViewProduct.title}
                </h3>

                <div className="flex items-center gap-2 text-amber-500 text-xs font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{Number(quickViewProduct.averageRating || quickViewProduct.rating || 5).toFixed(1)} / 5.0</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-light leading-relaxed">
                  {quickViewProduct.description}
                </p>

                <div className="flex items-baseline gap-3 pt-1">
                  <span className="font-mono text-2xl font-black text-[#0B132B] dark:text-white">
                    {currencyLabel} {formatPrice(quickViewProduct.discountPrice || quickViewProduct.price)}
                  </span>
                  {quickViewProduct.discountPrice && quickViewProduct.discountPrice < quickViewProduct.price && (
                    <span className="font-mono text-sm text-slate-400 line-through">
                      {currencyLabel} {formatPrice(quickViewProduct.price)}
                    </span>
                  )}
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <button
                    type="button"
                    disabled={Number(quickViewProduct.stock ?? 10) <= 0}
                    onClick={(e) => {
                      handleSafeAddToCart(e, quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className="w-full py-4 rounded-2xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-xs font-black uppercase tracking-wider hover:opacity-90 transition flex items-center justify-center gap-2 shadow-xl cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{Number(quickViewProduct.stock ?? 10) <= 0 ? t("store.catalog.out_of_stock", "Out of Stock") : t("store.catalog.add_to_cart", "Acquire Piece")}</span>
                  </button>

                  <Link
                    to={`/products/${quickViewProduct._id || quickViewProduct.id}`}
                    onClick={() => setQuickViewProduct(null)}
                    className="text-center py-2 text-xs font-bold text-[#E89A5B] hover:underline"
                  >
                    {isRtl ? "عرض تفاصيل المواصفات الكاملة ←" : "View Full Dossier & Specs →"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StoreCatalog;