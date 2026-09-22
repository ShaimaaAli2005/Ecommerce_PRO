import axiosInstance from "../api/axiosInstance";

/**
 * جلب سلة المشتريات الحالية للعميل
 * GET /carts
 */
export const getMyCart = async () => {
  const response = await axiosInstance.get("/carts");
  return response.data;
};

/**
 * إضافة منتج إلى السلة مع معالجة آمنة لمعرف المنتج
 * POST /carts/items
 */
export const addToCart = async (productId, quantity = 1) => {
  let cleanId = productId;
  if (typeof productId === 'object' && productId !== null) {
    cleanId = productId._id || productId.id || productId.product || productId.productId;
  }

  const response = await axiosInstance.post("/carts/items", { 
    productId: String(cleanId), 
    quantity: Number(quantity) 
  });
  return response.data;
};

/**
 * تعديل كمية عنصر موجود في السلة
 * PATCH /carts/items
 */
export const updateCartItem = async (productId, quantity) => {
  let cleanId = productId;
  if (typeof productId === 'object' && productId !== null) {
    cleanId = productId._id || productId.id || productId.product || productId.productId;
  }

  const response = await axiosInstance.patch("/carts/items", { 
    productId: String(cleanId), 
    quantity: Number(quantity) 
  });
  return response.data;
};

/**
 * حذف عنصر محدد من السلة
 * DELETE /carts/items/{productId}
 */
export const removeFromCart = async (productId) => {
  let cleanId = productId;
  if (typeof productId === 'object' && productId !== null) {
    cleanId = productId._id || productId.id || productId.product || productId.productId;
  }

  const response = await axiosInstance.delete(`/carts/items/${cleanId}`);
  return response.data;
};

/**
 * تطبيق كوبون خصم ترويجي
 * POST /carts/coupon
 */
export const applyCoupon = async (coupon) => {
  const codeValue = typeof coupon === 'object' ? (coupon.code || coupon.coupon) : coupon;
  const response = await axiosInstance.post("/carts/coupon", { code: String(codeValue).trim() });
  return response.data;
};

/**
 * إزالة كوبون الخصم من السلة
 * DELETE /carts/coupon
 */
export const removeCoupon = async () => {
  const response = await axiosInstance.delete("/carts/coupon");
  return response.data;
};

/**
 * تفريغ سلة التسوق بالكامل
 * DELETE /carts/clear
 */
export const clearCart = async () => {
  const response = await axiosInstance.delete("/carts/clear");
  return response.data;
};

export const cartService = {
  getMyCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  applyCoupon,
  removeCoupon,
  clearCart,
};

export default cartService;