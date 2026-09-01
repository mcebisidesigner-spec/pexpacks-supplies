import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("Grade Pack pricing contract", () => {
  it("calculates Grade Pack selling price from raw purchase cost, margin, then fixed pack costs", () => {
    const pricingSql = readRepoFile(
      "supabase/migrations/00081_apply_pack_costs_after_margin.sql",
    );

    expect(pricingSql).toContain("mp.latest_verified_cost");
    expect(pricingSql).toContain("COALESCE(pic.items_cost, 0) / (1.0 - s.margin_rate)");
    expect(pricingSql).toContain("+ s.packaging_cost + s.assembly_cost + s.freight_cost");
    expect(pricingSql).not.toContain("mp.current_selling_price");
    expect(pricingSql).not.toContain("selling_price_override");
  });

  it("does not overwrite school_packs.price from standalone item selling prices in admin code", () => {
    const adminItems = readRepoFile("lib/admin/items.ts");

    expect(adminItems).not.toContain("syncPackTotalPrice");
    expect(adminItems).not.toContain("update({ price: rounded");
  });
});