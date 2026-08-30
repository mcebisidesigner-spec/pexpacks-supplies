import React from "react";
// @react-pdf/renderer and StationeryListPdfDocument are loaded lazily inside
// each function — they are only needed when a PDF is actually generated.
export type {
  StationeryPdfOptions,
  StationeryListItem,
} from "@/components/pdf/StationeryListPdfDocument";

/**
 * Generates and downloads the Stationery List PDF in standard A4 format using @react-pdf/renderer
 */
export async function generateStationeryPdf(
  options: import("@/components/pdf/StationeryListPdfDocument").StationeryPdfOptions
): Promise<void> {
  const { schoolName, grade, fileName } = options;

  const safeName =
    fileName ||
    `${schoolName}-${grade}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const defaultFilename = `${safeName}-stationery-list.pdf`;

  // Lazy-load heavy PDF dependencies only when user actually requests a download
  const [{ pdf }, { StationeryListPdfDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/pdf/StationeryListPdfDocument"),
  ]);

  // Render PDF blob via @react-pdf/renderer
  const element = React.createElement(StationeryListPdfDocument, {
    options,
  }) as NonNullable<Parameters<typeof pdf>[0]>;
  const pdfBlob = await pdf(element).toBlob();

  // 1. Try modern File System Access API if available
  if (typeof window !== "undefined" && "showSaveFilePicker" in window) {
    try {
      const handle = await (window as unknown as {
        showSaveFilePicker: (opts: unknown) => Promise<{
          createWritable: () => Promise<{
            write: (data: unknown) => Promise<void>;
            close: () => Promise<void>;
          }>;
        }>;
      }).showSaveFilePicker({
        suggestedName: defaultFilename,
        types: [
          {
            description: "PDF Document",
            accept: {
              "application/pdf": [".pdf"],
            },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(pdfBlob);
      await writable.close();
      return;
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "name" in err &&
        err.name === "AbortError"
      ) {
        return;
      }
      console.warn("showSaveFilePicker failed, falling back to anchor download", err);
    }
  }

  // 2. Standard anchor download fallback
  if (typeof window !== "undefined") {
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = defaultFilename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  }
}

/**
 * Server-side buffer generator for stationery list PDF
 */
export async function generateStationeryPdfBuffer(
  options: import("@/components/pdf/StationeryListPdfDocument").StationeryPdfOptions
): Promise<Buffer> {
  const [{ pdf }, { StationeryListPdfDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/pdf/StationeryListPdfDocument"),
  ]);
  const element = React.createElement(StationeryListPdfDocument, {
    options,
  }) as NonNullable<Parameters<typeof pdf>[0]>;
  const blob = await pdf(element).toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

