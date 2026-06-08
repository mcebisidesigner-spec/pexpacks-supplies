"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { isValidEmailAddress, isValidSouthAfricanPhone } from "@/lib/forms/contact";
import styles from "./OfficeUploadPage.module.css";

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

export function OfficeUploadForm() {
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [contactMethod, setContactMethod] = useState("whatsapp");
  
  const [inputMethod, setInputMethod] = useState<"upload" | "type">("upload");
  const [fileName, setFileName] = useState<string | null>(null);
  const [listText, setListText] = useState("");
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const nextStep = () => {
    if (step === 1) {
      if (inputMethod === "upload" && !fileName) {
        setErrors({ list: "Please upload your requisition list file or choose to type it out" });
        return;
      }
      if (inputMethod === "type" && !listText.trim()) {
        setErrors({ list: "Please paste or type your requisition list" });
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
    if (errors.form) setErrors((prev) => ({ ...prev, form: "" }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
      if (errors.list) setErrors((prev) => ({ ...prev, list: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientErrors: Record<string, string> = {};

    if (!businessName.trim()) {
      clientErrors.businessName = "Business name is required.";
    }
    if (!fullName.trim()) {
      clientErrors.fullName = "Contact name is required.";
    }
    if (!phone.trim()) {
      clientErrors.phone = "WhatsApp number is required.";
    } else if (!isValidSouthAfricanPhone(phone)) {
      clientErrors.phone = "Please enter a valid South African phone number.";
    }
    if (email.trim() && !isValidEmailAddress(email)) {
      clientErrors.email = "Please enter a valid email address.";
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setIsSubmitting(true);
    // Simulate API call to process the B2B file submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("B2B Requisition Submitted", {
      businessName,
      fullName,
      phone,
      email,
      contactMethod,
      inputMethod,
      listText,
      fileName,
    });
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className={`${styles.formCard} ${styles.successState}`}>
        <div className={styles.successIcon}>✓</div>
        <h2>Requisition Received!</h2>
        <p>
          Thank you, <strong>{fullName.split(" ")[0]}</strong>! We have received your monthly requisition list for <strong>{businessName}</strong>.
          <br /><br />
          Our corporate accounts team will review your list and send a payable invoice quote directly to your <strong>{contactMethod === "email" ? "email" : "WhatsApp"} ({contactMethod === "email" ? email : phone})</strong> shortly.
        </p>
        <Button 
          variant="primary"
          onClick={() => {
            setIsSuccess(false);
            setStep(1);
            setFileName(null);
            setListText("");
            setBusinessName("");
            setFullName("");
            setPhone("");
            setEmail("");
            setContactMethod("whatsapp");
          }}
          style={{ marginTop: "32px" }}
        >
          Upload another list
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.formCard}>
      {/* Progress Indicator */}
      <div className={styles.progressBar}>
        <div className={`${styles.progressStep} ${step >= 1 ? styles.active : ""}`}></div>
        <div className={`${styles.progressStep} ${step >= 2 ? styles.active : ""}`}></div>
      </div>

      <div className={styles.stepContainer}>
        {/* FORM STEP 1: Upload Files */}
        {step === 1 && (
          <div className={styles.animateFadeIn}>
            <h2 className={styles.stepTitle}>Share your monthly requisition</h2>
            <div className={styles.tabs}>
              <button 
                type="button"
                className={`${styles.tab} ${inputMethod === "upload" ? styles.active : ""}`}
                onClick={() => setInputMethod("upload")}
              >
                Upload List / Photo
              </button>
              <button 
                type="button"
                className={`${styles.tab} ${inputMethod === "type" ? styles.active : ""}`}
                onClick={() => setInputMethod("type")}
              >
                Paste Requisition List
              </button>
            </div>

            {inputMethod === "upload" ? (
              fileName ? (
                <div className={styles.successArea}>
                  <div className={styles.successIcon} style={{ width: 32, height: 32, fontSize: 16 }}>✓</div>
                  <strong>{fileName}</strong>
                  <button 
                    type="button" 
                    onClick={() => setFileName(null)}
                    style={{ display: "block", margin: "8px auto 0", background: "none", border: "none", color: "var(--pex-keppel)", textDecoration: "underline", cursor: "pointer", fontWeight: 700 }}
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div 
                  className={`${styles.uploadArea} ${isDragging ? styles.dragging : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setFileName(e.dataTransfer.files[0].name);
                      if (errors.list) setErrors({});
                    }
                  }}
                >
                  <div className={styles.uploadIcon}>📁</div>
                  <strong>Click to upload or drag and drop</strong>
                  <span>PDF, Excel, Word, Image, TXT, CSV (Max. 10MB)</span>
                  <input 
                    type="file" 
                    className={styles.fileInput} 
                    onChange={handleFileChange}
                    accept="image/*, application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/plain, text/csv"
                  />
                </div>
              )
            ) : (
              <textarea
                className={`${styles.input} ${errors.list ? styles.inputError : ""}`}
                placeholder="Paste requisition items here (e.g. 5x Reams paper, 3x Black Ink Cartridges, 2x Pack of Assorted Pens...)"
                rows={6}
                value={listText}
                onChange={(e) => {
                  setListText(e.target.value);
                  if (errors.list) setErrors({});
                }}
              />
            )}
            {errors.list && <span className={styles.errorText}>{errors.list}</span>}

            <div className={styles.formActions} style={{ justifyContent: "flex-end" }}>
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

        {/* FORM STEP 2: Company Details */}
        {step === 2 && (
          <div className={styles.animateFadeIn}>
            <h2 className={styles.stepTitle}>Company & contact details</h2>
            
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div className={styles.field}>
                <label htmlFor="b2b-company">Company / Business Name</label>
                <input
                  id="b2b-company"
                  type="text"
                  required
                  className={`${styles.input} ${errors.businessName ? styles.inputError : ""}`}
                  value={businessName}
                  onChange={(e) => {
                    setBusinessName(e.target.value);
                    if (errors.businessName) setErrors((prev) => ({ ...prev, businessName: "" }));
                  }}
                />
                {errors.businessName && <span className={styles.errorText}>{errors.businessName}</span>}
              </div>

              <div className={styles.field}>
                <label htmlFor="b2b-name">Contact Person Name</label>
                <input
                  id="b2b-name"
                  type="text"
                  required
                  className={`${styles.input} ${errors.fullName ? styles.inputError : ""}`}
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
                  }}
                />
                {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
              </div>

              <div className={styles.field}>
                <label htmlFor="b2b-phone">WhatsApp Number</label>
                <input
                  id="b2b-phone"
                  type="tel"
                  required
                  className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
                  placeholder="e.g. 078 123 4567"
                  value={phone}
                  onChange={handlePhoneChange}
                />
                {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
              </div>

              <div className={styles.field}>
                <label htmlFor="b2b-email">Email Address (Optional)</label>
                <input
                  id="b2b-email"
                  type="email"
                  className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                  placeholder="name@company.co.za"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                />
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>

              <Select
                name="preferredContactMethod"
                label="Preferred contact method"
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value)}
                options={[
                  { value: "whatsapp", label: "WhatsApp" },
                  { value: "email", label: "Email" },
                  { value: "phone", label: "Phone Call" },
                ]}
              />

              <div className={styles.formActions}>
                <button type="button" onClick={prevStep} className={styles.backBtn}>← Back</button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Submit Requisition"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
