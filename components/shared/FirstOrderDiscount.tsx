"use client";

import { useState, useEffect } from "react";
import styles from "./FirstOrderDiscount.module.css";

type ApiResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
};

export function FirstOrderDiscount() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<ApiResponse | null>(null);

  useEffect(() => {
    const hasSeen = localStorage.getItem("Pexpacks:discount-seen");
    if (hasSeen) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !isOpen) {
        setIsOpen(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [isOpen]);

  function dismiss() {
    setIsOpen(false);
    localStorage.setItem("Pexpacks:discount-seen", "true");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) return;

    setPending(true);
    setStatus(null);

    try {
      const response = await fetch("/api/forms/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "first-order-discount",
          fullName: "First-order discount lead",
          email: email.trim(),
          contactDetail: email.trim(),
          enquiryType: "First-order discount",
          packType: "first-order-discount",
          message: "Requested 5% first-order discount code.",
          consent: true,
          sourceUrl: window.location.href,
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          submittedAt: new Date().toISOString(),
        }),
      });

      const result = (await response.json()) as ApiResponse;

      setStatus(
        result.success
          ? { success: true, message: "Use code PEX5 at checkout!" }
          : result
      );

      if (result.success) {
        localStorage.setItem("Pexpacks:discount-seen", "true");
        setTimeout(() => setIsOpen(false), 5000);
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

  if (!isOpen) return null;

  return (
    <div className={styles.banner} role="complementary" aria-label="First order discount">
      <div className={styles.bannerInner}>
        <div className={styles.bannerContent}>
          <span className={styles.badge}>5% OFF</span>
          <p className={styles.bannerText}>
            {status?.success
              ? status.message
              : "Get 5% off your first pack!"}
          </p>
        </div>
        {!status?.success ? (
          <form className={styles.bannerForm} onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className={styles.submitBtn} type="submit" disabled={pending}>
              {pending ? "Sending..." : "Claim"}
            </button>
          </form>
        ) : null}
        {status && !status.success ? (
          <p className={styles.statusError} role="alert">{status.message}</p>
        ) : null}
        <button className={styles.closeBtn} onClick={dismiss} aria-label="Dismiss discount offer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
}
