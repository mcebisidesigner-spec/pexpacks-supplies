import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/00122_consolidate_high_traffic_rls_policies.sql",
  ),
  "utf8",
);

describe("high-traffic RLS policy consolidation", () => {
  it("replaces overlapping broad manager policies with explicit write policies", () => {
    for (const table of [
      "cms_announcements",
      "cms_faqs",
      "cms_resources",
      "cms_testimonials",
      "master_products",
      "school_pack_items",
      "school_packs",
      "orders",
    ]) {
      expect(migration).toContain(`ON public.${table} FOR INSERT`);
      expect(migration).toContain(`ON public.${table} FOR UPDATE`);
      expect(migration).toContain(`ON public.${table} FOR DELETE`);
    }
  });

  it("keeps public school pack visibility constrained and preserves delegated reads", () => {
    expect(migration).toContain("visible IS TRUE");
    expect(migration).toContain("publication_status");
    expect(migration).toContain("public.has_permission('packs.view')");
    expect(migration).toContain("public.has_permission('content.view')");
    expect(migration).toContain("public.has_permission('orders.view')");
    expect(migration).toContain("public.has_permission('orders.edit')");
  });

  it("keeps anonymous order creation and service-role access untouched", () => {
    expect(migration).not.toContain(
      'DROP POLICY IF EXISTS "Enable anonymous insert for orders"',
    );
    expect(migration).not.toContain(
      'DROP POLICY IF EXISTS "Service role full access for orders"',
    );
  });
});
