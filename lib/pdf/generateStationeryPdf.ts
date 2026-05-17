"use client";

import { jsPDF } from "jspdf";

// ── Brand colours ──
const NAVY = "#1a2a40";
const KEPPEL = "#3fb8a0";
const CORAL = "#f47c6a";
const MUTED = "#6b7a8d";
const BORDER = "#dde3ea";

// ── A4 dimensions in mm ──
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_LEFT = 22;
const MARGIN_RIGHT = 22;
const CONTENT_W = PAGE_W - MARGIN_LEFT - MARGIN_RIGHT;

// ── Font sizes in pt ──
const FONT_HEADING = 20;
const FONT_SUBHEADING = 14;
const FONT_BODY = 14;
const FONT_SMALL = 10;
const FONT_FOOTER = 8;

// ── Checkbox dimensions ──
const CHECKBOX_SIZE = 4.5;
const CHECKBOX_RADIUS = 0.8;

export type StationeryListItem = {
  name: string;
  quantity: number | string;
  specification?: string;
};

export type StationeryPdfOptions = {
  /** School name displayed prominently on the letterhead */
  schoolName: string;
  /** Grade label, e.g. "Grade 3" */
  grade: string;
  /** Items to include on the checklist */
  items: StationeryListItem[];
  /** Optional estimated price */
  estimatedPrice?: string;
  /** Filename for the download (without .pdf) */
  fileName?: string;
  /** Base64-encoded logo image to embed */
  logoBase64?: string;
};

/**
 * Load the Pexpacks logo as a base64 PNG data URL.
 * Converts the SVG to PNG via a hidden canvas (jsPDF cannot embed SVGs).
 * Result is cached for the session.
 */
let cachedLogoBase64: string | null = null;

async function loadLogoBase64(): Promise<string | null> {
  if (cachedLogoBase64) return cachedLogoBase64;

  try {
    const response = await fetch("/images/logo.svg");
    if (!response.ok) return null;
    const svgText = await response.text();

    // Create a blob URL from the SVG text
    const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Render SVG to canvas at 2x for crisp PDF output
        const scale = 2;
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth * scale;
        canvas.height = img.naturalHeight * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(null);
          return;
        }
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
        URL.revokeObjectURL(url);
        cachedLogoBase64 = canvas.toDataURL("image/png");
        resolve(cachedLogoBase64);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      // Set dimensions to match the logo's natural size
      img.width = 438;
      img.height = 172;
      img.src = url;
    });
  } catch {
    return null;
  }
}

function drawRoundedRect(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  doc.roundedRect(x, y, w, h, r, r, "S");
}

/**
 * Generate and download a professional A4 PDF stationery checklist.
 */
