import type { TextareaHTMLAttributes } from "react";
import { useId } from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  helper?: string;
  error?: string;
  wrapperClassName?: string;
};

export default function Textarea({
  label,
  helper,
  id,
  placeholder,
  value,
  onChange,
  error,
  rows = 4,
  className = "",
  wrapperClassName = "",
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = `${textareaId}-error`;

  return (
    <div className={cn("grid gap-2 text-left", wrapperClassName)}>
      {label && (
        <label
          htmlFor={textareaId}
          className="text-[var(--form-label-color,#1a2a40)] text-sm font-extrabold leading-tight tracking-tight select-none"
        >
          {label}
        </label>
      )}
      {helper ? (
        <p className="m-0 text-[var(--form-helper-color,#4d5a5d)] text-xs sm:text-[13px] leading-snug">
          {helper}
        </p>
      ) : null}

      <textarea
        id={textareaId}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        className={cn(
          "w-full min-h-[120px] sm:min-h-[126px] rounded-[18px] border border-pex-border p-3.5 px-4 bg-white text-pex-navy font-sans text-sm sm:text-[15px] resize-y placeholder:text-pex-muted/60 transition-all duration-150 hover:border-pex-navy/20 focus:outline-none focus:border-pex-keppel focus:ring-4 focus:ring-pex-keppel/15 disabled:cursor-not-allowed disabled:opacity-60",
          error &&
            "border-red-600 focus:border-red-600 ring-4 ring-red-600/10",
          className
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />

      {error && (
        <span
          id={errorId}
          className="m-0 text-red-600 text-xs sm:text-[13px] font-extrabold leading-normal"
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
}
