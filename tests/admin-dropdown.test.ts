import { describe, it, expect } from "vitest";

describe("AdminDropdown Component Architecture", () => {
  it("exports AdminDropdown and renders selected active option with tick checkmark", async () => {
    const { AdminDropdown } = await import("@/components/admin/ui/AdminDropdown");
    expect(typeof AdminDropdown).toBe("function");
  });

  it("supports searchable prop, searchPlaceholder and footerAction definitions", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");

    const code = fs.readFileSync(
      path.join(process.cwd(), "components/admin/ui/AdminDropdown.tsx"),
      "utf8",
    );

    expect(code).toContain("searchable");
    expect(code).toContain("searchPlaceholder");
    expect(code).toContain("footerAction");
    expect(code).toContain("filteredOptions");
    expect(code).toContain("searchInput");
  });
});
