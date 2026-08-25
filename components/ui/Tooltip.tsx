import React, { ReactNode } from "react";
import clsx from "clsx";
import styles from "./Tooltip.module.css";

export type TooltipPosition = "top" | "bottom" | "left" | "right";

export type TooltipProps = {
  content: ReactNode;
  position?: TooltipPosition;
  children: ReactNode;
  className?: string;
  delay?: boolean;
};

export function Tooltip({
  content,
  position = "bottom",
  children,
  className,
  delay = false,
}: TooltipProps) {
  if (!content) return <>{children}</>;

  return (
    <span
      className={clsx(
        styles.tooltipWrapper,
        styles[position],
        delay && styles.delay,
        className
      )}
    >
      {children}
      <span className={styles.tooltipBubble} role="tooltip" aria-hidden="true">
        <span className={styles.tooltipContent}>{content}</span>
        <span className={styles.tooltipArrow} />
      </span>
    </span>
  );
}
