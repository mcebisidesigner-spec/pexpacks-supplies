import Link from "next/link";
import styles from "./PexcoverMarquee.module.css";

export function PexcoverMarquee() {
  return (
    <div className={styles.marqueeWrapper}>
      <div className={styles.marqueeTrack}>
        <div className={styles.marqueeContent}>
          <span className={styles.highlight}>New Add-On!</span>
          <span>
            Hate covering books? Let us do it for you. Exercise books covered,
            labelled, and ready from day one.
          </span>
          <Link
            href="/blog/what-is-pexcover-book-covering"
            target="_blank"
            className={styles.readMoreLink}
          >
            Read more about Pexcover &rarr;
          </Link>
        </div>
        {/* Duplicate for infinite loop effect */}
        <div className={styles.marqueeContent} aria-hidden="true">
          <span className={styles.highlight}>New Add-On!</span>
          <span>
            Hate covering books? Let us do it for you. Exercise books covered,
            labelled, and ready from day one.
          </span>
          <Link
            href="/blog/what-is-pexcover-book-covering"
            target="_blank"
            className={styles.readMoreLink}
            tabIndex={-1}
          >
            Read more about Pexcover &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
