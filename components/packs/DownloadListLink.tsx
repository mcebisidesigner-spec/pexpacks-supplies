"use client";

import { useState, type ReactNode } from "react";
import type { StationeryPdfOptions } from "@/lib/pdf/generateStationeryPdf";
import styles from "./DownloadListLink.module.css";

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
    <div className={styles.wrapper}>
      <button
        type="button"
        className={[styles.link, className].filter(Boolean).join(" ")}
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
            className={styles.spinner}
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
        <div className={styles.emailCapture}>
          <form onSubmit={handleEmailSubmit} className={styles.emailForm}>
            <p className={styles.emailPrompt}>
              Get notified when this list is updated:
            </p>
            <input
              type="email"
              placeholder="Your email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.emailInput}
              autoFocus
            />
            <div className={styles.emailActions}>
              <button type="submit" className={styles.emailSubmit}>
                {email.trim() ? "Save & Download" : "Download PDF"}
              </button>
              <button
                type="button"
                className={styles.emailSkip}
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
