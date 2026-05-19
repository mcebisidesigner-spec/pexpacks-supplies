import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import styles from "./IconButton.module.css";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  tone?: "light" | "navy" | "ghost";
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      label,
      children,
      size = "md",
      tone = "light",
      className = "",
      type = "button",
      ...props
    },
    ref
  ) {
    return (
      <button
        type={type}
        className={[styles.button, styles[size], styles[tone], className]
          .filter(Boolean)
          .join(" ")}
        aria-label={label}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
