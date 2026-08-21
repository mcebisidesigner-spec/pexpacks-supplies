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
  const [isPending, startTransition] = useTransition();

  // Step 2: OTP State
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  // Pre-fill & copy OTP code if passed via URL search parameters (from Copy AUTH No. button), and display URL messages
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlMsg = params.get("message") || params.get("error");
      if (urlMsg) {
        setErrorMessage(urlMsg);
      }

      const urlOtp = params.get("otp");
      if (urlOtp && urlOtp.length === 6 && /^\d+$/.test(urlOtp)) {
        setOtpValues(urlOtp.split(""));
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            void navigator.clipboard.writeText(urlOtp);
            setResendMessage(`Security token ${urlOtp} copied to clipboard!`);
          }
        } catch {
          // Ignore clipboard permission errors
        }
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

  function submitOtpToken(token: string) {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await verifyOtpAction(email, token);
      if (res.ok && res.redirectUrl) {
        try {
          window.sessionStorage.setItem("pex_admin_runtime_session", "active");
        } catch {
          // ignore
        }
        window.location.href = res.redirectUrl;
      } else {
        setErrorMessage(res.message || "Invalid login credentials or verification code.");
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
          <span className={styles.badge}>
            <ShieldCheck size={13} />
            {step === "credentials" ? "Console Gateway" : "Two-Factor Verification"}
          </span>
          <h1 className={styles.title}>
            {step === "credentials" ? "System Access" : "Security Challenge"}
          </h1>
          <p className={styles.subtitle}>
            {step === "credentials"
              ? "Enter administrative credentials to proceed."
              : `Enter the 6-digit verification code sent to ${email}.`}
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage ? (
          <div className={styles.errorMessage} role="alert">
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        {/* Step 1: Credentials Form */}
        {step === "credentials" ? (
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
                  autoComplete="email"
                  placeholder="admin@pexpacks.co.za"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
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
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isPending} className={styles.submitBtn}>
              {isPending ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  Authenticate Credentials <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: 2FA / OTP Form */
          <div className={styles.form}>
            {resendMessage ? (
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: 10,
                  padding: "8px 12px",
                  color: "#34d399",
                  fontSize: 12,
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                {resendMessage}
              </div>
            ) : null}

            <div className={styles.field}>
              <span className={styles.label} style={{ textAlign: "center", display: "block" }}>
                6-Digit Security Token
              </span>
              <div className={styles.otpContainer}>
                {otpValues.map((val, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={val}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className={styles.otpBox}
                    aria-label={`Digit ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className={styles.timerRow}>
              <span>
                Code expires in: <strong style={{ color: "#ffffff" }}>{formatTimer(timerSeconds)}</strong>
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
                  Verify Code & Access Back-Office <Lock size={16} />
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
    </div>
  );
}
