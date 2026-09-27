import axios from "axios";

// استخدام وسيط مخصص لتجاوز حظر الـ CORS للطلبات المباشرة
const CORS_PROXY = "https://corsproxy.io/?";
const TARGET_API = "https://e-commerce-api-3wara.vercel.app";

const axiosInstance = axios.create({
  baseURL: CORS_PROXY + encodeURIComponent(TARGET_API),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // يجب تعطيلها عند استخدام الوسيط الخارجي لمنع تعارض الهيدرز
});

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