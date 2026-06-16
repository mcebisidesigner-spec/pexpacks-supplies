import styles from "./RatingStrip.module.css";

type RatingStripProps = {
  text?: string;
};

export function RatingStrip({ text = "Five-star, every time" }: RatingStripProps) {
  return (
    <div className={styles.strip}>
      <span className={styles.stars} aria-hidden="true">★★★★★</span>
      <span className={styles.text}>
        <strong>{text}</strong>
      </span>
    </div>
  );
}
