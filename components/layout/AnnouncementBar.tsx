import Link from "next/link";
import styles from "./AnnouncementBar.module.css";

export interface AnnouncementBarProps {
  text?: string;
  badge?: string;
  linkUrl?: string | null;
  linkLabel?: string | null;
}

export function AnnouncementBar({ text, badge, linkUrl, linkLabel }: AnnouncementBarProps) {
  if (!text) return null;

  return (
    <div className={styles.bar} role="region" aria-label="Announcement">
      <div className={styles.inner}>
        {badge && <span className={styles.badge}>{badge}</span>}
        <span className={styles.message}>{text}</span>
        {linkUrl && linkLabel && (
          <Link href={linkUrl} className={styles.actionLink}>
            {linkLabel} →
          </Link>
        )}
      </div>
    </div>
  );
}
