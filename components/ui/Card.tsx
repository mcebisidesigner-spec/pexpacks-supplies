import type { ReactNode, HTMLAttributes } from "react";
import styles from "./Card.module.css";

const paddingMap: Record<string, string> = {
  default: "",
  compact: styles.paddingCompact,
  spacious: styles.paddingSpacious,
};

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: "default" | "soft" | "interactive";
  padding?: "default" | "compact" | "spacious";
  className?: string;
};

export function Card({
  children,
  variant = "default",
  padding = "default",
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`${styles.card} ${styles[variant]} ${paddingMap[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
