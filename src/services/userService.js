import axiosInstance from "../api/axiosInstance";

/**
 * دالة مساعدة لتجريد وتأكيد معرّف المستخدم الصافي
 * تحمي من أخطاء الـ Cast to ObjectId (500)
 */
const resolveUserId = (userOrId) => {
  if (!userOrId) return "";
  if (typeof userOrId === "string") return userOrId.trim();
  if (typeof userOrId === "object") {
    return String(userOrId._id || userOrId.id || userOrId.userId || "").trim();
  }
  return String(userOrId).trim();
};

// ─── 1. عمليات المشرف / لوحة التحكم (Admin Operations) ───

/**
 * جلب جميع المستخدمين مرتبين من الأحدث للأقدم مع دعم البارامترات
 * GET /users/all
 */
export const getAllUsers = async (params = {}) => {
  const response = await axiosInstance.get("/users/all", { params });
  return response.data;
};

/**
 * إضافة مستخدم جديد مباشرة من لوحة التحكم (بدون OTP)
 * POST /users/add
 * Body: { username, email, password, phone }
 */
export const addUserByAdmin = async (userData) => {
  const response = await axiosInstance.post("/users/add", {
    username: userData.username?.trim(),
    email: userData.email?.trim().toLowerCase(),
    password: userData.password,
    phone: userData.phone?.trim(),
  });
  return response.data;
};

// اسم مرادف لضمان التوافق مع أي استدعاء سابق
export const addUser = addUserByAdmin;

/**
 * جلب بيانات مستخدم محدد بالمعرّف
 * GET /users/{id}
 */
export const getUserById = async (userOrId) => {
  const userId = resolveUserId(userOrId);
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data;
};

/**
 * تعديل دور وصلاحية المستخدم من قبل المشرف
 * PATCH /auth/change-role
 * Body: { userId: string, role: "customer" | "admin" }
 */
export const changeRole = async (userOrData, optionalRole) => {
  let userId = "";
  let role = "";

  if (typeof userOrData === "object" && userOrData !== null) {
    userId = resolveUserId(userOrData.userId || userOrData._id || userOrData.id);
    role = userOrData.role;
  } else {
    userId = resolveUserId(userOrData);
    role = optionalRole;
  }

  const response = await axiosInstance.patch("/auth/change-role", { 
    userId, 
    role 
  });
  return response.data;
};

// مرادفات لدعم كافة أشكال الاستدعاء
export const changeUserRole = changeRole;

/**
 * حذف حساب مستخدم نهائياً
 * DELETE /users/{id}
 */
export const deleteUser = async (userOrId) => {
  const userId = resolveUserId(userOrId);
  const response = await axiosInstance.delete(`/users/${userId}`);
  return response.data;
};

// ─── 2. عمليات المستخدم / الملف الشخصي (User Profile Operations) ───

/**
 * تحديث الملف الشخصي للمستخدم
 * PATCH /users/{id}
 * Body: { username, phone, avatar }
 */
export const updateUserProfile = async (userOrId, updateData = {}) => {
  const userId = resolveUserId(userOrId);
  const payload = {};

  if (updateData.username !== undefined) payload.username = updateData.username.trim();
  if (updateData.phone !== undefined) payload.phone = updateData.phone.trim();
  if (updateData.avatar !== undefined) payload.avatar = updateData.avatar.trim();

  const response = await axiosInstance.patch(`/users/${userId}`, payload);
  return response.data;
};

// اسم مرادف للتوافق
export const updateUser = updateUserProfile;

// ─── 3. التصدير المجمع (Default & Named Export) ───
export const userService = {
  getAllUsers,
  addUserByAdmin,
  addUser,
  getUserById,
  updateUserProfile,
  updateUser,
  changeRole,
  changeUserRole,
  deleteUser,
};

export default userService;