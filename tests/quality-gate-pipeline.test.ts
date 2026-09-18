import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("CI / Quality Gate Pipeline Readiness", () => {
  it("verifies scripts/quality-gate.cjs exists and defines all sequential gates", () => {
    const scriptPath = resolve(root, "scripts/quality-gate.cjs");
    expect(existsSync(scriptPath), "scripts/quality-gate.cjs must exist").toBe(true);

    const content = readFileSync(scriptPath, "utf8");
    expect(content).toContain("Gate 1: TypeScript Static Type Safety");
    expect(content).toContain("npx tsc --noEmit");
    expect(content).toContain("Gate 2: Database Migration & Governance Integrity");
    expect(content).toContain("node scripts/verify-migration-governance.cjs");
    expect(content).toContain("Gate 3: Full Vitest Automated Regression Suite");
    expect(content).toContain("npx vitest run");
  });

  it("verifies package.json exposes check:all script", () => {
    const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
    expect(pkg.scripts["check:all"]).toBe("node scripts/quality-gate.cjs");
  });

  it("verifies .github/workflows/ci.yml incorporates multi-tier quality gates and artifact archiving", () => {
    const ciPath = resolve(root, ".github/workflows/ci.yml");
    const ciContent = readFileSync(ciPath, "utf8");

    expect(ciContent).toContain("Verify database migration governance");
    expect(ciContent).toContain("node scripts/verify-migration-governance.cjs");
    expect(ciContent).toContain("npm run audit:perf");
    expect(ciContent).toContain("npm run check:preview");
    expect(ciContent).toContain("npm run test:a11y");
    expect(ciContent).toContain("npm run test:visual");
    expect(ciContent).toContain("actions/upload-artifact@v4");
    expect(ciContent).toContain("actions/cache@v4");
    expect(ciContent).toContain("cancel-in-progress: true");
    expect(ciContent).toContain("npm run lint");
    expect(ciContent).toContain("npm test");
    expect(ciContent).toContain("npm run build");
  });

  it("verifies docs/CI_QUALITY_GATE.md documents all 6 defense layers", () => {
    const docPath = resolve(root, "docs/CI_QUALITY_GATE.md");
    expect(existsSync(docPath), "docs/CI_QUALITY_GATE.md must exist").toBe(true);

    const doc = readFileSync(docPath, "utf8");
    expect(doc).toContain("Layer 1: Type Safety");
    expect(doc).toContain("Layer 2: Database Governance");
    expect(doc).toContain("Layer 3: Unit & Domain Suites");
    expect(doc).toContain("Layer 4: Database Unit Testing");
    expect(doc).toContain("Layer 5: End-to-End Journeys");
    expect(doc).toContain("Layer 6: Production Build");
  });
});
