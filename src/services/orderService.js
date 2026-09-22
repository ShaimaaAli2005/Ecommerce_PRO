import api from "../api/axiosInstance";

export const orderService = {
  // ─── 1. خدمات المشرف (Admin Orders) ───
  
  // جلب إحصائيات لوحة التحكم المركزية
  getDashboardStats: async () => {
    const response = await api.get("/orders/admin/dashboard");
    return response.data;
  },

  // جلب كافة طلبات المتجر مع الفلاتر والترقيم
  getAdminOrders: async (params = {}) => {
    const response = await api.get("/orders/admin", { params });
    return response.data;
  },

  // جلب تفاصيل طلب مفرد للأدمن
  getAdminOrderById: async (id) => {
    const response = await api.get(`/orders/admin/${id}`);
    return response.data;
  },

  // تحديث حالة الطلب مع ملاحظة المشرف
  updateAdminOrderStatus: async (id, status, adminNote = "") => {
    const response = await api.patch(`/orders/admin/${id}/status`, {
      status,
      adminNote,
    });
    return response.data;
  },

  // جلب السلات النشطة
  getActiveCarts: async (params = {}) => {
    const response = await api.get("/orders/admin/carts", { params });
    return response.data;
  },

  // ─── 2. خدمات العميل (Customer Orders) ───

  // إنشاء طلب جديد من سلة المشتريات الحالية
  createOrder: async (orderData) => {
    const response = await api.post("/orders", orderData);
    return response.data;
  },

  // جلب طلبات العميل الحالية مع الترقيم وفلتر الحالة
  getMyOrders: async (page = 1, limit = 10, status = "") => {
    const params = { page, limit };
    if (status && status !== "all") {
      params.status = status;
    }
    const response = await api.get("/orders/my", { params });
    return response.data;
  },

  // جلب تفاصيل طلب محدد للعميل
  getMyOrderById: async (id) => {
    const response = await api.get(`/orders/my/${id}`);
    return response.data;
  },

  // إلغاء طلب محدد للعميل
  cancelMyOrder: async (id) => {
    const response = await api.patch(`/orders/my/${id}/cancel`);
    return response.data;
  },
};

export default orderService;