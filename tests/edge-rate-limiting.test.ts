import { beforeAll, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import {
  createAdminSessionValue,
  hashSessionToken,
  isSessionActiveInRedis,
  recordAdminSessionRedis,
  revokeAdminSessionRedis,
  touchAdminSessionRedis,
} from "@/lib/admin/session-policy";

describe("Pillar 2 & 4: Edge Rate Limiting & Sliding Session Validation", () => {
  beforeAll(() => {
    process.env.UPSTASH_REDIS_REST_URL =
      "https://classic-crane-169938.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN =
      "gQAAAAAAApfSAAIgcDJjY2Q3MThhYTZlOGM0ODZmYWE3YjY0OTFkYThmMWI1Zg";
    process.env.ADMIN_SESSION_SECRET =
      "test-secret-that-is-at-least-32-characters-long!";
  });
  it("enforces sliding session recording, touch, and instant revocation in Redis", async () => {
    const testSessionVal = await createAdminSessionValue(
      "test-user-id",
      "standard",
    );
    const keyId = await hashSessionToken(testSessionVal);
    expect(keyId).toBeDefined();
    expect(keyId.length).toBe(32);

    // 1. Record session
    await recordAdminSessionRedis(testSessionVal, "test-user-id", 60);
    const isActive = await isSessionActiveInRedis(testSessionVal);
    expect(isActive).toBe(true);

    // 2. Touch session (slide window)
    const touched = await touchAdminSessionRedis(testSessionVal, 1200);
    expect(touched).toBe(true);

    // 3. Revoke session instantly
    await revokeAdminSessionRedis(testSessionVal);
    const afterRevoke = await isSessionActiveInRedis(testSessionVal);
    expect(afterRevoke).toBe(false);
  });

  it("handles edge rate-limiting and emits compliant RFC headers on 429", async () => {
    // Generate a unique dummy IP for rate limiting test
    const testIp = `192.0.2.${Math.floor(Math.random() * 200) + 50}`;

    // Send 5 burst requests to /api/auth/verify
    for (let i = 0; i < 5; i++) {
      const req = new NextRequest("http://localhost/api/auth/verify", {
        headers: { "x-forwarded-for": testIp },
      });
      await proxy(req);
    }

    // 6th request must trigger 429 Too Many Requests
    const blockedReq = new NextRequest("http://localhost/api/auth/verify", {
      headers: { "x-forwarded-for": testIp },
    });
    const blockedRes = await proxy(blockedReq);

    expect(blockedRes.status).toBe(429);
    expect(blockedRes.headers.get("Content-Type")).toContain("application/json");
    expect(blockedRes.headers.get("Retry-After")).toBeDefined();
    expect(blockedRes.headers.get("X-RateLimit-Limit")).toBe("5");
    expect(blockedRes.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(blockedRes.headers.get("X-RateLimit-Reset")).toBeDefined();
  });
});
