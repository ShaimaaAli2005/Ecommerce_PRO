import React from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = "",
}) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-center gap-1.5 py-4 ${className}`}
    >
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-border bg-surface-card text-text-main hover:bg-secondary/10 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-surface-dark-card dark:border-border-dark dark:text-text-inverse transition-colors"
      >
        <ChevronRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
      </button>

      {pages.map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`min-w-[36px] h-9 px-3 rounded-lg text-xs font-semibold transition-colors duration-150 ${
            pageNum === currentPage
              ? "bg-primary text-white dark:bg-accent dark:text-primary-active shadow-sm"
              : "border border-border bg-surface-card text-text-main hover:bg-secondary/10 dark:bg-surface-dark-card dark:border-border-dark dark:text-text-inverse"
          }`}
        >
          {pageNum}
        </button>
      ))}

      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-border bg-surface-card text-text-main hover:bg-secondary/10 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-surface-dark-card dark:border-border-dark dark:text-text-inverse transition-colors"
      >
        <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
      </button>
    </nav>
  );
};

export default Pagination;