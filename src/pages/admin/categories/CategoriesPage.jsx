import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FolderTree,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle,
  Layers,
  X,
  Package,
} from "lucide-react";
import { productService } from "../../../services/productService";
import { useSettings } from "../../../context/SettingsContext";

const LOCAL_STORAGE_CUSTOM_CATS = "luma_custom_categories";

export const CategoriesPage = () => {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");
  const { formatDigits } = useSettings();

  const [products, setProducts] = useState([]);
  const [customCategories, setCustomCategories] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_STORAGE_CUSTOM_CATS)) || [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // حالات نافذة الإضافة والحذف
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // البحث
  const [searchQuery, setSearchQuery] = useState("");

  // جلب المنتجات لاستخراج التصنيفات الحقيقية بدون طلب /categories المسبب لـ 404
  const fetchProductsData = useCallback(async () => {
    try {
      setError(null);
      const res = await productService.getProducts({ limit: 100 });
      const prodList = res?.products || res?.data || (Array.isArray(res) ? res : []);
      setProducts(prodList);
    } catch (err) {
      console.error("Failed to load products for categories:", err);
      setError(t("admin.products_management.toast.delete_error", "تعذر جلب بيانات الكتالوج"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchProductsData();
  }, [fetchProductsData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProductsData();
  };

  // دمج التصنيفات من المنتجات مع التصنيفات المخصصة وحساب أعداد المنتجات
  const mergedCategories = useMemo(() => {
    const countsMap = new Map();
    const categoriesMap = new Map();

    // 1. الأقسام الافتراضية للعلامة التجارية LUMA
    const baseCategories = [
      { name: "electronics", description: "أحدث التقنيات والأجهزة الذكية وملحقاتها الفاخرة" },
      { name: "Living", description: "تصاميم وأثاث صالات المعيشة العصرية" },
      { name: "Lighting", description: "وحدات إضاءة معمارية وثريات مميزة" },
      { name: "Decor", description: "قطع فنية وديكورات فريدة للمنازل العصرية" },
      { name: "Kitchenware", description: "أدوات مائدة ومقتنيات ضيافة مميزة" },
      { name: "Accessories", description: "إكسسوارات شخصية ومقتنيات حصرية" },
    ];

    baseCategories.forEach((cat) => {
      categoriesMap.set(cat.name.toLowerCase(), {
        _id: cat.name,
        name: cat.name,
        description: cat.description,
        isCustom: false,
      });
      countsMap.set(cat.name.toLowerCase(), 0);
    });

    // 2. دمج الأقسام المخصصة المضافة من المشرف
    customCategories.forEach((cat) => {
      const key = cat.name.toLowerCase();
      categoriesMap.set(key, {
        _id: cat._id || cat.name,
        name: cat.name,
        description: cat.description || "",
        isCustom: true,
      });
      if (!countsMap.has(key)) countsMap.set(key, 0);
    });

    // 3. استخراج وإحصاء المنتجات المسجلة في السيرفر
    products.forEach((p) => {
      let rawCat = "";
      if (typeof p.category === "string") rawCat = p.category.trim();
      else if (typeof p.category === "object" && p.category !== null) {
        rawCat = p.category.name || p.category.title || "";
      }

      if (rawCat) {
        const key = rawCat.toLowerCase();
        if (!categoriesMap.has(key)) {
          categoriesMap.set(key, {
            _id: rawCat,
            name: rawCat,
            description: "تصنيف مشتق من منتجات الكتالوج المعتمدة",
            isCustom: false,
          });
        }
        countsMap.set(key, (countsMap.get(key) || 0) + 1);
      }
    });

    return Array.from(categoriesMap.values()).map((cat) => ({
      ...cat,
      count: countsMap.get(cat.name.toLowerCase()) || 0,
    }));
  }, [products, customCategories]);

  // إضافة تصنيف جديد وتخزينه بنجاح
  const handleCreateCategory = (e) => {
    e.preventDefault();
    const trimmedName = newCatName.trim();
    if (!trimmedName) return;

    setSubmitting(true);
    setError(null);

    const exists = mergedCategories.some(
      (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (exists) {
      setError(isRtl ? "هذا التصنيف موجود مسبقاً في المتجر" : "Category already exists");
      setSubmitting(false);
      return;
    }

    const newCategoryItem = {
      _id: `custom_${Date.now()}`,
      name: trimmedName,
      description: newCatDesc.trim() || (isRtl ? "تصنيف جديد تمت إضافته لقائمة المتجر" : "Custom added category"),
      createdAt: new Date().toISOString(),
    };

    const updatedCustom = [newCategoryItem, ...customCategories];
    setCustomCategories(updatedCustom);
    localStorage.setItem(LOCAL_STORAGE_CUSTOM_CATS, JSON.stringify(updatedCustom));

    setSuccessMsg(isRtl ? `تمت إضافة التصنيف "${trimmedName}" بنجاح` : `Category "${trimmedName}" added successfully`);
    setNewCatName("");
    setNewCatDesc("");
    setIsAddModalOpen(false);
    setSubmitting(false);
  };

  // حذف تصنيف
  const handleDeleteCategory = () => {
    if (!deleteTarget) return;

    if (deleteTarget.count > 0) {
      alert(
        isRtl
          ? `لا يمكن حذف هذا القسم لأنه مرتبط بـ (${deleteTarget.count}) منتجات في الكتالوج. يرجى نقل أو حذف المنتجات أولاً.`
          : `Cannot delete: category has ${deleteTarget.count} products assigned.`
      );
      setDeleteTarget(null);
      return;
    }

    const updatedCustom = customCategories.filter(
      (c) => c.name.toLowerCase() !== deleteTarget.name.toLowerCase()
    );
    setCustomCategories(updatedCustom);
    localStorage.setItem(LOCAL_STORAGE_CUSTOM_CATS, JSON.stringify(updatedCustom));

    setSuccessMsg(isRtl ? "تم إزالة التصنيف بنجاح" : "Category deleted successfully");
    setDeleteTarget(null);
  };

  // تصفية التصنيفات بالبحث
  const filteredCategories = useMemo(() => {
    return mergedCategories.filter((cat) => {
      const query = searchQuery.toLowerCase().trim();
      return (
        !query ||
        cat.name.toLowerCase().includes(query) ||
        cat.description.toLowerCase().includes(query)
      );
    });
  }, [mergedCategories, searchQuery]);

  return (
    <div className="space-y-8 pb-16" dir={isRtl ? "rtl" : "ltr"}>
      {/* ─── Hero Header ─── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0B132B] via-[#111A38] to-[#1C2541] p-8 sm:p-10 text-white shadow-2xl border border-white/10">
        <div className="absolute -top-24 -end-24 w-96 h-96 bg-[#E89A5B]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -start-24 w-80 h-80 bg-indigo-500/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-[#E89A5B]/20 text-[#E89A5B] border border-[#E89A5B]/30 flex items-center gap-2 backdrop-blur-md">
                <FolderTree className="w-3.5 h-3.5" />
                <span>{t("admin.categories_page.badge", "إدارة هيكل الأقسام")}</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white/90 border border-white/10">
                <span className="font-['Poppins',sans-serif]">{formatDigits(mergedCategories.length)}</span>{" "}
                {t("admin.categories_page.active_count", "تصنيفات نشطة")}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-['Poppins',sans-serif]">
              {t("admin.categories_page.title", "تصنيفات وفئات المتجر")}
            </h1>
            <p className="text-sm sm:text-base text-white/70 max-w-2xl font-normal leading-relaxed">
              {t("admin.categories_page.subtitle", "تنظيم كتالوج المنتجات، إنشاء الأقسام الرئيسية والفرعية، وربط القطع بأماكن عرضها.")}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center shrink-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all backdrop-blur-md cursor-pointer shadow-lg active:scale-95"
              title={t("common.retry", "تحديث")}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#E89A5B]" : ""}`} />
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#E89A5B] to-[#F1B382] hover:brightness-105 text-[#0B132B] text-xs font-black tracking-wide uppercase shadow-[0_10px_25px_-5px_rgba(232,154,91,0.4)] flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t("admin.categories_page.new_category_btn", "إضافة تصنيف جديد")}</span>
            </button>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-in fade-in">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ─── شريط البحث ─── */}
      <div className="rounded-2xl bg-white dark:bg-[#121B35] p-4 border border-black/5 dark:border-white/5 flex items-center gap-3 shadow-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("admin.categories_page.search_placeholder", "ابحث باسم التصنيف أو الوصف...")}
          className="w-full bg-transparent text-xs sm:text-sm text-[#0B132B] dark:text-white outline-none"
        />
      </div>

      {/* ─── شبكة بطاقات التصنيفات ─── */}
      {loading ? (
        <div className="rounded-3xl bg-white dark:bg-[#121B35] p-16 text-center border border-black/5 dark:border-white/5 animate-pulse space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 mx-auto" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mx-auto" />
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((cat, idx) => (
            <div
              key={cat._id || idx}
              className="rounded-[2rem] bg-white dark:bg-[#121B35] border border-black/5 dark:border-white/5 p-6 shadow-xs flex flex-col justify-between hover:shadow-xl hover:border-[#E89A5B]/40 transition-all duration-300 group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0B132B] to-[#1C2541] text-[#E89A5B] flex items-center justify-center font-black shadow-md group-hover:scale-105 transition-transform">
                    <Layers className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0B132B]/5 dark:bg-white/5 text-[#0B132B] dark:text-white font-['Poppins',sans-serif]">
                    {formatDigits(cat.count)} {t("admin.categories_page.items_count", "منتجات")}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#0B132B] dark:text-white truncate group-hover:text-[#E89A5B] transition-colors">
                      {cat.name}
                    </h3>
                    {cat.isCustom && (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-[#E89A5B]/20 text-[#E89A5B]">
                        {isRtl ? "مخصص" : "Custom"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {cat.description || t("admin.categories_page.default_desc", "قسم مميز ضمن كتالوج LUMA")}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  ID: #{String(cat._id).slice(-6).toUpperCase()}
                </span>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(cat)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-400 transition-all cursor-pointer shadow-xs"
                  title={t("admin.categories_page.delete_tooltip", "حذف")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[2.5rem] bg-white dark:bg-[#121B35] p-16 text-center border border-black/5 dark:border-white/5 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#0B132B] dark:text-white">
            {t("admin.categories_page.no_categories", "لا توجد تصنيفات مطابقة للبحث")}
          </h3>
        </div>
      )}

      {/* ─── Modal إضافة تصنيف جديد ─── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#121B35] rounded-[2.5rem] p-7 border border-black/5 dark:border-white/5 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#E89A5B]/15 text-[#E89A5B] flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0B132B] dark:text-white">
                    {t("admin.categories_page.modal_title", "إضافة تصنيف جديد")}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {t("admin.categories_page.modal_subtitle", "توسيع هيكل الأقسام بالكتالوج")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {t("admin.categories_page.name_label", "اسم التصنيف")} *
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder={t("admin.categories_page.name_placeholder", "مثال: غرف نوم أطفال...")}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white font-bold outline-none focus:border-[#E89A5B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {t("admin.categories_page.desc_label", "وصف القسم (اختياري)")}
                </label>
                <textarea
                  rows={3}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder={t("admin.categories_page.desc_placeholder", "اكتب نبذة مختصرة عن هذا التصنيف...")}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white outline-none focus:border-[#E89A5B] resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold text-slate-400 hover:text-[#0B132B] dark:hover:text-white transition-colors cursor-pointer"
                >
                  {t("common.cancel", "إلغاء")}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-[#0B132B] hover:bg-[#E89A5B] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  <span>{t("admin.categories_page.submit_btn", "حفظ ونشر التصنيف")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal تأكيد الحذف ─── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#121B35] rounded-[2.5rem] p-7 border border-black/5 dark:border-white/5 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-[#0B132B] dark:text-white">
                {t("admin.categories_page.delete_modal_title", "تأكيد إزالة التصنيف")}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isRtl
                  ? `هل تريد بالتأكيد إزالة التصنيف "${deleteTarget.name}"؟`
                  : `Are you sure you want to remove "${deleteTarget.name}"?`}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold text-slate-400 hover:text-[#0B132B] dark:hover:text-white transition-colors cursor-pointer"
              >
                {t("common.cancel", "إلغاء")}
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>{t("admin.categories_page.confirm_delete", "تأكيد الحذف")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;