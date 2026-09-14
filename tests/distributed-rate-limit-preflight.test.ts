import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("distributed rate-limit deployment preflight", () => {
  it("provides an explicit production readiness check without exposing secrets", () => {
    const script = readFileSync(
      resolve(root, "scripts/check-distributed-rate-limit.cjs"),
      "utf8",
    );
    const packageJson = readFileSync(resolve(root, "package.json"), "utf8");

    expect(script).toContain("UPSTASH_REDIS_REST_URL");
    expect(script).toContain("UPSTASH_REDIS_REST_TOKEN");
    expect(
      readFileSync(
        resolve(root, "lib/security/distributed-auth-rate-limit.ts"),
        "utf8",
      ),
    ).toContain("VERCEL_ENV === \"production\"");
    expect(script).not.toContain("console.log(process.env");
    expect(packageJson).toContain('"capacity:preflight"');
  });
});
