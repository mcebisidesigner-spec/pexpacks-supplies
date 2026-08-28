"use server";

import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
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
import { generateAndSendOtpEmail } from "@/lib/email/sendOtpEmail";

export type AuthResponse = {
  ok: boolean;
  step?: "credentials" | "otp_challenge";
  email?: string;
  message?: string;
  redirectUrl?: string;
};

const GENERIC_ERROR_MSG = "Invalid login credentials or verification code.";

async function getClientContext() {
  try {
    const headerList = await headers();
    const forwardedFor = headerList?.get("x-forwarded-for");
    const realIp = headerList?.get("x-real-ip");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "127.0.0.1";
    const userAgent = headerList?.get("user-agent") || "Unknown";
    return { ip, userAgent };
  } catch {
    return { ip: "127.0.0.1", userAgent: "Unknown" };
  }
}

/**
 * Step 1: Validate Email & Password, verify Admin Role, and send 6-digit Email OTP Token
 */
export async function authenticatePasswordAction(
  prevState: AuthResponse,
  formData: FormData
): Promise<AuthResponse> {
  try {
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

    // 4. Generate & Send 6-Digit Physical Security Token Email (Resend)
    const otpResult = await generateAndSendOtpEmail(email);

    if (!otpResult.success) {
      console.warn("[2fa-otp] Warning sending OTP email:", otpResult.error);
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
    return { ok: false, message: GENERIC_ERROR_MSG };
  }
}

/**
 * Step 2: Verify 6-digit Email OTP token and grant session upgrade to /admin
 */
export async function verifyOtpAction(
  email: string,
  token: string,
  trustedDevice: boolean = false
): Promise<AuthResponse> {
  try {
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

    const supabaseServer = await createSupabaseServerClient();
    const adminClient = createSupabaseAdminClient();
    let verifiedSession = false;
    let verifiedUserId: string | undefined;

    // 2. Check DB auth_otp_tokens table first with adminClient
    const nowIso = new Date().toISOString();
    const { data: matchedTokens } = await adminClient
      .from("auth_otp_tokens")
      .select("id")
      .eq("email", email.trim().toLowerCase())
      .eq("otp_code", token.trim())
      .eq("used", false)
      .gte("expires_at", nowIso)
      .limit(1);

    if (matchedTokens && matchedTokens.length > 0) {
      // Mark token as used
      await adminClient
        .from("auth_otp_tokens")
        .update({ used: true })
        .eq("id", matchedTokens[0].id);

      // Always issue/refresh clean session cookies via admin token_hash
      try {
        const { data: freshLink } = await adminClient.auth.admin.generateLink({
          type: "magiclink",
          email: email.trim().toLowerCase(),
        });

        if (freshLink?.properties?.hashed_token) {
          const { data: freshSession, error: sessionErr } =
            await supabaseServer.auth.verifyOtp({
              token_hash: freshLink.properties.hashed_token,
              type: "magiclink",
            });

          if (!sessionErr && freshSession?.session) {
            verifiedSession = true;
            verifiedUserId = freshSession.user?.id;
          }
        }
      } catch (err) {
        console.error("[auth-action] Session cookie generation error:", err);
      }

      // Fallback check if existing session from step 1 is active
      if (!verifiedSession) {
        const { data: userData } = await supabaseServer.auth.getUser();
        if (userData?.user) {
          verifiedSession = true;
          verifiedUserId = userData.user.id;
        }
      }
    } else {
      // Native Supabase OTP check fallback
      const { data: verifyData, error: verifyError } =
        await supabaseServer.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: token.trim(),
          type: "email",
        });

      if (!verifyError && verifyData?.session) {
        verifiedSession = true;
        verifiedUserId = verifyData.user?.id;
      }
    }

    if (!verifiedSession) {
      await recordFailedAttempt(ip, userAgent, maskEmail(email));
      await logSecurityEvent({
        ipAddress: ip,
        userAgent,
        eventType: "OTP_FAILED",
        email,
      });
      return { ok: false, message: GENERIC_ERROR_MSG };
    }

    // Reset rate limit & Log Success
    resetRateLimit(ip);
    await logSecurityEvent({
      ipAddress: ip,
      userAgent,
      eventType: "LOGIN_SUCCESS",
      email,
      userId: verifiedUserId,
      metadata: { trustedDevice },
    });

    return {
      ok: true,
      redirectUrl: "/admin",
    };
  } catch (err) {
    console.error("[auth-action] verifyOtpAction exception:", err);
    return { ok: false, message: GENERIC_ERROR_MSG };
  }
}

