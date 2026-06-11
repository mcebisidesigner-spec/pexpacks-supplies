"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { endpointPathForFormType } from "@/lib/forms/types";
import { createClient } from "@/lib/supabase/client";
import { isValidEmailAddress, isValidSouthAfricanPhone } from "@/lib/forms/contact";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import formStyles from "@/components/marketing/MarketingForms.module.css";

type ApiResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
  submission_id?: string;
};

const consentText =
  "I consent to Pexpacks using my information to process this brand package request and contact me about next steps.";

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
  if (!message) return null;
  return (
    <span id={id} className={formStyles.fieldError}>
      {message}
    </span>
  );
}

export function BrandPackageClaimForm() {
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<ApiResponse | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    const raw = new FormData(form);
    const validationErrors: Record<string, string> = {};

    if (!raw.get("consent")) {
      validationErrors.consent = "You must consent to process this request.";
    }

    const phoneVal = (raw.get("phone") as string || "").trim();
    if (!phoneVal) {
      validationErrors.phone = "Phone number is required.";
    } else if (!isValidSouthAfricanPhone(phoneVal)) {
      validationErrors.phone = "Please enter a valid South African phone number (e.g., 072 123 4567).";
    }

    const emailVal = (raw.get("email") as string || "").trim();
    if (!emailVal) {
      validationErrors.email = "Email address is required.";
    } else if (!isValidEmailAddress(emailVal)) {
      validationErrors.email = "Please enter a valid email address (e.g., name@example.com).";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload: Record<string, unknown> = {};

    for (const [key, value] of raw.entries()) {
      if (value instanceof File) continue;
      payload[key] = value;
    }

    payload.formType = "brand-package-enquiry";
    payload.enquiryType = "Business Starter Brand Package";
    payload.packType = "Business Starter Brand Package";
    payload.packName = "Business Starter Brand Package";
    payload.quantity = "1";
    payload.sourceUrl = window.location.href;
    payload.pageUrl = window.location.href;
    payload.userAgent = navigator.userAgent;
    payload.submittedAt = new Date().toISOString();
    payload.message = [
      `Business description: ${payload.businessDescription ?? ""}`,
      `Branding preferences: ${payload.brandingPreferences ?? ""}`,
      `Existing branding: ${payload.existingBranding || "Not specified"}`,
      `Target audience: ${payload.targetAudience || "Not specified"}`,
      `Website or social link: ${payload.website || "Not supplied"}`,
      `Deadline: ${payload.deadline || "Flexible / not supplied"}`,
      `Additional notes: ${payload.notes || "None"}`,
    ].join("\n");

    const files = fileRef.current?.files;
    if (files && files.length > 0) {
      const oversized: string[] = [];
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          oversized.push(`${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
        }
      }
      if (oversized.length) {
        setErrors({
          brandAssets: `Files must be 5 MB or smaller: ${oversized.join(", ")}`,
        });
        setPending(false);
        return;
      }
    }

    setPending(true);
    setStatus(null);
    setErrors({});

    try {
      const response = await fetch(
        endpointPathForFormType("brand-package-enquiry"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = (await response.json()) as ApiResponse;
      setStatus(result);

      if (!result.success) {
        setErrors(result.errors ?? {});
        return;
      }

      const files = fileRef.current?.files;
      if (files && files.length > 0 && result.submission_id) {
        const supabase = createClient();
        const uploads: Array<{ name: string; path: string }> = [];

        for (const file of files) {
          const path = `claims/${result.submission_id}/${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from("brand-assets")
            .upload(path, file);

          if (uploadError) {
            console.error(`[brand-package] Failed to upload ${file.name}:`, uploadError);
            continue;
          }

          uploads.push({ name: file.name, path });

          await supabase.from("brand_package_assets").insert({
            claim_id: result.submission_id,
            file_path: path,
            file_name: file.name,
            file_size: file.size,
            content_type: file.type || null,
          });
        }
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
    <div className={formStyles.formCard}>
      <form onSubmit={handleSubmit} noValidate>
        <p className={sectionStyles.sectionEyebrow}>Claim yours</p>
        <h2>Claim the Business Starter Brand Package</h2>
        <p className={formStyles.privacyNotice}>
          Share the business details, creative direction and any existing brand
          material so Pexpacks can prepare the package properly.
        </p>

        <div className={formStyles.formGrid}>
          <label className={formStyles.field} htmlFor="claimBusinessName">
            <span>Business name</span>
            <input
              id="claimBusinessName"
              name="businessName"
              placeholder="Business or trading name"
              autoComplete="organization"
              required
              {...errorAttributes(errors, "businessName")}
            />
            <FieldError id="businessName-error" message={errors.businessName} />
          </label>

          <label className={formStyles.field} htmlFor="claimFullName">
            <span>Contact person</span>
            <input
              id="claimFullName"
              name="fullName"
              placeholder="Your name"
              autoComplete="name"
              required
              {...errorAttributes(errors, "fullName")}
            />
            <FieldError id="fullName-error" message={errors.fullName} />
          </label>

          <label className={formStyles.field} htmlFor="claimPhone">
            <span>Phone</span>
            <input
              id="claimPhone"
              name="phone"
              type="tel"
              placeholder="078 003 6048"
              autoComplete="tel"
              required
              {...errorAttributes(errors, "phone")}
            />
            <FieldError id="phone-error" message={errors.phone} />
          </label>

          <label className={formStyles.field} htmlFor="claimEmail">
            <span>Email</span>
            <input
              id="claimEmail"
              name="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              required
              {...errorAttributes(errors, "email")}
            />
            <FieldError id="email-error" message={errors.email} />
          </label>

          <Select
            name="preferredContactMethod"
            label="Preferred contact method"
            defaultValue="whatsapp"
            options={[
              { value: "whatsapp", label: "WhatsApp" },
              { value: "phone", label: "Phone" },
              { value: "email", label: "Email" },
            ]}
          />

          <label className={formStyles.field} htmlFor="claimWebsite">
            <span>Website or social link</span>
            <input
              id="claimWebsite"
              name="website"
              type="url"
              placeholder="https://..."
              autoComplete="url"
            />
          </label>

          <label className={`${formStyles.field} ${formStyles.formWide}`} htmlFor="claimBusinessDescription">
            <span>Brief description of the business</span>
            <textarea
              id="claimBusinessDescription"
              name="businessDescription"
              placeholder="What does the business do, who does it serve, and what should the brand communicate?"
              required
              {...errorAttributes(errors, "businessDescription")}
            />
            <FieldError id="businessDescription-error" message={errors.businessDescription} />
          </label>

          <label className={`${formStyles.field} ${formStyles.formWide}`} htmlFor="claimBrandingPreferences">
            <span>Branding preferences</span>
            <textarea
              id="claimBrandingPreferences"
              name="brandingPreferences"
              placeholder="Colours, style, tone, references, likes, dislikes, and anything the design must include."
              required
              {...errorAttributes(errors, "brandingPreferences")}
            />
            <FieldError id="brandingPreferences-error" message={errors.brandingPreferences} />
          </label>

          <label className={`${formStyles.field} ${formStyles.formWide}`} htmlFor="claimExistingBranding">
            <span>Existing branding material</span>
            <textarea
              id="claimExistingBranding"
              name="existingBranding"
              placeholder="Tell us what you already have: logo, colour palette, fonts, social pages, signage, documents, or none yet."
            />
          </label>

          <label className={formStyles.field} htmlFor="claimTargetAudience">
            <span>Target audience</span>
            <input
              id="claimTargetAudience"
              name="targetAudience"
              placeholder="Parents, SMEs, contractors..."
            />
          </label>

          <label className={formStyles.field} htmlFor="claimDeadline">
            <span>Preferred deadline</span>
            <input id="claimDeadline" name="deadline" placeholder="Flexible, 2 weeks, launch date..." />
          </label>

          <label className={`${formStyles.field} ${formStyles.formWide}`} htmlFor="claimBrandAssets">
            <span>Upload sample branding files</span>
            <input
              id="claimBrandAssets"
              ref={fileRef}
              name="brandAssets"
              type="file"
              multiple
              accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.ppt,.pptx,.svg"
              {...errorAttributes(errors, "brandAssets")}
            />
            <small className={formStyles.fieldHint}>
              Optional. Upload up to 5 files, 5 MB each: logos, colour palettes,
              flyers, references, documents or screenshots. Files upload after the
              form is submitted.
            </small>
            <FieldError id="brandAssets-error" message={errors.brandAssets} />
          </label>

          <label className={`${formStyles.field} ${formStyles.formWide}`} htmlFor="claimNotes">
            <span>Additional notes</span>
            <textarea
              id="claimNotes"
              name="notes"
              placeholder="Anything else we should know before preparing your package?"
            />
          </label>
        </div>

        <label className={formStyles.consentField} htmlFor="claimConsent">
          <input
            id="claimConsent"
            name="consent"
            type="checkbox"
            required
            {...errorAttributes(errors, "consent")}
          />
          <span>
            {consentText}{" "}
            <Link href="/privacy-policy" className={formStyles.inlineTextLink}>
              privacy policy
            </Link>
          </span>
        </label>
        <FieldError id="consent-error" message={errors.consent} />

        <label className={formStyles.honeypot} aria-hidden="true" htmlFor="claimCompanyWebsite">
          Company website
          <input id="claimCompanyWebsite" name="companyWebsite" tabIndex={-1} autoComplete="off" />
        </label>

        <Button type="submit" disabled={pending}>
          {pending ? "Submitting..." : "Submit Package Claim"}
        </Button>

        {status ? (
          <p
            className={
              status.success ? formStyles.statusMessage : formStyles.statusError
            }
            role={status.success ? "status" : "alert"}
            aria-live="polite"
          >
            {status.success && status.submission_id
              ? "Your brand package request has been submitted. Uploading files..."
              : status.message}
          </p>
        ) : null}
      </form>
    </div>
  );
}
