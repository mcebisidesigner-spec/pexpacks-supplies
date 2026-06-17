"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { splitContactInput, isValidEmailAddress, isValidSouthAfricanPhone } from "@/lib/forms/contact";
import styles from "@/components/marketing/MarketingForms.module.css";

type ApiResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
};

function val(data: FormData, key: string) {
  const v = data.get(key);
  return typeof v === "string" ? v : "";
}

export function AddSchoolForm() {
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<ApiResponse | null>(null);
  const [consent, setConsent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const contact = val(fd, "contact").trim();

    if (!isValidEmailAddress(contact) && !isValidSouthAfricanPhone(contact)) {
      setStatus({
        success: false,
        message: "Please enter a valid South African phone number (e.g., 072 123 4567) or email address (e.g., name@example.com).",
      });
      return;
    }

    setPending(true);
    setStatus(null);
    const contactParts = splitContactInput(contact);

    const payload = {
      formType: "contact" as const,
      fullName: val(fd, "school"), // Use school name as the primary identifier
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
    <form className={styles.formGrid} onSubmit={handleSubmit}>
      <label className={styles.field} htmlFor="addSchoolSchool">
        <span>School name</span>
        <input
          id="addSchoolSchool"
          name="school"
          type="text"
          placeholder="e.g. Parktown Primary"
          required
          aria-invalid={status && !status.success ? "true" : "false"}
          aria-describedby={status && !status.success ? "add-school-status-message" : undefined}
        />
      </label>
      <label className={styles.field} htmlFor="addSchoolCity">
        <span>City or area</span>
        <input
          id="addSchoolCity"
          name="city"
          type="text"
          placeholder="e.g. Johannesburg"
          required
          aria-invalid={status && !status.success ? "true" : "false"}
          aria-describedby={status && !status.success ? "add-school-status-message" : undefined}
        />
      </label>
      <label className={styles.field} htmlFor="addSchoolContact">
        <span>Phone or email</span>
        <input
          id="addSchoolContact"
          name="contact"
          type="text"
          placeholder="078 003 6048 or name@example.com"
          required
          aria-invalid={status && !status.success ? "true" : "false"}
          aria-describedby={status && !status.success ? "add-school-status-message" : undefined}
        />
      </label>
      <label className={styles.field} htmlFor="addSchoolProvince">
        <span>Province</span>
        <input
          id="addSchoolProvince"
          name="province"
          type="text"
          placeholder="e.g. Gauteng"
          required
          aria-invalid={status && !status.success ? "true" : "false"}
          aria-describedby={status && !status.success ? "add-school-status-message" : undefined}
        />
      </label>
      <label className={styles.field} htmlFor="addSchoolGrade">
        <span>Grade needed</span>
        <input 
          id="addSchoolGrade" 
          name="grade" 
          type="text" 
          placeholder="e.g. Grade R" 
          required 
          aria-invalid={status && !status.success ? "true" : "false"}
          aria-describedby={status && !status.success ? "add-school-status-message" : undefined}
        />
      </label>
      <label className={[styles.field, styles.formWide].join(" ")} htmlFor="addSchoolNotes">
        <span>Stationery list notes</span>
        <textarea
          id="addSchoolNotes"
          name="notes"
          placeholder="Tell us what grade lists, books or special pack requirements you have."
          aria-invalid={status && !status.success ? "true" : "false"}
          aria-describedby={status && !status.success ? "add-school-status-message" : undefined}
        />
      </label>
      {/* Honeypot */}
      <label className={styles.honeypot} aria-hidden="true" htmlFor="addSchoolCompanyWebsite">
        Company website
        <input id="addSchoolCompanyWebsite" name="companyWebsite" tabIndex={-1} autoComplete="off" />
      </label>
      <label className={[styles.consentField, styles.formWide].join(" ")} htmlFor="addSchoolConsent">
        <input 
          id="addSchoolConsent" 
          type="checkbox" 
          checked={consent} 
          onChange={(e) => setConsent(e.target.checked)} 
          required 
          aria-invalid={status && !status.success ? "true" : "false"}
          aria-describedby={status && !status.success ? "add-school-status-message" : undefined}
        />
        <span>
          I consent to Pexpacks processing my information to handle this request. I have read and agree to the{" "}
          <a href="/legal" target="_blank" rel="noopener noreferrer">privacy policy</a>.
        </span>
      </label>
      <div className={styles.formWide}>
        <Button type="submit" disabled={pending || !consent}>
          {pending ? "Submitting..." : "Submit School Details"}
        </Button>
      </div>
      {status ? (
        <p
          id="add-school-status-message"
          className={status.success ? styles.statusMessage : styles.statusError}
          role={status.success ? "status" : "alert"}
          aria-live="polite"
        >
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
