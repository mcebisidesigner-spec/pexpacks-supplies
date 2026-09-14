import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("brands API authorization", () => {
  it("requires catalogue management permission for brand creation", () => {
    const route = readFileSync(
      resolve(process.cwd(), "app/api/brands/route.ts"),
      "utf8",
    );

    expect(route).toContain('hasPermission(session, "catalogue.manage")');
    expect(route).toContain('error: "Forbidden"');
    expect(route).toContain("isSameOriginRequest(request)");
  });
});
