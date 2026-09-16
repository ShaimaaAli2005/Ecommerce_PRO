import React, { useEffect, useState } from "react";
import {
  ShoppingBag,
  Clock,
  DollarSign,
  TrendingUp,
  Package,
  Users,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import SkeletonLoader from "../../components/loader/SkeletonLoader";
import api from "../../api/axiosInstance";

const API_BASE_URL = "https://e-commerce-api-3wara.vercel.app";

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dashboardData, setDashboardData] = useState({});
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("adminToken")
    );
  };

 const apiRequest = async (endpoint) => {
  const response = await api.get(endpoint);
  return response.data;
};

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        dashboardResponse,
        usersResponse,
        productsResponse,
        ordersResponse,
      ] = await Promise.all([
        apiRequest("/orders/admin/dashboard"),
        apiRequest("/users/all"),
        apiRequest("/products"),
        apiRequest("/orders/admin"),
      ]);

      setDashboardData(
        dashboardResponse?.data ||
          dashboardResponse?.dashboard ||
          dashboardResponse ||
          {}
      );

      setUsers(
        usersResponse?.users ||
          usersResponse?.data?.users ||
          usersResponse?.data ||
          []
      );

      setProducts(
        productsResponse?.products ||
          productsResponse?.data?.products ||
          productsResponse?.data ||
          []
      );

      setOrders(
        ordersResponse?.orders ||
          ordersResponse?.data?.orders ||
          ordersResponse?.data ||
          []
      );
    } catch (err) {
      console.error("Dashboard API Error:", err);

      setError(
        t(
          "dashboard.api_error",
          "Unable to load dashboard data. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <SkeletonLoader type="page" />;
  }

  const getNumber = (...values) => {
    const value = values.find(
      (item) => typeof item === "number" && !Number.isNaN(item)
    );

    return value ?? 0;
  };

  const getOrderStatus = (order) => {
    return String(
      order?.status ||
        order?.orderStatus ||
        order?.order_status ||
        ""
    ).toLowerCase();
  };

  const getOrderTotal = (order) => {
    return getNumber(
      order?.totalPrice,
      order?.totalAmount,
      order?.total,
      order?.grandTotal,
      order?.price
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat(isRtl ? "ar-EG" : "en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat(isRtl ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(parsedDate);
  };

  const totalOrders = getNumber(
    dashboardData?.totalOrders,
    dashboardData?.ordersCount,
    dashboardData?.total_orders,
    orders.length
  );

  const pendingOrders = getNumber(
    dashboardData?.pendingOrders,
    dashboardData?.pending_orders,
    orders.filter((order) =>
      getOrderStatus(order).includes("pending")
    ).length
  );

  const totalRevenue = getNumber(
    dashboardData?.totalRevenue,
    dashboardData?.revenue,
    dashboardData?.total_revenue,
    orders.reduce((total, order) => total + getOrderTotal(order), 0)
  );

  const totalUsers = getNumber(
    dashboardData?.totalUsers,
    dashboardData?.usersCount,
    dashboardData?.total_users,
    users.length
  );

  const monthlyRevenue = getNumber(
    dashboardData?.thisMonthRevenue,
    dashboardData?.monthlyRevenue,
    dashboardData?.this_month_revenue
  );

  const statusCounts = {
    pending: orders.filter((order) =>
      getOrderStatus(order).includes("pending")
    ).length,

    processing: orders.filter((order) =>
      getOrderStatus(order).includes("processing")
    ).length,

    confirmed: orders.filter((order) =>
      getOrderStatus(order).includes("confirmed")
    ).length,

    shipped: orders.filter((order) =>
      getOrderStatus(order).includes("shipped")
    ).length,

    delivered: orders.filter((order) =>
      getOrderStatus(order).includes("delivered")
    ).length,

    cancelled: orders.filter((order) =>
      getOrderStatus(order).includes("cancel")
    ).length,
  };

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b?.createdAt || b?.created_at || 0) -
        new Date(a?.createdAt || a?.created_at || 0)
    )
    .slice(0, 5);

  const productSales = {};

  orders.forEach((order) => {
    const items =
      order?.items ||
      order?.products ||
      order?.orderItems ||
      [];

    items.forEach((item) => {
      const product =
        item?.product ||
        item?.productId ||
        item?.item ||
        {};

      const productId =
        product?._id ||
        product?.id ||
        item?.productId ||
        item?.product_id;

      if (!productId) return;

      const quantity = Number(item?.quantity || item?.qty || 1);

      if (!productSales[productId]) {
        productSales[productId] = {
          product,
          quantity: 0,
        };
      }

      productSales[productId].quantity += quantity;
    });
  });

  const bestSellers = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const stats = [
    {
      title: t("dashboard.total_orders", "Total Orders"),
      value: totalOrders,
      subtitle: t("dashboard.all_orders", "All orders received"),
      icon: ShoppingBag,
    },
    {
      title: t("dashboard.pending_orders", "Pending Orders"),
      value: pendingOrders,
      subtitle: t("dashboard.awaiting_action", "Awaiting action"),
      icon: Clock,
    },
    {
      title: t("dashboard.revenue", "Revenue"),
      value: formatCurrency(totalRevenue),
      subtitle: t("dashboard.gross_revenue", "Total gross revenue"),
      icon: DollarSign,
    },
    {
      title: t("dashboard.this_month", "This Month"),
      value: formatCurrency(monthlyRevenue),
      subtitle: t("dashboard.monthly_target", "Monthly sales target"),
      icon: TrendingUp,
    },
    {
      title: t("dashboard.top_product", "Top Product"),
      value:
        bestSellers[0]?.product?.name ||
        bestSellers[0]?.product?.title ||
        products[0]?.name ||
        t("dashboard.no_product", "No product data"),
      subtitle: bestSellers[0]
        ? `${bestSellers[0].quantity} ${t(
            "dashboard.units_sold",
            "units sold"
          )}`
        : t("dashboard.no_sales", "No sales data"),
      icon: Package,
      longValue: true,
    },
    {
      title: t("dashboard.users", "Users"),
      value: totalUsers,
      subtitle: t(
        "dashboard.registered_customers",
        "Registered customers"
      ),
      icon: Users,
    },
  ];

  const statuses = [
    {
      label: t("dashboard.pending", "PENDING"),
      count: statusCounts.pending,
      style:
        "text-[#E89A5B] bg-[#E89A5B]/10 border-[#E89A5B]/20",
    },
    {
      label: t("dashboard.processing", "PROCESSING"),
      count: statusCounts.processing,
      style:
        "text-[#60708F] dark:text-gray-300 bg-[#60708F]/10 border-[#60708F]/20",
    },
    {
      label: t("dashboard.confirmed", "CONFIRMED"),
      count: statusCounts.confirmed,
      style:
        "text-[#17233C] dark:text-blue-200 bg-[#17233C]/10 border-[#17233C]/20",
    },
    {
      label: t("dashboard.shipped", "SHIPPED"),
      count: statusCounts.shipped,
      style:
        "text-[#2C3E50] dark:text-gray-300 bg-[#2C3E50]/10 border-[#2C3E50]/20",
    },
    {
      label: t("dashboard.delivered", "DELIVERED"),
      count: statusCounts.delivered,
      style:
        "text-[#2E7D32] dark:text-green-300 bg-[#2E7D32]/10 border-[#2E7D32]/20",
    },
    {
      label: t("dashboard.cancelled", "CANCELLED"),
      count: statusCounts.cancelled,
      style:
        "text-[#C95C5C] bg-[#C95C5C]/10 border-[#C95C5C]/20",
    },
  ];

  if (error) {
    return (
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className="p-6"
      >
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />

            <div>
              <h2 className="font-bold text-red-700 dark:text-red-300">
                {t(
                  "dashboard.error_title",
                  "Something went wrong"
                )}
              </h2>

              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {error}
              </p>
            </div>
          </div>

          <button
            onClick={loadDashboard}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#17233C] text-white hover:bg-[#243452] transition"
          >
            <RefreshCw className="w-4 h-4" />
            {t("common.retry", "Try again")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={`space-y-8 font-sans text-[#17233C] dark:text-gray-100 ${
        isRtl ? "text-right" : "text-left"
      }`}
    >
      <div className="space-y-1">
        <div
          className={`flex items-center gap-2 ${
            isRtl ? "flex-row-reverse justify-end" : ""
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#E89A5B] animate-pulse" />

          <span className="text-[11px] font-black tracking-widest text-[#E89A5B] uppercase">
            {t("dashboard.badge", "LUMA ADMIN OVERVIEW")}
          </span>
        </div>

        <h1 className="text-3xl font-black text-[#17233C] dark:text-white tracking-tight font-['Poppins'] mt-1">
          {t(
            "dashboard.title",
            "Real-time commerce health"
          )}
        </h1>

        <p className="text-sm text-[#60708F] dark:text-gray-400">
          {t(
            "dashboard.description",
            "Monitor your storefront with live API metrics."
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((card, index) => {
          const Icon = card.icon;

          return (
            <div
              key={index}
              className="group relative bg-white dark:bg-[#1F2937] rounded-2xl p-5 border border-slate-200/80 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex items-start justify-between"
            >
              <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#17233C] via-[#E89A5B] to-[#17233C] opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="space-y-1 pr-4 pt-1 min-w-0">
                <span className="text-xs font-medium text-[#60708F] dark:text-gray-400">
                  {card.title}
                </span>

                <div
                  className={`font-black text-[#17233C] dark:text-white font-['Poppins'] break-words ${
                    card.longValue
                      ? "text-base leading-snug"
                      : "text-2xl"
                  }`}
                >
                  {card.value}
                </div>

                <p className="text-[11px] text-slate-400 dark:text-gray-500">
                  {card.subtitle}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F9FA] dark:bg-[#374151] text-[#17233C] dark:text-gray-200 border border-slate-200 dark:border-gray-600 group-hover:bg-[#E89A5B] group-hover:text-white group-hover:scale-110 transition-all duration-300 shrink-0">
                <Icon className="w-5 h-5 stroke-[2]" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#1F2937] rounded-2xl p-6 border border-slate-200/80 dark:border-gray-700 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-700 pb-3 gap-4">
            <div>
              <span className="text-xs font-semibold tracking-wider text-[#60708F] dark:text-gray-400 uppercase">
                {t("dashboard.order_status", "ORDER STATUS")}
              </span>

              <h2 className="text-lg font-black text-[#17233C] dark:text-white font-['Poppins']">
                {t(
                  "dashboard.fulfillment",
                  "Live fulfillment breakdown"
                )}
              </h2>
            </div>

            <span className="text-xs text-[#E89A5B] bg-[#E89A5B]/10 px-3 py-1 rounded-full font-semibold border border-[#E89A5B]/20 whitespace-nowrap">
              {t(
                "dashboard.updated_api",
                "Updated from API"
              )}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
            {statuses.map((status, index) => (
              <div
                key={index}
                className={`${status.style} p-4 rounded-xl border hover:shadow-md transition-all duration-200`}
              >
                <span className="text-[11px] font-bold tracking-wider opacity-80 block mb-1">
                  {status.label}
                </span>

                <span className="text-2xl font-extrabold font-['Poppins']">
                  {status.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1F2937] rounded-2xl p-6 border border-slate-200/80 dark:border-gray-700 shadow-sm space-y-4">
          <div>
            <span className="text-xs font-semibold tracking-wider text-[#60708F] dark:text-gray-400 uppercase">
              {t("dashboard.top_products", "TOP PRODUCTS")}
            </span>

            <h2 className="text-lg font-black text-[#17233C] dark:text-white font-['Poppins']">
              {t("dashboard.best_sellers", "Best sellers")}
            </h2>
          </div>

          <div className="space-y-3 pt-1">
            {bestSellers.length > 0 ? (
              bestSellers.map((item, index) => {
                const product = item.product || {};

                const name =
                  product.name ||
                  product.title ||
                  t("dashboard.product", "Product");

                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F8F9FA] dark:hover:bg-[#374151] transition-colors duration-150"
                  >
                    <div className="w-10 h-10 bg-[#17233C]/5 dark:bg-white/5 rounded-lg flex items-center justify-center shrink-0 border border-[#17233C]/10 dark:border-gray-600 text-[#17233C] dark:text-gray-200">
                      <Package className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-[#17233C] dark:text-white truncate">
                        {name}
                      </h4>

                      <p className="text-[11px] text-[#60708F] dark:text-gray-400">
                        {item.quantity}{" "}
                        {t(
                          "dashboard.units_sold",
                          "units sold"
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-400">
                {t(
                  "dashboard.no_sales",
                  "No sales data available"
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1F2937] rounded-2xl p-6 border border-slate-200/80 dark:border-gray-700 shadow-sm space-y-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-[#60708F] dark:text-gray-400 uppercase">
            {t("dashboard.recent_orders", "RECENT ORDERS")}
          </span>

          <h2 className="text-lg font-black text-[#17233C] dark:text-white font-['Poppins']">
            {t(
              "dashboard.latest_activity",
              "Latest customer activity"
            )}
          </h2>
        </div>

        <div className="space-y-2 pt-1">
          {recentOrders.length > 0 ? (
            recentOrders.map((order, index) => {
              const status = getOrderStatus(order);

              const customer =
                order?.user?.username ||
                order?.user?.name ||
                order?.customer?.name ||
                order?.username ||
                order?.name ||
                t("dashboard.customer", "Customer");

              const items =
                order?.items ||
                order?.products ||
                order?.orderItems ||
                [];

              const itemName =
                items[0]?.product?.name ||
                items[0]?.product?.title ||
                items[0]?.name ||
                t("dashboard.order_item", "Order");

              const isDelivered = status === "delivered";

              return (
                <div
                  key={order?._id || order?.id || index}
                  className="flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-[#F8F9FA] dark:hover:bg-[#374151] transition-colors duration-150 border border-transparent hover:border-slate-200 dark:hover:border-gray-600"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-sm font-semibold text-[#17233C] dark:text-white">
                      {customer}
                    </div>

                    <div className="text-xs text-[#60708F] dark:text-gray-400 truncate">
                      {itemName} •{" "}
                      {formatDate(
                        order?.createdAt ||
                          order?.created_at
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        isDelivered
                          ? "bg-[#2E7D32]/10 text-[#2E7D32] dark:text-green-300"
                          : "bg-[#E89A5B]/15 text-[#E89A5B]"
                      }`}
                    >
                      {status
                        ? status.toUpperCase()
                        : t(
                            "dashboard.unknown",
                            "UNKNOWN"     
                      )}
                          </span>

                          <span
                            className={`text-sm font-bold text-[#17233C] dark:text-white min-w-[90px] font-['Poppins'] ${
                              isRtl
                                ? "text-left"
                                : "text-right"
                            }`}
                          >
                            {formatCurrency(
                              getOrderTotal(order)
                            )}
                          </span>
                          </div>
                          </div>
                          );
                          })
                          ) : (
                            <div className="py-8 text-center text-sm text-gray-400">
                              {t(
                                "dashboard.no_orders",
                                "No orders available"
                              )}
                            </div>
                          )}
                          </div>
                          </div>
                          </div>
                          );
                 }