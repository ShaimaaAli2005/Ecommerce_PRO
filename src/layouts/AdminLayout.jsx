import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

// ✅ المسار النسبي الصحيح والمباشر من داخل مجلد layouts
import SidebarComponent, { Sidebar as NamedSidebar } from "./components/Sidebar";
import AdminNavbarComponent, { AdminNavbar as NamedNavbar } from "./components/AdminNavbar";

// تأمين المكونات لتجنب مشاكل export default vs export const
const ActiveSidebar = SidebarComponent || NamedSidebar;
const ActiveAdminNavbar = AdminNavbarComponent || NamedNavbar;

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { i18n } = useTranslation();
  const isRtl = (i18n.language || "ar").startsWith("ar");

  return (
    <div 
      className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D1E] text-slate-900 dark:text-white flex transition-colors duration-200"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* 1. القائمة الجانبية */}
      {ActiveSidebar && (
        <ActiveSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. منطقة العمل الرئيسية بجانب السايدبار */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isRtl ? "lg:mr-64" : "lg:ml-64"
        }`}
      >
        {/* شريط الإدارة العلوي */}
        {ActiveAdminNavbar && (
          <ActiveAdminNavbar
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          />
        )}

        {/* مساحة عرض الصفحات والتحليلات */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;