import React from "react";
import Link from "next/link";
import clsx from "clsx";
import styles from "./AdminButton.module.css";

export type ButtonVariant = "primary" | "secondary" | "teal" | "danger" | "ghost" | "icon" | "iconRed" | "iconTeal";
export type ButtonSize = "sm" | "md" | "lg";

export interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  children?: React.ReactNode;
}

export const AdminButton = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, AdminButtonProps>(
  ({ variant = "primary", size = "md", href, icon, loading, children, className, disabled, ...props }, ref) => {
    const classNames = clsx(
      styles.button,
      styles[variant],
      styles[size],
      { [styles.loading]: loading },
      className
    );

    const content = (
      <>
        {loading ? (
          <span className={styles.spinner} aria-hidden="true" />
        ) : (
          icon && <span className={styles.iconWrapper}>{icon}</span>
        )}
        {children && <span>{children}</span>}
      </>
    );

    if (href && !disabled) {
      return (
        <Link
          href={href}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classNames}
          {...(props as any)}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classNames}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </button>
    );
  }
);

AdminButton.displayName = "AdminButton";
