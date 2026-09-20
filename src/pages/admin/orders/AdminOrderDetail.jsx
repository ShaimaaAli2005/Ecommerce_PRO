import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  ArrowLeft,
  Printer,
  RefreshCw,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  User,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  FileText,
  Send,
} from "lucide-react";
import api from "../../../api/axiosInstance";
import { useSettings } from "../../../context/SettingsContext";

// مستخرج فائق الدقة لروابط الصور
const extractThumbUrl = (it) => {
  if (!it) return null;
  if (typeof it.image === "string" && it.image.trim()) return it.image;
  if (it.image?.url) return it.image.url;
  if (typeof it.product?.image === "string" && it.product.image.trim()) return it.product.image;
  if (it.product?.image?.url) return it.product.image.url;
  if (Array.isArray(it.product?.images) && it.product.images.length > 0) {
    const first = it.product.images[0];
    return typeof first === "string" ? first : first?.url;
  }
  return null;
};

// مكوّن عرض الصور المصغرة الفاخر والمحصن ضد أخطاء 404
const OrderProductImage = ({ src, alt = "", className = "" }) => {
  const initial = (alt || "L").trim().charAt(0).toUpperCase();
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`bg-gradient-to-br from-[#0B132B]/10 via-[#E89A5B]/15 to-[#0B132B]/20 dark:from-white/5 dark:to-[#E89A5B]/20 flex items-center justify-center font-black text-[#0B132B] dark:text-[#E89A5B] shrink-0 select-none border border-black/5 dark:border-white/5 ${className}`}
        title={alt}
      >
        <span className="font-['Poppins',sans-serif] text-xs">{initial}</span>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden shrink-0 relative group bg-slate-100 dark:bg-slate-900 border border-black/5 dark:border-white/5 ${className}`}>
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
    </div>
  );
};

export const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currencyLabel, formatPrice, formatDigits } = useSettings();
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // حالات قابلة للتعديل
  const [selectedStatus, setSelectedStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const fetchOrderDetail = useCallback(async () => {
    try {
      setError(null);
      let foundOrder = null;

      // 1. المحاولة الأولى: طلب الطلب المفرد من المسار الإداري
      try {
        const resAdmin = await api.get(`/orders/admin/${id}`);
        foundOrder = resAdmin.data?.order || resAdmin.data?.data || resAdmin.data;
      } catch (err1) {
        // 2. المحاولة الثانية: من المسار العام
        try {
          const resGeneral = await api.get(`/orders/${id}`);
          foundOrder = resGeneral.data?.order || resGeneral.data?.data || resGeneral.data;
        } catch (err2) {
          // 3. المحاولة الحاسمة: البحث عنه داخل قائمة شحنات المشرف العامة
          const resList = await api.get("/orders/admin");
          const list =
            resList.data?.orders ||
            resList.data?.data ||
            (Array.isArray(resList.data) ? resList.data : []);
          foundOrder = list.find((o) => String(o._id) === String(id));
        }
      }

      if (!foundOrder) {
        throw new Error(t("admin.orders_page.no_matching"));
      }

      setOrder(foundOrder);
      setSelectedStatus(foundOrder?.status || "pending");
      setAdminNote(foundOrder?.adminNote || "");
    } catch (err) {
      console.error("Failed to load order detail:", err);
      setError(err.message || t("admin.orders_page.no_matching_desc"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  // تحديث حالة الشحنة
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setError(null);
      setSuccessMsg(null);

      // محاولة التحديث على المسار المعتمد في السيرفر
      try {
        await api.put(`/orders/${id}/status`, {
          status: selectedStatus,
          adminNote: adminNote.trim(),
        });
      } catch (putErr) {
        await api.put(`/orders/admin/${id}/status`, {
          status: selectedStatus,
          adminNote: adminNote.trim(),
        });
      }

      setSuccessMsg(t("admin.order_detail.status_updated_success"));
      fetchOrderDetail();
    } catch (err) {
      console.error("Failed to update status:", err);
      setError(
        err.response?.data?.message || t("admin.edit_product.toast.error")
      );
    } finally {
      setUpdating(false);
    }
  };

  // شارات ومراحل الحالات
  const getStatusVisuals = (status) => {
    const normalized = (status || "").toLowerCase();
    switch (normalized) {
      case "delivered":
        return {
          label: t("status.delivered"),
          dot: "bg-emerald-500",
          badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          stepIndex: 3,
        };
      case "shipped":
        return {
          label: t("status.shipped"),
          dot: "bg-sky-500",
          badge: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
          stepIndex: 2,
        };
      case "processing":
      case "confirmed":
        return {
          label: t("status.processing"),
          dot: "bg-[#E89A5B] animate-pulse",
          badge: "bg-[#E89A5B]/15 text-[#E89A5B] border-[#E89A5B]/30",
          stepIndex: 1,
        };
      case "pending":
        return {
          label: t("status.pending"),
          dot: "bg-amber-400",
          badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          stepIndex: 0,
        };
      default:
        return {
          label: t("status.cancelled"),
          dot: "bg-rose-500",
          badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
          stepIndex: -1,
        };
    }
  };

  const visuals = getStatusVisuals(order?.status);
  const items = order?.items || [];
  const clientName =
    order?.shippingAddress?.fullName ||
    order?.user?.name ||
    order?.user?.username ||
    t("common.guest_client");

  if (loading) {
    return (
      <div className="rounded-[2.5rem] bg-white dark:bg-[#121B35] p-20 text-center border border-black/5 dark:border-white/5 animate-pulse space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 mx-auto" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mx-auto" />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="rounded-[2.5rem] bg-white dark:bg-[#121B35] p-16 text-center border border-black/5 dark:border-white/5 space-y-5">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-[#0B132B] dark:text-white">{error}</h3>
        <button
          onClick={() => navigate("/admin/orders")}
          className="px-6 py-2.5 rounded-2xl bg-[#0B132B] text-white text-xs font-bold cursor-pointer hover:bg-[#E89A5B] transition-colors"
        >
          {t("admin.order_detail.back_to_orders")}
        </button>
      </div>
    );
  }

  return (
    <div
      className="space-y-8 pb-14 selection:bg-[#E89A5B]/20 selection:text-[#0B132B]"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* ─── Hero Executive Bar ─── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0B132B] via-[#111A38] to-[#1C2541] p-8 text-white shadow-2xl border border-white/10">
        <div className="absolute -top-24 -end-24 w-96 h-96 bg-[#E89A5B]/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors mb-1"
            >
              {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>{t("admin.order_detail.back_to_orders")}</span>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-['Poppins',sans-serif]">
                #{order?._id?.slice(-8).toUpperCase()}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${visuals.badge}`}
              >
                <span className={`w-2 h-2 rounded-full ${visuals.dot}`} />
                <span>{visuals.label}</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/70 font-normal flex items-center gap-2">
              <Calendar className="w-4 h-4 opacity-70" />
              <span>
                {order?.createdAt
                  ? new Date(order.createdAt).toLocaleDateString(
                      isRtl ? "ar-EG" : "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )
                  : ""}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center shrink-0">
            <button
              onClick={() => window.print()}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all backdrop-blur-md cursor-pointer shadow-lg active:scale-95 text-xs font-bold flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>{t("admin.order_detail.print_invoice")}</span>
            </button>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ─── Timeline Fulfillment Stages Tracker ─── */}
      <div className="rounded-[2rem] bg-white dark:bg-[#121B35] p-8 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
        <div className="border-b border-black/5 dark:border-white/5 pb-4">
          <h3 className="text-base font-bold text-[#0B132B] dark:text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#E89A5B]" />
            <span>{t("admin.order_detail.pipeline_title")}</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          {[
            { id: "pending", title: t("admin.order_detail.step_received"), desc: t("admin.order_detail.step_received_desc") },
            { id: "processing", title: t("admin.order_detail.step_packing"), desc: t("admin.order_detail.step_packing_desc") },
            { id: "shipped", title: t("admin.order_detail.step_dispatched"), desc: t("admin.order_detail.step_dispatched_desc") },
            { id: "delivered", title: t("admin.order_detail.step_delivered"), desc: t("admin.order_detail.step_delivered_desc") },
          ].map((step, idx) => {
            const isCompleted = visuals.stepIndex >= idx;
            const isCurrent = visuals.stepIndex === idx;

            return (
              <div
                key={step.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isCurrent
                    ? "bg-[#E89A5B]/10 border-[#E89A5B]/40 shadow-sm"
                    : isCompleted
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-slate-50 dark:bg-slate-900/50 border-black/5 dark:border-white/5 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-secondary-muted font-['Poppins',sans-serif]">
                    0{idx + 1}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-secondary-muted" />
                  )}
                </div>
                <h4 className="font-bold text-sm text-[#0B132B] dark:text-white">
                  {step.title}
                </h4>
                <p className="text-[11px] text-secondary-muted mt-1">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Grid: Order Items & Side Control Panel ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* تفاصيل المنتجات والفاتورة المالية (عمودان) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[2rem] bg-white dark:bg-[#121B35] border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0B132B] dark:text-white font-['Poppins',sans-serif]">
                  {t("admin.order_detail.consignment_title")}
                </h3>
                <p className="text-xs text-secondary-muted mt-0.5">
                  <span className="font-['Poppins',sans-serif]">{formatDigits(items.length)}</span> {t("common.items")}
                </p>
              </div>
            </div>

            <div className="divide-y divide-black/5 dark:divide-white/5">
              {items.map((it, idx) => {
                const thumb = extractThumbUrl(it);
                const itemTotal = (it.price || 0) * (it.quantity || 1);

                return (
                  <div key={idx} className="p-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <OrderProductImage
                        src={thumb}
                        alt={it.name}
                        className="w-14 h-14 rounded-2xl shadow-sm"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-[#0B132B] dark:text-white truncate">
                          {it.name}
                        </h4>
                        <p className="text-xs text-secondary-muted mt-0.5 font-['Poppins',sans-serif]">
                          {formatDigits(it.quantity || 1)} × {formatPrice(it.price, true)}{" "}
                          <span className="text-[10px] font-normal">{currencyLabel}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-end shrink-0">
                      <span className="text-base font-black text-[#0B132B] dark:text-[#E89A5B] font-['Poppins',sans-serif]">
                        {formatPrice(itemTotal, true)}
                      </span>
                      <span className="block text-[10px] text-secondary-muted uppercase">
                        {currencyLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* تفقيط وتفاصيل الفاتورة المالية */}
            <div className="p-6 bg-slate-50/60 dark:bg-slate-900/40 border-t border-black/5 dark:border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs text-secondary-muted">
                <span>{t("admin.order_detail.subtotal")}</span>
                <span className="font-bold text-[#0B132B] dark:text-white font-['Poppins',sans-serif]">
                  {formatPrice(order?.subtotal || order?.totalPrice, true)}{" "}
                  {currencyLabel}
                </span>
              </div>

              {order?.shippingFee > 0 && (
                <div className="flex items-center justify-between text-xs text-secondary-muted">
                  <span>{t("admin.order_detail.shipping_fee")}</span>
                  <span className="font-bold text-[#0B132B] dark:text-white font-['Poppins',sans-serif]">
                    {formatPrice(order.shippingFee, true)} {currencyLabel}
                  </span>
                </div>
              )}

              {order?.discount > 0 && (
                <div className="flex items-center justify-between text-xs text-emerald-600">
                  <span>{t("admin.order_detail.applied_discount")}</span>
                  <span className="font-bold font-['Poppins',sans-serif]">
                    -{formatPrice(order.discount, true)} {currencyLabel}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                <span className="text-sm font-black text-[#0B132B] dark:text-white uppercase tracking-wider">
                  {t("admin.order_detail.net_total")}
                </span>
                <span className="text-xl font-black text-[#0B132B] dark:text-[#E89A5B] font-['Poppins',sans-serif]">
                  {formatPrice(order?.totalPrice, true)}{" "}
                  <span className="text-xs font-bold text-secondary-muted">{currencyLabel}</span>
                </span>
              </div>
            </div>
          </div>

          {/* ملاحظات العميل */}
          {order?.customerNote && (
            <div className="rounded-3xl bg-white dark:bg-[#121B35] p-6 border border-black/5 dark:border-white/5 shadow-sm space-y-2">
              <span className="text-xs font-bold text-secondary-muted uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#E89A5B]" />
                <span>{t("admin.order_detail.customer_note_title")}</span>
              </span>
              <p className="text-xs text-[#0B132B] dark:text-white leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                "{order.customerNote}"
              </p>
            </div>
          )}
        </div>

        {/* لوحة التحكم الجانبية */}
        <div className="space-y-6">
          
          {/* تحديث حالة الشحنة */}
          <div className="rounded-[2rem] bg-white dark:bg-[#121B35] p-6 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5">
            <h3 className="text-base font-bold text-[#0B132B] dark:text-white border-b border-black/5 dark:border-white/5 pb-3">
              {t("admin.order_detail.dispatch_controls_title")}
            </h3>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary-muted mb-1.5">
                  {t("admin.order_detail.stage_label")}
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white text-xs font-bold outline-none cursor-pointer focus:border-[#E89A5B]"
                >
                  <option value="pending">{t("status.pending")}</option>
                  <option value="processing">{t("status.processing")}</option>
                  <option value="shipped">{t("status.shipped")}</option>
                  <option value="delivered">{t("status.delivered")}</option>
                  <option value="cancelled">{t("status.cancelled")}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary-muted mb-1.5">
                  {t("admin.order_detail.internal_note_label")}
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  placeholder={t("admin.order_detail.internal_note_placeholder")}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white text-xs outline-none focus:border-[#E89A5B] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0B132B] hover:bg-[#E89A5B] text-white text-xs font-black tracking-wide uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {updating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{t("admin.order_detail.commit_btn")}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* بيانات العميل والشحن */}
          <div className="rounded-[2rem] bg-white dark:bg-[#121B35] p-6 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
            <h3 className="text-base font-bold text-[#0B132B] dark:text-white border-b border-black/5 dark:border-white/5 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-[#E89A5B]" />
              <span>{t("admin.order_detail.recipient_title")}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] text-secondary-muted block">
                  {t("admin.order_detail.full_name")}
                </span>
                <span className="font-bold text-sm text-[#0B132B] dark:text-white">
                  {clientName}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-secondary-muted block">
                  {t("admin.order_detail.contact_phone")}
                </span>
                <span className="font-bold font-['Poppins',sans-serif] text-sm text-[#0B132B] dark:text-white flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-secondary-muted" />
                  <span>{order?.shippingAddress?.phone || t("admin.user_detail.not_provided")}</span>
                </span>
              </div>

              <div>
                <span className="text-[11px] text-secondary-muted block">
                  {t("admin.order_detail.delivery_address")}
                </span>
                <p className="font-semibold text-secondary-muted mt-1 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-black/5 dark:border-white/5">
                  <MapPin className="w-3.5 h-3.5 inline text-[#E89A5B] me-1" />
                  {order?.shippingAddress?.address || ""}, {order?.shippingAddress?.city || "Cairo"},{" "}
                  {order?.shippingAddress?.country || "Egypt"}
                  {order?.shippingAddress?.postalCode && ` (${order.shippingAddress.postalCode})`}
                </p>
              </div>
            </div>
          </div>

          {/* طريقة السداد والدفع */}
          <div className="rounded-[2rem] bg-white dark:bg-[#121B35] p-6 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-3">
            <h3 className="text-base font-bold text-[#0B132B] dark:text-white border-b border-black/5 dark:border-white/5 pb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#E89A5B]" />
              <span>{t("admin.order_detail.settlement_title")}</span>
            </h3>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-secondary-muted">{t("admin.order_detail.channel")}</span>
              <span className="font-bold uppercase text-[#0B132B] dark:text-white">
                {order?.paymentMethod || "COD"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-secondary-muted">{t("admin.order_detail.payment_state")}</span>
              <span
                className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                  order?.paymentStatus === "paid"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-amber-500/10 text-amber-600"
                }`}
              >
                {order?.paymentStatus === "paid"
                  ? t("admin.orders_page.paid_status")
                  : t("admin.orders_page.cod_status")}
              </span>
            </div>

            {order?.transactionId && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-black/5 dark:border-white/5">
                <span className="text-secondary-muted">{t("admin.order_detail.txn_id")}</span>
                <span className="font-mono font-bold text-[10px] text-secondary-muted">
                  {order.transactionId}
                </span>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminOrderDetail;