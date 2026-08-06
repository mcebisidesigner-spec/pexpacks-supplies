import styles from "./AnnouncementBar.module.css";

export function AnnouncementBar({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className={styles.bar} role="region" aria-label="Announcement">
      <div className={styles.inner}>{text}</div>
    </div>
  );
}
