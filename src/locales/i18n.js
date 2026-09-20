import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import arTranslation from "./ar/translation.json";
import enTranslation from "./en/translation.json";

const resources = {
  ar: { translation: arTranslation },
  en: { translation: enTranslation },
};

const savedLang = localStorage.getItem("luma_lang") || "en";

const applyDirection = (lng) => {
  const normalized = lng?.startsWith("ar") ? "ar" : "en";
  document.documentElement.lang = normalized;
  document.documentElement.dir = normalized === "ar" ? "rtl" : "ltr";
  localStorage.setItem("luma_lang", normalized);
};

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

applyDirection(savedLang);

i18n.on("languageChanged", (lng) => {
  applyDirection(lng);
});

export default i18n;