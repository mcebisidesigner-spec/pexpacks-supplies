import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSameOriginRequest, rateLimitRequest } from "@/lib/security/requestGuards";
import type { Json } from "@/lib/supabase/types";
import { reportException } from "@/lib/observability/sentry";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow sufficient duration for vision & OCR inference

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB budget
const MAX_TEXT_LENGTH = 10000; // 10,000 character limit to prevent token flood

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
  isCustomOrEstimated: boolean;
  needsReview: boolean;
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
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
    case "heif":
      return "image/jpeg";
    case "bmp":
      return "image/bmp";
    case "pdf":
      return "application/pdf";
    default:
      return "image/jpeg";
  }
}

function parseTextLinesFallback(text: string): ExtractedItem[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const items: ExtractedItem[] = [];

  for (const line of lines) {
    if (line.startsWith("#") || line.startsWith("//") || line.length < 2) continue;

    const qtyMatch = line.match(/^(\d+)\s*(?:x|\*|\-)?\s*(.+)$/i);
    if (qtyMatch) {
      const qty = parseInt(qtyMatch[1], 10) || 1;
      const itemName = qtyMatch[2].trim();
      items.push({
        raw_text: line,
        item_name: itemName,
        quantity: Math.max(1, qty),
        specifications: "",
      });
    } else {
      const trailingQtyMatch = line.match(/^(.+?)\s*(?:[-–:]|\(qty:?|\bx)\s*(\d+)\s*\)?$/i);
      if (trailingQtyMatch) {
        items.push({
          raw_text: line,
          item_name: trailingQtyMatch[1].trim(),
          quantity: parseInt(trailingQtyMatch[2], 10) || 1,
          specifications: "",
        });
      } else {
        items.push({
          raw_text: line,
          item_name: line,
          quantity: 1,
          specifications: "",
        });
      }
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

async function verifyTurnstileToken(token: string | null): Promise<boolean> {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
  if (!secretKey) return true; // If not configured, pass through (rate-limiting still protects)
  if (!token) return false;

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
      }),
    });
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch (err) {
    console.error("[turnstile] Verification error:", err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  // 1. Origin check
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  // 2. IP sliding-window rate limit (5 requests per 60 seconds)
  const rateResult = await rateLimitRequest(request, {
    keyPrefix: "ai-convert-list",
    windowMs: 60 * 1000,
    max: 5,
  });

  if (!rateResult.allowed) {
    return NextResponse.json(
      { error: "Too many conversion requests. Please wait a minute before trying again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateResult.retryAfter),
        },
      }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form payload." }, { status: 400 });
  }

  // 3. Turnstile bot validation if token or secret is configured
  const turnstileToken = formData.get("cf-turnstile-response") as string | null;
  const isHuman = await verifyTurnstileToken(turnstileToken);
  if (!isHuman) {
    return NextResponse.json(
      { error: "Security check failed. Please refresh the page and try again." },
      { status: 403 }
    );
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

  if (rawText.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: "Text list exceeds the 10,000 character limit. Please shorten your list." },
      { status: 400 }
    );
  }

  if (file && file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File exceeds the 10MB limit. Please upload a smaller photo or PDF." },
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
        model: "gemini-2.5-flash",
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
      reportException(aiError, "ai-convert-list.inference");
      console.error("[ai-convert-list] Gemini inference warning:", aiError);
      // Fallback: If AI parsing failed but the user supplied text, parse the text deterministically
      if (rawText.trim()) {
        extractedItems = parseTextLinesFallback(rawText);
      } else {
        return NextResponse.json(
          {
            error:
              "We encountered an issue reading your document. Please ensure the image or PDF is clear and well-lit, or paste the items directly as text.",
          },
          { status: 502 }
        );
      }
    }
  } else {
    // No Gemini key configured
    if (file) {
      // NEVER serve fabricated items for an uploaded document
      return NextResponse.json(
        {
          error:
            "AI document scanning is temporarily unavailable. Please paste your stationery list text directly into the text tab, or reach out to our concierge team.",
        },
        { status: 503 }
      );
    } else if (rawText.trim()) {
      // Deterministic parsing of customer's actual typed text
      extractedItems = parseTextLinesFallback(rawText);
    }
  }

  if (extractedItems.length === 0) {
    return NextResponse.json(
      {
        error:
          "We could not detect clear stationery items from this input. Please try a clearer, higher-contrast photo or paste the items as text.",
      },
      { status: 422 }
    );
  }

  // Connect to Supabase catalog to fuzzy match items
  let supabase;
  try {
    supabase = createSupabaseAdminClient();
  } catch (clientErr) {
    reportException(clientErr, "ai-convert-list.supabase-init");
    console.error("[ai-convert-list] Supabase admin init error:", clientErr);
    return NextResponse.json({ error: "Database service unavailable." }, { status: 503 });
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
      const requiresCover = Boolean(match.requires_pexcover) || isBookCoverEligible(match.name, match.category);

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
        isCustomOrEstimated: false,
        needsReview: false,
      });
    } else {
      // Unmatched custom stationery line: explicitly flagged as estimated placeholder
      const fallbackPrice = 25.0; // Estimate placeholder
      const requiresCover = isBookCoverEligible(item.item_name);

      matchedItems.push({
        id: itemId,
        productId: null,
        sku: null,
        name: item.item_name,
        category: "Custom Item (Estimated)",
        quantity: item.quantity,
        unitPrice: fallbackPrice,
        lineTotal: Math.round(fallbackPrice * item.quantity * 100) / 100,
        requiresPexcover: requiresCover,
        pexcoCode: requiresCover ? "PEXCO01" : null,
        similarity: 0,
        rawText: item.raw_text,
        specifications: item.specifications,
        isCustomOrEstimated: true,
        needsReview: true,
      });
    }
  }

  const subtotal = Math.round(
    matchedItems.reduce((acc, it) => acc + it.lineTotal, 0) * 100
  ) / 100;
  const totalItemCount = matchedItems.reduce((acc, it) => acc + it.quantity, 0);
  const unmatchedCount = matchedItems.filter((it) => it.isCustomOrEstimated).length;
  const hasEstimatedItems = unmatchedCount > 0;

  // Store only the non-sensitive cart summary; source documents and learner data are not retained.
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
      reportException(insertError, "ai-convert-list.draft-insert");
      console.error("[ai-convert-list] draft_carts insert error:", insertError);
      return NextResponse.json(
        { error: "Could not create your cart draft. Please try again." },
        { status: 500 }
      );
    }

    draftId = draft.id;
  } catch (cartErr) {
    reportException(cartErr, "ai-convert-list.draft-insert");
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
    hasEstimatedItems,
    unmatchedCount,
  });
}
