"use client";

import { useState, useTransition } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import styles from "@/app/admin/content/reorder.module.css";

export type ReorderItem = {
  id: string;
  label: string;
  visible: boolean;
};

export function ReorderPanel({
  title,
  subtitle,
  items,
  onReorder,
}: {
  title: string;
  subtitle: string;
  items: ReorderItem[];
  onReorder: (id: string, direction: "up" | "down") => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [moving, setMoving] = useState<{ id: string; direction: "up" | "down" } | null>(null);

  function handleReorder(id: string, direction: "up" | "down") {
    if (moving) return;
    setMoving({ id, direction });
    startTransition(async () => {
      try {
        await onReorder(id, direction);
      } finally {
        setMoving(null);
      }
    });
  }

  return (
    <aside className={styles.panel} aria-label="Reorder content">
      <div className={styles.panelHeader}>
        <div className={styles.panelIcon}>
          <ChevronUp size={16} />
          <ChevronDown size={16} />
        </div>
        <div>
          <h2 className={styles.panelTitle}>{title}</h2>
          <p className={styles.panelSubtitle}>{subtitle}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>Nothing to order yet.</p>
      ) : (
        <ol className={styles.list}>
          {items.map((item, index) => {
            const atTop = index === 0;
            const atBottom = index === items.length - 1;
            const isBusy = moving?.id === item.id;
            return (
              <li key={item.id} className={styles.item}>
                <span className={styles.position}>{index + 1}</span>
                <div className={styles.itemMeta}>
                  <span className={styles.itemLabel} title={item.label}>
                    {item.label}
                  </span>
                  <span
                    className={`${styles.visibility} ${
                      item.visible ? styles.visibilityLive : styles.visibilityHidden
                    }`}
                  >
                    {item.visible ? "Live" : "Hidden"}
                  </span>
                </div>
                <div className={styles.arrows}>
                  <button
                    type="button"
                    className={styles.arrowButton}
                    onClick={() => handleReorder(item.id, "up")}
                    disabled={atTop || isPending || moving !== null}
                    aria-label={`Move up ${item.label}`}
                    aria-disabled={atTop || isPending}
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    className={styles.arrowButton}
                    onClick={() => handleReorder(item.id, "down")}
                    disabled={atBottom || isPending || moving !== null}
                    aria-label={`Move down ${item.label}`}
                    aria-disabled={atBottom || isPending}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
                {isBusy ? <span className={styles.busy} aria-live="polite" /> : null}
              </li>
            );
          })}
        </ol>
      )}
    </aside>
  );
}
