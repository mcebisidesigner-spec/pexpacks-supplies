import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/00030_operations_foundation.sql"),
  "utf8",
).toLowerCase();

const supplierSeed = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/00031_seed_current_suppliers.sql",
  ),
  "utf8",
).toLowerCase();

describe("operations migration safeguards", () => {
  it("keeps Happy Pay under the Ozow provider model", () => {
    expect(migration).toContain("p_provider text default 'ozow'");
    expect(migration).toContain("p_payment_method text default 'ozow'");
  });

  it("does not introduce a lay-by or savings-plan domain", () => {
    expect(migration).not.toMatch(/create table[^;]*(lay.?by|saving.?plan)/);
  });

  it("enforces canonical SKU uniqueness and payment idempotency", () => {
    expect(migration).toContain("sku text not null unique");
    expect(migration).toContain("unique(provider, event_key)");
    expect(migration).toContain("complete_order_payment");
  });

  it("creates committed demand from verified paid order items", () => {
    expect(migration).toContain("procurement_requirements");
    expect(migration).toContain("procurement_requirement_orders");
    expect(migration).toContain("commercial_snapshot_locked_at");
  });

  it("seeds the current suppliers without duplicate supplier codes", () => {
    expect(supplierSeed).toContain("('makro', 'makro', true)");
    expect(supplierSeed).toContain("('bsc', 'bsc supplies', true)");
    expect(supplierSeed).toContain("on conflict (code) do update");
  });
});
