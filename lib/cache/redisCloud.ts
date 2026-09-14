import Redis, { RedisOptions } from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var __pexpacksRedisCloud: Redis | null | undefined;
}

const DEFAULT_CACHE_TTL_SECONDS = 3600; // 1 hour

function createRedisCloudClient(): Redis | null {
  const url = process.env.REDIS_URL || process.env.pexpacks_REDIS_URL;
  if (!url) {
    return null;
  }

  const options: RedisOptions = {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    connectTimeout: 3000,
    enableOfflineQueue: false,
    retryStrategy(times) {
      if (times > 3) return null; // stop retrying after 3 attempts
      return Math.min(times * 200, 1000);
    },
  };

  try {
    const client = new Redis(url, options);

    client.on("error", (err) => {
      // Graceful background logging: do not crash serverless process
      if (process.env.NODE_ENV !== "test") {
        console.warn("[redis-cloud] Connection warning:", err?.message || err);
      }
    });

    return client;
  } catch (error) {
    console.warn("[redis-cloud] Failed to initialize Redis client:", error);
    return null;
  }
}

async function ensureReady(client: Redis): Promise<boolean> {
  if (client.status === "ready") return true;

  if (client.status === "wait") {
    try {
      await client.connect();
      return (client.status as string) === "ready";
    } catch {
      return false;
    }
  }

  if (client.status === "connecting" || client.status === "connect") {
    return new Promise((resolve) => {
      const onReady = () => {
        cleanup();
        resolve(true);
      };
      const onError = () => {
        cleanup();
        resolve(false);
      };
      const timer = setTimeout(() => {
        cleanup();
        resolve(false);
      }, 2500);

      function cleanup() {
        clearTimeout(timer);
        client.off("ready", onReady);
        client.off("error", onError);
      }

      client.once("ready", onReady);
      client.once("error", onError);
    });
  }

  return false;
}

/**
 * Returns the singleton Redis Cloud client instance.
 * Safe for Next.js hot-reloading and serverless invocation reuse.
 */
export function getRedisCloudClient(): Redis | null {
  if (globalThis.__pexpacksRedisCloud !== undefined) {
    return globalThis.__pexpacksRedisCloud;
  }

  globalThis.__pexpacksRedisCloud = createRedisCloudClient();
  return globalThis.__pexpacksRedisCloud;
}

/**
 * Fetches and deserializes a JSON value from Redis Cloud cache.
 * Returns null if key does not exist, Redis is unconfigured, or an error occurs.
 */
export async function getCachedJson<T>(key: string): Promise<T | null> {
  const client = getRedisCloudClient();
  if (!client) return null;

  try {
    const isReady = await ensureReady(client);
    if (!isReady) return null;

    const raw = await client.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    // Non-blocking: fail open so application stays functional
    return null;
  }
}

/**
 * Serializes and saves a JSON value to Redis Cloud with an expiration TTL.
 */
export async function setCachedJson<T>(
  key: string,
  value: T,
  ttlSeconds: number = DEFAULT_CACHE_TTL_SECONDS,
): Promise<boolean> {
  const client = getRedisCloudClient();
  if (!client) return false;

  try {
    const isReady = await ensureReady(client);
    if (!isReady) return false;

    const payload = JSON.stringify(value);
    await client.set(key, payload, "EX", ttlSeconds);
    return true;
  } catch {
    // Non-blocking: failure to write cache must never crash the primary request
    return false;
  }
}

/**
 * Deletes a cached entry from Redis Cloud.
 */
export async function deleteCached(key: string): Promise<boolean> {
  const client = getRedisCloudClient();
  if (!client) return false;

  try {
    const isReady = await ensureReady(client);
    if (!isReady) return false;

    await client.del(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * High-level Cache-Aside wrapper.
 * Attempts to read from Redis Cloud cache; on miss or failure, calls fetcher and caches result.
 */
export async function getOrSetCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = DEFAULT_CACHE_TTL_SECONDS,
): Promise<T> {
  const cached = await getCachedJson<T>(key);
  if (cached !== null) {
    return cached;
  }

  const fresh = await fetcher();

  // Asynchronously populate cache without blocking return if desired,
  // or await safely:
  if (fresh !== undefined && fresh !== null) {
    await setCachedJson(key, fresh, ttlSeconds);
  }

  return fresh;
}
