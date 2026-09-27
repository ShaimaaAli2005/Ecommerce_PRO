import axios from "axios";

// استخدام وسيط مدمج يوجه الطلب مباشرة للسيرفر الأصلي ويتجاوز قيود الـ CORS والـ 404
const PROXY_PREFIX = "https://api.allorigins.win/raw?url=";
const TARGET_API = "https://e-commerce-api-3wara.vercel.app";

const axiosInstance = axios.create({
  baseURL: TARGET_API, // العودة للرابط الأصلي المباشر
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
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

export default axiosInstance;