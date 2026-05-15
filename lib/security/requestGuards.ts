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

const buckets = new Map<string, RateLimitBucket>();

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
      // Ignore malformed environment values and fall back to the request host.
    }
  }

  return allowed;
}

export function isSameOriginRequest(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  return getAllowedOrigins(request).has(origin);
}

export function rateLimitRequest(
  request: NextRequest,
  { keyPrefix, windowMs, max }: RateLimitConfig
) {
  const now = Date.now();
  const key = `${keyPrefix}:${getClientAddress(request)}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, retryAfter: 0 };
  }

  if (current.count >= max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  buckets.set(key, current);

  return {
    allowed: true,
    remaining: Math.max(0, max - current.count),
    retryAfter: 0,
  };
}
