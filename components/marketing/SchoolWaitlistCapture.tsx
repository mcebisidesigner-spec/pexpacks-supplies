"use client";

import { useState } from "react";
import styles from "./MarketingHome.module.css";

export function SchoolWaitlistCapture() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      const existing = JSON.parse(localStorage.getItem("pex-waitlist") || "[]");
      existing.push({ email: email.trim(), date: new Date().toISOString() });
      localStorage.setItem("pex-waitlist", JSON.stringify(existing));
    } catch {}
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <p className={styles.captureSuccess}>
        You&rsquo;re on the list. We&rsquo;ll notify you when your school is added.
      </p>
    );
  }

  return (
    <form className={styles.captureForm} onSubmit={handleSubmit}>
      <label htmlFor="waitlist-email" className={styles.captureLabel}>
        Your school not listed? Enter your email and we&rsquo;ll notify you when it&rsquo;s added.
      </label>
      <div className={styles.captureRow}>
        <input
          id="waitlist-email"
          type="email"
          required
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.captureInput}
        />
        <button type="submit" className={styles.captureButton}>
          Notify Me
        </button>
      </div>
    </form>
  );
}
