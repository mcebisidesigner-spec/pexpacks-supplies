import { describe, expect, it } from "vitest";
import { formatCurrency } from "@/lib/formatCurrency";

describe("formatCurrency", () => {
  it("formats zero as R00.00 by default across the public web app", () => {
    expect(formatCurrency(0)).toBe("R00.00");
  });

  it("formats falsy and NaN values as R00.00", () => {
    expect(formatCurrency(NaN)).toBe("R00.00");
    expect(formatCurrency(null as unknown as number)).toBe("R00.00");
    expect(formatCurrency(undefined as unknown as number)).toBe("R00.00");
  });

  it("only returns Quote if allowQuote is explicitly true", () => {
    expect(formatCurrency(0, { allowQuote: true })).toBe("Quote");
    expect(formatCurrency(0, { allowQuote: false })).toBe("R00.00");
  });

  it("formats positive amounts with ZAR currency formatting", () => {
    const formatted = formatCurrency(413.13);
    expect(formatted).toMatch(/^R\s?413[,.]13$/);
  });
});
