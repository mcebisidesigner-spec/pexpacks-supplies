"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  splitContactInput,
  isValidEmailAddress,
  isValidSouthAfricanPhone,
} from "@/lib/forms/contact";

type ApiResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
};

function val(data: FormData, key: string) {
  const v = data.get(key);
  return typeof v === "string" ? v : "";
}

// ── Shared form utility strings ───────────────────────────────────────────────
const fieldCls = "min-w-0 grid gap-[var(--form-field-gap)]";
const fieldLabelCls =
  "text-[var(--form-label-color)] text-[var(--form-label-size)] font-[var(--form-label-weight)] leading-[1.25]";
const fieldInputCls =
  "min-w-0 w-full min-h-[var(--form-control-height)] border-[length:0] [border:var(--form-control-border)] rounded-[var(--form-control-radius)] px-[var(--form-control-padding-x)] py-0 bg-[var(--form-control-bg)] text-[var(--form-control-color)] text-[15px] transition-[var(--interactive-transition)] placeholder:text-[var(--form-control-placeholder)] placeholder:opacity-100 hover:border-[var(--form-control-hover-border)] focus-visible:outline-none focus-visible:border-[var(--form-control-focus-border)] focus-visible:[box-shadow:var(--form-control-focus-shadow)]";
const fieldTextareaCls =
  "min-w-0 w-full min-h-[118px] [border:var(--form-control-border)] rounded-[var(--form-control-radius)] px-[var(--form-control-padding-x)] py-[var(--form-control-padding-y)] bg-[var(--form-control-bg)] text-[var(--form-control-color)] text-[15px] resize-y transition-[var(--interactive-transition)] placeholder:text-[var(--form-control-placeholder)] placeholder:opacity-100 hover:border-[var(--form-control-hover-border)] focus-visible:outline-none focus-visible:border-[var(--form-control-focus-border)] focus-visible:[box-shadow:var(--form-control-focus-shadow)]";
const fieldErrorCls =
  "text-[var(--form-error-color)] text-[var(--form-error-size)] font-[var(--form-error-weight)] leading-[1.3]";
const formWideCls = "col-span-full";
const honeypotCls = "absolute left-[-10000px] w-px h-px overflow-hidden";
const consentFieldCls =
  "grid grid-cols-[20px_1fr] gap-[var(--space-3)] items-start";
const consentSpanCls =
  "text-[var(--pex-primary)] text-[var(--text-sm)] leading-[1.45] [&_a]:text-[var(--pex-keppel)] [&_a]:font-extrabold [&_a]:underline [&_a]:[text-underline-offset:3px]";
const consentInputCls =
  "w-[20px] h-[20px] mt-[2px] accent-[var(--pex-keppel)]";
const statusMessageCls =
  "mt-[4px] rounded-[var(--radius-md)] px-[14px] py-[var(--space-3)] bg-[rgba(47,133,90,0.12)] text-[var(--pex-success)] font-extrabold";
const statusErrorCls =
  "mt-[4px] rounded-[var(--radius-md)] px-[14px] py-[var(--space-3)] bg-[rgba(185,28,28,0.1)] text-[var(--pex-error)] font-extrabold";

