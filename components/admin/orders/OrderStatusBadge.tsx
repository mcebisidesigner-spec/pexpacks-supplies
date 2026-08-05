import { orderStatusLabel, orderStatusTone } from "@/lib/admin/order-constants";
import styles from "./order-badge.module.css";

const TONE_CLASS: Record<string, string> = {
  paid: styles.tonePaid,
  pending: styles.tonePending,
  info: styles.toneInfo,
  danger: styles.toneDanger,
  muted: styles.toneMuted,
};

export function OrderStatusBadge({ status }: { status: string | null }) {
  const tone = orderStatusTone(status);
  return (
    <span className={`${styles.badge} ${TONE_CLASS[tone] ?? styles.toneMuted}`}>
      <span className={styles.dot} aria-hidden="true" />
      {orderStatusLabel(status)}
    </span>
  );
}
