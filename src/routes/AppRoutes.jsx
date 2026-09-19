import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PageLoader from "../components/loader/PageLoader";

// ─── Storefront Pages (Lazy Loaded) ───
const StoreLayout = lazy(() => import("../layouts/StoreLayout"));
const StoreCatalog = lazy(() => import("../pages/store/products/StoreCatalog"));
const StoreProductView = lazy(() => import("../pages/store/products/StoreProductView"));
const CartPage = lazy(() => import("../pages/store/cart/CartPage"));
const CheckoutPage = lazy(() => import("../pages/store/checkout/CheckoutPage"));
const OrderSuccess = lazy(() => import("../pages/store/orders/OrderSuccess"));
const MyOrdersPage = lazy(() => import("../pages/store/orders/MyOrdersPage"));
const WishlistPage = lazy(() => import("../pages/store/wishlist/WishlistPage"));
const ProfilePage = lazy(() => import("../pages/store/profile/ProfilePage"));
const Login = lazy(() => import("../pages/store/auth/Login"));
const Register = lazy(() => import("../pages/store/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/store/auth/ForgotPassword"));

// ─── Admin Pages (Lazy Loaded) ───
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const AdminLogin = lazy(() => import("../pages/admin/auth/AdminLogin"));
const AdminDashboard = lazy(() => import("../pages/admin/dashboard/AdminDashboard"));
const ProductsList = lazy(() => import("../pages/admin/products/ProductsList"));
const AddProduct = lazy(() => import("../pages/admin/products/AddProduct"));
const EditProduct = lazy(() => import("../pages/admin/products/EditProduct"));
const ProductDetails = lazy(() => import("../pages/admin/products/ProductDetails"));
const AdminOrdersPage = lazy(() => import("../pages/admin/orders/AdminOrdersPage"));
const AdminOrderDetail = lazy(() => import("../pages/admin/orders/AdminOrderDetail"));
const AdminCartsPage = lazy(() => import("../pages/admin/carts/AdminCartsPage"));
const AdminUsersPage = lazy(() => import("../pages/admin/users/AdminUsersPage"));

// ─── Fallback & Error ───
const NotFound = lazy(() => import("../pages/NotFound"));

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* مسار دخول الإدارة المنفصل */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* مسارات المتجر العام للعملاء */}
        <Route element={<StoreLayout />}>
          <Route path="/" element={<StoreCatalog />} />
          <Route path="/products" element={<StoreCatalog />} />
          <Route path="/products/:id" element={<StoreProductView />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* مسارات العميل المحمية (تشترط تسجيل الدخول فقط) */}
          <Route element={<ProtectedRoute requireAdmin={false} />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/my-orders" element={<MyOrdersPage />} />
          </Route>
        </Route>

        {/* مسارات لوحة التحكم المحمية حصرياً للمشرفين */}
        <Route element={<ProtectedRoute requireAdmin={true} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<ProductsList />} />
            <Route path="products/add" element={<AddProduct />} />
            <Route path="products/edit/:id" element={<EditProduct />} />
            <Route path="products/:id" element={<ProductDetails />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
            <Route path="carts" element={<AdminCartsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>
        </Route>

        {/* صفحة الخطأ 404 لكافة الروابط غير المعرفة */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;