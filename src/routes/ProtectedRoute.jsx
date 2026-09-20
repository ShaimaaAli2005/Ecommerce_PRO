import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children, requiredRole = "admin" }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // جلب التوكن واليوزر الاحتياطي من التخزين المحلي فوراً لمنع وميض الخروج
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  const currentUser = user || storedUser;

  // 1. إذا كان لا يزال يحمل الجلسة
  if (loading && !token) {
    return null; // أو شاشة تحميل بسيطة
  }

  // 2. إذا لم يكن هناك توكن من الأساس، أعد توجيهه لصفحة لوجن الأدمن وليس لوجن المتجر!
  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // 3. التحقق من صلاحية المشرف
  if (requiredRole && currentUser?.role && currentUser.role !== requiredRole) {
    // إذا كان مسجلاً لكن ليس أدمن، امسح التوكن وأعده للوجن الأدمن
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;