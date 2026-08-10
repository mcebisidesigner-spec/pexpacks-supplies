"use client";

import { useState } from "react";
import { login, requestPasswordReset } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "./login.module.css";

type LoginFormProps = {
  error?: string;
  message?: string;
};

export function LoginForm({ error, message }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot Password Modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isSubmittingForgot, setIsSubmittingForgot] = useState(false);
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const handleOpenForgot = () => {
    setForgotEmail(email || "");
    setForgotError(null);
    setForgotSuccessMessage(null);
    setShowForgotModal(true);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError("Please enter your account email address.");
      return;
    }

    setIsSubmittingForgot(true);
    setForgotError(null);

    try {
      const res = await requestPasswordReset(forgotEmail.trim());
      if (res.success) {
        setForgotSuccessMessage(res.message || "Your password renewal request has been sent to Administrator. They will respond ASAP.");
      } else {
        setForgotError(res.error || "Failed to submit request.");
      }
    } catch {
      setForgotError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmittingForgot(false);
    }
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>Pexpacks Portal</span>
          <h1 className={styles.title}>Admin Login</h1>
          <p className={styles.subtitle}>
            Sign in with your Supabase administrator credentials to access the portal.
          </p>
        </div>

        {error ? (
          <div className={styles.errorAlert} role="alert">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={styles.alertIcon}>
              <path d="M12 9v4m0 4h.01M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9Z" />
            </svg>
            <span>{decodeURIComponent(error)}</span>
          </div>
        ) : null}

        {message ? (
          <div className={styles.infoAlert} role="status">
            <span>{decodeURIComponent(message)}</span>
          </div>
        ) : null}

        <form action={login} className={styles.form}>
          <div className={styles.fieldGroup}>
            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="admin@pexpacks.co.za"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="password" className={styles.passwordLabel}>Password</label>
            <div className={styles.passwordWrap}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={styles.passwordInput}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className={styles.passwordToggle}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <Button type="submit" size="lg" className={styles.submitBtn}>
            Sign In to Portal →
          </Button>
        </form>

        <div className={styles.footer}>
          <p>
            <button
              type="button"
              onClick={handleOpenForgot}
              className={styles.forgotBtn}
            >
              Forgot Password?
            </button>
          </p>
        </div>
      </div>

      {/* Forgot Password Popup Modal */}
      {showForgotModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className={styles.modalContent}>
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setShowForgotModal(false)}
              aria-label="Close modal"
            >
              ✕
            </button>

            {forgotSuccessMessage ? (
              <div className={styles.modalSuccessBox}>
                <div className={styles.successIconWrapper}>
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={styles.successIcon}>
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                </div>
                <h3 className={styles.modalTitle}>Request Sent to Administrator</h3>
                <p className={styles.modalSuccessText}>{forgotSuccessMessage}</p>
                <Button
                  type="button"
                  size="lg"
                  className={styles.modalDoneBtn}
                  onClick={() => setShowForgotModal(false)}
                >
                  Got It
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit}>
                <h3 id="modal-title" className={styles.modalTitle}>
                  Request Password Renewal
                </h3>
                <p className={styles.modalSubtitle}>
                  Enter your email address below to request a password renewal from the Administrator.
                </p>

                {forgotError && (
                  <div className={styles.errorAlert} role="alert">
                    <span>{forgotError}</span>
                  </div>
                )}

                <div className={styles.fieldGroup} style={{ marginBottom: "1.25rem" }}>
                  <Input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    label="Your Account Email"
                    placeholder="name@pexpacks.co.za"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className={styles.modalActions}>
                  <Button
                    type="button"
                    variant="white"
                    onClick={() => setShowForgotModal(false)}
                    disabled={isSubmittingForgot}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmittingForgot}
                  >
                    {isSubmittingForgot ? "Sending Request..." : "Send Renewal Request"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
