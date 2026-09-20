import React from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const StoreLayout = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-surface-base dark:bg-surface-dark text-text-main dark:text-text-inverse transition-colors duration-200">
      <header className="h-16 border-b border-border dark:border-border-dark px-6 flex items-center justify-between bg-surface-card dark:bg-surface-dark-card shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary dark:bg-accent flex items-center justify-center text-white dark:text-primary-active font-extrabold text-base">
            L
          </div>
          <span className="font-extrabold text-xl tracking-wider text-primary dark:text-accent">
            LUMA
          </span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      <footer className="py-6 border-t border-border dark:border-border-dark text-center text-xs text-secondary-muted bg-surface-card dark:bg-surface-dark-card">
        <p>© {new Date().getFullYear()} LUMA. {t("common.all_rights_reserved", "جميع الحقوق محفوظة.")}</p>
      </footer>
    </div>
  );
};

export default StoreLayout;