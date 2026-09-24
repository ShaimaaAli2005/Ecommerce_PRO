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
  ArrowUpDown 
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

  const [maxPriceFilter, setMaxPriceFilter] = useState(5000);
  const [minRatingFilter, setMinRatingFilter] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [recentItems, setRecentItems] = useState([]);

  // حالة المقارنة بين المنتجات
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const cached = sessionStorage.getItem("luma_catalog_cache");
      if (cached) {
        setProducts(JSON.parse(cached));
        setLoading(false);
      } else {
        setLoading(true);
      }

      const res = await productService.getProducts({ limit: 100 });
      const items = Array.isArray(res) ? res : (res?.products || res?.data?.products || res?.data || []);
      const validItems = Array.isArray(items) ? items.filter((p) => p && (p._id || p.id)) : [];

      setProducts(validItems);
      sessionStorage.setItem("luma_catalog_cache", JSON.stringify(validItems));
    } catch (err) {
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
    } catch (e) {
      // تجاهل أخطاء التخزين
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

    const stock = product.stock !== undefined && product.stock !== null ? Number(product.stock) : 10;
    if (stock <= 0) {
      toast.error(t("store.catalog.out_of_stock_error", "Piece is temporarily out of stock"));
      return;
    }

    await addToCartGlobal(product, 1);
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

  // تصفية وترتيب وتجميع المنتجات إلى صفوف أقسام أفقية بناءً على خيارات السايد بار والبحث
  const groupedShelves = useMemo(() => {
    const filtered = products.filter((item) => {
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
      const matchesStock = inStockOnly ? (item.stock ?? 10) > 0 : true;
      const matchesSale = onSaleOnly ? hasDiscount : true;

      return matchesCategory && matchesSearch && matchesPrice && matchesRating && matchesStock && matchesSale;
    }).sort((a, b) => {
      const priceA = Number(a.discountPrice && a.discountPrice > 0 ? a.discountPrice : a.price) || 0;
      const priceB = Number(b.discountPrice && b.discountPrice > 0 ? b.discountPrice : b.price) || 0;
      if (sortBy === "price-low") return priceA - priceB;
      if (sortBy === "price-high") return priceB - priceA;
      if (sortBy === "rating") return (b.averageRating || b.rating || 5) - (a.averageRating || a.rating || 5);
      return 0;
    });

    return filtered.reduce((acc, product) => {
      const rawCat = typeof product.category === "object" ? (product.category?.name || "Bespoke Collection") : (product.category || "Bespoke Collection");
      if (!acc[rawCat]) acc[rawCat] = [];
      acc[rawCat].push(product);
      return acc;
    }, {});
  }, [products, selectedCategory, searchQuery, sortBy, maxPriceFilter, minRatingFilter, inStockOnly, onSaleOnly]);

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
      <div className={`fixed bottom-8 ${isRtl ? "start-8" : "end-8"} z-50 transition-all duration-500 pointer-events-none ${compareList.length > 0 ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-95"}`}>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); setShowCompareModal(true); }}
          className="pointer-events-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#E89A5B] to-[#d4894d] text-[#0B132B] text-xs font-black tracking-wider uppercase shadow-2xl hover:scale-105 transition-all flex items-center gap-2.5 border border-white/20 cursor-pointer backdrop-blur-lg"
        >
          <Scale className="w-4 h-4" />
          <span>{t("store.catalog.compare", "Compare")} ({compareList.length})</span>
        </button>
      </div>

      {/* 1. الترويسة الرئيسية الخاصة بصفحة الكتالوج / المجموعات */}
      <div className="text-center max-w-3xl mx-auto space-y-3 relative">
        <div className="absolute left-1/2 -translate-x-1/2 -top-6 w-32 h-12 bg-[#E89A5B]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs font-bold tracking-widest uppercase">
          <Layers className="w-3.5 h-3.5 text-[#E89A5B]" />
          <span>{t("store.collections_page.badge", "Complete Collections Archive")}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight uppercase">
          {t("store.collections_page.title", "The LUMA Collections")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed font-light">
          {t("store.collections_page.subtitle", "Explore our curated departmental galleries where precision engineering meets timeless architectural beauty.")}
        </p>
      </div>

      {/* 2. شريط البحث والترتيب العلوي */}
      <div className="max-w-7xl mx-auto bg-white/70 dark:bg-[#121c38]/70 backdrop-blur-2xl p-4 sm:p-5 rounded-3xl border border-black/5 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="relative w-full sm:w-80 lg:w-96">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("store.collections_page.search_placeholder", "Filter by piece name or category across archive...")}
            className={`w-full py-2.5 ${isRtl ? "pe-4 ps-11" : "ps-4 pe-11"} rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-xs outline-none focus:border-[#E89A5B] transition-all font-medium`}
          />
          <Search className={`w-4 h-4 text-slate-400 absolute ${isRtl ? "start-4" : "end-4"} top-1/2 -translate-y-1/2`} />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* زر فتح الفلاتر على الموبايل */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-xs font-bold flex items-center gap-2"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#E89A5B]" />
            <span>{t("store.catalog.filters", "Filters")}</span>
          </button>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2.5 px-4 pe-9 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-xs outline-none focus:border-[#E89A5B] transition-all cursor-pointer appearance-none font-bold"
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

      {/* 3. تخطيط الصفحة: السايد بار الجانبي + الرفوف الأفقية */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* السايد بار في الشاشات الكبيرة */}
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

        {/* المساحة الرئيسية: الرفوف الأفقية للأقسام */}
        <div className="lg:col-span-3 space-y-12">
          
          {/* شريط الفلاتر النشطة */}
          {hasActiveFilters && (
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-[#121c38]/60 border border-black/5 dark:border-white/10 flex items-center flex-wrap gap-2 animate-fadeIn">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("store.catalog.active_filters", "Active:")}</span>
              
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
                  <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4].map((card) => (
                      <div key={card} className="w-48 sm:w-56 h-72 bg-black/5 dark:bg-white/5 rounded-2xl shrink-0 animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : Object.keys(groupedShelves).length === 0 ? (
            <div className="text-center py-24 rounded-3xl bg-white/40 dark:bg-white/[0.02] border border-dashed border-black/10 dark:border-white/10 space-y-3">
              <PackageX className="w-10 h-10 text-slate-400 mx-auto opacity-40" />
              <p className="text-xs font-bold text-slate-400">
                {t("store.collections_page.no_results", "No pieces found matching your filter criteria")}
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-6 py-2 rounded-xl bg-[#0B132B] dark:bg-white text-white dark:text-[#0B132B] text-xs font-bold cursor-pointer"
              >
                {t("store.catalog.clear_filters", "Reset Filters")}
              </button>
            </div>
          ) : (
            Object.entries(groupedShelves).map(([catKey, items]) => {
              const safeKey = catKey.replace(/[^a-zA-Z0-9]/g, "-");
              return (
                <section key={catKey} className="space-y-4">
                  
                  {/* رأس القسم مع أسهم التنقل */}
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
                        className="p-1.5 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                        aria-label="Previous"
                      >
                        {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollShelf(safeKey, "next")}
                        className="p-1.5 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                        aria-label="Next"
                      >
                        {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* الحاوية الأفقية للمنتجات */}
                  <div
                    id={`shelf-carousel-${safeKey}`}
                    className="flex gap-4 overflow-x-auto scroll-smooth pb-3 snap-x no-scrollbar"
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

                      const stock = product.stock !== undefined && product.stock !== null ? Number(product.stock) : 10;
                      const isOutOfStock = stock <= 0;
                      const imgUrl = resolveProductImage(product);
                      const title = product.title || product.name || "Luxury Item";
                      const rating = Number(product.averageRating || product.rating || 4.8);

                      return (
                        <div
                          key={prodId}
                          className="w-48 sm:w-56 shrink-0 snap-start bg-white dark:bg-[#121c38] rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                        >
                          <div>
                            {/* صورة المنتج */}
                            <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-gray-900">
                              <Link to={`/products/${prodId}`}>
                                <img
                                  src={imgUrl}
                                  alt={title}
                                  onError={(e) => { e.currentTarget.src = "https://placehold.co/400"; }}
                                  className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isOutOfStock ? "opacity-50 grayscale" : ""}`}
                                />
                              </Link>

                              {/* شارة الخصم */}
                              {hasDiscount && !isOutOfStock && (
                                <div className="absolute top-2.5 start-2.5 bg-[#E89A5B] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                                  {Math.round(((price - discountPrice) / price) * 100)}%
                                </div>
                              )}

                              {/* شارة نفاد المخزون */}
                              {isOutOfStock && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                                  <span className="bg-rose-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow">
                                    {t("store.catalog.out_of_stock", "Out of Stock")}
                                  </span>
                                </div>
                              )}

                              {/* أزرار المفضلة والمقارنة */}
                              <div className="absolute top-2.5 end-2.5 flex flex-col gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => handleWishlistClick(e, product)}
                                  className={`p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-xs ${
                                    isWish ? "bg-rose-500 text-white" : "bg-white/80 dark:bg-gray-800/80 text-slate-700 dark:text-white hover:bg-white"
                                  }`}
                                  title="Wishlist"
                                >
                                  <Heart className={`w-3.5 h-3.5 ${isWish ? "fill-current" : ""}`} />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => toggleCompare(e, product)}
                                  className={`p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-xs ${
                                    isCompared ? "bg-[#E89A5B] text-[#0B132B]" : "bg-white/80 dark:bg-gray-800/80 text-slate-700 dark:text-white hover:bg-white"
                                  }`}
                                  title="Compare"
                                >
                                  <Scale className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* تفاصيل المنتج والتقييم */}
                            <div className="p-3.5 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-[#E89A5B] uppercase tracking-wider truncate">
                                  {getCategoryLabel(catKey)}
                                </span>
                                <div className="flex items-center gap-0.5 text-amber-500 text-[10px] font-bold">
                                  <Star className="w-2.5 h-2.5 fill-current" />
                                  <span>{rating.toFixed(1)}</span>
                                </div>
                              </div>

                              <Link to={`/products/${prodId}`}>
                                <h4 className="font-bold text-xs line-clamp-1 hover:text-[#E89A5B] transition-colors" title={title}>
                                  {title}
                                </h4>
                              </Link>

                              <div className="flex items-baseline gap-1.5 pt-0.5">
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

                          {/* زر الإضافة السريع للسلة */}
                          <div className="p-3.5 pt-0">
                            <button
                              type="button"
                              disabled={isOutOfStock}
                              onClick={(e) => handleSafeAddToCart(e, product)}
                              className={`w-full py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 ${
                                isOutOfStock
                                  ? "bg-black/5 dark:bg-white/5 text-slate-400 cursor-not-allowed border border-black/5"
                                  : "bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] hover:opacity-90 cursor-pointer shadow-xs"
                              }`}
                            >
                              <ShoppingBag className="w-3 h-3" />
                              <span>{isOutOfStock ? t("store.catalog.out_of_stock", "Out of Stock") : t("store.catalog.add_to_cart", "Add to Bag")}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}

          {/* قسم المشاهدة مؤخراً */}
          {recentItems.length > 0 && (
            <div className="pt-8 border-t border-black/5 dark:border-white/10">
              <RecentlyViewed 
                items={recentItems} 
                onAddToCart={(prod, qty) => addToCartGlobal(prod, qty)} 
              />
            </div>
          )}
        </div>

      </div>

      {/* 4. نافذة الفلاتر المنبثقة للجوال */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-xs">
          <div className={`w-80 max-w-[85%] bg-[#FAF8F5] dark:bg-[#070D1E] h-full p-6 overflow-y-auto ${isRtl ? "mr-auto" : "ml-auto"}`}>
            <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 mb-6">
              <h3 className="font-black text-sm uppercase">{t("store.catalog.filters", "Filters")}</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1">
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

      {/* 5. نافذة المقارنة التفاعلية (Modal) */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn" dir={isRtl ? "rtl" : "ltr"}>
          <div className="bg-[#FAF8F5] dark:bg-[#0B132B] border border-black/10 dark:border-white/10 w-full max-w-4xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <Scale className="w-5 h-5 text-[#E89A5B]" />
                <h3 className="font-black text-base uppercase tracking-wider">
                  {t("store.catalog.compare_title", "Product Comparison")}
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 overflow-x-auto">
              {compareList.map((item) => {
                const itemImg = resolveProductImage(item);
                return (
                  <div key={item.id || item._id} className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl space-y-3 relative">
                    <button 
                      type="button"
                      onClick={() => setCompareList((prev) => prev.filter((p) => (p.id || p._id) !== (item.id || item._id)))}
                      className={`absolute top-2.5 ${isRtl ? "start-2.5" : "end-2.5"} p-1 text-rose-500 hover:bg-rose-500/10 rounded-full cursor-pointer`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <img 
                      src={itemImg} 
                      alt={item.title || item.name} 
                      onError={(e) => { e.currentTarget.src = "https://placehold.co/400"; }} 
                      className="w-full h-36 object-cover rounded-xl" 
                    />
                    <h4 className="font-black text-xs uppercase line-clamp-1">{item.title || item.name}</h4>
                    <p className="text-sm font-black text-[#E89A5B] font-mono">
                      {currencyLabel} {formatPrice(item.price)}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed font-light">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="px-8 py-3 rounded-2xl bg-[#0B132B] dark:bg-white text-white dark:text-[#0B132B] text-xs font-black uppercase tracking-wider shadow-lg cursor-pointer"
              >
                {t("store.catalog.close_compare", "Close Comparison")}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StoreCatalog;