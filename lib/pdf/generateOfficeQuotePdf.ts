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
const FONT_BODY = 13;
const FONT_SMALL = 10;
const FONT_FOOTER = 8;

// ── Row / column layout ──
const ROW_HEIGHT = 11;
const COL_QTY = MARGIN_LEFT;
const COL_ITEM = MARGIN_LEFT + 15;
const COL_SPEC = MARGIN_LEFT + 95;

export type OfficeQuotePdfOptions = {
  packName: string;
  items: string[];
  itemBrandDetails: Record<string, string>;
  estimatedPrice?: string;
  fileName?: string;
};

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

async function renderBrandedTitle(text: string): Promise<string | null> {
  try {
    await document.fonts.ready;
    const fontSize = 48;
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

    ctx.font = `bold ${fontSize}px "PexSans Alt", "PexSans", sans-serif`;
    ctx.fillStyle = NAVY;
    ctx.textBaseline = "top";
    ctx.fillText(text, 0, fontSize * 0.1);

    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

function drawTableHeader(doc: jsPDF, y: number) {
  doc.setFillColor("#f4f6f8");
  doc.rect(MARGIN_LEFT - 2, y - 5, CONTENT_W + 4, 9, "F");

  doc.setFontSize(FONT_SMALL);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(NAVY);
  doc.text("Qty", COL_QTY, y);
  doc.text("Item", COL_ITEM, y);
  doc.text("Specification / Brand Details", COL_SPEC, y);
}

export async function generateOfficeQuotePdf(options: OfficeQuotePdfOptions) {
  const { packName, items, itemBrandDetails, estimatedPrice, fileName } = options;

  const [logoBase64, titleImage] = await Promise.all([
    loadLogoBase64(),
    renderBrandedTitle("STATIONERY QUOTE DRAFT"),
  ]);

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 18;

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

  // Right-aligned contact details
  doc.setFontSize(FONT_SMALL);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(MUTED);
  const contactX = PAGE_W - MARGIN_RIGHT;
  doc.text("www.Pexpacks.co.za", contactX, y + 4, { align: "right" });
  doc.text("orders@Pexpacks.co.za", contactX, y + 9, { align: "right" });
  doc.text("078 003 6048", contactX, y + 14, { align: "right" });
  doc.text("Gauteng, South Africa", contactX, y + 19, { align: "right" });

  y += 30;

  // Divider line
  doc.setDrawColor(BORDER);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_LEFT, y, PAGE_W - MARGIN_RIGHT, y);
  y += 12;

  // Title
  if (titleImage) {
    try {
      const titleImg = new Image();
      titleImg.src = titleImage;
      const aspectRatio = titleImg.naturalHeight / titleImg.naturalWidth;
      const imgWidth = Math.min(CONTENT_W, 140);
      const imgHeight = imgWidth * aspectRatio;
      doc.addImage(titleImage, "PNG", MARGIN_LEFT, y - 4, imgWidth, imgHeight);
      y += imgHeight + 4;
    } catch {
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(NAVY);
      doc.text("STATIONERY QUOTE DRAFT", MARGIN_LEFT, y);
      y += 10;
    }
  } else {
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(NAVY);
    doc.text("STATIONERY QUOTE DRAFT", MARGIN_LEFT, y);
    y += 10;
  }

  // Pack Name
  doc.setFontSize(FONT_BODY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(NAVY);
  doc.text(`Selected Pack: ${packName}`, MARGIN_LEFT, y);
  y += 6;

  // Decorative accent under title
  doc.setFillColor(CORAL);
  doc.rect(MARGIN_LEFT, y, 45, 1.2, "F");
  y += 10;

  // Table Header
  drawTableHeader(doc, y);
  y += 9;

  // Items
  doc.setFontSize(FONT_BODY);
  const maxY = PAGE_H - 30;

  for (let i = 0; i < items.length; i++) {
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

    // Quantity (defaulting to 1x)
    doc.setFont("helvetica", "bold");
    doc.setTextColor(NAVY);
    doc.text("1x", COL_QTY, y);

    // Item name
    doc.setFont("helvetica", "normal");
    doc.setTextColor(NAVY);
    const itemName = doc.splitTextToSize(item, 75);
    doc.text(itemName[0], COL_ITEM, y);

    // Specification/Brand
    const spec = itemBrandDetails[item] || "Standard supply basics";
    doc.setFontSize(FONT_SMALL);
    doc.setTextColor(MUTED);
    const specText = doc.splitTextToSize(spec, 85);
    doc.text(specText[0], COL_SPEC, y);
    doc.setFontSize(FONT_BODY);

    y += ROW_HEIGHT;
  }

  // Divider
  y += 8;
  doc.setDrawColor(BORDER);
  doc.setLineWidth(0.3);
  doc.line(MARGIN_LEFT, y, PAGE_W - MARGIN_RIGHT, y);
  y += 10;

  if (estimatedPrice) {
    doc.setFontSize(FONT_BODY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(NAVY);
    doc.text(`Estimated Price: ${estimatedPrice}`, MARGIN_LEFT, y);
    y += 10;
  }

  // Notes
  doc.setFontSize(FONT_SMALL);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(MUTED);
  doc.text(
    "Please note: This is a customized quotation draft stored on your local machine.",
    MARGIN_LEFT,
    y
  );
  y += 6;
  doc.text(
    "For queries or to order, visit www.Pexpacks.co.za or call 078 003 6048",
    MARGIN_LEFT,
    y
  );

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawPageFooter(doc, p, totalPages);
  }

  const safeName =
    fileName ||
    `${packName}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const defaultFilename = `${safeName}-quote-draft.pdf`;

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
    "Pexpacks Supplies  •  www.Pexpacks.co.za  •  orders@Pexpacks.co.za  •  078 003 6048",
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
