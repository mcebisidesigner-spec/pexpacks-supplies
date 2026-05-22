import Link from "next/link";
import styles from "./Order.module.css";

type DetailsStepProps = {
  buyerName: string;
  setBuyerName: (value: string) => void;
  buyerPhone: string;
  setBuyerPhone: (value: string) => void;
  buyerEmail: string;
  setBuyerEmail: (value: string) => void;
  learnerName: string;
  setLearnerName: (value: string) => void;
  preferredContactMethod: string;
  setPreferredContactMethod: (value: string) => void;
  consent: boolean;
  setConsent: (value: boolean) => void;
  errors: Record<string, string>;
  clearFieldError: (field: string) => void;
};

export function DetailsStep({
  buyerName,
  setBuyerName,
  buyerPhone,
  setBuyerPhone,
  buyerEmail,
  setBuyerEmail,
  learnerName,
  setLearnerName,
  preferredContactMethod,
  setPreferredContactMethod,
  consent,
  setConsent,
  errors,
  clearFieldError,
}: DetailsStepProps) {
  return (
    <div className={styles.formGrid}>
      <div className={styles.fieldGroup}>
        <label htmlFor="buyer-name">Full name</label>
        <p id="buyer-name-helper">
          We use this to confirm your order.
        </p>
        <input
          id="buyer-name"
          name="fullName"
          autoComplete="name"
          placeholder="e.g. Sarah Dlamini"
          value={buyerName}
          aria-describedby={`buyer-name-helper${errors.buyerName ? " buyer-name-error" : ""}`}
          aria-invalid={Boolean(errors.buyerName)}
          onChange={(event) => {
            setBuyerName(event.target.value);
            clearFieldError("buyerName");
          }}
        />
        {errors.buyerName ? (
          <p id="buyer-name-error" className={styles.fieldError}>
            {errors.buyerName}
          </p>
        ) : null}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="buyer-phone">Phone number</label>
        <p id="buyer-phone-helper">
          WhatsApp or call is fastest for order confirmation.
        </p>
        <input
          id="buyer-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="078 003 6048"
          value={buyerPhone}
          aria-describedby={`buyer-phone-helper${errors.buyerPhone ? " buyer-phone-error" : ""}`}
          aria-invalid={Boolean(errors.buyerPhone)}
          onChange={(event) => {
            setBuyerPhone(event.target.value);
            clearFieldError("buyerPhone");
          }}
        />
        {errors.buyerPhone ? (
          <p id="buyer-phone-error" className={styles.fieldError}>
            {errors.buyerPhone}
          </p>
        ) : null}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="buyer-email">Email address</label>
        <p id="buyer-email-helper">
          Used for order updates and payment or invoice details.
        </p>
        <input
          id="buyer-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={buyerEmail}
          aria-describedby={`buyer-email-helper${errors.buyerEmail ? " buyer-email-error" : ""}`}
          aria-invalid={Boolean(errors.buyerEmail)}
          onChange={(event) => {
            setBuyerEmail(event.target.value);
            clearFieldError("buyerEmail");
          }}
        />
        {errors.buyerEmail ? (
          <p id="buyer-email-error" className={styles.fieldError}>
            {errors.buyerEmail}
          </p>
        ) : null}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="learner-name">Learner name optional</label>
        <p id="learner-name-helper">
          Helpful for labelling or school handover.
        </p>
        <input
          id="learner-name"
          name="learnerName"
          autoComplete="off"
          placeholder="e.g. Leo Dlamini"
          value={learnerName}
          aria-describedby="learner-name-helper"
          onChange={(event) => setLearnerName(event.target.value)}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="preferred-contact">Preferred contact method</label>
        <select
          id="preferred-contact"
          name="preferredContactMethod"
          value={preferredContactMethod}
          onChange={(event) =>
            setPreferredContactMethod(event.target.value)
          }
        >
          <option value="whatsapp">WhatsApp</option>
          <option value="phone">Phone</option>
          <option value="email">Email</option>
        </select>
      </div>

      <label className={styles.consentField}>
        <input
          name="consent"
          type="checkbox"
          checked={consent}
          aria-describedby={errors.consent ? "consent-error" : undefined}
          aria-invalid={Boolean(errors.consent)}
          onChange={(event) => {
            setConsent(event.target.checked);
            clearFieldError("consent");
          }}
        />
        <span>
          I agree that Pexpacks may use my information to process this
          order and contact me about it.{" "}
          <Link href="/privacy-policy">Privacy policy</Link>
        </span>
      </label>
      {errors.consent ? (
        <p id="consent-error" className={styles.fieldError}>
          {errors.consent}
        </p>
      ) : null}
      <p style={{ fontSize: "12px", color: "var(--pex-text-muted)", lineHeight: 1.45, marginTop: "8px" }}>
        I confirm that I am duly authorised to submit the parent or learner-related information and that the information provided is accurate.
      </p>
    </div>
  );
}
