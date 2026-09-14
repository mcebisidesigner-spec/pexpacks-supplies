export const ADMIN_SESSION_COOKIE = "px_admin_session";
export const ADMIN_PRIVACY_SHIELD_IDLE_MS = 15 * 60 * 1000;
export const ADMIN_STANDARD_IDLE_MS = 40 * 60 * 1000;
export const ADMIN_TRUSTED_IDLE_MS = 2 * 60 * 60 * 1000;
export const ADMIN_HEARTBEAT_THROTTLE_MS = 60 * 1000;

export type AdminSessionMode = "standard" | "trusted";

type VerifiedAdminSession = {
  mode: AdminSessionMode;
  lastActiveAt: number;
};

function getSigningSecret() {
  return process.env.ADMIN_SESSION_SECRET || "";
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function sign(value: string) {
  const secret = getSigningSecret();
  if (!secret)
    throw new Error("Admin session signing secret is not configured.");

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(value),
  );
  return toBase64Url(new Uint8Array(signature));
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

export async function createAdminSessionValue(
  userId: string,
  mode: AdminSessionMode,
  lastActiveAt = Date.now(),
) {
  const payload = `v1.${mode}.${lastActiveAt}.${userId}`;
  return `${payload}.${await sign(payload)}`;
}

export async function verifyAdminSessionValue(
  value: string | undefined,
  userId: string,
): Promise<VerifiedAdminSession | null> {
  try {
    if (!value) return null;

    const [version, rawMode, rawLastActiveAt, rawUserId, signature, ...extra] =
      value.split(".");
    if (
      version !== "v1" ||
      (rawMode !== "standard" && rawMode !== "trusted") ||
      !rawUserId ||
      rawUserId !== userId ||
      !signature ||
      extra.length > 0
    ) {
      return null;
    }

    const lastActiveAt = Number(rawLastActiveAt);
    if (
      !Number.isSafeInteger(lastActiveAt) ||
      lastActiveAt > Date.now() + 60_000
    ) {
      return null;
    }

    const payload = `${version}.${rawMode}.${lastActiveAt}.${rawUserId}`;
    const expected = await sign(payload);
    if (!safeEqual(signature, expected)) return null;

    const maxIdle =
      rawMode === "trusted" ? ADMIN_TRUSTED_IDLE_MS : ADMIN_STANDARD_IDLE_MS;
    if (Date.now() - lastActiveAt > maxIdle) return null;

    return { mode: rawMode, lastActiveAt };
  } catch (err) {
    console.error("[session-policy] verifyAdminSessionValue error:", err);
    return null;
  }
}

export const adminSessionCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

import { Redis } from "@upstash/redis";

export const ADMIN_SLIDING_SESSION_TTL_SECONDS = 20 * 60; // 20 minutes (1200 seconds)

let upstashSessionClient: Redis | null | undefined;

function getUpstashSessionClient(): Redis | null {
  if (upstashSessionClient !== undefined) return upstashSessionClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  upstashSessionClient = url && token ? new Redis({ url, token }) : null;
  return upstashSessionClient;
}

export async function hashSessionToken(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

export async function recordAdminSessionRedis(
  sessionValue: string,
  userId: string,
  ttlSeconds: number = ADMIN_SLIDING_SESSION_TTL_SECONDS,
): Promise<void> {
  const redis = getUpstashSessionClient();
  if (!redis) return;
  try {
    const keyId = await hashSessionToken(sessionValue);
    await redis.set(
      `session:admin:${keyId}`,
      JSON.stringify({ userId, lastActive: Date.now() }),
      { ex: ttlSeconds },
    );
  } catch (err) {
    console.warn("[session-policy] Failed to write session to Redis:", err);
  }
}

export async function touchAdminSessionRedis(
  sessionValue: string,
  ttlSeconds: number = ADMIN_SLIDING_SESSION_TTL_SECONDS,
): Promise<boolean> {
  const redis = getUpstashSessionClient();
  if (!redis) return true;
  try {
    const keyId = await hashSessionToken(sessionValue);
    const result = await redis.expire(`session:admin:${keyId}`, ttlSeconds);
    return result === 1;
  } catch {
    return true; // Fail-open to avoid locking out authenticated admins if Redis blips
  }
}

export async function revokeAdminSessionRedis(sessionValue: string): Promise<void> {
  const redis = getUpstashSessionClient();
  if (!redis) return;
  try {
    const keyId = await hashSessionToken(sessionValue);
    await redis.del(`session:admin:${keyId}`);
  } catch (err) {
    console.warn("[session-policy] Failed to revoke session in Redis:", err);
  }
}

export async function isSessionActiveInRedis(sessionValue: string): Promise<boolean> {
  const redis = getUpstashSessionClient();
  if (!redis) return true; // If Redis unconfigured, rely on HMAC validation
  try {
    const keyId = await hashSessionToken(sessionValue);
    const exists = await redis.exists(`session:admin:${keyId}`);
    return exists === 1;
  } catch {
    return true;
  }
}

