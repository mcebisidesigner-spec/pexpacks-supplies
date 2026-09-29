"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Download, LoaderCircle } from "lucide-react";
import type { StationeryPdfOptions } from "@/lib/pdf/generateStationeryPdf";

type DownloadListLinkProps = {
  children?: ReactNode;
  className?: string;
  /** PDF options - when provided, clicking generates a PDF */
  pdfOptions: StationeryPdfOptions;
};

export function DownloadListLink({
  children = "Download List",
  className = "",
  pdfOptions,
}: DownloadListLinkProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (isGenerating) {
      event.preventDefault();
      return;
    }

    setIsGenerating(true);
    window.setTimeout(() => setIsGenerating(false), 2500);
  }

  return (
    <form
      method="post"
      action="/api/packs/download-list"
      className="relative inline-flex"
      onSubmit={handleSubmit}
    >
      <input
        type="hidden"
        name="payload"
        value={JSON.stringify(pdfOptions)}
      />
      <button
        type="submit"
        className={[
          "inline-flex items-center justify-center gap-[6px] w-fit min-h-10",
          "p-0 border-0 bg-transparent font-inherit",
          "text-[14px] text-pex-muted font-medium leading-none",
          "underline underline-offset-[3px]",
          "cursor-pointer transition-colors",
          "hover:text-pex-keppel",
          "disabled:opacity-65 disabled:cursor-wait",
          "focus-visible:outline-2 focus-visible:outline-pex-coral focus-visible:outline-offset-4 focus-visible:text-pex-navy",
          "motion-reduce:transition-none",
          "max-md:min-h-11",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
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
    </form>
  );
}
