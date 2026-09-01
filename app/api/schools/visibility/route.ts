import { NextRequest, NextResponse } from "next/server";
import {
  isSameOriginRequest,
  rateLimitRequest,
} from "@/lib/security/requestGuards";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { success: false, message: "Invalid request origin." },
      { status: 403 },
    );
  }

  const limit = rateLimitRequest(request, {
    keyPrefix: "school-visibility",
    windowMs: 60 * 1000,
    max: 30,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many visibility checks." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfter) },
      },
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

  const rawSlugs =
    body &&
    typeof body === "object" &&
    Array.isArray((body as { slugs?: unknown }).slugs)
      ? (body as { slugs: unknown[] }).slugs
      : [];
  const slugs = [
    ...new Set(
      rawSlugs
        .filter((slug): slug is string => typeof slug === "string")
        .map((slug) => slug.trim().toLowerCase())
        .filter((slug) => /^[a-z0-9-]{1,200}$/.test(slug)),
    ),
  ].slice(0, 50);

  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();
  const { data: schoolsData, error } = await supabase.rpc(
    "get_public_school_visibility" as never,
    { school_slugs: slugs } as never,
  );

  if (error) {
    console.error("[schools visibility] public visibility RPC failed:", error);
    return NextResponse.json(
      { success: false, visibleSlugs: [], collectionDisallowedSlugs: [] },
      { status: 500, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  type VisibilityRow = { slug: string; parent_collection_accepted?: boolean | null };
  const rows = (schoolsData as unknown as VisibilityRow[] | null) ?? [];
  const visibleSlugs = rows.map((s) => s.slug);

  const collectionDisallowedSlugs = rows
    .filter((s) => s.parent_collection_accepted === false)
    .map((s) => s.slug);

  return NextResponse.json(
    { success: true, visibleSlugs, collectionDisallowedSlugs },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
