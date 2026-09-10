import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("least-privilege database audit controls", () => {
  it("does not grant every authenticated user unrestricted letter-template access", () => {
    const migration = read(
      "supabase/migrations/00104_create_letter_templates.sql",
    );
    expect(migration).toContain("public.has_permission('orders.view')");
    expect(migration).toContain("public.has_permission('orders.edit')");
    expect(migration).not.toContain("USING (true)");
  });

  it("keeps operational event payloads and raw website content server-only", () => {
    const migration = read(
      "supabase/migrations/00105_least_privilege_event_and_content_access.sql",
    );
    for (const table of [
      "order_events",
      "pack_events",
      "quotation_events",
      "website_content",
    ]) {
      expect(migration).toContain(
        `REVOKE ALL ON TABLE public.${table} FROM anon, authenticated;`,
      );
    }
  });

  it("requires order edit permission for letter mutations and sending", () => {
    const actions = read("app/admin/letters/actions.ts");
    expect(actions).toContain("saveLetterAction");
    expect(actions).toContain("deleteLetterAction");
    expect(actions).toContain("sendLetterEmailAction");
    expect(actions).toContain('requireAdmin({ permission: "orders.edit" })');
  });
  it("recreates restrictive letter-template policies during remote reconciliation", () => {
    const migration = read(
      "supabase/migrations/00105_least_privilege_event_and_content_access.sql",
    );
    expect(migration).toContain(
      "DROP POLICY IF EXISTS \"Authenticated staff full access letter templates\"",
    );
    expect(migration).toContain("public.has_permission('orders.view')");
    expect(migration).toContain("public.has_permission('orders.edit')");
  });
  it("uses conservative autovacuum settings for the high-churn pack table", () => {
    const migration = read(
      "supabase/migrations/00106_school_packs_autovacuum_tuning.sql",
    );
    expect(migration).toContain("ALTER TABLE public.school_packs SET");
    expect(migration).toContain("autovacuum_vacuum_scale_factor = 0.02");
    expect(migration).toContain("autovacuum_analyze_scale_factor = 0.02");
    expect(migration).not.toContain("VACUUM FULL");
  });
  it("removes direct browser grants from sensitive relations and maintenance functions", () => {
    const migration = read(
      "supabase/migrations/00108_revoke_direct_sensitive_access.sql",
    );
    expect(migration).toContain("public.master_products");
    expect(migration).toContain("public.orders");
    expect(migration).toContain("public.suppliers");
    expect(migration).toContain("public.payments");
    expect(migration).toContain("'fn_sync_pack_total_price()'");
    expect(migration).toContain("FROM anon, authenticated;");
  });
  it("keeps unpublished brand and variant cost data off direct public access", () => {
    const migration = read(
      "supabase/migrations/00107_create_brands_and_product_variants.sql",
    );
    expect(migration).toContain("REVOKE ALL ON TABLE public.brands, public.product_variants FROM anon, authenticated;");
    expect(migration).toContain("public.has_permission('catalogue.view')");
    expect(migration).toContain("public.has_permission('catalogue.manage')");
    expect(migration).not.toContain("public.admin_users");
  });
  it("keeps future public-schema tables and functions private by default", () => {
    const migration = read(
      "supabase/migrations/00109_secure_public_schema_default_privileges.sql",
    );
    expect(migration).toContain("REVOKE ALL ON TABLES FROM anon, authenticated");
    expect(migration).toContain("REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC");
    expect(migration).toContain("GRANT EXECUTE ON FUNCTIONS TO service_role");
  });
});
