import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PageLoader from "../components/loader/PageLoader";

// ─── إطار وصفحات المتجر ───
const HomePage = lazy(() => import("../pages/store/HomePage"));
const StoreLayout = lazy(() => import("../layouts/StoreLayout"));
const Login = lazy(() => import("../pages/store/auth/Login"));
const Register = lazy(() => import("../pages/store/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/store/auth/ForgotPassword"));
const StoreCatalog = lazy(() => import("../pages/store/products/StoreCatalog"));
const StoreProductView = lazy(() => import("../pages/store/products/StoreProductView"));
const WishlistPage = lazy(() => import("../pages/store/wishlist/WishlistPage"));
const CartPage = lazy(() => import("../pages/store/cart/CartPage"));
const CheckoutPage = lazy(() => import("../pages/store/checkout/CheckoutPage"));
const OrderSuccess = lazy(() => import("../pages/store/orders/OrderSuccess"));
const MyOrdersPage = lazy(() => import("../pages/store/orders/MyOrdersPage"));
const ProfilePage = lazy(() => import("../pages/store/profile/ProfilePage"));
const NotFound = lazy(() => import("../pages/NotFound"));

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* مسارات المتجر */}
        <Route element={<StoreLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<StoreCatalog />} />
          <Route path="/products/:id" element={<StoreProductView />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
        </Route>

        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;