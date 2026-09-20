import api from "../api/axiosInstance";

export const orderService = {
  // 1. جلب إحصائيات لوحة التحكم المركزية
  getDashboardStats: async () => {
    const response = await api.get("/orders/admin/dashboard");
    return response.data;
  },

  // 2. جلب كافة طلبات المتجر مع الفلاتر والترقيم
  getAdminOrders: async (params = {}) => {
    const response = await api.get("/orders/admin", { params });
    return response.data;
  },

  // 3. جلب تفاصيل طلب مفرد
  getAdminOrderById: async (id) => {
    const response = await api.get(`/orders/admin/${id}`);
    return response.data;
  },

  // 4. تحديث حالة الطلب مع ملاحظة المشرف
  updateAdminOrderStatus: async (id, status, adminNote = "") => {
    const response = await api.patch(`/orders/admin/${id}/status`, {
      status,
      adminNote,
    });
    return response.data;
  },

  // 5. جلب السلات النشطة
  getActiveCarts: async (params = {}) => {
    const response = await api.get("/orders/admin/carts", { params });
    return response.data;
  },
};

export default orderService;