"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { endpointPathForFormType } from "@/lib/forms/types";
import { isValidSouthAfricanPhone } from "@/lib/forms/contact";
import formStyles from "@/components/marketing/MarketingForms.module.css";
import heroStyles from "@/components/marketing/HeroBase.module.css";
import styles from "./WaitlistForm.module.css";

type ApiResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
};

export function WaitlistForm() {
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<ApiResponse | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const validationErrors: Record<string, string> = {};

    if (!fd.get("consent")) {
      validationErrors.consent = "You must consent to join the waiting list.";
    }

    const phoneVal = (fd.get("phone") as string || "").trim();
    if (!phoneVal) {
      validationErrors.phone = "Phone number is required.";
    } else if (!isValidSouthAfricanPhone(phoneVal)) {
      validationErrors.phone =
        "Please enter a valid South African phone number (e.g., 072 123 4567).";
    }

    const emailVal = (fd.get("email") as string || "").trim();
    if (!emailVal) {
      validationErrors.email = "Email address is required.";
    }

    const schoolVal = (fd.get("schoolName") as string || "").trim();
    if (!schoolVal) {
      validationErrors.schoolName = "School name is required.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setStatus({
        success: false,
        message: "Please fix the errors below.",
        errors: validationErrors,
      });
      return;
    }

    setPending(true);
    setStatus(null);

    const payload = {
      formType: "school-waitlist",
      fullName: fd.get("fullName") as string,
      phone: phoneVal,
      email: emailVal,
      schoolName: schoolVal,
      grade: (fd.get("grade") as string) || undefined,
      consent: true,
      sourceUrl: window.location.href,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      submittedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(endpointPathForFormType("school-waitlist"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await res.json()) as ApiResponse;
      if (!result.success) {
        setStatus(result);
        return;
      }
      setSuccess(true);
      form.reset();
    } catch {
      setStatus({
        success: false,
        message:
          "We could not submit your details right now. Please try again or contact us directly.",
      });
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return (
      <div className={styles.card}>
        <div className={styles.successMessage}>
          <h3>You&rsquo;re on the list!</h3>
          <p>
            We&rsquo;ll let you know as soon as 2027 orders open &mdash; and
            your <strong>2% discount code</strong> will be waiting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={formStyles.formCard}>
        <form onSubmit={handleSubmit} noValidate>
          <p className={heroStyles.eyebrow}>Get 2% off</p>
          <h2>Join the 2027 waiting list</h2>
          <p
            style={{
              margin: "0 0 20px",
              color: "var(--pex-muted)",
              fontSize: 15,
              lineHeight: 1.5,
            }}
          >
            Leave your details and we&rsquo;ll notify you the moment 2027 orders
            open &mdash; plus <strong>save 2%</strong> on your first pack.
          </p>
          <div className={styles.formStack}>
            <label className={styles.field} htmlFor="wlFullName">
              <span>Parent / guardian name</span>
              <input
                id="wlFullName"
                name="fullName"
                placeholder="Your full name"
                autoComplete="name"
                required
              />
              {status?.errors?.fullName ? (
                <span className={styles.fieldError} id="fullName-error">
                  {status.errors.fullName}
                </span>
              ) : null}
            </label>
            <label className={styles.field} htmlFor="wlPhone">
              <span>Phone number</span>
              <input
                id="wlPhone"
                name="phone"
                type="tel"
                placeholder="078 003 6048"
                autoComplete="tel"
                required
              />
              {status?.errors?.phone ? (
                <span className={styles.fieldError} id="phone-error">
                  {status.errors.phone}
                </span>
              ) : null}
            </label>
            <label className={styles.field} htmlFor="wlEmail">
              <span>Email address</span>
              <input
                id="wlEmail"
                name="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                required
              />
              {status?.errors?.email ? (
                <span className={styles.fieldError} id="email-error">
                  {status.errors.email}
                </span>
              ) : null}
            </label>
            <label className={styles.field} htmlFor="wlSchool">
              <span>Child&rsquo;s school</span>
              <input
                id="wlSchool"
                name="schoolName"
                placeholder="School name"
                autoComplete="organization"
                required
              />
              {status?.errors?.schoolName ? (
                <span className={styles.fieldError} id="schoolName-error">
                  {status.errors.schoolName}
                </span>
              ) : null}
            </label>
            <label className={styles.field} htmlFor="wlGrade">
              <span>Grade (optional)</span>
              <input
                id="wlGrade"
                name="grade"
                placeholder="e.g. Grade 4, Grade R"
              />
            </label>
          </div>

          <div className={styles.discountNote}>
            Your 2% discount code will be emailed when orders open
          </div>

          <label className={styles.consentField} htmlFor="wlConsent">
            <input
              id="wlConsent"
              name="consent"
              type="checkbox"
              required
            />
            <span>
              I consent to Pexpacks using my information to notify me about 2027
              orders. I have read and agree to the{" "}
              <Link
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                privacy policy
              </Link>
              .
            </span>
          </label>
          {status?.errors?.consent ? (
            <span className={styles.fieldError} id="consent-error">
              {status.errors.consent}
            </span>
          ) : null}

          <label className={styles.honeypot} aria-hidden="true" htmlFor="wlWebsite">
            Website
            <input
              id="wlWebsite"
              name="companyWebsite"
              tabIndex={-1}
              autoComplete="off"
            />
          </label>

          <Button
            type="submit"
            disabled={pending}
            variant="primary"
            size="lg"
            style={{ width: "100%", marginTop: 16 }}
          >
            {pending ? "Submitting..." : "Join the waiting list"}
          </Button>

          {status && !status.success && status.message ? (
            <p
              className={styles.errorMessage}
              role="alert"
              aria-live="polite"
            >
              {status.message}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
