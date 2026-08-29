/**
 * PEXCOVER™ DYNAMIC BOOK COVERING PRICING ENGINE
 * 
 * Central deterministic calculator for Pexcover book covering service.
 * Inspects pack items, identifies coverable products requiring covering,
 * resolves active PEXCO rates, and calculates integer cents totals.
 */

export interface PexcoRate {
  id?: string;
  code: string;
  title: string;
  description?: string | null;
  covering_price_cents: number;
  cost_price_cents?: number | null;
  is_active: boolean;
}

export interface CoverablePackItemInput {
  id?: string;
  name?: string;
  quantity: number;
  requires_pexcover?: boolean | null;
  requiresPexcover?: boolean | null;
  pexco_code?: string | null;
  pexcoCode?: string | null;
  pexco_rate_cents?: number | null;
  pexcoRateCents?: number | null;
  pexco_rate_active?: boolean | null;
  pexcoRateActive?: boolean | null;
  pexco_title?: string | null;
  pexcoTitle?: string | null;
}

export interface PexcoverBreakdownItem {
  name: string;
  pexcoCode: string;
  pexcoTitle: string;
  quantity: number;
  unitPriceCents: number;
  unitPriceRands: number;
  lineTotalCents: number;
  lineTotalRands: number;
}

export interface PexcoverCalculationResult {
  /** Total covering cost in integer cents */
  pexcoverTotalCents: number;
  /** Total covering cost formatted in Rands (cents / 100) */
  pexcoverTotalRands: number;
  /** Total number of individual books eligible for covering */
  coverableItemCount: number;
  /** Number of distinct product lines requiring covering */
  eligibleItemTypes: number;
  /** Whether the pack contains any coverable books */
  hasEligibleBooks: boolean;
  /** Line-by-line snapshot breakdown */
  breakdown: PexcoverBreakdownItem[];
}

/**
 * Calculates the dynamic Pexcover covering total for an array of pack items.
 * 
 * Business Rule:
 * Pexcover Total = SUM(PEXCO covering rate × item quantity)
 * ONLY where requires_pexcover === true AND pexco_code IS NOT NULL AND pexco_rate_active !== false
 */
export function calculatePexcoverTotal(
  items: CoverablePackItemInput[] | null | undefined,
  ratesLookup?: Map<string, number>
): PexcoverCalculationResult {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return {
      pexcoverTotalCents: 0,
      pexcoverTotalRands: 0,
      coverableItemCount: 0,
      eligibleItemTypes: 0,
      hasEligibleBooks: false,
      breakdown: [],
    };
  }

  let totalCents = 0;
  let totalBookCount = 0;
  let eligibleTypes = 0;
  const breakdown: PexcoverBreakdownItem[] = [];

  for (const item of items) {
    const requiresCover = Boolean(item.requires_pexcover ?? item.requiresPexcover);
    const code = (item.pexco_code ?? item.pexcoCode)?.trim();

    if (!requiresCover || !code) {
      continue;
    }

    const isActive = item.pexco_rate_active ?? item.pexcoRateActive;
    if (isActive === false) {
      continue;
    }

    const qty = Math.max(0, Math.floor(Number(item.quantity) || 0));
    if (qty <= 0) {
      continue;
    }

    // Resolve rate in cents
    let rateCents: number | null = null;
    if (ratesLookup && ratesLookup.has(code)) {
      rateCents = ratesLookup.get(code)!;
    } else {
      const embedded = item.pexco_rate_cents ?? item.pexcoRateCents;
      if (typeof embedded === "number" && embedded >= 0) {
        rateCents = Math.round(embedded);
      }
    }

    // Standard fallback rates if lookup / embedded missing (preventing crash)
    if (rateCents === null) {
      switch (code.toUpperCase()) {
        case "PEXCO01":
          rateCents = 800; // R8.00
          break;
        case "PEXCO02":
          rateCents = 1400; // R14.00
          break;
        case "PEXCO03":
          rateCents = 1100; // R11.00
          break;
        case "PEXCO04":
          rateCents = 1800; // R18.00
          break;
        default:
          rateCents = 0;
      }
    }

    if (rateCents <= 0) {
      continue;
    }

    const lineTotal = rateCents * qty;
    totalCents += lineTotal;
    totalBookCount += qty;
    eligibleTypes += 1;

    breakdown.push({
      name: item.name || `Coverable Book (${code})`,
      pexcoCode: code,
      pexcoTitle: item.pexco_title ?? item.pexcoTitle ?? code,
      quantity: qty,
      unitPriceCents: rateCents,
      unitPriceRands: rateCents / 100,
      lineTotalCents: lineTotal,
      lineTotalRands: lineTotal / 100,
    });
  }

  return {
    pexcoverTotalCents: totalCents,
    pexcoverTotalRands: Math.round(totalCents) / 100,
    coverableItemCount: totalBookCount,
    eligibleItemTypes: eligibleTypes,
    hasEligibleBooks: totalBookCount > 0,
    breakdown,
  };
}
