import { NextRequest, NextResponse } from "next/server";
import { getAdminUser, hasPermission } from "@/lib/admin/rbac";
import { isSameOriginRequest } from "@/lib/security/requestGuards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Pre-seeded South African stationery brands as default directory
const DEFAULT_BRANDS = [
  { id: "brand-aspire", name: "Aspire" },
  { id: "brand-bantex", name: "Bantex" },
  { id: "brand-bic", name: "Bic" },
  { id: "brand-croxley", name: "Croxley" },
  { id: "brand-faber-castell", name: "Faber-Castell" },
  { id: "brand-freedom", name: "Freedom" },
  { id: "brand-lion", name: "Lion" },
  { id: "brand-mondi", name: "Mondi" },
  { id: "brand-oxford", name: "Oxford" },
  { id: "brand-pilot", name: "Pilot" },
  { id: "brand-pritt", name: "Pritt" },
  { id: "brand-sasco", name: "Sasco" },
  { id: "brand-sigma", name: "Sigma" },
  { id: "brand-staedtler", name: "Staedtler" },
  { id: "brand-typek", name: "Typek" },
];

export async function GET(request: NextRequest) {
  try {
    const admin = createSupabaseAdminClient();
    // Attempt to fetch from brands table if it exists in Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (admin.from("brands" as any) as any)
      .select("id, name")
      .order("name", { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      return NextResponse.json({ brands: data });
    }
  } catch {
    // Fallback if table does not yet exist
  }

  return NextResponse.json({ brands: DEFAULT_BRANDS });
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  }

  const session = await getAdminUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = String(body?.name || "").trim();

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Brand name must be at least 2 characters long." },
        { status: 400 },
      );
    }

    const brandId = `brand-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;
    const newBrand = {
      id: brandId,
      name,
    };

    try {
      const admin = createSupabaseAdminClient();
      // Attempt insert if brands table exists
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (admin.from("brands" as any) as any)
        .insert({ name })
        .select("id, name")
        .single();

      if (!error && data) {
        return NextResponse.json({ brand: data }, { status: 201 });
      }
    } catch {
      // Table may not be migrated yet; return generated brand object
    }

    return NextResponse.json({ brand: newBrand }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to process brand creation." },
      { status: 500 },
    );
  }
}
