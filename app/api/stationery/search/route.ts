import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminUser, hasPermission } from "@/lib/admin/rbac";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  if (!query || query.trim().length < 2) {
    return NextResponse.json([]);
  }

  // Only authenticated staff with item access may search the inventory.
  const session = await getAdminUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  if (!hasPermission(session, "items.view")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const cleanQuery = query.trim();

    const { data, error } = await admin
      .from("master_products")
      .select(
        "id, sku, name, description, category, specification, unit, availability, current_selling_price, latest_verified_cost, preferred_supplier:suppliers(name)",
      )
      .eq("active", true)
      .textSearch("search_vector", cleanQuery, { type: "websearch", config: "simple" })
      .order("name", { ascending: true })
      .limit(40);

    if (error) {
      console.error("[api/stationery/search] Query failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const items = (data || []).map((item) => {
      const supplier = Array.isArray(item.preferred_supplier)
        ? item.preferred_supplier[0]
        : item.preferred_supplier;
      const unitPrice = Number(item.current_selling_price ?? 0);
      const costPrice = item.latest_verified_cost == null ? null : Number(item.latest_verified_cost);
      const marginAmount = costPrice == null ? null : unitPrice - costPrice;
      const marginPercent = unitPrice > 0 && marginAmount != null ? (marginAmount / unitPrice) * 100 : null;

      return {
        id: item.id,
        sku: item.sku,
        title: item.name || "Stationery Item",
        description: item.description || "",
        category: item.category || item.specification || undefined,
        unit: item.unit || "Each",
        availability: item.availability || "available",
        supplier: supplier?.name || null,
        unit_price: unitPrice,
        cost_price: costPrice,
        margin_amount: marginAmount,
        margin_percent: marginPercent,
      };
    });

    return NextResponse.json(items);
  } catch (err) {
    console.error("[api/stationery/search] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
