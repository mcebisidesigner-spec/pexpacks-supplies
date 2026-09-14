import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("admin school search security", () => {
  it("requires a relevant permission and does not expose database errors", () => {
    const route = readFileSync(
      resolve(process.cwd(), "app/api/admin/schools/search/route.ts"),
      "utf8",
    );

    expect(route).toContain('hasPermission(session, "schools.view")');
    expect(route).toContain('hasPermission(session, "orders.view")');
    expect(route).toContain("School search is temporarily unavailable.");
    expect(route).toContain("keyPrefix: \"admin-school-search\"");
    expect(route).toContain("max: 120");
    expect(route).not.toContain("error: error.message");
  });
});
