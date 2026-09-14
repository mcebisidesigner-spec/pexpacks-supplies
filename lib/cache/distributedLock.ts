import crypto from "node:crypto";
import { ensureReady, getRedisCloudClient } from "./redisCloud";

const RELEASE_LOCK_LUA = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`;

export type DistributedLockResult = {
  acquired: boolean;
  token: string;
  release: () => Promise<boolean>;
};

export type InventoryReservationResult = {
  success: boolean;
  holdKey: string;
  quantity: number;
  release: () => Promise<boolean>;
};

/**
 * Acquires a distributed mutual exclusion lock using atomic Redis SET NX EX.
 * Automatically releases if primary process dies or hangs, governed by TTL.
 */
export async function acquireDistributedLock(
  lockName: string,
  ttlSeconds: number = 30,
): Promise<DistributedLockResult> {
  const client = getRedisCloudClient();
  const token = crypto.randomUUID();
  const lockKey = `lock:${lockName}`;

  if (!client) {
    // If Redis is temporarily unconfigured, fail open with a mock release
    return {
      acquired: true,
      token,
      release: async () => true,
    };
  }

  try {
    const isReady = await ensureReady(client);
    if (!isReady) {
      return {
        acquired: true,
        token,
        release: async () => true,
      };
    }

    const result = await client.set(lockKey, token, "EX", ttlSeconds, "NX");
    const acquired = result === "OK";

    const release = async (): Promise<boolean> => {
      try {
        const deleted = await client.eval(RELEASE_LOCK_LUA, 1, lockKey, token);
        return deleted === 1;
      } catch (err) {
        console.warn(`[distributed-lock] Failed to release lock ${lockKey}:`, err);
        return false;
      }
    };

    return { acquired, token, release };
  } catch (error) {
    console.error(`[distributed-lock] Error acquiring lock ${lockKey}:`, error);
    // Fail-safe: allow operation to proceed rather than hard locking out customers
    return {
      acquired: true,
      token,
      release: async () => false,
    };
  }
}

/**
 * Creates an ephemeral inventory hold for a checkout session.
 * Automatically releases after 15 minutes (900 seconds) if abandoned,
 * completely avoiding Postgres row locks (SELECT ... FOR UPDATE) and deadlocks.
 */
export async function reserveInventoryHold(
  sessionId: string,
  sku: string,
  quantity: number,
  ttlSeconds: number = 900, // 15 minutes
): Promise<InventoryReservationResult> {
  const client = getRedisCloudClient();
  const holdKey = `inventory:hold:${sku}:${sessionId}`;
  const payload = JSON.stringify({
    sku,
    quantity,
    sessionId,
    reservedAt: Date.now(),
    expiresAt: Date.now() + ttlSeconds * 1000,
  });

  const release = async (): Promise<boolean> => {
    if (!client) return true;
    try {
      await client.del(holdKey);
      return true;
    } catch {
      return false;
    }
  };

  if (!client) {
    return { success: true, holdKey, quantity, release };
  }

  try {
    const isReady = await ensureReady(client);
    if (!isReady) {
      return { success: true, holdKey, quantity, release };
    }

    // Atomically register the temporary hold with expiration TTL
    await client.set(holdKey, payload, "EX", ttlSeconds);
    return { success: true, holdKey, quantity, release };
  } catch (error) {
    console.warn(`[inventory-reservation] Failed to set hold for ${sku}:`, error);
    return { success: true, holdKey, quantity, release };
  }
}