export function AddSchoolForm() {
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<ApiResponse | null>(null);
  const [consent, setConsent] = useState(false);
  const fieldErrors = status && !status.success ? status.errors ?? {} : {};

  function fieldError(...keys: string[]) {
    return keys.map((key) => fieldErrors[key]).find(Boolean);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const contact = val(fd, "contact").trim();

    if (!isValidEmailAddress(contact) && !isValidSouthAfricanPhone(contact)) {
      setStatus({
        success: false,
        message:
          "Please enter a valid South African phone number (e.g., 072 123 4567) or email address (e.g., name@example.com).",
        errors: {
          contact:
            "Enter a valid South African phone number or email address.",
        },
      });
      return;
    }

    setPending(true);
    setStatus(null);
    const contactParts = splitContactInput(contact);

    const payload = {
      formType: "contact" as const,
      fullName: val(fd, "school"),
      ...contactParts,
      contactDetail: contact,
      schoolName: val(fd, "school"),
      city: val(fd, "city"),
      province: val(fd, "province"),
      grade: val(fd, "grade"),
      message: val(fd, "notes") || "School addition request",
      packType: "add-school",
      consent,
      sourceUrl: window.location.href,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      submittedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/forms/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await res.json()) as ApiResponse;
      setStatus(result);
      if (result.success) {
        form.reset();
        setConsent(false);
      }
    } catch {
      setStatus({
        success: false,
        message:
          "We could not submit your request right now. Please try again or contact us directly.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      className="grid grid-cols-2 gap-[14px] max-lg:grid-cols-1"
      onSubmit={handleSubmit}
      onInput={() => {
        if (status && !pending) setStatus(null);
      }}
    >
      <label className={fieldCls} htmlFor="addSchoolSchool">
        <span className={fieldLabelCls}>School name</span>
        <input
          id="addSchoolSchool"
          name="school"
          type="text"
          placeholder="e.g. Parktown Primary"
          required
          className={fieldInputCls}
          aria-invalid={Boolean(fieldError("schoolName", "school"))}
          aria-describedby={
            fieldError("schoolName", "school")
              ? "add-school-school-error"
              : undefined
          }
        />
        {fieldError("schoolName", "school") ? (
          <span id="add-school-school-error" className={fieldErrorCls}>
            {fieldError("schoolName", "school")}
          </span>
        ) : null}
      </label>

      <label className={fieldCls} htmlFor="addSchoolCity">
        <span className={fieldLabelCls}>City or area</span>
        <input
          id="addSchoolCity"
          name="city"
          type="text"
          placeholder="e.g. Johannesburg"
          required
          className={fieldInputCls}
          aria-invalid={Boolean(fieldError("city"))}
          aria-describedby={
            fieldError("city") ? "add-school-city-error" : undefined
          }
        />
        {fieldError("city") ? (
          <span id="add-school-city-error" className={fieldErrorCls}>
            {fieldError("city")}
          </span>
        ) : null}
      </label>

      <label className={fieldCls} htmlFor="addSchoolContact">
        <span className={fieldLabelCls}>Phone or email</span>
        <input
          id="addSchoolContact"
          name="contact"
          type="text"
          placeholder="078 003 6048 or name@example.com"
          required
          className={fieldInputCls}
          aria-invalid={Boolean(fieldError("contact", "phone", "email"))}
          aria-describedby={
            fieldError("contact", "phone", "email")
              ? "add-school-contact-error"
              : undefined
          }
        />
        {fieldError("contact", "phone", "email") ? (
          <span id="add-school-contact-error" className={fieldErrorCls}>
            {fieldError("contact", "phone", "email")}
          </span>
        ) : null}
      </label>

      <label className={fieldCls} htmlFor="addSchoolProvince">
        <span className={fieldLabelCls}>Province</span>
        <input
          id="addSchoolProvince"
          name="province"
          type="text"
          placeholder="e.g. Gauteng"
          required
          className={fieldInputCls}
          aria-invalid={Boolean(fieldError("province"))}
          aria-describedby={
            fieldError("province") ? "add-school-province-error" : undefined
          }
        />
        {fieldError("province") ? (
          <span id="add-school-province-error" className={fieldErrorCls}>
            {fieldError("province")}
          </span>
        ) : null}
      </label>

      <label className={fieldCls} htmlFor="addSchoolGrade">
        <span className={fieldLabelCls}>Grade needed</span>
        <input
          id="addSchoolGrade"
          name="grade"
          type="text"
          placeholder="e.g. Grade R"
          required
          className={fieldInputCls}
          aria-invalid={Boolean(fieldError("grade"))}
          aria-describedby={
            fieldError("grade") ? "add-school-grade-error" : undefined
          }
        />
        {fieldError("grade") ? (
          <span id="add-school-grade-error" className={fieldErrorCls}>
            {fieldError("grade")}
          </span>
        ) : null}
      </label>

      <label className={`${fieldCls} ${formWideCls}`} htmlFor="addSchoolNotes">
        <span className={fieldLabelCls}>Stationery list notes</span>
        <textarea
          id="addSchoolNotes"
          name="notes"
          placeholder="Tell us what grade lists, books or special pack requirements you have."
          className={fieldTextareaCls}
        />
      </label>

      {/* Honeypot — hidden from real users */}
      <label className={honeypotCls} aria-hidden="true" htmlFor="addSchoolCompanyWebsite">
        Company website
        <input
          id="addSchoolCompanyWebsite"
          name="companyWebsite"
          tabIndex={-1}
          autoComplete="off"
        />
      </label>

      <label
        className={`${consentFieldCls} ${formWideCls}`}
        htmlFor="addSchoolConsent"
      >
        <input
          id="addSchoolConsent"
          type="checkbox"
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked);
            if (status && !pending) setStatus(null);
          }}
          required
          className={consentInputCls}
          aria-invalid={Boolean(fieldError("consent"))}
          aria-describedby={
            fieldError("consent") ? "add-school-consent-error" : undefined
          }
        />
        <span className={consentSpanCls}>
          I consent to Pexpacks processing my information to handle this
          request. I have read and agree to the{" "}
          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
            privacy policy
          </a>
          .
        </span>
      </label>

      {fieldError("consent") ? (
        <span
          id="add-school-consent-error"
          className={`${fieldErrorCls} ${formWideCls}`}
        >
          {fieldError("consent")}
        </span>
      ) : null}

      <div className={formWideCls}>
        <Button type="submit" disabled={pending || !consent}>
          {pending ? "Submitting..." : "Submit School Details"}
        </Button>
      </div>

      {status ? (
        <p
          id="add-school-status-message"
          className={status.success ? statusMessageCls : statusErrorCls}
          role={status.success ? "status" : "alert"}
          aria-live="polite"
        >
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
