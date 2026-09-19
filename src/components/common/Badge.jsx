import React from "react";

export const Badge = ({
  children,
  variant = "default",
  size = "sm",
  className = "",
}) => {
  const baseStyles =
    "inline-flex items-center font-semibold rounded-md uppercase tracking-wider";

  const variants = {
    default: "bg-secondary/15 text-secondary dark:text-text-inverse",
    primary: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-text-inverse",
    accent: "bg-accent/20 text-accent dark:text-accent-hover font-bold",
    success: "bg-status-success/15 text-status-success",
    error: "bg-status-error/15 text-status-error",
    warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    info: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.sm} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;