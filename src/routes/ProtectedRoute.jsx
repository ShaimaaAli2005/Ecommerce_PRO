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

  if (!isAuthenticated || !user) {
    const redirectPath = requireAdmin ? "/admin/login" : "/login";
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;