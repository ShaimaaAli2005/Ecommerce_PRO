import axiosInstance from "../api/axiosInstance";

/**
 * دالة مساعدة لتجريد وتأكيد معرّف المنتج الصافي
 * لمنع أخطاء Cast to ObjectId (500)
 */
const resolveProductId = (product) => {
  if (!product) return "";
  if (typeof product === "string") return product.trim();
  if (typeof product === "object") {
    return String(product._id || product.id || product.productId || "").trim();
  }
  return String(product).trim();
};

// ─── 1. خدمات المتجر والعميل (Store & Customer Operations) ───

/**
 * جلب المنتجات مع الفلترة والترقيم
 * GET /products
 */
export const getProducts = async (params = {}) => {
  const response = await axiosInstance.get("/products", { params });
  return response.data;
};

/**
 * البحث المتقدم في المنتجات
 * GET /products/search
 */
export const searchProducts = async (params = {}) => {
  const response = await axiosInstance.get("/products/search", { params });
  return response.data;
};

/**
 * جلب تفاصيل منتج محدد
 * GET /products/{id}
 */
export const getProductById = async (productOrId) => {
  const productId = resolveProductId(productOrId);
  const response = await axiosInstance.get(`/products/${productId}`);
  return response.data;
};

/**
 * جلب قائمة تقييمات منتج معين مع المتوسط الإحصائي
 * GET /products/{id}/reviews
 */
export const getProductReviews = async (productOrId) => {
  const productId = resolveProductId(productOrId);
  const response = await axiosInstance.get(`/products/${productId}/reviews`);
  return response.data;
};

/**
 * إضافة مراجعة وتقييم للمنتج
 * POST /products/{id}/reviews
 * Body: { rating: number, comment: string }
 */
export const addProductReview = async (productOrId, reviewData) => {
  const productId = resolveProductId(productOrId);
  const response = await axiosInstance.post(`/products/${productId}/reviews`, reviewData);
  return response.data;
};

/**
 * حذف تقييم مسبق للمنتج
 * DELETE /products/{id}/reviews/{reviewId}
 */
export const deleteProductReview = async (productOrId, reviewId) => {
  const productId = resolveProductId(productOrId);
  const response = await axiosInstance.delete(`/products/${productId}/reviews/${String(reviewId).trim()}`);
  return response.data;
};

// ─── 2. خدمات المشرف ولوحة التحكم (Admin Operations) ───

/**
 * إنشاء منتج جديد مع رفع الصور
 * POST /products
 */
export const createProduct = async (formData) => {
  const response = await axiosInstance.post("/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

/**
 * تحديث بيانات منتج موجود وصوره
 * PATCH /products/update/{id}
 */
export const updateProduct = async (productOrId, formData) => {
  const productId = resolveProductId(productOrId);
  const response = await axiosInstance.patch(`/products/update/${productId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

/**
 * حذف منتج وصوره من Cloudinary نهائياً
 * DELETE /products/{id}
 */
export const deleteProduct = async (productOrId) => {
  const productId = resolveProductId(productOrId);
  const response = await axiosInstance.delete(`/products/${productId}`);
  return response.data;
};

// ─── 3. التصدير المجمع (Default Export) ───
export const productService = {
  getProducts,
  searchProducts,
  getProductById,
  getProductReviews,
  addProductReview,
  deleteProductReview,
  createProduct,
  updateProduct,
  deleteProduct,
};

export default productService;