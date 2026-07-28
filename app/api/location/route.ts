import { NextRequest, NextResponse } from "next/server";
import { rateLimitRequest } from "@/lib/security/requestGuards";

export const runtime = "nodejs";

type IpApiCityResponse = {
  city?: string;
  regionName?: string;
  country?: string;
  status: "success" | "fail";
};

const CITY_MAP: Record<string, string> = {
  johannesburg: "Johannesburg",
  sandton: "Sandton",
  soweto: "Soweto",
  randburg: "Randburg",
  roodepoort: "Roodepoort",
  "city of johannesburg": "Johannesburg",
  edenvale: "Edenvale",
  "kempton park": "Kempton Park",
  tembisa: "Tembisa",
  germiston: "Germiston",
  boksburg: "Boksburg",
  benoni: "Benoni",
  alberton: "Alberton",
  brakpan: "Brakpan",
  springs: "Springs",
  nigel: "Nigel",
  daveyton: "Daveyton",
  "east rand": "Germiston",
  pretoria: "Pretoria",
  centurion: "Centurion",
  soshanguve: "Soshanguve",
  midrand: "Midrand",
  randfontein: "Randfontein",
  krugersdorp: "Krugersdorp",
  "mogale city": "Mogale City",
  Vereeniging: "Vereeniging",
  vanderbijlpark: "Vanderbijlpark",
  heidelberg: "Heidelberg",
  meyerton: "Meyerton",
  sebokeng: "Sebokeng",
  evaton: "Evaton",
  westonaria: "Westonaria",
  fochville: "Fochville",
  carletonville: "Carletonville",
  magaliesburg: "Magaliesburg",
  cullinan: "Cullinan",
  rayton: "Rayton",
  temba: "Temba",
  thokoza: "Thokoza",
  tsakane: "Tsakane",
  olifantsfontein: "Olifantsfontein",
  merafong: "Merafong",
};

function mapCity(raw: string | null): string | null {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();
  if (CITY_MAP[lower]) return CITY_MAP[lower];
  // Fuzzy: check if any key is contained in the raw string
  for (const [key, value] of Object.entries(CITY_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return value;
  }
  return raw;
}

async function resolveFromIpApi(
  ip: string
): Promise<{ city: string | null; source: string }> {
  if (!ip || ip === "unknown" || ip === "127.0.0.1" || ip === "::1") {
    return { city: null, source: "fallback" };
  }

  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=city,regionName,status`,
      { signal: AbortSignal.timeout(3000) }
    );

    if (!res.ok) return { city: null, source: "fallback" };

    const data: IpApiCityResponse = await res.json();
    if (data.status === "success" && data.city) {
      return { city: mapCity(data.city), source: "ip-api" };
    }
  } catch {
    // ip-api timeout or error
  }

  return { city: null, source: "fallback" };
}

export async function GET(request: NextRequest) {
  const rl = rateLimitRequest(request, {
    keyPrefix: "location",
    windowMs: 60_000,
    max: 30,
  });

  if (!rl.allowed) {
    return NextResponse.json(
      { city: null, source: "fallback" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  // 1. Try Vercel edge headers (instant, no external call)
  const vercelCity = request.headers.get("x-vercel-ip-city");
  if (vercelCity) {
    const decoded = decodeURIComponent(vercelCity);
    const mapped = mapCity(decoded);
    if (mapped) {
      return NextResponse.json({ city: mapped, source: "vercel" });
    }
  }

  // 2. Try Cloudflare header
  const cfCity = request.headers.get("cf-ipcity");
  if (cfCity) {
    const mapped = mapCity(cfCity);
    if (mapped) {
      return NextResponse.json({ city: mapped, source: "cloudflare" });
    }
  }

  // 3. Fall back to ip-api.com lookup
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfIp = request.headers.get("cf-connecting-ip");
  const ip =
    forwardedFor?.split(",")[0]?.trim() ||
    realIp?.trim() ||
    cfIp?.trim() ||
    "";

  const result = await resolveFromIpApi(ip);
  return NextResponse.json(result);
}
