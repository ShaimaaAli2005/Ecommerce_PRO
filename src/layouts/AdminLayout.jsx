import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import AdminNavbar from "./components/AdminNavbar";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-base dark:bg-surface-dark flex text-text-main dark:text-text-inverse transition-colors duration-200">
      {/* القائمة الجانبية */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* منطقة المحتوى بجانب السايدبار */}
      <div className="flex-1 flex flex-col ltr:lg:pl-64 rtl:lg:pr-64 min-w-0">
        <AdminNavbar
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;