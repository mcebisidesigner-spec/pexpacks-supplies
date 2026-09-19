import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error cjs script without bundled type declarations
import { verifyMigrationGovernance } from "../scripts/verify-migration-governance.cjs";

const root = process.cwd();

describe("Supabase Migration Governance & Safety Rules", () => {
  it("enforces valid migration naming and sequence continuity with 0 errors", () => {
    const result = verifyMigrationGovernance();
    expect(result.errors).toEqual([]);
    expect(result.totalMigrations).toBeGreaterThanOrEqual(129);
    expect(result.latestNumber).toBeGreaterThanOrEqual(130);
  });

  it("verifies the formal Database Governance policy document exists and defines zero-downtime rules", () => {
    const docPath = resolve(root, "docs/DATABASE_GOVERNANCE.md");
    expect(existsSync(docPath)).toBe(true);

    const doc = readFileSync(docPath, "utf8");
    expect(doc).toContain("Zero-Downtime Safe Evolutions");
    expect(doc).toContain("Expansion / Contraction");
    expect(doc).toContain("Row-Level Security");
    expect(doc).toContain("master_products");
    expect(doc).toContain("school_pack_items");
    expect(doc).toContain("order_items");
    expect(doc).toContain("system_settings");
  });

  it("verifies migration README adheres to append-only rules", () => {
    const readmePath = resolve(root, "supabase/migrations/README.md");
    expect(existsSync(readmePath)).toBe(true);

    const readme = readFileSync(readmePath, "utf8");
    expect(readme).toContain("append-only");
    expect(readme).toContain("Do not delete migration files");
    expect(readme).toContain("Do not rewrite migrations");
  });
});
