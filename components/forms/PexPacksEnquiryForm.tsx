"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CaptchaField } from "./CaptchaField";
import styles from "@/components/marketing/Marketing.module.css";

type ApiResponse = {
  success: boolean;
  message: string;
  submissionId?: string;
  errors?: Record<string, string>;
};

type FormType =
  | "school-pack-enquiry"
  | "office-pack-enquiry"
  | "bulk-order"
  | "school-partnership"
  | "contact"
  | "track-order-interest";

type PexPacksEnquiryFormProps = {
  mode: "contact" | "partner";
  title: string;
  submitLabel: string;
};

const contactOptions = [
  "Parent order",
  "School partnership",
  "Office pack",
  "Bulk order",
  "Sponsorship",
  "Supplier partnership",
  "General enquiry"
];

const partnerOptions = ["School", "Sponsor", "Supplier", "Community partner"];

const consentText =
  "I agree that PexPacks may use my information to contact me about this enquiry, prepare my stationery pack request, and provide related support.";
const captchaSiteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

function resolveContactFormType(enquiryType: string): FormType {
  if (enquiryType === "Parent order") {
    return "school-pack-enquiry";
  }

  if (enquiryType === "Office pack") {
    return "office-pack-enquiry";
  }

  if (enquiryType === "Bulk order") {
    return "bulk-order";
  }

  if (enquiryType === "School partnership") {
    return "school-partnership";
  }

  return "contact";
}

function formValue(data: FormData, key: string) {
  const value = data.get(key);
  return typeof value === "string" ? value : "";
}

export function PexPacksEnquiryForm({ mode, title, submitLabel }: PexPacksEnquiryFormProps) {
  const [enquiryType, setEnquiryType] = useState(contactOptions[0]);
  const [partnerType, setPartnerType] = useState(partnerOptions[0]);
  const [captchaToken, setCaptchaToken] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<ApiResponse | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isContact = mode === "contact";
  const showSchoolFields = isContact && ["Parent order", "School partnership"].includes(enquiryType);
  const showOfficeFields = isContact && ["Office pack", "Bulk order"].includes(enquiryType);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setPending(true);
    setStatus(null);
    setErrors({});

    const payload = {
      formType: isContact ? resolveContactFormType(enquiryType) : "school-partnership",
      fullName: formValue(formData, "fullName"),
      phone: formValue(formData, "phone"),
      email: formValue(formData, "email"),
      preferredContactMethod: formValue(formData, "preferredContactMethod") || undefined,
      schoolName: formValue(formData, "schoolName") || undefined,
      grade: formValue(formData, "grade") || undefined,
      businessName: formValue(formData, "businessName") || undefined,
      orderQuantity: formValue(formData, "orderQuantity") || undefined,
      packType: isContact ? enquiryType : partnerType,
      message: formValue(formData, "message"),
      consent: formData.get("consent") === "on",
      companyWebsite: formValue(formData, "companyWebsite"),
      captchaToken,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      submittedAt: new Date().toISOString()
    };

    try {
      const response = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = (await response.json()) as ApiResponse;

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
        message: "We could not submit your enquiry right now. Please try again or contact us directly."
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.formCard}>
      <form onSubmit={handleSubmit} noValidate>
        <h2>{title}</h2>
        <p className={styles.privacyNotice}>
          We only use your details to respond to your enquiry and manage your stationery pack request. We collect only
          the information needed to assist you. You may contact PexPacks to update, correct, or request deletion of your
          information.
        </p>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Full name</span>
            <input name="fullName" placeholder="Your name" autoComplete="name" required />
            {errors.fullName ? <span className={styles.fieldError}>{errors.fullName}</span> : null}
          </label>
          <label className={styles.field}>
            <span>Phone</span>
            <input name="phone" type="tel" placeholder="078 003 6048" autoComplete="tel" required />
            {errors.phone ? <span className={styles.fieldError}>{errors.phone}</span> : null}
          </label>
          <label className={styles.field}>
            <span>Email</span>
            <input name="email" type="email" placeholder="name@example.com" autoComplete="email" />
            {errors.email ? <span className={styles.fieldError}>{errors.email}</span> : null}
          </label>
          <label className={styles.field}>
            <span>Preferred contact method</span>
            <select name="preferredContactMethod" defaultValue="whatsapp">
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">Phone</option>
              <option value="email">Email</option>
            </select>
            {errors.preferredContactMethod ? <span className={styles.fieldError}>{errors.preferredContactMethod}</span> : null}
          </label>

          {isContact ? (
            <label className={styles.field}>
              <span>Enquiry type</span>
              <select name="enquiryType" value={enquiryType} onChange={(event) => setEnquiryType(event.target.value)}>
                {contactOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          ) : (
            <>
              <label className={styles.field}>
                <span>Organisation</span>
                <input name="businessName" placeholder="School, business or supplier name" autoComplete="organization" required />
                {errors.businessName ? <span className={styles.fieldError}>{errors.businessName}</span> : null}
              </label>
              <label className={styles.field}>
                <span>Partner type</span>
                <select name="partnerType" value={partnerType} onChange={(event) => setPartnerType(event.target.value)}>
                  {partnerOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
            </>
          )}

          {showSchoolFields ? (
            <>
              <label className={styles.field}>
                <span>School name</span>
                <input name="schoolName" placeholder="School name" autoComplete="organization" />
                {errors.schoolName ? <span className={styles.fieldError}>{errors.schoolName}</span> : null}
              </label>
              <label className={styles.field}>
                <span>Grade</span>
                <input name="grade" placeholder="Grade R, Grade 4..." />
                {errors.grade ? <span className={styles.fieldError}>{errors.grade}</span> : null}
              </label>
            </>
          ) : null}

          {showOfficeFields ? (
            <>
              <label className={styles.field}>
                <span>Business name</span>
                <input name="businessName" placeholder="Business name" autoComplete="organization" />
                {errors.businessName ? <span className={styles.fieldError}>{errors.businessName}</span> : null}
              </label>
              <label className={styles.field}>
                <span>Order quantity</span>
                <input name="orderQuantity" type="number" min="1" placeholder="10" />
                {errors.orderQuantity ? <span className={styles.fieldError}>{errors.orderQuantity}</span> : null}
              </label>
            </>
          ) : null}

          <label className={`${styles.field} ${styles.formWide}`}>
            <span>Message</span>
            <textarea name="message" placeholder="Tell us what you need" required />
            {errors.message ? <span className={styles.fieldError}>{errors.message}</span> : null}
          </label>
        </div>

        <label className={styles.consentField}>
          <input name="consent" type="checkbox" required />
          <span>{consentText}</span>
        </label>
        {errors.consent ? <p className={styles.fieldError}>{errors.consent}</p> : null}

        <CaptchaField
          siteKey={captchaSiteKey}
          token={captchaToken}
          callbackName="onPexPacksEnquiryCaptcha"
          onTokenChange={setCaptchaToken}
        />

        <label className={styles.honeypot} aria-hidden="true">
          Company website
          <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
        </label>

        <Button type="submit" disabled={pending}>
          {pending ? "Submitting..." : submitLabel}
        </Button>
        {status ? (
          <p
            className={status.success ? styles.statusMessage : styles.statusError}
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
