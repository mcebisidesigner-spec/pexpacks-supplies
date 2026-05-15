import styles from "./IconCircle.module.css";

type IconCircleProps = {
  tone?: "orange" | "navy" | "white";
  direction?: "right" | "left" | "search" | "menu" | "close";
  className?: string;
};

export function IconCircle({
  tone = "orange",
  direction = "right",
  className = "",
}: IconCircleProps) {
  const classNames = [
    styles.iconCircle,
    styles[tone],
    styles[direction],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (direction === "search") {
    return (
      <span className={classNames} aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M10.7 5.2a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm4.2 8.4 3.9 3.9" />
        </svg>
      </span>
    );
  }

  if (direction === "menu") {
    return (
      <span className={classNames} aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M5 7h14M5 12h14M5 17h14" />
        </svg>
      </span>
    );
  }

  if (direction === "close") {
    return (
      <span className={classNames} aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      </span>
    );
  }

  return (
    <span className={classNames} aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M4 12h14M13 7l5 5-5 5" />
      </svg>
    </span>
  );
}
