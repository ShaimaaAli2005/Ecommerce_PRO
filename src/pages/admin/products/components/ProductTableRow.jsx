import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Edit, Trash2, Eye } from "lucide-react";
import Badge from "../../../../components/common/Badge";
import { useSettings } from "../../../../context/SettingsContext";

export const ProductTableRow = ({ product, onDeleteClick }) => {
  const { t } = useTranslation();
  const { currencyLabel, formatPrice, formatDigits, settings } = useSettings();

  const lowStockLimit = Number(settings?.lowStockThreshold) || 5;

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
    <tr className="hover:bg-secondary/5 dark:hover:bg-surface-dark/50 transition-colors">
      {/* صورة واسم المنتج */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-surface-base dark:bg-surface-dark border border-border dark:border-border-dark flex items-center justify-center overflow-hidden flex-shrink-0">
            {productImage ? (
              <img
                src={productImage}
                alt={productName}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="text-xs font-bold text-secondary-muted">LUMA</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-main dark:text-text-inverse truncate max-w-xs">
              {productName}
            </p>
            <p className="text-xs font-mono text-secondary-muted">
              #{String(productId).slice(-6).toUpperCase()}
            </p>
          </div>
        </div>
      </td>

      {/* الفئة */}
      <td className="px-6 py-4 text-xs font-medium text-secondary-muted capitalize">
        {categoryName}
      </td>

      {/* السعر محول بسعر الصرف */}
      <td className="px-6 py-4 text-sm font-bold text-text-main dark:text-text-inverse font-['Poppins',sans-serif]">
        {formatPrice(product.price, true)}{" "}
        <span className="text-[10px] font-normal text-secondary-muted">{currencyLabel}</span>
      </td>

      {/* حالة المخزون */}
      <td className="px-6 py-4">{getStockBadge(product.stock ?? product.countInStock ?? 10)}</td>

      {/* الإجراءات */}
      <td className="px-6 py-4 text-end">
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`/admin/products/${productId}`}
            className="p-2 rounded-lg text-secondary-muted hover:text-text-main hover:bg-secondary/10 dark:hover:text-text-inverse transition-colors cursor-pointer"
            title={t("admin.view_details")}
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Link
            to={`/admin/products/edit/${productId}`}
            className="p-2 rounded-lg text-primary dark:text-accent hover:bg-primary/10 dark:hover:bg-accent/10 transition-colors cursor-pointer"
            title={t("common.edit")}
          >
            <Edit className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onDeleteClick(product)}
            className="p-2 rounded-lg text-status-error hover:bg-status-error/10 transition-colors cursor-pointer"
            title={t("common.delete")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ProductTableRow;