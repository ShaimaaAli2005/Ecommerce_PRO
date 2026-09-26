import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLoader from "../components/loader/PageLoader";

export const ProtectedRoute = ({ children, requireAdmin = false, requiredRole = null }) => {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  // 1. فحص وجود التوكن المعتمد
  const token = localStorage.getItem("token") || localStorage.getItem("admin_token") || localStorage.getItem("luma_token");

  if (!token) {
    const redirectPath = requireAdmin ? "/admin/login" : "/login";
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // استخراج المستخدم المخزن احتياطياً للتأكد من الرتبة في حال تأخر الـ Context
  let localUser = null;
  try {
    localUser = JSON.parse(localStorage.getItem("user")) || JSON.parse(localStorage.getItem("adminUser")) || null;
  } catch {
    // Ignore
  }

  const activeUser = user || localUser;
  const userRole = activeUser?.role || activeUser?.user?.role || "";

  // 2. التحقق الصارم من رتبة الأدمن (يمنع المتسوق العادي من دخول الداشبورد)
  if (requireAdmin) {
    const isUserAdmin = isAdmin || userRole.toLowerCase() === "admin";
    if (!isUserAdmin) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
  }

  // 3. التحقق من دور مخصص إذا وجد
  if (requiredRole && userRole.toLowerCase() !== requiredRole.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  // 🌟 الحل الجذري: إرجاع الـ children (وهو AdminLayout) إذا وُجد، وإلا استخدام Outlet
  return children ? children : <Outlet />;
};

export default ProtectedRoute;