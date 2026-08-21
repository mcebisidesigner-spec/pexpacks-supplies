"use client";

// Client-side export helper for auth actions if needed
export type AuthFormState = {
  ok: boolean;
  step?: "credentials" | "otp_challenge";
  email?: string;
  message?: string;
  redirectUrl?: string;
};
