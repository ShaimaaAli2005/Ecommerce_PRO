import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ShieldCheck,
  UserCheck,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit3,
  Send,
} from "lucide-react";
import api from "../../../api/axiosInstance";
import { useSettings } from "../../../context/SettingsContext";

// مكوّن أفاتار فاخر يتعامل مع الرابط أو يرسم مونوغرام هندسي
const UserAvatar = ({ src, name = "", role = "customer", className = "w-20 h-20 rounded-3xl" }) => {
  const initial = (name || "U").trim().charAt(0).toUpperCase();
  const isAdmin = role === "admin";
  const [hasError, setHasError] = useState(false);

  if (src && !hasError && !src.includes("cloudinary.com/dvaos6oyh")) {
    return (
      <div className={`${className} overflow-hidden shrink-0 border border-black/5 dark:border-white/5 shadow-md bg-slate-100 dark:bg-slate-900`}>
        <img
          src={src}
          alt={name}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`${className} flex items-center justify-center font-black select-none border border-black/5 dark:border-white/5 shadow-md shrink-0 ${
        isAdmin
          ? "bg-gradient-to-br from-[#0B132B] to-[#1C2541] text-[#E89A5B]"
          : "bg-gradient-to-br from-[#0B132B]/10 via-[#E89A5B]/15 to-[#0B132B]/20 dark:from-white/5 dark:to-[#E89A5B]/20 text-[#0B132B] dark:text-white"
      }`}
    >
      <span className="font-['Poppins',sans-serif] text-2xl">{initial}</span>
    </div>
  );
};

