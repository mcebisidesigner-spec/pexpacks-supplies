const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

type NominatimResponse = {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    city_district?: string;
    county?: string;
    state?: string;
  };
  display_name?: string;
};

/**
 * Reverse-geocode GPS coordinates to a city/town name using
 * OpenStreetMap Nominatim. Returns null on failure.
 *
 * Usage policy: max 1 req/s, include valid User-Agent.
 * @see https://operations.osmfoundation.org/policies/nominatim/
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      format: "json",
      addressdetails: "1",
      "accept-language": "en",
    });

    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        "User-Agent": "PexpacksSchoolDiscovery/1.0 (https://pexpacks.co.za)",
      },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) return null;

    const data: NominatimResponse = await res.json();
    const addr = data.address;

    if (!addr) return null;

    // Prefer city > town > village > suburb > city_district
    return (
      addr.city ||
      addr.town ||
      addr.village ||
      addr.suburb ||
      addr.city_district ||
      null
    );
  } catch {
    return null;
  }
}
