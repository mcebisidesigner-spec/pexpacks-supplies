import styles from "../../app/admin/admin.module.css";

type StatusBadgeProps = {
  status: string;
  label?: string;
};

const STATUS_TONE_MAP: Record<string, string> = {
  // Paid/completed
  paid: "Paid",
  delivered: "Paid",
  complete: "Paid",
  completed: "Paid",
  active: "Paid",
  official: "Paid",
  // Pending
  pending: "Pending",
  pending_payment: "Pending",
  scheduled: "Pending",
  // Info
  packing: "Info",
  not_ready: "Info",
  dispatched: "Info",
  in_transit: "Info",
  processing: "Info",
  new: "Info",
  // Danger
  cancelled: "Danger",
  refunded: "Danger",
  payment_failed: "Danger",
  failed: "Danger",
  declined: "Danger",
  // Muted
  inactive: "Muted",
  hidden: "Muted",
  draft: "Muted",
  open: "Info",
  partially_secured: "Info",
  secured: "Paid",
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const tone = STATUS_TONE_MAP[status] ?? "Muted";
  const toneClass =
    tone === "Paid"
      ? styles.badgePaid
      : tone === "Pending"
        ? styles.badgePending
        : tone === "Info"
          ? styles.badgeInfo
          : tone === "Danger"
            ? styles.badgeDanger
            : styles.badgeMuted;

  return (
    <span className={`${styles.badge} ${toneClass}`}>
      {label ?? status.replace(/_/g, " ")}
    </span>
  );
}
