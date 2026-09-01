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
    expect(pricingSql).toContain("COALESCE(pic.items_cost, 0) / (1.0 - s.margin_rate)");
    expect(pricingSql).toContain("+ s.packaging_cost + s.assembly_cost + s.freight_cost");
    expect(pricingSql).not.toContain("mp.latest_verified_cost");
  });

  it("does not overwrite school_packs.price from standalone item selling prices in admin code", () => {
    const adminItems = readRepoFile("lib/admin/items.ts");

    expect(adminItems).not.toContain("syncPackTotalPrice");
    expect(adminItems).not.toContain("update({ price: rounded");
  });

  it("ensures get_public_school_pack aggregates pexcover fields and calculates pexcover totals", async () => {
    const migrationSql = readRepoFile(
      "supabase/migrations/00082_restore_pexcover_fields_to_public_school_pack.sql",
    );

    expect(migrationSql).toContain("'requires_pexcover', COALESCE(i.requires_pexcover, false)");
    expect(migrationSql).toContain("'pexco_code', i.pexco_code");
    expect(migrationSql).toContain("'pexco_rate_cents', i.pexco_rate_cents");
    expect(migrationSql).toContain("'pexco_rate_active', COALESCE(i.pexco_rate_active, false)");

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
    const packPriceForm = readRepoFile("components/admin/packs/PackPriceForm.tsx");
    expect(packPriceForm).not.toContain("suggested ?? price");
    expect(packPriceForm).toContain('name="recalculate"');
  });
});