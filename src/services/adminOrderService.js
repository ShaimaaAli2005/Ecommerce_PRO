import axiosInstance from "../api/axiosInstance";

/**
 * جلب إحصائيات لوحة قيادة المشرف ومخططات البيع
 * GET /orders/admin/dashboard
 */
export const getAdminDashboardStats = async () => {
  const response = await axiosInstance.get("/orders/admin/dashboard");
  return response.data;
};

/**
 * استعراض سلات العملاء النشطة التي تحتوي على عنصر واحد على الأقل
 * GET /orders/admin/carts
 */
export const getAdminCarts = async (params = {}) => {
  const response = await axiosInstance.get("/orders/admin/carts", { params });
  return response.data;
};

/**
 * جلب قائمة الطلبات العامة للمشرف بالفلاتر والترقيم والتواريخ
 * GET /orders/admin
 */
export const getAllOrders = async (params = {}) => {
  const response = await axiosInstance.get("/orders/admin", { params });
  return response.data;
};

/**
 * جلب تفاصيل طلب محدد للمشرف مع بيانات العميل والعنوان
 * GET /orders/admin/{id}
 */
export const getOrderById = async (id) => {
  const response = await axiosInstance.get(`/orders/admin/${id}`);
  return response.data;
};

/**
 * تحديث حالة الطلب وإرسال ملاحظة المشرف وبريد آلي للعميل
 * PATCH /orders/admin/{id}/status
 * status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned"
 */
export const updateOrderStatus = async (orderId, status, adminNote = "") => {
  const payload = { status };
  if (adminNote && adminNote.trim()) {
    payload.adminNote = adminNote.trim();
  }
  const response = await axiosInstance.patch(`/orders/admin/${orderId}/status`, payload);
  return response.data;
};

export const adminOrderService = {
  getAdminDashboardStats,
  getAdminCarts,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};

export default adminOrderService;