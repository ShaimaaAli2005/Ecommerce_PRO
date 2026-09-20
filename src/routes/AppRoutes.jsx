import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PageLoader from "../components/loader/PageLoader";

// ─── مكوّن بديل مؤقت لصفحات المتجر غير المنتهية ───
const StorePlaceholder = ({ title }) => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
    <h2 className="text-xl font-bold text-text-main dark:text-text-inverse mb-2">
      {title}
    </h2>
    <p className="text-sm text-secondary-muted">
      هذه الصفحة قيد التطوير من قبل فريق واجهة المتجر (Store Team).
    </p>
  </div>
);

// ─── إطار العمل وصفحات الأدمن ───
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const AdminLogin = lazy(() => import("../pages/admin/auth/AdminLogin"));
const DashboardOverview = lazy(() => import("../pages/admin/dashboard/DashboardOverview"));
const ProductsList = lazy(() => import("../pages/admin/products/ProductsList"));
const AddProduct = lazy(() => import("../pages/admin/products/AddProduct"));
const EditProduct = lazy(() => import("../pages/admin/products/EditProduct"));
const ProductDetails = lazy(() => import("../pages/admin/products/ProductDetails"));
const AdminOrdersPage = lazy(() => import("../pages/admin/orders/AdminOrdersPage"));
const AdminOrderDetail = lazy(() => import("../pages/admin/orders/AdminOrderDetail"));
const AdminCartsPage = lazy(() => import("../pages/admin/carts/AdminCartsPage"));
const UsersListPage = lazy(() => import("../pages/admin/users/UsersListPage"));
const AdminUserDetail = lazy(() => import("../pages/admin/users/AdminUserDetail"));
const AdminWishlistPage = lazy(() => import("../pages/admin/wishlist/AdminWishlistPage"));
const AdminSettingsPage = lazy(() => import("../pages/admin/settings/AdminSettingsPage"));
const CategoriesPage = lazy(() => import("../pages/admin/categories/CategoriesPage"));

// ─── إطار وصفحات المتجر ───
const StoreLayout = lazy(() => import("../layouts/StoreLayout"));
const StoreCatalog = () => <StorePlaceholder title="Store Catalog" />;
const StoreProductView = () => <StorePlaceholder title="Store Product Details" />;
const CartPage = () => <StorePlaceholder title="Shopping Cart" />;
const CheckoutPage = () => <StorePlaceholder title="Checkout Page" />;
const OrderSuccess = () => <StorePlaceholder title="Order Success" />;
const MyOrdersPage = () => <StorePlaceholder title="My Orders" />;
const WishlistPage = () => <StorePlaceholder title="Wishlist" />;
const ProfilePage = () => <StorePlaceholder title="Profile Page" />;
const Login = () => <StorePlaceholder title="Customer Login" />;
const Register = () => <StorePlaceholder title="Customer Register" />;
const ForgotPassword = () => <StorePlaceholder title="Forgot Password" />;
const NotFound = lazy(() => import("../pages/NotFound"));

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* مسار تسجيل دخول الأدمن */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* مسارات لوحة التحكم الإدارية المحمية */}
        <Route
        path="/admin"
        element={
            <ProtectedRoute requiredRole="admin">
            <AdminLayout />
            </ProtectedRoute>
        }
        >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardOverview />} />
        <Route path="products" element={<ProductsList />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<EditProduct />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="carts" element={<AdminCartsPage />} />
        <Route path="users" element={<UsersListPage />} />
        <Route path="users/:id" element={<AdminUserDetail />} />
        <Route path="wishlist" element={<AdminWishlistPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="categories" element={<CategoriesPage />} /> {/* ← تم تصحيح المسار بنجاح */}
        </Route>

        {/* مسارات المتجر */}
        <Route element={<StoreLayout />}>
          <Route path="/" element={<StoreCatalog />} />
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