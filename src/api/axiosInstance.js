import axios from "axios";

// وضع رابط السيرفر صريحاً ومباشراً لتجنب أي مشاكل في قراءة متغيرات البيئة على Vercel
const API_BASE_URL = "https://e-commerce-api-3wara.vercel.app";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
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