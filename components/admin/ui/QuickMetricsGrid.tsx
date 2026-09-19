"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type MetricTone =
  | "emerald"
  | "cyan"
  | "blue"
  | "amber"
  | "red"
  | "purple"
  | "slate";

export interface QuickMetricItem {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  tone?: MetricTone;
  icon?: React.ReactNode;
}

export interface QuickMetricsGridProps {
  metrics: QuickMetricItem[];
  className?: string;
}

const TONE_COLORS: Record<MetricTone, { stroke: string; fill: string }> = {
  emerald: { stroke: "#10b981", fill: "rgba(16, 185, 129, 0.15)" },
  cyan: { stroke: "#0ea5e9", fill: "rgba(14, 165, 233, 0.15)" },
  blue: { stroke: "#3b82f6", fill: "rgba(59, 130, 246, 0.15)" },
  amber: { stroke: "#f59e0b", fill: "rgba(245, 158, 11, 0.15)" },
  red: { stroke: "#ef4444", fill: "rgba(239, 68, 68, 0.15)" },
  purple: { stroke: "#a855f7", fill: "rgba(168, 85, 247, 0.15)" },
  slate: { stroke: "#64748b", fill: "rgba(100, 116, 139, 0.15)" },
};

const iconToneStyles: Record<MetricTone, string> = {
  emerald: "bg-emerald-500/12 text-emerald-400 border border-emerald-500/30",
  cyan: "bg-sky-500/12 text-sky-400 border border-sky-500/30",
  blue: "bg-blue-500/12 text-blue-400 border border-blue-500/30",
  amber: "bg-amber-500/12 text-amber-400 border border-amber-500/30",
  red: "bg-red-500/12 text-red-400 border border-red-500/30",
  purple: "bg-purple-500/12 text-purple-400 border border-purple-500/30",
  slate: "bg-slate-500/12 text-slate-400 border border-slate-500/30",
};

const trendToneStyles: Record<MetricTone, string> = {
  emerald: "text-emerald-400",
  cyan: "text-sky-400",
  blue: "text-blue-400",
  amber: "text-amber-400",
  red: "text-red-400",
  purple: "text-purple-400",
  slate: "text-slate-400",
};

function MiniSparkline({
  tone = "emerald",
  direction = "up",
}: {
  tone?: MetricTone;
  direction?: "up" | "down" | "neutral";
}) {
  const { stroke } = TONE_COLORS[tone] || TONE_COLORS.emerald;

  let pathD = "M 0,18 Q 18,22 36,12 T 72,4";
  let fillD = "M 0,18 Q 18,22 36,12 T 72,4 L 72,24 L 0,24 Z";

  if (direction === "down") {
    pathD = "M 0,6 Q 18,4 36,14 T 72,20";
    fillD = "M 0,6 Q 18,4 36,14 T 72,20 L 72,24 L 0,24 Z";
  } else if (direction === "neutral") {
    pathD = "M 0,14 Q 18,18 36,10 T 72,14";
    fillD = "M 0,14 Q 18,18 36,10 T 72,14 L 72,24 L 0,24 Z";
  }

  const gradientId = `sparkline-grad-${tone}-${direction}`;

  return (
    <div className="w-[72px] h-6 shrink-0 flex items-center justify-end">
      <svg
        viewBox="0 0 72 24"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={fillD} fill={`url(#${gradientId})`} />
        <path
          d={pathD}
          stroke={stroke}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function QuickMetricsGrid({
  metrics,
  className,
}: QuickMetricsGridProps) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 w-full mb-4.5",
        className,
      )}
    >
      {metrics.map((item, idx) => {
        const tone = item.tone || "emerald";
        const toneClass = iconToneStyles[tone] || iconToneStyles.emerald;
        const trendClass = trendToneStyles[tone] || trendToneStyles.emerald;

        const formattedVal =
          typeof item.value === "number"
            ? item.value.toLocaleString("en-US")
            : item.value;

        return (
          <div
            key={`${item.label}-${idx}`}
            className="relative flex flex-col justify-between p-4 sm:p-4.5 bg-linear-to-b from-slate-900/75 to-slate-950/85 border border-slate-800/85 rounded-2xl shadow-md overflow-hidden min-h-[110px] transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-700/90 hover:shadow-lg"
          >
            <div className="flex items-center justify-between gap-2.5 mb-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                {item.label}
              </span>
              {item.icon && (
                <div
                  className={cn(
                    "inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0",
                    toneClass,
                  )}
                >
                  {item.icon}
                </div>
              )}
            </div>

            <div className="text-[26px] font-extrabold text-white tracking-tight leading-tight mb-2 tabular-nums">
              {formattedVal}
            </div>

            <div className="flex items-center justify-between gap-2">
              {(item.trend || item.subtitle) && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-[11px] font-semibold whitespace-nowrap",
                    trendClass,
                  )}
                >
                  {item.trendDirection === "up" && "↗ "}
                  {item.trendDirection === "down" && "↘ "}
                  {item.trend || item.subtitle}
                </span>
              )}

              <MiniSparkline
                tone={tone}
                direction={
                  item.trendDirection || (tone === "red" ? "down" : "up")
                }
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
