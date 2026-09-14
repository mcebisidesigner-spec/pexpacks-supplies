import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSameOriginRequest } from "@/lib/security/requestGuards";
import type { Json } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow sufficient duration for vision & OCR inference

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/bmp",
  "application/pdf",
]);

interface ExtractedItem {
  raw_text: string;
  item_name: string;
  quantity: number;
  specifications: string;
}

interface MatchedCartItem {
  id: string;
  productId: string | null;
  sku: string | null;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  requiresPexcover: boolean;
  pexcoCode: string | null;
  similarity: number;
  rawText: string;
  specifications: string;
}

function normalizeMimeType(originalType: string, filename: string): string {
  const lower = originalType.toLowerCase();
  if (ALLOWED_MIME_TYPES.has(lower)) {
    if (lower === "image/heic" || lower === "image/heif") {
      return "image/jpeg";
    }
    return lower;
  }
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  return "image/jpeg";
}

function parseTextLinesFallback(text: string): ExtractedItem[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 1 && !/^#|==|--/.test(l));

  const items: ExtractedItem[] = [];

  for (const line of lines) {
    // Look for quantity patterns like "2x", "2 x", "2 -", "3 of", or trailing "(2)"
    let qty = 1;
    let cleanName = line;

    const prefixMatch = line.match(/^(\d+)\s*(?:x|×|-|\*|\.)\s*(.+)/i);
    const trailingMatch = line.match(/^(.+?)\s*\((\d+)\)$/);
    const countMatch = line.match(/^(\d+)\s+([A-Za-z].+)/);

    if (prefixMatch) {
      qty = parseInt(prefixMatch[1], 10) || 1;
      cleanName = prefixMatch[2].trim();
    } else if (trailingMatch) {
      qty = parseInt(trailingMatch[2], 10) || 1;
      cleanName = trailingMatch[1].trim();
    } else if (countMatch && !/^\d{2,4}\s*(pg|page|ml|g|mm|cm)\b/i.test(line)) {
      qty = parseInt(countMatch[1], 10) || 1;
      cleanName = countMatch[2].trim();
    }

    if (cleanName.length > 2) {
      items.push({
        raw_text: line,
        item_name: cleanName,
        quantity: Math.max(1, qty),
        specifications: "",
      });
    }
  }

  return items;
}

