"use client";

import { useState } from "react";
import Link from "next/link";
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
        setForgotSuccessMessage(res.message || "Your password renewal request has been sent to IT Admin (pexpacks@gmail.com). They will respond ASAP.");
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
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
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
          <p style={{ marginTop: "0.625rem" }}>
            Do you need an account?{" "}
            <Link href="/contact" className={styles.link}>
              Contact Administrator
            </Link>
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
                <h3 className={styles.modalTitle}>Request Sent to IT Admin</h3>
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
                  Enter your email address below. A renewal request will automatically be sent to **IT Admin (pexpacks@gmail.com)**.
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
