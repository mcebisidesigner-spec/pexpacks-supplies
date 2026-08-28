import { describe, expect, it } from "vitest";
import { SYSTEM_SETTING_CATEGORIES, SYSTEM_SETTING_DEFINITIONS } from "../lib/admin/system-settings";

describe("System Control Centre Settings Architecture", () => {
  it("defines all 19 categories cleanly including add_users", () => {
    expect(SYSTEM_SETTING_CATEGORIES.length).toBe(19);
    const keys = SYSTEM_SETTING_CATEGORIES.map((c) => c.key);
    expect(keys).toContain("overview");
    expect(keys).toContain("add_users");
    expect(keys).toContain("pricing");
    expect(keys).toContain("integrations");
    expect(keys).toContain("security");
    expect(keys).toContain("audit");
  });

  it("contains valid setting definitions with mandatory defaults", () => {
    expect(SYSTEM_SETTING_DEFINITIONS.length).toBeGreaterThan(10);
    for (const def of SYSTEM_SETTING_DEFINITIONS) {
      expect(def.key).toBeTruthy();
      expect(def.description).toBeTruthy();
      expect(def.defaultValue).toBeDefined();
    }
  });

  it("includes public runtime setting PexCover price and General store settings", () => {
    const pexcover = SYSTEM_SETTING_DEFINITIONS.find((d) => d.key === "pricing.pexcover_price");
    expect(pexcover).toBeDefined();
    expect(pexcover?.isPublic).toBe(true);
    expect(pexcover?.defaultValue).toBe(350);
  });

  it("requires approval for sensitive pricing and active season settings", () => {
    const season = SYSTEM_SETTING_DEFINITIONS.find((d) => d.key === "seasons.active_season");
    expect(season?.requiresApproval).toBe(true);

    const margin = SYSTEM_SETTING_DEFINITIONS.find((d) => d.key === "pricing.target_margin_pct");
    expect(margin?.requiresApproval).toBe(true);
  });
});
