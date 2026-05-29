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
  consent: boolean;
  onConsentChange: (consent: boolean) => void;
  errors: Record<string, string>;
  onClearError: (field: string) => void;
};

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
  consent,
  onConsentChange,
  errors,
  onClearError,
}: DetailsStepProps) {
  return (
    <div className={styles.formGrid}>
      <div className={styles.fieldGroup}>
        <label htmlFor="buyerName">Full name</label>
        <p id="buyerName-helper">
          We use this to confirm your order and payment updates.
        </p>
        <input
          id="buyerName"
          data-field="buyerName"
          name="fullName"
          autoComplete="name"
          placeholder="e.g. Sarah Dlamini"
          value={buyerName}
          aria-describedby={`buyerName-helper${errors.buyerName ? " buyerName-error" : ""}`}
          aria-invalid={Boolean(errors.buyerName)}
          onChange={(event) => {
            onBuyerNameChange(event.target.value);
            onClearError("buyerName");
          }}
        />
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
        <input
          id="buyerPhone"
          data-field="buyerPhone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="078 003 6048"
          value={buyerPhone}
          aria-describedby={`buyerPhone-helper${errors.buyerPhone ? " buyerPhone-error" : ""}`}
          aria-invalid={Boolean(errors.buyerPhone)}
          onChange={(event) => {
            onBuyerPhoneChange(event.target.value);
            onClearError("buyerPhone");
          }}
        />
        {errors.buyerPhone ? (
          <p id="buyerPhone-error" className={styles.fieldError} role="alert">
            {errors.buyerPhone}
          </p>
        ) : null}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="buyerEmail">Email address</label>
        <p id="buyerEmail-helper">Used for your order updates.</p>
        <input
          id="buyerEmail"
          data-field="buyerEmail"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={buyerEmail}
          aria-describedby={`buyerEmail-helper${errors.buyerEmail ? " buyerEmail-error" : ""}`}
          aria-invalid={Boolean(errors.buyerEmail)}
          onChange={(event) => {
            onBuyerEmailChange(event.target.value);
            onClearError("buyerEmail");
          }}
        />
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
        <input
          id="learnerName"
          data-field="learnerName"
          name="learnerName"
          autoComplete="off"
          placeholder="e.g. Leo Dlamini"
          value={learnerName}
          aria-describedby={`learnerName-helper${errors.learnerName ? " learnerName-error" : ""}`}
          aria-invalid={Boolean(errors.learnerName)}
          onChange={(event) => {
            onLearnerNameChange(event.target.value);
            onClearError("learnerName");
          }}
        />
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

      <label className={styles.consentField}>
        <input
          data-field="consent"
          name="consent"
          type="checkbox"
          checked={consent}
          aria-describedby={errors.consent ? "consent-error" : undefined}
          aria-invalid={Boolean(errors.consent)}
          onChange={(event) => {
            onConsentChange(event.target.checked);
            onClearError("consent");
          }}
        />
        <span>
          I agree that PexPacks may process my personal information to complete
          this order, send payment and order updates, and contact me about
          delivery or collection. I have read and agree to the{" "}
          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="/terms" target="_blank" rel="noopener noreferrer">
            Terms of Use
          </a>
          .
        </span>
      </label>
      {errors.consent ? (
        <p id="consent-error" className={styles.fieldError} role="alert">
          {errors.consent}
        </p>
      ) : null}
    </div>
  );
}
