import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://e-commerce-api-3wara.vercel.app";

const axiosInstance = axios.create({
  baseURL: "/api", // أو API_BASE_URL حسب إعداد الـ Proxy لديك
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// اعتراض الطلبات: استخدام مفتاح توكن موحد ومستقل لكل مسار
axiosInstance.interceptors.request.use(
  (config) => {
    const isAdminRoute = window.location.pathname.startsWith("/admin");
    
    // إذا كنا في لوحة التحكم نبحث عن توكن الأدمن، وإذا كنا في المتجر نبحث عن توكن المتجر
    // أو نعتمد مفتاحاً موحداً عاماً لتجنب أي ازدواجية
    const token = isAdminRoute 
      ? localStorage.getItem("admin_token") || localStorage.getItem("token") 
      : localStorage.getItem("token"); // التوكن الموحد للمتجر

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// اعتراض الاستجابات لمعالجة انتهاء الجلسة 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthCheck = error.config.url?.includes("/auth/me");
      const isLogin = error.config.url?.includes("/auth/login");

      if (!isAuthCheck && !isLogin) {
        const isAdminRoute = window.location.pathname.startsWith("/admin");

        if (isAdminRoute) {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("token");
          window.location.href = "/admin/login";
        } else {
          localStorage.removeItem("token");
          // يمكن توجيه مستخدم المتجر لتسجيل الدخول إذا لزم الأمر
          if (!window.location.pathname.includes("/login")) {
            // window.location.href = "/login"; // اختيارية حسب رغبتك
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;