/**
 * Resend OTP Code for Step 2
 */
export async function resendOtpAction(email: string): Promise<AuthResponse> {
  try {
    const { ip, userAgent } = await getClientContext();

    if (!email) return { ok: false, message: "Email is required." };

    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return { ok: false, message: "Rate limit exceeded. Please wait a moment." };
    }

    const otpResult = await generateAndSendOtpEmail(email);

    if (!otpResult.success) {
      return { ok: false, message: "Could not resend verification code." };
    }

    await logSecurityEvent({
      ipAddress: ip,
      userAgent,
      eventType: "OTP_RESENT",
      email,
    });

    return { ok: true, message: "6-digit verification code sent to your email." };
  } catch (err) {
    console.error("[auth-action] resendOtpAction exception:", err);
    return { ok: false, message: "Could not resend verification code." };
  }
}

/**
 * Sign Out Action: Sign out user and redirect directly to Web App Homepage (/)
 */
export async function logoutAction(): Promise<never> {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient();

  try {
    cookieStore.set({
      name: "px_admin_last_activity",
      value: "",
      path: "/",
      expires: new Date(0),
    });
  } catch {
    // ignore
  }

  await supabase.auth.signOut();
  redirect("/");
}

/**
 * Mandatory First-Time Password Setup: Sets permanent password and clears must_change_password flag
 */
export async function setPermanentPasswordAction(
  password: string,
  confirmPassword: string
): Promise<{ ok: boolean; message: string }> {
  try {
    const supabaseServer = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabaseServer.auth.getUser();

    if (userError || !userData?.user) {
      return { ok: false, message: "Authentication required to establish a new password." };
    }

    const user = userData.user;

    if (!password || password.length < 8) {
      return { ok: false, message: "Password must be at least 8 characters long." };
    }

    if (password !== confirmPassword) {
      return { ok: false, message: "Passwords do not match. Please verify and try again." };
    }

    // 1. Update user password via server client session
    const { error: updateError } = await supabaseServer.auth.updateUser({
      password,
      data: {
        must_change_password: false,
      },
    });

    if (updateError) {
      return { ok: false, message: updateError.message || "Failed to update password." };
    }

    // 2. Also ensure Supabase Admin client clears user_metadata
    try {
      const adminClient = createSupabaseAdminClient();
      await adminClient.auth.admin.updateUserById(user.id, {
        password,
        user_metadata: {
          ...user.user_metadata,
          must_change_password: false,
        },
      });
    } catch {
      // ignore
    }

    // 3. Log security event
    const { ip, userAgent } = await getClientContext();
    await logSecurityEvent({
      ipAddress: ip,
      userAgent,
      eventType: "PASSWORD_CHANGED",
      email: user.email ?? "",
      userId: user.id,
      metadata: { reason: "first_login_permanent_setup" },
    });

    // 4. Invalidate temporary session so the user re-authenticates with permanent password
    try {
      await supabaseServer.auth.signOut();
      const cookieStore = await cookies();
      cookieStore.set({
        name: "px_admin_last_activity",
        value: "",
        path: "/",
        expires: new Date(0),
      });
    } catch {
      // ignore
    }

    return { ok: true, message: "Permanent password successfully created! Please log in with your new password." };
  } catch (err) {
    console.error("[auth-action] setPermanentPasswordAction exception:", err);
    return { ok: false, message: "An unexpected error occurred while establishing password." };
  }
}
