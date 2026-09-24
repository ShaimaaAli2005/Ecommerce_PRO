import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  defaultShippingFee: 15,
  freeShippingThreshold: 200,
  expressShippingFee: 30,
  estimatedDeliveryDays: 3,
  storeName: "LUMA Luxury Concept",
  supportEmail: "concierge@luma-store.com",
  supportPhone: "+201000000000",
  orderNotificationEmail: "orders@luma-store.com",
  currency: "USD", // USD | SAR | EGP
  vatRate: 14,
  enableCOD: true,
  enableOnlinePayment: true,
  lowStockThreshold: 5,
  maintenanceMode: false,
};

// أسعار صرف أساسية ثابتة وفورية تعتمد الدولار USD كعملة أساس للمتجر
const BASE_RATES = {
  USD: 1,
  SAR: 3.75,
  EGP: 48.5,
};

// دالة تحويل اختيارية للأرقام العربية
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

  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem("luma_admin_settings");
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

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
      // تجاهل أخطاء التخزين
    }
    return BASE_RATES;
  });

  // جلب أسعار الصرف الحية في الخلفية دون تعطيل التشغيل
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      fetch("https://open.er-api.com/v6/latest/USD", { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.rates) {
            const live = {
              USD: 1,
              SAR: data.rates.SAR || BASE_RATES.SAR,
              EGP: data.rates.EGP || BASE_RATES.EGP,
            };
            setExchangeRates(live);
            localStorage.setItem("luma_exchange_rates", JSON.stringify({ rates: live, timestamp: Date.now() }));
          }
        })
        .catch(() => {});
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const updateSettings = useCallback((newSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem("luma_admin_settings", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // رمز وعلامة العملة المحددة
  const currencyLabel = useMemo(() => {
    const code = settings.currency || "USD";
    if (code === "SAR") return isRtl ? "ر.س" : "SAR";
    if (code === "EGP") return isRtl ? "ج.م" : "EGP";
    return isRtl ? "$" : "USD";
  }, [settings.currency, isRtl]);

  // تنسيق الأسعار مع دعم تحويل العملات الآمن بناءً على عملة الـ Backend (USD)
  const formatPrice = useCallback(
    (amount, convertCurrency = false, useIndicDigits = false) => {
      let num = Number(amount);
      if (isNaN(num)) return useIndicDigits && isRtl ? toArabicDigits("0.00") : "0.00";

      if (convertCurrency && settings.currency !== "USD") {
        const rate = exchangeRates[settings.currency] || 1;
        num = num * rate;
      }

      const formatted = num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return useIndicDigits && isRtl ? toArabicDigits(formatted) : formatted;
    },
    [settings.currency, exchangeRates, isRtl]
  );

  const formatDigits = useCallback(
    (val, useIndicDigits = false) => {
      const num = Number(val);
      if (isNaN(num)) return useIndicDigits && isRtl ? toArabicDigits("0") : "0";
      const formatted = num.toLocaleString("en-US");
      return useIndicDigits && isRtl ? toArabicDigits(formatted) : formatted;
    },
    [isRtl]
  );

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      currencyLabel,
      exchangeRates,
      formatPrice,
      formatDigits,
    }),
    [settings, currencyLabel, exchangeRates, formatPrice, formatDigits, updateSettings]
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