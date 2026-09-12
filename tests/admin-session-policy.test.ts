import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import {
  ADMIN_STANDARD_IDLE_MS,
  ADMIN_TRUSTED_IDLE_MS,
  createAdminSessionValue,
  verifyAdminSessionValue,
} from "@/lib/admin/session-policy";

beforeAll(() => {
  process.env.ADMIN_SESSION_SECRET = "test-admin-session-signing-secret";
});

describe("admin session policy", () => {
  it("keeps admin heartbeat responses out of browser and proxy caches", () => {
    const route = readFileSync(
      resolve(process.cwd(), "app/api/admin/session/heartbeat/route.ts"),
      "utf8",
    );
    expect(route).toContain('export const dynamic = "force-dynamic"');
    expect(route).toContain('"Cache-Control": "no-store, max-age=0"');
  });

  it("does not reuse the Supabase service-role key for admin cookie signing", () => {
    const source = readFileSync(
      resolve(process.cwd(), "lib/admin/session-policy.ts"),
      "utf8",
    );
    expect(source).toContain('process.env.ADMIN_SESSION_SECRET || ""');
    expect(source).not.toContain("process.env.SUPABASE_SERVICE_ROLE_KEY");
  });

  it("accepts a valid signed session for the matching user", async () => {
    const value = await createAdminSessionValue("user-1", "standard");

    await expect(
      verifyAdminSessionValue(value, "user-1"),
    ).resolves.toMatchObject({
      mode: "standard",
    });
  });

  it("rejects a tampered value and a mismatched user", async () => {
    const value = await createAdminSessionValue("user-1", "trusted");

    await expect(
      verifyAdminSessionValue(`${value}x`, "user-1"),
    ).resolves.toBeNull();
    await expect(verifyAdminSessionValue(value, "user-2")).resolves.toBeNull();
  });

  it("expires standard and trusted sessions at their respective idle limits", async () => {
    const standard = await createAdminSessionValue(
      "user-1",
      "standard",
      Date.now() - ADMIN_STANDARD_IDLE_MS - 1,
    );
    const trusted = await createAdminSessionValue(
      "user-1",
      "trusted",
      Date.now() - ADMIN_TRUSTED_IDLE_MS - 1,
    );

    await expect(
      verifyAdminSessionValue(standard, "user-1"),
    ).resolves.toBeNull();
    await expect(
      verifyAdminSessionValue(trusted, "user-1"),
    ).resolves.toBeNull();
  });
});
