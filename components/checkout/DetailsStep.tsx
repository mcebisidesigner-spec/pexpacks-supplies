"use client";

import styles from "@/app/checkout/Checkout.module.css";

type ContactMethod = "whatsapp" | "phone" | "email";

type DetailsStepProps = {
  buyerName: string;
  onBuyerNameChange: (value: string) => void;
  buyerPhone: string;
  onBuyerPhoneChange: (value: string) => void;
  buyerEmail: string;
  onBuyerEmailChange: (value: string) => void;
  learnerName: string;
  onLearnerNameChange: (value: string) => void;
  schoolName: string;
  grade: string;
  learnerNotes: string;
  onLearnerNotesChange: (value: string) => void;
  preferredContactMethod: ContactMethod;
  onPreferredContactMethodChange: (method: ContactMethod) => void;
  errors: Record<string, string>;
  onClearError: (field: string) => void;
};

// Helper validation functions for real-time indicators
function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalisePhone(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("+")) {
    return `+${trimmed.slice(1).replace(/\D/g, "")}`;
  }
  return trimmed.replace(/\D/g, "");
}

function isLikelySaPhone(value: string) {
  const normalised = normalisePhone(value);
  const digits = normalised.replace(/\D/g, "");
  return (
    (digits.startsWith("0") && digits.length === 10) ||
    (digits.startsWith("27") && digits.length === 11) ||
    (digits.startsWith("0027") && digits.length === 13)
  );
}

// Automatic phone number formatter
function formatPhoneNumber(value: string): string {
  const clean = value.replace(/\D/g, "");
  
  if (clean.startsWith("27")) {
    let formatted = "+27";
    if (clean.length > 2) {
      formatted += " " + clean.slice(2, 4);
    }
    if (clean.length > 4) {
      formatted += " " + clean.slice(4, 7);
    }
    if (clean.length > 7) {
      formatted += " " + clean.slice(7, 11);
    }
    return formatted;
  } else {
    let formatted = "";
    if (clean.length > 0) {
      formatted += clean.slice(0, 3);
    }
    if (clean.length > 3) {
      formatted += " " + clean.slice(3, 6);
    }
    if (clean.length > 6) {
      formatted += " " + clean.slice(6, 10);
    }
    return formatted;
  }
}

