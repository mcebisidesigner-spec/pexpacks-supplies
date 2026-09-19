"use client";

import type {
  CSSProperties,
  MouseEventHandler,
  ReactNode,
} from "react";
import type { PackListItem } from "./packListTypes";
import { PackPreviewList } from "./PackPreviewList";
import { cn } from "@/lib/utils";

type ArticlePackCardProps = {
  gradeLabel: string;
  bestFor: string;
  title: string;
  description: string;
  priceLabel: string;
  items: PackListItem[];
  actions: ReactNode;
  className?: string;
  style?: CSSProperties;
  tone?: "default" | "primary" | "high";
  viewCompleteAriaLabel: string;
  onViewCompleteList: MouseEventHandler<HTMLButtonElement>;
};

export function ArticlePackCard({
  gradeLabel,
  bestFor,
  title,
  description,
  priceLabel,
  items,
  actions,
  className = "",
  style,
  tone = "default",
  viewCompleteAriaLabel,
  onViewCompleteList,
}: ArticlePackCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col min-w-0 overflow-hidden border border-[#e1e7ea] rounded-[28px] sm:rounded-[30px] bg-white shadow-[0_12px_32px_rgba(26,42,64,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(26,42,64,0.12)] motion-reduce:hover:translate-y-0",
        className
      )}
      style={style}
    >
      <div
        className={cn(
          "relative overflow-hidden flex items-center justify-between min-h-[80px] h-[80px] sm:min-h-[84px] sm:h-[84px] py-3.5 px-4.5 sm:py-4 sm:px-5 bg-gradient-to-br from-[rgba(33,158,154,0.84)] to-[rgba(26,42,64,0.72)]",
          tone === "primary" && "bg-gradient-to-br from-[rgba(26,42,64,0.88)] to-[rgba(33,158,154,0.62)]",
          tone === "high" && "bg-gradient-to-br from-[rgba(21,34,56,0.92)] to-[rgba(26,42,64,0.78)]"
        )}
        aria-hidden="true"
      >
        <span className="relative z-[2] rounded-full py-1.5 px-3.5 bg-white text-[var(--pex-navy,#1a2a40)] text-[13px] font-extrabold leading-none shadow-[0_4px_12px_rgba(0,0,0,0.12)]">{gradeLabel}</span>
        <svg
          className="absolute right-3.5 sm:right-[18px] top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 text-white opacity-[0.32] pointer-events-none z-[1]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 5V3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
          <path d="M5 9a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9z" />
          <path d="M5 11h14" />
          <path d="M8 6v6" />
          <path d="M16 6v6" />
          <rect x="7.5" y="14" width="9" height="5.5" rx="1.5" />
          <path d="M5 13H3.5a1.5 1.5 0 0 0-1.5 1.5v4A1.5 1.5 0 0 0 3.5 20H5" />
          <path d="M19 13h1.5a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5H19" />
        </svg>
      </div>

      <div className="grid flex-1 gap-3 sm:gap-[13px] pt-5 px-5 pb-2.5 sm:pt-6 sm:px-5 sm:pb-3">
        <p className="m-0 text-[var(--pex-keppel,#1a7a77)] text-[11px] font-extrabold">{bestFor}</p>
        <h3 className="m-0 text-[var(--pex-primary,#1a7a77)] text-[clamp(23px,2vw,29px)] font-extrabold leading-[1.06]">{title}</h3>
        <p className="m-0 text-[var(--pex-text,#172326)] leading-[1.48]">{description}</p>
        <PackPreviewList
          items={items}
          listLabel={`${title} stationery list preview`}
          viewCompleteAriaLabel={viewCompleteAriaLabel}
          onViewCompleteList={onViewCompleteList}
        />
      </div>

      <div className="grid gap-4 mt-auto pt-3.5 px-5 pb-5.5 sm:pt-3.5 sm:px-5 sm:pb-5">
        <p className="m-0 text-[var(--pex-primary,#1a7a77)] text-[19px] font-extrabold">{priceLabel}</p>
        <div className="min-w-0 [&>*]:grid [&>*]:gap-2.5 [&>*>*]:min-w-0 [&>*>div]:!grid [&>*>div]:!grid-cols-1 [&>*>div]:!gap-2.5 [&>*>div>*]:w-full">{actions}</div>
      </div>
    </article>
  );
}

