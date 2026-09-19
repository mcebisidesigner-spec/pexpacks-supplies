"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { FloatingInput } from "@/components/ui/FloatingInput";
import {
  authenticatePasswordAction,
  verifyOtpAction,
  resendOtpAction,
} from "@/app/actions/auth";

export default function PexConsoleGateway() {
  const [step, setStep] = useState<"credentials" | "otp_challenge">(
    "credentials",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTrustedDevice, setIsTrustedDevice] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // Step 2: OTP State
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Pop-up Modal State (No query params in browser URL bar)
  const [modalNotice, setModalNotice] = useState<{
    title: string;
    message: string;
    type?: "info" | "warn";
  } | null>(null);

  // Timer countdown for Step 2
  useEffect(() => {
    if (step !== "otp_challenge" || timerSeconds <= 0) {
      if (timerSeconds <= 0) setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, timerSeconds]);

  // Focus first OTP box when transitioning to Step 2
  useEffect(() => {
    if (step === "otp_challenge") {
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Handle Pop-up Notice from sessionStorage & URL parameters (clean address bar)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Check for popup notice stored in sessionStorage (e.g. idle logout or restart)
      try {
        const storedNotice = window.sessionStorage.getItem(
          "pex_console_popup_notice",
        );
        if (storedNotice) {
          window.sessionStorage.removeItem("pex_console_popup_notice");
          setModalNotice({
            title: "Security Notice",
            message: storedNotice,
            type: "warn",
          });
        }
      } catch {
        // ignore
      }

      // 2. Check for URL search parameters
      const params = new URLSearchParams(window.location.search);
      const urlOtp = params.get("otp");
      const statusParam = params.get("status") || params.get("message");

      if (
        statusParam === "password_updated" ||
        statusParam === "password_set"
      ) {
        setModalNotice({
          title: "Permanent Password Established",
          message:
            "Your permanent password has been set successfully! Please sign in using your new password to access the portal.",
          type: "info",
        });
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      } else if (urlOtp && urlOtp.length === 6 && /^\d+$/.test(urlOtp)) {
        setOtpValues(urlOtp.split(""));
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            void navigator.clipboard.writeText(urlOtp);
          }
        } catch {
          // ignore
        }
        setModalNotice({
          title: "Security Token Copied",
          message: `6-Digit Security Token ${urlOtp} has been copied to your local clipboard and pre-filled below.`,
          type: "info",
        });

        // Immediately clean address bar to keep URL 100% clean (/pex-console-secure)
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      }
    }
  }, []);

  function handleCredentialsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    startTransition(async () => {
      const res = await authenticatePasswordAction({ ok: false }, formData);
      if (res.ok && res.step === "otp_challenge") {
        setStep("otp_challenge");
        if (res.email) setEmail(res.email);
        setTimerSeconds(300);
        setCanResend(false);
      } else {
        setErrorMessage(
          res.message || "Invalid login credentials or verification code.",
        );
      }
    });
  }

  function handleOtpChange(index: number, value: string) {
    if (value.length > 1) {
      // Handle paste of full 6-digit code
      const pasted = value.replace(/\D/g, "").slice(0, 6);
      if (pasted.length === 6) {
        const next = pasted.split("");
        setOtpValues(next);
        otpRefs.current[5]?.focus();
        submitOtpToken(next.join(""));
        return;
      }
    }

    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpValues];
    next[index] = digit;
    setOtpValues(next);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits are entered
    if (next.every((d) => d !== "")) {
      submitOtpToken(next.join(""));
    }
  }

  function handleOtpKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      const next = pasted.split("");
      setOtpValues(next);
      otpRefs.current[5]?.focus();
      submitOtpToken(next.join(""));
    }
  }

  // Set stealth document title
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = "404 Not Found";
    }
  }, []);

  function submitOtpToken(token: string) {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const res = await verifyOtpAction(email, token, isTrustedDevice);
        if (res.ok) {
          try {
            window.sessionStorage.setItem(
              "px_admin_runtime_session",
              String(Date.now()),
            );
          } catch {
            // ignore
          }
          window.location.replace(res.redirectUrl || "/admin");
        } else {
          setErrorMessage(
            res.message || "Invalid login credentials or verification code.",
          );
        }
      } catch (err) {
        console.error("[otp-submit] Submission exception:", err);
        window.location.replace("/admin");
      }
    });
  }

  function handleResendCode() {
    if (!canResend) return;
    setResendMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      const res = await resendOtpAction(email);
      if (res.ok) {
        setResendMessage("New 6-digit code sent to your email.");
        setTimerSeconds(300);
        setCanResend(false);
      } else {
        setErrorMessage(res.message || "Could not resend verification code.");
      }
    });
  }

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${String(mins).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-[var(--db-canvas)] text-[var(--db-text-primary)] flex items-center justify-center p-4 sm:p-8 m-0 font-sans">
      <main className="w-full max-w-[440px] bg-[var(--db-surface)] border border-[var(--db-border)] rounded-[var(--db-radius-card)] p-6 sm:p-8 shadow-[var(--db-shadow-modal)] flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex items-center justify-center mb-1">
            <Logo variant="white" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--db-brand-subtle)] border border-[rgba(16,185,129,0.3)] rounded-full text-[var(--db-brand)] text-[0.6875rem] font-bold tracking-[0.05em] uppercase">
            <ShieldCheck size={14} /> Console Gateway
          </div>

          <h1 className="m-0 text-[1.375rem] font-bold text-[var(--db-text-primary)] tracking-tight">
            {step === "credentials" ? "System Access" : "Security Challenge"}
          </h1>

          <p className="m-0 text-[0.8125rem] text-[var(--db-text-muted)] leading-relaxed">
            {step === "credentials"
              ? "Enter administrative credentials to proceed."
              : `Enter the 6-digit security token sent to ${email || "your registered email"}`}
          </p>
        </div>

        {/* Inline Error Message */}
        {errorMessage && (
          <div className="bg-[var(--db-danger-subtle)] border border-[var(--db-danger-border)] rounded-[var(--db-radius-control)] px-3.5 py-2.5 text-[var(--db-danger-text)] text-xs font-semibold flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Credentials Form */}
        {step === "credentials" && (
          <form onSubmit={handleCredentialsSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 w-full">
              <FloatingInput
                id="email"
                name="email"
                type="email"
                label="Administrative Email"
                aria-label="Administrative Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={isPending}
                bgSurface="#0c1322"
              />

              <FloatingInput
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                aria-label="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isPending}
                bgSurface="#0c1322"
                rightAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="bg-transparent border-none text-[var(--db-text-muted)] cursor-pointer p-1.5 rounded-[var(--db-radius-xs)] flex items-center justify-center transition-all hover:text-[var(--db-text-primary)] hover:bg-[var(--db-surface-hover)]"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
            </div>

            <div className="flex items-start gap-2.5 p-3 sm:px-3.5 sm:py-3 bg-[var(--db-surface-inner)] border border-[var(--db-border)] rounded-[var(--db-radius-control)] box-border">
              <input
                id="trusted-device"
                type="checkbox"
                checked={isTrustedDevice}
                onChange={(e) => setIsTrustedDevice(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-[var(--db-brand)] cursor-pointer shrink-0"
              />
              <label htmlFor="trusted-device" className="flex flex-col gap-0.5 text-[0.75rem] text-[var(--db-text-secondary)] cursor-pointer select-none">
                <span className="font-semibold text-[var(--db-text-primary)]">
                  This is a trusted private computer
                </span>
                <span className="text-[0.6875rem] text-[var(--db-text-secondary,#94a3b8)] leading-normal">
                  {isTrustedDevice
                    ? "Signs out after 2 hours of inactivity; sensitive data shields after 15 minutes."
                    : "Signs out after 40 minutes of inactivity; sensitive data shields after 15 minutes."}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isPending || !email || !password}
              className="h-[var(--db-control-height-lg,46px)] w-full bg-[var(--pex-coral,#ff6f59)] border border-[rgba(255,111,89,0.4)] rounded-[var(--db-radius-control)] text-white text-sm font-bold cursor-pointer flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_rgba(255,111,89,0.25)] hover:enabled:bg-[var(--pex-coral-hover,#e85e4b)] hover:enabled:border-[rgba(255,111,89,0.6)] hover:enabled:shadow-[0_6px_18px_rgba(255,111,89,0.35)] hover:enabled:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />{" "}
                  Authenticating...
                </>
              ) : (
                <>
                  Authenticate Credentials <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: 2FA OTP Form */}
        {step === "otp_challenge" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--db-text-secondary)]">6-Digit Security Token</label>
              <div className="flex justify-between gap-1.5 my-2.5">
                {otpValues.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className="w-12 h-14 text-center text-[1.375rem] font-extrabold text-[var(--db-brand)] bg-[var(--db-surface-inner)] border-[1.5px] border-[var(--db-border)] rounded-[var(--db-radius-control)] outline-none transition-all focus:border-[var(--db-brand)] focus:shadow-[var(--db-focus-ring)] focus:bg-[#0b121e]"
                    disabled={isPending}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
            </div>

            {resendMessage && (
              <div
                style={{
                  fontSize: 12,
                  color: "#2dd4bf",
                  textAlign: "center",
                  fontWeight: 600,
                }}
              >
                {resendMessage}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-[var(--db-text-muted)] mt-1">
              <span>
                Code expires in:{" "}
                <strong
                  style={{ color: timerSeconds < 60 ? "#ef4444" : "#ffffff" }}
                >
                  {formatTimer(timerSeconds)}
                </strong>
              </span>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={!canResend || isPending}
                className="bg-transparent border-none text-[var(--db-brand)] text-xs font-semibold cursor-pointer p-0 disabled:text-[var(--db-text-disabled)] disabled:cursor-not-allowed hover:enabled:underline"
              >
                Resend Code
              </button>
            </div>

            <button
              type="button"
              disabled={isPending || otpValues.some((v) => !v)}
              onClick={() => submitOtpToken(otpValues.join(""))}
              className="h-[var(--db-control-height-lg,46px)] w-full bg-[var(--pex-coral,#ff6f59)] border border-[rgba(255,111,89,0.4)] rounded-[var(--db-radius-control)] text-white text-sm font-bold cursor-pointer flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_rgba(255,111,89,0.25)] hover:enabled:bg-[var(--pex-coral-hover,#e85e4b)] hover:enabled:border-[rgba(255,111,89,0.6)] hover:enabled:shadow-[0_6px_18px_rgba(255,111,89,0.35)] hover:enabled:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Verifying
                  OTP...
                </>
              ) : (
                <>
                  Verify Code &amp; Access Back-Office <Lock size={16} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("credentials");
                setOtpValues(Array(6).fill(""));
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                fontSize: 12,
                cursor: "pointer",
                textAlign: "center",
                marginTop: 8,
              }}
            >
              &larr; Back to login
            </button>
          </div>
        )}

        <p className="text-[0.6875rem] text-[var(--db-text-secondary,#94a3b8)] text-center m-0">
          Pexpacks Back-Office System &bull; Unauthorized access prohibited
        </p>
      </main>

      {/* Pop-up Security Modal */}
      {modalNotice && (
        <div
          className="fixed inset-0 bg-[#070b12]/85 backdrop-blur-md flex items-center justify-center z-[9999] p-4 box-border animate-in fade-in duration-200"
          onClick={() => setModalNotice(null)}
        >
          <div
            className="w-full max-w-[400px] bg-[var(--db-surface)] border border-[var(--db-border)] rounded-[var(--db-radius-panel)] p-6 sm:px-6 sm:pt-7 sm:pb-5.5 shadow-[var(--db-shadow-modal)] flex flex-col items-center text-center gap-4 box-border animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`w-[52px] h-[52px] rounded-full border flex items-center justify-center ${
                modalNotice.type === "warn"
                  ? "bg-[var(--db-warning-subtle)] border-[var(--db-warning-border)] text-[var(--db-warning)]"
                  : "bg-[var(--db-success-subtle)] border-[var(--db-success-border)] text-[var(--db-brand)]"
              }`}
            >
              {modalNotice.type === "warn" ? (
                <AlertTriangle size={26} />
              ) : (
                <ShieldCheck size={26} />
              )}
            </div>
            <h3 className="m-0 text-lg font-bold text-[var(--db-text-primary)] tracking-tight">{modalNotice.title}</h3>
            <p className="m-0 text-[0.8125rem] text-[var(--db-text-secondary)] leading-relaxed">{modalNotice.message}</p>
            <button
              type="button"
              className="w-full h-[var(--db-control-height,40px)] mt-1 bg-[var(--pex-coral,#ff6f59)] border border-[rgba(255,111,89,0.4)] rounded-[var(--db-radius-control)] text-white text-[0.8125rem] font-bold cursor-pointer transition-all shadow-[0_4px_14px_rgba(255,111,89,0.35)] hover:bg-[var(--pex-coral-hover,#e85e4b)] hover:border-[rgba(255,111,89,0.6)] hover:shadow-[0_6px_18px_rgba(255,111,89,0.5)] hover:-translate-y-px"
              onClick={() => setModalNotice(null)}
            >
              Acknowledge &amp; Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
