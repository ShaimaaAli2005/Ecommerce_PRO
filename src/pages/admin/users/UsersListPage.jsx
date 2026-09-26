import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Users,
  Search,
  RefreshCw,
  Eye,
  ShieldCheck,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ArrowUpRight,
  Trash2,
  CheckCircle,
  MapPin,
  ArrowRightLeft,
} from "lucide-react";
import api from "../../../api/axiosInstance";
import { userService } from "../../../services/userService";
import { useSettings } from "../../../context/SettingsContext";

const UserAvatar = ({ src, name = "", role = "customer", className = "w-11 h-11 rounded-2xl" }) => {
  const initial = (name || "U").trim().charAt(0).toUpperCase();
  const isAdmin = role === "admin";
  const [hasError, setHasError] = useState(false);

  if (src && !hasError && !src.includes("cloudinary.com/dvaos6oyh")) {
    return (
      <div className={`${className} overflow-hidden shrink-0 border border-black/5 dark:border-white/5 shadow-xs bg-slate-100 dark:bg-slate-900`}>
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
      className={`${className} flex items-center justify-center font-black select-none border border-black/5 dark:border-white/5 shadow-xs shrink-0 ${
        isAdmin
          ? "bg-gradient-to-br from-[#0B132B] to-[#1C2541] text-[#E89A5B]"
          : "bg-gradient-to-br from-[#0B132B]/10 via-[#E89A5B]/15 to-[#0B132B]/20 dark:from-white/5 dark:to-[#E89A5B]/20 text-[#0B132B] dark:text-white"
      }`}
    >
      <span className="font-['Poppins',sans-serif] text-sm">{initial}</span>
    </div>
  );
};

export const UsersListPage = () => {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");
  const { formatDigits } = useSettings();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [deleteModalUser, setDeleteModalUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchUsers = useCallback(async () => {
    try {
      setError(null);
      const res = await userService.getAllUsers();
      const list = res?.users || res?.data || (Array.isArray(res) ? res : []);
      setUsers(list);
    } catch (err) {
      console.error("Failed to load users directory:", err);
      setError(t("admin.users_page.no_users_desc", "تعذر جلب دليل المستخدمين"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  // تبديل الرتبة السريع من الجدول مباشرة
  const handleQuickRoleToggle = async (user) => {
    const nextRole = user.role === "admin" ? "customer" : "admin";
    const confirmMsg = isRtl
      ? `هل تريد تغيير رتبة "${user.username}" إلى ${nextRole === "admin" ? "مشرف" : "عميل"}؟`
      : `Change role of "${user.username}" to ${nextRole}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoadingId(user._id);
      await userService.changeRole(user._id, nextRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, role: nextRole } : u))
      );
    } catch (err) {
      alert(err?.response?.data?.message || (isRtl ? "فشل تعديل الصلاحية" : "Failed to change role"));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalUser) return;
    try {
      setDeleting(true);
      await userService.deleteUser(deleteModalUser._id);
      setUsers((prev) => prev.filter((u) => u._id !== deleteModalUser._id));
      setDeleteModalUser(null);
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert(err?.response?.data?.message || t("admin.products_management.toast.delete_error", "فشل حذف الحساب"));
    } finally {
      setDeleting(false);
    }
  };

  const stats = useMemo(() => {
    const adminCount = users.filter((u) => u.role === "admin").length;
    const customerCount = users.filter((u) => u.role !== "admin").length;
    const verifiedCount = users.filter((u) => u.isVerified === true).length;

    return {
      total: users.length,
      admins: adminCount,
      customers: customerCount,
      verified: verifiedCount,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const username = (user.username || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      const phone = (user.phone || "").toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !query || username.includes(query) || email.includes(query) || phone.includes(query);

      let matchesRole = true;
      if (roleFilter === "admin") matchesRole = user.role === "admin";
      if (roleFilter === "customer") matchesRole = user.role !== "admin";

      let matchesVerified = true;
      if (verifiedFilter === "verified") matchesVerified = user.isVerified === true;
      if (verifiedFilter === "unverified") matchesVerified = user.isVerified !== true;

      return matchesSearch && matchesRole && matchesVerified;
    });
  }, [users, searchQuery, roleFilter, verifiedFilter]);

  const totalPages = Math.max(Math.ceil(filteredUsers.length / itemsPerPage), 1);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  return (
    <div className="space-y-8 pb-12 selection:bg-[#E89A5B]/20 selection:text-[#0B132B]" dir={isRtl ? "rtl" : "ltr"}>
      {/* ─── Hero Executive Header ─── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0B132B] via-[#111A38] to-[#1C2541] p-8 sm:p-10 text-white shadow-2xl border border-white/10">
        <div className="absolute -top-24 -end-24 w-96 h-96 bg-[#E89A5B]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -start-24 w-80 h-80 bg-sky-500/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-[#E89A5B]/20 text-[#E89A5B] border border-[#E89A5B]/30 flex items-center gap-2 backdrop-blur-md">
                <Users className="w-3.5 h-3.5" />
                <span>{t("admin.users_page.badge", "دليل المستخدمين")}</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white/90 border border-white/10">
                <span className="font-['Poppins',sans-serif]">{formatDigits(stats.total)}</span> {t("admin.users_page.verified_count_label", "حساب")}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-['Poppins',sans-serif]">
              {t("admin.users_page.title", "إدارة المستخدمين والأدوار")}
            </h1>
            <p className="text-sm sm:text-base text-white/70 max-w-2xl font-normal leading-relaxed">
              {t("admin.users_page.subtitle", "متابعة بيانات العملاء والمشرفين، والتحكم في الصلاحيات والعناوين المسجلة")}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center shrink-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all backdrop-blur-md cursor-pointer shadow-lg active:scale-95"
              title={t("common.retry", "تحديث")}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#E89A5B]" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ─── Directory Telemetry Bento Strip ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-3xl bg-white dark:bg-[#121B35] p-6 border border-black/5 dark:border-white/5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("admin.users_page.total_accounts", "إجمالي الحسابات")}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#0B132B]/5 dark:bg-white/5 text-[#0B132B] dark:text-white flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#0B132B] dark:text-white tracking-tight font-['Poppins',sans-serif]">
            {formatDigits(stats.total)}
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#121B35] p-6 border border-black/5 dark:border-white/5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("admin.users_page.shoppers_base", "قاعدة العملاء")}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#E89A5B]/15 text-[#E89A5B] flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#0B132B] dark:text-[#E89A5B] tracking-tight font-['Poppins',sans-serif]">
            {formatDigits(stats.customers)}
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#121B35] p-6 border border-black/5 dark:border-white/5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("admin.users_page.admin_team", "فريق الإدارة")}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#0B132B] dark:text-white tracking-tight font-['Poppins',sans-serif]">
            {formatDigits(stats.admins)}
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#121B35] p-6 border border-black/5 dark:border-white/5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("admin.users_page.verified_identity", "هويات موثقة")}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-['Poppins',sans-serif]">
            {formatDigits(stats.verified)}
          </p>
        </div>
      </div>

      {/* ─── Control Bar ─── */}
      <div className="rounded-3xl bg-white dark:bg-[#121B35] p-5 border border-black/5 dark:border-white/5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t("admin.users_page.search_placeholder", "البحث باسم المستخدم، البريد، أو الهاتف...")}
              className="w-full ps-11 pe-4 py-2.5 text-sm rounded-2xl border border-black/5 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-900/60 text-[#0B132B] dark:text-white outline-none focus:ring-2 focus:ring-[#0B132B] dark:focus:ring-[#E89A5B]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: t("admin.users_page.tab_all", "الكل"), count: stats.total },
              { id: "customer", label: t("admin.users_page.tab_customers", "العملاء"), count: stats.customers },
              { id: "admin", label: t("admin.users_page.tab_admins", "المشرفين"), count: stats.admins },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setRoleFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  roleFilter === tab.id
                    ? "bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] shadow-md"
                    : "bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-[#0B132B] dark:hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-75 font-['Poppins',sans-serif]">({formatDigits(tab.count)})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Users Data Table ─── */}
      {loading ? (
        <div className="rounded-3xl bg-white dark:bg-[#121B35] p-16 text-center border border-black/5 dark:border-white/5 animate-pulse space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 mx-auto" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mx-auto" />
        </div>
      ) : paginatedUsers.length > 0 ? (
        <div className="rounded-[2rem] bg-white dark:bg-[#121B35] border border-black/5 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-[#FAFAFA] dark:bg-slate-900/40 text-[10px] uppercase font-bold text-slate-400 border-b border-black/5 dark:border-white/5">
                <tr>
                  <th className="px-6 py-4 text-start">{t("admin.users_page.th_user", "المستخدم")}</th>
                  <th className="px-6 py-4 text-start">{t("admin.users_page.th_contact", "بيانات الاتصال")}</th>
                  <th className="px-6 py-4 text-start">{t("admin.users_page.th_access", "الصلاحية والرتبة")}</th>
                  <th className="px-6 py-4 text-start">{t("admin.users_page.th_verification", "التوثيق")}</th>
                  <th className="px-6 py-4 text-start">{t("admin.users_page.th_addresses", "العناوين")}</th>
                  <th className="px-6 py-4 text-start">{t("admin.users_page.th_registered_at", "تاريخ الانضمام")}</th>
                  <th className="px-6 py-4 text-end">{t("admin.users_page.th_actions", "الإجراءات")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {paginatedUsers.map((user) => {
                  const displayName = user.username || user.name || t("common.guest_client", "مستخدم");
                  const isAdmin = user.role === "admin";
                  const addressesCount = Array.isArray(user.addresses) ? user.addresses.length : 0;
                  const dateStr = user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(isRtl ? "ar-EG" : "en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "-";

                  return (
                    <tr key={user._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <UserAvatar src={user.avatar} name={displayName} role={user.role} />
                          <div className="min-w-0">
                            <span className="font-bold text-sm text-[#0B132B] dark:text-white truncate block">
                              {displayName}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 mt-0.5 block">
                              #{user._id?.slice(-8).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-semibold text-xs text-[#0B132B] dark:text-white flex items-center gap-1.5 truncate">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{user.email || t("admin.users_page.no_email", "لا يوجد بريد")}</span>
                        </p>
                        {user.phone && (
                          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1 font-['Poppins',sans-serif]">
                            <Phone className="w-3 h-3 opacity-60 shrink-0" />
                            <span>{user.phone}</span>
                          </p>
                        )}
                      </td>

                      {/* الصلاحية كزر تبديل فوري */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          disabled={actionLoadingId === user._id}
                          onClick={() => handleQuickRoleToggle(user)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs ${
                            isAdmin
                              ? "bg-[#0B132B] text-white dark:bg-[#E89A5B] dark:text-[#0B132B] border-transparent"
                              : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 border-black/5 dark:border-white/5"
                          }`}
                          title={isRtl ? "انقر للتبديل بين عميل ومشرف" : "Click to toggle role"}
                        >
                          {actionLoadingId === user._id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : isAdmin ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-[#E89A5B] dark:text-[#0B132B]" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span>
                            {isAdmin ? t("admin.role_admin", "مدير النظام") : t("admin.users_page.tab_customers", "عميل")}
                          </span>
                          <ArrowRightLeft className="w-3 h-3 opacity-50 ms-1" />
                        </button>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            user.isVerified
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {user.isVerified ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-500" />
                              <span>{t("admin.users_page.verified", "موثق")}</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 text-amber-500" />
                              <span>{t("admin.users_page.unverified", "غير موثق")}</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-400 flex items-center gap-1 font-['Poppins',sans-serif]">
                          <MapPin className="w-3.5 h-3.5 text-[#E89A5B]" />
                          <span>{formatDigits(addressesCount)} {t("admin.users_page.addresses_count", "عناوين")}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-400 flex items-center gap-1 font-['Poppins',sans-serif]">
                          <Calendar className="w-3.5 h-3.5 opacity-60" />
                          <span>{dateStr}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 text-end">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/admin/users/${user._id}`}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#0B132B] hover:text-white dark:hover:bg-[#E89A5B] dark:hover:text-[#0B132B] text-slate-400 transition-all inline-block shadow-xs"
                            title={t("admin.users_page.inspect_tooltip", "عرض الملف والتحكم")}
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </Link>

                          {!isAdmin && (
                            <button
                              onClick={() => setDeleteModalUser(user)}
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-400 transition-all inline-block shadow-xs cursor-pointer"
                              title={t("admin.users_page.delete_tooltip", "حذف المستخدم")}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-[2.5rem] bg-white dark:bg-[#121B35] p-16 text-center border border-black/5 dark:border-white/5 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#0B132B] dark:text-white">
            {t("admin.users_page.no_users", "لم يتم العثور على أي حسابات")}
          </h3>
        </div>
      )}

      {/* ─── Pagination Footer ─── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-black/5 dark:border-white/5">
          <span className="text-xs font-medium text-slate-400">
            {t("common.page", "صفحة")} {formatDigits(currentPage)} {t("common.of", "من")} {formatDigits(totalPages)}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage <= 1}
              className="p-2.5 rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#121B35] disabled:opacity-30 hover:border-[#E89A5B] text-[#0B132B] dark:text-white transition-all cursor-pointer"
            >
              {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <span className="px-3 text-xs font-bold font-['Poppins',sans-serif]">
              {formatDigits(currentPage)} / {formatDigits(totalPages)}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-2.5 rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#121B35] disabled:opacity-30 hover:border-[#E89A5B] text-[#0B132B] dark:text-white transition-all cursor-pointer"
            >
              {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* ─── Modal تأكيد الحذف ─── */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#121B35] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-[#0B132B] dark:text-white">
                {t("admin.users_page.delete_modal_title", "تأكيد حذف الحساب")}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isRtl
                  ? `هل تريد بالتأكيد حذف حساب المستخدم "${deleteModalUser.username || deleteModalUser.name}" نهائياً من قاعدة البيانات؟`
                  : `Are you sure you want to permanently delete "${deleteModalUser.username || deleteModalUser.name}"?`}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalUser(null)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold text-slate-400 hover:text-[#0B132B] dark:hover:text-white transition-colors cursor-pointer"
              >
                {t("admin.users_page.cancel_delete", "إلغاء")}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{t("admin.users_page.confirm_delete", "تأكيد الحذف")}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersListPage;