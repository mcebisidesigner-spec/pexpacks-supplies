import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { IconCircle } from "./IconCircle";
import styles from "./Button.module.css";

type BaseProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "navy" | "white" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  ariaLabel?: string;
};

type ButtonAsButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: never;
};

type ButtonAsLinkProps = BaseProps & React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ariaLabel,
  ...props
}: ButtonProps) {
  const classNames = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(" ");
  const content = (
    <>
      <span>{children}</span>
      <IconCircle tone="orange" />
    </>
  );

  if (props.href) {
    const { href, ...anchorProps } = props as ButtonAsLinkProps;
    return (
      <Link className={classNames} href={href} aria-label={ariaLabel} {...anchorProps}>
        {content}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = props as ButtonAsButtonProps;
  return (
    <button className={classNames} type={type} aria-label={ariaLabel} {...buttonProps}>
      {content}
    </button>
  );
}
