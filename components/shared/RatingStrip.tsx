import styles from "./RatingStrip.module.css";

type RatingStripProps = {
  text?: string;
};

export function RatingStrip({ text = "We all love peace of mind" }: RatingStripProps) {
  return (
    <div className={styles.strip}>
      <span className={styles.stars} aria-hidden="true">★★★★★</span>
      <span className={styles.text}>
        <strong>{text}</strong>
      </span>
    </div>
  );
}
