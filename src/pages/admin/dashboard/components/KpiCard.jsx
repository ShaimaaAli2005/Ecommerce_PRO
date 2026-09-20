import React from "react";

export const KpiCard = ({ title, value, icon: Icon, trend, variant = "primary" }) => {
  const variantStyles = {
    primary: "bg-primary/10 text-primary dark:bg-accent/20 dark:text-accent",
    success: "bg-status-success/10 text-status-success",
    warning: "bg-status-warning/10 text-status-warning",
    info: "bg-secondary/10 text-secondary-muted dark:text-text-inverse",
  };

  return (
    <div className="p-6 rounded-2xl bg-surface-card dark:bg-surface-dark-card border border-border dark:border-border-dark shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-secondary-muted">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-text-main dark:text-text-inverse font-['Poppins',sans-serif]">
            {value}
          </h3>
          {trend && (
            <p className="text-xs text-status-success font-medium flex items-center gap-1 font-['Poppins',sans-serif]">
              <span>{trend}</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3.5 rounded-xl shrink-0 ${variantStyles[variant] || variantStyles.primary}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;