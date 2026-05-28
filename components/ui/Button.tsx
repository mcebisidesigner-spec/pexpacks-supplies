import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { IconCircle } from "./IconCircle";
import styles from "./Button.module.css";

type BaseProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "tertiary" | "navy" | "white" | "outline";
  size?: "sm" | "md" | "lg";
  iconDirection?: "right" | "left" | "search" | "menu" | "close";
  className?: string;
  ariaLabel?: string;
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
  ...props
}: ButtonProps) {
  const classNames = [styles.button, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(" ");
  const iconTone = variant === "primary" ? "white" : "orange";
  const content = (
    <>
      {iconDirection === "left" ? <IconCircle tone={iconTone} direction={iconDirection} /> : null}
      <span>{children}</span>
      {iconDirection !== "left" ? <IconCircle tone={iconTone} direction={iconDirection ?? "right"} /> : null}
    </>
  );

  if (props.href) {
    const { href, ...anchorProps } = props as ButtonAsLinkProps;
    return (
      <Link
        className={classNames}
        href={href}
        aria-label={ariaLabel}
        {...anchorProps}
      >
        {content}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = props as ButtonAsButtonProps;
  return (
    <button
      className={classNames}
      type={type}
      aria-label={ariaLabel}
      {...buttonProps}
    >
      {content}
    </button>
  );
}
