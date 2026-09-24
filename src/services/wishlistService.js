import axiosInstance from "../api/axiosInstance";

/**
 * دالة مساعدة لتجريد وتأكيد معرّف المنتج الصافي
 * تحمي من تمرير الكائنات كاملة بدلاً من الـ ID ومنع أخطاء 500 في الـ Backend
 */
const resolveProductId = (productOrId) => {
  if (!productOrId) return "";
  if (typeof productOrId === "string") return productOrId.trim();
  if (typeof productOrId === "object") {
    return String(productOrId.productId || productOrId._id || productOrId.id || "").trim();
  }
  return String(productOrId).trim();
};

// ─── 1. عمليات المستخدم (Storefront User Operations) ───

/**
 * جلب قائمة الرغبات الخاصة بالعميل المسجل الحالي
 * GET /wishlists/my
 */
export const getMyWishlist = async () => {
  const response = await axiosInstance.get("/wishlists/my");
  return response.data;
};

// اسم بديل للتوافق
export const getWishlist = getMyWishlist;

/**
 * إضافة منتج إلى قائمة الرغبات
 * POST /wishlists/add/{productId}
 * المعرّف يمرر كـ Path Parameter بدون Request Body
 */
export const addToWishlist = async (productOrId) => {
  const productId = resolveProductId(productOrId);
  const response = await axiosInstance.post(`/wishlists/add/${productId}`);
  return response.data;
};

/**
 * حذف منتج من قائمة الرغبات
 * DELETE /wishlists/remove/{productId}
 */
export const removeFromWishlist = async (productOrId) => {
  const productId = resolveProductId(productOrId);
  const response = await axiosInstance.delete(`/wishlists/remove/${productId}`);
  return response.data;
};

/**
 * تفريغ وحذف جميع المنتجات من قائمة الرغبات دفعة واحدة
 * DELETE /wishlists/clear
 */
export const clearWishlist = async () => {
  const response = await axiosInstance.delete("/wishlists/clear");
  return response.data;
};

// ─── 2. عمليات المشرف ولوحة التحكم (Admin Operations) ───

/**
 * استعراض كافة قوائم الرغبات في المتجر للمشرفين (مع الترقيم)
 * GET /wishlists/admin/all?page=1&limit=10
 * تدعم التمرير كمعاملات منفصلة (page, limit) أو ككائن { page, limit }
 */
export const getAllWishlistsAdmin = async (pageOrParams = 1, limitArg = 10) => {
  let params = { page: 1, limit: 10 };

  if (typeof pageOrParams === "object" && pageOrParams !== null) {
    params = {
      page: pageOrParams.page || 1,
      limit: pageOrParams.limit || 10,
      ...pageOrParams,
    };
  } else {
    params = {
      page: Number(pageOrParams) || 1,
      limit: Number(limitArg) || 10,
    };
  }

  const response = await axiosInstance.get("/wishlists/admin/all", { params });
  return response.data;
};

// اسم بديل لضمان التوافق مع أي مكونات سابقة في لوحة الأدمن
export const getAllWishlists = getAllWishlistsAdmin;

/**
 * جلب إحصائيات قوائم الرغبات وقائمة أكثر 10 منتجات مرغوبة
 * GET /wishlists/admin/stats
 */
export const getWishlistStatsAdmin = async () => {
  const response = await axiosInstance.get("/wishlists/admin/stats");
  return response.data;
};

// اسم بديل للتوافق
export const getWishlistStats = getWishlistStatsAdmin;

// ─── 3. التصدير المجمع (Default & Named Exports) ───
export const wishlistService = {
  getMyWishlist,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  getAllWishlistsAdmin,
  getAllWishlists,
  getWishlistStatsAdmin,
  getWishlistStats,
};

export default wishlistService;