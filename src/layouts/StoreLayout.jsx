import React from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import StoreTopBar from "./components/StoreTopBar";
import StoreNavbar from "./components/StoreNavbar";
import StoreFooter from "./components/StoreFooter";

/**
 * StoreLayout - التخطيط الرئيسي لصفحات المتجر بمعايير التصميم العالمي
 */
export const StoreLayout = () => {
  const { i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");

  return (
    <div 
      className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B132B] text-[#0B132B] dark:text-slate-100 flex flex-col font-['Poppins',sans-serif] transition-colors duration-300 selection:bg-[#E89A5B]/20 selection:text-[#0B132B]" 
      dir={isRtl ? "rtl" : "ltr"}
    >
      <StoreTopBar />
      <StoreNavbar />
      
      <main className="flex-1">
        <Outlet />
      </main>

      <StoreFooter />
    </div>
  );
};

export default StoreLayout;