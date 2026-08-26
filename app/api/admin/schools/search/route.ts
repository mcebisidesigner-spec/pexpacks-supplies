import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminUser, hasPermission } from "@/lib/admin/rbac";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  // The matching results drawer is activated ONLY after the user has typed at least 3 letters
  if (!query || query.trim().length < 3) {
    return NextResponse.json([]);
  }

  const session = await getAdminUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  if (!hasPermission(session, "schools.view") && !hasPermission(session, "orders.view")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const cleanQuery = query.trim();

    // Fast ILIKE search across all 3,342 schools in the database
    const { data, error } = await admin
      .from("schools")
      .select("id, name, slug, city, province, address")
      .or(`name.ilike.%${cleanQuery}%,city.ilike.%${cleanQuery}%,province.ilike.%${cleanQuery}%`)
      .order("name", { ascending: true })
      .limit(50);

    if (error) {
      console.error("[api/admin/schools/search] Query failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const schools = (data || []).map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      city: s.city || "",
      province: s.province || "",
      address: s.address || "",
    }));

    return NextResponse.json(schools);
  } catch (err) {
    console.error("[api/admin/schools/search] Unexpected error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
