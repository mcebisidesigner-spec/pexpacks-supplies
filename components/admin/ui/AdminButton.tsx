import React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const adminButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-inherit font-bold rounded-lg cursor-pointer no-underline transition-all duration-150 whitespace-nowrap select-none border border-transparent outline-none box-border focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:outline-offset-2 focus-visible:ring-4 focus-visible:ring-slate-950/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-linear-to-br from-emerald-500 to-emerald-600 text-white border-emerald-500/50 shadow-[0_2px_10px_rgba(16,185,129,0.25)] hover:from-emerald-400 hover:to-emerald-500 hover:border-emerald-400 hover:shadow-[0_4px_16px_rgba(16,185,129,0.45)] hover:-translate-y-px active:translate-y-0 active:shadow-[0_2px_6px_rgba(16,185,129,0.3)]",
        secondary:
          "bg-[var(--db-surface)] text-[var(--db-text-primary)] border-[var(--db-border)] hover:bg-[var(--db-surface-inner)] hover:border-[var(--db-text-subtle)] hover:text-[var(--db-text-primary)] hover:-translate-y-px",
        outline:
          "bg-transparent text-[var(--db-text-secondary)] border-[var(--db-border)] hover:bg-[var(--db-surface-hover)] hover:border-[var(--db-border-strong)] hover:text-[var(--db-text-primary)]",
        teal: "bg-[rgba(45,212,191,0.12)] text-[var(--db-teal-text)] border-[rgba(45,212,191,0.35)] hover:bg-[rgba(45,212,191,0.22)] hover:-translate-y-px",
        danger:
          "bg-[var(--db-danger-subtle)] text-[var(--db-danger-text)] border-[var(--db-danger-border)] hover:bg-red-500/20 hover:text-[var(--db-text-primary)] hover:-translate-y-px",
        ghost:
          "bg-transparent text-[var(--db-text-muted)] border-transparent hover:bg-[var(--db-surface-hover)] hover:text-[var(--db-text-primary)]",
        icon: "w-[var(--db-control-height,40px)] h-[var(--db-control-height,40px)] p-0 rounded-[var(--db-radius-control,8px)] bg-[var(--db-surface-inner)] border-[var(--db-border)] text-[var(--db-text-muted)] hover:bg-[var(--db-surface-hover)] hover:text-[var(--db-text-primary)] hover:border-[var(--db-border-strong)]",
        iconRed:
          "w-[var(--db-control-height-sm,32px)] h-[var(--db-control-height-sm,32px)] p-0 rounded-[var(--db-radius-control,8px)] bg-[var(--db-danger-subtle)] border border-[var(--db-danger-border)] text-[var(--db-danger-text)] hover:bg-red-500/25 hover:text-[var(--db-text-primary)]",
        iconTeal:
          "w-[var(--db-control-height-sm,32px)] h-[var(--db-control-height-sm,32px)] p-0 rounded-[var(--db-radius-control,8px)] bg-[rgba(45,212,191,0.12)] border border-[rgba(45,212,191,0.4)] text-[var(--db-teal-text)] hover:bg-[rgba(45,212,191,0.25)]",
      },
      size: {
        sm: "h-8 px-3.5 text-xs",
        md: "h-10 px-4.5 text-sm",
        lg: "h-11 px-5.5 text-[0.9375rem]",
      },
      loading: {
        true: "opacity-50 cursor-not-allowed pointer-events-none",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonVariant = NonNullable<
  VariantProps<typeof adminButtonVariants>["variant"]
>;
export type ButtonSize = NonNullable<
  VariantProps<typeof adminButtonVariants>["size"]
>;

export interface AdminButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof adminButtonVariants> {
  href?: string;
  target?: string;
  rel?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  children?: React.ReactNode;
}

export const AdminButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  AdminButtonProps
>(
  (
    {
      variant = "primary",
      size = "md",
      href,
      target,
      rel,
      icon,
      loading,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const classNames = cn(
      adminButtonVariants({ variant, size, loading }),
      className,
    );

    const content = (
      <>
        {loading ? (
          <span
            className="inline-block w-3.5 h-3.5 border-2 border-current border-r-transparent rounded-full animate-spin shrink-0"
            aria-hidden="true"
          />
        ) : (
          icon && (
            <span className="inline-flex items-center justify-center shrink-0">
              {icon}
            </span>
          )
        )}
        {children && <span>{children}</span>}
      </>
    );

    if (href && !disabled) {
      return (
        <Link
          href={href}
          target={target}
          rel={rel}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classNames}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
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
  },
);

AdminButton.displayName = "AdminButton";
