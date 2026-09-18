import { orderStatusLabel, orderStatusTone } from "@/lib/admin/order-constants";
import { cn } from "@/lib/utils";

const TONE_CLASS: Record<string, string> = {
  paid: "bg-emerald-500/12 text-emerald-400 border border-emerald-500/25",
  pending: "bg-amber-500/12 text-amber-400 border border-amber-500/25",
  info: "bg-sky-500/12 text-sky-400 border border-sky-500/25",
  danger: "bg-rose-500/12 text-rose-400 border border-rose-500/25",
  muted: "bg-slate-800 text-slate-400 border border-slate-700",
};

export function OrderStatusBadge({ status }: { status: string | null }) {
  const tone = orderStatusTone(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold leading-relaxed whitespace-nowrap",
        TONE_CLASS[tone] ?? TONE_CLASS.muted,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
      {orderStatusLabel(status)}
    </span>
  );
}
