import { NextRequest, NextResponse } from "next/server";
import {
  getSchoolsByCity,
  getDefaultSchools,
} from "@/lib/schools/nearby";
import { rateLimitRequest } from "@/lib/security/requestGuards";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const rl = rateLimitRequest(request, {
    keyPrefix: "nearby-schools",
    windowMs: 60_000,
    max: 30,
  });

  if (!rl.allowed) {
    return NextResponse.json(
      { schools: [], source: "default", city: null },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  const { searchParams } = request.nextUrl;
  const city = searchParams.get("city");
  const limit = Math.min(Number(searchParams.get("limit")) || 6, 12);

  if (city) {
    const { schools, matchedCity } = await getSchoolsByCity(city, limit);
    return NextResponse.json(
      {
        schools,
        city: matchedCity || city,
        source: matchedCity ? "city" : "default",
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
        },
      }
    );
  }

  // No city param — fall back to default partnered schools
  const schools = await getDefaultSchools(limit);
  return NextResponse.json(
    { schools, city: null, source: "default" },
    {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
      },
    }
  );
}
