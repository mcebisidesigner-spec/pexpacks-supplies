import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("Grade Pack pricing contract", () => {
  it("calculates Grade Pack selling price from pack item selling subtotal, margin, then fixed pack costs", () => {
    const pricingSql = readRepoFile(
      "supabase/migrations/00083_use_pack_item_selling_subtotal_for_grade_pack_pricing.sql",
    );

    expect(pricingSql).toContain("spi.selling_price_override");
    expect(pricingSql).toContain("mp.current_selling_price");
    expect(pricingSql).toContain(
      "COALESCE(pic.items_cost, 0) / (1.0 - s.margin_rate)",
    );
    expect(pricingSql).toContain(
      "+ s.packaging_cost + s.assembly_cost + s.freight_cost",
    );
    expect(pricingSql).not.toContain("mp.latest_verified_cost");
  });

  it("keeps public school pack payloads free of internal margin and cost fields", () => {
    const publicRpcSql = readRepoFile(
      "supabase/migrations/00086_harden_public_pricing_privacy.sql",
    );
    const publicProps = readRepoFile("lib/packs/types.ts");
    const schoolTypes = readRepoFile("data/schools.ts");
    const publicMapper = readRepoFile("lib/school-utils.ts");

    for (const sensitiveField of [
      "'items_cost'",
      "'packaging_cost'",
      "'assembly_cost'",
      "'freight_cost'",
      "'total_landed_cost'",
      "'margin_rate_used'",
      "'pricing_status'",
      "itemsCost",
      "packagingCost",
      "assemblyCost",
      "freightCost",
      "totalLandedCost",
      "marginRateUsed",
      "marginRate",
      "fixedPackCost",
    ]) {
      expect(publicRpcSql).not.toContain(sensitiveField);
      expect(publicProps).not.toContain(sensitiveField);
      expect(schoolTypes).not.toContain(sensitiveField);
      expect(publicMapper).not.toContain(sensitiveField);
    }
  });

  it("does not expose internal pricing functions or raw Pexcover cost rows to public roles", () => {
    const hardeningSql = readRepoFile(
      "supabase/migrations/00086_harden_public_pricing_privacy.sql",
    );

    expect(hardeningSql).toContain(
      "REVOKE SELECT ON public.pexco_rates FROM anon, authenticated",
    );
    expect(hardeningSql).toContain(
      "REVOKE ALL ON FUNCTION public.calculate_grade_pack_price(uuid) FROM PUBLIC, anon, authenticated",
    );
    expect(hardeningSql).toContain(
      "REVOKE ALL ON FUNCTION public.recalculate_grade_pack_price(uuid) FROM PUBLIC, anon, authenticated",
    );
    expect(hardeningSql).toContain(
      "REVOKE ALL ON FUNCTION public.recalculate_all_grade_pack_prices() FROM PUBLIC, anon, authenticated",
    );
  });

  it("keeps custom pack pricing server-side in the public customiser", () => {
    const customiser = readRepoFile("components/packs/GradePackActions.tsx");
    const pricingEndpoint = readRepoFile("app/api/packs/custom-total/route.ts");

    expect(customiser).toContain('fetch("/api/packs/custom-total"');
    expect(customiser).not.toContain("calculateCustomPackTotal");
    expect(customiser).not.toContain("pack.marginRate");
    expect(customiser).not.toContain("pack.fixedPackCost");
    expect(pricingEndpoint).toContain("margin_rate_used");
    expect(pricingEndpoint).toContain("packaging_cost");
    expect(pricingEndpoint).toContain("assembly_cost");
    expect(pricingEndpoint).toContain("freight_cost");
  });

  it("does not overwrite school_packs.price from standalone item selling prices in admin code", () => {
    const adminItems = readRepoFile("lib/admin/items.ts");

    expect(adminItems).not.toContain("syncPackTotalPrice");
    expect(adminItems).not.toContain("update({ price: rounded");
  });

  it("ensures get_public_school_pack aggregates Pexcover selling fields and calculates Pexcover totals", async () => {
    const publicRpcSql = readRepoFile(
      "supabase/migrations/00086_harden_public_pricing_privacy.sql",
    );

    expect(publicRpcSql).toContain(
      "'requires_pexcover', COALESCE(i.requires_pexcover, false)",
    );
    expect(publicRpcSql).toContain("'pexco_code', i.pexco_code");
    expect(publicRpcSql).toContain("'pexco_rate_cents', i.pexco_rate_cents");
    expect(publicRpcSql).toContain(
      "'pexco_rate_active', COALESCE(i.pexco_rate_active, false)",
    );
    expect(publicRpcSql).not.toContain("cost_price_cents");

    const { calculatePexcoverTotal } = await import("@/lib/pricing/pexcover");
    const result = calculatePexcoverTotal([
      {
        id: "item-1",
        name: "College Exercise Unruled",
        quantity: 1,
        requires_pexcover: true,
        pexco_code: "PEXCO02",
        pexco_rate_cents: 1000,
        pexco_rate_active: true,
      },
      {
        id: "item-2",
        name: "Pencil Case Small",
        quantity: 1,
        requires_pexcover: false,
        pexco_code: null,
      },
    ]);

    expect(result.hasEligibleBooks).toBe(true);
    expect(result.coverableItemCount).toBe(1);
    expect(result.pexcoverTotalCents).toBe(1000);
    expect(result.pexcoverTotalRands).toBe(10);
  });

  it("does not default targetPrice to raw items subtotal in PackPriceForm and triggers recalculation", () => {
    const packPriceForm = readRepoFile(
      "components/admin/packs/PackPriceForm.tsx",
    );
    expect(packPriceForm).not.toContain("suggested ?? price");
    expect(packPriceForm).toContain('name="recalculate"');
  });
});