export const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");
  const { formatDigits } = useSettings();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // حقول التعديل المباشر
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
  });

  const fetchUserDetail = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get(`/users/${id}`);
      const userData = res.data?.user || res.data?.data || res.data;
      setUser(userData);
      setFormData({
        username: userData?.username || "",
        phone: userData?.phone || "",
      });
    } catch (err) {
      console.error("Failed to load user detail:", err);
      setError(t("admin.users_page.no_users_desc"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchUserDetail();
  }, [fetchUserDetail]);

  // تحديث بيانات المستخدم عبر مسار PATCH
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setError(null);
      setSuccessMsg(null);

      await api.patch(`/users/${id}`, {
        username: formData.username.trim(),
        phone: formData.phone.trim(),
      });

      setSuccessMsg(t("admin.user_detail.profile_updated_success"));
      fetchUserDetail();
    } catch (err) {
      console.error("Failed to patch user profile:", err);
      setError(
        err.response?.data?.message || t("admin.edit_product.toast.error")
      );
    } finally {
      setUpdating(false);
    }
  };

  // حذف الحساب نهائياً
  const handleDeleteUser = async () => {
    try {
      setDeleting(true);
      await api.delete(`/users/${id}`);
      navigate("/admin/users");
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert(t("admin.products_management.toast.delete_error"));
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const isAdmin = user?.role === "admin";
  const addresses = Array.isArray(user?.addresses) ? user.addresses : [];

  if (loading) {
    return (
      <div className="rounded-[2.5rem] bg-white dark:bg-[#121B35] p-20 text-center border border-black/5 dark:border-white/5 animate-pulse space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-200 dark:bg-slate-800 mx-auto" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mx-auto" />
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="rounded-[2.5rem] bg-white dark:bg-[#121B35] p-16 text-center border border-black/5 dark:border-white/5 space-y-5">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-[#0B132B] dark:text-white">{error}</h3>
        <button
          onClick={() => navigate("/admin/users")}
          className="px-6 py-2.5 rounded-2xl bg-[#0B132B] text-white text-xs font-bold cursor-pointer hover:bg-[#E89A5B] transition-colors"
        >
          {t("admin.user_detail.back_to_directory")}
        </button>
      </div>
    );
  }

  return (
    <div
      className="space-y-8 pb-14 selection:bg-[#E89A5B]/20 selection:text-[#0B132B]"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* ─── Hero Executive Header ─── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0B132B] via-[#111A38] to-[#1C2541] p-8 text-white shadow-2xl border border-white/10">
        <div className="absolute -top-24 -end-24 w-96 h-96 bg-[#E89A5B]/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors mb-1"
            >
              {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>{t("admin.user_detail.back_to_directory")}</span>
            </Link>

            <div className="flex flex-wrap items-center gap-4">
              <UserAvatar
                src={user?.avatar}
                name={user?.username}
                role={user?.role}
                className="w-16 h-16 rounded-2xl"
              />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black font-['Poppins',sans-serif]">
                    {user?.username}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${
                      isAdmin
                        ? "bg-[#E89A5B]/20 text-[#E89A5B] border-[#E89A5B]/40"
                        : "bg-white/10 text-white/90 border-white/10"
                    }`}
                  >
                    {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    <span>{isAdmin ? t("admin.role_admin") : t("admin.users_page.tab_customers")}</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/70 mt-1 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 opacity-70" />
                  <span>{user?.email}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center shrink-0">
            {!isAdmin && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-5 py-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-all cursor-pointer text-xs font-bold flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t("admin.user_detail.delete_account_btn")}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-xs">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ─── Grid: Profile Data, Addresses & Edit Panel ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* العمود الرئيسي: البطاقة التعريفية وسجل العناوين */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* بيانات الحساب والتوثيق */}
          <div className="rounded-[2rem] bg-white dark:bg-[#121B35] p-8 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
            <h3 className="text-base font-bold text-[#0B132B] dark:text-white border-b border-black/5 dark:border-white/5 pb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#E89A5B]" />
              <span>{t("admin.user_detail.profile_spec_title")}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-black/5 dark:border-white/5 space-y-1">
                <span className="text-[11px] text-secondary-muted font-bold block">
                  {t("admin.user_detail.user_id_label")}
                </span>
                <span className="font-mono font-bold text-[#0B132B] dark:text-white block truncate">
                  {user?._id}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-black/5 dark:border-white/5 space-y-1">
                <span className="text-[11px] text-secondary-muted font-bold block">
                  {t("admin.user_detail.phone_label")}
                </span>
                <span className="font-['Poppins',sans-serif] font-bold text-[#0B132B] dark:text-white block">
                  {user?.phone || t("admin.user_detail.not_provided")}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-black/5 dark:border-white/5 space-y-1">
                <span className="text-[11px] text-secondary-muted font-bold block">
                  {t("admin.user_detail.verification_label")}
                </span>
                <span className="inline-flex items-center gap-1 font-bold">
                  {user?.isVerified ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">{t("admin.user_detail.verified_identity")}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-amber-600">{t("admin.user_detail.pending_verification")}</span>
                    </>
                  )}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-black/5 dark:border-white/5 space-y-1">
                <span className="text-[11px] text-secondary-muted font-bold block">
                  {t("admin.user_detail.member_since")}
                </span>
                <span className="font-['Poppins',sans-serif] text-secondary-muted block">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(
                        isRtl ? "ar-EG" : "en-US",
                        { year: "numeric", month: "long", day: "numeric" }
                      )
                    : t("admin.user_detail.unknown_date")}
                </span>
              </div>
            </div>
          </div>

          {/* دفتر العناوين المسجلة Addresses */}
          <div className="rounded-[2rem] bg-white dark:bg-[#121B35] p-8 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
              <h3 className="text-base font-bold text-[#0B132B] dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#E89A5B]" />
                <span>{t("admin.user_detail.addresses_book_title")}</span>
              </h3>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E89A5B]/15 text-[#E89A5B] font-['Poppins',sans-serif]">
                {formatDigits(addresses.length)}
              </span>
            </div>

            {addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#FAFAFA] dark:bg-slate-900/60 border border-black/5 dark:border-white/5 space-y-2 relative"
                  >
                    {addr.defaultAddress && (
                      <span className="absolute top-4 end-4 px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-[#0B132B] text-white dark:bg-[#E89A5B] dark:text-[#0B132B]">
                        {t("admin.user_detail.default_address_badge")}
                      </span>
                    )}
                    <h4 className="font-bold text-xs text-[#0B132B] dark:text-white flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#E89A5B]" />
                      <span>
                        {addr.city || "Cairo"}, {addr.country || "Egypt"}
                      </span>
                    </h4>
                    <p className="text-xs text-secondary-muted leading-relaxed">
                      {addr.street || ""}{addr.building ? `, ${addr.building}` : ""}
                    </p>
                    {addr.postalCode && (
                      <span className="inline-block text-[11px] font-mono text-secondary-muted font-['Poppins',sans-serif]">
                        {t("admin.user_detail.postal_code_label")} {addr.postalCode}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-secondary-muted text-center py-8">
                {t("admin.user_detail.no_addresses")}
              </p>
            )}
          </div>
        </div>

        {/* لوحة التحكم الجانبية: نموذج التعديل السريع */}
        <div className="space-y-6">
          <div className="rounded-[2rem] bg-white dark:bg-[#121B35] p-6 border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5">
            <h3 className="text-base font-bold text-[#0B132B] dark:text-white border-b border-black/5 dark:border-white/5 pb-3 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-[#E89A5B]" />
              <span>{t("admin.user_detail.update_profile_title")}</span>
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary-muted mb-1.5">
                  {t("admin.user_detail.username_label")}
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white font-bold outline-none focus:border-[#E89A5B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary-muted mb-1.5">
                  {t("admin.user_detail.phone_input_label")}
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+201XXXXXXXXX"
                  className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white font-['Poppins',sans-serif] outline-none focus:border-[#E89A5B]"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0B132B] hover:bg-[#E89A5B] text-white text-xs font-black tracking-wide uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {updating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{t("admin.user_detail.apply_updates_btn")}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* ─── Modal تأكيد الحذف ─── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#121B35] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-[#0B132B] dark:text-white">
                {t("admin.user_detail.delete_modal_title")}
              </h3>
              <p className="text-xs text-secondary-muted leading-relaxed">
                {t("admin.user_detail.delete_modal_desc", {
                  name: user?.username || "",
                })}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold text-secondary-muted hover:text-[#0B132B] dark:hover:text-white transition-colors cursor-pointer"
              >
                {t("admin.users_page.cancel_delete")}
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{t("admin.user_detail.confirm_delete_btn")}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserDetail;