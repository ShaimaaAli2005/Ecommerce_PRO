import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DollarSign, ShoppingCart, ShoppingBag, Clock, ArrowUpRight } from "lucide-react";
import { adminOrderService } from "../../../services/adminOrderService";
import KpiCard from "./components/KpiCard";
import SkeletonLoader from "../../../components/loader/SkeletonLoader";
import Badge from "../../../components/common/Badge";
import { useSettings } from "../../../context/SettingsContext";

export const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");
  const { currencyLabel, formatPrice, formatDigits } = useSettings();

  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminOrderService.getAdminDashboardStats();
      setStats(data?.dashboard || data?.data || data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t("admin.orders_page.no_matching"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "success";
      case "shipped":
        return "info";
      case "processing":
      case "confirmed":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "neutral";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString(isRtl ? "ar-EG" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-8" dir={isRtl ? "rtl" : "ltr"}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <SkeletonLoader key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <SkeletonLoader className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-status-error/10 border border-status-error/20 text-center" dir={isRtl ? "rtl" : "ltr"}>
        <p className="text-sm font-semibold text-status-error">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-status-error text-white hover:opacity-90 transition-opacity cursor-pointer"
        >
          {t("common.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir={isRtl ? "rtl" : "ltr"}>
      {/* شبكة بطاقات الإحصائيات (KPIs) محولة بالكامل بالعملة اللحظية */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title={t("admin.kpi.total_revenue")}
          value={`${formatPrice(stats?.totalRevenue, true)} ${currencyLabel}`}
          icon={DollarSign}
          variant="primary"
        />
        <KpiCard
          title={t("admin.kpi.total_orders")}
          value={formatDigits(stats?.totalOrders || 0)}
          icon={ShoppingCart}
          variant="success"
        />
        <KpiCard
          title={t("admin.kpi.active_carts")}
          value={formatDigits(stats?.activeCartsCount || 0)}
          icon={ShoppingBag}
          variant="info"
        />
        <KpiCard
          title={t("admin.kpi.pending_orders")}
          value={formatDigits(stats?.ordersByStatus?.pending || stats?.pendingOrders || 0)}
          icon={Clock}
          variant="warning"
        />
      </section>

      {/* جدول أحدث الطلبات */}
      <section className="rounded-2xl bg-surface-card dark:bg-surface-dark-card border border-border dark:border-border-dark overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border dark:border-border-dark flex items-center justify-between">
          <h3 className="text-base font-bold text-text-main dark:text-text-inverse font-['Poppins',sans-serif]">
            {t("admin.recent_orders")}
          </h3>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-primary dark:text-accent hover:underline flex items-center gap-1"
          >
            <span>{t("admin.dashboard_page.manage_all_orders")}</span>
            <ArrowUpRight className="w-3.5 h-3.5 rtl:-scale-x-100" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="bg-secondary/5 dark:bg-surface-dark text-xs uppercase text-secondary-muted font-semibold border-b border-border dark:border-border-dark">
              <tr>
                <th className="px-6 py-4 text-start">{t("admin.order_id")}</th>
                <th className="px-6 py-4 text-start">{t("admin.customer")}</th>
                <th className="px-6 py-4 text-start">{t("admin.date")}</th>
                <th className="px-6 py-4 text-start">{t("admin.total")}</th>
                <th className="px-6 py-4 text-start">{t("admin.status")}</th>
                <th className="px-6 py-4 text-end">{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-border-dark">
              {stats?.recentOrders?.length > 0 ? (
                stats.recentOrders.map((order) => {
                  const statusKey = order.status?.toLowerCase();
                  return (
                    <tr
                      key={order._id || order.id}
                      className="hover:bg-secondary/5 dark:hover:bg-surface-dark/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-xs font-bold text-text-main dark:text-text-inverse">
                        #{String(order._id || order.id).slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-text-main dark:text-text-inverse font-medium">
                        {order.user?.name || order.user?.username || order.shippingAddress?.fullName || t("common.guest_client")}
                      </td>
                      <td className="px-6 py-4 text-secondary-muted text-xs">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-text-main dark:text-text-inverse font-['Poppins',sans-serif]">
                        {formatPrice(order.totalAmount || order.totalPrice, true)}{" "}
                        <span className="text-[10px] font-normal text-secondary-muted">{currencyLabel}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(order.status)}>
                          {t(`status.${statusKey}`, t(`admin.status_labels.${statusKey}`, order.status))}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-end">
                        <Link
                          to={`/admin/orders/${order._id || order.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary dark:text-accent hover:underline"
                        >
                          {t("admin.view_details")}
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-secondary-muted text-sm">
                    {t("admin.no_orders")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;