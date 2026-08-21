"use server";

import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  maskEmail,
} from "@/lib/security/rate-limit";
import { logSecurityEvent } from "@/lib/security/audit";
import { isStaffClaim } from "@/lib/admin/rbac";

export type AuthResponse = {
  ok: boolean;
  step?: "credentials" | "otp_challenge";
  email?: string;
  message?: string;
  redirectUrl?: string;
};

const GENERIC_ERROR_MSG = "Invalid login credentials or verification code.";

async function getClientContext() {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const realIp = headerList.get("x-real-ip");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "127.0.0.1";
  const userAgent = headerList.get("user-agent") || "Unknown";
  return { ip, userAgent };
}

/**
 * Step 1: Validate Email & Password, verify Admin Role, and trigger Email OTP Challenge
 */
export async function authenticatePasswordAction(
  prevState: AuthResponse,
  formData: FormData
): Promise<AuthResponse> {
  const { ip, userAgent } = await getClientContext();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { ok: false, message: GENERIC_ERROR_MSG };
  }

  // 1. Check Rate Limiter
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    await logSecurityEvent({
      ipAddress: ip,
      userAgent,
      eventType: "RATE_LIMITED",
      email,
      metadata: { reset_seconds: rateLimit.resetSeconds },
    });
    return {
      ok: false,
      message: `Too many failed attempts. Please try again in ${Math.ceil(
        rateLimit.resetSeconds / 60
      )} minutes.`,
    };
  }

  try {
    const adminClient = createSupabaseAdminClient();
    const supabaseServer = await createSupabaseServerClient();

    // 2. Verify Primary Credentials
    const { data: authData, error: authError } =
      await supabaseServer.auth.signInWithPassword({
        email,
        password,
      });

    if (authError || !authData.user) {
      await recordFailedAttempt(ip, userAgent, maskEmail(email));
      await logSecurityEvent({
        ipAddress: ip,
        userAgent,
        eventType: "LOGIN_FAILED",
        email,
      });
      return { ok: false, message: GENERIC_ERROR_MSG };
    }

    // 3. Verify Administrative Role Claim
    const user = authData.user;
    const isStaff = isStaffClaim(
      user.app_metadata as Record<string, unknown> | undefined
    );

    if (!isStaff) {
      // Check database user_roles table if metadata not set
      const { data: rolesData } = await adminClient
        .from("user_roles")
        .select("role_id")
        .eq("user_id", user.id);

      if (!rolesData || rolesData.length === 0) {
        await recordFailedAttempt(ip, userAgent, maskEmail(email));
        await logSecurityEvent({
          ipAddress: ip,
          userAgent,
          eventType: "UNAUTHORIZED_ACCESS",
          email,
          userId: user.id,
        });
        return { ok: false, message: GENERIC_ERROR_MSG };
      }
    }

    // 4. Trigger Email OTP Challenge for 2FA Step 2
    const { error: otpSendError } = await supabaseServer.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (otpSendError) {
      console.error("[2fa-otp] Failed to send OTP code:", otpSendError.message);
      // Fallback: If signInWithOtp error occurs due to local dev config, log and allow retry
    }

    await logSecurityEvent({
      ipAddress: ip,
      userAgent,
      eventType: "PASSWORD_VERIFIED",
      email,
      userId: user.id,
    });

    return {
      ok: true,
      step: "otp_challenge",
      email,
    };
  } catch (err) {
    console.error("[auth-action] authenticatePasswordAction exception:", err);
    await recordFailedAttempt(ip, userAgent, maskEmail(email));
    return { ok: false, message: GENERIC_ERROR_MSG };
  }
}

/**
 * Step 2: Verify 6-digit Email OTP token and grant session upgrade to /admin
 */
export async function verifyOtpAction(
  email: string,
  token: string
): Promise<AuthResponse> {
  const { ip, userAgent } = await getClientContext();

  if (!email || !token || token.length < 6) {
    return { ok: false, message: GENERIC_ERROR_MSG };
  }

  // 1. Rate Limiting Check
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return {
      ok: false,
      message: `Too many attempts. Please try again in ${Math.ceil(
        rateLimit.resetSeconds / 60
      )} minutes.`,
    };
  }

  try {
    const supabaseServer = await createSupabaseServerClient();

    // 2. Verify OTP token with Supabase Auth
    const { data: verifyData, error: verifyError } =
      await supabaseServer.auth.verifyOtp({
        email,
        token: token.trim(),
        type: "email",
      });

    if (verifyError || !verifyData.session) {
      await recordFailedAttempt(ip, userAgent, maskEmail(email));
      await logSecurityEvent({
        ipAddress: ip,
        userAgent,
        eventType: "OTP_FAILED",
        email,
      });
      return { ok: false, message: GENERIC_ERROR_MSG };
    }

    // 3. Reset rate limit & Log Success
    resetRateLimit(ip);
    await logSecurityEvent({
      ipAddress: ip,
      userAgent,
      eventType: "LOGIN_SUCCESS",
      email,
      userId: verifyData.user?.id,
    });

    return {
      ok: true,
      redirectUrl: "/admin",
    };
  } catch (err) {
    console.error("[auth-action] verifyOtpAction exception:", err);
    await recordFailedAttempt(ip, userAgent, maskEmail(email));
    return { ok: false, message: GENERIC_ERROR_MSG };
  }
}

/**
 * Resend OTP Code for Step 2
 */
export async function resendOtpAction(email: string): Promise<AuthResponse> {
  const { ip, userAgent } = await getClientContext();

  if (!email) return { ok: false, message: "Email is required." };

  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return { ok: false, message: "Rate limit exceeded. Please wait a moment." };
  }

  try {
    const supabaseServer = await createSupabaseServerClient();
    const { error } = await supabaseServer.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    if (error) {
      return { ok: false, message: "Could not resend verification code." };
    }

    await logSecurityEvent({
      ipAddress: ip,
      userAgent,
      eventType: "OTP_RESENT",
      email,
    });

    return { ok: true, message: "Verification code sent to your email." };
  } catch (err) {
    console.error("[auth-action] resendOtpAction exception:", err);
    return { ok: false, message: "Could not resend verification code." };
  }
}
