import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type BaseProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "tertiary" | "navy" | "white" | "outline";
  size?: "sm" | "md" | "lg";
  iconDirection?: "right" | "left" | "search" | "menu" | "close" | "none";
  className?: string;
  ariaLabel?: string;
  loading?: boolean;
};

type ButtonAsButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type ButtonAsLinkProps = BaseProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ariaLabel,
  iconDirection,
  loading,
  ...props
}: ButtonProps) {
  const isDisabled = props.href ? false : (props as ButtonAsButtonProps).disabled || loading;
  const classNames = [styles.button, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(" ");
  const iconTone = variant === "primary" ? "white" : "orange";

  const content = loading ? (
    <span className={styles.spinner} aria-hidden="true" />
  ) : (
    <>
      {iconDirection === "left" ? (
        <span
          className={styles.iconCircle}
          aria-hidden="true"
        />
      ) : null}
      <span>{children}</span>
      {iconDirection && iconDirection !== "left" && iconDirection !== "none" ? (
        <span
          className={styles.iconCircle}
          aria-hidden="true"
        />
      ) : null}
    </>
  );

  if (props.href) {
    const { href, ...anchorProps } = props as ButtonAsLinkProps;
    return (
      <Link
        className={classNames}
        href={href}
        aria-label={ariaLabel}
        aria-disabled={isDisabled || undefined}
        {...anchorProps}
      >
        {content}
      </Link>
    );
  }

  const { type = "button", disabled, ...buttonProps } = props as ButtonAsButtonProps;
  return (
    <button
      className={classNames}
      type={type}
      aria-label={ariaLabel}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...buttonProps}
    >
      {content}
    </button>
  );
}
