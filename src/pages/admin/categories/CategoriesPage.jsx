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
} from "lucide-react";
import api from "../../../api/axiosInstance";
import { useSettings } from "../../../context/SettingsContext";

export const CategoriesPage = () => {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");
  const { formatDigits } = useSettings();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
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
  const [deleting, setDeleting] = useState(false);

  // البحث
  const [searchQuery, setSearchQuery] = useState("");

  // جلب التصنيفات والمنتجات
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [catRes, prodRes] = await Promise.allSettled([
        api.get("/categories"),
        api.get("/products"),
      ]);

      if (catRes.status === "fulfilled") {
        const list =
          catRes.value.data?.categories ||
          catRes.value.data?.data ||
          (Array.isArray(catRes.value.data) ? catRes.value.data : []);
        setCategories(list);
      }

      if (prodRes.status === "fulfilled") {
        const prodList =
          prodRes.value.data?.products ||
          prodRes.value.data?.data ||
          (Array.isArray(prodRes.value.data) ? prodRes.value.data : []);
        setProducts(prodList);
      }
    } catch (err) {
      console.error("Failed to load categories telemetry:", err);
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

  // ربط الأقسام بعدد المنتجات الفعلية
  const categoriesWithCounts = useMemo(() => {
    const countsMap = new Map();

    products.forEach((p) => {
      let catName = "";
      if (typeof p.category === "string") catName = p.category.trim();
      else if (typeof p.category === "object" && p.category !== null) {
        catName = p.category.name || p.category.title || "";
      }
      if (catName) {
        countsMap.set(catName, (countsMap.get(catName) || 0) + 1);
      }
    });

    return categories.map((c) => {
      const name = typeof c === "string" ? c : c.name || c.title || "";
      const description = typeof c === "object" ? c.description || c.subtitle || "" : "";
      const count = countsMap.get(name) || (typeof c === "object" ? c.productsCount || 0 : 0);
      return {
        _id: typeof c === "object" ? c._id || name : name,
        name,
        description,
        count,
      };
    });
  }, [categories, products]);

  // إضافة تصنيف جديد
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);

      await api.post("/categories", {
        name: newCatName.trim(),
        description: newCatDesc.trim() || undefined,
      });

      setSuccessMsg(t("admin.add_product.toast.success"));
      setNewCatName("");
      setNewCatDesc("");
      setIsAddModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Failed to create category:", err);
      setError(
        err.response?.data?.message || t("admin.add_product.toast.error")
      );
    } finally {
      setSubmitting(false);
    }
  };

  // حذف تصنيف
  const handleDeleteCategory = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const catId = deleteTarget._id || deleteTarget.name;
      await api.delete(`/categories/${catId}`);

      setSuccessMsg(t("admin.products_management.toast.delete_success"));
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      console.error("Failed to delete category:", err);
      setError(
        err.response?.data?.message || t("admin.products_management.toast.delete_error")
      );
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // تصفية التصنيفات بالبحث
  const filteredCategories = useMemo(() => {
    return categoriesWithCounts.filter((cat) => {
      const query = searchQuery.toLowerCase().trim();
      return !query || cat.name.toLowerCase().includes(query) || cat.description.toLowerCase().includes(query);
    });
  }, [categoriesWithCounts, searchQuery]);

  return (
    <div className="space-y-8 pb-16" dir={isRtl ? "rtl" : "ltr"}>
      {/* ─── Hero Header الرأسي الموحد ─── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0B132B] via-[#111A38] to-[#1C2541] p-8 sm:p-10 text-white shadow-2xl border border-white/10">
        <div className="absolute -top-24 -end-24 w-96 h-96 bg-[#E89A5B]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -start-24 w-80 h-80 bg-indigo-500/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-[#E89A5B]/20 text-[#E89A5B] border border-[#E89A5B]/30 flex items-center gap-2 backdrop-blur-md">
                <FolderTree className="w-3.5 h-3.5" />
                <span>{t("admin.categories_page.badge")}</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white/90 border border-white/10">
                <span className="font-['Poppins',sans-serif]">{formatDigits(categoriesWithCounts.length)}</span> {t("admin.categories_page.active_count")}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-['Poppins',sans-serif]">
              {t("admin.categories_page.title")}
            </h1>
            <p className="text-sm sm:text-base text-white/70 max-w-2xl font-normal leading-relaxed">
              {t("admin.categories_page.subtitle")}
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

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#E89A5B] to-[#F1B382] hover:brightness-105 text-[#0B132B] text-xs font-black tracking-wide uppercase shadow-[0_10px_25px_-5px_rgba(232,154,91,0.4)] flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t("admin.categories_page.new_category_btn")}</span>
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
        <Search className="w-4 h-4 text-secondary-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("admin.categories_page.search_placeholder")}
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
              className="rounded-[2rem] bg-white dark:bg-[#121B35] border border-black/5 dark:border-white/5 p-6 shadow-sm flex flex-col justify-between hover:shadow-xl hover:border-[#E89A5B]/40 transition-all duration-300 group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0B132B] to-[#1C2541] text-[#E89A5B] flex items-center justify-center font-black shadow-md group-hover:scale-105 transition-transform">
                    <Layers className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0B132B]/5 dark:bg-white/5 text-[#0B132B] dark:text-white font-['Poppins',sans-serif]">
                    {formatDigits(cat.count)} {t("admin.categories_page.items_count")}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#0B132B] dark:text-white truncate group-hover:text-[#E89A5B] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-secondary-muted line-clamp-2 leading-relaxed">
                    {cat.description || t("admin.categories_page.default_desc")}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-secondary-muted uppercase">
                  ID: #{String(cat._id).slice(-6).toUpperCase()}
                </span>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(cat)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-secondary-muted transition-all cursor-pointer shadow-xs"
                  title={t("admin.categories_page.delete_tooltip")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[2.5rem] bg-white dark:bg-[#121B35] p-16 text-center border border-black/5 dark:border-white/5 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-secondary-muted">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#0B132B] dark:text-white">
            {t("admin.categories_page.no_categories")}
          </h3>
          <p className="text-xs text-secondary-muted max-w-sm mx-auto">
            {t("admin.categories_page.no_categories_desc")}
          </p>
        </div>
      )}

      {/* ─── Modal إضافة تصنيف جديد ─── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#121B35] rounded-[2.5rem] p-7 border border-black/5 dark:border-white/5 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#E89A5B]/15 text-[#E89A5B] flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0B132B] dark:text-white">
                    {t("admin.categories_page.modal_title")}
                  </h3>
                  <p className="text-[11px] text-secondary-muted">
                    {t("admin.categories_page.modal_subtitle")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-secondary-muted hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary-muted mb-1.5">
                  {t("admin.categories_page.name_label")}
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder={t("admin.categories_page.name_placeholder")}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white font-bold outline-none focus:border-[#E89A5B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary-muted mb-1.5">
                  {t("admin.categories_page.desc_label")}
                </label>
                <textarea
                  rows={3}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder={t("admin.categories_page.desc_placeholder")}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white outline-none focus:border-[#E89A5B] resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold text-secondary-muted hover:text-[#0B132B] dark:hover:text-white transition-colors cursor-pointer"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-[#0B132B] hover:bg-[#E89A5B] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{t("admin.categories_page.submit_btn")}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal تأكيد الحذف ─── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#121B35] rounded-[2.5rem] p-7 border border-black/5 dark:border-white/5 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-[#0B132B] dark:text-white">
                {t("admin.categories_page.delete_modal_title")}
              </h3>
              <p className="text-xs text-secondary-muted leading-relaxed">
                {t("admin.categories_page.delete_modal_desc", {
                  name: deleteTarget.name,
                })}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold text-secondary-muted hover:text-[#0B132B] dark:hover:text-white transition-colors cursor-pointer"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{t("admin.categories_page.confirm_delete")}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;