import { NextRequest, NextResponse } from "next/server";
import {
  searchSchoolRecords,
  getFeaturedSchoolRecords,
  getNearbySchoolRecords,
} from "@/lib/schools/schoolSearchData";
import { getSchoolsByCity } from "@/lib/schools/nearby";
import { isSchoolPhase } from "@/lib/schools/schoolPhase";
import { rateLimitRequest } from "@/lib/security/requestGuards";

export const runtime = "nodejs";

function numberParam(value: string | null, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export async function GET(request: NextRequest) {
  const limitStatus = await rateLimitRequest(request, {
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
      },
    );
  }

  const params = request.nextUrl.searchParams;
  const limit = Math.min(Math.max(numberParam(params.get("limit"), 12), 1), 24);
  const offset = Math.max(numberParam(params.get("offset"), 0), 0);
  const phaseParam = params.get("phase") ?? "";
  const query = params.get("q")?.trim() ?? "";
  const featuredOnly = params.get("featured") === "true";

  // Edge IP Geolocation: read headers provided automatically by Vercel & Cloudflare
  const edgeLat =
    params.get("lat") ||
    request.headers.get("x-vercel-ip-latitude") ||
    request.headers.get("cf-iplatitude");
  const edgeLng =
    params.get("lng") ||
    request.headers.get("x-vercel-ip-longitude") ||
    request.headers.get("cf-iplongitude");
  const rawCity =
    params.get("city") ||
    request.headers.get("x-vercel-ip-city") ||
    request.headers.get("cf-ipcity");
  const edgeCity = rawCity ? decodeURIComponent(rawCity).trim() : "";

  // Trending / unqueried initial request: resolve nearest schools via Edge IP
  if (!query && !featuredOnly && params.has("limit")) {
    // 1. Resolve by Edge coordinates if available
    if (edgeLat && edgeLng) {
      const userLat = Number(edgeLat);
      const userLng = Number(edgeLng);
      if (!isNaN(userLat) && !isNaN(userLng)) {
        const nearby = await getNearbySchoolRecords(userLat, userLng, limit);
        if (nearby.length > 0) {
          return NextResponse.json(
            {
              success: true,
              results: nearby,
              total: nearby.length,
              hasMore: false,
              limit,
              offset: 0,
              source: "edge-coordinates",
            },
            {
              headers: {
                "Cache-Control":
                  "public, s-maxage=300, stale-while-revalidate=86400",
                Vary: "x-vercel-ip-latitude, x-vercel-ip-longitude, x-vercel-ip-city",
              },
            },
          );
        }
      }
    }

    // 2. Resolve by Edge City if coordinates were absent or returned no schools
    if (edgeCity) {
      const { schools: citySchools, matchedCity } = await getSchoolsByCity(
        edgeCity,
        limit,
      );
      if (citySchools.length > 0) {
        return NextResponse.json(
          {
            success: true,
            results: citySchools,
            total: citySchools.length,
            hasMore: false,
            limit,
            offset: 0,
            source: "edge-city",
            city: matchedCity || edgeCity,
          },
          {
            headers: {
              "Cache-Control":
                "public, s-maxage=300, stale-while-revalidate=86400",
              Vary: "x-vercel-ip-city",
            },
          },
        );
      }
    }

    // 3. Fallback to featured schools
    const featured = await getFeaturedSchoolRecords(limit);
    return NextResponse.json(
      {
        success: true,
        results: featured,
        total: featured.length,
        hasMore: false,
        limit,
        offset: 0,
        source: "featured",
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
        },
      },
    );
  }

  if (featuredOnly) {
    const featured = await getFeaturedSchoolRecords(limit);
    return NextResponse.json(
      {
        success: true,
        results: featured,
        total: featured.length,
        hasMore: false,
        limit,
        offset: 0,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
        },
      },
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
    offset,
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
    },
  );
}
