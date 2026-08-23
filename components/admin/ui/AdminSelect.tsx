import React from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import styles from "./AdminSelect.module.css";

export interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const AdminSelect = React.forwardRef<HTMLSelectElement, AdminSelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={selectId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.selectContainer}>
          <select
            ref={ref}
            id={selectId}
            className={clsx(styles.select, { [styles.hasError]: Boolean(error) }, className)}
            {...props}
          >
            {children}
          </select>
          <span className={styles.arrowIcon}>
            <ChevronDown size={14} />
          </span>
        </div>
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  }
);

AdminSelect.displayName = "AdminSelect";