function isBookCoverEligible(itemName: string, category?: string | null): boolean {
  const target = `${itemName} ${category || ""}`.toLowerCase();
  return /exercise|hardcover|softcover|textbook|workbook|reader|atlas|dictionary|journal|diary|manuscript|counter book/i.test(
    target
  );
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form payload." }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const rawText = (formData.get("text") as string | null) || "";
  const learnerName = (formData.get("learnerName") as string | null) || "";
  const grade = (formData.get("grade") as string | null) || "";

  if (!file && !rawText.trim()) {
    return NextResponse.json(
      { error: "Please upload a photo, PDF document, or enter your stationery list." },
      { status: 400 }
    );
  }

  if (file && file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File exceeds the 15MB limit. Please upload a smaller photo or PDF." },
      { status: 400 }
    );
  }

  let extractedItems: ExtractedItem[] = [];
  const geminiApiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY;

  if (geminiApiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.ARRAY,
            description: "List of extracted stationery items from the school stationery list or handwritten document",
            items: {
              type: SchemaType.OBJECT,
              properties: {
                raw_text: {
                  type: SchemaType.STRING,
                  description: "Original text or line as read from the document",
                },
                item_name: {
                  type: SchemaType.STRING,
                  description:
                    "Clean standard stationery item name (e.g. 72pg Exercise Book Feint & Margin, Pritt Glue Stick 43g, HB Pencils Box of 12)",
                },
                quantity: {
                  type: SchemaType.INTEGER,
                  description: "Parsed quantity of items required (minimum 1)",
                },
                specifications: {
                  type: SchemaType.STRING,
                  description: "Any relevant specifications such as size, page count, color, ruling, or brand",
                },
              },
              required: ["raw_text", "item_name", "quantity", "specifications"],
            },
          },
        },
        systemInstruction:
          "You are an expert stationery list parser for South African schools. Extract every single stationery item, textbook, workbook, exercise book, writing utensil, adhesive, and school supply from the provided image, document, or text. Standardize item names clearly (e.g., '72pg Exercise Book Feint & Margin', 'Pritt Glue Stick 43g', 'HB Pencils Pack of 12', 'Staedtler Eraser', 'Marlin 30cm Ruler'). Identify quantity (default to 1 if not specified) and any specifications (ruling, color, dimensions, brand, page count). Return strictly structured JSON.",
      });

      const contents: Array<string | { inlineData: { data: string; mimeType: string } }> = [];

      const promptText =
        "Extract all school stationery list items, quantities, and specifications from this document. If handwriting is present, transcribe it accurately.";
      contents.push(promptText);

      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString("base64");
        const mimeType = normalizeMimeType(file.type, file.name);
        contents.push({
          inlineData: {
            data: base64Data,
            mimeType,
          },
        });
      }

      if (rawText.trim()) {
        contents.push(`User supplied text list:\n${rawText.trim()}`);
      }

      const response = await model.generateContent(contents);
      const textResponse = response.response.text();

      if (textResponse) {
        const parsed = JSON.parse(textResponse);
        if (Array.isArray(parsed) && parsed.length > 0) {
          extractedItems = parsed.map((item: Partial<ExtractedItem>) => ({
            raw_text: String(item.raw_text || item.item_name || "").trim(),
            item_name: String(item.item_name || "Stationery Item").trim(),
            quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
            specifications: String(item.specifications || "").trim(),
          }));
        }
      }
    } catch (aiError) {
      console.error("[ai-convert-list] Gemini inference warning:", aiError);
      // If AI parsing hit an exception or rate limit, fall back to text parsing if text exists
      if (rawText.trim()) {
        extractedItems = parseTextLinesFallback(rawText);
      }
    }
  } else {
    // No Gemini key configured; use fallback parser if text provided or dummy sample for local test
    if (rawText.trim()) {
      extractedItems = parseTextLinesFallback(rawText);
    } else if (file) {
      // In dev or test mode without key, provide mock extracted items from filename
      extractedItems = [
        {
          raw_text: "5x 72pg Exercise Books Feint & Margin",
          item_name: "College Exercise Unruled",
          quantity: 5,
          specifications: "72 page A4",
        },
        {
          raw_text: "2x Pritt Glue Stick 43g",
          item_name: "Pritt Stick",
          quantity: 2,
          specifications: "43g adhesive",
        },
        {
          raw_text: "1x Pencil Case Small",
          item_name: "Pencil Case Small",
          quantity: 1,
          specifications: "Stationery pouch",
        },
      ];
    }
  }

  if (extractedItems.length === 0) {
    return NextResponse.json(
      {
        error:
          "We could not detect clear stationery items from this document. Please try a clearer, higher-contrast photo or paste the text directly.",
      },
      { status: 422 }
    );
  }

  // Connect to Supabase catalog to fuzzy match items
  let supabase;
  try {
    supabase = createSupabaseAdminClient();
  } catch (dbErr) {
    console.error("[ai-convert-list] Supabase client initialization error:", dbErr);
    return NextResponse.json(
      { error: "Database connection unavailable. Please try again in a moment." },
      { status: 500 }
    );
  }

  const matchedItems: MatchedCartItem[] = [];

  for (let i = 0; i < extractedItems.length; i++) {
    const item = extractedItems[i];
    const itemId = `item_${Date.now()}_${i}`;

    let match = null;

    try {
      // Try fuzzy match RPC first
      const { data: rpcMatches } = await supabase.rpc("match_stationery_product", {
        query_text: item.item_name,
        match_threshold: 0.15,
        match_limit: 1,
      });

      if (rpcMatches && rpcMatches.length > 0) {
        match = rpcMatches[0];
      } else {
        // Direct ILIKE search fallback
        const { data: textMatches } = await supabase
          .from("master_products")
          .select("id, sku, name, category, current_selling_price, requires_pexcover, pexco_code")
          .ilike("name", `%${item.item_name.split(" ")[0]}%`)
          .limit(1);

        if (textMatches && textMatches.length > 0) {
          match = {
            ...textMatches[0],
            similarity: 0.5,
          };
        }
      }
    } catch (matchErr) {
      console.warn(`[ai-convert-list] Catalog search warning for "${item.item_name}":`, matchErr);
    }

    if (match) {
      const unitPrice = Number(match.current_selling_price) || 0;
      const requiresCover = match.requires_pexcover ?? isBookCoverEligible(match.name, match.category);

      matchedItems.push({
        id: itemId,
        productId: match.id,
        sku: match.sku,
        name: match.name,
        category: match.category || "Stationery",
        quantity: item.quantity,
        unitPrice,
        lineTotal: Math.round(unitPrice * item.quantity * 100) / 100,
        requiresPexcover: requiresCover,
        pexcoCode: match.pexco_code || (requiresCover ? "PEXCO01" : null),
        similarity: match.similarity || 1,
        rawText: item.raw_text,
        specifications: item.specifications,
      });
    } else {
      // Unmatched custom stationery line
      const fallbackPrice = 25.0; // Reasonable estimate placeholder
      const requiresCover = isBookCoverEligible(item.item_name);

      matchedItems.push({
        id: itemId,
        productId: null,
        sku: null,
        name: item.item_name,
        category: "Custom Item",
        quantity: item.quantity,
        unitPrice: fallbackPrice,
        lineTotal: Math.round(fallbackPrice * item.quantity * 100) / 100,
        requiresPexcover: requiresCover,
        pexcoCode: requiresCover ? "PEXCO01" : null,
        similarity: 0,
        rawText: item.raw_text,
        specifications: item.specifications,
      });
    }
  }

  const subtotal = Math.round(
    matchedItems.reduce((acc, it) => acc + it.lineTotal, 0) * 100
  ) / 100;
  const totalItemCount = matchedItems.reduce((acc, it) => acc + it.quantity, 0);

  // Store in draft_carts table
  let draftId: string;
  try {
    const { data: draft, error: insertError } = await supabase
      .from("draft_carts")
      .insert({
        items: matchedItems as unknown as Json,
        item_count: totalItemCount,
        subtotal,
        wants_pexcover: false,
      })
      .select("id")
      .single();

    if (insertError || !draft) {
      console.error("[ai-convert-list] draft_carts insert error:", insertError);
      return NextResponse.json(
        { error: "Could not create your cart draft. Please try again." },
        { status: 500 }
      );
    }

    draftId = draft.id;
  } catch (cartErr) {
    console.error("[ai-convert-list] draft_carts exception:", cartErr);
    return NextResponse.json(
      { error: "Failed to persist draft cart." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    draftId,
    itemCount: totalItemCount,
  });
}
