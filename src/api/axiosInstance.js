import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api", // يوجه الطلب لملف الـ Serverless Proxy على Vercel
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default axiosInstance;