// Success checkmark SVG component
function SuccessCheckmark() {
  return (
    <span className={styles.fieldSuccessCheckmark} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}

export function DetailsStep({
  buyerName,
  onBuyerNameChange,
  buyerPhone,
  onBuyerPhoneChange,
  buyerEmail,
  onBuyerEmailChange,
  learnerName,
  onLearnerNameChange,
  schoolName,
  grade,
  learnerNotes,
  onLearnerNotesChange,
  preferredContactMethod,
  onPreferredContactMethodChange,
  errors,
  onClearError,
}: DetailsStepProps) {
  // Real-time validations
  const isNameValid = buyerName.trim().length >= 2;
  const isPhoneValid = isLikelySaPhone(buyerPhone);
  const isEmailValid = isValidEmail(buyerEmail);
  const isLearnerNameValid = learnerName.trim().length >= 2;

  return (
    <div className={styles.formGrid}>
      <div className={styles.fieldGroup}>
        <label htmlFor="buyerName">Full name</label>
        <p id="buyerName-helper">
          We use this to confirm your order and payment updates.
        </p>
        <div className={styles.inputWrapper}>
          <input
            id="buyerName"
            data-field="buyerName"
            name="fullName"
            autoComplete="name"
            placeholder="e.g. Sarah Dlamini"
            value={buyerName}
            className={isNameValid ? styles.validField : ""}
            aria-describedby={`buyerName-helper${errors.buyerName ? " buyerName-error" : ""}`}
            aria-invalid={Boolean(errors.buyerName)}
            onChange={(event) => {
              onBuyerNameChange(event.target.value);
              onClearError("buyerName");
            }}
          />
          {isNameValid && <SuccessCheckmark />}
        </div>
        {errors.buyerName ? (
          <p id="buyerName-error" className={styles.fieldError} role="alert">
            {errors.buyerName}
          </p>
        ) : null}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="buyerPhone">Phone number</label>
        <p id="buyerPhone-helper">
          WhatsApp or call is fastest for support.
        </p>
        <div className={styles.inputWrapper}>
          <input
            id="buyerPhone"
            data-field="buyerPhone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="e.g. 078 003 6048"
            value={buyerPhone}
            className={isPhoneValid ? styles.validField : ""}
            aria-describedby={`buyerPhone-helper${errors.buyerPhone ? " buyerPhone-error" : ""}`}
            aria-invalid={Boolean(errors.buyerPhone)}
            onChange={(event) => {
              const formatted = formatPhoneNumber(event.target.value);
              onBuyerPhoneChange(formatted);
              onClearError("buyerPhone");
            }}
          />
          {isPhoneValid && <SuccessCheckmark />}
        </div>
        {errors.buyerPhone ? (
          <p id="buyerPhone-error" className={styles.fieldError} role="alert">
            {errors.buyerPhone}
          </p>
        ) : null}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="buyerEmail">Email address</label>
        <p id="buyerEmail-helper">Used for your order updates.</p>
        <div className={styles.inputWrapper}>
          <input
            id="buyerEmail"
            data-field="buyerEmail"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={buyerEmail}
            className={isEmailValid ? styles.validField : ""}
            aria-describedby={`buyerEmail-helper${errors.buyerEmail ? " buyerEmail-error" : ""}`}
            aria-invalid={Boolean(errors.buyerEmail)}
            onChange={(event) => {
              onBuyerEmailChange(event.target.value);
              onClearError("buyerEmail");
            }}
          />
          {isEmailValid && <SuccessCheckmark />}
        </div>
        {errors.buyerEmail ? (
          <p id="buyerEmail-error" className={styles.fieldError} role="alert">
            {errors.buyerEmail}
          </p>
        ) : null}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="learnerName">Learner name</label>
        <p id="learnerName-helper">
          Helpful for labels and school handover.
        </p>
        <div className={styles.inputWrapper}>
          <input
            id="learnerName"
            data-field="learnerName"
            name="learnerName"
            autoComplete="off"
            placeholder="e.g. Leo Dlamini"
            value={learnerName}
            className={isLearnerNameValid ? styles.validField : ""}
            aria-describedby={`learnerName-helper${errors.learnerName ? " learnerName-error" : ""}`}
            aria-invalid={Boolean(errors.learnerName)}
            onChange={(event) => {
              onLearnerNameChange(event.target.value);
              onClearError("learnerName");
            }}
          />
          {isLearnerNameValid && <SuccessCheckmark />}
        </div>
        {errors.learnerName ? (
          <p id="learnerName-error" className={styles.fieldError} role="alert">
            {errors.learnerName}
          </p>
        ) : null}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="schoolName">School name</label>
        <input id="schoolName" value={schoolName} readOnly aria-readonly="true" />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="gradeName">Grade</label>
        <input id="gradeName" value={grade} readOnly aria-readonly="true" />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="learner-notes">Optional notes</label>
        <textarea
          id="learner-notes"
          value={learnerNotes}
          placeholder="Anything we should know about this learner or pack?"
          onChange={(event) => onLearnerNotesChange(event.target.value)}
        />
      </div>

      <fieldset
        className={`${styles.optionFieldset} ${styles.contactMethodGroup}`}
      >
        <legend>Preferred contact method</legend>
        <div className={styles.contactOptions}>
          {(["whatsapp", "phone", "email"] as ContactMethod[]).map((method) => (
            <label
              key={method}
              className={
                preferredContactMethod === method
                  ? styles.contactOptionSelected
                  : ""
              }
            >
              <input
                type="radio"
                name="preferredContactMethod"
                value={method}
                checked={preferredContactMethod === method}
                onChange={() => onPreferredContactMethodChange(method)}
              />
              <span>
                {method === "whatsapp"
                  ? "WhatsApp"
                  : method === "phone"
                    ? "Phone"
                    : "Email"}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
