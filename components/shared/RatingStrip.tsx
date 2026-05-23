import styles from "./RatingStrip.module.css";

export function RatingStrip() {
  return (
    <div className={styles.strip}>
      <span className={styles.stars} aria-hidden="true">★★★★★</span>
      <span className={styles.text}>
        <strong>4.8/5</strong> from 2,000+ verified parents
      </span>
    </div>
  );
}
