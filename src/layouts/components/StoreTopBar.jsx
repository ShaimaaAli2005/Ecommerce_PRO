import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sparkles, Sun, Moon, Globe, User, LogOut, LogIn } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import toast from "react-hot-toast";

export default function StoreTopBar() {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");
  const navigate = useNavigate();

  // استخدام سياق الثيم الصحيح
  const { theme, toggleTheme } = useTheme();

  const isAuthenticated = Boolean(localStorage.getItem("token") || localStorage.getItem("admin_token"));

  const toggleLanguage = () => {
    const newLang = isRtl ? "en" : "ar";
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin_token");
    toast.success(t("store.auth.logout_success", "Logged out successfully"));
    navigate("/");
  };

  return (
    <div className="bg-[#070D1F] text-slate-300 px-4 sm:px-8 py-2.5 text-[11px] font-bold border-b border-white/10 flex items-center justify-between z-50 shadow-xs" dir="ltr">
      <div className="w-1/4 hidden sm:block"></div>
      
      <div className="flex-1 text-center text-[#E89A5B] flex items-center justify-center gap-2 truncate px-2" dir={isRtl ? "rtl" : "ltr"}>
        <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse" />
        <span className="truncate tracking-wider">{t("store.announcement", "Free Express Shipping Worldwide on Orders Over $200")}</span>
      </div>

      <div className="w-1/3 flex items-center justify-end gap-2.5">
        
        {/* زر التبديل بين الدارك مود واللايت مود */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white cursor-pointer shrink-0 border border-white/10"
          title="Toggle Theme"
        >
          {theme === "dark" ? (
            <Sun className="w-3.5 h-3.5 text-[#E89A5B]" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-slate-300" />
          )}
          <span className="text-[10px] uppercase tracking-wider">
            {theme === "dark" ? t("store.theme.light", "Light") : t("store.theme.dark", "Dark")}
          </span>
        </button>

        {/* زر تبديل اللغة */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white cursor-pointer shrink-0 border border-white/10"
          title="Change Language"
        >
          <Globe className="w-3.5 h-3.5 text-[#E89A5B]" />
          <span className="text-[10px] uppercase tracking-wider">{i18n.language === "ar" ? "EN" : "AR"}</span>
        </button>

        {/* إدارة الحساب */}
        {isAuthenticated ? (
          <div className="flex items-center gap-1.5 ms-1">
            <Link 
              to="/profile" 
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors flex items-center justify-center border border-white/10"
              title={t("store.nav.profile", "Profile")}
            >
              <User className="w-3.5 h-3.5 text-[#E89A5B]" />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-full bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors flex items-center justify-center cursor-pointer border border-rose-500/20"
              title={t("store.nav.logout", "Logout")}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E89A5B] text-[#0B132B] hover:opacity-90 transition-opacity text-[10px] font-black uppercase tracking-wider shrink-0 ms-1 shadow-sm"
          >
            <LogIn className="w-3 h-3" />
            <span>{t("store.nav.login", "Login")}</span>
          </Link>
        )}
      </div>
    </div>
  );
}