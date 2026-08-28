export type StatusTone = "emerald" | "amber" | "red" | "blue" | "teal" | "slate" | "purple";

export const STATUS_TONE_ORDER: StatusTone[] = [
  "emerald",
  "amber",
  "red",
  "blue",
  "teal",
  "slate",
  "purple",
];

export const defaultTone: StatusTone = "slate";

const STATUS_TO_TONE: Record<string, StatusTone> = {
  // Emerald (Success, Complete, Paid, Active, Published, Preferred, Ready, Secured)
  paid: "emerald",
  delivered: "emerald",
  complete: "emerald",
  completed: "emerald",
  active: "emerald",
  official: "emerald",
  published: "emerald",
  secured: "emerald",
  fully_secured: "emerald",
  preferred: "emerald",
  approved: "emerald",
  low: "emerald",
  good: "emerald",
  ready: "emerald",
  in_stock: "emerald",
  available: "emerald",
  live: "emerald",
  enabled: "emerald",
  healthy: "emerald",
  verified: "emerald",
  operational: "emerald",

  // Amber (Pending, Awaiting, Review, Partial, Attention)
  pending: "amber",
  pending_payment: "amber",
  scheduled: "amber",
  review: "amber",
  needs_review: "amber",
  needs_work: "amber",
  partially_secured: "amber",
  part_paid: "amber",
  awaiting: "amber",
  awaiting_payment: "amber",
  partial: "amber",
  medium: "amber",
  normal: "amber",
  prospect: "amber",
  partially_received: "amber",
  substituted: "amber",
  invited: "amber",
  not_verified: "amber",

  // Red (Failed, Blocked, Cancel, Overdue, At Risk, Urgent)
  cancelled: "red",
  canceled: "red",
  refunded: "red",
  payment_failed: "red",
  failed: "red",
  declined: "red",
  blocked: "red",
  overdue: "red",
  urgent: "red",
  high: "red",
  at_risk: "red",
  refused: "red",
  discontinued: "red",
  low_stock: "red",
  out_of_stock: "red",
  banned: "red",
  closed: "red",

  // Blue (Info, Processing, In Progress, Draft operational)
  packing: "blue",
  ready_to_pack: "blue",
  not_ready: "blue",
  dispatched: "blue",
  in_transit: "blue",
  processing: "blue",
  procurement: "blue",
  new: "blue",
  in_progress: "blue",
  open: "blue",
  ordered: "blue",
  received: "blue",

  // Teal (Operational/in-transition nuance)
  shipped: "teal",
  ready_for_dispatch: "teal",
  on_hold: "teal",

  // Slate (Neutral, Inactive, Archived, Disabled, Draft static)
  inactive: "slate",
  hidden: "slate",
  draft: "slate",
  archived: "slate",
  disabled: "slate",
  na: "slate",
  none: "slate",

  // Purple (special operations/planning accent)
  planned: "purple",
  forecasting: "purple",
  quoted: "purple",
};

export function toneForStatus(status: string | undefined | null, override?: StatusTone): StatusTone {
  if (override) return override;
  if (!status) return defaultTone;
  const key = status.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return STATUS_TO_TONE[key] ?? defaultTone;
}

export function isStatusTone(value: string): value is StatusTone {
  return STATUS_TONE_ORDER.includes(value as StatusTone);
}
