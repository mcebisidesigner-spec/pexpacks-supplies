import { NextRequest, NextResponse } from "next/server";
import { searchSchoolRecords } from "@/lib/schools/schoolSearchData";
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
  const results = await searchSchoolRecords(
    {
      query: params.get("q") ?? "",
      grade: params.get("grade") ?? "",
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
        // Cache search results for 60s on CDN, allow stale for 5 min
        "Cache-Control":
          "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
