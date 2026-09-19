import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { orderStatusLabel, orderStatusTone } from "@/lib/admin/order-constants";
import { cn } from "@/lib/utils";

export const orderStatusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold leading-relaxed whitespace-nowrap border",
  {
    variants: {
      tone: {
        paid: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25",
        pending: "bg-amber-500/12 text-amber-400 border-amber-500/25",
        info: "bg-sky-500/12 text-sky-400 border-sky-500/25",
        danger: "bg-rose-500/12 text-rose-400 border-rose-500/25",
        muted: "bg-slate-800 text-slate-400 border-slate-700",
      },
    },
    defaultVariants: {
      tone: "muted",
    },
  },
);

export type OrderStatusTone = NonNullable<
  VariantProps<typeof orderStatusBadgeVariants>["tone"]
>;

export interface OrderStatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof orderStatusBadgeVariants> {
  status: string | null;
  className?: string;
}

export function OrderStatusBadge({
  status,
  className,
  ...props
}: OrderStatusBadgeProps) {
  const tone = (orderStatusTone(status) || "muted") as OrderStatusTone;
  return (
    <span
      className={cn(orderStatusBadgeVariants({ tone }), className)}
      {...props}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
      {orderStatusLabel(status)}
    </span>
  );
}
