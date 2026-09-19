import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLoader from "../components/loader/PageLoader";

export const ProtectedRoute = ({ requireAdmin = true }) => {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    // التوجيه إلى صفحة دخول المشرف إذا كان المسار يخص الإدارة
    const redirectPath = requireAdmin ? "/admin/login" : "/login";
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    // إذا كان مسجلاً كـ Customer وحاول دخول الأدمن، يتم نقله لصفحة غير مصرح بها أو الرئيسية
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;