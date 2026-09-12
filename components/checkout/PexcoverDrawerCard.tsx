"use client";

import React, { useCallback, useId, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { Check, Sparkles, Shield } from "lucide-react";
import {
  PEXCOVER_PAPER_STYLES,
  type PexcoverPaperStyle,
} from "@/lib/pricing/pexcover-paper-style";
import styles from "./PexcoverDrawerCard.module.css";

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
        className={styles.swatchImage}
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
      className={clsx(
        styles.card,
        enabled && !isDisabled && styles.cardActive,
        isDisabled && styles.cardDisabled,
      )}
      data-testid="pexcover-drawer-card"
      data-active={enabled && !isDisabled}
    >
      {/* ── Top Row Summary (Clickable Checkbox + Details + Price) ── */}
      <div
        className={clsx(styles.topRow, isDisabled && styles.topRowDisabled)}
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
          className={styles.checkboxWrapper}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            id={checkboxId}
            type="checkbox"
            checked={enabled && !isDisabled}
            disabled={isDisabled}
            onChange={handleCheckboxChange}
            className={styles.nativeCheckbox}
            aria-label="Add Book Covering by Pexcover"
          />
          <div
            className={clsx(
              styles.customCheckbox,
              enabled && !isDisabled && styles.customCheckboxChecked,
            )}
            aria-hidden="true"
          >
            {enabled && !isDisabled && <Check size={13} strokeWidth={3} />}
          </div>
        </div>

        <div className={styles.serviceDetails}>
          <div className={styles.serviceHeaderRow}>
            <span className={styles.serviceTitle}>
              Book Covering by Pexcover
            </span>
            <span className={styles.brandBadge}>Pexcover™</span>
          </div>
          <span className={styles.serviceSubtitle}>
            {isDisabled
              ? "No coverable books in this pack"
              : `${coverableCount} book${coverableCount === 1 ? "" : "s"} covered with protective wrap`}
          </span>
        </div>

        <div
          className={clsx(
            styles.priceTag,
            isDisabled && styles.priceTagDisabled,
          )}
        >
          {isDisabled ? "—" : formatRandPrice(coveringPriceCents)}
        </div>
      </div>

      {/* ── Expandable Accordion Drawer (Directly beneath top row) ── */}
      <div
        id={`pexcover-accordion-${packId}`}
        className={clsx(
          styles.accordion,
          enabled && !isDisabled && styles.accordionOpen,
        )}
        aria-hidden={!enabled || isDisabled}
      >
        <div className={styles.accordionContent}>
          <div className={styles.accordionBody}>
            {/* Guidance Bar */}
            <div className={styles.selectorGuidance}>
              <span className={styles.selectorLabel}>
                <Sparkles size={11} strokeWidth={2.5} />
                Decorative Paper Style
              </span>
              <span className={styles.selectorNote}>
                <Shield size={11} /> Clear sleeve included
              </span>
            </div>

            {/* 3-Column Swatch Grid */}
            <div
              className={styles.swatchGrid}
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
                    className={clsx(
                      styles.swatchCard,
                      isSelected && styles.swatchCardSelected,
                    )}
                    onClick={() => onSelectStyle(packId, opt.id)}
                    title={opt.description}
                  >
                    {/* Fixed Height Swatch Thumbnail with Protective Sleeve Sheen */}
                    <div className={styles.swatchThumbnail}>
                      <SwatchThumbnailPreview option={opt} />
                      {isSelected && (
                        <div
                          className={styles.checkmarkBadge}
                          aria-label="Selected style"
                        >
                          ✓
                        </div>
                      )}
                    </div>

                    <p className={styles.swatchTitle}>{opt.name}</p>
                    <p className={styles.swatchDesc}>{opt.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Selection Confirmation Pill */}
            <div className={styles.selectionPill}>
              <span className={styles.selectionPillText}>
                Selected:{" "}
                <span className={styles.selectionPillName}>
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
