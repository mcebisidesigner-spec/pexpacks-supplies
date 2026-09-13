import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/00123_consolidate_administrative_rls_policies.sql",
  ),
  "utf8",
);

describe("administrative RLS policy consolidation", () => {
  it("consolidates only the proved manager/read policy pairs", () => {
    for (const table of [
      "admin_letter_templates",
      "approvals",
      "brands",
      "procurement_requirements",
      "suppliers",
      "user_roles",
    ]) {
      expect(migration).toContain(`('${table}',`);
    }
    expect(migration).toContain("FOR SELECT TO authenticated USING");
    expect(migration).toContain("FOR INSERT TO authenticated WITH CHECK");
    expect(migration).toContain("FOR UPDATE TO authenticated USING");
    expect(migration).toContain("FOR DELETE TO authenticated USING");
  });

  it("does not mechanically alter public or archival policy contracts", () => {
    expect(migration).not.toContain("blog_posts");
    expect(migration).not.toContain("system_settings");
    expect(migration).not.toContain("order_events_archive");
  });
});
