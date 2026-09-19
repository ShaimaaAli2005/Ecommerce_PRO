import React from "react";
import { Loader2 } from "lucide-react";

export const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface-base/80 dark:bg-surface-dark/80 backdrop-blur-sm transition-opacity">
      <Loader2 className="w-10 h-10 text-primary dark:text-accent animate-spin" />
      <p className="mt-3 text-xs font-semibold text-secondary dark:text-secondary-muted tracking-wide animate-pulse">
        جاري تحميل البيانات...
      </p>
    </div>
  );
};

export default PageLoader;