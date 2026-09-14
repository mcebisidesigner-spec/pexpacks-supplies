import { Redis } from "@upstash/redis";
import {
  checkRateLimit as checkLocalRateLimit,
  recordFailedAttempt as recordLocalFailedAttempt,
  resetRateLimit as resetLocalRateLimit,
} from "@/lib/security/rate-limit";

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 15 * 60;
const PREFIX = "pexpacks:auth-fail:";
let redis: Redis | null | undefined;

type AuthRateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
};

function requiresDistributedRateLimit() {
  return process.env.VERCEL_ENV === "production";
}

function unavailableResult(): AuthRateLimitResult {
  // Never weaken production admin authentication when shared state is absent.
  return { allowed: false, remaining: 0, resetSeconds: WINDOW_SECONDS };
}

function client() {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

export async function checkAuthRateLimit(ip: string): Promise<AuthRateLimitResult> {
  const store = client();
  if (!store) {
    return requiresDistributedRateLimit()
      ? unavailableResult()
      : checkLocalRateLimit(ip);
  }

  try {
    const attempts = Number((await store.get<number>(`${PREFIX}${ip}`)) ?? 0);
    return {
      allowed: attempts < MAX_ATTEMPTS,
      remaining: Math.max(0, MAX_ATTEMPTS - attempts),
      resetSeconds: attempts >= MAX_ATTEMPTS ? WINDOW_SECONDS : 0,
    };
  } catch (error) {
    console.error("[security] Redis auth rate-limit read failed:", error);
    return requiresDistributedRateLimit()
      ? unavailableResult()
      : checkLocalRateLimit(ip);
  }
}

export async function recordAuthFailedAttempt(
  ip: string,
  userAgent?: string,
  emailMasked?: string,
) {
  const store = client();
  if (store) {
    try {
      const key = `${PREFIX}${ip}`;
      const attempts = await store.incr(key);
      if (attempts === 1) await store.expire(key, WINDOW_SECONDS);
    } catch (error) {
      console.error("[security] Redis auth rate-limit write failed:", error);
    }
  }
  await recordLocalFailedAttempt(ip, userAgent, emailMasked);
}

export async function resetAuthRateLimit(ip: string) {
  const store = client();
  if (store) {
    try {
      await store.del(`${PREFIX}${ip}`);
    } catch (error) {
      console.error("[security] Redis auth rate-limit reset failed:", error);
    }
  }
  resetLocalRateLimit(ip);
}
