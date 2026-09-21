import { Check } from "lucide-react";
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
            className="text-pex-navy text-sm font-extrabold leading-tight tracking-tight select-none"
            htmlFor={inputId}
          >
            {label}
          </label>
        ) : null}
        {helper ? (
          <p className="m-0 text-pex-muted text-xs sm:text-[13px] leading-snug">
            {helper}
          </p>
        ) : null}
        <div className="relative grid">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-11 min-h-11 rounded-xl border border-pex-border px-4 bg-white text-pex-navy font-sans text-sm sm:text-[15px] placeholder:text-pex-muted/50 transition-all duration-150 hover:border-pex-navy/20 focus:outline-none focus:border-pex-keppel focus:ring-4 focus:ring-pex-keppel/15 disabled:cursor-not-allowed disabled:opacity-60",
              error &&
                "border-destructive focus:border-destructive ring-4 ring-destructive/10",
              className
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            {...props}
          />
          {showValid ? (
            <span
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600 pointer-events-none"
              aria-hidden="true"
            >
              <Check className="size-full" strokeWidth={3} aria-hidden="true" />
            </span>
          ) : null}
        </div>
        {error ? (
          <p
            id={errorId}
            className="m-0 text-destructive text-xs sm:text-[13px] font-extrabold leading-normal"
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
