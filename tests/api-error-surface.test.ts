import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("API error surface", () => {
  it("keeps checkout, search, and Open Graph internal failures private", () => {
    const checkout = read("app/api/checkout/route.ts");
    const stationerySearch = read("app/api/stationery/search/route.ts");
    const og = read("app/api/og/route.tsx");

    expect(checkout).toContain("Payment service is temporarily unavailable.");
    expect(checkout).toContain("Checkout is temporarily unavailable.");
    expect(checkout).not.toContain("{ success: false, error: error.message }");
    expect(stationerySearch).toContain(
      "Stationery search is temporarily unavailable.",
    );
    expect(stationerySearch).not.toContain("error: error.message");
    expect(og).toContain('new Response("Unable to generate image.", { status: 500 })');
    expect(og).not.toContain("Failed to generate image: ${errorMsg}");
  });
});
