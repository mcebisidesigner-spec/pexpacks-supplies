import { NextRequest, NextResponse } from "next/server";
import { searchSchoolRecords, getFeaturedSchoolRecords, getNearbySchoolRecords } from "@/lib/schools/schoolSearchData";
import { isSchoolPhase } from "@/lib/schools/schoolPhase";
import { rateLimitRequest } from "@/lib/security/requestGuards";

export const runtime = "nodejs";

function numberParam(value: string | null, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export async function GET(request: NextRequest) {
  const limitStatus = rateLimitRequest(request, {
    keyPrefix: "schools-search",
    windowMs: 60 * 1000,
    max: 60,
  });

  if (!limitStatus.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: "Too many search requests. Please try again shortly.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(limitStatus.retryAfter) },
      }
    );
  }

  const params = request.nextUrl.searchParams;
  const limit = Math.min(Math.max(numberParam(params.get("limit"), 12), 1), 24);
  const offset = Math.max(numberParam(params.get("offset"), 0), 0);
  const phaseParam = params.get("phase") ?? "";
  const query = params.get("q")?.trim() ?? "";
  const featuredOnly = params.get("featured") === "true";

  const latStr = params.get("lat");
  const lngStr = params.get("lng");
  if (latStr && lngStr && !query) {
    const userLat = Number(latStr);
    const userLng = Number(lngStr);
    if (!isNaN(userLat) && !isNaN(userLng)) {
      const nearby = await getNearbySchoolRecords(userLat, userLng, limit);
      return NextResponse.json(
        {
          success: true,
          results: nearby,
          total: nearby.length,
          hasMore: false,
          limit,
          offset: 0,
        },
        { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400" } }
      );
    }
  }

  if (featuredOnly || (!query && params.has("limit"))) {
    const featured = await getFeaturedSchoolRecords(4);
    return NextResponse.json(
      {
        success: true,
        results: featured,
        total: featured.length,
        hasMore: false,
        limit: 4,
        offset: 0,
      },
      {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400" },
      }
    );
  }

  const results = await searchSchoolRecords(
    {
      query,
      grade: params.get("grade") ?? "",
      phase: isSchoolPhase(phaseParam) ? phaseParam : "",
      region: params.get("region") ?? "",
    },
    limit,
    offset
  );

  return NextResponse.json(
    {
      success: true,
      ...results,
      limit,
      offset,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    }
  );
}
