import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  defaultShippingFee: 50,
  freeShippingThreshold: 1000,
  expressShippingFee: 90,
  estimatedDeliveryDays: 3,
  storeName: "LUMA Luxury Concept",
  supportEmail: "concierge@luma-store.com",
  supportPhone: "+201000000000",
  orderNotificationEmail: "orders@luma-store.com",
  currency: "EGP", // EGP | USD | SAR
  vatRate: 14,
  enableCOD: true,
  enableOnlinePayment: true,
  lowStockThreshold: 5,
  maintenanceMode: false,
  theme: "light", // light | dark
};

// أسعار صرف أساسية ثابتة وفورية بدون أي انتظار شبكة
const BASE_RATES = {
  EGP: 1,
  USD: 0.0205,
  SAR: 0.077,
};

// دالة أرقام مشرقية سريعة ومحسنة
const toArabicDigits = (val) => {
  if (val === null || val === undefined) return "";
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(val)
    .replace(/[0-9]/g, (d) => arabicDigits[+d])
    .replace(/,/g, "٬")
    .replace(/\./g, "٫");
};

export const SettingsProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");

  // قراءة الإعدادات الفورية المتزامنة مع التخزين المحلي
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem("luma_admin_settings");
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // مزامنة وتطبيق الثيم (الدارك مود) مباشرة على مستوى المستند (html) لتفادي أي وميض
  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = settings.theme || "light";
    
    if (currentTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("luma_theme", currentTheme);
  }, [settings.theme]);

  // دالة تبديل الثيم بشكل فوري ونظيف
  const toggleTheme = useCallback(() => {
    setSettings((prev) => {
      const newTheme = prev.theme === "dark" ? "light" : "dark";
      const updated = { ...prev, theme: newTheme };
      localStorage.setItem("luma_admin_settings", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // قراءة أسعار الصرف بدون تأخير
  const [exchangeRates, setExchangeRates] = useState(() => {
    try {
      const cached = localStorage.getItem("luma_exchange_rates");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return parsed.rates;
        }
      }
    } catch {
      // استخدام القيم الافتراضية عند الفشل
    }
    return BASE_RATES;
  });

  // تحديث صامت لأسعار الصرف في الخلفية بعد تحميل التطبيق بالكامل
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      fetch("https://open.er-api.com/v6/latest/EGP", { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.rates) {
            const live = {
              EGP: 1,
              USD: data.rates.USD || BASE_RATES.USD,
              SAR: data.rates.SAR || BASE_RATES.SAR,
            };
            setExchangeRates(live);
            localStorage.setItem("luma_exchange_rates", JSON.stringify({ rates: live, timestamp: Date.now() }));
          }
        })
        .catch(() => {});
    }, 1500);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  // دالة تحديث الإعدادات الشاملة
  const updateSettings = useCallback((newSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem("luma_admin_settings", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // تسمية العملة ديناميكياً حسب اللغة والوضع
  const currencyLabel = useMemo(() => {
    const code = settings.currency || "EGP";
    if (code === "SAR") return isRtl ? "ر.س" : "SAR";
    if (code === "USD") return isRtl ? "$" : "USD";
    return isRtl ? "ج.م" : "EGP";
  }, [settings.currency, isRtl]);

  // تنسيق الأسعار مع التحويل اللحظي للعملات ودعم الأرقام العربية
  const formatPrice = useCallback(
    (amount, isStoredInBaseEGP = false) => {
      let num = Number(amount);
      if (isNaN(num)) return isRtl ? toArabicDigits("0.00") : "0.00";

      if (isStoredInBaseEGP && settings.currency !== "EGP") {
        const rate = exchangeRates[settings.currency] || 1;
        num = num * rate;
      }

      const formatted = num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return isRtl ? toArabicDigits(formatted) : formatted;
    },
    [settings.currency, exchangeRates, isRtl]
  );

  // تنسيق الأرقام العامة
  const formatDigits = useCallback(
    (val) => {
      const num = Number(val);
      if (isNaN(num)) return isRtl ? toArabicDigits("0") : "0";
      const formatted = num.toLocaleString("en-US");
      return isRtl ? toArabicDigits(formatted) : formatted;
    },
    [isRtl]
  );

  // تجميع القيمة المزودة لمنع أي إعادة تصيير (Re-renders) غير مبررة
  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      currencyLabel,
      exchangeRates,
      formatPrice,
      formatDigits,
      theme: settings.theme || "light",
      toggleTheme,
    }),
    [settings, currencyLabel, exchangeRates, formatPrice, formatDigits, toggleTheme, updateSettings]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export default SettingsContext;