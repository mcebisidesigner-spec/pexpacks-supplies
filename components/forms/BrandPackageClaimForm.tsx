"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { endpointPathForFormType } from "@/lib/forms/types";
import styles from "@/components/marketing/Marketing.module.css";

type ApiResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
};

const consentText =
  "I consent to Pexpacks using my information to process this brand package request and contact me about next steps.";

function val(data: FormData, key: string) {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function errorAttributes(errors: Record<string, string>, fieldName: string) {
  return errors[fieldName]
    ? {
        "aria-describedby": `${fieldName}-error`,
        "aria-invalid": true,
      }
    : {};
}

function FieldError({
  id,
  message,
}: {
  id: string;
  message: string | undefined;
}) {
  if (!message) {
    return null;
  }

  return (
    <span id={id} className={styles.fieldError}>
      {message}
    </span>
  );
}

export function BrandPackageClaimForm() {
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<ApiResponse | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    formData.set("formType", "brand-package-enquiry");
    formData.set("enquiryType", "Business Starter Brand Package");
    formData.set("packType", "Business Starter Brand Package");
    formData.set("packName", "Business Starter Brand Package");
    formData.set("quantity", "1");
    formData.set("sourceUrl", window.location.href);
    formData.set("pageUrl", window.location.href);
    formData.set("userAgent", navigator.userAgent);
    formData.set("submittedAt", new Date().toISOString());
    formData.set(
      "message",
      [
        `Business description: ${val(formData, "businessDescription")}`,
        `Branding preferences: ${val(formData, "brandingPreferences")}`,
        `Existing branding: ${val(formData, "existingBranding") || "Not specified"}`,
        `Target audience: ${val(formData, "targetAudience") || "Not specified"}`,
        `Website or social link: ${val(formData, "website") || "Not supplied"}`,
        `Deadline: ${val(formData, "deadline") || "Flexible / not supplied"}`,
        `Additional notes: ${val(formData, "notes") || "None"}`,
      ].join("\n")
    );

    setPending(true);
    setStatus(null);
    setErrors({});

    try {
      const response = await fetch(
        endpointPathForFormType("brand-package-enquiry"),
        {
          method: "POST",
          body: formData,
        }
      );
      const result = (await response.json()) as ApiResponse;
      setStatus(result);

      if (!result.success) {
        setErrors(result.errors ?? {});
        return;
      }

      form.reset();
    } catch {
      setStatus({
        success: false,
        message:
          "We could not submit your brand package request right now. Please try again or contact us directly.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.formCard}>
      <form onSubmit={handleSubmit} noValidate>
        <p className={styles.sectionEyebrow}>Package claim</p>
        <h2>Claim the Business Starter Brand Package</h2>
        <p className={styles.privacyNotice}>
          Share the business details, creative direction and any existing brand
          material so Pexpacks can prepare the package properly.
        </p>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Business name</span>
            <input
              name="businessName"
              placeholder="Business or trading name"
              autoComplete="organization"
              required
              {...errorAttributes(errors, "businessName")}
            />
            <FieldError
              id="businessName-error"
              message={errors.businessName}
            />
          </label>

          <label className={styles.field}>
            <span>Contact person</span>
            <input
              name="fullName"
              placeholder="Your name"
              autoComplete="name"
              required
              {...errorAttributes(errors, "fullName")}
            />
            <FieldError id="fullName-error" message={errors.fullName} />
          </label>

          <label className={styles.field}>
            <span>Phone</span>
            <input
              name="phone"
              type="tel"
              placeholder="078 003 6048"
              autoComplete="tel"
              required
              {...errorAttributes(errors, "phone")}
            />
            <FieldError id="phone-error" message={errors.phone} />
          </label>

          <label className={styles.field}>
            <span>Email</span>
            <input
              name="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              required
              {...errorAttributes(errors, "email")}
            />
            <FieldError id="email-error" message={errors.email} />
          </label>

          <label className={styles.field}>
            <span>Preferred contact method</span>
            <select name="preferredContactMethod" defaultValue="whatsapp">
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">Phone</option>
              <option value="email">Email</option>
            </select>
          </label>

          <label className={styles.field}>
            <span>Website or social link</span>
            <input
              name="website"
              type="url"
              placeholder="https://..."
              autoComplete="url"
            />
          </label>

          <label className={`${styles.field} ${styles.formWide}`}>
            <span>Brief description of the business</span>
            <textarea
              name="businessDescription"
              placeholder="What does the business do, who does it serve, and what should the brand communicate?"
              required
              {...errorAttributes(errors, "businessDescription")}
            />
            <FieldError
              id="businessDescription-error"
              message={errors.businessDescription}
            />
          </label>

          <label className={`${styles.field} ${styles.formWide}`}>
            <span>Branding preferences</span>
            <textarea
              name="brandingPreferences"
              placeholder="Colours, style, tone, references, likes, dislikes, and anything the design must include."
              required
              {...errorAttributes(errors, "brandingPreferences")}
            />
            <FieldError
              id="brandingPreferences-error"
              message={errors.brandingPreferences}
            />
          </label>

          <label className={`${styles.field} ${styles.formWide}`}>
            <span>Existing branding material</span>
            <textarea
              name="existingBranding"
              placeholder="Tell us what you already have: logo, colour palette, fonts, social pages, signage, documents, or none yet."
            />
          </label>

          <label className={styles.field}>
            <span>Target audience</span>
            <input
              name="targetAudience"
              placeholder="Parents, SMEs, contractors..."
            />
          </label>

          <label className={styles.field}>
            <span>Preferred deadline</span>
            <input name="deadline" placeholder="Flexible, 2 weeks, launch date..." />
          </label>

          <label className={`${styles.field} ${styles.formWide}`}>
            <span>Upload sample branding files</span>
            <input
              name="brandAssets"
              type="file"
              multiple
              accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.ppt,.pptx,.svg"
              {...errorAttributes(errors, "brandAssets")}
            />
            <small className={styles.fieldHint}>
              Optional. Upload up to 5 files, 4 MB each: logos, colour palettes,
              flyers, references, documents or screenshots.
            </small>
            <FieldError id="brandAssets-error" message={errors.brandAssets} />
          </label>

          <label className={`${styles.field} ${styles.formWide}`}>
            <span>Additional notes</span>
            <textarea
              name="notes"
              placeholder="Anything else we should know before preparing your package?"
            />
          </label>
        </div>

        <label className={styles.consentField}>
          <input
            name="consent"
            type="checkbox"
            required
            {...errorAttributes(errors, "consent")}
          />
          <span>
            {consentText}{" "}
            <Link href="/privacy-policy" className={styles.inlineTextLink}>
              privacy policy
            </Link>
          </span>
        </label>
        <FieldError id="consent-error" message={errors.consent} />

        <label className={styles.honeypot} aria-hidden="true">
          Company website
          <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
        </label>

        <Button type="submit" disabled={pending}>
          {pending ? "Submitting..." : "Submit Package Claim"}
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
