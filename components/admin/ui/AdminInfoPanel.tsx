import React, { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Info, AlertTriangle, CheckCircle2, AlertOctagon, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const adminInfoPanelVariants = cva(
  "flex items-start gap-3.5 p-4 rounded-xl border transition-colors relative shadow-xs",
  {
    variants: {
      tone: {
        info: "bg-blue-950/30 border-blue-900/50",
        warning: "bg-amber-950/30 border-amber-900/50",
        success: "bg-emerald-950/30 border-emerald-900/50",
        danger: "bg-rose-950/30 border-rose-900/50",
        neutral:
          "bg-[var(--db-surface-inner,#090e17)] border-[var(--db-border,#1e293b)]",
      },
    },
    defaultVariants: {
      tone: "info",
    },
  },
);

export const adminInfoPanelIconVariants = cva("shrink-0 mt-0.5", {
  variants: {
    tone: {
      info: "text-blue-400",
      warning: "text-amber-400",
      success: "text-emerald-400",
      danger: "text-rose-400",
      neutral: "text-[var(--db-text-subtle,#64748b)]",
    },
  },
  defaultVariants: {
    tone: "info",
  },
});

export type AdminInfoPanelTone = NonNullable<
  VariantProps<typeof adminInfoPanelVariants>["tone"]
>;

export interface AdminInfoPanelProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof adminInfoPanelVariants> {
  tone?: AdminInfoPanelTone;
  title?: ReactNode;
  children: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const defaultIcons: Record<AdminInfoPanelTone, ReactNode> = {
  info: <Info size={18} aria-hidden="true" />,
  warning: <AlertTriangle size={18} aria-hidden="true" />,
  success: <CheckCircle2 size={18} aria-hidden="true" />,
  danger: <AlertOctagon size={18} aria-hidden="true" />,
  neutral: <Info size={18} aria-hidden="true" />,
};

const titleColors: Record<AdminInfoPanelTone, string> = {
  info: "text-blue-100",
  warning: "text-amber-100",
  success: "text-emerald-100",
  danger: "text-rose-100",
  neutral: "text-[var(--db-text-primary,#f8fafc)]",
};

const bodyColors: Record<AdminInfoPanelTone, string> = {
  info: "text-blue-200/80",
  warning: "text-amber-200/80",
  success: "text-emerald-200/80",
  danger: "text-rose-200/80",
  neutral: "text-[var(--db-text-muted,#94a3b8)]",
};

/**
 * Contextual information banner or callout panel with semantic tones.
 */
export function AdminInfoPanel({
  tone = "info",
  title,
  children,
  icon,
  action,
  onDismiss,
  className,
  ...props
}: AdminInfoPanelProps) {
  return (
    <div
      className={cn(adminInfoPanelVariants({ tone }), className)}
      role="region"
      {...props}
    >
      <div className={cn(adminInfoPanelIconVariants({ tone }))}>
        {icon || defaultIcons[tone]}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {title && (
          <h4
            className={cn(
              "text-xs sm:text-sm font-bold tracking-tight m-0",
              titleColors[tone],
            )}
          >
            {title}
          </h4>
        )}
        <div className={cn("text-xs leading-relaxed", bodyColors[tone])}>
          {children}
        </div>
        {action && <div className="mt-2">{action}</div>}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-md text-[var(--db-text-subtle,#64748b)] hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Dismiss banner"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
