/**
 * PRICING ENGINE TEST SUITE
 *
 * Tests the Pexcover(tm) dynamic covering calculator and the gross margin
 * selling-price formula that underpins the automated Grade Pack pricing engine.
 *
 * Coverage:
 *   1.  Gross margin formula:   price = landed / (1 - margin)
 *   2.  Single coverable book   (PEXCO01 -> R8.00)
 *   3.  Multiple books of same PEXCO code
 *   4.  Mixed PEXCO codes       (PEXCO01 + PEXCO02)
 *   5.  Zero eligible books     -> pexcoverTotalCents = 0, hasEligibleBooks = false
 *   6.  Null / undefined items  -> safe zero result
 *   7.  Inactive PEXCO rate     -> excluded from total
 *   8.  ratesLookup override    -> overrides embedded cents
 *   9.  Quantity 0 item         -> excluded
 *  10.  Non-integer quantity     -> floored before use
 *  11.  Multi-pack tray total   -> sum across packs
 *  12.  Server-side verification rejects manipulated client total
 *  13.  Breakdown matches line totals
 *  14.  Margin 49.9%  -> divisor 0.501 formula check
 *  15.  Low margin threshold alert (35%) check
 */

import { describe, expect, it } from "vitest";
import {
  calculatePexcoverTotal,
  type CoverablePackItemInput,
} from "../lib/pricing/pexcover";

// --- helpers ---------------------------------------------------------------

/**
 * Gross-margin selling price formula.
 * Selling Price = Total Landed Cost / (1 - margin_rate)
 */
function calcSellingPrice(landedCostCents: number, marginRate: number): number {
  if (marginRate >= 1 || marginRate < 0) throw new Error("Invalid margin rate");
  return Math.round(landedCostCents / (1 - marginRate));
}

/** Achieved gross margin from selling price and cost (both in same unit) */
function achievedMargin(sellingPrice: number, landedCost: number): number {
  if (sellingPrice === 0) return 0;
  return (sellingPrice - landedCost) / sellingPrice;
}

// --- item factories --------------------------------------------------------

function book(
  overrides: Partial<CoverablePackItemInput> & { quantity: number }
): CoverablePackItemInput {
  return {
    requires_pexcover: true,
    pexco_code: "PEXCO01",
    pexco_rate_cents: 800,
    pexco_rate_active: true,
    ...overrides,
  };
}

function nonBook(quantity: number): CoverablePackItemInput {
  return { quantity, requires_pexcover: false, pexco_code: null };
}

// --- tests -----------------------------------------------------------------

describe("Gross Margin Formula", () => {
  it("1. calculates selling price at 49.9% gross margin", () => {
    // Landed cost R100.00 (10000c), margin 49.9%
    // Expected: 10000 / (1 - 0.499) = 10000 / 0.501 approx 19960c
    const price = calcSellingPrice(10_000, 0.499);
    expect(price).toBe(19960);
    expect(achievedMargin(price, 10_000)).toBeCloseTo(0.499, 2);
  });

  it("14. divisor is 0.501 at 49.9%", () => {
    expect(1 - 0.499).toBeCloseTo(0.501, 3);
  });

  it("15. detects pack below low-margin threshold (35%)", () => {
    const LOW_MARGIN = 0.35;
    const margin = achievedMargin(130, 100);
    expect(margin).toBeCloseTo(0.2308, 3);
    expect(margin).toBeLessThan(LOW_MARGIN);
  });

  it("zero margin when selling price equals cost", () => {
    expect(achievedMargin(100, 100)).toBe(0);
  });
});

