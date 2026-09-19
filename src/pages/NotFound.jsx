import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";

export const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-surface-base dark:bg-surface-dark">
      <h1 className="text-7xl font-extrabold text-primary dark:text-accent tracking-widest">
        404
      </h1>
      <p className="mt-4 text-lg font-medium text-text-main dark:text-text-inverse">
        عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
      </p>
      <div className="mt-6">
        <Link to="/">
          <Button variant="cta" size="md">
            العودة إلى الصفحة الرئيسية
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;