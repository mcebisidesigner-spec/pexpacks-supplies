import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("pgTAP Database Test Suite Structure & Coverage", () => {
  const testFiles = [
    "supabase/tests/00001_schema_invariants.sql",
    "supabase/tests/00002_rls_policies.sql",
    "supabase/tests/00003_functions_and_triggers.sql",
  ];

  it("ensures all pgTAP test files exist and follow isolated transaction patterns", () => {
    for (const relativePath of testFiles) {
      const fullPath = resolve(root, relativePath);
      expect(existsSync(fullPath), `File ${relativePath} must exist`).toBe(true);

      const content = readFileSync(fullPath, "utf8");
      expect(content).toContain("BEGIN;");
      expect(content).toContain("SELECT plan(");
      expect(content).toContain("SELECT * FROM finish();");
      expect(content).toContain("ROLLBACK;");
    }
  });

  it("verifies 00001_schema_invariants.sql covers canonical platform tables and keys", () => {
    const content = readFileSync(
      resolve(root, "supabase/tests/00001_schema_invariants.sql"),
      "utf8",
    );
    const expectedTables = [
      "master_products",
      "school_packs",
      "school_pack_items",
      "orders",
      "order_items",
      "system_settings",
      "brands",
      "quotations",
      "documents_letters",
    ];

    for (const table of expectedTables) {
      expect(content).toContain(`has_table('public', '${table}'`);
      expect(content).toContain(`has_pk('public', '${table}'`);
    }

    expect(content).toContain("has_fk('public', 'school_pack_items'");
    expect(content).toContain("has_fk('public', 'order_items'");
  });

  it("verifies 00002_rls_policies.sql tests row security and role permissions", () => {
    const content = readFileSync(
      resolve(root, "supabase/tests/00002_rls_policies.sql"),
      "utf8",
    );
    expect(content).toContain("row_security_active('public', 'master_products')");
    expect(content).toContain("row_security_active('public', 'orders')");
    expect(content).toContain("row_security_active('public', 'system_settings')");
    expect(content).toContain("SET LOCAL ROLE anon;");
    expect(content).toContain("throws_ok(");
    expect(content).toContain("is_admin");
  });

  it("verifies 00003_functions_and_triggers.sql audits search_path and public RPCs", () => {
    const content = readFileSync(
      resolve(root, "supabase/tests/00003_functions_and_triggers.sql"),
      "utf8",
    );
    expect(content).toContain("get_public_school_directory");
    expect(content).toContain("get_public_school_pack");
    expect(content).toContain("search_master_products_v2");
    expect(content).toContain("trigger_update_master_products_updated_at");
    expect(content).toContain("prosecdef = true");
    expect(content).toContain("search_path=");
  });

  it("verifies package.json exposes test:db script", () => {
    const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
    expect(pkg.scripts["test:db"]).toBe("supabase test db");
  });
});