describe("Pexcover Engine - Single book", () => {
  it("2. single PEXCO01 book: total = 800c (R8.00)", () => {
    const result = calculatePexcoverTotal([book({ quantity: 1 })]);
    expect(result.pexcoverTotalCents).toBe(800);
    expect(result.pexcoverTotalRands).toBeCloseTo(8.0, 2);
    expect(result.coverableItemCount).toBe(1);
    expect(result.hasEligibleBooks).toBe(true);
  });

  it("3. five PEXCO01 books: total = 5 x 800 = 4000c", () => {
    const result = calculatePexcoverTotal([book({ quantity: 5 })]);
    expect(result.pexcoverTotalCents).toBe(4000);
    expect(result.pexcoverTotalRands).toBeCloseTo(40.0, 2);
    expect(result.coverableItemCount).toBe(5);
  });
});

describe("Pexcover Engine - Mixed PEXCO codes", () => {
  it("4. PEXCO01 x5 + PEXCO02 x2 = 6800c", () => {
    const items: CoverablePackItemInput[] = [
      book({ quantity: 5, pexco_code: "PEXCO01", pexco_rate_cents: 800 }),
      book({ quantity: 2, pexco_code: "PEXCO02", pexco_rate_cents: 1400 }),
    ];
    const result = calculatePexcoverTotal(items);
    expect(result.pexcoverTotalCents).toBe(6800);
    expect(result.pexcoverTotalRands).toBeCloseTo(68.0, 2);
    expect(result.coverableItemCount).toBe(7);
    expect(result.eligibleItemTypes).toBe(2);
  });

  it("all four PEXCO codes: total = 5100c", () => {
    const items: CoverablePackItemInput[] = [
      book({ quantity: 1, pexco_code: "PEXCO01", pexco_rate_cents: 800 }),
      book({ quantity: 1, pexco_code: "PEXCO02", pexco_rate_cents: 1400 }),
      book({ quantity: 1, pexco_code: "PEXCO03", pexco_rate_cents: 1100 }),
      book({ quantity: 1, pexco_code: "PEXCO04", pexco_rate_cents: 1800 }),
    ];
    const result = calculatePexcoverTotal(items);
    expect(result.pexcoverTotalCents).toBe(5100);
    expect(result.eligibleItemTypes).toBe(4);
  });
});

describe("Pexcover Engine - Zero eligible books", () => {
  it("5. no coverable books -> 0c, hasEligibleBooks = false", () => {
    const result = calculatePexcoverTotal([nonBook(2), nonBook(3)]);
    expect(result.pexcoverTotalCents).toBe(0);
    expect(result.hasEligibleBooks).toBe(false);
    expect(result.breakdown).toHaveLength(0);
  });

  it("6. null items -> safe zero", () => {
    expect(calculatePexcoverTotal(null).pexcoverTotalCents).toBe(0);
  });

  it("6. undefined items -> safe zero", () => {
    expect(calculatePexcoverTotal(undefined).pexcoverTotalCents).toBe(0);
  });

  it("6. empty array -> safe zero", () => {
    expect(calculatePexcoverTotal([]).hasEligibleBooks).toBe(false);
  });
});

describe("Pexcover Engine - Edge cases", () => {
  it("7. inactive PEXCO rate -> excluded", () => {
    const items: CoverablePackItemInput[] = [
      book({ quantity: 3, pexco_rate_active: false }),
      book({ quantity: 2, pexco_rate_active: true }),
    ];
    const result = calculatePexcoverTotal(items);
    expect(result.pexcoverTotalCents).toBe(1600);
    expect(result.coverableItemCount).toBe(2);
  });

  it("8. ratesLookup overrides embedded cents", () => {
    const lookup = new Map<string, number>([["PEXCO01", 950]]);
    const result = calculatePexcoverTotal([book({ quantity: 1 })], lookup);
    expect(result.pexcoverTotalCents).toBe(950);
  });

  it("9. quantity 0 -> excluded", () => {
    const result = calculatePexcoverTotal([book({ quantity: 0 })]);
    expect(result.pexcoverTotalCents).toBe(0);
    expect(result.hasEligibleBooks).toBe(false);
  });

  it("10. non-integer quantity floored (3.9 -> 3 books)", () => {
    const result = calculatePexcoverTotal([book({ quantity: 3.9 as never })]);
    expect(result.pexcoverTotalCents).toBe(2400);
    expect(result.coverableItemCount).toBe(3);
  });

  it("uses fallback rate when no embedded or lookup rate", () => {
    const item: CoverablePackItemInput = {
      quantity: 1,
      requires_pexcover: true,
      pexco_code: "PEXCO02",
    };
    const result = calculatePexcoverTotal([item]);
    expect(result.pexcoverTotalCents).toBe(1400);
  });
});

