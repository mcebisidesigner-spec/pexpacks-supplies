import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSameOriginRequest } from "@/lib/security/requestGuards";
import type { Database, Json } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const draftId = searchParams.get("draft_id");

  if (!draftId) {
    return NextResponse.json({ error: "Missing draft_id parameter." }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data: draft, error } = await supabase
      .from("draft_carts")
      .select("*")
      .eq("id", draftId)
      .maybeSingle();

    if (error || !draft) {
      return NextResponse.json({ error: "Draft cart not found or expired." }, { status: 404 });
    }

    return NextResponse.json({ success: true, draft });
  } catch (err) {
    console.error("[draft-cart] GET error:", err);
    return NextResponse.json({ error: "Failed to retrieve draft cart." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { draftId, items, wantsPexcover } = body;

    if (!draftId) {
      return NextResponse.json({ error: "Missing draftId." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const updatePayload: Database["public"]["Tables"]["draft_carts"]["Update"] = {
      updated_at: new Date().toISOString(),
    };

    if (Array.isArray(items)) {
      const subtotal = Math.round(
        items.reduce(
          (sum: number, it: { unitPrice?: number; quantity?: number }) =>
            sum + (Number(it.unitPrice) || 0) * (Number(it.quantity) || 1),
          0
        ) * 100
      ) / 100;
      const itemCount = items.reduce(
        (sum: number, it: { quantity?: number }) => sum + (Number(it.quantity) || 1),
        0
      );

      updatePayload.items = items as unknown as Json;
      updatePayload.subtotal = subtotal;
      updatePayload.item_count = itemCount;
    }

    if (typeof wantsPexcover === "boolean") {
      updatePayload.wants_pexcover = wantsPexcover;
    }

    const { data: updated, error } = await supabase
      .from("draft_carts")
      .update(updatePayload)
      .eq("id", draftId)
      .select("*")
      .single();

    if (error || !updated) {
      return NextResponse.json({ error: "Failed to update draft cart." }, { status: 500 });
    }

    return NextResponse.json({ success: true, draft: updated });
  } catch (err) {
    console.error("[draft-cart] PATCH error:", err);
    return NextResponse.json({ error: "Failed to update draft cart." }, { status: 500 });
  }
}
