"use client";

import React from "react";
import styles from "./QuickMetricsGrid.module.css";

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

function MiniSparkline({
  tone = "emerald",
  direction = "up",
}: {
  tone?: MetricTone;
  direction?: "up" | "down" | "neutral";
}) {
  const { stroke, fill } = TONE_COLORS[tone] || TONE_COLORS.emerald;

  // Render varied smooth bezier curves based on trend direction
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
    <div className={styles.sparklineWrap}>
      <svg
        viewBox="0 0 72 24"
        className={styles.sparklineSvg}
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

export function QuickMetricsGrid({ metrics, className }: QuickMetricsGridProps) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div className={`${styles.grid} ${className || ""}`}>
      {metrics.map((item, idx) => {
        const tone = item.tone || "emerald";
        const toneClass =
          tone === "emerald"
            ? styles.iconSlotEmerald
            : tone === "cyan"
            ? styles.iconSlotCyan
            : tone === "blue"
            ? styles.iconSlotBlue
            : tone === "amber"
            ? styles.iconSlotAmber
            : tone === "red"
            ? styles.iconSlotRed
            : tone === "purple"
            ? styles.iconSlotPurple
            : styles.iconSlotSlate;

        const trendClass =
          tone === "emerald"
            ? styles.trendEmerald
            : tone === "cyan"
            ? styles.trendCyan
            : tone === "blue"
            ? styles.trendBlue
            : tone === "amber"
            ? styles.trendAmber
            : tone === "red"
            ? styles.trendRed
            : tone === "purple"
            ? styles.trendPurple
            : styles.trendSlate;

        const formattedVal =
          typeof item.value === "number"
            ? item.value.toLocaleString("en-US")
            : item.value;

        return (
          <div key={`${item.label}-${idx}`} className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.cardLabel}>{item.label}</span>
              {item.icon && (
                <div className={`${styles.iconSlot} ${toneClass}`}>
                  {item.icon}
                </div>
              )}
            </div>

            <div className={styles.cardValue}>{formattedVal}</div>

            <div className={styles.cardBottom}>
              {(item.trend || item.subtitle) && (
                <span className={`${styles.trendText} ${trendClass}`}>
                  {item.trendDirection === "up" && "↗ "}
                  {item.trendDirection === "down" && "↘ "}
                  {item.trend || item.subtitle}
                </span>
              )}

              <MiniSparkline
                tone={tone}
                direction={item.trendDirection || (tone === "red" ? "down" : "up")}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
