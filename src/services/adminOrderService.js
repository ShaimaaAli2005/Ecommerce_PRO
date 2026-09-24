import axiosInstance from "../api/axiosInstance";

/**
 * جلب إحصائيات لوحة قيادة المشرف ومخططات البيع
 * GET /orders/admin/dashboard
 */
export const getAdminDashboardStats = async () => {
  try {
    const response = await axiosInstance.get("/orders/admin/dashboard");
    return response.data;
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    throw error;
  }
};

/**
 * استعراض سلات العملاء النشطة التي تحتوي على عنصر واحد على الأقل
 * GET /orders/admin/carts
 */
export const getAdminCarts = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/orders/admin/carts", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching admin carts:", error);
    throw error;
  }
};

/**
 * جلب قائمة الطلبات العامة للمشرف بالفلاتر والترقيم والتواريخ
 * GET /orders/admin
 */
export const getAllOrders = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/orders/admin", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching all admin orders:", error);
    throw error;
  }
};

/**
 * جلب تفاصيل طلب محدد للمشرف مع بيانات العميل والعنوان
 * GET /orders/admin/{id}
 */
export const getOrderById = async (id) => {
  try {
    const response = await axiosInstance.get(`/orders/admin/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order with ID ${id}:`, error);
    throw error;
  }
};

/**
 * تحديث حالة الطلب وإرسال ملاحظة المشرف وبريد آلي للعميل
 * PATCH /orders/admin/{id}/status
 * status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned"
 */
export const updateOrderStatus = async (orderId, status, adminNote = "") => {
  try {
    const payload = { status };
    if (adminNote && adminNote.trim()) {
      payload.adminNote = adminNote.trim();
    }
    const response = await axiosInstance.patch(`/orders/admin/${orderId}/status`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating status for order ${orderId}:`, error);
    throw error;
  }
};

export const adminOrderService = {
  getAdminDashboardStats,
  getAdminCarts,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};

export default adminOrderService;