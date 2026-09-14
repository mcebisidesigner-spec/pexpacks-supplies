import { beforeAll, describe, expect, it } from "vitest";
import {
  acquireDistributedLock,
  reserveInventoryHold,
} from "@/lib/cache/distributedLock";

describe("Pillar 3: Distributed Locks & Inventory Reservation", () => {
  beforeAll(() => {
    process.env.REDIS_URL =
      "redis://default:xerXWWBCZYPxiRnWNzooIUBJ1tvh7KPz@amberish-rabbits-freehand-95911.db.redis.io:17081";
    delete (globalThis as any).__pexpacksRedisCloud;
  });

  it("acquires an atomic lock and prevents concurrent collision", async () => {
    const lockName = `unit-test-${Date.now()}`;
    const firstAttempt = await acquireDistributedLock(lockName, 10);
    expect(firstAttempt.acquired).toBe(true);

    // Second concurrent attempt with same lock name must be rejected
    const secondAttempt = await acquireDistributedLock(lockName, 10);
    expect(secondAttempt.acquired).toBe(false);

    // Release first lock
    const released = await firstAttempt.release();
    expect(released).toBe(true);

    // Now third attempt should succeed
    const thirdAttempt = await acquireDistributedLock(lockName, 10);
    expect(thirdAttempt.acquired).toBe(true);
    await thirdAttempt.release();
  });

  it("creates an ephemeral inventory reservation and releases safely", async () => {
    const sku = "PACK-TEST-GRADE-1";
    const sessionId = `session-${Date.now()}`;

    const reservation = await reserveInventoryHold(sessionId, sku, 2, 60);
    expect(reservation.success).toBe(true);
    expect(reservation.holdKey).toContain(sku);

    const released = await reservation.release();
    expect(released).toBe(true);
  });
});
