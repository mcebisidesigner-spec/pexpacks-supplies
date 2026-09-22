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
      <div className="flex w-full flex-col gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold leading-4 text-[var(--db-text-secondary)] select-none"
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
              "w-full h-11 rounded-lg border border-[var(--db-border-strong)] bg-[var(--db-surface-elevated)] px-3.5 font-inherit text-sm font-medium text-[var(--db-text-primary)] placeholder:text-[var(--db-text-subtle)] outline-none transition-all duration-150 focus:border-[var(--db-brand)] focus:ring-4 focus:ring-[var(--db-brand-subtle)] disabled:cursor-not-allowed disabled:opacity-60",
              icon && "pl-10",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/25",
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <span className="text-xs font-medium leading-4 text-[var(--db-danger-text,#ef4444)]">
            {error}
          </span>
        )}
      </div>
    );
  },
);

AdminInput.displayName = "AdminInput";
