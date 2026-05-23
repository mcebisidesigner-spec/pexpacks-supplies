"use client";

import { useId, useState, useEffect } from "react";
import styles from "./SchoolsLeadCapture.module.css";

type ApiResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
};

const STORAGE_KEY = "Pexpacks:schools-lead-seen";

export function SchoolsLeadCapture() {
  const uid = useId();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<ApiResponse | null>(null);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;

    function onMouseLeave(event: MouseEvent) {
      if (event.clientY <= 0) {
        setVisible(true);
        document.removeEventListener("mouseleave", onMouseLeave);
      }
    }

    document.addEventListener("mouseleave", onMouseLeave);
    return () => document.removeEventListener("mouseleave", onMouseLeave);
  }, []);

  function dismiss() {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setPending(true);
    setStatus(null);

    try {
      const res = await fetch("/api/forms/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "schools-lead-capture",
          fullName: "Schools page lead",
          email: email.trim(),
          contactDetail: email.trim(),
          enquiryType: "Schools lead capture",
          packType: "schools-lead-capture",
          message: "Requested 5% discount code from /schools page.",
          consent: true,
          sourceUrl: window.location.href,
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          submittedAt: new Date().toISOString(),
        }),
      });
      const result = (await res.json()) as ApiResponse;
      setStatus(
        result.success
          ? { success: true, message: "Check your inbox for 5% off!" }
          : result
      );
      if (result.success) {
        localStorage.setItem(STORAGE_KEY, "true");
        setTimeout(() => setVisible(false), 4000);
      }
    } catch {
      setStatus({
        success: false,
        message: "Could not send. Please try again.",
      });
    } finally {
      setPending(false);
    }
  }

  if (!visible) return null;

  return (
    <aside className={styles.banner} role="complementary" aria-label="Discount offer">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className={styles.badge}>5% OFF</span>
          <p className={styles.text}>
            {status?.success
              ? status.message
              : "Get 5% off your first school pack order."}
          </p>
        </div>
        {!status?.success ? (
          <form className={styles.form} onSubmit={handleSubmit}>
            <label htmlFor={`${uid}-email`} className="sr-only">Email</label>
            <input
              id={`${uid}-email`}
              type="email"
              placeholder="Enter your email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className={styles.btn} type="submit" disabled={pending}>
              {pending ? "Sending..." : "Claim"}
            </button>
          </form>
        ) : null}
        {status && !status.success ? (
          <p className={styles.error} role="alert">{status.message}</p>
        ) : null}
        <button className={styles.close} onClick={dismiss} aria-label="Dismiss">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
