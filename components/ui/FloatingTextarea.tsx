"use client";

import React, { forwardRef, useId } from "react";
import clsx from "clsx";
import styles from "./FloatingTextarea.module.css";

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
      <div className={styles.wrapper}>
        <textarea
          ref={ref}
          id={inputId}
          placeholder=" "
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          required={required}
          style={labelBgStyle.backgroundColor ? { backgroundColor: labelBgStyle.backgroundColor } : undefined}
          className={clsx(
            styles.textarea,
            { [styles.textareaError]: !!error },
            className,
          )}
          {...props}
        />
        <label
          htmlFor={inputId}
          style={labelBgStyle}
          className={styles.label}
        >
          {label}
          {required ? " *" : ""}
        </label>
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    );
  },
);

FloatingTextarea.displayName = "FloatingTextarea";
