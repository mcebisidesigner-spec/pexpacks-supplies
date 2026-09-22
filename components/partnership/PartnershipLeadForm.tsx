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
import { useNotification } from "@/components/ui/NotificationProvider";

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
  const { notify } = useNotification();

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
        const message = result.message || "Something went wrong while sending your enquiry. Please try again.";
        setServerError(message);
        notify({ tone: "error", title: "Partnership enquiry not sent", message });
        if (result.errors) setErrors(result.errors);
        return;
      }

      setSuccess(true);
      notify({
        tone: "success",
        title: "Partnership enquiry sent",
        message: "Thanks - I have received the school details and will help with the next step.",
      });
      form.reset();
      if (onClearPrefill) onClearPrefill();
    } catch {
      const message = "Something went wrong while sending your enquiry. Please try again, or send a message if it continues.";
      setServerError(message);
      notify({ tone: "error", title: "Partnership enquiry not sent", message });
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="py-12 sm:py-20" id="partnership-enquiry" aria-labelledby="enquiry-form-title">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-[820px] mx-auto">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-[clamp(28px,5vw,48px)] shadow-[0_20px_48px_rgba(26,42,64,0.08)]">
            <div className="mb-7">
              <p className="mb-3 text-pex-keppel text-sm font-extrabold text-left">Institutional consultation</p>
              <h2 id="enquiry-form-title" className="mb-[14px] text-pex-navy font-heading font-extrabold leading-[1.05] tracking-[-0.01em] text-left text-[clamp(26px,3.5vw,36px)]">
                Explore a Pexpacks Partnership for Your School.
              </h2>
              <p className="max-w-[760px] text-slate-600 text-lg leading-[1.45] text-left mb-0">
                Tell me a little about your school and what you would like to improve. I will help you understand the partnership options.
              </p>
            </div>

            {initialPrefill && (
              <div className="bg-[rgba(26,122,119,0.08)] border border-[rgba(26,122,119,0.25)] rounded-xl p-[12px_16px] mb-5 text-[13px] text-pex-navy flex items-center justify-between gap-2.5">
                <span>
                  <strong>Calculator Context Attached:</strong> ~{initialPrefill.learnerCount} learners at{" "}
                  {initialPrefill.adoptionRate}% adoption (~{formatZAR(initialPrefill.estimatedRebate)} estimated annual rebate).
                </span>
                {onClearPrefill && (
                  <button
                    type="button"
                    onClick={onClearPrefill}
                    className="bg-transparent border-0 text-[var(--pex-muted,#64748b)] cursor-pointer p-0.5 flex"
                    aria-label="Remove calculator context"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}

            {success ? (
              <div className="bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.3)] rounded-[14px] p-6 text-pex-navy text-center flex flex-col items-center gap-3" role="status">
                <CheckCircle2 size={48} style={{ color: "var(--pex-keppel)" }} />
                <h3 className="text-xl font-extrabold text-pex-navy m-0">Partnership enquiry received</h3>
                <p style={{ margin: 0, fontSize: "15px", color: "var(--pex-muted)", maxWidth: 500, lineHeight: 1.6 }}>
                  Thanks for reaching out. I will review the details and contact you through your preferred method to discuss the next step.
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
                  {/* School Name */}
                  <div className="flex flex-col gap-[7px]">
                    <label htmlFor="p-school-name" className="text-[13.5px] font-bold text-pex-navy flex items-center justify-between">
                      <span>School Name <span className="text-red-500 ml-[3px]">*</span></span>
                    </label>
                    <input
                      id="p-school-name"
                      name="schoolName"
                      type="text"
                      placeholder="e.g. St. Stithians College or Bryanston High"
                      required
                      className="w-full h-[50px] px-3.5 rounded-xl border border-slate-200/80 bg-white text-slate-700 text-[14.5px] outline-none transition-all duration-140 box-border focus:border-[var(--pex-keppel,#1a7a77)] focus:ring-3 focus:ring-[rgba(26,122,119,0.14)]"
                      aria-invalid={Boolean(errors.schoolName)}
                    />
                    {errors.schoolName && <span className="text-xs font-semibold text-red-700">{errors.schoolName}</span>}
                  </div>

                  {/* School Type */}
                  <div className="flex flex-col gap-[7px]">
                    <label htmlFor="p-school-type" className="text-[13.5px] font-bold text-pex-navy flex items-center justify-between">
                      <span>School Type</span>
                    </label>
                    <select id="p-school-type" name="schoolType" className="w-full h-[50px] px-3.5 rounded-xl border border-slate-200/80 bg-white text-slate-700 text-[14.5px] outline-none transition-all duration-140 box-border focus:border-[var(--pex-keppel,#1a7a77)] focus:ring-3 focus:ring-[rgba(26,122,119,0.14)]">
                      <option value="">Select school type (optional)</option>
                      {SCHOOL_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Contact Name */}
                  <div className="flex flex-col gap-[7px]">
                    <label htmlFor="p-full-name" className="text-[13.5px] font-bold text-pex-navy flex items-center justify-between">
                      <span>Contact Person Name <span className="text-red-500 ml-[3px]">*</span></span>
                    </label>
                    <input
                      id="p-full-name"
                      name="fullName"
                      type="text"
                      placeholder="e.g. Dr. Jennifer Adams"
                      required
                      autoComplete="name"
                      className="w-full h-[50px] px-3.5 rounded-xl border border-slate-200/80 bg-white text-slate-700 text-[14.5px] outline-none transition-all duration-140 box-border focus:border-[var(--pex-keppel,#1a7a77)] focus:ring-3 focus:ring-[rgba(26,122,119,0.14)]"
                      aria-invalid={Boolean(errors.fullName)}
                    />
                    {errors.fullName && <span className="text-xs font-semibold text-red-700">{errors.fullName}</span>}
                  </div>

                  {/* Role at School */}
                  <div className="flex flex-col gap-[7px]">
                    <label htmlFor="p-role" className="text-[13.5px] font-bold text-pex-navy flex items-center justify-between">
                      <span>Your Role / Capacity <span className="text-red-500 ml-[3px]">*</span></span>
                    </label>
                    <select
                      id="p-role"
                      name="role"
                      required
                      className="w-full h-[50px] px-3.5 rounded-xl border border-slate-200/80 bg-white text-slate-700 text-[14.5px] outline-none transition-all duration-140 box-border focus:border-[var(--pex-keppel,#1a7a77)] focus:ring-3 focus:ring-[rgba(26,122,119,0.14)]"
                      aria-invalid={Boolean(errors.role)}
                    >
                      <option value="">Select your institutional capacity</option>
                      {SCHOOL_ROLES.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    {errors.role && <span className="text-xs font-semibold text-red-700">{errors.role}</span>}
                  </div>

                  {/* Work Email */}
                  <div className="flex flex-col gap-[7px]">
                    <label htmlFor="p-email" className="text-[13.5px] font-bold text-pex-navy flex items-center justify-between">
                      <span>Official School Email <span className="text-red-500 ml-[3px]">*</span></span>
                    </label>
                    <input
                      id="p-email"
                      name="email"
                      type="email"
                      placeholder="principal@yourschool.co.za"
                      required
                      autoComplete="email"
                      className="w-full h-[50px] px-3.5 rounded-xl border border-slate-200/80 bg-white text-slate-700 text-[14.5px] outline-none transition-all duration-140 box-border focus:border-[var(--pex-keppel,#1a7a77)] focus:ring-3 focus:ring-[rgba(26,122,119,0.14)]"
                      aria-invalid={Boolean(errors.email)}
                    />
                    {errors.email && <span className="text-xs font-semibold text-red-700">{errors.email}</span>}
                  </div>

                  {/* Contact Phone */}
                  <div className="flex flex-col gap-[7px]">
                    <label htmlFor="p-phone" className="text-[13.5px] font-bold text-pex-navy flex items-center justify-between">
                      <span>Direct Contact Number <span className="text-red-500 ml-[3px]">*</span></span>
                    </label>
                    <input
                      id="p-phone"
                      name="phone"
                      type="tel"
                      placeholder="011 456 7890 or 082 123 4567"
                      required
                      autoComplete="tel"
                      className="w-full h-[50px] px-3.5 rounded-xl border border-slate-200/80 bg-white text-slate-700 text-[14.5px] outline-none transition-all duration-140 box-border focus:border-[var(--pex-keppel,#1a7a77)] focus:ring-3 focus:ring-[rgba(26,122,119,0.14)]"
                      aria-invalid={Boolean(errors.phone)}
                    />
                    {errors.phone && <span className="text-xs font-semibold text-red-700">{errors.phone}</span>}
                  </div>

                  {/* Learner Count */}
                  <div className="flex flex-col gap-[7px]">
                    <label htmlFor="p-learners" className="text-[13.5px] font-bold text-pex-navy flex items-center justify-between">
                      <span>Approximate Learner Enrollment</span>
                    </label>
                    <input
                      id="p-learners"
                      name="learnerCount"
                      type="number"
                      placeholder="e.g. 850"
                      defaultValue={initialPrefill?.learnerCount || ""}
                      className="w-full h-[50px] px-3.5 rounded-xl border border-slate-200/80 bg-white text-slate-700 text-[14.5px] outline-none transition-all duration-140 box-border focus:border-[var(--pex-keppel,#1a7a77)] focus:ring-3 focus:ring-[rgba(26,122,119,0.14)]"
                    />
                  </div>

                  {/* Preferred Contact Method */}
                  <div className="flex flex-col gap-[7px]">
                    <label htmlFor="p-contact-method" className="text-[13.5px] font-bold text-pex-navy flex items-center justify-between">
                      <span>Preferred Contact Method</span>
                    </label>
                    <select id="p-contact-method" name="preferredContactMethod" className="w-full h-[50px] px-3.5 rounded-xl border border-slate-200/80 bg-white text-slate-700 text-[14.5px] outline-none transition-all duration-140 box-border focus:border-[var(--pex-keppel,#1a7a77)] focus:ring-3 focus:ring-[rgba(26,122,119,0.14)]">
                      {PREFERRED_CONTACT_METHODS.map((method) => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </div>

                  {/* Additional Notes */}
                  <div className="flex flex-col gap-[7px] sm:col-span-2">
                    <label htmlFor="p-message" className="text-[13.5px] font-bold text-pex-navy flex items-center justify-between">
                      <span>Additional Comments or Specific Procurement Priorities</span>
                    </label>
                    <textarea
                      id="p-message"
                      name="message"
                      placeholder="Share details on your current stationery timeline, SGB review cycle, or specific pack requirements..."
                      className="w-full h-auto min-h-[100px] p-[12px_14px] rounded-xl border border-slate-200/80 bg-white text-slate-700 text-[14.5px] outline-none resize-y transition-all duration-140 box-border focus:border-[var(--pex-keppel,#1a7a77)] focus:ring-3 focus:ring-[rgba(26,122,119,0.14)]"
                    />
                  </div>

                  {/* POPIA Consent Checkbox */}
                  <div className="flex flex-col gap-[7px] sm:col-span-2">
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
                      <span className="text-[12.5px] text-[var(--pex-muted,#64748b)] leading-[1.5] m-0">
                        By submitting this form, you acknowledge that Pexpacks Supplies may process the
                        information provided for the purpose of responding to your institutional enquiry,
                        in accordance with our{" "}
                        <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="relative inline-block font-medium text-[var(--pex-keppel)] no-underline after:absolute after:bottom-[-3px] after:left-0 after:h-[1.5px] after:w-0 after:bg-current after:transition-[width] after:duration-200 after:ease-out hover:text-[var(--pex-keppel-dark)] hover:after:w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pex-keppel)] focus-visible:ring-offset-2 motion-reduce:after:transition-none">
                          Privacy Policy
                        </Link>{" "}
                        and applicable data-protection requirements.
                      </span>
                    </label>
                    {errors.consent && <span className="text-xs font-semibold text-red-700">{errors.consent}</span>}
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
