import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("admin browser smoke test preflight", () => {
  it("verifies presence of critical admin portal entry points and session handlers", () => {
    const script = read("scripts/admin-browser-smoke-test.cjs");
    expect(script).toContain("app/pex-console-secure/page.tsx");
    expect(script).toContain("app/admin/layout.tsx");
    expect(script).toContain("app/api/admin/session/heartbeat/route.ts");
    expect(script).toContain("lib/admin/session-policy.ts");
  });

  it("includes clear operator instructions for live interactive verification", () => {
    const script = read("scripts/admin-browser-smoke-test.cjs");
    expect(script).toContain("/pex-console-secure");
    expect(script).toContain("/api/admin/session/heartbeat");
    expect(script).toContain("/admin/schools");
    expect(script).toContain("/admin/packs");
    expect(script).toContain("/admin/orders");
    expect(script).toContain("/admin/pricing");
    expect(script).toContain("/admin/settings");
  });
});
