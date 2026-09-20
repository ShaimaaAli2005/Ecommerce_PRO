import api from "../api/axiosInstance";

export const userService = {
  // جلب كافة المستخدمين
  getAllUsers: async () => {
    const response = await api.get("/users/all");
    return response.data;
  },

  // جلب بيانات مستخدم واحد
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // إضافة مستخدم جديد من لوحة التحكم مباشرة
  addUser: async (userData) => {
    const response = await api.post("/users/add", userData);
    return response.data;
  },

  // تحديث بيانات المستخدم (الاسم، الهاتف، الصورة)
  updateUser: async (id, data) => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  // حذف مستخدم نهائياً
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // تغيير رتبة / صلاحية المستخدم
  changeUserRole: async (userId, role) => {
    const response = await api.patch("/auth/change-role", {
      userId,
      role,
    });
    return response.data;
  },
};

export default userService;