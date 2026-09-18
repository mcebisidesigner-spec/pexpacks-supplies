"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { isValidEmailAddress, isValidSouthAfricanPhone } from "@/lib/forms/contact";
import clsx from "clsx";
import {
  trackQuoteStepCompleted,
  trackQuoteSubmitted,
  trackQuoteSubmissionFailed,
} from "@/lib/analytics";

type OrderCategory = "Primary School Learner" | "High School Learner";

function formatPhoneSA(value: string) {
  const hasPlus = value.startsWith('+');
  const digits = value.replace(/\D/g, "");
  
  if (hasPlus && digits.startsWith("27")) {
    const rest = digits.slice(2);
    if (rest.length <= 2) return `+27 ${rest}`;
    if (rest.length <= 5) return `+27 ${rest.slice(0, 2)} ${rest.slice(2)}`;
    return `+27 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5, 9)}`;
  } else if (digits.startsWith("0")) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  }
  
  return value;
}

export function OrderForm() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState<OrderCategory | null>(null);
  
  const [inputMethod, setInputMethod] = useState<"upload" | "type">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [listText, setListText] = useState("");
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [consent, setConsent] = useState(false);

  const nextStep = () => {
    // Basic validation before moving
    if (step === 1 && !category) {
      setErrors({ category: "Please select an option" });
      return;
    }
    if (step === 2) {
      if (inputMethod === "upload" && !fileName) {
        setErrors({ list: "Please upload your list or type it out" });
        return;
      }
      if (inputMethod === "type" && !listText.trim()) {
        setErrors({ list: "Please paste or type your list" });
        return;
      }
    }
    setErrors({});
    trackQuoteStepCompleted({
      step,
      inputMethod: step === 2 ? inputMethod : undefined,
    });
    setStep((prev) => prev + 1);
  };
  
  const prevStep = () => setStep((prev) => prev - 1);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setPhone(formatPhoneSA(rawValue));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setFileName(selected.name);
      if (errors.list) setErrors((prev) => ({ ...prev, list: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!name.trim()) {
      nextErrors.name = "Please enter your name";
    }
    const cleanPhone = phone.replace(/[^0-9+]/g, "");
    if (!cleanPhone) {
      nextErrors.phone = "Please enter your WhatsApp number";
    } else if (!isValidSouthAfricanPhone(phone)) {
      nextErrors.phone = "Please enter a valid South African phone number (e.g., 072 123 4567)";
    }
    if (email.trim() && !isValidEmailAddress(email)) {
      nextErrors.email = "Please enter a valid email address (e.g., name@example.com)";
    }
    if (!consent) {
      nextErrors.consent = "You must consent to data processing under POPIA.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      trackQuoteSubmissionFailed({ failureType: "validation" });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData();
    formData.append("formType", "quote");
    formData.append("fullName", name.trim());
    formData.append("phone", phone);
    if (email.trim()) formData.append("email", email.trim());
    formData.append("consent", String(consent));
    if (category) formData.append("quoteType", category);
    formData.append("sourceUrl", window.location.href);
    formData.append("pageUrl", window.location.href);
    formData.append("userAgent", navigator.userAgent);
    formData.append("submittedAt", new Date().toISOString());

    if (inputMethod === "upload" && file) {
      formData.append("stationeryListFile", file, file.name);
      formData.append("message", `Uploaded stationery list file: ${file.name}`);
    } else {
      formData.append("message", listText.trim());
    }

    try {
      const res = await fetch("/api/forms/quote", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!result.success) {
        trackQuoteSubmissionFailed({ failureType: "api" });
        setErrors(result.errors ?? { submit: result.message || "Something went wrong." });
        return;
      }
      trackQuoteSubmitted({
        inputMethod,
        learnerPhase: category || "not_selected",
      });
      setIsSuccess(true);
    } catch {
      trackQuoteSubmissionFailed({ failureType: "network" });
      setErrors({ submit: "We could not submit your request right now. Please try again or contact us directly." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-[var(--pex-card-bg)] rounded-[var(--radius-md)] p-6 sm:p-8 border border-[var(--pex-border)] shadow-[0_4px_20px_rgba(26,42,64,0.06)] text-center flex flex-col items-center justify-center py-12">
        <div className="w-14 h-14 rounded-full bg-[rgba(33,158,154,0.1)] text-[var(--pex-keppel)] grid place-items-center text-2xl font-bold mb-4">✓</div>
        <h2 className="text-2xl font-bold text-[var(--pex-navy)] font-[family-name:var(--font-heading)] mb-2">List Received!</h2>
        <p className="text-[var(--pex-muted)] text-sm leading-relaxed max-w-md mb-6">
          Thanks {name.split(" ")[0]}! We have received your stationery list.
          <br /><br />
          Our packing team is reviewing it now and will send your custom quote to <strong className="text-[var(--pex-navy)] font-semibold">{phone}</strong> via WhatsApp within 2 hours.
        </p>
        <Button 
          variant="outline" 
          onClick={() => {
            setIsSuccess(false);
            setStep(1);
            setFile(null);
            setFileName(null);
            setListText("");
            setCategory(null);
            setName("");
            setPhone("");
            setEmail("");
            setConsent(false);
            setErrors({});
          }}
        >
          Submit another list
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[var(--pex-card-bg)] rounded-[var(--radius-md)] p-6 sm:p-8 border border-[var(--pex-border)] shadow-[0_4px_20px_rgba(26,42,64,0.06)]">
      {/* Progress Indicator */}
      <div
        className="flex gap-2 mb-8"
        role="progressbar"
        aria-label="Quote request progress"
        aria-valuemin={1}
        aria-valuemax={3}
        aria-valuenow={step}
      >
        <div className={clsx("h-1.5 flex-1 rounded-full transition-colors duration-200", step >= 1 ? "bg-[var(--pex-keppel)]" : "bg-[var(--pex-border)]")}></div>
        <div className={clsx("h-1.5 flex-1 rounded-full transition-colors duration-200", step >= 2 ? "bg-[var(--pex-keppel)]" : "bg-[var(--pex-border)]")}></div>
        <div className={clsx("h-1.5 flex-1 rounded-full transition-colors duration-200", step >= 3 ? "bg-[var(--pex-keppel)]" : "bg-[var(--pex-border)]")}></div>
      </div>

      <div className="flex flex-col gap-6">
        {/* FORM STEP 1: Who is this for? */}
        {step === 1 && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--pex-navy)] font-[family-name:var(--font-heading)] mb-4">Who are we packing for?</h2>
            <div className="flex flex-col gap-3">
              {(["Primary School Learner", "High School Learner"] as OrderCategory[]).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  className={clsx(
                    "w-full min-h-[52px] px-5 py-4 rounded-[var(--radius-sm)] border text-[var(--pex-navy)] font-semibold text-base text-left transition-all active:scale-[0.99]",
                    category === cat
                      ? "border-[var(--pex-keppel)] bg-[rgba(33,158,154,0.08)] text-[var(--pex-keppel)] shadow-sm"
                      : "border-[var(--pex-border)] bg-white hover:border-[var(--pex-keppel)] hover:bg-[rgba(33,158,154,0.04)]"
                  )}
                  onClick={() => {
                    setCategory(cat);
                    setErrors({});
                    trackQuoteStepCompleted({ step: 1 });
                    setTimeout(() => {
                      setErrors({});
                      setStep(2);
                    }, 250); // Auto-advance for friction-less feeling
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--pex-border)] text-sm">
              <Link href="/add-your-school" className="inline-flex items-center gap-2 text-[var(--pex-keppel)] hover:text-[var(--pex-primary)] font-medium transition-colors">
                <span>Would you like to add your school?</span>
                <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            {errors.category && <span className="text-xs font-semibold text-[var(--pex-coral)] mt-1.5 block">{errors.category}</span>}
          </div>
        )}

        {/* FORM STEP 2: File Upload */}
        {step === 2 && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--pex-navy)] font-[family-name:var(--font-heading)] mb-4">Share your stationery list</h2>
            <div className="flex rounded-[var(--radius-sm)] bg-[var(--pex-bg)] p-1 mb-6 border border-[var(--pex-border)]">
              <button 
                type="button"
                className={clsx("flex-1 py-2.5 px-4 text-sm font-semibold rounded-[var(--radius-sm)] transition-all", inputMethod === "upload" ? "bg-white text-[var(--pex-navy)] shadow-sm" : "text-[var(--pex-muted)]")}
                onClick={() => setInputMethod("upload")}
              >
                Upload Photo/PDF
              </button>
              <button 
                type="button"
                className={clsx("flex-1 py-2.5 px-4 text-sm font-semibold rounded-[var(--radius-sm)] transition-all", inputMethod === "type" ? "bg-white text-[var(--pex-navy)] shadow-sm" : "text-[var(--pex-muted)]")}
                onClick={() => setInputMethod("type")}
              >
                Paste / Type List
              </button>
            </div>

            {inputMethod === "upload" ? (
              fileName ? (
                <div className="flex flex-col items-center gap-3 p-6 rounded-[var(--radius-sm)] border-2 border-dashed border-[var(--pex-keppel)] bg-[rgba(33,158,154,0.05)] text-center">
                  <div className="w-10 h-10 rounded-full bg-[rgba(33,158,154,0.1)] text-[var(--pex-keppel)] grid place-items-center text-xl font-bold">✓</div>
                  <strong className="text-sm text-[var(--pex-navy)]">{fileName}</strong>
                  <button 
                    type="button" 
                    onClick={() => {
                      setFile(null);
                      setFileName(null);
                    }}
                    className="text-xs text-[var(--pex-coral)] hover:underline font-medium"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div 
                  className={clsx(
                    "flex flex-col items-center justify-center p-8 rounded-[var(--radius-sm)] border-2 border-dashed cursor-pointer text-center relative transition-all min-h-[180px]",
                    isDragging
                      ? "border-[var(--pex-keppel)] bg-[rgba(33,158,154,0.08)]"
                      : "border-[var(--pex-border)] hover:border-[var(--pex-keppel)] bg-[var(--pex-bg)] hover:bg-[rgba(33,158,154,0.02)]"
                  )}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      const selected = e.dataTransfer.files[0];
                      setFile(selected);
                      setFileName(selected.name);
                      if (errors.list) setErrors({});
                    }
                  }}
                >
                  <div className="text-3xl mb-2">📄</div>
                  <strong className="text-sm text-[var(--pex-navy)] mb-1">Click to upload or drag and drop</strong>
                  <span className="text-xs text-[var(--pex-muted)] max-w-xs">All file types supported (PNG, JPG, PDF, Word, Excel, etc. Max 10MB)</span>
                  <input 
                    id="stationery-list-file"
                    name="stationeryListFile"
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                    onChange={handleFileChange}
                  />
                </div>
              )
            ) : (
              <textarea
                id="stationery-list-text"
                name="stationeryListText"
                className={clsx(
                  "w-full min-h-[120px] px-4 py-2.5 rounded-[var(--radius-sm)] border bg-white text-[var(--pex-navy)] text-sm outline-none focus:border-[var(--pex-keppel)] focus:ring-2 focus:ring-[rgba(33,158,154,0.2)] transition-all",
                  errors.list ? "border-[var(--pex-coral)] focus:border-[var(--pex-coral)]" : "border-[var(--pex-border)]"
                )}
                placeholder="Paste your items here (e.g. 5x HB Pencils, 2x Pritt 43g...)"
                rows={4}
                value={listText}
                onChange={(e) => {
                  setListText(e.target.value);
                  if (errors.list) setErrors({});
                }}
              />
            )}
            {errors.list && <span className="text-xs font-semibold text-[var(--pex-coral)] mt-1.5 block">{errors.list}</span>}

            <div className="flex items-center justify-between gap-4 mt-8 pt-4 border-t border-[var(--pex-border)]">
              <button type="button" onClick={prevStep} className="text-sm font-semibold text-[var(--pex-muted)] hover:text-[var(--pex-navy)] transition-colors py-2 px-3">← Back</button>
              <Button 
                onClick={nextStep} 
                disabled={inputMethod === "upload" ? !fileName : !listText.trim()}
                variant="primary"
                size="md"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* FORM STEP 3: Contact Details */}
        {step === 3 && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--pex-navy)] font-[family-name:var(--font-heading)] mb-4">Where should we send your quote?</h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {errors.submit && (
                <div role="alert" className="p-3 rounded-[var(--radius-sm)] bg-[rgba(235,94,85,0.1)] border border-[rgba(235,94,85,0.3)] text-[var(--pex-coral)] text-sm font-medium">
                  {errors.submit}
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="quote-name" className="text-xs font-semibold text-[var(--pex-navy)]">Your Name</label>
                <input
                  id="quote-name"
                  type="text"
                  autoComplete="name"
                  required
                  className={clsx(
                    "w-full min-h-[46px] px-4 py-2.5 rounded-[var(--radius-sm)] border bg-white text-[var(--pex-navy)] text-sm outline-none focus:border-[var(--pex-keppel)] focus:ring-2 focus:ring-[rgba(33,158,154,0.2)] transition-all",
                    errors.name ? "border-[var(--pex-coral)] focus:border-[var(--pex-coral)]" : "border-[var(--pex-border)]"
                  )}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "quote-name-error" : undefined}
                />
                {errors.name && <span id="quote-name-error" className="text-xs font-semibold text-[var(--pex-coral)] mt-1.5 block">{errors.name}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="quote-phone" className="text-xs font-semibold text-[var(--pex-navy)]">WhatsApp Number</label>
                <input
                  id="quote-phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  className={clsx(
                    "w-full min-h-[46px] px-4 py-2.5 rounded-[var(--radius-sm)] border bg-white text-[var(--pex-navy)] text-sm outline-none focus:border-[var(--pex-keppel)] focus:ring-2 focus:ring-[rgba(33,158,154,0.2)] transition-all",
                    errors.phone ? "border-[var(--pex-coral)] focus:border-[var(--pex-coral)]" : "border-[var(--pex-border)]"
                  )}
                  placeholder="e.g. 078 123 4567"
                  value={phone}
                  onChange={handlePhoneChange}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "quote-phone-error" : undefined}
                />
                {errors.phone && <span id="quote-phone-error" className="text-xs font-semibold text-[var(--pex-coral)] mt-1.5 block">{errors.phone}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="quote-email" className="text-xs font-semibold text-[var(--pex-navy)]">Email Address (Optional)</label>
                <input
                  id="quote-email"
                  type="email"
                  autoComplete="email"
                  className={clsx(
                    "w-full min-h-[46px] px-4 py-2.5 rounded-[var(--radius-sm)] border bg-white text-[var(--pex-navy)] text-sm outline-none focus:border-[var(--pex-keppel)] focus:ring-2 focus:ring-[rgba(33,158,154,0.2)] transition-all",
                    errors.email ? "border-[var(--pex-coral)] focus:border-[var(--pex-coral)]" : "border-[var(--pex-border)]"
                  )}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "quote-email-error" : undefined}
                />
                {errors.email && <span id="quote-email-error" className="text-xs font-semibold text-[var(--pex-coral)] mt-1.5 block">{errors.email}</span>}
              </div>

              <div className="flex items-start gap-2.5 mt-2">
                <input 
                  id="quote-consent" 
                  type="checkbox" 
                  checked={consent} 
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (errors.consent) setErrors((prev) => ({ ...prev, consent: "" }));
                  }}
                  aria-invalid={!!errors.consent}
                  aria-describedby={errors.consent ? "quote-consent-error" : undefined}
                  className="mt-1"
                />
                <label htmlFor="quote-consent" className="text-xs text-[var(--pex-muted)] leading-relaxed cursor-pointer select-none">
                  I consent to Pexpacks processing my information to handle this request under POPIA guidelines.
                </label>
              </div>
              {errors.consent && <span id="quote-consent-error" className="text-xs font-semibold text-[var(--pex-coral)] mt-1 ml-6 block">{errors.consent}</span>}

              <div className="flex items-center justify-between gap-4 mt-8 pt-4 border-t border-[var(--pex-border)]">
                <button type="button" onClick={prevStep} className="text-sm font-semibold text-[var(--pex-muted)] hover:text-[var(--pex-navy)] transition-colors py-2 px-3">← Back</button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Submit for Quote"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
