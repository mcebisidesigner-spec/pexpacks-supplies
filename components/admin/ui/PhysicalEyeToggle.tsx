"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface PhysicalEyeToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  /** Context to determine automated labels if none provided */
  type?: "announcement" | "faq" | "testimonial" | "general";
  activeLabel?: string;
  inactiveLabel?: string;
  className?: string;
  disabled?: boolean;
}

export function PhysicalEyeToggle({
  isOpen,
  onToggle,
  type = "general",
  activeLabel,
  inactiveLabel,
  className,
  disabled = false,
}: PhysicalEyeToggleProps) {
  const defaultActiveLabel =
    type === "announcement"
      ? "Active · Click to deactivate"
      : type === "faq"
      ? "Published · Click to unpublish"
      : type === "testimonial"
      ? "Featured · Click to unfeature"
      : "Active · Click to deactivate";

  const defaultInactiveLabel =
    type === "announcement"
      ? "Inactive · Click to activate"
      : type === "faq"
      ? "Draft / Unpublished · Click to publish"
      : type === "testimonial"
      ? "Not Featured · Click to feature"
      : "Inactive · Click to activate";

  const label = isOpen
    ? activeLabel || defaultActiveLabel
    : inactiveLabel || defaultInactiveLabel;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOpen}
      aria-label={label}
      title={label}
      data-db-tooltip={label}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "relative inline-flex items-center justify-center w-11 h-[38px] p-0 m-0 rounded-[10px] cursor-pointer outline-none border-[1.5px] transition-all duration-200 select-none touch-manipulation hover:-translate-y-px hover:scale-105 active:translate-y-0 active:scale-95 focus-visible:ring-3 focus-visible:ring-emerald-500/35 focus-visible:border-emerald-500",
        isOpen
          ? "bg-emerald-500/12 border-emerald-500/45 text-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.22)] hover:bg-emerald-500/18 hover:border-emerald-500 hover:text-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.38)]"
          : "bg-slate-900/40 border-slate-400/20 text-slate-500 hover:bg-slate-900/65 hover:border-slate-400/35 hover:text-slate-300",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className,
      )}
    >
      <span
        className="flex items-center justify-center w-6 h-6 transition-transform duration-200"
        aria-hidden="true"
      >
        {isOpen ? (
          <svg
            className="w-6 h-6 block"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
            <circle
              cx="12"
              cy="12"
              r="3.6"
              fill="currentColor"
              fillOpacity="0.28"
              stroke="currentColor"
              strokeWidth="1.9"
            />
            <circle cx="12" cy="12" r="1.85" fill="currentColor" stroke="none" />
            <circle cx="13.4" cy="10.4" r="0.8" fill="#ffffff" stroke="none" />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 block"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2.5 10.5c2.8 4.2 6.2 5.8 9.5 5.8s6.7-1.6 9.5-5.8" />
            <line x1="12" y1="16.3" x2="12" y2="19.5" />
            <line x1="7.8" y1="15.1" x2="6.3" y2="17.9" />
            <line x1="16.2" y1="15.1" x2="17.7" y2="17.9" />
            <line x1="4.2" y1="12.6" x2="2.5" y2="14.8" />
            <line x1="19.8" y1="12.6" x2="21.5" y2="14.8" />
          </svg>
        )}
      </span>
    </button>
  );
}
