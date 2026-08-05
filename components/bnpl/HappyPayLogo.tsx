import type { CSSProperties } from "react";
import styles from "./HappyPayLogo.module.css";

type HappyPayLogoProps = {
  tone?: "light" | "dark";
  showLabel?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function HappyPayLogo({
  tone = "light",
  showLabel = true,
  className = "",
  style,
}: HappyPayLogoProps) {
  return (
    <span
      className={`${styles.logo} ${styles[tone]} ${className}`.trim()}
      style={style}
      aria-label="Happy Pay"
    >
      <svg
        className={styles.mark}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="11" className={styles.markBg} />
        <circle cx="8.2" cy="9.8" r="1.35" className={styles.markDot} />
        <circle cx="15.8" cy="9.8" r="1.35" className={styles.markDot} />
        <path
          d="M7.2 14.2c1.3 1.6 3 2.4 4.8 2.4s3.5-.8 4.8-2.4"
          className={styles.markSmile}
          strokeWidth="1.9"
          strokeLinecap="round"
        />
      </svg>
      {showLabel ? (
        <span className={styles.wordmark}>
          Happy&nbsp;Pay
        </span>
      ) : null}
    </span>
  );
}
