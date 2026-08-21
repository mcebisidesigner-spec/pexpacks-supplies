import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/types";
import { maskEmail } from "./rate-limit";

export type SecurityEventType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "OTP_FAILED"
  | "RATE_LIMITED"
  | "PASSWORD_VERIFIED"
  | "UNAUTHORIZED_ACCESS"
  | "OTP_RESENT";

export interface LogSecurityEventParams {
  ipAddress: string;
  userAgent?: string;
  eventType: SecurityEventType;
  email?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export async function logSecurityEvent({
  ipAddress,
  userAgent,
  eventType,
  email,
  userId,
  metadata = {},
}: LogSecurityEventParams): Promise<void> {
  try {
    const admin = createSupabaseAdminClient();
    const emailMasked = email ? maskEmail(email) : undefined;

    await admin.from("security_audit_logs").insert({
      ip_address: ipAddress || "127.0.0.1",
      user_agent: userAgent || "Unknown",
      event_type: eventType,
      email_masked: emailMasked,
      user_id: userId || null,
      metadata: metadata as Json,
    });
  } catch (err) {
    console.error("[security-audit] Failed to write security audit log:", err);
  }
}
