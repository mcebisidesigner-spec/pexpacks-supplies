"use client";

import type { MouseEventHandler } from "react";

type ViewCompleteListButtonProps = {
  ariaLabel: string;
  className?: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export function ViewCompleteListButton({
  ariaLabel,
  className = "",
  onClick,
}: ViewCompleteListButtonProps) {
  return (
    <button
      type="button"
      className={[
        "inline-flex items-center justify-center gap-[6px] min-h-10",
        "border-0 rounded-full bg-transparent",
        "text-[var(--pex-text-muted)] font-inherit text-[var(--text-2xs)] font-bold leading-none",
        "underline underline-offset-[3px]",
        "cursor-pointer transition-[var(--interactive-transition)]",
        "hover:text-[var(--color-brand-teal)]",
        "focus-visible:outline-2 focus-visible:outline-[var(--color-brand-orange)] focus-visible:outline-offset-4 focus-visible:text-[var(--pex-primary)]",
        "motion-reduce:transition-none",
        "max-md:min-h-[var(--touch-target-min)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <span>View complete list</span>
    </button>
  );
}
