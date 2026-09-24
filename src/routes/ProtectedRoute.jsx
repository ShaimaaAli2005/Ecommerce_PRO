import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLoader from "../components/loader/PageLoader";

export const ProtectedRoute = ({ requireAdmin = false, requiredRole = null }) => {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  // التحقق من المصادقة (التوكن أو حالة المستخدم)
  const hasToken = localStorage.getItem("token") || localStorage.getItem("admin_token") || localStorage.getItem("luma_token");
  
  if (!isAuthenticated && !hasToken) {
    const redirectPath = requireAdmin ? "/admin/login" : "/login";
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // التحقق من صلاحيات المشرف إذا كانت مطلوبة
  if (requireAdmin && !isAdmin && user?.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  // التحقق من دور مخصص (Role-based) إذا تم تمريره
  if (requiredRole && user?.role && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;