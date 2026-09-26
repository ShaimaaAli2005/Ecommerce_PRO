import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  UploadCloud,
} from "lucide-react";
import api from "../../../api/axiosInstance";
import { productService } from "../../../services/productService";
import { useSettings } from "../../../context/SettingsContext";

export const AddProduct = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");
  const { currencyLabel } = useSettings();

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // ملفات الصور الفعلية والمعاينة
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // الحالة مطابقة 100% لـ Swagger Schema
  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "", // الحقل الإجباري المطلوب في Swagger
    description: "",
    price: "",
    discountPrice: "",
    stock: "10",
    sku: "",
    category: "",
    customCategory: "",
    subcategory: "",
    brand: "LUMA",
    tags: "",
    featured: false,
    isActive: true,
  });

  // جلب التصنيفات
  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCats(true);
      let catList = [];

      try {
        const prodRes = await api.get("/products?limit=50");
        const prods = prodRes.data?.products || prodRes.data?.data || (Array.isArray(prodRes.data) ? prodRes.data : []);
        const set = new Set();
        prods.forEach((p) => {
          const c = typeof p.category === "object" ? (p.category?.name || p.category?.title) : p.category;
          if (c && typeof c === "string" && c.trim()) set.add(c.trim());
        });
        catList = Array.from(set);
      } catch {
        // Fallback
      }

      if (catList.length === 0) {
        catList = ["electronics", "Living", "Lighting", "Decor", "Kitchenware", "Accessories"];
      }

      setCategories(catList);
      if (!formData.category && catList.length > 0) {
        setFormData((prev) => ({ ...prev, category: catList[0] }));
      }
    } finally {
      setLoadingCats(false);
    }
  }, [formData.category]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // إدارة اختيار الصور (بحد أقصى 5 كما في Swagger)
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (imageFiles.length + files.length > 5) {
      alert(isRtl ? "الحد الأقصى للصور هو 5 صور فقط" : "Maximum 5 images allowed");
      return;
    }

    setImageFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleGenerateSKU = () => {
    const catPrefix = (formData.category || "PRD").slice(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, sku: `LUMA-${catPrefix}-${randomNum}` }));
  };

  const discountPercent = useMemo(() => {
    const p = Number(formData.price) || 0;
    const dp = Number(formData.discountPrice) || 0;
    if (p > 0 && dp > 0 && dp < p) {
      return Math.round(((p - dp) / p) * 100);
    }
    return 0;
  }, [formData.price, formData.discountPrice]);

  // إرسال البيانات المطابق 100% لـ Swagger Multipart/Form-data
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);

      if (imageFiles.length === 0) {
        setError(isRtl ? "يجب رفع صورة واحدة على الأقل للمنتج (كما هو مطلوب في النظام)" : "At least one image is required");
        setSubmitting(false);
        return;
      }

      const finalCategory =
        formData.category === "custom"
          ? formData.customCategory.trim()
          : formData.category;

      if (!finalCategory) {
        setError(isRtl ? "يرجى تحديد أو كتابة تصنيف للمنتج" : "Please select or provide a category");
        setSubmitting(false);
        return;
      }

      // بناء FormData متطابق حرفياً مع وثيقة Swagger
      const dataToSend = new FormData();
      dataToSend.append("name", formData.name.trim());
      
      // إرسال shortDescription المطلوب إجبارياً
      const autoShortDesc = formData.shortDescription.trim() || formData.description.trim().slice(0, 100);
      dataToSend.append("shortDescription", autoShortDesc);

      dataToSend.append("description", formData.description.trim());
      dataToSend.append("price", String(Number(formData.price)));
      dataToSend.append("stock", String(Number(formData.stock) || 0));
      dataToSend.append("category", finalCategory);

      if (formData.brand?.trim()) {
        dataToSend.append("brand", formData.brand.trim());
      }
      if (formData.sku?.trim()) {
        dataToSend.append("sku", formData.sku.trim());
      }
      if (formData.subcategory?.trim()) {
        dataToSend.append("subcategory", formData.subcategory.trim());
      }
      if (formData.discountPrice && Number(formData.discountPrice) > 0) {
        dataToSend.append("discountPrice", String(Number(formData.discountPrice)));
      }

      // tags كـ JSON Array String مثل: ["tag1","tag2"]
      if (formData.tags?.trim()) {
        const parsedTags = formData.tags.split(",").map((t) => t.trim()).filter(Boolean);
        dataToSend.append("tags", JSON.stringify(parsedTags));
      }

      dataToSend.append("featured", String(formData.featured));
      dataToSend.append("isActive", String(formData.isActive));

      // إضافة ملفات الصور باسم images حصراً
      imageFiles.forEach((file) => {
        dataToSend.append("images", file);
      });

      // إرسال الطلب عبر productService
      await productService.createProduct(dataToSend);

      setSuccessMsg(t("admin.add_product.toast.success", "تم إنشاء المنتج بنجاح"));

      setTimeout(() => {
        navigate("/admin/products");
      }, 1200);
    } catch (err) {
      console.error("Failed to create product:", err);
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        t("admin.add_product.toast.error", "فشل إضافة المنتج، تأكد من ملء جميع الحقول المطلوبة والصور");
      setError(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="space-y-8 pb-14 selection:bg-[#E89A5B]/20 selection:text-[#0B132B]"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* ─── Hero Header ─── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0B132B] via-[#111A38] to-[#1C2541] p-8 text-white shadow-2xl border border-white/10">
        <div className="absolute -top-24 -end-24 w-96 h-96 bg-[#E89A5B]/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors mb-1"
            >
              {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>{t("admin.add_product.back_to_list", "العودة لقائمة المنتجات")}</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-[#E89A5B]/20 text-[#E89A5B] border border-[#E89A5B]/30 flex items-center gap-2 backdrop-blur-md">
                <Plus className="w-3.5 h-3.5" />
                <span>LUMA STUDIO</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-['Poppins',sans-serif]">
              {t("admin.add_product.title", "إضافة منتج جديد")}
            </h1>
            <p className="text-xs sm:text-sm text-white/70 font-normal leading-relaxed">
              {t("admin.add_product.subtitle", "أدخل تفاصيل ومواصفات المنتج وارفع صوره من جهازك")}
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
        <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ─── Grid: Form Inputs & Live Preview ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* نموذج الإدخال */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          
          {/* 1. المعلومات الأساسية */}
          <div className="rounded-[2rem] bg-white dark:bg-[#121B35] p-8 border border-black/5 dark:border-white/5 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-[#0B132B] dark:text-white border-b border-black/5 dark:border-white/5 pb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#E89A5B]" />
              <span>{t("admin.add_product.form.basic_info", "المعلومات الأساسية")}</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {t("admin.add_product.form.title_label", "اسم المنتج")} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: ساعة لـوما كلاسيك..."
                  className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white text-xs font-bold outline-none focus:border-[#E89A5B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {isRtl ? "الوصف المختصر (Short Description) *" : "Short Description *"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder={isRtl ? "نبذة سريعة تظهر في الكروت..." : "Brief summary for product card..."}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white text-xs font-bold outline-none focus:border-[#E89A5B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {t("admin.add_product.form.description_label", "الوصف التفصيلي الكامل")} *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="اكتب وصفاً مفصلاً للمنتج وخاماته ومميزاته..."
                  className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white text-xs outline-none focus:border-[#E89A5B] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    BRAND
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
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>SKU</span>
                    <button
                      type="button"
                      onClick={handleGenerateSKU}
                      className="text-[#E89A5B] hover:underline flex items-center gap-1 cursor-pointer text-[10px]"
                    >
                      <Barcode className="w-3 h-3" />
                      <span>{isRtl ? "توليد تلقائي" : "Generate"}</span>
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

          {/* 2. التسعير والمخزون */}
          <div className="rounded-[2rem] bg-white dark:bg-[#121B35] p-8 border border-black/5 dark:border-white/5 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-[#0B132B] dark:text-white border-b border-black/5 dark:border-white/5 pb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <span>{t("admin.add_product.form.pricing_inventory", "التسعير والمخزون")}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {t("admin.add_product.form.price_label", "سعر البيع")} ({currencyLabel}) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-3 pe-12 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white text-xs font-['Poppins',sans-serif] font-bold outline-none focus:border-[#E89A5B]"
                  />
                  <span className="absolute end-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {currencyLabel}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                  <span>{isRtl ? "سعر الخصم" : "Discount Price"} ({currencyLabel})</span>
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
                  <span className="absolute end-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {currencyLabel}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {t("admin.add_product.form.stock_label", "الكمية المتاحة بالمخزن")} *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="10"
                  className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white text-xs font-['Poppins',sans-serif] font-bold outline-none focus:border-[#E89A5B]"
                />
              </div>
            </div>
          </div>

          {/* 3. التصنيف والوسوم */}
          <div className="rounded-[2rem] bg-white dark:bg-[#121B35] p-8 border border-black/5 dark:border-white/5 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-[#0B132B] dark:text-white border-b border-black/5 dark:border-white/5 pb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#E89A5B]" />
              <span>{t("admin.products_management.table.category", "التصنيف")}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {t("admin.add_product.form.category_label", "التصنيف الرئيسي")} *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white text-xs font-bold outline-none cursor-pointer focus:border-[#E89A5B]"
                >
                  <option value="">{t("admin.add_product.form.category_placeholder", "اختر تصنيفاً...")}</option>
                  {categories.map((c) => {
                    const catName = typeof c === "string" ? c : c.name || c.title || "";
                    return (
                      <option key={catName} value={catName}>
                        {catName}
                      </option>
                    );
                  })}
                  <option value="custom">+ {isRtl ? "تصنيف مخصص آخر" : "Add custom category..."}</option>
                </select>

                {formData.category === "custom" && (
                  <input
                    type="text"
                    required
                    value={formData.customCategory}
                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                    placeholder={isRtl ? "اكتب اسم التصنيف الجديد..." : "Enter custom category name..."}
                    className="mt-2 w-full px-4 py-2.5 rounded-xl border border-[#E89A5B] bg-[#FAFAFA] dark:bg-slate-900/60 text-xs font-bold outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Tags ({isRtl ? "مفصولة بفاصلة" : "comma separated"})
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="wireless, audio, luxury"
                  className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white text-xs outline-none focus:border-[#E89A5B]"
                />
              </div>
            </div>
          </div>

          {/* 4. رفع ملفات الصور من الكمبيوتر (مطلوب صورة على الأقل) */}
          <div className="rounded-[2rem] bg-white dark:bg-[#121B35] p-8 border border-black/5 dark:border-white/5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
              <h3 className="text-base font-bold text-[#0B132B] dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#E89A5B]" />
                <span>{isRtl ? "رفع صور المنتج (مطلوبة - حد أقصى 5 صور) *" : "Product Images (Max 5) *"}</span>
              </h3>
              <span className="text-xs text-slate-400 font-bold">
                {imageFiles.length} / 5
              </span>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-white/15 hover:border-[#E89A5B] dark:hover:border-[#E89A5B] rounded-3xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-black/10 flex flex-col items-center justify-center gap-3 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#E89A5B]/10 text-[#E89A5B] flex items-center justify-center transition-transform group-hover:scale-110">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {isRtl ? "انقر هنا لاختيار صور من جهازك (1-5 صور)" : "Click to select image files (1-5 images)"}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  PNG, JPG, WEBP
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {previewUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 group shadow-sm"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-2 end-2 p-1.5 rounded-xl bg-black/60 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                      title={t("common.delete", "حذف")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-2 start-2 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-[#E89A5B] text-white">
                        {isRtl ? "الرئيسية" : "Cover"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. إعدادات النشر */}
          <div className="rounded-[2rem] bg-white dark:bg-[#121B35] p-6 border border-black/5 dark:border-white/5 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 rounded text-[#E89A5B] focus:ring-[#E89A5B] cursor-pointer"
              />
              <span className="text-xs font-bold text-[#0B132B] dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#E89A5B]" />
                <span>{isRtl ? "منتج مميز (Featured)" : "Featured Product"}</span>
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
                <span>{t("admin.products_management.stock_status.in_stock", "متاح للبيع")}</span>
              </span>
            </label>
          </div>

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
                <span>{t("admin.add_product.form.submit_btn", "حفظ ونشر المنتج")}</span>
              </>
            )}
          </button>
        </form>

        {/* ─── المعاينة الحية المباشرة ─── */}
        <div className="space-y-6">
          <div className="sticky top-28 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-2">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#E89A5B]" />
                <span>Live Storefront Preview</span>
              </span>
              <span className="text-[10px] text-emerald-600 uppercase font-bold">
                {t("admin.products_management.stock_status.in_stock", "متوفر")}
              </span>
            </div>

            <div className="rounded-[2.5rem] bg-white dark:bg-[#121B35] border border-black/5 dark:border-white/5 shadow-2xl overflow-hidden group">
              <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                {previewUrls[0] ? (
                  <img
                    src={previewUrls[0]}
                    alt={formData.name || "Preview"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                    <ImageIcon className="w-10 h-10 opacity-30" />
                    <span className="text-[11px] font-bold">
                      {isRtl ? "اختر صورة للمعاينة" : "Select an image"}
                    </span>
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
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                  <span>
                    {formData.category === "custom"
                      ? formData.customCategory || "Custom"
                      : formData.category || "Collection"}
                  </span>
                  <span className="font-mono text-[10px]">{formData.sku || "LUMA-SKU"}</span>
                </div>

                <h3 className="font-bold text-base text-[#0B132B] dark:text-white truncate">
                  {formData.name || "اسم المنتج"}
                </h3>

                {formData.shortDescription && (
                  <p className="text-xs text-[#E89A5B] font-semibold line-clamp-1">
                    {formData.shortDescription}
                  </p>
                )}

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {formData.description || "وصف المنتج..."}
                </p>

                <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-baseline justify-between">
                  <div>
                    {formData.discountPrice && Number(formData.discountPrice) < Number(formData.price) ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-emerald-600 font-['Poppins',sans-serif]">
                          {Number(formData.discountPrice).toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400 line-through font-['Poppins',sans-serif]">
                          {Number(formData.price).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{currencyLabel}</span>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-black text-[#0B132B] dark:text-[#E89A5B] font-['Poppins',sans-serif]">
                          {Number(formData.price || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{currencyLabel}</span>
                      </div>
                    )}
                  </div>

                  <span className="text-xs font-bold text-slate-400 font-['Poppins',sans-serif]">
                    {Number(formData.stock || 0).toLocaleString()} {t("admin.products_management.stock_status.in_stock", "متوفر")}
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