export async function generateStationeryPdf(options: StationeryPdfOptions) {
  const {
    schoolName,
    grade,
    items,
    estimatedPrice,
    fileName,
  } = options;

  const logoBase64 = options.logoBase64 ?? (await loadLogoBase64());
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 18;

  // ═══════════════════════════════════════════════
  // HEADER / LETTERHEAD
  // ═══════════════════════════════════════════════

  // Accent bar at the very top
  doc.setFillColor(KEPPEL);
  doc.rect(0, 0, PAGE_W, 3.5, "F");

  // Logo
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", MARGIN_LEFT, y, 50, 20);
    } catch {
      // fallback: text logo
      doc.setFontSize(18);
      doc.setTextColor(NAVY);
      doc.setFont("helvetica", "bold");
      doc.text("Pexpacks Supplies", MARGIN_LEFT, y + 12);
    }
  } else {
    doc.setFontSize(18);
    doc.setTextColor(NAVY);
    doc.setFont("helvetica", "bold");
    doc.text("Pexpacks Supplies", MARGIN_LEFT, y + 12);
  }

  // Right-aligned contact details
  doc.setFontSize(FONT_SMALL);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(MUTED);
  const contactX = PAGE_W - MARGIN_RIGHT;
  doc.text("www.pexpacks.co.za", contactX, y + 4, { align: "right" });
  doc.text("orders@pexpacks.co.za", contactX, y + 9, { align: "right" });
  doc.text("Gauteng, South Africa", contactX, y + 14, { align: "right" });

  y += 28;

  // Divider line
  doc.setDrawColor(BORDER);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_LEFT, y, PAGE_W - MARGIN_RIGHT, y);
  y += 10;

  // ═══════════════════════════════════════════════
  // TITLE SECTION
  // ═══════════════════════════════════════════════

  // "Official Stationery List"
  doc.setFontSize(FONT_HEADING);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(NAVY);
  doc.text("Official Stationery List", MARGIN_LEFT, y);
  y += 8;

  // School name
  doc.setFontSize(FONT_SUBHEADING);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(KEPPEL);
  const schoolLines = doc.splitTextToSize(schoolName, CONTENT_W);
  doc.text(schoolLines, MARGIN_LEFT, y);
  y += schoolLines.length * 6 + 2;

  // Grade
  doc.setFontSize(FONT_SUBHEADING);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(NAVY);
  doc.text(grade, MARGIN_LEFT, y);
  y += 4;

  // Supplied by
  doc.setFontSize(FONT_SMALL);
  doc.setTextColor(MUTED);
  doc.setFont("helvetica", "italic");
  doc.text("Supplied by Pexpacks Supplies", MARGIN_LEFT, y);
  y += 8;

  // Decorative accent under title
  doc.setFillColor(CORAL);
  doc.rect(MARGIN_LEFT, y, 45, 1.2, "F");
  y += 8;

  // ═══════════════════════════════════════════════
  // TABLE HEADER
  // ═══════════════════════════════════════════════

  // Column headers
  const colCheck = MARGIN_LEFT;
  const colQty = MARGIN_LEFT + 10;
  const colItem = MARGIN_LEFT + 28;
  const colSpec = MARGIN_LEFT + 115;

  doc.setFillColor("#f4f6f8");
  doc.rect(MARGIN_LEFT - 2, y - 4.5, CONTENT_W + 4, 8, "F");

  doc.setFontSize(FONT_SMALL);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(NAVY);
  doc.text("✓", colCheck + 1.5, y, { align: "center" });
  doc.text("Qty", colQty, y);
  doc.text("Item", colItem, y);
  doc.text("Specification", colSpec, y);
  y += 7;

  // ═══════════════════════════════════════════════
  // STATIONERY ITEMS WITH CHECKBOXES
  // ═══════════════════════════════════════════════

  doc.setFontSize(FONT_BODY);

  const rowHeight = 9;
  const maxY = PAGE_H - 30; // leave room for footer

  for (let i = 0; i < items.length; i++) {
    // Check if we need a new page
    if (y + rowHeight > maxY) {
      // Footer on current page
      drawPageFooter(doc, doc.getCurrentPageInfo().pageNumber);
      doc.addPage();
      y = 20;

      // Repeat header on new page
      doc.setFillColor("#f4f6f8");
      doc.rect(MARGIN_LEFT - 2, y - 4.5, CONTENT_W + 4, 8, "F");
      doc.setFontSize(FONT_SMALL);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(NAVY);
      doc.text("✓", colCheck + 1.5, y, { align: "center" });
      doc.text("Qty", colQty, y);
      doc.text("Item", colItem, y);
      doc.text("Specification", colSpec, y);
      y += 7;
      doc.setFontSize(FONT_BODY);
    }

    const item = items[i];

    // Alternating row background
    if (i % 2 === 0) {
      doc.setFillColor("#fafbfc");
      doc.rect(MARGIN_LEFT - 2, y - 4.8, CONTENT_W + 4, rowHeight, "F");
    }

    // Checkbox
    doc.setDrawColor(NAVY);
    doc.setLineWidth(0.4);
    drawRoundedRect(
      doc,
      colCheck - 0.5,
      y - CHECKBOX_SIZE + 0.5,
      CHECKBOX_SIZE,
      CHECKBOX_SIZE,
      CHECKBOX_RADIUS
    );

    // Quantity
    doc.setFont("helvetica", "bold");
    doc.setTextColor(NAVY);
    const qty = typeof item.quantity === "number" ? `${item.quantity}x` : String(item.quantity);
    doc.text(qty, colQty, y);

    // Item name
    doc.setFont("helvetica", "normal");
    doc.setTextColor(NAVY);
    const itemName = doc.splitTextToSize(item.name, 82);
    doc.text(itemName[0], colItem, y);

    // Specification (if any)
    if (item.specification) {
      doc.setFontSize(FONT_SMALL);
      doc.setTextColor(MUTED);
      const specText = doc.splitTextToSize(item.specification, 52);
      doc.text(specText[0], colSpec, y);
      doc.setFontSize(FONT_BODY);
    }

    y += rowHeight;
  }

  // ═══════════════════════════════════════════════
  // PRICE & NOTES
  // ═══════════════════════════════════════════════

  y += 6;
  doc.setDrawColor(BORDER);
  doc.setLineWidth(0.3);
  doc.line(MARGIN_LEFT, y, PAGE_W - MARGIN_RIGHT, y);
  y += 8;

  if (estimatedPrice) {
    doc.setFontSize(FONT_SUBHEADING);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(NAVY);
    doc.text(`Estimated Pack Price: ${estimatedPrice}`, MARGIN_LEFT, y);
    y += 8;
  }

  // Notes section
  doc.setFontSize(FONT_SMALL);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(MUTED);
  doc.text(
    "Use the tick boxes above to check off items as you pack your learner's bag.",
    MARGIN_LEFT,
    y
  );
  y += 5;
  doc.text(
    "For queries or to order, visit www.pexpacks.co.za or email orders@pexpacks.co.za",
    MARGIN_LEFT,
    y
  );

  // ═══════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawPageFooter(doc, p, totalPages);
  }

  // ═══════════════════════════════════════════════
  // DOWNLOAD
  // ═══════════════════════════════════════════════

  const safeName =
    fileName ||
    `${schoolName}-${grade}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  doc.save(`${safeName}-stationery-list.pdf`);
}

function drawPageFooter(
  doc: jsPDF,
  pageNumber: number,
  totalPages?: number
) {
  const footerY = PAGE_H - 12;

  // Bottom accent bar
  doc.setFillColor(NAVY);
  doc.rect(0, PAGE_H - 5, PAGE_W, 5, "F");

  // Footer text
  doc.setFontSize(FONT_FOOTER);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(MUTED);
  doc.text(
    "Pexpacks Supplies  •  www.pexpacks.co.za  •  orders@pexpacks.co.za",
    PAGE_W / 2,
    footerY,
    { align: "center" }
  );

  if (totalPages) {
    doc.text(
      `Page ${pageNumber} of ${totalPages}`,
      PAGE_W - MARGIN_RIGHT,
      footerY,
      { align: "right" }
    );
  }
}
