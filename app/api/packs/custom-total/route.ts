import { NextRequest, NextResponse } from "next/server";
import {
  isSameOriginRequest,
  rateLimitRequest,
} from "@/lib/security/requestGuards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type RequestedItem = {
  id: string;
  quantity: number;
};

type PackPricingRow = {
  id: string;
  price: number | null;
  margin_rate_used: number | null;
  packaging_cost: number | null;
  assembly_cost: number | null;
  freight_cost: number | null;
};

type PublicPackItemRow = {
  id: string;
  quantity: number | null;
  unit_price: number | null;
};

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function parseSelection(value: unknown): RequestedItem[] | null {
  if (!Array.isArray(value)) return null;
  const parsed: RequestedItem[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const row = item as { id?: unknown; quantity?: unknown };
    if (typeof row.id !== "string" || !/^[a-zA-Z0-9-]{1,120}$/.test(row.id)) {
      return null;
    }
    const quantity = Number(row.quantity);
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 999) {
      return null;
    }
    parsed.push({ id: row.id, quantity });
  }

  return parsed.slice(0, 500);
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { success: false, message: "Invalid request origin." },
      { status: 403 },
    );
  }

  const limit = rateLimitRequest(request, {
    keyPrefix: "pack-custom-total",
    windowMs: 60 * 1000,
    max: 120,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many pricing checks." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 },
    );
  }

  const payload = body as { packId?: unknown; items?: unknown };
  const packId = typeof payload.packId === "string" ? payload.packId : "";
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      packId,
    )
  ) {
    return NextResponse.json(
      { success: false, message: "Invalid pack id." },
      { status: 400 },
    );
  }

  const selectedItems = parseSelection(payload.items);
  if (!selectedItems) {
    return NextResponse.json(
      { success: false, message: "Invalid item selection." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();
  const [
    { data: pack, error: packError },
    { data: dbItems, error: itemsError },
  ] = await Promise.all([
    supabase
      .from("school_packs" as never)
      .select(
        "id,price,margin_rate_used,packaging_cost,assembly_cost,freight_cost",
      )
      .eq("id", packId)
      .maybeSingle(),
    supabase
      .from("public_pack_items_view" as never)
      .select("id,quantity,unit_price")
      .eq("pack_id" as never, packId as never),
  ]);

  if (packError || itemsError) {
    console.error(
      "[pack custom total] lookup failed:",
      packError || itemsError,
    );
    return NextResponse.json(
      { success: false, message: "Could not calculate pack total." },
      { status: 500 },
    );
  }
  if (!pack) {
    return NextResponse.json(
      { success: false, message: "Pack not found." },
      { status: 404 },
    );
  }

  const packRow = pack as unknown as PackPricingRow;
  const itemRows = (
    (dbItems as unknown as PublicPackItemRow[] | null) ?? []
  ).filter((item) => typeof item.id === "string");
  const itemsById = new Map(itemRows.map((item) => [item.id, item]));

  let selectedSubtotal = 0;
  let hasSelectedItems = false;
  let isFullSelection =
    itemRows.length > 0 && selectedItems.length === itemRows.length;

  for (const selected of selectedItems) {
    const dbItem = itemsById.get(selected.id);
    if (!dbItem) {
      return NextResponse.json(
        { success: false, message: "Selection does not match this pack." },
        { status: 400 },
      );
    }

    if (selected.quantity > 0) hasSelectedItems = true;
    selectedSubtotal += Number(dbItem.unit_price ?? 0) * selected.quantity;

    const requiredQuantity = Number(dbItem.quantity ?? 1);
    if (selected.quantity !== requiredQuantity) isFullSelection = false;
  }

  if (!hasSelectedItems) {
    return NextResponse.json({ success: true, total: 0 });
  }

  if (
    isFullSelection &&
    typeof packRow.price === "number" &&
    packRow.price > 0
  ) {
    return NextResponse.json({
      success: true,
      total: roundMoney(packRow.price),
    });
  }

  const marginRate = Number(packRow.margin_rate_used ?? 0);
  const safeMarginRate = marginRate > 0 && marginRate < 1 ? marginRate : 0;
  const fixedPackCost =
    Number(packRow.packaging_cost ?? 0) +
    Number(packRow.assembly_cost ?? 0) +
    Number(packRow.freight_cost ?? 0);
  const total =
    safeMarginRate > 0
      ? selectedSubtotal / (1 - safeMarginRate) + fixedPackCost
      : selectedSubtotal + fixedPackCost;

  return NextResponse.json({ success: true, total: roundMoney(total) });
}
