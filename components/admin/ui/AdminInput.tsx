import React from "react";
import { cn } from "@/lib/utils";

export interface AdminInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
  label?: string;
}

export const AdminInput = React.forwardRef<HTMLInputElement, AdminInputProps>(
  ({ icon, error, label, className, id, ...props }, ref) => {
    const inputId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-[var(--db-text-muted)] select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {icon && (
            <span className="absolute left-3 flex items-center justify-center text-[var(--db-text-subtle)] pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-10 bg-[var(--db-surface-inner)] border border-[var(--db-border)] rounded-lg px-3 font-inherit text-[13px] font-medium text-[var(--db-text-primary)] placeholder:text-[var(--db-text-subtle)] outline-none transition-colors transition-shadow focus:border-[var(--db-brand,#10b981)] focus:ring-2 focus:ring-[var(--db-brand,#10b981)]/20",
              icon && "pl-9.5",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/25",
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <span className="text-xs text-[var(--db-danger-text,#ef4444)] font-medium">
            {error}
          </span>
        )}
      </div>
    );
  },
);

AdminInput.displayName = "AdminInput";
