"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { endpointPathForFormType, type FormType } from "@/lib/forms/types";
import { isValidEmailAddress, isValidSouthAfricanPhone } from "@/lib/forms/contact";
import heroStyles from "@/components/marketing/HeroBase.module.css";
import formStyles from "@/components/marketing/MarketingForms.module.css";

type ApiResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
};

type PexpacksEnquiryFormProps = {
  mode: "contact" | "partner";
  title: string;
  submitLabel: string;
  initialEnquiryType?: string;
  initialMessage?: string;
  initialBusinessName?: string;
};

const contactOptions = [
  "Parent order",
  "School partnership",
  "Supplier partnership",
  "General enquiry",
];

const partnerOptions = ["School", "Supplier", "Partner"];
type ContactOption = (typeof contactOptions)[number];

const consentText =
  "I consent to Pexpacks using my information to contact me about this enquiry and provide related support. I have read and agree to the";

function resolveContactFormType(enquiryType: string): FormType {
  if (enquiryType === "Parent order") return "school-pack-enquiry";
  if (enquiryType === "School partnership") return "school-partnership";
  return "contact";
}

function val(data: FormData, key: string) {
  const v = data.get(key);
  return typeof v === "string" ? v : "";
}

function normaliseEnquiryType(value?: string): ContactOption {
  return contactOptions.includes(value as ContactOption)
    ? (value as ContactOption)
    : contactOptions[0];
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
    <span id={id} className={formStyles.fieldError}>
      {message}
    </span>
  );
}

export function PexpacksEnquiryForm({
  mode,
  title,
  submitLabel,
  initialEnquiryType,
  initialMessage = "",
  initialBusinessName = "",
}: PexpacksEnquiryFormProps) {
  const initialType = normaliseEnquiryType(initialEnquiryType);
  const [enquiryType, setEnquiryType] = useState<ContactOption>(initialType);
  const [partnerType, setPartnerType] = useState(partnerOptions[0]);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<ApiResponse | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isContact = mode === "contact";
  const showSchoolFields =
    isContact && ["Parent order", "School partnership"].includes(enquiryType);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const validationErrors: Record<string, string> = {};

    if (!fd.get("consent")) {
      validationErrors.consent = "You must consent to process this request.";
    }

    const phoneVal = (fd.get("phone") as string || "").trim();
    if (!phoneVal) {
      validationErrors.phone = "Phone number is required.";
    } else if (!isValidSouthAfricanPhone(phoneVal)) {
      validationErrors.phone = "Please enter a valid South African phone number (e.g., 072 123 4567).";
    }

    const emailVal = (fd.get("email") as string || "").trim();
    if (emailVal && !isValidEmailAddress(emailVal)) {
      validationErrors.email = "Please enter a valid email address (e.g., name@example.com).";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

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
      enquiryType: isContact ? enquiryType : partnerType,
      packType: isContact ? enquiryType : partnerType,
      message: val(fd, "message"),
      consent: fd.get("consent") === "on",
      companyWebsite: val(fd, "companyWebsite"),
      sourceUrl: window.location.href,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      submittedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(endpointPathForFormType(payload.formType), {
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
      setEnquiryType(contactOptions[0] as ContactOption);
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
    <div className={formStyles.formCard}>
      <form onSubmit={handleSubmit} noValidate>
        <p className={heroStyles.eyebrow}>
          {isContact ? "Contact enquiry" : "Partnership enquiry"}
        </p>
        <h2>{title}</h2>
        <p className={formStyles.privacyNotice}>
          I confirm that I am duly authorised to submit the parent or
          learner-related information and that the information provided is
          accurate.
        </p>
        <div className={formStyles.formStack}>
          <label className={formStyles.field} htmlFor="enqFullName">
            <span>Full name</span>
            <input
              id="enqFullName"
              name="fullName"
              placeholder="Your name"
              autoComplete="name"
              required
              {...errorAttributes(errors, "fullName")}
            />
            <FieldError id="fullName-error" message={errors.fullName} />
          </label>
          <label className={formStyles.field} htmlFor="enqPhone">
            <span>Phone</span>
            <input
              id="enqPhone"
              name="phone"
              type="tel"
              placeholder="078 003 6048"
              autoComplete="tel"
              required
              {...errorAttributes(errors, "phone")}
            />
            <FieldError id="phone-error" message={errors.phone} />
          </label>
          <label className={formStyles.field} htmlFor="enqEmail">
            <span>Email</span>
            <input
              id="enqEmail"
              name="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
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

          {isContact ? (
            <Select
              name="enquiryType"
              label="Enquiry type"
              value={enquiryType}
              onChange={(event) =>
                setEnquiryType(event.target.value as ContactOption)
              }
              options={contactOptions}
            />
          ) : (
            <>
              <label className={formStyles.field} htmlFor="enqPartnerBusinessName">
                <span>School</span>
                <input
                  id="enqPartnerBusinessName"
                  name="businessName"
                  placeholder="School name"
                  autoComplete="organization"
                  defaultValue={initialBusinessName}
                  required
                  {...errorAttributes(errors, "businessName")}
                />
                <FieldError
                  id="businessName-error"
                  message={errors.businessName}
                />
              </label>
              <Select
                name="partnerType"
                label="Partner type"
                value={partnerType}
                onChange={(event) => setPartnerType(event.target.value)}
                options={partnerOptions}
              />
            </>
          )}

          {showSchoolFields ? (
            <>
              <label className={formStyles.field} htmlFor="enqSchoolName">
                <span>School name</span>
                <input
                  id="enqSchoolName"
                  name="schoolName"
                  placeholder="School name"
                  autoComplete="organization"
                  required
                  {...errorAttributes(errors, "schoolName")}
                />
                <FieldError id="schoolName-error" message={errors.schoolName} />
              </label>
              <label className={formStyles.field} htmlFor="enqGrade">
                <span>Grade</span>
                <input
                  id="enqGrade"
                  name="grade"
                  placeholder="Grade R, Grade 4..."
                  required
                  {...errorAttributes(errors, "grade")}
                />
                <FieldError id="grade-error" message={errors.grade} />
              </label>
            </>
          ) : null}

          <label className={formStyles.field} htmlFor="enqMessage">
            <span>Message</span>
            <textarea
              id="enqMessage"
              name="message"
              placeholder="Tell us what you need"
              defaultValue={initialMessage}
              required
              {...errorAttributes(errors, "message")}
            />
            <FieldError id="message-error" message={errors.message} />
          </label>
        </div>

        <label className={formStyles.consentField} htmlFor="enqConsent">
          <input
            id="enqConsent"
            name="consent"
            type="checkbox"
            required
            {...errorAttributes(errors, "consent")}
          />
          <span>
            {consentText}{" "}
            <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer" className={formStyles.inlineTextLink}>
              privacy policy
            </Link>
            .
          </span>
        </label>
        <FieldError id="consent-error" message={errors.consent} />

        {/* Honeypot — hidden from real users */}
        <label className={formStyles.honeypot} aria-hidden="true" htmlFor="enqCompanyWebsite">
          Company website
          <input id="enqCompanyWebsite" name="companyWebsite" tabIndex={-1} autoComplete="off" />
        </label>

        <Button type="submit" disabled={pending}>
          {pending ? "Submitting..." : submitLabel}
        </Button>
        {status ? (
          <p
            className={
              status.success ? formStyles.statusMessage : formStyles.statusError
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
