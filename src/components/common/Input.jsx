import React from "react";

export const Input = React.forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      className = "",
      id,
      required = false,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-start">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-text-main dark:text-text-inverse"
          >
            {label}
            {required && <span className="text-status-error ms-1">*</span>}
          </label>
        )}

        <div className="relative rounded-lg shadow-sm">
          {Icon && (
            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-secondary">
              <Icon className="w-4 h-4" />
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={`w-full rounded-lg border bg-surface-card text-text-main text-sm transition-colors duration-150 placeholder:text-secondary-muted focus:outline-none focus:ring-1 
              ${Icon ? "ps-10 pe-3.5" : "px-3.5"} py-2
              ${
                error
                  ? "border-status-error focus:border-status-error focus:ring-status-error"
                  : "border-border hover:border-secondary focus:border-primary focus:ring-primary dark:border-border-dark dark:bg-surface-dark-card dark:text-text-inverse"
              }
              ${props.disabled ? "opacity-50 cursor-not-allowed bg-secondary/5" : ""}
              ${className}
            `}
            {...props}
          />
        </div>

        {error ? (
          <p className="text-xs text-status-error">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-secondary-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;