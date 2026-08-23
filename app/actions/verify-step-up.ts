"use server";

import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/rbac";
import { logSecurityEvent } from "@/lib/security/audit";

export type StepUpResult =
  | { ok: true; token: string; expiresAt: number }
  | { ok: false; message: string };

export async function verifyStepUpAction(password: string): Promise<StepUpResult> {
  try {
    const session = await requireAdmin();
    const email = session.user.email;

    if (!email || !password) {
      return { ok: false, message: "Password is required for step-up verification." };
    }

    const headerList = await headers();
    const forwardedFor = headerList?.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    const userAgent = headerList?.get("user-agent") || "Unknown";

    const supabaseServer = await createSupabaseServerClient();
    const { error: authError } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      await logSecurityEvent({
        ipAddress: ip,
        userAgent,
        eventType: "STEP_UP_CHALLENGE_FAILED",
        email,
        userId: session.user.id,
        metadata: { reason: "Invalid password supplied during step-up" },
      });
      return { ok: false, message: "Incorrect password. Step-up verification failed." };
    }

    await logSecurityEvent({
      ipAddress: ip,
      userAgent,
      eventType: "STEP_UP_CHALLENGE_SUCCESS",
      email,
      userId: session.user.id,
      metadata: { reason: "High-risk operation authorization granted" },
    });

    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes valid token
    const token = Buffer.from(
      JSON.stringify({ userId: session.user.id, expiresAt, v: 1 })
    ).toString("base64");

    return {
      ok: true,
      token,
      expiresAt,
    };
  } catch (err) {
    console.error("[step-up] Verification error:", err);
    return { ok: false, message: "Authentication service error. Please try again." };
  }
}
