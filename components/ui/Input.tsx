import type { InputHTMLAttributes } from "react";
import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helper?: string;
  error?: string;
  showValid?: boolean;
  wrapperClassName?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helper,
      error,
      showValid,
      className = "",
      wrapperClassName = "",
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className={cn("grid gap-2 text-left", wrapperClassName)}>
        {label ? (
          <label
            className="text-[var(--form-label-color,#1a2a40)] text-sm font-extrabold leading-tight tracking-tight select-none"
            htmlFor={inputId}
          >
            {label}
          </label>
        ) : null}
        {helper ? (
          <p className="m-0 text-[var(--form-helper-color,#4d5a5d)] text-xs sm:text-[13px] leading-snug">
            {helper}
          </p>
        ) : null}
        <div className="relative grid">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full min-h-[50px] sm:min-h-[54px] rounded-[18px] border border-[var(--form-control-border,#e1e7ea)] px-4 bg-[var(--form-control-bg,#ffffff)] text-[var(--form-control-color,#1a2a40)] font-sans text-sm sm:text-[15px] placeholder:text-[rgba(77,90,93,0.48)] transition-all duration-150 hover:border-[rgba(26,42,64,0.18)] focus:outline-none focus:border-[var(--pex-keppel,#1a7a77)] focus:ring-4 focus:ring-[rgba(26,122,119,0.12)] disabled:cursor-not-allowed disabled:opacity-60",
              error &&
                "border-[var(--color-danger,#b91c1c)] focus:border-[var(--color-danger,#b91c1c)] ring-4 ring-[rgba(185,28,28,0.1)]",
              className
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            {...props}
          />
          {showValid ? (
            <span
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--pex-success,#2f855a)] pointer-events-none"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="w-full h-full"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          ) : null}
        </div>
        {error ? (
          <p
            id={errorId}
            className="m-0 text-[var(--color-danger,#b91c1c)] text-xs sm:text-[13px] font-extrabold leading-normal"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
