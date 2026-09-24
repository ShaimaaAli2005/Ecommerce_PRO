import axiosInstance from "../api/axiosInstance";

/**
 * دالة مساعدة لتجريد وتأكيد معرّف المنتج الصافي
 * تحمي من تمرير الكائنات كاملة بدلاً من الـ ID وتمنع أخطاء 500
 */
const resolveProductId = (target) => {
  if (!target) return "";
  if (typeof target === "string") return target.trim();
  if (typeof target === "object") {
    return String(target.productId || target.product || target._id || target.id || "").trim();
  }
  return String(target).trim();
};

/**
 * 1. جلب سلة المشتريات الحالية للعميل
 * GET /carts
 */
export const getMyCart = async () => {
  const response = await axiosInstance.get("/carts");
  return response.data;
};

// اسم بديل للتوافق
export const getCart = getMyCart;

/**
 * 2. إضافة منتج إلى السلة
 * POST /carts/items
 * Body: { productId: string, quantity: number }
 */
export const addToCart = async (productOrId, quantity = 1) => {
  const productId = resolveProductId(productOrId);
  const response = await axiosInstance.post("/carts/items", {
    productId,
    quantity: Math.max(1, Number(quantity) || 1),
  });
  return response.data;
};

/**
 * 3. تحديث كمية منتج في السلة
 * PATCH /carts/items
 * Body: { productId: string, quantity: number }
 */
export const updateCartItemQuantity = async (productOrId, quantity) => {
  const productId = resolveProductId(productOrId);
  const response = await axiosInstance.patch("/carts/items", {
    productId,
    quantity: Number(quantity),
  });
  return response.data;
};

// اسم بديل للتوافق
export const updateCartItem = updateCartItemQuantity;

/**
 * 4. حذف منتج من السلة واسترجاع المخزون
 * DELETE /carts/items/{productId}
 */
export const removeFromCart = async (productOrId) => {
  const productId = resolveProductId(productOrId);
  const response = await axiosInstance.delete(`/carts/items/${productId}`);
  return response.data;
};

/**
 * 5. تطبيق كود كوبون خصم ترويجي
 * POST /carts/coupon
 * Body: { code: string }
 */
export const applyCoupon = async (couponData) => {
  const code =
    typeof couponData === "object" && couponData !== null
      ? couponData.code || couponData.coupon
      : couponData;

  const response = await axiosInstance.post("/carts/coupon", {
    code: String(code || "").trim().toUpperCase(),
  });
  return response.data;
};

/**
 * 6. إزالة الكوبون المطبق من السلة
 * DELETE /carts/coupon
 */
export const removeCoupon = async () => {
  const response = await axiosInstance.delete("/carts/coupon");
  return response.data;
};

/**
 * 7. تفريغ السلة بالكامل وحذف الكوبون
 * DELETE /carts/clear
 */
export const clearCart = async () => {
  const response = await axiosInstance.delete("/carts/clear");
  return response.data;
};

export const cartService = {
  getMyCart,
  getCart,
  addToCart,
  updateCartItem,
  updateCartItemQuantity,
  removeFromCart,
  applyCoupon,
  removeCoupon,
  clearCart,
};

export default cartService;