"use client";

import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface FloatingTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  bgSurface?: string;
}

export const FloatingTextarea = forwardRef<
  HTMLTextAreaElement,
  FloatingTextareaProps
>(
  (
    {
      label,
      id,
      error,
      bgSurface,
      value,
      defaultValue,
      className,
      disabled,
      required,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id || `floating-textarea-${generatedId.replace(/:/g, "")}`;

    // Custom background color style override if passed
    const labelBgStyle: React.CSSProperties = {};
    if (bgSurface) {
      const hexMatch = bgSurface.match(/#[0-9a-fA-F]+/);
      if (hexMatch) {
        labelBgStyle.backgroundColor = hexMatch[0];
      }
    }

    return (
      <div className="relative w-full flex flex-col text-left">
        <textarea
          ref={ref}
          id={inputId}
          placeholder=" "
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          required={required}
          style={labelBgStyle.backgroundColor ? { backgroundColor: labelBgStyle.backgroundColor } : undefined}
          className={cn(
            "peer w-full min-h-[110px] bg-[var(--db-surface-inner,#090e17)] border border-[var(--db-border,rgba(30,41,59,0.8))] rounded-lg text-[var(--db-text-primary,#f8fafc)] font-sans text-[0.84375rem] font-medium pt-5 pb-2.5 px-3.5 outline-none resize-y transition-all placeholder:text-transparent hover:border-[rgba(30,41,59,1)] focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 focus:bg-[#0b121e] disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-[var(--db-danger,#ef4444)] focus:ring-[rgba(239,68,68,0.25)]",
            className
          )}
          {...props}
        />
        <label
          htmlFor={inputId}
          style={labelBgStyle}
          className={cn(
            "absolute pointer-events-none transition-all px-1.5 bg-[var(--db-surface-inner,#090e17)] rounded text-[var(--db-text-muted,#64748b)] text-[0.8125rem] font-normal left-3 top-4 z-10 whitespace-nowrap leading-none",
            "peer-focus:top-0 peer-focus:left-2.5 peer-focus:-translate-y-1/2 peer-focus:text-[0.6875rem] peer-focus:font-semibold peer-focus:text-[#10b981]",
            "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:left-2.5 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-[0.6875rem] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-[var(--db-text-secondary,#94a3b8)]",
            error && "text-[var(--db-danger-text,#f87171)] peer-focus:text-[var(--db-danger-text,#f87171)]"
          )}
        >
          {label}
          {required ? " *" : ""}
        </label>
        {error && (
          <p className="mt-1 ml-0.5 text-xs font-medium text-[var(--db-danger-text,#f87171)]">
            {error}
          </p>
        )}
      </div>
    );
  },
);

FloatingTextarea.displayName = "FloatingTextarea";
