"use client";

import React from "react";
import styles from "./PhysicalEyeToggle.module.css";

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
  // Determine contextual tooltip text
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
      className={[
        styles.eyeToggleBtn,
        isOpen ? styles.eyeToggleBtnOpen : styles.eyeToggleBtnClosed,
        disabled ? styles.disabled : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={styles.iconWrap} aria-hidden="true">
        {isOpen ? (
          /* BIG OPEN EYE: Alive, watchful, luminous pupil and reflection catchlight */
          <svg
            className={styles.eyeSvg}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Wide-open eyelid contour */}
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
            {/* Iris */}
            <circle
              cx="12"
              cy="12"
              r="3.6"
              fill="currentColor"
              fillOpacity="0.28"
              stroke="currentColor"
              strokeWidth="1.9"
            />
            {/* Pupil */}
            <circle cx="12" cy="12" r="1.85" fill="currentColor" stroke="none" />
            {/* Specular gleam catchlight */}
            <circle cx="13.4" cy="10.4" r="0.8" fill="#ffffff" stroke="none" />
          </svg>
        ) : (
          /* PHYSICALLY CLOSED EYE: Eyelid fully shut with downward eyelashes */
          <svg
            className={styles.eyeSvg}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Closed eyelid contour resting shut */}
            <path d="M2.5 10.5c2.8 4.2 6.2 5.8 9.5 5.8s6.7-1.6 9.5-5.8" />
            {/* Downward eyelashes extending from closed lid */}
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
