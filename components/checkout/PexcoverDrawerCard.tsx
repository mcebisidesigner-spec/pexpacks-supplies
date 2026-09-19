"use client";

import React, { useCallback, useId, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Check, Sparkles, Shield } from "lucide-react";
import {
  PEXCOVER_PAPER_STYLES,
  type PexcoverPaperStyle,
} from "@/lib/pricing/pexcover-paper-style";

export interface PackOrderState {
  packId: string;
  learnerName: string;
  applyPexcover: boolean;
  selectedPaperStyle: PexcoverPaperStyle;
  coveringPriceCents: number;
  basePackPriceCents: number;
}

export type { PexcoverPaperStyle };

export interface PexcoverDrawerCardProps {
  packId: string;
  coverableCount: number;
  coveringPriceCents: number;
  enabled: boolean;
  selectedStyle: PexcoverPaperStyle;
  onToggle: (packId: string, enabled: boolean) => void;
  onSelectStyle: (packId: string, style: PexcoverPaperStyle) => void;
}

export interface PaperStyleOption {
  id: PexcoverPaperStyle;
  name: string;
  description: string;
  tag?: string;
  imageSrc?: string;
}

export const PEXCOVER_PAPER_OPTIONS: PaperStyleOption[] = [
  {
    id: PEXCOVER_PAPER_STYLES[0],
    name: "Standard Kraft",
    description: "Classic durable brown kraft paper with clear sleeve",
    tag: "Default",
  },
  {
    id: PEXCOVER_PAPER_STYLES[1],
    name: "Marbled & Print",
    description: "Assorted decorative print with clear sleeve",
  },
  {
    id: PEXCOVER_PAPER_STYLES[2],
    name: "Vibrant Colors",
    description: "Bold solid color paper with clear sleeve",
  },
];

/**
 * Formats integer cents into South African Rands (ZAR).
 */
function formatRandPrice(cents: number): string {
  const rands = cents / 100;
  return `R ${rands.toFixed(2)}`;
}

/**
 * High-fidelity visual mockup of each decorative paper style under a clear protective sleeve.
 */
function SwatchGraphic({ styleId }: { styleId: PexcoverPaperStyle }) {
  if (styleId === "STANDARD_KRAFT") {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #c79c6d 0%, #b88b58 100%)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "6px 8px",
          boxSizing: "border-box",
        }}
      >
        {/* Subtle Kraft paper fiber texture & exercise book ruling */}
        <div
          style={{
            position: "absolute",
            left: "14%",
            top: 0,
            bottom: 0,
            width: "2px",
            backgroundColor: "rgba(139, 90, 43, 0.4)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "10%",
            top: "15%",
            width: "55%",
            height: "14px",
            backgroundColor: "rgba(255, 255, 255, 0.35)",
            borderRadius: "3px",
            border: "1px dashed rgba(139, 90, 43, 0.4)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "3px",
            marginTop: "24px",
            opacity: 0.35,
          }}
        >
          <div
            style={{
              height: "1.5px",
              width: "70%",
              backgroundColor: "#5c3d19",
            }}
          />
          <div
            style={{
              height: "1.5px",
              width: "50%",
              backgroundColor: "#5c3d19",
            }}
          />
        </div>
      </div>
    );
  }

  if (styleId === "MARBLED_PATTERNS") {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          background:
            "linear-gradient(135deg, #0d9488 0%, #1e3a8a 50%, #f97316 100%)",
          overflow: "hidden",
        }}
      >
        {/* Decorative marbled waves pattern */}
        <svg
          viewBox="0 0 100 65"
          preserveAspectRatio="none"
          style={{ width: "100%", height: "100%", opacity: 0.65 }}
        >
          <path
            d="M0,20 C30,35 40,5 70,25 C85,35 95,15 100,20 L100,65 L0,65 Z"
            fill="rgba(255,255,255,0.3)"
          />
          <path
            d="M0,40 C25,25 45,50 75,35 C90,25 95,45 100,40 L100,65 L0,65 Z"
            fill="rgba(251,191,36,0.4)"
          />
          <path
            d="M0,10 C20,30 50,0 80,18 C92,25 98,10 100,12 L100,0 L0,0 Z"
            fill="rgba(255,255,255,0.2)"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            left: "14%",
            top: 0,
            bottom: 0,
            width: "2px",
            backgroundColor: "rgba(255, 255, 255, 0.45)",
          }}
        />
      </div>
    );
  }

  // SOLID_COLOURS
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: "1.5px",
        backgroundColor: "#ffffff",
        boxSizing: "border-box",
      }}
    >
      <div style={{ backgroundColor: "#2563eb" }} />
      <div style={{ backgroundColor: "#e11d48" }} />
      <div style={{ backgroundColor: "#f59e0b" }} />
      <div style={{ backgroundColor: "#10b981" }} />
      <div
        style={{
          position: "absolute",
          left: "14%",
          top: 0,
          bottom: 0,
          width: "2px",
          backgroundColor: "rgba(255, 255, 255, 0.5)",
        }}
      />
    </div>
  );
}

