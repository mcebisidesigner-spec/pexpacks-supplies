"use client";

import React, { useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminSearchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  isLoading?: boolean;
  enableShortcut?: boolean;
  containerClassName?: string;
}

/**
 * Accessible search input for admin data tables and list views.
 * Supports hotkey focusing ('/' key), clear button, and loading spinner.
 */
export function AdminSearch({
  value,
  onChange,
  onClear,
  isLoading = false,
  enableShortcut = true,
  placeholder = "Search...",
  className,
  containerClassName,
  ...props
}: AdminSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!enableShortcut) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger if focus is already in an input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableShortcut]);

  const handleClear = () => {
    onChange("");
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        "relative flex items-center w-full max-w-sm min-w-[200px]",
        containerClassName,
      )}
    >
      <Search
        size={15}
        className="absolute left-3 text-[var(--db-text-subtle,#64748b)] pointer-events-none shrink-0"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(
          "w-full h-9 pl-9 pr-14 text-xs font-medium rounded-lg",
          "bg-[var(--db-surface-inner,#090e17)] text-[var(--db-text-primary,#f8fafc)] placeholder:text-[var(--db-text-subtle,#64748b)]",
          "border border-[var(--db-border,#1e293b)] focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/30",
          "transition-colors shadow-xs",
          className,
        )}
        {...props}
      />
      <div className="absolute right-2 flex items-center gap-1">
        {isLoading ? (
          <Loader2
            size={14}
            className="text-[var(--db-text-subtle,#64748b)] animate-spin"
            aria-hidden="true"
          />
        ) : value ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-[var(--db-text-subtle,#64748b)] hover:text-[var(--db-text-primary,#f8fafc)] rounded focus:outline-none focus:ring-1 focus:ring-slate-500"
            aria-label="Clear search"
          >
            <X size={13} aria-hidden="true" />
          </button>
        ) : enableShortcut ? (
          <kbd
            className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-[var(--db-text-subtle,#64748b)] bg-[var(--db-surface,#0c1322)] border border-[var(--db-border,#1e293b)] rounded"
            aria-hidden="true"
          >
            /
          </kbd>
        ) : null}
      </div>
    </div>
  );
}
