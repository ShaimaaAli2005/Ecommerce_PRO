import axiosInstance from "../api/axiosInstance";

/**
 * دالة مساعدة لتجريد وتأكيد معرّف الطلب الصافي
 * تعالج حالات تمرير كائن الطلب كاملاً لمنع أخطاء Cast to ObjectId
 */
const resolveOrderId = (order) => {
  if (!order) return "";
  if (typeof order === "string") return order.trim();
  if (typeof order === "object") {
    return String(order._id || order.id || "").trim();
  }
  return String(order).trim();
};

// ─── 1. خدمات العميل (Customer Orders - المتجر) ───

/**
 * إنشاء طلب جديد من محتويات السلة الحالية
 * POST /orders
 */
export const createOrder = async (orderPayload) => {
  const response = await axiosInstance.post("/orders", orderPayload);
  return response.data;
};

export const placeOrder = createOrder;

/**
 * جلب قائمة طلبات المستخدم الحالي
 * GET /orders/my
 * يدعم الاستدعاء ككائن: getMyOrders({ page: 1, limit: 10, status: "pending" })
 * أو كمعاملات منفصلة: getMyOrders(1, 10, "pending")
 */
export const getMyOrders = async (paramsOrPage = 1, limitParam = 10, statusParam = "") => {
  let params = {};

  if (typeof paramsOrPage === "object" && paramsOrPage !== null) {
    params = { ...paramsOrPage };
  } else {
    params = { page: paramsOrPage, limit: limitParam };
    if (statusParam && statusParam !== "all") {
      params.status = statusParam;
    }
  }

  // تنظيف الفلاتر إذا كانت "all"
  if (params.status === "all") {
    delete params.status;
  }

  const response = await axiosInstance.get("/orders/my", { params });
  return response.data;
};

/**
 * جلب تفاصيل طلب محدد للعميل
 * GET /orders/my/{id}
 */
export const getMyOrderById = async (orderOrId) => {
  const orderId = resolveOrderId(orderOrId);
  const response = await axiosInstance.get(`/orders/my/${orderId}`);
  return response.data;
};

export const getOrderById = getMyOrderById;

/**
 * إلغاء طلب محدد للعميل
 * PATCH /orders/my/{id}/cancel
 */
export const cancelMyOrder = async (orderOrId) => {
  const orderId = resolveOrderId(orderOrId);
  const response = await axiosInstance.patch(`/orders/my/${orderId}/cancel`);
  return response.data;
};

export const cancelOrder = cancelMyOrder;

// ─── 2. خدمات المشرف (Admin Orders - لوحة التحكم) ───

/**
 * جلب إحصائيات لوحة التحكم المركزية
 * GET /orders/admin/dashboard
 */
export const getDashboardStats = async () => {
  const response = await axiosInstance.get("/orders/admin/dashboard");
  return response.data;
};

/**
 * جلب كافة طلبات المتجر مع الفلاتر والترقيم للإدارة
 * GET /orders/admin
 */
export const getAdminOrders = async (params = {}) => {
  const response = await axiosInstance.get("/orders/admin", { params });
  return response.data;
};

/**
 * جلب تفاصيل طلب مفرد للأدمن
 * GET /orders/admin/{id}
 */
export const getAdminOrderById = async (orderOrId) => {
  const orderId = resolveOrderId(orderOrId);
  const response = await axiosInstance.get(`/orders/admin/${orderId}`);
  return response.data;
};

/**
 * تحديث حالة الطلب مع ملاحظة المشرف
 * PATCH /orders/admin/{id}/status
 */
export const updateAdminOrderStatus = async (orderOrId, status, adminNote = "") => {
  const orderId = resolveOrderId(orderOrId);
  const response = await axiosInstance.patch(`/orders/admin/${orderId}/status`, {
    status,
    adminNote,
  });
  return response.data;
};

/**
 * جلب السلات النشطة في المتجر للمشرف
 * GET /orders/admin/carts
 */
export const getActiveCarts = async (params = {}) => {
  const response = await axiosInstance.get("/orders/admin/carts", { params });
  return response.data;
};

// ─── 3. التصدير المجمع (Default Export) ───
export const orderService = {
  // خدمات المتجر
  createOrder,
  placeOrder,
  getMyOrders,
  getMyOrderById,
  getOrderById,
  cancelMyOrder,
  cancelOrder,

  // خدمات لوحة الإدارة
  getDashboardStats,
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus,
  getActiveCarts,
};

export default orderService;