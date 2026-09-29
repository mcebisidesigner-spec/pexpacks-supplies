import { NextRequest, NextResponse } from "next/server";
import {
  generateStationeryPdfBuffer,
  type StationeryListItem,
  type StationeryPdfOptions,
} from "@/lib/pdf/generateStationeryPdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ITEMS = 250;
const MAX_TEXT_LENGTH = 240;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(
  value: unknown,
  field: string,
  required = true,
): string | undefined {
  if (value === undefined || value === null || value === "") {
    if (required) throw new Error(`${field} is required`);
    return undefined;
  }

  if (typeof value !== "string") throw new Error(`${field} is invalid`);
  const text = value.trim();
  if (required && !text) throw new Error(`${field} is required`);
  if (text.length > MAX_TEXT_LENGTH) throw new Error(`${field} is too long`);
  return text || undefined;
}

function readOptions(value: unknown): StationeryPdfOptions {
  if (!isRecord(value)) throw new Error("Invalid PDF options");

  const itemsValue = value.items;
  if (!Array.isArray(itemsValue) || itemsValue.length > MAX_ITEMS) {
    throw new Error("The stationery list is invalid");
  }

  const items: StationeryListItem[] = itemsValue.map((item, index) => {
    if (!isRecord(item)) throw new Error(`Item ${index + 1} is invalid`);

    const quantity = item.quantity;
    if (
      !(
        (typeof quantity === "number" && Number.isFinite(quantity)) ||
        typeof quantity === "string"
      )
    ) {
      throw new Error(`Item ${index + 1} quantity is invalid`);
    }

    return {
      name: readText(item.name, `Item ${index + 1} name`) as string,
      quantity,
      description: readText(item.description, "Description", false),
      specification: readText(item.specification, "Specification", false),
    };
  });

  return {
    schoolName: readText(value.schoolName, "School name") as string,
    grade: readText(value.grade, "Grade") as string,
    items,
    estimatedPrice: readText(value.estimatedPrice, "Estimated price", false),
    fileName: readText(value.fileName, "File name", false),
    academicYear: readText(value.academicYear, "Academic year", false),
  };
}

function getFilename(options: StationeryPdfOptions) {
  const stem = (options.fileName || `${options.schoolName}-${options.grade}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  return `${stem || "pexpacks-stationery-list"}-stationery-list.pdf`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const payload = formData.get("payload");

    if (typeof payload !== "string" || payload.length > 100_000) {
      return new NextResponse("Invalid PDF request", { status: 400 });
    }

    const options = readOptions(JSON.parse(payload));
    const buffer = await generateStationeryPdfBuffer(options);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${getFilename(options)}"`,
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("[Stationery PDF Route] Error:", error);
    return new NextResponse("Unable to generate the stationery list PDF", {
      status: 400,
    });
  }
}
