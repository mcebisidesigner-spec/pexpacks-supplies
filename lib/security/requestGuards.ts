import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";

type RateLimitConfig = {
  keyPrefix: string;
  windowMs: number;
  max: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
};

const localStore = new Map<string, RateLimitBucket>();
const distributedLimiters = new Map<string, Ratelimit>();
let redisClient: Redis | null | undefined;

function getClientAddress(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfIp = request.headers.get("cf-connecting-ip");

  return (
    forwardedFor?.split(",")[0]?.trim() ||
    realIp?.trim() ||
    cfIp?.trim() ||
    "unknown"
  );
}

function getAllowedOrigins(request: NextRequest) {
  const allowed = new Set<string>([request.nextUrl.origin]);
  const configuredSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  const vercelUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "";

  for (const value of [configuredSiteUrl, vercelUrl]) {
    if (!value) continue;

    try {
      allowed.add(new URL(value).origin);
    } catch {
      // Ignore malformed environment values.
    }
  }

  return allowed;
}

function getRedisClient(): Redis | null {
  if (redisClient !== undefined) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redisClient = url && token ? new Redis({ url, token }) : null;
  return redisClient;
}

function getDistributedLimiter(config: RateLimitConfig): Ratelimit | null {
  const redis = getRedisClient();
  if (!redis) return null;

  const durationSeconds = Math.max(1, Math.ceil(config.windowMs / 1000));
  const cacheKey = `${config.keyPrefix}:${config.max}:${durationSeconds}`;
  const existing = distributedLimiters.get(cacheKey);
  if (existing) return existing;

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      config.max,
      `${durationSeconds} s` as `${number} s`,
    ),
    prefix: `pexpacks:rate-limit:${config.keyPrefix}`,
    analytics: false,
  });
  distributedLimiters.set(cacheKey, limiter);
  return limiter;
}

function applyLocalLimit(
  key: string,
  windowMs: number,
  max: number,
): RateLimitResult {
  const now = Date.now();
  const current = localStore.get(key);

  if (!current || current.resetAt <= now) {
    localStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, retryAfter: 0 };
  }

  if (current.count >= max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, max - current.count),
    retryAfter: 0,
  };
}

export function isSameOriginRequest(request: NextRequest) {
  const origin = request.headers.get("origin");
  const method = request.method;

  if (!origin && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return false;
  }

  if (!origin) return true;
  return getAllowedOrigins(request).has(origin);
}

/**
 * Uses Upstash Redis when configured so a Vercel deployment shares limits across
 * instances. The memory fallback keeps local development usable without Redis.
 */
export async function rateLimitRequest(
  request: NextRequest,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const key = `${config.keyPrefix}:${getClientAddress(request)}`;
  const limiter = getDistributedLimiter(config);

  if (limiter) {
    try {
      const result = await limiter.limit(getClientAddress(request));
      return {
        allowed: result.success,
        remaining: result.remaining,
        retryAfter: result.success
          ? 0
          : Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
      };
    } catch (error) {
      // Redis outages must not take down checkout. The local fallback limits a
      // single warm instance and records the degradation for operational review.
      console.error(
        "[rate-limit] Upstash unavailable; using local fallback.",
        error,
      );
    }
  }

  return applyLocalLimit(key, config.windowMs, config.max);
}
