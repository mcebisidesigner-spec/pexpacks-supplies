import { NextRequest, NextResponse } from "next/server";
import { getPublicSchoolSlugSet } from "@/lib/schools/publicSchoolData";
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
    body && typeof body === "object" && Array.isArray((body as { slugs?: unknown }).slugs)
      ? (body as { slugs: unknown[] }).slugs
      : [];
  const slugs = [...new Set(
    rawSlugs
      .filter((slug): slug is string => typeof slug === "string")
      .map((slug) => slug.trim().toLowerCase())
      .filter((slug) => /^[a-z0-9-]{1,200}$/.test(slug)),
  )].slice(0, 50);

  const publicSlugs = await getPublicSchoolSlugSet();
  const visibleSlugs = slugs.filter((slug) => publicSlugs.has(slug));

  return NextResponse.json(
    { success: true, visibleSlugs },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
