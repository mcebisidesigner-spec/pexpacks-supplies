"use client";

import type { MouseEventHandler } from "react";
import styles from "./ViewCompleteListButton.module.css";

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
      className={[styles.button, className].filter(Boolean).join(" ")}
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
