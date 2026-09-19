import axiosInstance from "../api/axiosInstance";

/**
 * إنشاء طلب جديد من محتويات السلة
 * POST /orders
 * يشترط: shippingAddress إلزامي، paymentMethod: "cash"
 */
export const placeOrder = async (orderData) => {
  const response = await axiosInstance.post("/orders", orderData);
  return response.data;
};

/**
 * جلب سجل طلبات المستخدم الحالي مع الترقيم
 * GET /orders/my
 */
export const getMyOrders = async (params = {}) => {
  const response = await axiosInstance.get("/orders/my", { params });
  return response.data;
};

/**
 * جلب تفاصيل طلب خاص بالعميل
 * GET /orders/my/{id}
 */
export const getMyOrderById = async (id) => {
  const response = await axiosInstance.get(`/orders/my/${id}`);
  return response.data;
};

/**
 * إلغاء طلب (متاح فقط إذا كانت حالته pending أو confirmed)
 * PATCH /orders/my/{id}/cancel
 */
export const cancelOrder = async (id) => {
  const response = await axiosInstance.patch(`/orders/my/${id}/cancel`);
  return response.data;
};

export const orderService = {
  placeOrder,
  getMyOrders,
  getMyOrderById,
  cancelOrder,
};

export default orderService;