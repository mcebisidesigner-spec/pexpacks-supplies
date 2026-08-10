"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { isValidEmailAddress, isValidSouthAfricanPhone } from "@/lib/forms/contact";
import clsx from "clsx";
import styles from "./OrderPage.module.css";

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
        setErrors(result.errors ?? { submit: result.message || "Something went wrong." });
        return;
      }
      setIsSuccess(true);
    } catch {
      setErrors({ submit: "We could not submit your request right now. Please try again or contact us directly." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={clsx(styles.formCard, styles.successState)}>
        <div className={styles.successIcon}>✓</div>
        <h2>List Received!</h2>
        <p>
          Thanks {name.split(" ")[0]}! We have received your stationery list.
          <br /><br />
          Our packing team is reviewing it now and will send your custom quote to <strong>{phone}</strong> via WhatsApp within 2 hours.
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
          style={{ marginTop: "32px" }}
        >
          Submit another list
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.formCard}>
      {/* Progress Indicator */}
      <div className={styles.progressBar}>
        <div className={clsx(styles.progressStep, step >= 1 && styles.active)}></div>
        <div className={clsx(styles.progressStep, step >= 2 && styles.active)}></div>
        <div className={clsx(styles.progressStep, step >= 3 && styles.active)}></div>
      </div>

      <div className={styles.stepContainer}>
        {/* FORM STEP 1: Who is this for? */}
        {step === 1 && (
          <div className={styles.animateFadeIn}>
            <h2 className={styles.stepTitle}>Who are we packing for?</h2>
            <div className={styles.verticalOptions}>
              {(["Primary School Learner", "High School Learner"] as OrderCategory[]).map((cat) => (
                <button
                  key={cat}
                  className={clsx(styles.verticalOptionBtn, category === cat && styles.selected)}
                  onClick={() => {
                    setCategory(cat);
                    setErrors({});
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

            <div className={styles.addSchoolContainer}>
              <Link href="/add-your-school" className={styles.addSchoolLink}>
                <span>Would you like to add your school?</span>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            {errors.category && <span className={styles.errorText}>{errors.category}</span>}
          </div>
        )}

        {/* FORM STEP 2: File Upload */}
        {step === 2 && (
          <div className={styles.animateFadeIn}>
            <h2 className={styles.stepTitle}>Share your stationery list</h2>
            <div className={styles.tabs}>
              <button 
                type="button"
                className={clsx(styles.tab, inputMethod === "upload" && styles.active)}
                onClick={() => setInputMethod("upload")}
              >
                Upload Photo/PDF
              </button>
              <button 
                type="button"
                className={clsx(styles.tab, inputMethod === "type" && styles.active)}
                onClick={() => setInputMethod("type")}
              >
                Paste / Type List
              </button>
            </div>

            {inputMethod === "upload" ? (
              fileName ? (
                <div className={styles.successArea}>
                  <div className={styles.successIcon} style={{ width: 32, height: 32, fontSize: 16 }}>✓</div>
                  <strong>{fileName}</strong>
                  <button 
                    type="button" 
                    onClick={() => {
                      setFile(null);
                      setFileName(null);
                    }}
                    style={{ display: "block", margin: "8px auto 0", background: "none", border: "none", color: "var(--pex-coral)", textDecoration: "underline", cursor: "pointer" }}
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div 
                  className={clsx(styles.uploadArea, isDragging && styles.dragging)}
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
                  <div className={styles.uploadIcon}>📄</div>
                  <strong>Click to upload or drag and drop</strong>
                  <span>All file types supported (PNG, JPG, PDF, Word, Excel, etc. Max 10MB)</span>
                  <input 
                    id="stationery-list-file"
                    name="stationeryListFile"
                    type="file" 
                    className={styles.fileInput} 
                    onChange={handleFileChange}
                  />
                </div>
              )
            ) : (
              <textarea
                id="stationery-list-text"
                name="stationeryListText"
                className={clsx(styles.input, errors.list && styles.inputError)}
                placeholder="Paste your items here (e.g. 5x HB Pencils, 2x Pritt 43g...)"
                rows={4}
                value={listText}
                onChange={(e) => {
                  setListText(e.target.value);
                  if (errors.list) setErrors({});
                }}
              />
            )}
            {errors.list && <span className={styles.errorText}>{errors.list}</span>}

            <div className={styles.formActions}>
              <button onClick={prevStep} className={styles.backBtn}>← Back</button>
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
          <div className={styles.animateFadeIn}>
            <h2 className={styles.stepTitle}>Where should we send your quote?</h2>
            
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              {errors.submit && (
                <div style={{ gridColumn: "1 / -1", color: "var(--pex-error)", background: "var(--color-error-bg)", border: "1px solid var(--color-error-border)", padding: "14px 16px", borderRadius: "14px", fontSize: "14px", fontWeight: 500 }}>
                  {errors.submit}
                </div>
              )}
              <div className={styles.field}>
                <label htmlFor="quote-name">Your Name</label>
                <input
                  id="quote-name"
                  type="text"
                  required
                  className={clsx(styles.input, errors.name && styles.inputError)}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "quote-name-error" : undefined}
                />
                {errors.name && <span id="quote-name-error" className={styles.errorText}>{errors.name}</span>}
              </div>

              <div className={styles.field}>
                <label htmlFor="quote-phone">WhatsApp Number</label>
                <input
                  id="quote-phone"
                  type="tel"
                  required
                  className={clsx(styles.input, errors.phone && styles.inputError)}
                  placeholder="e.g. 078 123 4567"
                  value={phone}
                  onChange={handlePhoneChange}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "quote-phone-error" : undefined}
                />
                {errors.phone && <span id="quote-phone-error" className={styles.errorText}>{errors.phone}</span>}
              </div>

              <div className={styles.field}>
                <label htmlFor="quote-email">Email Address (Optional)</label>
                <input
                  id="quote-email"
                  type="email"
                  className={clsx(styles.input, errors.email && styles.inputError)}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "quote-email-error" : undefined}
                />
                {errors.email && <span id="quote-email-error" className={styles.errorText}>{errors.email}</span>}
              </div>

              <div className={styles.field} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 }}>
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
                />
                <label htmlFor="quote-consent" style={{ fontSize: 13, color: "var(--pex-text-muted)", cursor: "pointer" }}>
                  I consent to Pexpacks processing my information to handle this request under POPIA guidelines.
                </label>
              </div>
              {errors.consent && <span id="quote-consent-error" className={styles.errorText} style={{ display: "block", marginTop: -8 }}>{errors.consent}</span>}

              <div className={styles.formActions}>
                <button type="button" onClick={prevStep} className={styles.backBtn}>← Back</button>
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
