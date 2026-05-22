"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { splitContactInput } from "@/lib/forms/contact";
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    setPending(true);
    setStatus(null);
    const contact = val(fd, "contact");
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
      consent: true,
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
      <label className={styles.field}>
        <span>School name</span>
        <input
          name="school"
          type="text"
          placeholder="e.g. Parktown Primary"
          required
        />
      </label>
      <label className={styles.field}>
        <span>City or area</span>
        <input
          name="city"
          type="text"
          placeholder="e.g. Johannesburg"
          required
        />
      </label>
      <label className={styles.field}>
        <span>Phone or email</span>
        <input
          name="contact"
          type="text"
          placeholder="078 003 6048 or name@example.com"
          required
        />
      </label>
      <label className={styles.field}>
        <span>Province</span>
        <input
          name="province"
          type="text"
          placeholder="e.g. Gauteng"
          required
        />
      </label>
      <label className={styles.field}>
        <span>Grade needed</span>
        <input name="grade" type="text" placeholder="e.g. Grade R" required />
      </label>
      <label className={[styles.field, styles.formWide].join(" ")}>
        <span>Stationery list notes</span>
        <textarea
          name="notes"
          placeholder="Tell us what grade lists, books or special pack requirements you have."
        />
      </label>
      {/* Honeypot */}
      <label className={styles.honeypot} aria-hidden="true">
        Company website
        <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
      </label>
      <div className={styles.formWide}>
        <Button type="submit" disabled={pending}>
          {pending ? "Submitting..." : "Submit School Details"}
        </Button>
      </div>
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
  );
}
