import { NextRequest, NextResponse } from "next/server";
import { getAllPublicSchoolRecords } from "@/lib/schools/schoolSearchData";
import { rateLimitRequest } from "@/lib/security/requestGuards";

export const runtime = "nodejs";

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 48;

function parseNonNegativeInteger(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export async function GET(request: NextRequest) {
  const limitStatus = await rateLimitRequest(request, {
    keyPrefix: "schools-directory",
    windowMs: 60 * 1000,
    max: 10,
  });

  if (!limitStatus.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: "Please wait before loading the directory again.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(limitStatus.retryAfter) },
      },
    );
  }

  const params = request.nextUrl.searchParams;
  const limit = Math.max(
    1,
    Math.min(
      parseNonNegativeInteger(params.get("limit"), DEFAULT_LIMIT),
      MAX_LIMIT,
    ),
  );
  const offset = parseNonNegativeInteger(params.get("offset"), 0);
  const query = params.get("q")?.trim().toLowerCase() ?? "";
  const region = params.get("region")?.trim().toLowerCase() ?? "";
  const letter = params.get("letter")?.trim().toUpperCase() ?? "";
  const allSchools = await getAllPublicSchoolRecords();
  const availableLetters = Array.from(
    new Set(
      allSchools.map((school) => school.name.trim().toUpperCase().charAt(0)),
    ),
  ).sort();
  const availableRegions = Array.from(
    new Set(
      allSchools
        .map((school) => school.region.trim())
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const filteredSchools = allSchools.filter((school) => {
    const name = school.name.trim();

    if (letter && !name.toUpperCase().startsWith(letter)) return false;
    if (region && school.region.trim().toLowerCase() !== region) return false;
    if (!query) return true;

    return [school.name, school.region, school.metro, school.province]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(query));
  });
  const schools = filteredSchools.slice(offset, offset + limit);

  return NextResponse.json(
    {
      success: true,
      schools,
      total: filteredSchools.length,
      offset,
      limit,
      hasMore: offset + schools.length < filteredSchools.length,
      availableLetters,
      availableRegions,
    },
    {
      headers: {
        "Cache-Control":
          "public, s-maxage=300, stale-while-revalidate=86400",
      },
    },
  );
}