import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/types";

interface RateLimitRecord {
  count: number;
  firstAttemptTime: number;
  lockedUntil: number | null;
}

const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lock

const ipStore = new Map<string, RateLimitRecord>();

/**
 * Mask email for security logging (e.g. a***n@pexpacks.co.za)
 */
export function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return "***";
  const [name, domain] = parts;
  if (name.length <= 2) return `${name[0]}***@${domain}`;
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
}

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
} {
  const now = Date.now();
  const record = ipStore.get(ip);

  if (!record) {
    return { allowed: true, remaining: MAX_FAILED_ATTEMPTS, resetSeconds: 0 };
  }

  // Check if locked out
  if (record.lockedUntil && now < record.lockedUntil) {
    const resetSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, remaining: 0, resetSeconds };
  }

  // Reset window if expired
  if (now - record.firstAttemptTime > WINDOW_MS) {
    ipStore.delete(ip);
    return { allowed: true, remaining: MAX_FAILED_ATTEMPTS, resetSeconds: 0 };
  }

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
    const resetSeconds = Math.ceil(LOCKOUT_MS / 1000);
    return { allowed: false, remaining: 0, resetSeconds };
  }

  return {
    allowed: true,
    remaining: MAX_FAILED_ATTEMPTS - record.count,
    resetSeconds: 0,
  };
}

export async function recordFailedAttempt(
  ip: string,
  user_agent?: string,
  emailMasked?: string
): Promise<void> {
  const now = Date.now();
  let record = ipStore.get(ip);

  if (!record || now - record.firstAttemptTime > WINDOW_MS) {
    record = { count: 1, firstAttemptTime: now, lockedUntil: null };
  } else {
    record.count += 1;
    if (record.count >= MAX_FAILED_ATTEMPTS) {
      record.lockedUntil = now + LOCKOUT_MS;
    }
  }

  ipStore.set(ip, record);

  // Write to security audit log table
  try {
    const admin = createSupabaseAdminClient();
    await admin.from("security_audit_logs").insert({
      ip_address: ip || "127.0.0.1",
      user_agent: user_agent || "Unknown",
      event_type: record.count >= MAX_FAILED_ATTEMPTS ? "RATE_LIMITED" : "LOGIN_FAILED",
      email_masked: emailMasked || null,
      metadata: { failed_count: record.count } as Json,
    });
  } catch (err) {
    console.error("[security] Failed to record rate limit audit entry:", err);
  }
}

export function resetRateLimit(ip: string): void {
  ipStore.delete(ip);
}
