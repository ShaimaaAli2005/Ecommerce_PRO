import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Settings,
  Truck,
  CreditCard,
  Store,
  ShieldCheck,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import api from "../../../api/axiosInstance";
import { useSettings } from "../../../context/SettingsContext";

export const AdminSettingsPage = () => {
  const {
    settings: globalSettings,
    updateSettings,
    formatDigits,
    exchangeRates,
  } = useSettings();

  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");

  const [activeTab, setActiveTab] = useState("shipping"); // 'shipping' | 'payments' | 'store' | 'security'
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // إعدادات المتجر المحلية
  const [settings, setSettings] = useState(globalSettings);

  // مزامنة الحالة المحلية مع الحالة العامة
  useEffect(() => {
    if (globalSettings) {
      setSettings(globalSettings);
    }
  }, [globalSettings]);

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  // عند تغيير العملة من القائمة المنسدلة، نقوم بتحويل قيم الشحن الظاهرة في الخانات فورياً لتناسب العملة الجديدة
  const handleCurrencyChange = (newCurrency) => {
    const oldCurrency = settings.currency || "EGP";
    if (newCurrency === oldCurrency) return;

    const oldRate = exchangeRates[oldCurrency] || 1;
    const newRate = exchangeRates[newCurrency] || 1;
    const factor = newRate / oldRate;

    setSettings((prev) => ({
      ...prev,
      currency: newCurrency,
      defaultShippingFee: Number((prev.defaultShippingFee * factor).toFixed(2)),
      freeShippingThreshold: Number((prev.freeShippingThreshold * factor).toFixed(2)),
      expressShippingFee: Number((prev.expressShippingFee * factor).toFixed(2)),
    }));
    setSaveSuccess(false);
  };

  // حفظ التعديلات ونشرها فوراً على مستوى المتجر والـ API
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSaveSuccess(false);
    setSaving(true);

    try {
      updateSettings(settings);

      try {
        await api.put("/settings", settings);
      } catch (apiErr) {
        console.info("Settings cached locally via Context (backend sync optional).");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setErrorMessage(t("admin.settings_page.save_error"));
    } finally {
      setSaving(false);
    }
  };

  const currentCurrencySymbol =
    settings.currency === "SAR"
      ? t("admin.currency.sar")
      : settings.currency === "USD"
      ? t("admin.currency.usd")
      : t("admin.currency.egp");

  return (
    <div className="space-y-6 pb-16" dir={isRtl ? "rtl" : "ltr"}>
      {/* ─── Hero Header الرأسي الموحد ─── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0B132B] via-[#111A38] to-[#1C2541] p-8 sm:p-10 text-white shadow-2xl border border-white/10">
        <div className="absolute -top-24 -end-24 w-96 h-96 bg-[#E89A5B]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -start-24 w-80 h-80 bg-sky-500/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-[#E89A5B]/20 text-[#E89A5B] border border-[#E89A5B]/30 flex items-center gap-2 backdrop-blur-md">
                <Settings className="w-3.5 h-3.5" />
                <span>{t("admin.settings_page.badge")}</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white/90 border border-white/10">
                {t("admin.settings_page.default_currency")}: <span className="text-[#E89A5B] font-black">{currentCurrencySymbol}</span>
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-['Poppins',sans-serif]">
              {t("admin.settings_page.title")}
            </h1>
            <p className="text-sm sm:text-base text-white/70 max-w-2xl font-normal leading-relaxed">
              {t("admin.settings_page.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center shrink-0">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-6 py-3.5 rounded-2xl bg-[#E89A5B] hover:bg-[#d88746] text-[#0B132B] font-bold text-xs transition-all shadow-lg hover:shadow-[#E89A5B]/20 flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{t("admin.settings_page.save_btn")}</span>
            </button>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{t("admin.settings_page.save_success")}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ─── تبويبات الإعدادات ─── */}
      <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2 overflow-x-auto">
        {[
          { id: "shipping", label: t("admin.settings_page.tab_shipping"), icon: Truck },
          { id: "payments", label: t("admin.settings_page.tab_payments"), icon: CreditCard },
          { id: "store", label: t("admin.settings_page.tab_store"), icon: Store },
          { id: "security", label: t("admin.settings_page.tab_security"), icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#0B132B] text-white dark:bg-[#E89A5B] dark:text-[#0B132B] shadow-md"
                  : "bg-white dark:bg-[#121B35] text-secondary-muted hover:text-[#0B132B] dark:hover:text-white border border-black/5 dark:border-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── محتوى التبويبات ─── */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* 1. الشحن والتوصيل */}
        {activeTab === "shipping" && (
          <div className="rounded-[2.2rem] bg-white dark:bg-[#121B35] p-7 border border-black/5 dark:border-white/5 shadow-sm space-y-6">
            <div className="border-b border-black/5 dark:border-white/5 pb-4">
              <h3 className="text-base font-bold text-[#0B132B] dark:text-white flex items-center gap-2 font-['Poppins',sans-serif]">
                <Truck className="w-5 h-5 text-[#E89A5B]" />
                <span>{t("admin.settings_page.shipping_title")}</span>
              </h3>
              <p className="text-xs text-secondary-muted mt-0.5">
                {t("admin.settings_page.shipping_desc")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* الشحن القياسي */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#0B132B] dark:text-white block">
                  {t("admin.settings_page.standard_shipping_fee")} ({currentCurrencySymbol})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={settings.defaultShippingFee}
                    onChange={(e) => handleChange("defaultShippingFee", Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-2xl bg-[#FAFAFA] dark:bg-slate-900/60 border border-black/5 dark:border-white/10 text-xs sm:text-sm font-bold text-[#0B132B] dark:text-white outline-none focus:border-[#E89A5B] font-['Poppins',sans-serif]"
                  />
                  <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs text-[#E89A5B] font-black">
                    {currentCurrencySymbol}
                  </span>
                </div>
              </div>

              {/* الحد الأدنى للشحن المجاني */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#0B132B] dark:text-white block">
                  {t("admin.settings_page.free_shipping_threshold")} ({currentCurrencySymbol})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={settings.freeShippingThreshold}
                    onChange={(e) => handleChange("freeShippingThreshold", Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-2xl bg-[#FAFAFA] dark:bg-slate-900/60 border border-black/5 dark:border-white/10 text-xs sm:text-sm font-bold text-[#0B132B] dark:text-white outline-none focus:border-[#E89A5B] font-['Poppins',sans-serif]"
                  />
                  <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs text-[#E89A5B] font-black">
                    {currentCurrencySymbol}
                  </span>
                </div>
                <p className="text-[11px] text-secondary-muted">
                  {t("admin.settings_page.free_shipping_hint")}
                </p>
              </div>

              {/* الشحن السريع */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#0B132B] dark:text-white block">
                  {t("admin.settings_page.express_shipping_fee")} ({currentCurrencySymbol})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={settings.expressShippingFee}
                    onChange={(e) => handleChange("expressShippingFee", Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-2xl bg-[#FAFAFA] dark:bg-slate-900/60 border border-black/5 dark:border-white/10 text-xs sm:text-sm font-bold text-[#0B132B] dark:text-white outline-none focus:border-[#E89A5B] font-['Poppins',sans-serif]"
                  />
                  <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs text-[#E89A5B] font-black">
                    {currentCurrencySymbol}
                  </span>
                </div>
              </div>

              {/* مدة التوصيل */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#0B132B] dark:text-white block">
                  {t("admin.settings_page.estimated_delivery_days")}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={settings.estimatedDeliveryDays}
                    onChange={(e) => handleChange("estimatedDeliveryDays", Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-2xl bg-[#FAFAFA] dark:bg-slate-900/60 border border-black/5 dark:border-white/10 text-xs sm:text-sm font-bold text-[#0B132B] dark:text-white outline-none focus:border-[#E89A5B] font-['Poppins',sans-serif]"
                  />
                  <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs text-secondary-muted font-bold">
                    {t("admin.settings_page.business_days")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. المالية والدفع والضرائب */}
        {activeTab === "payments" && (
          <div className="rounded-[2.2rem] bg-white dark:bg-[#121B35] p-7 border border-black/5 dark:border-white/5 shadow-sm space-y-6">
            <div className="border-b border-black/5 dark:border-white/5 pb-4">
              <h3 className="text-base font-bold text-[#0B132B] dark:text-white flex items-center gap-2 font-['Poppins',sans-serif]">
                <CreditCard className="w-5 h-5 text-[#E89A5B]" />
                <span>{t("admin.settings_page.finance_title")}</span>
              </h3>
              <p className="text-xs text-secondary-muted mt-0.5">
                {t("admin.settings_page.finance_desc")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* العملة النشطة */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#0B132B] dark:text-white block">
                  {t("admin.settings_page.default_currency")}
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAFAFA] dark:bg-slate-900/60 border border-black/5 dark:border-white/10 text-xs sm:text-sm font-bold text-[#0B132B] dark:text-white outline-none cursor-pointer"
                >
                  <option value="EGP">{t("admin.settings_page.currency_egp_label")}</option>
                  <option value="USD">{t("admin.settings_page.currency_usd_label")}</option>
                  <option value="SAR">{t("admin.settings_page.currency_sar_label")}</option>
                </select>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium font-['Poppins',sans-serif]">
                  1 EGP = {exchangeRates[settings.currency || "EGP"] || 1} {settings.currency}
                </p>
              </div>

              {/* ضريبة القيمة المضافة */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#0B132B] dark:text-white block">
                  {t("admin.settings_page.vat_rate")}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={settings.vatRate}
                    onChange={(e) => handleChange("vatRate", Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-2xl bg-[#FAFAFA] dark:bg-slate-900/60 border border-black/5 dark:border-white/10 text-xs sm:text-sm font-bold text-[#0B132B] dark:text-white outline-none focus:border-[#E89A5B] font-['Poppins',sans-serif]"
                  />
                  <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs text-secondary-muted font-bold">
                    %
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5 dark:border-white/5 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                <div>
                  <h4 className="font-bold text-xs text-[#0B132B] dark:text-white">
                    {t("admin.settings_page.enable_cod")}
                  </h4>
                  <p className="text-[11px] text-secondary-muted">
                    {t("admin.settings_page.enable_cod_desc")}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableCOD}
                  onChange={(e) => handleChange("enableCOD", e.target.checked)}
                  className="w-5 h-5 accent-[#0B132B] dark:accent-[#E89A5B] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                <div>
                  <h4 className="font-bold text-xs text-[#0B132B] dark:text-white">
                    {t("admin.settings_page.enable_cards")}
                  </h4>
                  <p className="text-[11px] text-secondary-muted">
                    {t("admin.settings_page.enable_cards_desc")}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableOnlinePayment}
                  onChange={(e) => handleChange("enableOnlinePayment", e.target.checked)}
                  className="w-5 h-5 accent-[#0B132B] dark:accent-[#E89A5B] cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. بيانات وهوية المتجر والتواصل */}
        {activeTab === "store" && (
          <div className="rounded-[2.2rem] bg-white dark:bg-[#121B35] p-7 border border-black/5 dark:border-white/5 shadow-sm space-y-6">
            <div className="border-b border-black/5 dark:border-white/5 pb-4">
              <h3 className="text-base font-bold text-[#0B132B] dark:text-white flex items-center gap-2 font-['Poppins',sans-serif]">
                <Store className="w-5 h-5 text-[#E89A5B]" />
                <span>{t("admin.settings_page.store_profile_title")}</span>
              </h3>
              <p className="text-xs text-secondary-muted mt-0.5">
                {t("admin.settings_page.store_profile_desc")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#0B132B] dark:text-white block">
                  {t("admin.settings_page.store_name")}
                </label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => handleChange("storeName", e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAFAFA] dark:bg-slate-900/60 border border-black/5 dark:border-white/10 text-xs sm:text-sm font-bold text-[#0B132B] dark:text-white outline-none focus:border-[#E89A5B]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#0B132B] dark:text-white block">
                  {t("admin.settings_page.support_email")}
                </label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleChange("supportEmail", e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAFAFA] dark:bg-slate-900/60 border border-black/5 dark:border-white/10 text-xs sm:text-sm font-bold text-[#0B132B] dark:text-white outline-none focus:border-[#E89A5B] font-['Poppins',sans-serif]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#0B132B] dark:text-white block">
                  {t("admin.settings_page.support_phone")}
                </label>
                <input
                  type="text"
                  value={settings.supportPhone}
                  onChange={(e) => handleChange("supportPhone", e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAFAFA] dark:bg-slate-900/60 border border-black/5 dark:border-white/10 text-xs sm:text-sm font-bold text-[#0B132B] dark:text-white outline-none focus:border-[#E89A5B] font-['Poppins',sans-serif]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#0B132B] dark:text-white block">
                  {t("admin.settings_page.orders_email")}
                </label>
                <input
                  type="email"
                  value={settings.orderNotificationEmail}
                  onChange={(e) => handleChange("orderNotificationEmail", e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAFAFA] dark:bg-slate-900/60 border border-black/5 dark:border-white/10 text-xs sm:text-sm font-bold text-[#0B132B] dark:text-white outline-none focus:border-[#E89A5B] font-['Poppins',sans-serif]"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. الأمان وإدارة المخزون */}
        {activeTab === "security" && (
          <div className="rounded-[2.2rem] bg-white dark:bg-[#121B35] p-7 border border-black/5 dark:border-white/5 shadow-sm space-y-6">
            <div className="border-b border-black/5 dark:border-white/5 pb-4">
              <h3 className="text-base font-bold text-[#0B132B] dark:text-white flex items-center gap-2 font-['Poppins',sans-serif]">
                <ShieldCheck className="w-5 h-5 text-[#E89A5B]" />
                <span>{t("admin.settings_page.security_title")}</span>
              </h3>
              <p className="text-xs text-secondary-muted mt-0.5">
                {t("admin.settings_page.security_desc")}
              </p>
            </div>

            <div className="space-y-4">
              <div className="max-w-md space-y-2">
                <label className="text-xs font-bold text-[#0B132B] dark:text-white block">
                  {t("admin.settings_page.low_stock_threshold")}
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.lowStockThreshold}
                  onChange={(e) => handleChange("lowStockThreshold", Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAFAFA] dark:bg-slate-900/60 border border-black/5 dark:border-white/10 text-xs sm:text-sm font-bold text-[#0B132B] dark:text-white outline-none focus:border-[#E89A5B] font-['Poppins',sans-serif]"
                />
                <p className="text-[11px] text-secondary-muted">
                  {t("admin.settings_page.low_stock_hint")}
                </p>
              </div>

              <div className="pt-4 border-t border-black/5 dark:border-white/5">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <div>
                    <h4 className="font-bold text-xs text-amber-700 dark:text-amber-400">
                      {t("admin.settings_page.maintenance_mode")}
                    </h4>
                    <p className="text-[11px] text-secondary-muted">
                      {t("admin.settings_page.maintenance_mode_desc")}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
                    className="w-5 h-5 accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* زر الحفظ السفلي */}
        <div className="flex items-center justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-2xl bg-[#0B132B] hover:bg-[#E89A5B] text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{t("admin.settings_page.save_btn")}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsPage;