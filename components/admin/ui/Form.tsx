import React from "react";
import clsx from "clsx";

export function Page({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("db-page", className)} {...props}>
      {children}
    </div>
  );
}

export function Stack({
  size,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" | "lg" }) {
  return (
    <div
      className={clsx(
        "db-stack",
        size === "sm" && "db-stack-sm",
        size === "lg" && "db-stack-lg",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Row({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("db-row", className)} {...props}>
      {children}
    </div>
  );
}

export function RowBetween({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("db-row-between", className)} {...props}>
      {children}
    </div>
  );
}

export function FormGrid({
  columns = 1,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { columns?: 1 | 2 }) {
  return (
    <div
      className={clsx(
        "db-form-grid",
        columns === 2 && "db-form-grid-2",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function FormSection({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("db-form-section", className)} {...props}>
      {children}
    </div>
  );
}

export function FormRow({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("db-form-row", className)} {...props}>
      {children}
    </div>
  );
}

export function FormActions({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("db-form-actions", className)} {...props}>
      {children}
    </div>
  );
}

export function Field({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("db-field", className)} {...props}>
      {children}
    </div>
  );
}

export function FieldLabel({
  className,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={clsx("db-field-label", className)} {...props}>
      {children}
    </label>
  );
}

export function FieldHelper({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={clsx("db-field-helper", className)} {...props}>
      {children}
    </span>
  );
}

export function FieldError({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={clsx("db-field-error-text", className)} {...props}>
      {children}
    </span>
  );
}
