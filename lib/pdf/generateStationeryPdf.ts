import type { jsPDF } from "jspdf";

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
const FONT_BODY = 14;
const FONT_SMALL = 10;
const FONT_FOOTER = 8;

// ── Checkbox dimensions (larger for easy ticking on paper) ──
const CHECKBOX_SIZE = 5.5;
const CHECKBOX_RADIUS = 1;

// ── Row / column layout ──
const ROW_HEIGHT = 11; // increased vertical gap between items
const COL_CHECK = MARGIN_LEFT;
const COL_QTY = MARGIN_LEFT + 12;
const COL_ITEM = MARGIN_LEFT + 30;
const COL_SPEC = MARGIN_LEFT + 118;

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

// ═══════════════════════════════════════════════
// Logo loader — SVG → PNG via canvas (cached)
// ═══════════════════════════════════════════════

let cachedLogoBase64: string | null = null;

async function loadLogoBase64(): Promise<string | null> {
  if (cachedLogoBase64) return cachedLogoBase64;

  try {
    const response = await fetch("/images/logo.svg");
    if (!response.ok) return null;
    const svgText = await response.text();

    const svgBlob = new Blob([svgText], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
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
      img.width = 438;
      img.height = 172;
      img.src = url;
    });
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════
// Render branded title text using PexSans (Grota Sans)
// via Canvas → embed as image in PDF
// ═══════════════════════════════════════════════

async function renderBrandedTitle(text: string): Promise<string | null> {
  try {
    // Ensure the PexSans font is loaded before rendering
    await document.fonts.ready;

    const fontSize = 52; // px — renders large for crisp downscaling
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.font = `bold ${fontSize}px "PexSans Alt", "PexSans", sans-serif`;
    const metrics = ctx.measureText(text);
    const textWidth = Math.ceil(metrics.width) + 4;
    const textHeight = Math.ceil(fontSize * 1.3);

    canvas.width = textWidth * 2;
    canvas.height = textHeight * 2;
    ctx.scale(2, 2);

    // Re-set font after resize
    ctx.font = `bold ${fontSize}px "PexSans Alt", "PexSans", sans-serif`;
    ctx.fillStyle = NAVY;
    ctx.textBaseline = "top";
    ctx.fillText(text, 0, fontSize * 0.1);

    return canvas.toDataURL("image/png");
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

function drawTableHeader(doc: jsPDF, y: number) {
  doc.setFillColor("#f4f6f8");
  doc.rect(MARGIN_LEFT - 2, y - 5, CONTENT_W + 4, 9, "F");

  doc.setFontSize(FONT_SMALL);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(NAVY);
  doc.text("Tick", COL_CHECK, y);
  doc.text("Qty", COL_QTY, y);
  doc.text("Item", COL_ITEM, y);
  doc.text("Specification", COL_SPEC, y);
}

// ═══════════════════════════════════════════════
// Main PDF generator
// ═══════════════════════════════════════════════

export async function generateStationeryPdf(options: StationeryPdfOptions) {
  const { schoolName, grade, items, estimatedPrice, fileName } = options;

  const [logoBase64, titleImage] = await Promise.all([
    options.logoBase64 ? Promise.resolve(options.logoBase64) : loadLogoBase64(),
    renderBrandedTitle(`${schoolName.toUpperCase()} STATIONERY LIST`),
  ]);

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 18;

  // ═══════════════════════════════════════════════
  // HEADER / LETTERHEAD
  // ═══════════════════════════════════════════════

  // Top accent bar
  doc.setFillColor(KEPPEL);
  doc.rect(0, 0, PAGE_W, 3.5, "F");

  // Logo
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", MARGIN_LEFT, y, 50, 20);
    } catch {
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

  // Right-aligned contact details (including phone number)
  doc.setFontSize(FONT_SMALL);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(MUTED);
  const contactX = PAGE_W - MARGIN_RIGHT;
  doc.text("www.pexpacks.co.za", contactX, y + 4, { align: "right" });
  doc.text("orders@pexpacks.co.za", contactX, y + 9, { align: "right" });
  doc.text("078 003 6048", contactX, y + 14, { align: "right" });
  doc.text("Gauteng, South Africa", contactX, y + 19, { align: "right" });

  y += 30;

  // Divider line
  doc.setDrawColor(BORDER);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_LEFT, y, PAGE_W - MARGIN_RIGHT, y);
  y += 12;

  // ═══════════════════════════════════════════════
  // TITLE: "{SCHOOL NAME} STATIONERY LIST" in Grota Sans
  // ═══════════════════════════════════════════════

  if (titleImage) {
    try {
      // Calculate image dimensions to fit within content width
      const titleImg = new Image();
      titleImg.src = titleImage;
      const aspectRatio = titleImg.naturalHeight / titleImg.naturalWidth;
      const imgWidth = Math.min(CONTENT_W, 160);
      const imgHeight = imgWidth * aspectRatio;
      doc.addImage(titleImage, "PNG", MARGIN_LEFT, y - 4, imgWidth, imgHeight);
      y += imgHeight + 4;
    } catch {
      // Fallback to helvetica if canvas rendering failed
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(NAVY);
      doc.text(
        `${schoolName.toUpperCase()} STATIONERY LIST`,
        MARGIN_LEFT,
        y
      );
      y += 10;
    }
  } else {
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(NAVY);
    const titleLines = doc.splitTextToSize(
      `${schoolName.toUpperCase()} STATIONERY LIST`,
      CONTENT_W
    );
    doc.text(titleLines, MARGIN_LEFT, y);
    y += titleLines.length * 8 + 2;
  }

  // Grade (bold)
  doc.setFontSize(FONT_BODY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(NAVY);
  doc.text(grade, MARGIN_LEFT, y);
  y += 6;

  // Decorative accent under title
  doc.setFillColor(CORAL);
  doc.rect(MARGIN_LEFT, y, 45, 1.2, "F");
  y += 10;

  // ═══════════════════════════════════════════════
  // TABLE HEADER
  // ═══════════════════════════════════════════════

  drawTableHeader(doc, y);
  y += 9;

  // ═══════════════════════════════════════════════
  // STATIONERY ITEMS WITH CHECKBOXES
  // ═══════════════════════════════════════════════

  doc.setFontSize(FONT_BODY);
  const maxY = PAGE_H - 30;

  for (let i = 0; i < items.length; i++) {
    // New page if needed
    if (y + ROW_HEIGHT > maxY) {
      drawPageFooter(doc, doc.getCurrentPageInfo().pageNumber);
      doc.addPage();
      y = 20;
      drawTableHeader(doc, y);
      y += 9;
      doc.setFontSize(FONT_BODY);
    }

    const item = items[i];

    // Alternating row background
    if (i % 2 === 0) {
      doc.setFillColor("#fafbfc");
      doc.rect(MARGIN_LEFT - 2, y - 5.5, CONTENT_W + 4, ROW_HEIGHT, "F");
    }

    // Checkbox (bigger)
    doc.setDrawColor(NAVY);
    doc.setLineWidth(0.45);
    drawRoundedRect(
      doc,
      COL_CHECK,
      y - CHECKBOX_SIZE + 0.8,
      CHECKBOX_SIZE,
      CHECKBOX_SIZE,
      CHECKBOX_RADIUS
    );

    // Quantity
    doc.setFont("helvetica", "bold");
    doc.setTextColor(NAVY);
    const qty =
      typeof item.quantity === "number"
        ? `${item.quantity}x`
        : String(item.quantity);
    doc.text(qty, COL_QTY, y);

    // Item name
    doc.setFont("helvetica", "normal");
    doc.setTextColor(NAVY);
    const itemName = doc.splitTextToSize(item.name, 82);
    doc.text(itemName[0], COL_ITEM, y);

    // Specification
    if (item.specification) {
      doc.setFontSize(FONT_SMALL);
      doc.setTextColor(MUTED);
      const specText = doc.splitTextToSize(item.specification, 48);
      doc.text(specText[0], COL_SPEC, y);
      doc.setFontSize(FONT_BODY);
    }

    y += ROW_HEIGHT;
  }

  // ═══════════════════════════════════════════════
  // PRICE & NOTES
  // ═══════════════════════════════════════════════

  y += 8;
  doc.setDrawColor(BORDER);
  doc.setLineWidth(0.3);
  doc.line(MARGIN_LEFT, y, PAGE_W - MARGIN_RIGHT, y);
  y += 10;

  if (estimatedPrice) {
    doc.setFontSize(FONT_BODY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(NAVY);
    doc.text(`Estimated Pack Price: ${estimatedPrice}`, MARGIN_LEFT, y);
    y += 10;
  }

  // Notes
  doc.setFontSize(FONT_SMALL);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(MUTED);
  doc.text(
    "Use the tick boxes above to check off items as you pack your learner's bag.",
    MARGIN_LEFT,
    y
  );
  y += 6;
  doc.text(
    "For queries or to order, visit www.Pexpacks.co.za or call 078 003 6048",
    MARGIN_LEFT,
    y
  );

  // ═══════════════════════════════════════════════
  // FOOTER (all pages)
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

  const defaultFilename = `${safeName}-stationery-list.pdf`;

  if (typeof window !== "undefined" && "showSaveFilePicker" in window) {
    try {
      const handle = await (window as unknown as {
        showSaveFilePicker: (options: unknown) => Promise<{
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
      const pdfBlob = doc.output("blob");
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
      console.warn("showSaveFilePicker failed, falling back to auto download", err);
    }
  }

  doc.save(defaultFilename);
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
    "Pexpacks Supplies  •  www.pexpacks.co.za  •  orders@pexpacks.co.za  •  078 003 6048",
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
