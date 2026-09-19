import axiosInstance from "../api/axiosInstance";

/**
 * جلب المنتجات مع دعم الفلاتر والفرز (price_asc, price_desc, rating)
 * GET /products
 */
export const getAllProducts = async (params = {}) => {
  const response = await axiosInstance.get("/products", { params });
  return response.data;
};

/**
 * بحث متقدم بالكلمات المفتاحية والتاجات ونطاق السعر والفرز
 * GET /products/search
 */
export const searchProducts = async (params = {}) => {
  const response = await axiosInstance.get("/products/search", { params });
  return response.data;
};

/**
 * جلب تفاصيل منتج محدد مع المراجعات والمنشئ
 * GET /products/{id}
 */
export const getProductById = async (id) => {
  const response = await axiosInstance.get(`/products/${id}`);
  return response.data;
};

/**
 * إضافة منتج جديد مع وسائط Cloudinary (حد أقصى 5 صور)
 * POST /products (multipart/form-data)
 */
export const addProduct = async (formData) => {
  const response = await axiosInstance.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * تعديل منتج قائم ومسح صور قديمة عبر deletedImages
 * PATCH /products/update/{id} (multipart/form-data)
 */
export const updateProduct = async (id, formData) => {
  const response = await axiosInstance.patch(`/products/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * حذف منتج ومسح وسائطه من Cloudinary نهائياً
 * DELETE /products/{id}
 */
export const deleteProduct = async (id) => {
  const response = await axiosInstance.delete(`/products/${id}`);
  return response.data;
};

/**
 * استعراض مراجعات وتقييمات المنتج
 * GET /products/{id}/reviews
 */
export const getProductReviews = async (productId, params = {}) => {
  const response = await axiosInstance.get(`/products/${productId}/reviews`, { params });
  return response.data;
};

/**
 * إضافة مراجعة للمنتج (تقييم 1-5 وتعليق)
 * POST /products/{id}/reviews
 */
export const addProductReview = async (productId, reviewData) => {
  const response = await axiosInstance.post(`/products/${productId}/reviews`, reviewData);
  return response.data;
};

/**
 * حذف مراجعة محددة
 * DELETE /products/{id}/reviews/{reviewId}
 */
export const deleteProductReview = async (productId, reviewId) => {
  const response = await axiosInstance.delete(`/products/${productId}/reviews/${reviewId}`);
  return response.data;
};

export const productService = {
  getAllProducts,
  searchProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductReviews,
  addProductReview,
  deleteProductReview,
};

export default productService;