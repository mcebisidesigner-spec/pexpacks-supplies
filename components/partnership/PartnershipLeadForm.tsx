"use client";

import React, { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  SCHOOL_ROLES,
  SCHOOL_TYPES,
  PREFERRED_CONTACT_METHODS,
  type CalculatorPrefill,
} from "./types";
import { formatZAR } from "./rebateCalculator";
import { isValidEmailAddress, isValidSouthAfricanPhone } from "@/lib/forms/contact";
import { CheckCircle2, X } from "lucide-react";
import styles from "./Partnership.module.css";

interface PartnershipLeadFormProps {
  initialPrefill?: CalculatorPrefill | null;
  onClearPrefill?: () => void;
}

export function PartnershipLeadForm({
  initialPrefill,
  onClearPrefill,
}: PartnershipLeadFormProps) {
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const validationErrors: Record<string, string> = {};

    const schoolName = (fd.get("schoolName") as string || "").trim();
    if (!schoolName) {
      validationErrors.schoolName = "School name is required.";
    }

    const fullName = (fd.get("fullName") as string || "").trim();
    if (!fullName) {
      validationErrors.fullName = "Contact person name is required.";
    }

    const role = (fd.get("role") as string || "").trim();
    if (!role) {
      validationErrors.role = "Please select your role or capacity at the school.";
    }

    const email = (fd.get("email") as string || "").trim();
    if (!email) {
      validationErrors.email = "Work email address is required.";
    } else if (!isValidEmailAddress(email)) {
      validationErrors.email = "Please enter a valid email address (e.g. principal@school.co.za).";
    }

    const phone = (fd.get("phone") as string || "").trim();
    if (!phone) {
      validationErrors.phone = "Contact phone number is required.";
    } else if (!isValidSouthAfricanPhone(phone)) {
      validationErrors.phone = "Please enter a valid South African phone number (e.g. 011 456 7890).";
    }

    const consent = fd.get("consent");
    if (!consent) {
      validationErrors.consent = "You must acknowledge data processing to submit an institutional enquiry.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setPending(true);
    setServerError(null);
    setErrors({});

    const payload = {
      formType: "school-partnership",
      schoolName,
      fullName,
      role,
      email,
      phone,
      schoolType: (fd.get("schoolType") as string || "").trim() || undefined,
      learnerCount: (fd.get("learnerCount") as string || "").trim() || undefined,
      preferredContactMethod: (fd.get("preferredContactMethod") as string || "").trim() || undefined,
      enquiryIntent: initialPrefill ? "Calculator Projection Review" : "SGB Briefing Request",
      estimatedRebate: initialPrefill ? formatZAR(initialPrefill.estimatedRebate) : undefined,
      adoptionRate: initialPrefill ? `${initialPrefill.adoptionRate}%` : undefined,
      message: (fd.get("message") as string || "").trim() || undefined,
      consent: true,
      sourceUrl: typeof window !== "undefined" ? window.location.href : "/partnership",
      submittedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/forms/school-partnership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        setServerError(result.message || "We could not process your enquiry right now. Please try again.");
        if (result.errors) setErrors(result.errors);
        return;
      }

      setSuccess(true);
      form.reset();
      if (onClearPrefill) onClearPrefill();
    } catch {
      setServerError("A network error occurred. Please check your connection or contact our team directly.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className={styles.section} id="partnership-enquiry" aria-labelledby="enquiry-form-title">
      <div className={styles.container}>
        <div className={styles.formSectionWrap}>
          <div className={styles.formCard}>
            <div className={styles.formIntro}>
              <p className={styles.eyebrow}>Institutional consultation</p>
              <h2 id="enquiry-form-title" className={styles.sectionTitle} style={{ fontSize: "clamp(26px, 3.5vw, 36px)" }}>
                Explore a Pexpacks Partnership for Your School.
              </h2>
              <p className={styles.sectionLead} style={{ marginBottom: 0 }}>
                Tell us a little about your institution and an executive member of our
                partnership team will arrange a brief, consultative discussion.
              </p>
            </div>

            {initialPrefill && (
              <div className={styles.calcContextBanner}>
                <span>
                  <strong>Calculator Context Attached:</strong> ~{initialPrefill.learnerCount} learners at{" "}
                  {initialPrefill.adoptionRate}% adoption (~{formatZAR(initialPrefill.estimatedRebate)} estimated annual rebate).
                </span>
                {onClearPrefill && (
                  <button
                    type="button"
                    onClick={onClearPrefill}
                    className={styles.calcContextDismiss}
                    aria-label="Remove calculator context"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}

            {success ? (
              <div className={styles.formSuccessNotice} role="status">
                <CheckCircle2 size={48} style={{ color: "var(--pex-keppel)" }} />
                <h3 className={styles.formSuccessTitle}>Institutional Enquiry Received</h3>
                <p style={{ margin: 0, fontSize: "15px", color: "var(--pex-muted)", maxWidth: 500, lineHeight: 1.6 }}>
                  Thank you for reaching out. A dedicated Pexpacks institutional manager has been assigned
                  to your school profile and will contact you via your preferred communication method to schedule
                  the briefing.
                </p>
                <div style={{ marginTop: 12 }}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSuccess(false)}
                  >
                    Submit Another Enquiry
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {serverError && (
                  <div
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: 10,
                      padding: "12px 16px",
                      color: "#b91c1c",
                      fontSize: 14,
                      marginBottom: 20,
                    }}
                    role="alert"
                  >
                    {serverError}
                  </div>
                )}

                <div className={styles.formGrid}>
                  {/* School Name */}
                  <div className={styles.formField}>
                    <label htmlFor="p-school-name" className={styles.formLabel}>
                      <span>School Name <span className={styles.formRequired}>*</span></span>
                    </label>
                    <input
                      id="p-school-name"
                      name="schoolName"
                      type="text"
                      placeholder="e.g. St. Stithians College or Bryanston High"
                      required
                      className={styles.formInput}
                      aria-invalid={Boolean(errors.schoolName)}
                    />
                    {errors.schoolName && <span className={styles.formError}>{errors.schoolName}</span>}
                  </div>

                  {/* School Type */}
                  <div className={styles.formField}>
                    <label htmlFor="p-school-type" className={styles.formLabel}>
                      <span>School Type</span>
                    </label>
                    <select id="p-school-type" name="schoolType" className={styles.formSelect}>
                      <option value="">Select school type (optional)</option>
                      {SCHOOL_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Contact Name */}
                  <div className={styles.formField}>
                    <label htmlFor="p-full-name" className={styles.formLabel}>
                      <span>Contact Person Name <span className={styles.formRequired}>*</span></span>
                    </label>
                    <input
                      id="p-full-name"
                      name="fullName"
                      type="text"
                      placeholder="e.g. Dr. Jennifer Adams"
                      required
                      autoComplete="name"
                      className={styles.formInput}
                      aria-invalid={Boolean(errors.fullName)}
                    />
                    {errors.fullName && <span className={styles.formError}>{errors.fullName}</span>}
                  </div>

                  {/* Role at School */}
                  <div className={styles.formField}>
                    <label htmlFor="p-role" className={styles.formLabel}>
                      <span>Your Role / Capacity <span className={styles.formRequired}>*</span></span>
                    </label>
                    <select
                      id="p-role"
                      name="role"
                      required
                      className={styles.formSelect}
                      aria-invalid={Boolean(errors.role)}
                    >
                      <option value="">Select your institutional capacity</option>
                      {SCHOOL_ROLES.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    {errors.role && <span className={styles.formError}>{errors.role}</span>}
                  </div>

                  {/* Work Email */}
                  <div className={styles.formField}>
                    <label htmlFor="p-email" className={styles.formLabel}>
                      <span>Official School Email <span className={styles.formRequired}>*</span></span>
                    </label>
                    <input
                      id="p-email"
                      name="email"
                      type="email"
                      placeholder="principal@yourschool.co.za"
                      required
                      autoComplete="email"
                      className={styles.formInput}
                      aria-invalid={Boolean(errors.email)}
                    />
                    {errors.email && <span className={styles.formError}>{errors.email}</span>}
                  </div>

                  {/* Contact Phone */}
                  <div className={styles.formField}>
                    <label htmlFor="p-phone" className={styles.formLabel}>
                      <span>Direct Contact Number <span className={styles.formRequired}>*</span></span>
                    </label>
                    <input
                      id="p-phone"
                      name="phone"
                      type="tel"
                      placeholder="011 456 7890 or 082 123 4567"
                      required
                      autoComplete="tel"
                      className={styles.formInput}
                      aria-invalid={Boolean(errors.phone)}
                    />
                    {errors.phone && <span className={styles.formError}>{errors.phone}</span>}
                  </div>

                  {/* Learner Count */}
                  <div className={styles.formField}>
                    <label htmlFor="p-learners" className={styles.formLabel}>
                      <span>Approximate Learner Enrollment</span>
                    </label>
                    <input
                      id="p-learners"
                      name="learnerCount"
                      type="number"
                      placeholder="e.g. 850"
                      defaultValue={initialPrefill?.learnerCount || ""}
                      className={styles.formInput}
                    />
                  </div>

                  {/* Preferred Contact Method */}
                  <div className={styles.formField}>
                    <label htmlFor="p-contact-method" className={styles.formLabel}>
                      <span>Preferred Contact Method</span>
                    </label>
                    <select id="p-contact-method" name="preferredContactMethod" className={styles.formSelect}>
                      {PREFERRED_CONTACT_METHODS.map((method) => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </div>

                  {/* Additional Notes */}
                  <div className={`${styles.formField} ${styles.formFull}`}>
                    <label htmlFor="p-message" className={styles.formLabel}>
                      <span>Additional Comments or Specific Procurement Priorities</span>
                    </label>
                    <textarea
                      id="p-message"
                      name="message"
                      placeholder="Share details on your current stationery timeline, SGB review cycle, or specific pack requirements..."
                      className={styles.formTextarea}
                    />
                  </div>

                  {/* POPIA Consent Checkbox */}
                  <div className={`${styles.formField} ${styles.formFull}`}>
                    <label
                      htmlFor="p-consent"
                      style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}
                    >
                      <input
                        id="p-consent"
                        name="consent"
                        type="checkbox"
                        required
                        style={{ marginTop: 4, accentColor: "var(--pex-keppel)" }}
                        aria-invalid={Boolean(errors.consent)}
                      />
                      <span className={styles.privacyNotice} style={{ margin: 0 }}>
                        By submitting this form, you acknowledge that Pexpacks Supplies may process the
                        information provided for the purpose of responding to your institutional enquiry,
                        in accordance with our{" "}
                        <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                          Privacy Policy
                        </Link>{" "}
                        and applicable data-protection requirements.
                      </span>
                    </label>
                    {errors.consent && <span className={styles.formError}>{errors.consent}</span>}
                  </div>
                </div>

                <div style={{ marginTop: 24 }}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={pending}
                    disabled={pending}
                  >
                    Request Partnership Briefing
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
