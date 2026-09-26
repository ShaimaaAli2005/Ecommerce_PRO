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
  X,
  FolderTree
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

export const Sidebar = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");
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
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* السايدبار الأساسي */}
      <aside 
        className={`fixed top-0 bottom-0 z-50 w-64 bg-white dark:bg-[#0B132B] border-e border-slate-200 dark:border-white/10 flex flex-col transition-transform duration-300 ease-in-out start-0 ${
          isOpen
            ? "translate-x-0"
            : isRtl
            ? "max-lg:translate-x-full lg:translate-x-0"
            : "max-lg:-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* الشعار */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B132B] dark:bg-[#E89A5B] flex items-center justify-center text-white dark:text-[#0B132B] font-extrabold text-base shadow-xs">
              L
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-wider text-slate-900 dark:text-white leading-none">
                LUMA
              </span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                {t("admin.portal_title", "لوحة الإدارة")}
              </span>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition"
          >
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
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all
                  ${isActive 
                    ? "bg-[#0B132B] text-white dark:bg-[#E89A5B] dark:text-[#0B132B] shadow-sm" 
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                  }
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* تسجيل الخروج */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={logoutUser}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{t("auth.logout", "تسجيل الخروج")}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;