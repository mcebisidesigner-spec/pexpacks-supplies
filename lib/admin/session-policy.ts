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
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ""
  );
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sign(value: string) {
  const secret = getSigningSecret();
  if (!secret) throw new Error("Admin session signing secret is not configured.");

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
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
  if (!value) return null;

  const [version, rawMode, rawLastActiveAt, rawUserId, signature, ...extra] = value.split(".");
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
  if (!Number.isSafeInteger(lastActiveAt) || lastActiveAt > Date.now() + 60_000) {
    return null;
  }

  const payload = `${version}.${rawMode}.${lastActiveAt}.${rawUserId}`;
  const expected = await sign(payload);
  if (!safeEqual(signature, expected)) return null;

  const maxIdle = rawMode === "trusted" ? ADMIN_TRUSTED_IDLE_MS : ADMIN_STANDARD_IDLE_MS;
  if (Date.now() - lastActiveAt > maxIdle) return null;

  return { mode: rawMode, lastActiveAt };
}

export const adminSessionCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};