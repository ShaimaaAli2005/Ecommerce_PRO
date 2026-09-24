import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  ShoppingBag,
  Heart,
  Settings,
  LogOut,
  X 
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { FolderTree } from "lucide-react";

export const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { logoutUser } = useAuth();

  const navItems = [
    { to: "/admin/dashboard", label: t("admin.dashboard", "لوحة الإحصائيات"), icon: LayoutDashboard },
    { to: "/admin/products", label: t("admin.products", "المنتجات والمخزون"), icon: Package },
    { to: "/admin/orders", label: t("admin.orders", "إدارة الطلبات"), icon: ShoppingCart },
    { to: "/admin/carts", label: t("admin.carts", "السلات النشطة"), icon: ShoppingBag },
    { to: "/admin/wishlist", label: t("admin.wishlist", "قوائم الرغبات"), icon: Heart },
    { to: "/admin/users", label: t("admin.users", "المستخدمين والأدوار"), icon: Users },
    { to: "/admin/categories", label: t("admin.categories_page.title", "التصنيفات والفئات"), icon: FolderTree },
    { to: "/admin/settings", label: t("admin.settings", "إعدادات المتجر"), icon: Settings },
  ];

  return (
    <>
      {/* خلفية معتمة للهواتف فقط */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* السايدبار الأساسي */}
      <aside className={`
        fixed top-0 bottom-0 z-50 w-64 bg-surface-card dark:bg-surface-dark-card border-r rtl:border-r-0 rtl:border-l border-border dark:border-border-dark flex flex-col transition-transform duration-200 ease-in-out
        ltr:left-0 rtl:right-0
        ${isOpen ? "translate-x-0" : "max-lg:-translate-x-full rtl:max-lg:translate-x-full"}
      `}>
        {/* الشعار */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border dark:border-border-dark">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary dark:bg-accent flex items-center justify-center text-white dark:text-primary-active font-extrabold text-base">
              L
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-wider text-text-main dark:text-text-inverse leading-none">
                LUMA
              </span>
              <span className="text-[10px] text-secondary-muted font-medium mt-0.5">
                {t("admin.portal_title", "لوحة الإدارة")}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 text-secondary hover:opacity-75">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* الروابط */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${isActive 
                    ? "bg-primary text-white dark:bg-accent dark:text-primary-active shadow-sm font-semibold" 
                    : "text-secondary-muted hover:text-text-main hover:bg-secondary/10 dark:hover:text-text-inverse"
                  }
                `}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* تسجيل الخروج */}
        <div className="p-4 border-t border-border dark:border-border-dark">
          <button
            onClick={logoutUser}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-status-error hover:bg-status-error/10 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>{t("auth.logout", "تسجيل الخروج")}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;