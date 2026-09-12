import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("database reconciliation audit", () => {
  it("reports only aggregate compatibility checks", () => {
    const script = readFileSync(
      resolve(root, "scripts/db-reconciliation-audit.cjs"),
      "utf8",
    );
    expect(script).toContain("const pageSize = 1000");
    expect(script).toContain("all.push(...page)");
    expect(script).toContain("missing_or_blank_slug");
    expect(script).toContain("duplicate_slug_values");
    expect(script).toContain("missing_school_context");
    expect(script).toContain("delivery_fee_over_two_decimals");
    expect(script).toContain("discount_amount_over_two_decimals");
    expect(script).not.toContain("console.log(data)");
  });
});