import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Edit, AlertCircle, Package } from "lucide-react";
import { productService } from "../../../services/productService";
import Badge from "../../../components/common/Badge";
import SkeletonLoader from "../../../components/loader/SkeletonLoader";
import { useSettings } from "../../../context/SettingsContext";

export const ProductDetails = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");
  const { currencyLabel, formatPrice, formatDigits, settings } = useSettings();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const lowStockLimit = Number(settings?.lowStockThreshold) || 5;

  const fetchProduct = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productService.getProductById(id);
      setProduct(data?.product || data?.data || data);
    } catch (err) {
      setError(
        err?.response?.data?.message || t("admin.product_details.not_found")
      );
    } finally {
      setIsLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const getStockBadge = (stock) => {
    const stockNum = Number(stock) || 0;
    if (stockNum <= 0) {
      return (
        <Badge variant="error">
          {t("admin.products_management.stock_status.out_of_stock")}
        </Badge>
      );
    }
    if (stockNum <= lowStockLimit) {
      return (
        <Badge variant="warning">
          {t("admin.products_management.stock_status.low_stock")} ({formatDigits(stockNum)})
        </Badge>
      );
    }
    return (
      <Badge variant="success">
        {t("admin.products_management.stock_status.in_stock")} ({formatDigits(stockNum)})
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <SkeletonLoader className="h-8 w-48 rounded-xl" />
        <SkeletonLoader className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-2xl bg-surface-card dark:bg-surface-dark-card border border-border dark:border-border-dark text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-status-error mx-auto" />
        <p className="text-sm font-semibold text-text-main dark:text-text-inverse">
          {error || t("admin.product_details.not_found")}
        </p>
        <Link
          to="/admin/products"
          className="inline-block px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white"
        >
          {t("admin.product_details.back_to_list")}
        </Link>
      </div>
    );
  }

  const productId = product._id || product.id;
  const productName = product.name || product.title || "";
  const productImage =
    product.image?.url ||
    (typeof product.image === "string" ? product.image : null) ||
    product.images?.[0]?.url ||
    (typeof product.images?.[0] === "string" ? product.images[0] : null);

  const categoryName =
    typeof product.category === "object" && product.category !== null
      ? product.category.name || product.category.title || ""
      : product.category || "-";

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* الترويسة وأزرار الإجراء */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary-muted hover:text-text-main dark:hover:text-text-inverse mb-2 transition-colors"
          >
            {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            <span>{t("admin.product_details.back_to_list")}</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-text-main dark:text-text-inverse">
            {productName}
          </h1>
          <p className="mt-1 text-xs font-mono text-secondary-muted">
            {t("admin.product_details.product_id")}: #{String(productId).slice(-8).toUpperCase()}
          </p>
        </div>

        <Link
          to={`/admin/products/edit/${productId}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary dark:bg-accent text-white dark:text-primary-active font-semibold text-sm shadow-sm hover:opacity-90 transition-opacity"
        >
          <Edit className="w-4 h-4" />
          <span>{t("admin.product_details.edit_action")}</span>
        </Link>
      </div>

      {/* بطاقة التفاصيل الشاملة */}
      <div className="p-6 rounded-2xl bg-surface-card dark:bg-surface-dark-card border border-border dark:border-border-dark space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* الصورة */}
          <div className="aspect-square rounded-xl bg-surface-base dark:bg-surface-dark border border-border dark:border-border-dark overflow-hidden flex items-center justify-center">
            {productImage ? (
              <img
                src={productImage}
                alt={productName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-secondary-muted">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <span className="text-xs">{t("admin.add_product.form.media")}</span>
              </div>
            )}
          </div>

          {/* الخصائص الأساسية */}
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border dark:border-border-dark">
              <div>
                <span className="text-xs text-secondary-muted block">
                  {t("admin.product_details.price")}
                </span>
                <span className="text-xl font-bold text-text-main dark:text-text-inverse font-['Poppins',sans-serif]">
                  {formatPrice(product.price, true)}{" "}
                  <span className="text-xs font-normal text-secondary-muted">{currencyLabel}</span>
                </span>
              </div>

              <div>
                <span className="text-xs text-secondary-muted block mb-1">
                  {t("admin.product_details.stock")}
                </span>
                <div>{getStockBadge(product.stock ?? product.countInStock ?? 0)}</div>
              </div>

              <div>
                <span className="text-xs text-secondary-muted block">
                  {t("admin.product_details.category")}
                </span>
                <span className="text-sm font-semibold text-text-main dark:text-text-inverse capitalize">
                  {categoryName}
                </span>
              </div>

              {product.createdAt && (
                <div>
                  <span className="text-xs text-secondary-muted block">
                    {t("admin.product_details.created_at")}
                  </span>
                  <span className="text-sm font-medium text-text-main dark:text-text-inverse">
                    {new Date(product.createdAt).toLocaleDateString(isRtl ? "ar-EG" : "en-US")}
                  </span>
                </div>
              )}
            </div>

            {/* الوصف */}
            <div>
              <span className="text-xs font-semibold text-secondary-muted block mb-2">
                {t("admin.product_details.description")}
              </span>
              <p className="text-sm text-text-main dark:text-text-inverse leading-relaxed whitespace-pre-line">
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