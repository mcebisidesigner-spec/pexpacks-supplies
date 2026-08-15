import type { jsPDF } from "jspdf";

// ── Brand colours (matching Pexpacks design system & sample screenshot) ──
const NAVY = "#0f172a";
const KEPPEL = "#23b4b0";
const CORAL = "#ff6b52";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";
const HEADER_BG = "#f4f6f8";
const ROW_ALT_BG = "#fafbfc";

// ── A4 dimensions in mm ──
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_LEFT = 20;
const MARGIN_RIGHT = 20;
const CONTENT_W = PAGE_W - MARGIN_LEFT - MARGIN_RIGHT;

// ── Font sizes in pt ──
const FONT_BODY = 13;
const FONT_SMALL = 9.5;
const FONT_FOOTER = 8;

// ── Checkbox dimensions (matching sample screenshot) ──
const CHECKBOX_SIZE = 5.5;
const CHECKBOX_RADIUS = 1.2;

// ── Row / column layout ──
const ROW_HEIGHT = 11;
const COL_CHECK = MARGIN_LEFT;
const COL_QTY = MARGIN_LEFT + 12;
const COL_ITEM = MARGIN_LEFT + 34;
const COL_SPEC = MARGIN_LEFT + 115;

type StationeryListItem = {
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
// Render title text in exact Grota Sans / Grota Sans Alt typography
// via High-Resolution Canvas → embedded in PDF
// ═══════════════════════════════════════════════

async function renderBrandedTitleBlock(
  schoolName: string
): Promise<{ base64: string; width: number; height: number } | null> {
  try {
    await document.fonts.ready;

    const fontSize = 48; // px
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Use Grota Sans / Alt typography matching the Pexpacks design system
    const fontString = `800 ${fontSize}px "Grota Sans Alt", "Grota Sans", "PexSans Alt", "PexSans", -apple-system, sans-serif`;
    ctx.font = fontString;

    const line1 = schoolName.toUpperCase().trim();
    const line2 = "STATIONERY LIST";

    const m1 = ctx.measureText(line1);
    const m2 = ctx.measureText(line2);
    const maxTextWidth = Math.max(m1.width, m2.width) + 12;
    const lineHeight = fontSize * 1.18;
    const totalHeight = lineHeight * 2 + 8;

    const scale = 3; // 3x scaling for ultra-sharp vector-like rendering in PDF
    canvas.width = Math.ceil(maxTextWidth * scale);
    canvas.height = Math.ceil(totalHeight * scale);
    ctx.scale(scale, scale);

    ctx.font = fontString;
    ctx.fillStyle = NAVY;
    ctx.textBaseline = "top";

    ctx.fillText(line1, 0, 0);
    ctx.fillText(line2, 0, lineHeight);

    const base64 = canvas.toDataURL("image/png");

    // Convert dimensions from px (at 96 dpi) to mm for jsPDF
    const widthMm = (maxTextWidth / 96) * 25.4;
    const heightMm = (totalHeight / 96) * 25.4;

    return { base64, width: widthMm, height: heightMm };
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
  doc.setFillColor(HEADER_BG);
  doc.rect(MARGIN_LEFT - 2, y - 5, CONTENT_W + 4, 9, "F");

  doc.setFontSize(FONT_SMALL);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(NAVY);
  doc.text("Tick", COL_CHECK, y);
  doc.text("Qty", COL_QTY, y);
  doc.text("Item", COL_ITEM, y);
  doc.text("Description", COL_SPEC, y);
}

// ═══════════════════════════════════════════════
// Main PDF generator
// ═══════════════════════════════════════════════

export async function generateStationeryPdf(options: StationeryPdfOptions) {
  const { schoolName, grade, items, estimatedPrice, fileName } = options;

  const [logoBase64, titleBlock] = await Promise.all([
    options.logoBase64 ? Promise.resolve(options.logoBase64) : loadLogoBase64(),
    renderBrandedTitleBlock(schoolName),
  ]);

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 16;

  // ═══════════════════════════════════════════════
  // TOP ACCENT BAR
  // ═══════════════════════════════════════════════

  doc.setFillColor(KEPPEL);
  doc.rect(0, 0, PAGE_W, 3.5, "F");

  // ═══════════════════════════════════════════════
  // HEADER / LETTERHEAD
  // ═══════════════════════════════════════════════

  // Logo (Left side)
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", MARGIN_LEFT, y, 48, 19);
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

  // Right-aligned contact details (exact match to sample screenshot)
  doc.setFontSize(FONT_SMALL);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(MUTED);
  const contactX = PAGE_W - MARGIN_RIGHT;
  doc.text("www.pexpacks.co.za", contactX, y + 3, { align: "right" });
  doc.text("orders@pexpacks.co.za", contactX, y + 8, { align: "right" });
  doc.text("078 003 6048", contactX, y + 13, { align: "right" });
  doc.text("Gauteng, South Africa", contactX, y + 18, { align: "right" });

  y += 28;

  // Divider line
  doc.setDrawColor(BORDER);
  doc.setLineWidth(0.4);
  doc.line(MARGIN_LEFT, y, PAGE_W - MARGIN_RIGHT, y);
  y += 12;

  // ═══════════════════════════════════════════════
  // TITLE: "{SCHOOL NAME} STATIONERY LIST" in Grota Sans
  // ═══════════════════════════════════════════════

  if (titleBlock) {
    try {
      const maxW = Math.min(CONTENT_W, 165);
      const scaleFactor = Math.min(1, maxW / titleBlock.width);
      const displayW = titleBlock.width * scaleFactor;
      const displayH = titleBlock.height * scaleFactor;

      doc.addImage(titleBlock.base64, "PNG", MARGIN_LEFT, y - 2, displayW, displayH);
      y += displayH + 4;
    } catch {
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(NAVY);
      doc.text(`${schoolName.toUpperCase()} STATIONERY LIST`, MARGIN_LEFT, y);
      y += 10;
    }
  } else {
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(NAVY);
    const titleLines = doc.splitTextToSize(
      `${schoolName.toUpperCase()}\nSTATIONERY LIST`,
      CONTENT_W
    );
    doc.text(titleLines, MARGIN_LEFT, y);
    y += titleLines.length * 7 + 2;
  }

  // Grade Subtitle
  doc.setFontSize(FONT_BODY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(NAVY);
  doc.text(grade, MARGIN_LEFT, y);
  y += 5;

  // Coral accent bar under title (exact match to sample screenshot)
  doc.setFillColor(CORAL);
  doc.rect(MARGIN_LEFT, y, 45, 1.8, "F");
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
  const maxY = PAGE_H - 35;

  for (let i = 0; i < items.length; i++) {
    // Page overflow handling
    if (y + ROW_HEIGHT > maxY) {
      drawPageFooter(doc, doc.getCurrentPageInfo().pageNumber);
      doc.addPage();
      y = 20;
      drawTableHeader(doc, y);
      y += 9;
      doc.setFontSize(FONT_BODY);
    }

    const item = items[i];

    // Alternating row background shading
    if (i % 2 === 0) {
      doc.setFillColor(ROW_ALT_BG);
      doc.rect(MARGIN_LEFT - 2, y - 5.5, CONTENT_W + 4, ROW_HEIGHT, "F");
    }

    // Rounded square checkbox
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

    // Quantity (Bold e.g. 15x)
    doc.setFont("helvetica", "bold");
    doc.setTextColor(NAVY);
    const qty =
      typeof item.quantity === "number"
        ? `${item.quantity}x`
        : String(item.quantity);
    doc.text(qty, COL_QTY, y);

    // Item name
    doc.setFont("helvetica", "bold");
    doc.setTextColor(NAVY);
    const itemName = doc.splitTextToSize(item.name, 78);
    doc.text(itemName[0], COL_ITEM, y);

    // Specification (soft muted text)
    if (item.specification) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(FONT_SMALL);
      doc.setTextColor(MUTED);
      const specText = doc.splitTextToSize(item.specification, 55);
      doc.text(specText[0], COL_SPEC, y);
      doc.setFontSize(FONT_BODY);
    }

    y += ROW_HEIGHT;
  }

  // ═══════════════════════════════════════════════
  // PRICE & NOTES SECTION
  // ═══════════════════════════════════════════════

  y += 6;
  doc.setDrawColor(BORDER);
  doc.setLineWidth(0.4);
  doc.line(MARGIN_LEFT, y, PAGE_W - MARGIN_RIGHT, y);
  y += 12;

  // Estimated Pack Price (bold Navy + Coral Price with Coral underline)
  if (estimatedPrice) {
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(NAVY);
    doc.text("Estimated Pack Price: ", MARGIN_LEFT, y);

    const priceLabelWidth = doc.getTextWidth("Estimated Pack Price: ");
    const priceX = MARGIN_LEFT + priceLabelWidth;

    doc.setFontSize(18);
    doc.setTextColor(CORAL);
    doc.text(estimatedPrice, priceX, y);

    const priceWidth = doc.getTextWidth(estimatedPrice);
    doc.setFillColor(CORAL);
    doc.rect(priceX, y + 1.5, priceWidth, 1.2, "F");

    y += 12;
  }

  // Microcopy Notes (exact match to sample screenshot)
  doc.setFontSize(FONT_SMALL);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(MUTED);
  doc.text(
    "Use the tick boxes above to check off items as you evaluate your learner's bag.",
    MARGIN_LEFT,
    y
  );
  y += 5;
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
  const footerY = PAGE_H - 10;

  // Solid dark navy bottom bar
  doc.setFillColor(NAVY);
  doc.rect(0, PAGE_H - 5, PAGE_W, 5, "F");

  // Footer text
  doc.setFontSize(FONT_FOOTER);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(MUTED);
  doc.text(
    "Pexpacks Supplies  •  www.pexpacks.co.za  •  orders@pexpacks.co.za  •  078 003 6048",
    MARGIN_LEFT,
    footerY
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
