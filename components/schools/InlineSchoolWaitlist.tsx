"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useId, useState } from "react";
import { mostPopularPacksHref } from "@/data/packs";
import styles from "./InlineSchoolWaitlist.module.css";

type InlineSchoolWaitlistProps = {
  schoolName?: string;
  source?: "home-search" | "schools-search" | "schools-cta";
  className?: string;
  showFallback?: boolean;
};

type ApiResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
};

function getMessageForSchool(schoolName: string) {
  return `School waitlist request for ${schoolName}. Notify this parent the moment the correct Pexpacks stationery pack is ready.`;
}

export function InlineSchoolWaitlist({
  schoolName = "",
  source = "schools-search",
  className,
  showFallback = true,
}: InlineSchoolWaitlistProps) {
  const emailId = useId();
  const schoolId = useId();
  const typedSchoolName = schoolName.trim();
  const [manualSchoolName, setManualSchoolName] = useState(typedSchoolName);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<ApiResponse | null>(null);

  const effectiveSchoolName = (typedSchoolName || manualSchoolName).trim();
  const displaySchoolName = effectiveSchoolName || "your school";
  const hasSearchSchool = typedSchoolName.length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (formData.get("companyWebsite")) {
      setStatus({
        success: true,
        message: "You are on the list.",
      });
      return;
    }

    if (!effectiveSchoolName || !email.trim()) {
      setStatus({
        success: false,
        message: "Please add the school name and your email address.",
      });
      return;
    }

    setPending(true);
    setStatus(null);

    const payload = {
      formType: "school-waitlist" as const,
      fullName: `Waitlist parent for ${effectiveSchoolName}`,
      email: email.trim(),
      contactDetail: email.trim(),
      schoolName: effectiveSchoolName,
      enquiryType: "School waitlist",
      packType: "school-waitlist",
      message: getMessageForSchool(effectiveSchoolName),
      consent: true,
      sourceUrl: window.location.href,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      submittedAt: new Date().toISOString(),
      notes: `Lead source: ${source}`,
    };

    try {
      const response = await fetch("/api/forms/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ApiResponse;

      if (result.success) {
        setEmail("");
      }

      setStatus(
        result.success
          ? {
              success: true,
              message: `You are on the list. We'll email you when ${effectiveSchoolName} is ready.`,
            }
          : result
      );
    } catch {
      setStatus({
        success: false,
        message:
          "We could not save this request right now. Please try again in a moment.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={[styles.waitlist, className].filter(Boolean).join(" ")}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>We'll add it!</p>
        <h3>Get 10% off when {displaySchoolName} launches — enter your email to be first.</h3>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {!hasSearchSchool ? (
          <label className={styles.field} htmlFor={schoolId}>
            <span>School name</span>
            <input
              id={schoolId}
              name="schoolName"
              type="text"
              value={manualSchoolName}
              onChange={(event) => setManualSchoolName(event.target.value)}
              placeholder="e.g. Parktown Primary"
              required
            />
          </label>
        ) : null}
        <label className={styles.field} htmlFor={emailId}>
          <span>Email for the update</span>
          <input
            id={emailId}
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="parent@example.com"
            autoComplete="email"
            required
          />
        </label>
        <label className={styles.honeypot} aria-hidden="true">
          Company website
          <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
        </label>
        <button className={styles.submitButton} type="submit" disabled={pending}>
          {pending ? "Saving..." : "Get notified & save 10%"}
        </button>
      </form>

      {showFallback ? (
        <div className={styles.fallbackLinks}>
          <Link href="/order" className={styles.fallbackLink}>
            Upload your list and we'll pack it
          </Link>
          <span className={styles.fallbackDivider}>or</span>
          <Link href={mostPopularPacksHref} className={styles.fallbackLink}>
            Buy standard pack instead
          </Link>
        </div>
      ) : null}

      {status ? (
        <p
          className={status.success ? styles.statusSuccess : styles.statusError}
          role={status.success ? "status" : "alert"}
          aria-live="polite"
        >
          {status.message}
        </p>
      ) : null}
      <p className={styles.privacyNote}>
        Used only for this school-pack update. No spam.
      </p>
    </div>
  );
}
