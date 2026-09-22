"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useNotification } from "@/components/ui/NotificationProvider";
import Select from "@/components/ui/Select";
import { endpointPathForFormType, type FormType } from "@/lib/forms/types";
import {
  isValidEmailAddress,
  isValidSouthAfricanPhone,
} from "@/lib/forms/contact";

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

// ── Shared form utility strings ───────────────────────────────────────────────
const formCardCls =
  "p-[28px] bg-[var(--card-bg)] rounded-[var(--radius-card-lg)] [box-shadow:var(--card-shadow)] max-[480px]:p-[22px]";
const formStackCls = "grid gap-[var(--form-grid-gap)]";
const fieldCls = "min-w-0 grid gap-[var(--form-field-gap)]";
const fieldLabelCls =
  "text-[var(--form-label-color)] text-[var(--form-label-size)] font-[var(--form-label-weight)] leading-[1.25]";
const fieldInputCls =
  "min-w-0 w-full min-h-[var(--form-control-height)] [border:var(--form-control-border)] rounded-[var(--form-control-radius)] px-[var(--form-control-padding-x)] py-0 bg-[var(--form-control-bg)] text-[var(--form-control-color)] text-[15px] font-inherit transition-[var(--interactive-transition)] placeholder:text-[var(--form-control-placeholder)] placeholder:opacity-100 hover:border-[var(--form-control-hover-border)] focus-visible:outline-none focus-visible:border-[var(--form-control-focus-border)] focus-visible:[box-shadow:var(--form-control-focus-shadow)]";
const fieldTextareaCls =
  "min-w-0 w-full min-h-[118px] [border:var(--form-control-border)] rounded-[var(--form-control-radius)] px-[var(--form-control-padding-x)] py-[var(--form-control-padding-y)] bg-[var(--form-control-bg)] text-[var(--form-control-color)] text-[15px] font-inherit resize-y transition-[var(--interactive-transition)] placeholder:text-[var(--form-control-placeholder)] placeholder:opacity-100 hover:border-[var(--form-control-hover-border)] focus-visible:outline-none focus-visible:border-[var(--form-control-focus-border)] focus-visible:[box-shadow:var(--form-control-focus-shadow)]";
const fieldErrorCls =
  "text-[var(--form-error-color)] text-[var(--form-error-size)] font-[var(--form-error-weight)] leading-[1.3]";
const honeypotCls = "absolute left-[-10000px] w-px h-px overflow-hidden";
const consentFieldCls =
  "grid grid-cols-[20px_1fr] gap-[var(--space-3)] items-start";
const consentInputCls = "w-[20px] h-[20px] mt-[2px] accent-[var(--pex-keppel)]";
const consentSpanCls =
  "text-[var(--pex-primary)] text-[var(--text-sm)] leading-[1.45]";
const inlineTextLinkCls =
  "relative inline-block font-medium text-[var(--pex-keppel)] no-underline after:absolute after:bottom-[-3px] after:left-0 after:h-[1.5px] after:w-0 after:bg-current after:transition-[width] after:duration-200 after:ease-out hover:text-[var(--pex-keppel-dark)] hover:after:w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pex-keppel)] focus-visible:ring-offset-2 motion-reduce:after:transition-none";
const privacyNoticeCls =
  "m-0 text-[var(--pex-text-muted)] text-[var(--text-sm)] leading-[1.45]";
const statusMessageCls =
  "mt-[4px] rounded-[var(--radius-md)] px-[14px] py-[var(--space-3)] bg-[rgba(47,133,90,0.12)] text-[var(--pex-success)] font-extrabold";
const statusErrorCls =
  "mt-[4px] rounded-[var(--radius-md)] px-[14px] py-[var(--space-3)] bg-[rgba(185,28,28,0.1)] text-[var(--pex-error)] font-extrabold";

