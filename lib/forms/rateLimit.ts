import { createHash } from "crypto";
import { logger } from "@/lib/logger";

type RateLimitResult = {
  allowed: boolean;
  identifier: string;
  remaining?: number;
};

const limit = 5;
const windowSeconds = 10 * 60;

export function hashIp(ip: string) {
  return createHash("sha256")
    .update(`${process.env.IP_HASH_SALT ?? "pexpacks"}:${ip}`)
    .digest("hex")
    .slice(0, 16);
}

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const identifier = hashIp(ip || "unknown");

  if (!url || !token) {
    if (process.env.NODE_ENV !== "production") {
      logger.warn("Upstash Redis is not configured; form rate limiting is fail-open.", { identifier });
    }
    return { allowed: true, identifier };
  }

  try {
    const key = `forms:${identifier}`;
    const response = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, windowSeconds]
      ])
    });

    if (!response.ok) {
      logger.warn("Upstash rate limit request failed; failing open.", { status: response.status, identifier });
      return { allowed: true, identifier };
    }

    const data = (await response.json()) as Array<{ result?: number }>;
    const count = Number(data[0]?.result ?? 0);

    return {
      allowed: count <= limit,
      identifier,
      remaining: Math.max(limit - count, 0)
    };
  } catch (error) {
    logger.warn("Upstash rate limit check errored; failing open.", { error, identifier });
    return { allowed: true, identifier };
  }
}
