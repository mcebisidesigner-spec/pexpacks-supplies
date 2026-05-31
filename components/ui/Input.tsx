import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";
import styles from "./Input.module.css";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helper?: string;
  error?: string;
  showValid?: boolean;
  wrapperClassName?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helper, error, showValid, className = "", wrapperClassName = "", ...props }, ref) => {
    return (
      <div className={`${styles.wrapper} ${wrapperClassName}`}>
        {label ? (
          <label className={styles.label} htmlFor={props.id}>
            {label}
          </label>
        ) : null}
        {helper ? <p className={styles.helper}>{helper}</p> : null}
        <div className={styles.inputWrap}>
          <input
            ref={ref}
            className={`${styles.input} ${className}`}
            aria-invalid={error ? true : undefined}
            {...props}
          />
          {showValid ? (
            <span className={styles.successIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          ) : null}
        </div>
        {error ? <p className={styles.errorText} role="alert">{error}</p> : null}
      </div>
    );
  }
);

Input.displayName = "Input";
