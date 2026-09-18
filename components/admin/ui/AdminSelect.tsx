"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminSelectProps
  extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "value" | "onChange"
  > {
  label?: string;
  error?: string;
  value?: string | number;
  onChange?: (e: { target: { value: string } }) => void;
}

interface AdminOption {
  value: string;
  label: string;
  disabled: boolean;
}

function extractOptions(children: React.ReactNode): AdminOption[] {
  const options: AdminOption[] = [];
  React.Children.forEach(children, (child) => {
    if (
      !React.isValidElement<React.OptionHTMLAttributes<HTMLOptionElement>>(
        child,
      )
    )
      return;
    const value = child.props.value;
    if (value === undefined || value === null) return;
    const inner = child.props.children;
    options.push({
      value: String(value),
      label:
        inner === null || inner === undefined ? String(value) : String(inner),
      disabled: Boolean(child.props.disabled),
    });
  });
  return options;
}

export const AdminSelect = React.forwardRef<HTMLDivElement, AdminSelectProps>(
  function AdminSelect(
    { label, error, className, id, children, value, onChange, disabled },
    ref,
  ) {
    const selectId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    const options = useMemo(() => extractOptions(children), [children]);

    const current =
      options.find((opt) => opt.value === String(value ?? "")) || undefined;

    useEffect(() => {
      function handlePointerDown(ev: MouseEvent | TouchEvent) {
        if (rootRef.current && !rootRef.current.contains(ev.target as Node)) {
          setOpen(false);
        }
      }
      function handleKeyDown(ev: KeyboardEvent) {
        if (ev.key === "Escape") setOpen(false);
      }
      document.addEventListener("mousedown", handlePointerDown);
      document.addEventListener("touchstart", handlePointerDown);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handlePointerDown);
        document.removeEventListener("touchstart", handlePointerDown);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, []);

    const handleSelect = (opt: AdminOption) => {
      setOpen(false);
      if (opt.disabled) return;
      if (String(opt.value) !== String(value ?? "")) {
        onChange?.({ target: { value: opt.value } });
      }
    };

    return (
      <div className="flex flex-col gap-1.5 w-full" ref={ref}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold text-[var(--db-text-muted)] select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full" ref={rootRef}>
          <button
            type="button"
            id={selectId}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            className={cn(
              "flex items-center justify-between gap-2 w-full h-[42px] bg-[var(--db-surface-inner,#090e17)] border border-[var(--db-border,rgba(51,65,85,0.85))] rounded-lg px-3 text-left cursor-pointer outline-none transition-colors transition-shadow text-[var(--db-text-primary,#ffffff)] hover:border-slate-400/60 hover:bg-slate-800/50 focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/25 focus-visible:bg-[#0b121e] disabled:opacity-50 disabled:cursor-not-allowed",
              open &&
                "border-emerald-500 ring-2 ring-emerald-500/25 bg-[#0b121e]",
              error &&
                "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/25",
              className,
            )}
            onClick={() => setOpen((prev) => !prev)}
          >
            <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-medium text-inherit">
              {current ? current.label : "Select..."}
            </span>
            <span
              className={cn(
                "flex items-center justify-center text-slate-400 pointer-events-none transition-transform transition-colors duration-150 shrink-0",
                open && "text-emerald-500 rotate-180",
              )}
            >
              <ChevronDown size={14} />
            </span>
          </button>

          {open ? (
            <ul
              className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 m-0 p-1.5 list-none bg-[#090e17] border border-slate-700/90 rounded-lg shadow-[0_12px_36px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.05)] max-h-70 overflow-y-auto box-border"
              role="listbox"
            >
              {options.map((opt) => {
                const isActive = opt.value === String(value ?? "");
                return (
                  <li key={opt.value} role="option" aria-selected={isActive}>
                    <button
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => handleSelect(opt)}
                      className={cn(
                        "flex items-center justify-between gap-3 w-full px-3 py-2 border-0 rounded-md bg-transparent font-inherit text-[13px] font-medium text-slate-300 cursor-pointer text-left transition-colors select-none disabled:opacity-40 disabled:cursor-not-allowed",
                        !isActive && "hover:bg-white/8 hover:text-white",
                        isActive &&
                          "bg-emerald-500/18 text-emerald-500 font-semibold hover:bg-emerald-500/25 hover:text-emerald-400",
                      )}
                    >
                      <span
                        className={cn(
                          "truncate",
                          isActive && "text-emerald-500 font-semibold",
                        )}
                      >
                        {opt.label}
                      </span>
                      {isActive ? (
                        <span className="flex items-center shrink-0 text-emerald-500 ml-auto">
                          <Check size={14} strokeWidth={3} />
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
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

AdminSelect.displayName = "AdminSelect";
