import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Package,
  Plus,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Layers,
  Sparkles,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Trash2,
  Barcode,
} from "lucide-react";
import api from "../../../api/axiosInstance";
import { useSettings } from "../../../context/SettingsContext";

export const AddProduct = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");
  const { currencyLabel } = useSettings();

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // حالة النموذج الكاملة المتوافقة مع Swagger Schema
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    stock: "10",
    sku: "",
    category: "",
    subcategory: "",
    brand: "LUMA",
    tags: "",
    images: [""],
    featured: false,
    isActive: true,
  });

  // جلب التصنيفات المسجلة
  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCats(true);
      const res = await api.get("/categories");
      const list = res.data?.categories || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setCategories(list);
      if (list.length > 0 && !formData.category) {
        setFormData((prev) => ({ ...prev, category: list[0]?.name || list[0] }));
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoadingCats(false);
    }
  }, [formData.category]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // توليد SKU تلقائي
  const handleGenerateSKU = () => {
    const catPrefix = (formData.category || "PRD").slice(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, sku: `LUMA-${catPrefix}-${randomNum}` }));
  };

  // معالجة روابط الصور
  const handleImageChange = (index, value) => {
    const updated = [...formData.images];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, images: updated }));
  };

  const handleAddImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };

  const handleRemoveImageField = (index) => {
    if (formData.images.length === 1) {
      setFormData((prev) => ({ ...prev, images: [""] }));
      return;
    }
    const updated = formData.images.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, images: updated }));
  };

  // حساب نسبة الخصم تلقائياً
  const discountPercent = useMemo(() => {
    const p = Number(formData.price) || 0;
    const dp = Number(formData.discountPrice) || 0;
    if (p > 0 && dp > 0 && dp < p) {
      return Math.round(((p - dp) / p) * 100);
    }
    return 0;
  }, [formData.price, formData.discountPrice]);

  // إرسال البيانات للباك إند
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);

      const cleanImages = formData.images.filter((url) => url.trim().length > 0);
      const parsedTags = formData.tags
        ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
        stock: Number(formData.stock) || 0,
        sku: formData.sku.trim() || undefined,
        category: formData.category,
        subcategory: formData.subcategory.trim() || undefined,
        brand: formData.brand.trim() || "LUMA",
        tags: parsedTags,
        images: cleanImages.length > 0 ? cleanImages : undefined,
        featured: formData.featured,
        isActive: formData.isActive,
      };

      await api.post("/products", payload);
      setSuccessMsg(t("admin.add_product.toast.success"));

      setTimeout(() => {
        navigate("/admin/products");
      }, 1200);
    } catch (err) {
      console.error("Failed to create product:", err);
      setError(
        err.response?.data?.message || t("admin.add_product.toast.error")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="space-y-8 pb-14 selection:bg-[#E89A5B]/20 selection:text-[#0B132B]"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* ─── Hero Executive Header ─── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0B132B] via-[#111A38] to-[#1C2541] p-8 text-white shadow-2xl border border-white/10">
        <div className="absolute -top-24 -end-24 w-96 h-96 bg-[#E89A5B]/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors mb-1"
            >
              {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>{t("admin.add_product.back_to_list")}</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-[#E89A5B]/20 text-[#E89A5B] border border-[#E89A5B]/30 flex items-center gap-2 backdrop-blur-md">
                <Plus className="w-3.5 h-3.5" />
                <span>LUMA STUDIO</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-['Poppins',sans-serif]">
              {t("admin.add_product.title")}
            </h1>
            <p className="text-xs sm:text-sm text-white/70 font-normal leading-relaxed">
              {t("admin.add_product.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
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

      {/* ─── Grid: Form Inputs & Live Storefront Preview Card ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* نموذج الإدخال (عمودان) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          
          {/* 1. المعلومات الأساسية */}
          <div className="rounded-[2rem] bg-white dark:bg-[#121B35] p-8 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5">
            <h3 className="text-base font-bold text-[#0B132B] dark:text-white border-b border-black/5 dark:border-white/5 pb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#E89A5B]" />
              <span>{t("admin.add_product.form.basic_info")}</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary-muted mb-1.5">
                  {t("admin.add_product.form.title_label")} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t("admin.add_product.form.title_placeholder")}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white text-xs font-bold outline-none focus:border-[#E89A5B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary-muted mb-1.5">
                  {t("admin.add_product.form.description_label")} *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t("admin.add_product.form.description_placeholder")}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white text-xs outline-none focus:border-[#E89A5B] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary-muted mb-1.5">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="LUMA"
                    className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white text-xs font-bold outline-none focus:border-[#E89A5B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary-muted mb-1.5 flex items-center justify-between">
                    <span>SKU</span>
                    <button
                      type="button"
                      onClick={handleGenerateSKU}
                      className="text-[#E89A5B] hover:underline flex items-center gap-1 cursor-pointer text-[10px]"
                    >
                      <Barcode className="w-3 h-3" />
                      <span>{t("common.edit")}</span>
                    </button>
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="LUMA-CLASSIC-01"
                    className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white text-xs font-mono font-bold outline-none focus:border-[#E89A5B]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. التسعير والمخزون مع ربط العملة الديناميكية */}
          <div className="rounded-[2rem] bg-white dark:bg-[#121B35] p-8 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5">
            <h3 className="text-base font-bold text-[#0B132B] dark:text-white border-b border-black/5 dark:border-white/5 pb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <span>{t("admin.add_product.form.pricing_inventory")}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary-muted mb-1.5">
                  {t("admin.add_product.form.price_label")} ({currencyLabel}) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder={t("admin.add_product.form.price_placeholder")}
                    className="w-full px-4 py-3 pe-12 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white text-xs font-['Poppins',sans-serif] font-bold outline-none focus:border-[#E89A5B]"
                  />
                  <span className="absolute end-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-secondary-muted">
                    {currencyLabel}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary-muted mb-1.5 flex items-center justify-between">
                  <span>{t("common.price")} ({currencyLabel})</span>
                  {discountPercent > 0 && (
                    <span className="text-emerald-600 font-bold font-['Poppins',sans-serif]">
                      -{discountPercent}%
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-3 pe-12 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white text-xs font-['Poppins',sans-serif] font-bold outline-none focus:border-[#E89A5B]"
                  />
                  <span className="absolute end-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-secondary-muted">
                    {currencyLabel}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary-muted mb-1.5">
                  {t("admin.add_product.form.stock_label")} *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder={t("admin.add_product.form.stock_placeholder")}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white text-xs font-['Poppins',sans-serif] font-bold outline-none focus:border-[#E89A5B]"
                />
              </div>
            </div>
          </div>

          {/* 3. التصنيف والوسوم */}
          <div className="rounded-[2rem] bg-white dark:bg-[#121B35] p-8 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5">
            <h3 className="text-base font-bold text-[#0B132B] dark:text-white border-b border-black/5 dark:border-white/5 pb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#E89A5B]" />
              <span>{t("admin.products_management.table.category")}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary-muted mb-1.5">
                  {t("admin.add_product.form.category_label")} *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white text-xs font-bold outline-none cursor-pointer focus:border-[#E89A5B]"
                >
                  <option value="">{t("admin.add_product.form.category_placeholder")}</option>
                  {categories.map((c) => {
                    const catName = typeof c === "string" ? c : c.name || c.title || "";
                    return (
                      <option key={catName} value={catName}>
                        {catName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary-muted mb-1.5">
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="watches, gold, luxury"
                  className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white text-xs outline-none focus:border-[#E89A5B]"
                />
              </div>
            </div>
          </div>

          {/* 4. روابط الصور والوسائط */}
          <div className="rounded-[2rem] bg-white dark:bg-[#121B35] p-8 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
              <h3 className="text-base font-bold text-[#0B132B] dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#E89A5B]" />
                <span>{t("admin.add_product.form.media")}</span>
              </h3>
              <button
                type="button"
                onClick={handleAddImageField}
                className="text-xs font-bold text-[#E89A5B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t("common.confirm")}</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.images.map((imgUrl, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-secondary-muted w-6 text-center">
                    #{idx + 1}
                  </span>
                  <input
                    type="url"
                    value={imgUrl}
                    onChange={(e) => handleImageChange(idx, e.target.value)}
                    placeholder={t("admin.add_product.form.image_url_placeholder")}
                    className="flex-1 px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white text-xs font-mono outline-none focus:border-[#E89A5B]"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImageField(idx)}
                    className="p-3 rounded-xl hover:bg-rose-500/10 hover:text-rose-600 text-secondary-muted transition-colors cursor-pointer"
                    title={t("common.delete")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 5. إعدادات النشر والعرض */}
          <div className="rounded-[2rem] bg-white dark:bg-[#121B35] p-6 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-wrap items-center justify-between gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 rounded text-[#E89A5B] focus:ring-[#E89A5B] cursor-pointer"
              />
              <span className="text-xs font-bold text-[#0B132B] dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#E89A5B]" />
                <span>Featured</span>
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-[#0B132B] dark:text-white flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>{t("admin.products_management.stock_status.in_stock")}</span>
              </span>
            </label>
          </div>

          {/* زر الاعتماد النهائي */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#0B132B] via-[#1A264F] to-[#0B132B] hover:brightness-125 text-white text-xs font-black tracking-widest uppercase transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
          >
            {submitting ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#E89A5B]" />
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{t("admin.add_product.form.submit_btn")}</span>
              </>
            )}
          </button>
        </form>

        {/* ─── المعاينة الحية الفاخرة (Storefront Preview Card) ─── */}
        <div className="space-y-6">
          <div className="sticky top-28 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-secondary-muted px-2">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#E89A5B]" />
                <span>Live Preview</span>
              </span>
              <span className="text-[10px] text-emerald-600 uppercase font-bold">{t("admin.products_management.stock_status.in_stock")}</span>
            </div>

            <div className="rounded-[2.5rem] bg-white dark:bg-[#121B35] border border-black/5 dark:border-white/5 shadow-2xl overflow-hidden group">
              <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                {formData.images[0] ? (
                  <img
                    src={formData.images[0]}
                    alt={formData.name || "Preview"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-secondary-muted gap-2">
                    <ImageIcon className="w-10 h-10 opacity-30" />
                    <span className="text-[11px] font-bold">{t("admin.add_product.form.media")}</span>
                  </div>
                )}

                <div className="absolute top-4 start-4 flex flex-col gap-1.5">
                  {formData.featured && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E89A5B] text-white shadow-md flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Featured</span>
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow-md font-['Poppins',sans-serif]">
                      -{discountPercent}%
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between text-xs text-secondary-muted font-bold">
                  <span>{formData.category || t("admin.products_management.table.category")}</span>
                  <span className="font-mono text-[10px]">{formData.sku || "LUMA-SKU"}</span>
                </div>

                <h3 className="font-bold text-base text-[#0B132B] dark:text-white truncate">
                  {formData.name || t("admin.add_product.form.title_placeholder")}
                </h3>

                <p className="text-xs text-secondary-muted line-clamp-2 leading-relaxed">
                  {formData.description || t("admin.add_product.form.description_placeholder")}
                </p>

                <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-baseline justify-between">
                  <div>
                    {formData.discountPrice && Number(formData.discountPrice) < Number(formData.price) ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-emerald-600 font-['Poppins',sans-serif]">
                          {Number(formData.discountPrice).toLocaleString()}
                        </span>
                        <span className="text-xs text-secondary-muted line-through font-['Poppins',sans-serif]">
                          {Number(formData.price).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-secondary-muted uppercase">{currencyLabel}</span>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-black text-[#0B132B] dark:text-[#E89A5B] font-['Poppins',sans-serif]">
                          {Number(formData.price || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-secondary-muted uppercase">{currencyLabel}</span>
                      </div>
                    )}
                  </div>

                  <span className="text-xs font-bold text-secondary-muted font-['Poppins',sans-serif]">
                    {Number(formData.stock || 0).toLocaleString()} {t("admin.products_management.stock_status.in_stock")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddProduct;