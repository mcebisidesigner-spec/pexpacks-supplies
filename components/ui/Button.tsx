import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 font-bold font-sans leading-none text-center rounded-full border border-transparent max-w-full origin-center select-none transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pex-keppel)] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none aria-disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:transform-none aria-disabled:shadow-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--pex-coral)] text-white shadow-[0_10px_20px_rgba(255,111,89,0.22)] hover:bg-[var(--pex-coral-hover)] hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(26,42,64,0.16)] active:brightness-100 active:translate-y-0 active:scale-[0.99]",
        secondary:
          "bg-white border-[rgba(26,42,64,0.18)] text-[var(--pex-navy)] shadow-[inset_0_0_0_1px_rgba(26,42,64,0.02)] hover:bg-[var(--pex-bg-soft)] hover:border-[var(--pex-coral)] hover:brightness-105 hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(26,42,64,0.16)] active:brightness-100 active:translate-y-0 active:scale-[0.99]",
        tertiary:
          "bg-transparent text-[var(--pex-text-muted)] underline underline-offset-4 decoration-[1.5px] hover:text-[var(--pex-navy)] hover:transform-none hover:shadow-none",
        navy:
          "bg-[var(--pex-navy)] text-white shadow-[0_10px_20px_rgba(26,42,64,0.12)] hover:bg-[var(--pex-sme-navy)] hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(26,42,64,0.16)] active:brightness-100 active:translate-y-0 active:scale-[0.99]",
        white:
          "bg-white text-[var(--pex-navy)] shadow-[0_10px_20px_rgba(26,42,64,0.12)] hover:bg-[var(--pex-bg-soft)] hover:brightness-105 hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(26,42,64,0.16)] active:brightness-100 active:translate-y-0 active:scale-[0.99]",
        outline:
          "bg-transparent border-[var(--pex-navy)] text-[var(--pex-navy)] hover:bg-[var(--pex-bg-soft)] hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(26,42,64,0.16)] active:brightness-100 active:translate-y-0 active:scale-[0.99]",
      },
      size: {
        sm: "min-h-[48px] sm:min-h-[34px] px-4 sm:px-[17px] text-sm",
        md: "min-h-[48px] sm:min-h-[44px] px-4 sm:px-[22px] text-sm sm:text-base",
        lg: "min-h-[48px] sm:min-h-[56px] px-5 sm:px-7 text-base sm:text-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

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

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

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
  const isDisabled = props.href
    ? false
    : (props as ButtonAsButtonProps).disabled || loading;

  const resolvedClassName = cn(buttonVariants({ variant, size }), className);

  const content = loading ? (
    <span
      className="inline-block w-[1em] h-[1em] border-2 border-current border-t-transparent rounded-full animate-spin shrink-0"
      aria-hidden="true"
    />
  ) : (
    <>
      {iconDirection === "left" ? (
        <span
          className="inline-block w-[0.8em] h-[0.8em] rounded-full bg-current shrink-0"
          aria-hidden="true"
        />
      ) : null}
      <span className="min-w-0 break-words text-center">{children}</span>
      {iconDirection && iconDirection !== "left" && iconDirection !== "none" ? (
        <span
          className="inline-block w-[0.8em] h-[0.8em] rounded-full bg-current shrink-0 transition-transform duration-200 group-hover:scale-110"
          aria-hidden="true"
        />
      ) : null}
    </>
  );

  if (props.href) {
    const { href, ...anchorProps } = props as ButtonAsLinkProps;
    return (
      <Link
        className={resolvedClassName}
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
      className={resolvedClassName}
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