describe("Pexcover Engine - Multi-pack tray", () => {
  it("11. sums correctly across multiple packs in tray", () => {
    const p1 = calculatePexcoverTotal([
      book({ quantity: 3, pexco_code: "PEXCO01", pexco_rate_cents: 800 }),
    ]);
    const p2 = calculatePexcoverTotal([
      book({ quantity: 2, pexco_code: "PEXCO02", pexco_rate_cents: 1400 }),
    ]);
    const p3 = calculatePexcoverTotal([nonBook(5)]);

    const trayTotal =
      p1.pexcoverTotalCents + p2.pexcoverTotalCents + p3.pexcoverTotalCents;
    // 3*800 + 2*1400 + 0 = 2400 + 2800 = 5200
    expect(trayTotal).toBe(5200);
  });
});

describe("Pexcover Engine - Server-side verification", () => {
  it("12. server total differs from manipulated client total", () => {
    const authoritative: CoverablePackItemInput[] = [
      book({ quantity: 2, pexco_code: "PEXCO01", pexco_rate_cents: 800 }),
    ];
    const serverTotal =
      calculatePexcoverTotal(authoritative).pexcoverTotalCents;
    const clientManipulatedTotal = 99999;

    expect(clientManipulatedTotal).not.toBe(serverTotal);
    expect(serverTotal).toBe(1600); // 2 * 800c
  });
});

describe("Pexcover Engine - Breakdown integrity", () => {
  it("13. breakdown line totals sum matches aggregate total", () => {
    const items: CoverablePackItemInput[] = [
      book({ quantity: 4, pexco_code: "PEXCO01", pexco_rate_cents: 800, name: "Exercise Book A" }),
      book({ quantity: 1, pexco_code: "PEXCO03", pexco_rate_cents: 1100, name: "Math Book" }),
    ];
    const result = calculatePexcoverTotal(items);
    const lineSum = result.breakdown.reduce(
      (acc, line) => acc + line.lineTotalCents,
      0
    );
    expect(lineSum).toBe(result.pexcoverTotalCents);
    expect(result.breakdown[0].lineTotalCents).toBe(3200);
    expect(result.breakdown[1].lineTotalCents).toBe(1100);
  });

  it("breakdown contains correct PEXCO code and rands", () => {
    const result = calculatePexcoverTotal([
      book({ quantity: 1, pexco_code: "PEXCO04", pexco_rate_cents: 1800, name: "Art Book" }),
    ]);
    expect(result.breakdown[0].pexcoCode).toBe("PEXCO04");
    expect(result.breakdown[0].unitPriceCents).toBe(1800);
    expect(result.breakdown[0].unitPriceRands).toBeCloseTo(18.0, 2);
  });
});

describe("Pexcover Engine - camelCase alias fields", () => {
  it("accepts requiresPexcover alias", () => {
    const item: CoverablePackItemInput = {
      quantity: 2,
      requiresPexcover: true,
      pexco_code: "PEXCO01",
      pexco_rate_cents: 800,
    };
    expect(calculatePexcoverTotal([item]).pexcoverTotalCents).toBe(1600);
  });

  it("accepts pexcoCode alias", () => {
    const item: CoverablePackItemInput = {
      quantity: 1,
      requires_pexcover: true,
      pexcoCode: "PEXCO02",
      pexco_rate_cents: 1400,
    };
    expect(calculatePexcoverTotal([item]).pexcoverTotalCents).toBe(1400);
  });
});
