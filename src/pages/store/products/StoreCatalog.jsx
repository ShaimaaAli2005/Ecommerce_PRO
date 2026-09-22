import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Search, SlidersHorizontal, ShoppingBag, Eye, ArrowUpDown, Heart, LayoutGrid, List, Scale, Star, X, Sparkles, Percent, ChevronDown, AlertCircle } from "lucide-react";
import { useSettings } from "../../../context/SettingsContext";
import { useWishlist } from "../../../context/WishlistContext";
import { useCart } from "../../../context/CartContext"; 
import { useNavigate, Link } from "react-router-dom";
import productService from "../../../services/productService";
import toast from "react-hot-toast";

export const StoreCatalog = () => {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");
  const { formatPrice } = useSettings();
  
  // ─── التصحيح هنا: استخدام toggleWishlist المتاحة في الـ Context ───
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCartGlobal } = useCart(); 
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  
  const [maxPriceFilter, setMaxPriceFilter] = useState(5000);
  const [minRatingFilter, setMinRatingFilter] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const cachedProducts = sessionStorage.getItem("luma_catalog_cache");
      if (cachedProducts) {
        setProducts(JSON.parse(cachedProducts));
        setLoading(false);
      } else {
        setLoading(true);
      }

      const res = await productService.getProducts();
      const items = Array.isArray(res) ? res : (res?.products || res?.data?.products || res?.data || []);
      const finalItems = Array.isArray(items) ? items : [];
    
      const cachedString = sessionStorage.getItem("luma_catalog_cache");
      const newString = JSON.stringify(finalItems);
      
      if (cachedString !== newString) {
        setProducts(finalItems);
        sessionStorage.setItem("luma_catalog_cache", newString);
      }
    } catch (err) {
      toast.error(t("store.catalog.fetch_error", "تعذر تحميل المنتجات."));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchProducts]);

  const getCategoryLabel = (rawCategory) => {
    if (!rawCategory || rawCategory === "all") return t("store.catalog.all", "الكل");
    
    let catName = rawCategory;
    if (typeof rawCategory === 'object') {
      catName = rawCategory.name || rawCategory.slug || rawCategory.title || "general";
    }
    
    const catStr = String(catName).toLowerCase().trim();
    const cleanKey = catStr.replace(/[\s-_]+/g, '');

    const translationKey = `store.categories.${cleanKey}`;
    const translated = t(translationKey);
    if (translated && translated !== translationKey) {
      return translated;
    }

    return String(catName).charAt(0).toUpperCase() + String(catName).slice(1);
  };

  const categories = useMemo(() => {
    const allCats = products.map(p => {
      const catField = p.category || p.categoryId || p.categoryName;
      if (!catField) return null;
      
      if (typeof catField === 'object') {
        return catField.name || catField.slug || catField.title || catField._id;
      }
      return catField;
    }).filter(Boolean);

    const uniqueMap = new Map();
    allCats.forEach(cat => {
      const cleanKey = String(cat).toLowerCase().trim().replace(/[\s-_]+/g, '');
      if (!uniqueMap.has(cleanKey)) {
        uniqueMap.set(cleanKey, cat);
      }
    });

    return Array.from(uniqueMap.values());
  }, [products]);

  const handleWishlistClick = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
    if (!token) {
      toast.error(isRtl ? "يرجى تسجيل الدخول أولاً لإدارة المحفوظات" : "Please sign in first to manage wishlist");
      navigate("/login");
      return;
    }

    await toggleWishlist(productId);
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
    if (!token) {
      toast.error(isRtl ? "يرجى تسجيل الدخول أولاً لإضافة منتجات إلى السلة" : "Please sign in first to add items to cart");
      navigate("/login");
      return;
    }

    const stock = product.stock !== undefined && product.stock !== null ? Number(product.stock) : 0;
    if (stock <= 0) {
      toast.error(isRtl ? "هذا المنتج غير متاح حالياً (نفد المخزون)" : "This product is currently unavailable (Out of stock)");
      return;
    }

    const prodId = product._id || product.id;
    await addToCartGlobal(prodId, 1);
  };

  const toggleCompare = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    setCompareList(prev => {
      const prodId = product.id || product._id;
      if (prev.find(p => (p.id || p._id) === prodId)) {
        return prev.filter(p => (p.id || p._id) !== prodId);
      }
      if (prev.length >= 3) {
        alert(t("store.catalog.max_compare_reached", "الحد الأقصى للمقارنة هو 3 منتجات"));
        return prev;
      }
      return [...prev, product];
    });
  };

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const rawCat = typeof item.category === 'object' ? (item.category?.name || item.category?.slug) : item.category;
      const itemCat = String(rawCat || "").toLowerCase().trim();
      const matchesCategory = selectedCategory === "all" || itemCat === selectedCategory.toLowerCase();
      
      const title = item.title || item.name || "";
      const desc = item.description || "";
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          desc.toLowerCase().includes(searchQuery.toLowerCase());
      
      const price = Number(item.price) || 0;
      const discountPrice = Number(item.discountPrice) || 0;
      const hasDiscount = discountPrice > 0 && discountPrice < price;

      const matchesPrice = price <= maxPriceFilter;
      const matchesRating = (item.rating || item.averageRating || 5) >= minRatingFilter;
      const matchesStock = inStockOnly ? (item.stock ?? 10) > 0 : true;
      const matchesSale = onSaleOnly ? hasDiscount : true;

      return matchesCategory && matchesSearch && matchesPrice && matchesRating && matchesStock && matchesSale;
    }).sort((a, b) => {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;
      if (sortBy === "price-low") return priceA - priceB;
      if (sortBy === "price-high") return priceB - priceA;
      if (sortBy === "rating") return (b.rating || b.averageRating || 5) - (a.rating || a.averageRating || 5);
      return 0;
    });
  }, [products, selectedCategory, searchQuery, sortBy, maxPriceFilter, minRatingFilter, inStockOnly, onSaleOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative selection:bg-[#E89A5B]/30 py-8">
      
      {/* زر المقارنة العائم الثابت */}
      <div className={`fixed bottom-8 end-8 z-50 transition-all duration-500 pointer-events-none ${compareList.length > 0 ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-95"}`}>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); setShowCompareModal(true); }}
          className="pointer-events-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#E89A5B] to-[#d4894d] text-[#0B132B] text-xs font-black tracking-wider uppercase shadow-2xl hover:scale-105 transition-all flex items-center gap-2.5 border border-white/20 cursor-pointer backdrop-blur-lg"
        >
          <Scale className="w-4 h-4" />
          <span>{t("store.catalog.compare", "مقارنة")} ({compareList.length})</span>
        </button>
      </div>

      {/* الهيدر */}
      <div className="text-center space-y-3 relative">
        <div className="absolute left-1/2 -translate-x-1/2 -top-6 w-32 h-12 bg-[#E89A5B]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs font-bold tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#E89A5B]" />
          <span>{t("store.catalog.hub_tag", "مجموعة LUMA الحصرية")}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight uppercase font-['Poppins']">
          {t("store.catalog.title", "كاتالوج المنتجات")}
        </h1>
        <p className="text-xs sm:text-sm text-secondary-muted max-w-lg mx-auto leading-relaxed">
          {t("store.catalog.subtitle", "استكشف أحدث التشكيلات والمنتجات المتوفرة لدينا.")}
        </p>
      </div>

      {/* لوحة الفلترة والخدمات */}
      <div className="bg-white/70 dark:bg-[#121c38]/70 backdrop-blur-2xl p-6 rounded-3xl border border-black/5 dark:border-white/10 space-y-6 shadow-xl relative overflow-hidden">
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 relative z-10">
          
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-[#0B132B] dark:bg-white text-white dark:text-[#0B132B] shadow-md scale-105"
                  : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-secondary-muted"
              }`}
            >
              {t("store.catalog.all", "الكل")}
            </button>

            <div className="relative">
              <select
                value={selectedCategory === "all" ? "" : selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value || "all")}
                className="py-2.5 px-4 pe-9 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-xs outline-none focus:border-[#E89A5B] transition-all cursor-pointer appearance-none font-bold text-secondary-muted hover:text-black dark:hover:text-white"
              >
                <option value="" disabled className="dark:bg-[#0B132B]">
                  {isRtl ? "اختر التصنيف..." : "Select Category..."}
                </option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="dark:bg-[#0B132B]">
                    {getCategoryLabel(cat)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-secondary-muted absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full lg:w-auto relative z-10">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("store.catalog.search_placeholder", "ابحث عن منتج...")}
                className="w-full py-2.5 pe-4 ps-11 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-xs outline-none focus:border-[#E89A5B] transition-all font-medium"
              />
              <Search className="w-4 h-4 text-secondary-muted absolute start-4 top-1/2 -translate-y-1/2" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-2.5 px-4 pe-9 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-xs outline-none focus:border-[#E89A5B] transition-all cursor-pointer appearance-none font-bold"
              >
                <option value="featured" className="dark:bg-[#0B132B]">{t("store.catalog.sort_featured", "المميزة")}</option>
                <option value="price-low" className="dark:bg-[#0B132B]">{t("store.catalog.sort_price_low", "السعر: من الأقل للأعلى")}</option>
                <option value="price-high" className="dark:bg-[#0B132B]">{t("store.catalog.sort_price_high", "السعر: من الأعلى للأقل")}</option>
                <option value="rating" className="dark:bg-[#0B132B]">{t("store.catalog.sort_rating", "الأعلى تقييماً")}</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-secondary-muted absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="hidden sm:flex items-center bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-1 gap-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === "grid" ? "bg-[#0B132B] dark:bg-white text-white dark:text-[#0B132B]" : "text-secondary-muted"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === "list" ? "bg-[#0B132B] dark:bg-white text-white dark:text-[#0B132B]" : "text-secondary-muted"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-black/5 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold relative z-10">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <span className="text-secondary-muted shrink-0">{t("store.catalog.max_price", "الحد الأقصى للأسعار")}</span>
            <span className="text-[#E89A5B] font-bold">${maxPriceFilter}</span>
            <input
              type="range"
              min="50"
              max="5000"
              step="50"
              value={maxPriceFilter}
              onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
              className="w-40 sm:w-56 accent-[#E89A5B] cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-5 flex-wrap justify-end w-full md:w-auto">
            <div className="flex items-center gap-1.5">
              <span className="text-secondary-muted">{t("store.catalog.min_rating", "التقييم الأدنى")}</span>
              {[0, 4, 4.5].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setMinRatingFilter(rate)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                    minRatingFilter === rate ? "bg-[#E89A5B] text-[#0B132B] font-bold shadow-sm" : "bg-black/5 dark:bg-white/5 text-secondary-muted hover:bg-black/10"
                  }`}
                >
                  {rate === 0 ? t("store.catalog.all", "الكل") : `${rate}+ ⭐`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#E89A5B] rounded cursor-pointer"
                />
                <span className="text-secondary-muted">{t("store.catalog.in_stock_only", "المتوفر في المخزن فقط")}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onSaleOnly}
                  onChange={(e) => setOnSaleOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#E89A5B] rounded cursor-pointer"
                />
                <span className="text-secondary-muted">{t("store.catalog.on_sale_only", "العروض والخصومات")}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* عرض المنتجات */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white/40 dark:bg-[#121c38]/40 backdrop-blur-md rounded-3xl border border-black/5 dark:border-white/10 p-6 space-y-4 animate-pulse">
              <div className="aspect-square w-full bg-black/10 dark:bg-white/10 rounded-2xl" />
              <div className="space-y-2">
                <div className="h-4 bg-black/10 dark:bg-white/10 rounded-lg w-3/4" />
                <div className="h-3 bg-black/10 dark:bg-white/10 rounded-lg w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-24 space-y-4 bg-white/5 dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/10 backdrop-blur-lg">
          <SlidersHorizontal className="w-12 h-12 mx-auto text-secondary-muted/40" />
          <p className="text-xs font-bold text-secondary-muted uppercase tracking-wider">
            {t("store.catalog.no_products", "لا توجد منتجات مطابقة")}
          </p>
          <button
            type="button"
            onClick={() => { setSelectedCategory("all"); setSearchQuery(""); setMaxPriceFilter(5000); setMinRatingFilter(0); setInStockOnly(false); setOnSaleOnly(false); }}
            className="px-6 py-2.5 rounded-xl bg-[#0B132B] dark:bg-white text-white dark:text-[#0B132B] text-xs font-bold shadow-md cursor-pointer"
          >
            {t("store.catalog.clear_filters", "إعادة ضبط الفلاتر")}
          </button>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}>
          {filteredProducts.map((product) => {
            const rawCat = typeof product.category === 'object' ? (product.category?.name || product.category?.slug) : product.category;
            const prodId = product._id || product.id;
            const isWish = isInWishlist(prodId);
            const isCompared = compareList.some(p => (p.id || p._id) === prodId);
            const price = Number(product.price) || 0;
            const discountPrice = Number(product.discountPrice) || 0;
            const hasDiscount = discountPrice > 0 && discountPrice < price;
            const title = product.title || product.name || "Product";
            const desc = product.description || "";
            const rating = Number(product.rating || product.averageRating || 4.8);
            const imgUrl = product.image || product.imageUrl || (product.images && product.images[0]) || "https://placehold.co/400";
            
            const stock = product.stock !== undefined && product.stock !== null ? Number(product.stock) : 0;
            const isOutOfStock = stock <= 0;

            return (
              <div 
                key={prodId}
                className={`group relative bg-white/80 dark:bg-[#121c38]/80 backdrop-blur-xl rounded-3xl border border-black/5 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 flex ${viewMode === "grid" ? "flex-col" : "flex-row items-center p-5 gap-6"}`}
              >
                <div className={`relative overflow-hidden bg-black/5 dark:bg-white/5 shrink-0 rounded-2xl ${viewMode === "grid" ? "aspect-square w-full" : "w-36 h-36"}`}>
                  <img 
                    src={typeof imgUrl === 'string' ? imgUrl : imgUrl?.url || "https://placehold.co/400"} 
                    alt={title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  <div className="absolute top-3 start-3 bg-[#0B132B]/80 dark:bg-white/80 backdrop-blur-md text-white dark:text-[#0B132B] text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md">
                    {getCategoryLabel(rawCat)}
                  </div>

                  {isOutOfStock && (
                    <div className="absolute inset-x-0 bottom-0 bg-rose-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider py-1.5 text-center">
                      {isRtl ? "نفد المخزون" : "Out of Stock"}
                    </div>
                  )}

                  {hasDiscount && !isOutOfStock && (
                    <div className="absolute bottom-3 start-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      <span>{Math.round(((price - discountPrice) / price) * 100)}% OFF</span>
                    </div>
                  )}

                  <div className="absolute top-3 end-3 flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => handleWishlistClick(e, prodId)}
                      className={`p-2 rounded-full transition shadow-lg cursor-pointer backdrop-blur-md ${isWish ? "bg-rose-500 text-white" : "bg-black/40 text-white hover:bg-black/60"}`}
                      title={t("store.catalog.wishlist_btn", "حفظ في المحفوظات")}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isWish ? "fill-current" : ""}`} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => toggleCompare(e, product)}
                      className={`p-2 rounded-full transition shadow-lg cursor-pointer backdrop-blur-md ${isCompared ? "bg-[#E89A5B] text-[#0B132B]" : "bg-black/40 text-white hover:bg-black/60"}`}
                      title={t("store.catalog.compare_btn", "مقارنة المنتج")}
                    >
                      <Scale className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className={`flex-1 flex flex-col justify-between relative z-10 ${viewMode === "grid" ? "p-6 space-y-4" : "space-y-2 py-1"}`}>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-sm uppercase tracking-wide line-clamp-1 group-hover:text-[#E89A5B] transition-colors">
                        {title}
                      </h3>
                      <div className="flex items-center gap-1 text-[#E89A5B] text-xs font-bold shrink-0 bg-[#E89A5B]/10 px-2.5 py-0.5 rounded-md">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-secondary-muted line-clamp-2 leading-relaxed">
                      {desc || t("store.catalog.default_desc", "منتج فاخر مصمم بأعلى معايير الجودة.")}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/10">
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-base font-black text-[#E89A5B]">
                        ${formatPrice(hasDiscount ? discountPrice : price)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-secondary-muted line-through">
                          ${formatPrice(price)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link 
                        to={`/products/${prodId}`}
                        className="p-2.5 rounded-xl border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
                        title={t("store.catalog.view_details", "عرض التفاصيل")}
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      
                      <button 
                        type="button"
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={isOutOfStock}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg ${
                          isOutOfStock 
                            ? "bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed opacity-60" 
                            : "bg-[#0B132B] dark:bg-white text-white dark:text-[#0B132B] hover:brightness-125 cursor-pointer"
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-[#E89A5B]" />
                        <span>{isOutOfStock ? (isRtl ? "غير متوفر" : "Unavailable") : t("store.catalog.add_to_cart", "أضف للسلة")}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* نافذة المقارنة */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#FDFBF7] dark:bg-[#0B132B] border border-black/10 dark:border-white/10 w-full max-w-4xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <Scale className="w-5 h-5 text-[#E89A5B]" />
                <h3 className="font-black text-base uppercase tracking-wider">
                  {t("store.catalog.compare_title", "مقارنة المنتجات")}
                </h3>
              </div>
              <button type="button" onClick={() => setShowCompareModal(false)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 overflow-x-auto">
              {compareList.map((item) => {
                const itemImg = item.image || item.imageUrl || (item.images && item.images[0]) || "https://placehold.co/400";
                return (
                  <div key={item.id || item._id} className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl space-y-3 relative">
                    <button 
                      type="button"
                      onClick={() => setCompareList(prev => prev.filter(p => (p.id || p._id) !== (item.id || item._id)))}
                      className="absolute top-2.5 end-2.5 p-1 text-red-500 hover:bg-red-500/10 rounded-full cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <img src={typeof itemImg === 'string' ? itemImg : itemImg?.url} alt={item.title} className="w-full h-36 object-cover rounded-xl" />
                    <h4 className="font-black text-xs uppercase line-clamp-1">{item.title || item.name}</h4>
                    <p className="text-sm font-black text-[#E89A5B]">${formatPrice(item.price)}</p>
                    <p className="text-[11px] text-secondary-muted line-clamp-3 leading-relaxed">{item.description}</p>
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
                {t("store.catalog.close_compare", "إغلاق المقارنة")}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StoreCatalog;