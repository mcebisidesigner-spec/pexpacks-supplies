import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/00124_consolidate_public_and_archive_rls_policies.sql",
  ),
  "utf8",
);

describe("exceptional RLS policy consolidation", () => {
  it("preserves published public content and non-sensitive public settings", () => {
    expect(migration).toContain("published = true");
    expect(migration).toContain("is_public = true AND is_sensitive = false");
    expect(migration).toContain("FOR SELECT TO anon, authenticated");
  });

  it("keeps writes restricted and archive events read-only for authenticated roles", () => {
    expect(migration).toContain("public.has_permission('content.edit')");
    expect(migration).toContain("public.has_permission('settings.manage')");
    expect(migration).toContain("public.has_permission('audit.view')");
    expect(migration).toContain("public.has_permission('orders.view')");
    expect(migration).not.toContain("order_events_archive FOR INSERT");
  });
});
