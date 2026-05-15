"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import styles from "@/components/marketing/Marketing.module.css";

type ApiResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
};

type FormType =
  | "school-pack-enquiry"
  | "office-pack-enquiry"
  | "bulk-order"
  | "school-partnership"
  | "contact"
  | "track-order-interest";

type PexpacksEnquiryFormProps = {
  mode: "contact" | "partner";
  title: string;
  submitLabel: string;
};

const contactOptions = [
  "Parent order",
  "School partnership",
  "Office pack",
  "Bulk order",
  "Supplier partnership",
  "General enquiry",
];

const partnerOptions = ["School", "Supplier", "Office stationery partner"];

const consentText =
  "I consent to Pexpacks using my information to contact me about this enquiry and provide related support.";

function resolveContactFormType(enquiryType: string): FormType {
  if (enquiryType === "Parent order") return "school-pack-enquiry";
  if (enquiryType === "Office pack") return "office-pack-enquiry";
  if (enquiryType === "Bulk order") return "bulk-order";
  if (enquiryType === "School partnership") return "school-partnership";
  return "contact";
}

function val(data: FormData, key: string) {
  const v = data.get(key);
  return typeof v === "string" ? v : "";
}

export function PexpacksEnquiryForm({
  mode,
  title,
  submitLabel,
}: PexpacksEnquiryFormProps) {
  const [enquiryType, setEnquiryType] = useState(contactOptions[0]);
  const [partnerType, setPartnerType] = useState(partnerOptions[0]);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<ApiResponse | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isContact = mode === "contact";
  const showSchoolFields =
    isContact && ["Parent order", "School partnership"].includes(enquiryType);
  const showOfficeFields =
    isContact && ["Office pack", "Bulk order"].includes(enquiryType);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    setPending(true);
    setStatus(null);
    setErrors({});

    const payload = {
      formType: isContact
        ? resolveContactFormType(enquiryType)
        : "school-partnership",
      fullName: val(fd, "fullName"),
      phone: val(fd, "phone"),
      email: val(fd, "email") || undefined,
      preferredContactMethod: val(fd, "preferredContactMethod") || undefined,
      schoolName: val(fd, "schoolName") || undefined,
      grade: val(fd, "grade") || undefined,
      businessName: val(fd, "businessName") || undefined,
      orderQuantity: val(fd, "orderQuantity") || undefined,
      packType: isContact ? enquiryType : partnerType,
      message: val(fd, "message"),
      consent: fd.get("consent") === "on",
      companyWebsite: val(fd, "companyWebsite"),
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      submittedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await res.json()) as ApiResponse;
      setStatus(result);
      if (!result.success) {
        setErrors(result.errors ?? {});
        return;
      }
      form.reset();
      setEnquiryType(contactOptions[0]);
      setPartnerType(partnerOptions[0]);
    } catch {
      setStatus({
        success: false,
        message:
          "We could not submit your enquiry right now. Please try again or contact us directly.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.formCard}>
      <form onSubmit={handleSubmit} noValidate>
        <p className={styles.eyebrow}>
          {isContact ? "Contact enquiry" : "Partnership enquiry"}
        </p>
        <h2>{title}</h2>
        <p className={styles.privacyNotice}>
          We only use your details to respond to your enquiry and manage your
          stationery pack request. We collect only the information needed to
          assist you.
        </p>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Full name</span>
            <input
              name="fullName"
              placeholder="Your name"
              autoComplete="name"
              required
            />
            {errors.fullName ? (
              <span className={styles.fieldError}>{errors.fullName}</span>
            ) : null}
          </label>
          <label className={styles.field}>
            <span>Phone</span>
            <input
              name="phone"
              type="tel"
              placeholder="078 003 6048"
              autoComplete="tel"
              required
            />
            {errors.phone ? (
              <span className={styles.fieldError}>{errors.phone}</span>
            ) : null}
          </label>
          <label className={styles.field}>
            <span>Email</span>
            <input
              name="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
            />
            {errors.email ? (
              <span className={styles.fieldError}>{errors.email}</span>
            ) : null}
          </label>
          <label className={styles.field}>
            <span>Preferred contact method</span>
            <select name="preferredContactMethod" defaultValue="whatsapp">
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">Phone</option>
              <option value="email">Email</option>
            </select>
          </label>

          {isContact ? (
            <label className={styles.field}>
              <span>Enquiry type</span>
              <select
                name="enquiryType"
                value={enquiryType}
                onChange={(e) => setEnquiryType(e.target.value)}
              >
                {contactOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </label>
          ) : (
            <>
              <label className={styles.field}>
                <span>Organisation</span>
                <input
                  name="businessName"
                  placeholder="School, business or supplier name"
                  autoComplete="organization"
                  required
                />
                {errors.businessName ? (
                  <span className={styles.fieldError}>
                    {errors.businessName}
                  </span>
                ) : null}
              </label>
              <label className={styles.field}>
                <span>Partner type</span>
                <select
                  name="partnerType"
                  value={partnerType}
                  onChange={(e) => setPartnerType(e.target.value)}
                >
                  {partnerOptions.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </label>
            </>
          )}

          {showSchoolFields ? (
            <>
              <label className={styles.field}>
                <span>School name</span>
                <input
                  name="schoolName"
                  placeholder="School name"
                  autoComplete="organization"
                />
              </label>
              <label className={styles.field}>
                <span>Grade</span>
                <input name="grade" placeholder="Grade R, Grade 4..." />
              </label>
            </>
          ) : null}

          {showOfficeFields ? (
            <>
              <label className={styles.field}>
                <span>Business name</span>
                <input
                  name="businessName"
                  placeholder="Business name"
                  autoComplete="organization"
                />
              </label>
              <label className={styles.field}>
                <span>Order quantity</span>
                <input
                  name="orderQuantity"
                  type="number"
                  min="1"
                  placeholder="10"
                />
              </label>
            </>
          ) : null}

          <label className={`${styles.field} ${styles.formWide}`}>
            <span>Message</span>
            <textarea
              name="message"
              placeholder="Tell us what you need"
              required
            />
            {errors.message ? (
              <span className={styles.fieldError}>{errors.message}</span>
            ) : null}
          </label>
        </div>

        <label className={styles.consentField}>
          <input name="consent" type="checkbox" required />
          <span>
            {consentText}{" "}
            <Link href="/privacy-policy" className={styles.inlineTextLink}>
              privacy-policy
            </Link>
          </span>
        </label>
        {errors.consent ? (
          <p className={styles.fieldError}>{errors.consent}</p>
        ) : null}

        {/* Honeypot — hidden from real users */}
        <label className={styles.honeypot} aria-hidden="true">
          Company website
          <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
        </label>

        <Button type="submit" disabled={pending}>
          {pending ? "Submitting..." : submitLabel}
        </Button>
        {status ? (
          <p
            className={
              status.success ? styles.statusMessage : styles.statusError
            }
            role={status.success ? "status" : "alert"}
            aria-live="polite"
          >
            {status.message}
          </p>
        ) : null}
      </form>
    </div>
  );
}
