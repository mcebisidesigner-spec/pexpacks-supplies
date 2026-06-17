"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { isValidSouthAfricanPhone } from "@/lib/forms/contact";
import { endpointPathForFormType } from "@/lib/forms/types";
import styles from "./WaitlistHomeCard.module.css";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";

export function WaitlistHomeCard() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setPending(true);
    setError("");

    try {
      const res = await fetch(endpointPathForFormType("school-waitlist"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "school-waitlist",
          email: email.trim(),
          consent: true,
          sourceUrl: window.location.href,
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          submittedAt: new Date().toISOString(),
        }),
      });
      const result = await res.json();
      if (!result.success) {
        setError(result.message || "Something went wrong. Please try again.");
        return;
      }
      setSuccess(true);
      setEmail("");
    } catch {
      setError("Could not submit. Please try again later.");
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return (
      <section className={styles.section} aria-labelledby="waitlist-home">
        <div className={sectionStyles.inner}>
          <div className={styles.card}>
            <p className={styles.eyebrow}>2% off secured</p>
            <h2 id="waitlist-home" className={styles.title}>
              You&rsquo;re on the list!
            </h2>
            <p className={styles.text}>
              We&rsquo;ll email you when 2027 orders open. Your discount code
              will be waiting.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section} aria-labelledby="waitlist-home">
      <div className={sectionStyles.inner}>
        <div className={styles.card}>
          <p className={styles.eyebrow}>2027 orders</p>
          <h2 id="waitlist-home" className={styles.title}>
            Get 2% off your first pack
          </h2>
          <p className={styles.text}>
            Orders open September 2026. Drop your email for a{" "}
            <strong>2% discount code</strong> &mdash; no obligation.
          </p>
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              className={styles.input}
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email address"
            />
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? "Sending..." : "Get 2% off"}
            </Button>
          </form>
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
          <p className={styles.fineprint}>
            Full waitlist &rarr;{" "}
            <Link href="/waiting-list">name, phone, school &amp; grade</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
