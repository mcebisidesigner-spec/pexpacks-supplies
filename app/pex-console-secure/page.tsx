"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { ShieldCheck, Eye, EyeOff, Lock, ArrowRight, AlertTriangle, RefreshCw } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { authenticatePasswordAction, verifyOtpAction, resendOtpAction } from "@/app/actions/auth";
import styles from "./ConsolePage.module.css";

export default function PexConsoleGateway() {
  const [step, setStep] = useState<"credentials" | "otp_challenge">("credentials");
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
        const storedNotice = window.sessionStorage.getItem("pex_console_popup_notice");
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

      // 2. Check for URL search parameters (Copy AUTH No button)
      const params = new URLSearchParams(window.location.search);
      const urlOtp = params.get("otp");

      if (urlOtp && urlOtp.length === 6 && /^\d+$/.test(urlOtp)) {
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
        window.history.replaceState({}, document.title, window.location.pathname);
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
        setErrorMessage(res.message || "Invalid login credentials or verification code.");
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

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
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
            window.sessionStorage.setItem("px_admin_runtime_session", "active");
          } catch {
            // ignore
          }
          window.location.replace(res.redirectUrl || "/admin");
        } else {
          setErrorMessage(res.message || "Invalid login credentials or verification code.");
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
    <div className={styles.page}>
      <main className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <Logo variant="white" />
          </div>

          <div className={styles.badge}>
            <ShieldCheck size={14} /> Console Gateway
          </div>

          <h1 className={styles.title}>
            {step === "credentials" ? "System Access" : "Security Challenge"}
          </h1>

          <p className={styles.subtitle}>
            {step === "credentials"
              ? "Enter administrative credentials to proceed."
              : `Enter the 6-digit security token sent to ${email || "your registered email"}`}
          </p>
        </div>

        {/* Inline Error Message */}
        {errorMessage && (
          <div className={styles.errorMessage}>
            <AlertTriangle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Credentials Form */}
        {step === "credentials" && (
          <form onSubmit={handleCredentialsSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                Administrative Email
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pexpacks.co.za"
                  className={styles.input}
                  autoComplete="email"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={styles.input}
                  autoComplete="current-password"
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", margin: "14px 0 18px", padding: "10px 12px", backgroundColor: "rgba(12, 19, 34, 0.7)", borderRadius: "8px", border: "1px solid rgba(51, 65, 85, 0.5)" }}>
              <input
                id="trusted-device"
                type="checkbox"
                checked={isTrustedDevice}
                onChange={(e) => setIsTrustedDevice(e.target.checked)}
                style={{ width: "16px", height: "16px", marginTop: "2px", accentColor: "#10b981", cursor: "pointer" }}
              />
              <label htmlFor="trusted-device" style={{ fontSize: "12px", color: "#cbd5e1", cursor: "pointer", userSelect: "none" }}>
                <span style={{ fontWeight: 600, color: "#f8fafc" }}>This is a trusted private computer</span>
                <span style={{ display: "block", fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                  {isTrustedDevice ? "Maintains standard secure session on this device" : "Public/Shared mode: closing browser or tab immediately clears session"}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isPending || !email || !password}
              className={styles.submitBtn}
            >
              {isPending ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Authenticating...
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
          <div className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>6-Digit Security Token</label>
              <div className={styles.otpContainer}>
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
                    className={styles.otpBox}
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

            <div className={styles.timerRow}>
              <span>
                Code expires in:{" "}
                <strong style={{ color: timerSeconds < 60 ? "#ef4444" : "#ffffff" }}>
                  {formatTimer(timerSeconds)}
                </strong>
              </span>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={!canResend || isPending}
                className={styles.resendBtn}
              >
                Resend Code
              </button>
            </div>

            <button
              type="button"
              disabled={isPending || otpValues.some((v) => !v)}
              onClick={() => submitOtpToken(otpValues.join(""))}
              className={styles.submitBtn}
            >
              {isPending ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Verifying OTP...
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

        <p className={styles.footerNote}>
          Pexpacks Back-Office System &bull; Unauthorized access prohibited
        </p>
      </main>

      {/* Pop-up Security Modal */}
      {modalNotice && (
        <div
          className={styles.modalOverlay}
          onClick={() => setModalNotice(null)}
        >
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={
                modalNotice.type === "warn"
                  ? `${styles.modalIcon} ${styles.modalIconWarn}`
                  : styles.modalIcon
              }
            >
              {modalNotice.type === "warn" ? (
                <AlertTriangle size={26} />
              ) : (
                <ShieldCheck size={26} />
              )}
            </div>
            <h3 className={styles.modalTitle}>{modalNotice.title}</h3>
            <p className={styles.modalMessage}>{modalNotice.message}</p>
            <button
              type="button"
              className={styles.modalActionBtn}
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
