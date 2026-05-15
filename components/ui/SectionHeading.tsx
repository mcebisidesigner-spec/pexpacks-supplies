import type { ReactNode } from "react";
import styles from "./SectionHeading.module.css";

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  text?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({ eyebrow, title, text, align = "left", className = "" }: SectionHeadingProps) {
  return (
    <div className={[styles.heading, styles[align], className].filter(Boolean).join(" ")}>
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <h2>{title}</h2>
      {text ? <p className={styles.text}>{text}</p> : null}
    </div>
  );
}
