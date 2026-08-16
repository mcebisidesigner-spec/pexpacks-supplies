export type OrderStatusTone = "paid" | "pending" | "info" | "danger" | "muted";

export interface OrderStatusDef {
  value: string;
  label: string;
  tone: OrderStatusTone;
}

export const ORDER_STATUSES: OrderStatusDef[] = [
  { value: "pending_payment", label: "Pending payment", tone: "pending" },
  { value: "pending", label: "New enquiry", tone: "info" },
  { value: "paid", label: "Paid", tone: "paid" },
  { value: "payment_failed", label: "Payment failed", tone: "danger" },
  { value: "layby_active", label: "Happy Pay active", tone: "info" },
  { value: "packing", label: "Packing", tone: "info" },
  { value: "delivered", label: "Delivered", tone: "paid" },
  { value: "cancelled", label: "Cancelled", tone: "muted" },
  { value: "refunded", label: "Refunded", tone: "danger" },
];

export const ORDER_STATUS_LABELS: Record<string, string> = Object.fromEntries(
  ORDER_STATUSES.map((s) => [s.value, s.label])
);

export const ORDER_STATUS_TONES: Record<string, OrderStatusTone> = Object.fromEntries(
  ORDER_STATUSES.map((s) => [s.value, s.tone])
);

export function orderStatusLabel(status: string | null | undefined): string {
  if (!status) return "Unknown";
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function orderStatusTone(status: string | null | undefined): OrderStatusTone {
  if (!status) return "muted";
  return ORDER_STATUS_TONES[status] ?? "muted";
}

export const PAYMENT_GATEWAY_LABELS: Record<string, string> = {
  ozow: "Ozow",
  happypay: "Happy Pay",
  bank: "Bank transfer",
  manual: "Manual",
  cash: "Cash",
};
