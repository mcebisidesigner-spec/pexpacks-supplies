"use client";

import React, { forwardRef, useId } from "react";
import clsx from "clsx";
import styles from "./FloatingInput.module.css";

export interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  rightAdornment?: React.ReactNode;
  bgSurface?: string;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  (
    {
      label,
      id,
      error,
      icon,
      rightAdornment,
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
    const inputId = id || `floating-input-${generatedId.replace(/:/g, "")}`;

    // Custom background color style override if passed
    const labelBgStyle: React.CSSProperties = {};
    if (bgSurface) {
      // If user passed hex or class like bg-[#0b121e]
      const hexMatch = bgSurface.match(/#[0-9a-fA-F]+/);
      if (hexMatch) {
        labelBgStyle.backgroundColor = hexMatch[0];
      }
    }

    return (
      <div className={styles.wrapper}>
        <div className={styles.inputContainer}>
          {icon && <div className={styles.iconSlot}>{icon}</div>}
          <input
            ref={ref}
            id={inputId}
            placeholder=" "
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            required={required}
            style={labelBgStyle.backgroundColor ? { backgroundColor: labelBgStyle.backgroundColor } : undefined}
            className={clsx(
              styles.input,
              {
                [styles.hasIcon]: !!icon,
                [styles.hasRightAdornment]: !!rightAdornment,
                [styles.inputError]: !!error,
              },
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
          {rightAdornment && (
            <div className={styles.rightSlot}>{rightAdornment}</div>
          )}
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    );
  },
);

FloatingInput.displayName = "FloatingInput";
