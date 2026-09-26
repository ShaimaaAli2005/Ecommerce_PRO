import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Edit, AlertCircle, Package, Sparkles } from "lucide-react";
import { productService } from "../../../services/productService";
import { useSettings } from "../../../context/SettingsContext";

export const ProductDetails = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");
  const { currencyLabel, formatPrice, formatDigits, settings } = useSettings();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const lowStockLimit = Number(settings?.lowStockThreshold) || 5;

  const fetchProduct = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // المحاولة عبر خدمة productService المعتمدة
      const res = await productService.getProductById(id);
      const data = res?.product || res?.data || res;

      if (!data || (!data._id && !data.id)) {
        throw new Error(t("admin.product_details.not_found", "المنتج غير موجود"));
      }

      setProduct(data);
      const defaultImg =
        data.images?.[0]?.url ||
        data.images?.[0] ||
        data.image?.url ||
        data.image ||
        null;
      setSelectedImage(defaultImg);
    } catch (err) {
      console.error("Product details error:", err);
      setError(err?.response?.data?.message || err.message || t("admin.product_details.not_found", "المنتج غير موجود"));
    } finally {
      setIsLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse p-6">
        <div className="h-8 w-48 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-[#121B35] border border-black/5 dark:border-white/5 text-center space-y-4 shadow-xl">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <p className="text-sm font-bold text-slate-800 dark:text-white">
          {error || t("admin.product_details.not_found", "المنتج غير موجود")}
        </p>
        <Link
          to="/admin/products"
          className="inline-block px-5 py-2.5 text-xs font-bold rounded-xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] hover:opacity-90 transition"
        >
          {t("admin.product_details.back_to_list", "العودة للقائمة")}
        </Link>
      </div>
    );
  }

  const productId = product._id || product.id;
  const productName = product.name || product.title || "";
  const stockNum = Number(product.stock ?? product.countInStock ?? 0);
  const isOutOfStock = stockNum <= 0;
  const isLowStock = stockNum > 0 && stockNum <= lowStockLimit;

  // استخراج كافة الصور المتاحة
  const allImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map((img) => (typeof img === "string" ? img : img?.url || img?.secure_url)).filter(Boolean)
    : [product.image?.url || product.image].filter(Boolean);

  const categoryName =
    typeof product.category === "object" && product.category !== null
      ? product.category.name || product.category.title || ""
      : product.category || "-";

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12" dir={isRtl ? "rtl" : "ltr"}>
      {/* الترويسة وأزرار الإجراء */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-800 dark:hover:text-white mb-2 transition-colors"
          >
            {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            <span>{t("admin.product_details.back_to_list", "العودة لقائمة المنتجات")}</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {productName}
          </h1>
          <p className="mt-1 text-xs font-mono text-slate-400">
            {t("admin.product_details.product_id", "المعرف")}: #{String(productId).slice(-8).toUpperCase()}
          </p>
        </div>

        <Link
          to={`/admin/products/edit/${productId}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] font-bold text-xs shadow-md hover:opacity-90 transition active:scale-95 self-start sm:self-auto"
        >
          <Edit className="w-4 h-4" />
          <span>{t("admin.product_details.edit_action", "تعديل المنتج")}</span>
        </Link>
      </div>

      {/* بطاقة التفاصيل الشاملة */}
      <div className="p-8 rounded-[2.5rem] bg-white dark:bg-[#121B35] border border-black/5 dark:border-white/5 space-y-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* معرض الصور */}
          <div className="md:col-span-5 space-y-4">
            <div className="aspect-square rounded-3xl bg-slate-100 dark:bg-black/20 border border-black/5 dark:border-white/10 overflow-hidden flex items-center justify-center relative">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <span className="text-xs">{t("admin.add_product.form.media", "لا توجد صورة")}</span>
                </div>
              )}

              {product.featured && (
                <span className="absolute top-4 start-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E89A5B] text-white shadow-md flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Featured</span>
                </span>
              )}
            </div>

            {/* صور مصغرة إن وُجدت */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === img
                        ? "border-[#E89A5B] scale-105"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* الخصائص الأساسية */}
          <div className="md:col-span-7 space-y-6">
            <div className="grid grid-cols-2 gap-6 pb-6 border-b border-black/5 dark:border-white/5">
              <div>
                <span className="text-xs text-slate-400 block mb-1">
                  {t("admin.product_details.price", "سعر البيع")}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-['Poppins',sans-serif]">
                    {formatPrice(product.discountPrice || product.price, true)}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{currencyLabel}</span>
                  {product.discountPrice && Number(product.discountPrice) < Number(product.price) && (
                    <span className="text-xs text-slate-400 line-through font-['Poppins',sans-serif]">
                      {formatPrice(product.price, true)}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">
                  {t("admin.product_details.stock", "المخزون")}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    isOutOfStock
                      ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                      : isLowStock
                      ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isOutOfStock ? "bg-rose-500" : isLowStock ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                  />
                  <span>
                    {isOutOfStock
                      ? t("admin.products_management.stock_status.out_of_stock", "منتهي")
                      : `${formatDigits(stockNum)} ${t("common.items_count", "قطعة")}`}
                  </span>
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">
                  {t("admin.product_details.category", "التصنيف")}
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                  {categoryName}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">
                  SKU
                </span>
                <span className="text-sm font-mono font-bold text-[#E89A5B]">
                  {product.sku || "LUMA-SKU"}
                </span>
              </div>
            </div>

            {/* الوصف الكامل */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                {t("admin.product_details.description", "وصف المنتج")}
              </span>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-black/5 dark:border-white/5">
                {product.description || "—"}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetails;