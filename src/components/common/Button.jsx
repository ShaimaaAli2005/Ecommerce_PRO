import React from "react";
import { Loader2 } from "lucide-react";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  className = "",
  type = "button",
  onClick,
  icon: Icon,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  const variants = {
    primary:
      "bg-primary text-white hover:bg-primary-hover active:bg-primary-active focus-visible:ring-accent",
    cta:
      "bg-accent text-primary-active font-semibold hover:bg-accent-hover shadow-sm hover:shadow focus-visible:ring-primary",
    secondary:
      "bg-secondary/15 text-secondary hover:bg-secondary/25 dark:bg-secondary/20 dark:text-text-inverse focus-visible:ring-secondary",
    outline:
      "border border-border bg-transparent text-text-main hover:bg-secondary/10 dark:text-text-inverse dark:border-border-dark focus-visible:ring-primary",
    danger:
      "bg-status-error text-white hover:opacity-90 focus-visible:ring-status-error",
    ghost:
      "bg-transparent text-text-main hover:bg-secondary/10 dark:text-text-inverse focus-visible:ring-secondary",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-6 py-3 gap-2.5",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        Icon && <Icon className="w-4 h-4" />
      )}
      <span>{children}</span>
    </button>
  );
};

export default Button;