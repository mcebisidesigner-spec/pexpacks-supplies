import type { ReactNode, HTMLAttributes } from "react";
import styles from "./Container.module.css";

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "main";
};

export function Container({
  children,
  className = "",
  as: Tag = "div",
  ...props
}: ContainerProps) {
  return (
    <Tag className={`${styles.container} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
