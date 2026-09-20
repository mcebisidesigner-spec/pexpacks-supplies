import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export interface AddressSuggestion {
  id: string;
  mainText: string;
  secondaryText: string;
  fullAddress: string;
  address: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
}

// Fallback South African locations for instant resiliency
const SA_FALLBACK_LOCATIONS = [
  { suburb: "Sandton", city: "Johannesburg", province: "Gauteng", postalCode: "2196" },
  { suburb: "Rosebank", city: "Johannesburg", province: "Gauteng", postalCode: "2196" },
  { suburb: "Randburg", city: "Johannesburg", province: "Gauteng", postalCode: "2194" },
  { suburb: "Midrand", city: "Johannesburg", province: "Gauteng", postalCode: "1685" },
  { suburb: "Centurion", city: "Pretoria", province: "Gauteng", postalCode: "0157" },
  { suburb: "Brooklyn", city: "Pretoria", province: "Gauteng", postalCode: "0181" },
  { suburb: "Hatfield", city: "Pretoria", province: "Gauteng", postalCode: "0083" },
  { suburb: "Garsfontein", city: "Pretoria", province: "Gauteng", postalCode: "0081" },
  { suburb: "Germiston", city: "Ekurhuleni", province: "Gauteng", postalCode: "1401" },
  { suburb: "Bedfordview", city: "Ekurhuleni", province: "Gauteng", postalCode: "2007" },
  { suburb: "Edenvale", city: "Ekurhuleni", province: "Gauteng", postalCode: "1609" },
  { suburb: "Kempton Park", city: "Ekurhuleni", province: "Gauteng", postalCode: "1619" },
  { suburb: "Benoni", city: "Ekurhuleni", province: "Gauteng", postalCode: "1501" },
  { suburb: "Boksburg", city: "Ekurhuleni", province: "Gauteng", postalCode: "1459" },
  { suburb: "Roodepoort", city: "Johannesburg", province: "Gauteng", postalCode: "1724" },
  { suburb: "Fourways", city: "Johannesburg", province: "Gauteng", postalCode: "2055" },
  { suburb: "Bryanston", city: "Johannesburg", province: "Gauteng", postalCode: "2191" },
  { suburb: "Morningside", city: "Johannesburg", province: "Gauteng", postalCode: "2057" },
  { suburb: "Hyde Park", city: "Johannesburg", province: "Gauteng", postalCode: "2196" },
  { suburb: "Parkhurst", city: "Johannesburg", province: "Gauteng", postalCode: "2193" },
  { suburb: "Green Point", city: "Cape Town", province: "Western Cape", postalCode: "8005" },
  { suburb: "Sea Point", city: "Cape Town", province: "Western Cape", postalCode: "8005" },
  { suburb: "Camps Bay", city: "Cape Town", province: "Western Cape", postalCode: "8005" },
  { suburb: "Rondebosch", city: "Cape Town", province: "Western Cape", postalCode: "7700" },
  { suburb: "Claremont", city: "Cape Town", province: "Western Cape", postalCode: "7708" },
  { suburb: "Constantia", city: "Cape Town", province: "Western Cape", postalCode: "7806" },
  { suburb: "Durbanville", city: "Cape Town", province: "Western Cape", postalCode: "7550" },
  { suburb: "Bellville", city: "Cape Town", province: "Western Cape", postalCode: "7530" },
  { suburb: "Umhlanga", city: "Durban", province: "KwaZulu-Natal", postalCode: "4319" },
  { suburb: "Morningside", city: "Durban", province: "KwaZulu-Natal", postalCode: "4001" },
  { suburb: "Ballito", city: "Dolphin Coast", province: "KwaZulu-Natal", postalCode: "4399" },
  { suburb: "Gqeberha Central", city: "Gqeberha", province: "Eastern Cape", postalCode: "6001" },
  { suburb: "Summerstrand", city: "Gqeberha", province: "Eastern Cape", postalCode: "6001" },
  { suburb: "Bloemfontein Central", city: "Bloemfontein", province: "Free State", postalCode: "9301" },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const queryEncoded = encodeURIComponent(`${q} South Africa`);
  const url = `https://photon.komoot.io/api/?q=${queryEncoded}&lat=-29.0&lon=24.0&limit=8`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "Pexpacks-AddressSearch/1.0 (orders@pexpacks.co.za)",
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const features = Array.isArray(data.features) ? data.features : [];

      const suggestions: AddressSuggestion[] = [];

      for (let i = 0; i < features.length; i++) {
        const p = features[i]?.properties || {};
        const country = p.country || "";
        const countryCode = p.countrycode || "";

        // Ensure South Africa results
        if (
          country &&
          !country.toLowerCase().includes("south africa") &&
          countryCode !== "ZA"
        ) {
          continue;
        }

        const houseNumber = p.housenumber || "";
        const streetPart = p.street || p.name || "";
        const mainText = [houseNumber, streetPart].filter(Boolean).join(" ") || q;

        // South African addressing: prioritize human-readable suburb/locality over administrative wards
        const suburb =
          p.suburb ||
          p.locality ||
          p.neighbourhood ||
          (p.district && !p.district.toLowerCase().includes("ward") ? p.district : "") ||
          "";

        const rawCity = p.city || p.town || p.municipality || p.county || "";
        const city = rawCity
          .replace(/^City of\s+/i, "")
          .replace(/\s+(Metropolitan|Local)?\s*Municipality/i, "")
          .trim();

        const province = p.state || "";
        const postalCode = p.postcode || "";

        const secondaryParts = [suburb, city, province, postalCode].filter(Boolean);
        const secondaryText = secondaryParts.join(", ");
        const fullAddress = [mainText, secondaryText].filter(Boolean).join(", ");

        suggestions.push({
          id: `photon-${p.osm_id || i}`,
          mainText,
          secondaryText,
          fullAddress,
          address: mainText,
          suburb,
          city,
          province,
          postalCode,
        });

        if (suggestions.length >= 6) break;
      }

      if (suggestions.length > 0) {
        return NextResponse.json(
          { suggestions },
          {
            headers: {
              "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
            },
          },
        );
      }
    }
  } catch {
    // Graceful fallback on network timeout or external API downtime
  }

  // Resilient fallback matcher from South African locations
  const qLower = q.toLowerCase();
  const matched = SA_FALLBACK_LOCATIONS.filter(
    (loc) =>
      loc.suburb.toLowerCase().includes(qLower) ||
      loc.city.toLowerCase().includes(qLower) ||
      loc.postalCode.includes(qLower),
  ).slice(0, 5);

  const fallbackSuggestions: AddressSuggestion[] = matched.map((loc, idx) => ({
    id: `sa-loc-${idx}`,
    mainText: q,
    secondaryText: `${loc.suburb}, ${loc.city}, ${loc.province}, ${loc.postalCode}`,
    fullAddress: `${q}, ${loc.suburb}, ${loc.city}, ${loc.postalCode}`,
    address: q,
    suburb: loc.suburb,
    city: loc.city,
    province: loc.province,
    postalCode: loc.postalCode,
  }));

  return NextResponse.json(
    { suggestions: fallbackSuggestions },
    {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    },
  );
}
