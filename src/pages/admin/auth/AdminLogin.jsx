import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, AlertCircle, Loader2, ArrowRight, ArrowLeft, Globe, Moon, Sun } from "lucide-react";
import api from "../../../api/axiosInstance";

export const AdminLogin = () => {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // حالة محلية للوضع الليلي داخل صفحة الدخول إذا لم تكن مرتبطة ببروفيدر عام
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleLanguage = () => {
    const newLang = isRtl ? "en" : "ar";
    i18n.changeLanguage(newLang);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage(t("admin.admin_login.email_password_required"));
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email: trimmedEmail,
        password: password,
      });

      const token = res.data?.token;
      const user = res.data?.user || res.data?.data;

      if (!token) {
        throw new Error(t("admin.admin_login.no_token"));
      }

      if (user?.role && user.role !== "admin") {
        setErrorMessage(t("admin.admin_login.admin_access_denied"));
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      console.error("Login request error:", err);
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        t("admin.admin_login.invalid_credentials");
      setErrorMessage(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-[#F7F5F0] dark:bg-[#0B132B] flex flex-col justify-center items-center p-0 md:p-6 lg:p-10 font-['Inter',sans-serif] relative select-none transition-colors duration-500"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* ─── شريط أدوات علوي سريع للتبديل (لغة + دارك مود) ─── */}
      <div className="absolute top-6 end-6 flex items-center gap-3 z-20">
        <button
          type="button"
          onClick={toggleLanguage}
          className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#121B35] text-[#0B132B] dark:text-white border border-black/10 dark:border-white/10 text-xs font-bold shadow-sm hover:border-[#E89A5B] transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Globe className="w-4 h-4 text-[#E89A5B]" />
          <span>{isRtl ? "English" : "العربية"}</span>
        </button>

        <button
          type="button"
          onClick={toggleDarkMode}
          className="p-2.5 rounded-2xl bg-white dark:bg-[#121B35] text-[#0B132B] dark:text-white border border-black/10 dark:border-white/10 shadow-sm hover:border-[#E89A5B] transition-all cursor-pointer"
          title="Toggle Dark/Light Mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-[#E89A5B]" /> : <Moon className="w-4 h-4 text-[#0B132B]" />}
        </button>
      </div>

      <div className="w-full max-w-5xl bg-white dark:bg-[#121B35] md:rounded-3xl shadow-[0_25px_70px_-15px_rgba(11,19,43,0.12)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)] border border-[#EBE8E1] dark:border-slate-800/80 overflow-hidden flex flex-col md:flex-row min-h-[640px] transition-all duration-300">
        
        {/* الجانب الأيسر - الهوية البصرية */}
        <div className="relative md:w-5/12 bg-[#0B132B] text-white p-8 md:p-12 flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85"
              alt="LUMA Interior"
              className="w-full h-full object-cover opacity-70 contrast-[1.1] brightness-[0.8]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-[#0B132B]/50 to-black/40" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-extrabold tracking-widest font-['Poppins',sans-serif] text-white drop-shadow-md">
                LUMA
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#E89A5B]/20 text-[#E89A5B] border border-[#E89A5B]/30 backdrop-blur-md">
                {t("admin.admin_login.brand_badge")}
              </span>
            </div>
            <div className="h-1 w-10 bg-[#E89A5B] mt-2.5 rounded-full shadow-sm"></div>
          </div>

          <div className="relative z-10 my-8 backdrop-blur-md bg-black/25 p-5 rounded-2xl border border-white/10 shadow-lg">
            <span className="text-[11px] font-bold tracking-widest text-[#E89A5B] uppercase block mb-1.5 drop-shadow-sm">
              {t("admin.admin_login.curated_commerce_tag")}
            </span>
            <p className="text-lg sm:text-xl font-light leading-relaxed font-['Poppins',sans-serif] text-white/95">
              {t("admin.admin_login.curated_commerce_desc")}
            </p>
          </div>

          <div className="relative z-10 backdrop-blur-md bg-white/10 border border-white/20 p-4 rounded-2xl flex items-center gap-3.5 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-[#E89A5B] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
              ★
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-wide">
                {t("admin.admin_login.control_deck_title")}
              </p>
              <p className="text-[12px] text-white/80">
                {t("admin.admin_login.control_deck_desc")}
              </p>
            </div>
          </div>
        </div>

        {/* الجانب الأيمن - نموذج الدخول */}
        <div className="md:w-7/12 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-white dark:bg-[#121B35] transition-colors duration-300">
          <div className="max-w-md w-full mx-auto">
            
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] dark:text-white tracking-tight font-['Poppins',sans-serif]">
                {t("admin.admin_login.signin_title")}
              </h2>
              <p className="text-sm text-[#7B8190] dark:text-slate-400 mt-2 leading-relaxed">
                {t("admin.admin_login.signin_subtitle")}
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-600 dark:text-rose-400 text-xs leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-[11px] font-bold uppercase tracking-wider text-[#1F2937] dark:text-slate-300 mb-1.5"
                >
                  {t("auth.email")}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@luma.com"
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white placeholder:text-slate-400 text-sm focus:border-[#0B132B] dark:focus:border-[#E89A5B] focus:ring-2 focus:ring-[#0B132B]/10 dark:focus:ring-[#E89A5B]/10 outline-none transition-all duration-200"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-[11px] font-bold uppercase tracking-wider text-[#1F2937] dark:text-slate-300 mb-1.5"
                >
                  {t("auth.password")}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pe-11 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white placeholder:text-slate-400 text-sm focus:border-[#0B132B] dark:focus:border-[#E89A5B] focus:ring-2 focus:ring-[#0B132B]/10 dark:focus:ring-[#E89A5B]/10 outline-none transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0B132B] dark:bg-[#E89A5B] dark:text-[#0B132B] hover:brightness-110 text-white py-3.5 px-5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 group mt-4 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t("admin.admin_login.authenticating")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("admin.admin_login.submit_button")}</span>
                    {isRtl ? (
                      <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
                    ) : (
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    )}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;