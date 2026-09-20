import axiosInstance from "../api/axiosInstance";

/**
 * إرسال رمز OTP لإنشاء حساب جديد (ينتهي بعد 10 دقائق)
 * POST /auth/register/send-otp
 */
export const sendRegisterOtp = async (userData) => {
  const response = await axiosInstance.post("/auth/register/send-otp", userData);
  return response.data;
};

/**
 * تأكيد رمز OTP وإنشاء الحساب
 * POST /auth/register/verify-otp
 */
export const verifyRegisterOtp = async ({ email, otp }) => {
  const response = await axiosInstance.post("/auth/register/verify-otp", {
    email: email.trim().toLowerCase(),
    otp: String(otp).trim(),
  });
  return response.data;
};

/**
 * تسجيل الدخول (يعيد التوكن ويضبط كوكيز httpOnly)
 * POST /auth/login
 */
export const login = async ({ email, password }) => {
  const response = await axiosInstance.post("/auth/login", {
    email: email.trim().toLowerCase(),
    password,
  });
  return response.data;
};

/**
 * تسجيل الخروج ومسح كوكيز المصادقة
 * POST /auth/logout
 */
export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

/**
 * جلب بيانات المستخدم المسجل حالياً والتحقق من الجلسة
 * GET /auth/me
 */
export const getMe = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return null; // تجنب إرسال طلب غير مصرح به إن لم يكن هناك تسجيل دخول
  }
  const response = await axiosInstance.get("/auth/me");
  return response.data;
};

/**
 * إرسال رمز OTP لاستعادة كلمة المرور
 * POST /auth/forgot-password/send-otp
 */
export const sendForgotPasswordOtp = async (email) => {
  const response = await axiosInstance.post("/auth/forgot-password/send-otp", {
    email: email.trim().toLowerCase(),
  });
  return response.data;
};

/**
 * التحقق من OTP وتعيين كلمة مرور جديدة مباشرة
 * POST /auth/forgot-password/verify-otp
 */
export const verifyForgotPasswordOtp = async ({ email, otp, newPassword }) => {
  const response = await axiosInstance.post("/auth/forgot-password/verify-otp", {
    email: email.trim().toLowerCase(),
    otp: String(otp).trim(),
    newPassword,
  });
  return response.data;
};

/**
 * فحص امتلاك صلاحية الأدمن التجريبية
 * GET /auth/admin-test
 */
export const checkAdminAccess = async () => {
  const response = await axiosInstance.get("/auth/admin-test");
  return response.data;
};

export const authService = {
  sendRegisterOtp,
  verifyRegisterOtp,
  login,
  logout,
  getMe,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  checkAdminAccess,
};

export default authService;