import React from "react";
import { Menu, Sun, Moon, Globe, Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

export const AdminNavbar = ({ onToggleSidebar }) => {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  // فحص واستخراج بيانات المشرف الحقيقية بأمان من السياق أو التخزين المحلي
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || JSON.parse(localStorage.getItem("adminUser")) || null;
    } catch {
      return null;
    }
  })();

  const currentUser = user?.data || user?.user || user || storedUser?.user || storedUser?.data || storedUser || {};

  const displayName =
    currentUser?.name ||
    currentUser?.username ||
    currentUser?.fullName ||
    currentUser?.displayName ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "المشرف");

  const avatarInitial = displayName.trim().charAt(0).toUpperCase();

  const rawRole = currentUser?.role || "Administrator";
  const displayRole =
    rawRole.toLowerCase() === "admin"
      ? t("admin.role_admin", "مدير النظام")
      : rawRole;

  const toggleLanguage = () => {
    const nextLang = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(nextLang);
  };

  const formattedDate = new Intl.DateTimeFormat(
    i18n.language === "ar" ? "ar-EG" : "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
    }
  ).format(new Date());

  return (
    <header className="h-16 bg-surface-card dark:bg-surface-dark-card border-b border-border dark:border-border-dark px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* الجانب الأيمن / الأيسر: زر القائمة للشاشات الصغيرة وتاريخ اليوم */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-secondary hover:bg-secondary/10 focus:outline-none transition-colors cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <span className="text-xs font-semibold text-secondary-muted capitalize">
            {formattedDate}
          </span>
          <span className="text-sm font-bold text-text-main dark:text-text-inverse">
            {t("admin.portal_title", "لوحة الإدارة")}
          </span>
        </div>
      </div>

      {/* الأدوات العلوية: تبديل اللغة، الإشعارات، الثيم، وملف المشرف */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* زر تبديل اللغة */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border dark:border-border-dark text-xs font-semibold text-text-main dark:text-text-inverse hover:bg-secondary/10 transition-colors cursor-pointer"
          title="Switch Language"
        >
          <Globe className="w-4 h-4 text-primary dark:text-accent" />
          <span>{i18n.language === "ar" ? "English" : "العربية"}</span>
        </button>

        {/* زر الإشعارات */}
        <button
          className="relative p-2 rounded-xl border border-border dark:border-border-dark text-secondary-muted hover:text-text-main dark:hover:text-text-inverse hover:bg-secondary/10 transition-colors cursor-pointer"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-status-warning" />
        </button>

        {/* زر تبديل الوضع الليلي والنهاري */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-border dark:border-border-dark text-text-main dark:text-text-inverse hover:bg-secondary/10 transition-colors cursor-pointer"
          title="Toggle Theme"
          aria-label="Toggle Theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-accent" />
          ) : (
            <Moon className="w-4 h-4 text-primary" />
          )}
        </button>

        {/* هوية المشرف الفعلية */}
        <div className="flex items-center gap-2.5 ps-2 border-s border-border dark:border-border-dark">
          <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-accent/20 text-primary dark:text-accent font-bold flex items-center justify-center text-sm shadow-xs select-none">
            {avatarInitial}
          </div>
          <div className="flex flex-col text-start min-w-0">
            <span className="text-xs font-bold text-text-main dark:text-text-inverse leading-tight truncate max-w-[140px]">
              {displayName}
            </span>
            <span className="text-[10px] text-secondary-muted font-medium mt-0.5 truncate">
              {displayRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;