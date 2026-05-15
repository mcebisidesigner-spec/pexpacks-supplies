import styles from "./SliderDots.module.css";

type SliderDotsProps = {
  count?: number;
  active?: number;
  light?: boolean;
};

export function SliderDots({ count = 4, active = 0, light = false }: SliderDotsProps) {
  return (
    <div className={[styles.dots, light ? styles.light : ""].filter(Boolean).join(" ")} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <span className={index === active ? styles.active : ""} key={index} />
      ))}
    </div>
  );
}
