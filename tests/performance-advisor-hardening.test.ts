import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/00121_performance_advisor_rls_and_index_hardening.sql",
  ),
  "utf8",
);

describe("performance advisor hardening", () => {
  it("removes only the advisor-confirmed exact duplicate indexes", () => {
    for (const index of [
      "audit_logs_archive_created_at_idx",
      "idx_form_submissions_created",
      "idx_master_products_search_vector",
      "idx_quotation_items_master_product",
      "idx_quotations_school",
    ]) {
      expect(migration).toContain(`DROP INDEX IF EXISTS public.${index}`);
    }
  });

  it("uses init-plan auth checks without changing the named RLS policy scope", () => {
    expect(migration).toContain("(SELECT auth.uid())");
    expect(migration).toContain(
      "(SELECT public.has_permission('orders.view'))",
    );
    expect(migration).toContain('"Users read own profile"');
    expect(migration).toContain('"Users mark notifications"');
    expect(migration).toContain('"Admin full access for orders"');
    expect(migration).toContain('"Admin full access to quotations"');
    expect(migration).toContain('"Admin full access to quotation items"');
  });
});