/**
 * Renders thumbnail preview using Next.js <Image /> when an image source is provided,
 * with graceful fallback to high-fidelity CSS/SVG graphic mockups.
 */
function SwatchThumbnailPreview({ option }: { option: PaperStyleOption }) {
  const [imageError, setImageError] = useState(false);

  if (option.imageSrc && !imageError) {
    return (
      <Image
        src={option.imageSrc}
        alt={option.name}
        fill
        sizes="(max-width: 380px) 90px, (max-width: 768px) 110px, 130px"
        className="object-cover w-full h-full block"
        onError={() => setImageError(true)}
      />
    );
  }

  return <SwatchGraphic styleId={option.id} />;
}

/**
 * PexcoverDrawerCard
 * Upgrades the checkout tray drawer pack item with an interactive, in-place
 * paper style selector while keeping parents inside their order tray.
 */
export function PexcoverDrawerCard({
  packId,
  coverableCount,
  coveringPriceCents,
  enabled,
  selectedStyle = "STANDARD_KRAFT",
  onToggle,
  onSelectStyle,
}: PexcoverDrawerCardProps) {
  const checkboxId = useId();
  const isDisabled = coverableCount === 0;

  const handleRowClick = useCallback(() => {
    if (isDisabled) return;
    onToggle(packId, !enabled);
  }, [isDisabled, onToggle, packId, enabled]);

  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isDisabled) return;
      onToggle(packId, e.target.checked);
    },
    [isDisabled, onToggle, packId],
  );

  const selectedOption =
    PEXCOVER_PAPER_OPTIONS.find((opt) => opt.id === selectedStyle) ||
    PEXCOVER_PAPER_OPTIONS[0];

  return (
    <div
      className={cn(
        "flex flex-col w-full rounded-xl border box-border overflow-hidden transition-all duration-200",
        enabled && !isDisabled
          ? "bg-[#EBF7F5] border-[#BBE5DE] shadow-[0_2px_10px_rgba(30,116,104,0.08)]"
          : "bg-slate-50 border-slate-200",
        isDisabled && "opacity-60 cursor-not-allowed"
      )}
      data-testid="pexcover-drawer-card"
      data-active={enabled && !isDisabled}
    >
      {/* ── Top Row Summary (Clickable Checkbox + Details + Price) ── */}
      <div
        className={cn(
          "flex items-center gap-3 px-3.5 py-2.5 select-none bg-transparent border-none w-full text-left box-border",
          isDisabled ? "cursor-not-allowed" : "cursor-pointer"
        )}
        onClick={handleRowClick}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        aria-expanded={enabled && !isDisabled}
        aria-controls={`pexcover-accordion-${packId}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleRowClick();
          }
        }}
      >
        <div
          className="relative flex items-center justify-center shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            id={checkboxId}
            type="checkbox"
            checked={enabled && !isDisabled}
            disabled={isDisabled}
            onChange={handleCheckboxChange}
            className="peer absolute opacity-0 w-5 h-5 cursor-inherit m-0 z-[1]"
            aria-label="Add Book Covering by Pexcover"
          />
          <div
            className={cn(
              "w-5 h-5 rounded-[5px] border border-slate-300 bg-white flex items-center justify-center transition-all duration-180 text-white peer-focus-visible:outline-2 peer-focus-visible:outline-pex-keppel peer-focus-visible:outline-offset-2",
              enabled && !isDisabled && "bg-pex-keppel border-pex-keppel shadow-[0_2px_6px_rgba(30,116,104,0.35)]"
            )}
            aria-hidden="true"
          >
            {enabled && !isDisabled && <Check size={13} strokeWidth={3} />}
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="m-0 text-[13px] font-bold text-slate-900 leading-snug tracking-tight">Pexcover</span>
            <span className="inline-flex items-center px-1.5 py-px rounded-full bg-pex-keppel/10 text-pex-keppel text-[10px] font-bold uppercase tracking-wider">Done-For-You</span>
          </div>
          <span className="m-0 text-[11.5px] text-slate-500 leading-snug">
            {isDisabled
              ? "No coverable books in this pack"
              : `${coverableCount} book${coverableCount === 1 ? "" : "s"} covered with protective wrap`}
          </span>
        </div>

        <div
          className={cn(
            "text-[13.5px] font-extrabold whitespace-nowrap tracking-tight",
            isDisabled ? "text-slate-400 font-semibold" : "text-pex-keppel"
          )}
        >
          {isDisabled ? "—" : formatRandPrice(coveringPriceCents)}
        </div>
      </div>

      {/* ── Expandable Accordion Drawer (Directly beneath top row) ── */}
      <div
        id={`pexcover-accordion-${packId}`}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-250 ease-out",
          enabled && !isDisabled ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
        aria-hidden={!enabled || isDisabled}
      >
        <div className="overflow-hidden flex flex-col">
          <div className="px-3.5 pb-3.5 pt-1 flex flex-col gap-2.5 border-t border-dashed border-pex-keppel/25">
            {/* Guidance Bar */}
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-pex-keppel flex items-center gap-1">
                <Sparkles size={11} strokeWidth={2.5} />
                Decorative Paper Style
              </span>
              <span className="text-[10.5px] text-slate-500 flex items-center gap-1">
                <Shield size={11} /> Clear sleeve included
              </span>
            </div>

            {/* 3-Column Swatch Grid */}
            <div
              className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full box-border"
              role="radiogroup"
              aria-label="Pexcover Paper Style Options"
            >
              {PEXCOVER_PAPER_OPTIONS.map((opt) => {
                const isSelected = selectedStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={enabled && !isDisabled ? 0 : -1}
                    className={cn(
                      "relative flex flex-col items-center p-1.5 pb-2 sm:p-2 border rounded-xl bg-white cursor-pointer transition-all text-center select-none outline-none font-inherit box-border hover:border-pex-keppel/40 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-pex-keppel focus-visible:outline-offset-2",
                      isSelected
                        ? "border-pex-keppel ring-2 ring-pex-keppel/25 shadow-sm"
                        : "border-slate-200"
                    )}
                    onClick={() => onSelectStyle(packId, opt.id)}
                    title={opt.description}
                  >
                    {/* Fixed Height Swatch Thumbnail with Protective Sleeve Sheen */}
                    <div className="relative w-full h-[54px] sm:h-[62px] rounded-lg overflow-hidden flex items-center justify-center box-border after:content-[''] after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-br after:from-white/45 after:via-white/15 after:to-black/10 after:pointer-events-none after:z-[1] after:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]">
                      <SwatchThumbnailPreview option={opt} />
                      {isSelected ? (
                        <div
                          className="absolute top-1.5 right-1.5 w-[18px] h-[18px] rounded-full bg-pex-keppel border border-pex-keppel text-white text-[10.5px] font-black flex items-center justify-center shadow-md z-[3] animate-[popIn_0.18s_ease-out]"
                          aria-label="Selected style"
                        >
                          ✓
                        </div>
                      ) : (
                        <div
                          className="absolute top-1.5 right-1.5 w-[18px] h-[18px] rounded-full bg-white/90 border border-slate-400 shadow-sm transition-all z-[3]"
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    <p className="m-0 mt-1.5 text-[10px] sm:text-[11px] font-bold text-slate-900 leading-tight">{opt.name}</p>
                    <p className="m-0 mt-0.5 text-[8.5px] sm:text-[9px] text-slate-500 leading-tight line-clamp-2">{opt.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Selection Confirmation Pill */}
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-pex-keppel/10 rounded-md text-[10.5px] text-pex-keppel-dark font-medium">
              <span className="flex items-center gap-1">
                Selected:{" "}
                <span className="font-bold">
                  {selectedOption.name}
                </span>
              </span>
              <span>Protective clear sleeve fitted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
