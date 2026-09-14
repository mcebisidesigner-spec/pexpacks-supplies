import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const routeSource = readFileSync(
  new URL("../app/api/ozow/webhook/route.ts", import.meta.url),
  "utf8",
);

describe("Ozow webhook security contract", () => {
  it("uses a constant-time signature comparison", () => {
    expect(routeSource).toContain('timingSafeEqual(');
    expect(routeSource).toContain('/^[a-f0-9]{128}$/.test(providedHash)');
  });

  it("rejects callbacks from a mismatched Ozow environment", () => {
    expect(routeSource).toContain('webhookIsTest !== config.isTest');
    expect(routeSource).toContain('Invalid payment environment.');
  });

  it("does not dispatch another receipt for an idempotent payment replay", () => {
    expect(routeSource).toContain('if (result.alreadyPaid)');
    expect(routeSource.indexOf('if (result.alreadyPaid)')).toBeLessThan(
      routeSource.indexOf('dispatchPurchaseReceipt(TransactionReference)'),
    );
  });
});