function FieldError({
  id,
  message,
}: {
  id: string;
  message: string | undefined;
}) {
  if (!message) return null;
  return (
    <span id={id} className={fieldErrorCls}>
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
  const { notify } = useNotification();

  const isContact = mode === "contact";
  const showSchoolFields =
    isContact && ["Parent order", "School partnership"].includes(enquiryType);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const validationErrors: Record<string, string> = {};

    if (!fd.get("consent")) {
      validationErrors.consent = "Please tick the box so I can use these details to respond.";
    }

    const phoneVal = ((fd.get("phone") as string) || "").trim();
    if (!phoneVal) {
      validationErrors.phone = "Phone number is required.";
    } else if (!isValidSouthAfricanPhone(phoneVal)) {
      validationErrors.phone =
        "Please enter a valid South African phone number (e.g., 072 123 4567).";
    }

    const emailVal = ((fd.get("email") as string) || "").trim();
    if (emailVal && !isValidEmailAddress(emailVal)) {
      validationErrors.email =
        "Please enter a valid email address (e.g., name@example.com).";
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
        notify({
          tone: "error",
          title: "Enquiry not sent",
          message:
            result.message ||
            "Something went wrong. Please try again or send a WhatsApp message.",
        });
        return;
      }
      notify({
        tone: "success",
        title: isContact ? "Enquiry sent" : "Partnership enquiry sent",
        message: "Thanks - I have received your message and will help with the next step.",
      });
      form.reset();
      setEnquiryType(contactOptions[0] as ContactOption);
      setPartnerType(partnerOptions[0]);
    } catch {
      const message =
        "Something went wrong while sending your enquiry. Please try again, or send a WhatsApp message if it continues.";
      setStatus({ success: false, message });
      notify({ tone: "error", title: "Enquiry not sent", message });
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className={formCardCls}
      style={{ border: "var(--card-border)" }}
    >
      <form onSubmit={handleSubmit} noValidate className="grid gap-[14px]">
        {/* Eyebrow — migrated from HeroBase.module.css */}
        <p className="m-0 mb-[var(--space-4)] text-[var(--pex-keppel)] font-extrabold text-[var(--text-sm)] tracking-[0]">
          {isContact ? "Contact enquiry" : "Partnership enquiry"}
        </p>
        <h2 className="m-0 mb-[var(--space-2)] text-[var(--pex-primary)] text-[30px] leading-[1]">
          {title}
        </h2>
        <p className={privacyNoticeCls}>
          I confirm that I am duly authorised to submit the parent or
          learner-related information and that the information provided is
          accurate.
        </p>
        <div className={formStackCls}>
          <label className={fieldCls} htmlFor="enqFullName">
            <span className={fieldLabelCls}>Full name</span>
            <input
              id="enqFullName"
              name="fullName"
              placeholder="Your name"
              autoComplete="name"
              required
              className={fieldInputCls}
              {...errorAttributes(errors, "fullName")}
            />
            <FieldError id="fullName-error" message={errors.fullName} />
          </label>
          <label className={fieldCls} htmlFor="enqPhone">
            <span className={fieldLabelCls}>Phone</span>
            <input
              id="enqPhone"
              name="phone"
              type="tel"
              placeholder="078 003 6048"
              autoComplete="tel"
              required
              className={fieldInputCls}
              {...errorAttributes(errors, "phone")}
            />
            <FieldError id="phone-error" message={errors.phone} />
          </label>
          <label className={fieldCls} htmlFor="enqEmail">
            <span className={fieldLabelCls}>Email</span>
            <input
              id="enqEmail"
              name="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              className={fieldInputCls}
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
              <label className={fieldCls} htmlFor="enqPartnerBusinessName">
                <span className={fieldLabelCls}>School</span>
                <input
                  id="enqPartnerBusinessName"
                  name="businessName"
                  placeholder="School name"
                  autoComplete="organization"
                  defaultValue={initialBusinessName}
                  required
                  className={fieldInputCls}
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
              <label className={fieldCls} htmlFor="enqSchoolName">
                <span className={fieldLabelCls}>School name</span>
                <input
                  id="enqSchoolName"
                  name="schoolName"
                  placeholder="School name"
                  autoComplete="organization"
                  required
                  className={fieldInputCls}
                  {...errorAttributes(errors, "schoolName")}
                />
                <FieldError id="schoolName-error" message={errors.schoolName} />
              </label>
              <label className={fieldCls} htmlFor="enqGrade">
                <span className={fieldLabelCls}>Grade</span>
                <input
                  id="enqGrade"
                  name="grade"
                  placeholder="Grade R, Grade 4..."
                  required
                  className={fieldInputCls}
                  {...errorAttributes(errors, "grade")}
                />
                <FieldError id="grade-error" message={errors.grade} />
              </label>
            </>
          ) : null}

          <label className={fieldCls} htmlFor="enqMessage">
            <span className={fieldLabelCls}>Message</span>
            <textarea
              id="enqMessage"
              name="message"
              placeholder="Tell us what you need"
              defaultValue={initialMessage}
              required
              className={fieldTextareaCls}
              {...errorAttributes(errors, "message")}
            />
            <FieldError id="message-error" message={errors.message} />
          </label>
        </div>

        <label className={consentFieldCls} htmlFor="enqConsent">
          <input
            id="enqConsent"
            name="consent"
            type="checkbox"
            required
            className={consentInputCls}
            {...errorAttributes(errors, "consent")}
          />
          <span className={consentSpanCls}>
            {consentText}{" "}
            <Link
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className={inlineTextLinkCls}
            >
              privacy policy
            </Link>
            .
          </span>
        </label>
        <FieldError id="consent-error" message={errors.consent} />

        {/* Honeypot — hidden from real users */}
        <label
          className={honeypotCls}
          aria-hidden="true"
          htmlFor="enqCompanyWebsite"
        >
          Company website
          <input
            id="enqCompanyWebsite"
            name="companyWebsite"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>

        <Button type="submit" disabled={pending}>
          {pending ? "Sending your enquiry..." : submitLabel}
        </Button>
        {status ? (
          <p
            className={
              status.success ? statusMessageCls : statusErrorCls
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
