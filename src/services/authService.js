import axiosInstance from "../api/axiosInstance";

/**
 * 1. إرسال رمز OTP لإنشاء حساب جديد
 * POST /auth/register/send-otp
 */
export const sendRegisterOtp = async (userData) => {
  const payload = {
    username: userData.username?.trim(),
    email: userData.email?.trim().toLowerCase(),
    password: userData.password,
    phone: userData.phone?.trim(),
  };
  const response = await axiosInstance.post("/auth/register/send-otp", payload);
  return response.data;
};

export const sendRegisterOTP = sendRegisterOtp;

/**
 * 2. تأكيد رمز OTP وإنشاء الحساب
 * POST /auth/register/verify-otp
 */
export const verifyRegisterOtp = async (emailOrData, otpParam) => {
  const payload =
    typeof emailOrData === "object" && emailOrData !== null
      ? {
          email: String(emailOrData.email).trim().toLowerCase(),
          otp: String(emailOrData.otp).trim(),
        }
      : {
          email: String(emailOrData).trim().toLowerCase(),
          otp: String(otpParam).trim(),
        };

  const response = await axiosInstance.post("/auth/register/verify-otp", payload);
  return response.data;
};

export const verifyRegisterOTP = verifyRegisterOtp;

/**
 * 3. تسجيل الدخول وحفظ الجلسة
 * POST /auth/login
 */
export const login = async (emailOrData, passwordParam) => {
  const payload =
    typeof emailOrData === "object" && emailOrData !== null
      ? {
          email: String(emailOrData.email).trim().toLowerCase(),
          password: emailOrData.password,
        }
      : {
          email: String(emailOrData).trim().toLowerCase(),
          password: passwordParam,
        };

  const response = await axiosInstance.post("/auth/login", payload);
  const data = response.data;

  // إدارة التوكن وبيانات المستخدم بذكاء
  if (data?.token) {
    localStorage.setItem("token", data.token);
    // إذا كان الحساب يملك صلاحية مشرف، نخزن نسخة لتوكن الأدمن
    if (data.user?.role === "admin") {
      localStorage.setItem("admin_token", data.token);
    }
  }

  if (data?.user) {
    localStorage.setItem("userData", JSON.stringify(data.user));
  }

  return data;
};

/**
 * 4. تسجيل الخروج وتطهير كافة المفاتيح
 * POST /auth/logout
 */
export const logout = async () => {
  try {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
  } catch (err) {
    // نتجاهل الأخطاء ونكمل عملية التنظيف
    return null;
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("luma_token");
    localStorage.removeItem("userData");
  }
};

/**
 * 5. فحص الجلسة الحالية وجلب بيانات المستخدم
 * GET /auth/me
 */
export const getMe = async () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("admin_token") ||
    localStorage.getItem("luma_token");

  if (!token) {
    return null;
  }

  const response = await axiosInstance.get("/auth/me");
  return response.data;
};

/**
 * 6. إرسال رمز OTP لاستعادة كلمة المرور
 * POST /auth/forgot-password/send-otp
 */
export const sendForgotPasswordOtp = async (emailOrData) => {
  const email =
    typeof emailOrData === "object" && emailOrData !== null
      ? emailOrData.email
      : emailOrData;

  const response = await axiosInstance.post("/auth/forgot-password/send-otp", {
    email: String(email || "").trim().toLowerCase(),
  });
  return response.data;
};

export const sendForgotPasswordOTP = sendForgotPasswordOtp;

/**
 * 7. التحقق من OTP وتعيين كلمة المرور الجديدة
 * POST /auth/forgot-password/verify-otp
 */
export const verifyForgotPasswordOtp = async (emailOrData, otpParam, newPasswordParam) => {
  const payload =
    typeof emailOrData === "object" && emailOrData !== null
      ? {
          email: String(emailOrData.email).trim().toLowerCase(),
          otp: String(emailOrData.otp).trim(),
          newPassword: emailOrData.newPassword,
        }
      : {
          email: String(emailOrData).trim().toLowerCase(),
          otp: String(otpParam).trim(),
          newPassword: newPasswordParam,
        };

  const response = await axiosInstance.post(
    "/auth/forgot-password/verify-otp",
    payload
  );
  return response.data;
};

export const verifyForgotPasswordOTP = verifyForgotPasswordOtp;

/**
 * 8. تعديل صلاحية المستخدم (خاص بالمشرف - Admin)
 * PATCH /auth/change-role
 */
export const changeUserRole = async (userId, role) => {
  const response = await axiosInstance.patch("/auth/change-role", {
    userId: String(userId),
    role: String(role),
  });
  return response.data;
};

/**
 * 9. فحص صلاحية المشرف
 * GET /auth/admin-test
 */
export const checkAdminAccess = async () => {
  const response = await axiosInstance.get("/auth/admin-test");
  return response.data;
};

export const authService = {
  sendRegisterOtp,
  sendRegisterOTP,
  verifyRegisterOtp,
  verifyRegisterOTP,
  login,
  logout,
  getMe,
  sendForgotPasswordOtp,
  sendForgotPasswordOTP,
  verifyForgotPasswordOtp,
  verifyForgotPasswordOTP,
  changeUserRole,
  checkAdminAccess,
};

export default authService;