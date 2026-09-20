import axiosInstance from "../api/axiosInstance";

/**
 * استعراض قائمة رغبات المستخدم الحالي
 * GET /wishlists/my
 */
export const getMyWishlist = async () => {
  const response = await axiosInstance.get("/wishlists/my");
  return response.data;
};

/**
 * إضافة منتج لقائمة الرغبات (تُنشأ تلقائياً إن لم تكن موجودة)
 * POST /wishlists/add/{productId}
 */
export const addToWishlist = async (productId) => {
  const response = await axiosInstance.post(`/wishlists/add/${productId}`);
  return response.data;
};

/**
 * إزالة منتج من قائمة الرغبات
 * DELETE /wishlists/remove/{productId}
 */
export const removeFromWishlist = async (productId) => {
  const response = await axiosInstance.delete(`/wishlists/remove/${productId}`);
  return response.data;
};

/**
 * تفريغ قائمة الرغبات بالكامل
 * DELETE /wishlists/clear
 */
export const clearWishlist = async () => {
  const response = await axiosInstance.delete("/wishlists/clear");
  return response.data;
};

/**
 * استعراض كافة قوائم رغبات المستخدمين للمشرف مع الترقيم
 * GET /wishlists/admin/all
 */
export const getAllWishlists = async (params = {}) => {
  const response = await axiosInstance.get("/wishlists/admin/all", { params });
  return response.data;
};

/**
 * إحصائيات قوائم الرغبات وأعلى 10 منتجات حفظاً للمشرف
 * GET /wishlists/admin/stats
 */
export const getWishlistStats = async () => {
  const response = await axiosInstance.get("/wishlists/admin/stats");
  return response.data;
};

export const wishlistService = {
  getMyWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  getAllWishlists,
  getWishlistStats,
};

export default wishlistService;