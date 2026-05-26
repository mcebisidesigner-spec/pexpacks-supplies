import styles from "./RatingStrip.module.css";

export function RatingStrip() {
  return (
    <div className={styles.strip}>
      <span className={styles.stars} aria-hidden="true">★★★★★</span>
      <span className={styles.text}>
        <strong>Parents love the convenience</strong>
      </span>
    </div>
  );
}
