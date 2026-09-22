import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://e-commerce-api-3wara.vercel.app";

const axiosInstance = axios.create({
  baseURL: "/api", 
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const isAdminRoute = window.location.pathname.startsWith("/admin");
    
    const token = isAdminRoute 
      ? localStorage.getItem("admin_token") || localStorage.getItem("token") 
      : localStorage.getItem("token");

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
        const isAdminRoute = window.location.pathname.startsWith("/admin");

        if (isAdminRoute) {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("token");
          window.location.href = "/admin/login";
        } else {
          localStorage.removeItem("token");

          if (!window.location.pathname.includes("/login")) {
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;