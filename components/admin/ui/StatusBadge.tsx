import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  toneForStatus,
  type StatusTone,
} from "@/lib/admin/status";
import { cn } from "@/lib/utils";

export const statusBadgeVariants = cva(
  "inline-flex items-center gap-2 rounded-full font-semibold leading-tight capitalize tracking-wide whitespace-nowrap border box-border",
  {
    variants: {
      tone: {
        emerald:
          "bg-[#062420]/80 text-[#00dfb6] border-[#00dfb6]/35 shadow-[0_0_10px_rgba(0,223,182,0.08)]",
        teal: "bg-[#062420]/80 text-[#00dfb6] border-[#00dfb6]/35 shadow-[0_0_10px_rgba(0,223,182,0.08)]",
        blue: "bg-[#0c1f38]/80 text-[#38bdf8] border-[#38bdf8]/35",
        amber:
          "bg-[#291e0a]/80 text-[#fbbf24] border-[#fbbf24]/35",
        red: "bg-[#2b1014]/80 text-[#f87171] border-[#f87171]/35",
        slate:
          "bg-[#131d2e]/80 text-slate-300 border-slate-700/60",
        purple:
          "bg-[#25103a]/80 text-[#c084fc] border-[#c084fc]/35",
      },
      size: {
        sm: "px-2.5 py-0.5 text-[11px]",
        md: "px-3 py-1 text-xs",
        lg: "px-3.5 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      tone: "slate",
      size: "md",
    },
  },
);

export type BadgeTone = StatusTone;

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: string;
  label?: string;
  tone?: BadgeTone;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  label,
  tone,
  size = "md",
  showDot = false,
  className,
  ...props
}: StatusBadgeProps) {
  const selectedTone = toneForStatus(status, tone);
  const displayLabel = label || status.replace(/_/g, " ");

  return (
    <span
      className={cn(
        statusBadgeVariants({
          tone: selectedTone as NonNullable<
            VariantProps<typeof statusBadgeVariants>["tone"]
          >,
          size,
        }),
        className,
      )}
      {...props}
    >
      {showDot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor] shrink-0" />
      )}
      {displayLabel}
    </span>
  );
}
