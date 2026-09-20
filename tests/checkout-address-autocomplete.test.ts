import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/address-autocomplete/route";
import { NextRequest } from "next/server";

describe("Address Autocomplete & Checkout Enhancements", () => {
  it("returns empty suggestions when search query is less than 2 characters", async () => {
    const req = new NextRequest("http://localhost:3000/api/address-autocomplete?q=a");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.suggestions).toEqual([]);
  });

  it("returns structured South African address suggestions for queries", async () => {
    const req = new NextRequest("http://localhost:3000/api/address-autocomplete?q=Sandton");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data.suggestions)).toBe(true);
    expect(data.suggestions.length).toBeGreaterThan(0);

    const first = data.suggestions[0];
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("mainText");
    expect(first).toHaveProperty("secondaryText");
    expect(first).toHaveProperty("fullAddress");
    expect(first).toHaveProperty("address");
    expect(first).toHaveProperty("suburb");
    expect(first).toHaveProperty("city");
    expect(first).toHaveProperty("province");
    expect(first).toHaveProperty("postalCode");
  });

  it("handles fallback matching when query matches South African locations", async () => {
    const req = new NextRequest("http://localhost:3000/api/address-autocomplete?q=Camps+Bay");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.suggestions.length).toBeGreaterThan(0);
    const match = data.suggestions.find(
      (s: { suburb: string; city: string }) =>
        s.suburb.toLowerCase().includes("camps bay") ||
        s.city.toLowerCase().includes("cape town")
    );
    expect(match).toBeDefined();
  });
});
