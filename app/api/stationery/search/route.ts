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

    // Fast ILIKE typeahead search across name and description
    const { data, error } = await admin
      .from("stationery_items")
      .select("id, name, description, unit_price, quantity")
      .or(`name.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%`)
      .limit(8);

    if (error) {
      console.error("[api/stationery/search] Query failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const items = (data || []).map((item) => ({
      id: item.id,
      title: item.name || "Stationery Item",
      description: item.description || "",
      unit_price: Number(item.unit_price ?? 0),
    }));

    return NextResponse.json(items);
  } catch (err) {
    console.error("[api/stationery/search] Unexpected error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
