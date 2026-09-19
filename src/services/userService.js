import axiosInstance from "../api/axiosInstance";

/**
 * استعراض كافة المستخدمين للمشرف (مرتبين تلقائياً من الأحدث)
 * GET /users/all
 */
export const getAllUsers = async (params = {}) => {
  const response = await axiosInstance.get("/users/all", { params });
  return response.data;
};

/**
 * إضافة مستخدم جديد مباشرة من لوحة المشرف دون الحاجة لـ OTP
 * POST /users/add
 */
export const addUser = async (userData) => {
  const response = await axiosInstance.post("/users/add", userData);
  return response.data;
};

/**
 * جلب ملف مستخدم محدد بالمعرف
 * GET /users/{id}
 */
export const getUserById = async (id) => {
  const response = await axiosInstance.get(`/users/${id}`);
  return response.data;
};

/**
 * تحديث الملف الشخصي للمستخدم الحالي (username, phone, avatar)
 * PATCH /users/{id}
 */
export const updateUser = async (id, userData) => {
  const response = await axiosInstance.patch(`/users/${id}`, userData);
  return response.data;
};

/**
 * تعديل دور وصلاحية المستخدم من المشرف مع إرسال إشعار بريدي
 * PATCH /auth/change-role
 * role: "customer" | "admin"
 */
export const changeRole = async ({ userId, role }) => {
  const response = await axiosInstance.patch("/auth/change-role", { userId, role });
  return response.data;
};

/**
 * حذف حساب مستخدم نهائياً للمشرف
 * DELETE /users/{id}
 */
export const deleteUser = async (id) => {
  const response = await axiosInstance.delete(`/users/${id}`);
  return response.data;
};

export const userService = {
  getAllUsers,
  addUser,
  getUserById,
  updateUser,
  changeRole,
  deleteUser,
};

export default userService;