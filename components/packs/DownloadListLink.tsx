"use client";

import { useState, type ReactNode } from "react";
import { Download, LoaderCircle } from "lucide-react";
import type { StationeryPdfOptions } from "@/lib/pdf/generateStationeryPdf";

type DownloadListLinkProps = {
  children?: ReactNode;
  className?: string;
  /** PDF options — when provided, clicking generates a PDF */
  pdfOptions: StationeryPdfOptions;
};

export function DownloadListLink({
  children = "Download List",
  className = "",
  pdfOptions,
}: DownloadListLinkProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function generatePdf() {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const { generateStationeryPdf } = await import(
        "@/lib/pdf/generateStationeryPdf"
      );
      await generateStationeryPdf(pdfOptions);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        className={[
          "inline-flex items-center justify-center gap-[6px] w-fit min-h-10",
          "p-0 border-0 bg-transparent font-inherit",
          "text-[14px] text-[var(--pex-text-muted)] font-medium leading-none",
          "underline underline-offset-[3px]",
          "cursor-pointer transition-[var(--interactive-transition)]",
          "hover:text-[var(--color-brand-teal)]",
          "disabled:opacity-[0.65] disabled:cursor-wait",
          "focus-visible:outline-2 focus-visible:outline-[var(--color-brand-orange)] focus-visible:outline-offset-4 focus-visible:text-[var(--pex-primary)]",
          "motion-reduce:transition-none",
          "max-md:min-h-[var(--touch-target-min)]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => void generatePdf()}
        disabled={isGenerating}
        aria-label={
          isGenerating
            ? "Generating PDF..."
            : `Download ${pdfOptions.schoolName} ${pdfOptions.grade} stationery list as PDF`
        }
      >
        {isGenerating ? (
          <LoaderCircle
            size={14}
            strokeWidth={2.2}
            aria-hidden="true"
            className="motion-safe:animate-spin motion-reduce:animate-none"
          />
        ) : (
          <Download size={14} strokeWidth={2.2} aria-hidden="true" />
        )}
        <span>{isGenerating ? "Generating..." : children}</span>
      </button>

    </div>
  );
}
