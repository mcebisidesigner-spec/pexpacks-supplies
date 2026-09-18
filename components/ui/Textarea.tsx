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
          "w-full min-h-[120px] sm:min-h-[126px] rounded-[18px] border border-[var(--form-control-border,#e1e7ea)] p-3.5 px-4 bg-[var(--form-control-bg,#ffffff)] text-[var(--form-control-color,#1a2a40)] font-sans text-sm sm:text-[15px] resize-y placeholder:text-[rgba(77,90,93,0.48)] transition-all duration-150 hover:border-[rgba(26,42,64,0.18)] focus:outline-none focus:border-[var(--pex-keppel,#1a7a77)] focus:ring-4 focus:ring-[rgba(26,122,119,0.12)] disabled:cursor-not-allowed disabled:opacity-60",
          error &&
            "border-[var(--color-danger,#b91c1c)] focus:border-[var(--color-danger,#b91c1c)] ring-4 ring-[rgba(185,28,28,0.1)]",
          className
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />

      {error && (
        <span
          id={errorId}
          className="m-0 text-[var(--color-danger,#b91c1c)] text-xs sm:text-[13px] font-extrabold leading-normal"
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
}
