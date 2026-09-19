"use client";

import { useState, type ReactNode } from "react";
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
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [email, setEmail] = useState("");

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
      setShowEmailCapture(false);
    }
  }

  function handleClick() {
    if (isGenerating) return;
    // Show email capture first time, then generate
    setShowEmailCapture(true);
  }

  function handleSkip() {
    void generatePdf();
  }

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Save email for future re-engagement (localStorage for now)
    if (email.trim()) {
      try {
        const existing = JSON.parse(
          localStorage.getItem("Pexpacks:list-emails") || "[]"
        ) as string[];
        if (!existing.includes(email.trim())) {
          existing.push(email.trim());
          localStorage.setItem(
            "Pexpacks:list-emails",
            JSON.stringify(existing)
          );
        }
      } catch {
        // ignore
      }
    }
    void generatePdf();
  }

  return (
    <div className="relative">
      <button
        type="button"
        className={[
          "inline-flex items-center justify-center gap-[6px] w-fit min-h-10",
          "p-0 border-0 bg-transparent font-inherit",
          "text-[var(--pex-text-muted)] text-[var(--text-2xs)] font-bold leading-none",
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
        onClick={handleClick}
        disabled={isGenerating}
        aria-label={
          isGenerating
            ? "Generating PDF..."
            : `Download ${pdfOptions.schoolName} ${pdfOptions.grade} stationery list as PDF`
        }
      >
        {isGenerating ? (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="motion-safe:animate-spin motion-reduce:animate-none"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        )}
        <span>{isGenerating ? "Generating..." : children}</span>
      </button>

      {/* Strategy 4.3: Email capture overlay */}
      {showEmailCapture && !isGenerating && (
        <div
          className={[
            "absolute left-0 bottom-[calc(100%+8px)] z-10",
            "min-w-[280px] p-[var(--space-4)]",
            "rounded-[var(--radius-card)] bg-[var(--card-bg)] border-[var(--card-border)]",
            "[box-shadow:var(--card-shadow-hover)]",
            "animate-[fadeUp_200ms_ease]",
            "motion-reduce:animate-none",
            "max-md:min-w-[240px] max-md:right-0",
          ].join(" ")}
          style={{ border: "var(--card-border)" }}
        >
          <form
            onSubmit={handleEmailSubmit}
            className="flex flex-col gap-[10px]"
          >
            <p className="m-0 text-[var(--text-2xs)] font-bold text-[var(--color-text-strong)]">
              Get notified when this list is updated:
            </p>
            <input
              id="download-list-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Your email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-[var(--space-3)] py-[var(--space-2)] border border-[rgba(26,42,64,0.15)] rounded-[var(--radius-xs)] text-[var(--text-2xs)] outline-none transition-[border-color] duration-150 ease focus:border-[var(--pex-keppel)]"
              autoFocus
            />
            <div className="flex gap-[var(--space-2)]">
              <button
                type="submit"
                className="flex-1 px-[14px] py-[var(--space-2)] border-0 rounded-full bg-[var(--color-brand-teal)] text-[var(--color-surface)] text-[var(--text-2xs)] font-bold cursor-pointer transition-[var(--button-transition)] hover:brightness-110 hover:[transform:var(--button-hover-transform)] hover:[box-shadow:var(--button-hover-shadow)] hover:bg-[var(--color-brand-navy)]"
              >
                {email.trim() ? "Save & Download" : "Download PDF"}
              </button>
              <button
                type="button"
                className="px-[var(--space-3)] py-[var(--space-2)] border border-[rgba(26,42,64,0.12)] rounded-full bg-transparent text-[var(--pex-text-muted)] text-[var(--text-2xs)] cursor-pointer transition-[var(--interactive-transition)] hover:text-[var(--pex-primary)] hover:brightness-110 hover:[transform:var(--button-hover-transform)] hover:[box-shadow:var(--button-hover-shadow)]"
                onClick={handleSkip}
              >
                Skip
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
