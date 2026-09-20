import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { orderService } from "../../../../services/orderService";

const STATUS_KEYS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

export const OrderStatusModal = ({ order, isOpen, onClose, onUpdated }) => {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");

  const [status, setStatus] = useState(order?.status || "pending");
  const [adminNote, setAdminNote] = useState(order?.adminNote || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await orderService.updateAdminOrderStatus(
        order._id,
        status,
        adminNote.trim()
      );
      if (onUpdated) onUpdated(res.order || { ...order, status, adminNote });
      onClose();
    } catch (err) {
      console.error("Failed to update status:", err);
      setError(
        err?.response?.data?.message || t("admin.edit_product.toast.error")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#121B35] rounded-3xl border border-border dark:border-border-dark shadow-2xl p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="flex items-center justify-between border-b border-border dark:border-border-dark pb-4">
          <div>
            <h3 className="text-xl font-bold text-[#0B132B] dark:text-white font-['Poppins',sans-serif]">
              {t("admin.order_detail.dispatch_controls_title")}
            </h3>
            <p className="text-xs text-secondary-muted font-mono mt-0.5">
              #{String(order._id).slice(-8).toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-secondary-muted hover:bg-secondary/10 transition-colors cursor-pointer"
            title={t("common.cancel")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-status-error/10 border border-status-error/20 flex items-center gap-2.5 text-status-error text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1F2937] dark:text-slate-300 mb-2">
              {t("admin.order_detail.stage_label")}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0B132B] dark:focus:ring-[#E89A5B] cursor-pointer"
            >
              {STATUS_KEYS.map((key) => (
                <option key={key} value={key}>
                  {t(`status.${key}`, key)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1F2937] dark:text-slate-300 mb-2">
              {t("admin.order_detail.internal_note_label")}
            </label>
            <textarea
              rows={3}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder={t("admin.order_detail.internal_note_placeholder")}
              className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0B132B] dark:focus:ring-[#E89A5B] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-secondary-muted hover:text-[#0B132B] dark:hover:text-white transition-colors cursor-pointer"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#0B132B] hover:bg-[#E89A5B] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{t("admin.order_detail.commit_btn")}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderStatusModal;