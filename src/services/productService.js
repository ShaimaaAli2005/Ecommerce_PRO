import api from "../api/axiosInstance";

export const productService = {
  // 1. جلب كل المنتجات مع الفلترة والترقيم
  getProducts: async (params = {}) => {
    const response = await api.get("/products", { params });
    return response.data;
  },

  // 2. البحث المتقدم
  searchProducts: async (params = {}) => {
    const response = await api.get("/products/search", { params });
    return response.data;
  },

  // 3. جلب منتج محدد بالمعرف
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // 4. إنشاء منتج جديد (رفع عبر FormData)
  createProduct: async (formData) => {
    const response = await api.post("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // 5. تعديل منتج (PATCH /products/update/{id})
  updateProduct: async (id, formData) => {
    const response = await api.patch(`/products/update/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // 6. حذف منتج
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

export const {
  getProducts,
  searchProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = productService;

export default productService;