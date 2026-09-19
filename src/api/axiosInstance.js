import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://e-commerce-api-3wara.vercel.app";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ضروري لدعم httpOnly cookies للتوثيق وجلسات السيرفر
});

// اعتراض الطلبات لحقن التوكن في حال توفره احتياطياً
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// اعتراض الاستجابات لمعالجة انتهاء الجلسة 401 تلقائياً
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // تجنب إعادة التوجيه في حال كان الطلب نفسه فحص جلسة أو محاولة تسجيل دخول
      const isAuthCheck = error.config.url?.includes("/auth/me");
      const isLogin = error.config.url?.includes("/auth/login");

      if (!isAuthCheck && !isLogin) {
        localStorage.removeItem("token");
        if (window.location.pathname.startsWith("/admin")) {
          window.location.href = "/admin/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;