import type { ReactNode } from "react";
import styles from "./Order.module.css";

type ReviewBlockProps = {
  title: string;
  children: ReactNode;
  onEdit?: () => void;
};

export function ReviewBlock({ title, children, onEdit }: ReviewBlockProps) {
  return (
    <section className={styles.reviewBlock}>
      <div>
        <p>{title}</p>
        {children}
      </div>
      {onEdit ? (
        <button type="button" onClick={onEdit}>
          Edit
        </button>
      ) : null}
    </section>
  );
}
