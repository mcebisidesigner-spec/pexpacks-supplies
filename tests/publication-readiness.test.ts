import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const migration = readFileSync(
  resolve(root, "supabase/migrations/00134_enforce_school_pack_publication_readiness.sql"),
  "utf8",
);
const preflight = readFileSync(
  resolve(root, "scripts/publication-readiness-preflight.cjs"),
  "utf8",
);
const qualityGate = readFileSync(resolve(root, "scripts/quality-gate.cjs"), "utf8");

describe("school-pack publication readiness", () => {
  it("enforces the strict default publication policy in the database", () => {
    expect(migration).toContain("v_school.status IS DISTINCT FROM 'active'");
    expect(migration).toContain("v_school.published IS NOT TRUE");
    expect(migration).toContain("v_active_items");
    expect(migration).toContain("spi.pack_quantity < 1");
    expect(migration).toContain("mp.visibility IS DISTINCT FROM 'public'");
    expect(migration).toContain("v_pack.pricing_status");
    expect(migration).toContain("v_pack.price");
    expect(migration).toContain("school_packs_publication_guard");
    expect(migration).toContain("master_products_publication_guard");
    expect(migration).toContain("Moving a public pack back to draft is always allowed");
    expect(migration).not.toContain("OLD.visible IS TRUE OR OLD.publication_status = 'published'");
  });

  it("demotes invalid existing public rows and adds scoped public-grade uniqueness", () => {
    expect(migration).toContain("publication_status = 'draft'");
    expect(migration).toContain("visible = false");
    expect(migration).toContain("idx_school_packs_one_public_grade");
    expect(migration).toContain("WHERE visible IS TRUE AND publication_status = 'published'");
  });

  it("exposes a failing service-role preflight through the CI quality gate", () => {
    expect(preflight).toContain("assert_public_catalogue_ready");
    expect(preflight).toContain("process.exit(1)");
    expect(qualityGate).toContain("Gate 6: Public Catalogue Publication Readiness");
    expect(qualityGate).toContain("scripts/publication-readiness-preflight.cjs");
  });
});