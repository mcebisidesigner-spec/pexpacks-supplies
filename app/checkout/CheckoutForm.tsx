"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatCurrency";
import { PEXCOVER_PRICE } from "@/lib/constants";
import styles from "./Checkout.module.css";

function isValidEmail(value: string) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isLikelySaPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return (
    (digits.startsWith("0") && digits.length === 10) ||
    (digits.startsWith("27") && digits.length === 11) ||
    (digits.startsWith("0027") && digits.length === 13)
  );
}

type CheckoutFormProps = {
  schoolSlug: string;
  schoolName: string;
  grade: string;
  gradeSlug: string;
  price: number;
  contents: string[];
  deliveryNote: string;
};

type FulfilmentOption = "School collection" | "Home delivery" | "Arrange collection";

const STEPS = ["Review Pack", "Customer Details", "Delivery or Collection", "Confirm Order", "Pay Securely"];

const FULFILMENT_OPTIONS: { value: FulfilmentOption; title: string; text: string; meta: string; icon: string }[] = [
  { value: "School collection", title: "School Collection", text: "Collect from your school or agreed handover point.", meta: "Best for official school pack handovers.", icon: "school" },
  { value: "Home delivery", title: "Home Delivery", text: "Receive your stationery pack at home.", meta: "Delivery fee may apply after confirmation.", icon: "home" },
  { value: "Arrange collection", title: "Arrange Collection", text: "We will contact you to confirm the best pickup option.", meta: "Useful when school collection is not available.", icon: "pin" },
];

function deliveryIcon(type: string) {
  if (type === "home") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="m3 11 9-7 9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M10 20v-6h4v6" />
      </svg>
    );
  }
  if (type === "pin") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11Z" />
        <path d="M12 10.5h.01" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 20V8l8-4 8 4v12" />
      <path d="M8 20v-7h8v7" />
      <path d="M10 8h4" />
    </svg>
  );
}

function ReviewBlock({ title, children, onEdit }: { title: string; children: React.ReactNode; onEdit?: () => void }) {
  return (
    <section className={styles.reviewBlock}>
      <div>
        <p>{title}</p>
        {children}
      </div>
      {onEdit ? (
        <button type="button" onClick={onEdit}>Edit</button>
      ) : null}
    </section>
  );
}

function CheckoutProgress({ steps, activeStep }: { steps: string[]; activeStep: number }) {
  const currentStep = steps[activeStep] ?? steps[0];
  const progressValue = ((activeStep + 1) / steps.length) * 100;

  return (
    <>
      <ol className={styles.progress} aria-label="Checkout progress">
        {steps.map((step, index) => {
          const isComplete = index < activeStep;
          const isCurrent = index === activeStep;
          return (
            <li
              key={step}
              className={[isComplete ? styles.progressActive : "", isCurrent ? styles.progressCurrent : ""].filter(Boolean).join(" ")}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span>{isComplete ? "✓" : index + 1}</span>
              {step}
            </li>
          );
        })}
      </ol>
      <div className={styles.mobileProgress} role="group" aria-label={`Step ${activeStep + 1} of ${steps.length}: ${currentStep}`}>
        <span>Step {activeStep + 1} of {steps.length}</span>
        <strong>{currentStep}</strong>
        <div className={styles.mobileProgressBar} aria-hidden="true">
          <i style={{ width: `${progressValue}%` }} />
        </div>
      </div>
    </>
  );
}

export function CheckoutForm({
  schoolSlug,
  schoolName,
  grade,
  gradeSlug,
  price,
  contents,
  deliveryNote,
}: CheckoutFormProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  const [activeStep, setActiveStep] = useState(0);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [learnerName, setLearnerName] = useState("");

  const [hasPexcover, setHasPexcover] = useState(false);
  const [pexcoverName, setPexcoverName] = useState("");
  const [pexcoverSubjects, setPexcoverSubjects] = useState("");
  const [pexcoverLabelFormat, setPexcoverLabelFormat] = useState("First Name + Surname");
  const [pexcoverNotes, setPexcoverNotes] = useState("");

  const [fulfilmentOption, setFulfilmentOption] = useState<FulfilmentOption>("School collection");
  const [address, setAddress] = useState("");
  const [suburb, setSuburb] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  const [finalConfirmation, setFinalConfirmation] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const pexcoverCount = hasPexcover ? 1 : 0;
  const estimatedTotal = price + (hasPexcover ? PEXCOVER_PRICE : 0);

  function goToStep(index: number) {
    setErrors({});
    setSubmitError(null);
    setActiveStep(index);
    headingRef.current?.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearFieldError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validateStep(step: number): boolean {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!buyerName.trim() || buyerName.trim().length < 2) {
        newErrors.buyerName = "Name must be at least 2 characters.";
      }
      if (!buyerPhone.trim()) {
        newErrors.buyerPhone = "Phone number is required.";
      } else if (!isLikelySaPhone(buyerPhone.trim())) {
        newErrors.buyerPhone = "Please enter a valid SA phone number.";
      }
      if (!buyerEmail.trim()) {
        newErrors.buyerEmail = "Email address is required.";
      } else if (!isValidEmail(buyerEmail.trim())) {
        newErrors.buyerEmail = "Please enter a valid email address.";
      }
      if (!learnerName.trim() || learnerName.trim().length < 2) {
        newErrors.learnerName = "Learner name is required.";
      }
    } else if (step === 2) {
      if (fulfilmentOption === "Home delivery") {
        if (!address.trim()) newErrors.address = "Street address is required.";
        if (!suburb.trim()) newErrors.suburb = "Suburb is required.";
        if (!city.trim()) newErrors.city = "City is required.";
        if (!province.trim()) newErrors.province = "Province is required.";
      }
    } else if (step === 3) {
      if (!finalConfirmation) {
        newErrors.finalConfirmation = "Please confirm the order details are correct.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (validateStep(activeStep)) {
      goToStep(activeStep + 1);
    }
  }

  const handlePay = useCallback(async () => {
    setSubmitError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim().toLowerCase(),
          buyerPhone: buyerPhone.trim(),
          learnerName: learnerName.trim(),
          schoolSlug,
          schoolName,
          grade,
          gradeSlug,
          packType: "full",
          items: contents,
          estimatedTotal,
          deliveryMethod:
            fulfilmentOption === "School collection"
              ? "school_collection"
              : fulfilmentOption === "Home delivery"
                ? "delivery"
                : "collection_point",
          notes: deliveryNotes.trim() || undefined,
          hasPexcover,
          pexcoverName: pexcoverName.trim() || undefined,
          pexcoverSubjects: pexcoverSubjects.trim() || undefined,
          pexcoverLabelFormat: pexcoverLabelFormat.trim() || undefined,
          pexcoverNotes: pexcoverNotes.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.checkoutUrl) {
        throw new Error(
          result.error || result.errors
            ? Object.values(result.errors).join(". ")
            : "Unable to start checkout"
        );
      }

      window.location.href = result.checkoutUrl;
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Checkout failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    buyerName, buyerEmail, buyerPhone, learnerName,
    schoolSlug, schoolName, grade, gradeSlug, contents, estimatedTotal,
    fulfilmentOption, deliveryNotes,
    hasPexcover, pexcoverName, pexcoverSubjects, pexcoverLabelFormat, pexcoverNotes,
  ]);

  const customizeHref = `/schools/${schoolSlug}/${gradeSlug}?customize=1`;

  function renderReviewStep() {
    return (
      <div className={styles.reviewGrid}>
        <div className={styles.packReviewCard}>
          <div>
            <p className={styles.confirmKicker}>Your pack</p>
            <h3>{schoolName} &mdash; {grade}</h3>
            <p>Full stationery pack for {schoolName}, {grade}.</p>
          </div>
          <div className={styles.packFacts}>
            <span>Full Pack</span>
            <span>{contents.length} items</span>
            <span>{formatCurrency(price)}</span>
          </div>
          <ul className={styles.itemPreview}>
            {contents.slice(0, 8).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {contents.length > 8 ? (
            <p className={styles.moreItems}>+{contents.length - 8} more items included</p>
          ) : null}
          <Link className={styles.inlineAction} href={customizeHref}>
            Customise pack
          </Link>
        </div>

        <div className={`${styles.addonCard} ${hasPexcover ? styles.addonCardActive : ""}`}>
          <div>
            <p className={styles.confirmKicker}>Optional add-on</p>
            <h3>Pexcover book covering</h3>
            <p>
              Add covered and labelled exercise books to help the pack arrive ready for the first school day.{" "}
              <Link href="/blog/what-is-pexcover-book-covering" target="_blank" rel="noopener noreferrer" className={styles.inlineAction} style={{ display: "inline", fontSize: "inherit" }}>
                Read more
              </Link>
            </p>
            <p style={{ margin: "6px 0 0 0", fontSize: "12px", color: "var(--pex-text-muted)", lineHeight: 1.45 }}>
              Pexcover applies to exercise books included in the selected school pack.
            </p>
          </div>
          <label className={styles.addonCheckbox}>
            <input type="checkbox" checked={hasPexcover} onChange={(event) => setHasPexcover(event.target.checked)} />
            <span>Add Pexcover for {formatCurrency(PEXCOVER_PRICE)}</span>
          </label>
          {hasPexcover ? (
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label htmlFor="pexcover-name">Learner name for labels</label>
                <input id="pexcover-name" value={pexcoverName} placeholder="Optional" onChange={(event) => setPexcoverName(event.target.value)} />
              </div>
              <div className={styles.fieldGroup}>
                <label htmlFor="pexcover-format">Label format</label>
                <select id="pexcover-format" value={pexcoverLabelFormat} onChange={(event) => setPexcoverLabelFormat(event.target.value)}>
                  <option>First Name + Surname</option>
                  <option>First Name + Initial</option>
                  <option>Initials + Surname</option>
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <label htmlFor="pexcover-subjects">Subject names optional</label>
                <input id="pexcover-subjects" value={pexcoverSubjects} placeholder="English, Maths, Life Skills" onChange={(event) => setPexcoverSubjects(event.target.value)} />
              </div>
              <div className={styles.fieldGroup}>
                <label htmlFor="pexcover-notes">Special notes optional</label>
                <input id="pexcover-notes" value={pexcoverNotes} placeholder="Any covering instructions?" onChange={(event) => setPexcoverNotes(event.target.value)} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  function renderDetailsStep() {
    return (
      <div className={styles.formGrid}>
        <div className={styles.fieldGroup}>
          <label htmlFor="buyer-name">Full name</label>
          <p id="buyer-name-helper">We use this to confirm your order.</p>
          <input
            id="buyer-name" name="fullName" autoComplete="name" placeholder="e.g. Sarah Dlamini"
            value={buyerName}
            aria-describedby={`buyer-name-helper${errors.buyerName ? " buyer-name-error" : ""}`}
            aria-invalid={Boolean(errors.buyerName)}
            onChange={(event) => { setBuyerName(event.target.value); clearFieldError("buyerName"); }}
          />
          {errors.buyerName ? <p id="buyer-name-error" className={styles.fieldError} role="alert">{errors.buyerName}</p> : null}
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor="buyer-phone">Phone number</label>
          <p id="buyer-phone-helper">WhatsApp or call is fastest for order confirmation.</p>
          <input
            id="buyer-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="078 003 6048"
            value={buyerPhone}
            aria-describedby={`buyer-phone-helper${errors.buyerPhone ? " buyer-phone-error" : ""}`}
            aria-invalid={Boolean(errors.buyerPhone)}
            onChange={(event) => { setBuyerPhone(event.target.value); clearFieldError("buyerPhone"); }}
          />
          {errors.buyerPhone ? <p id="buyer-phone-error" className={styles.fieldError} role="alert">{errors.buyerPhone}</p> : null}
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor="buyer-email">Email address</label>
          <p id="buyer-email-helper">Used for order updates and payment or invoice details.</p>
          <input
            id="buyer-email" name="email" type="email" autoComplete="email" placeholder="name@example.com"
            value={buyerEmail}
            aria-describedby={`buyer-email-helper${errors.buyerEmail ? " buyer-email-error" : ""}`}
            aria-invalid={Boolean(errors.buyerEmail)}
            onChange={(event) => { setBuyerEmail(event.target.value); clearFieldError("buyerEmail"); }}
          />
          {errors.buyerEmail ? <p id="buyer-email-error" className={styles.fieldError} role="alert">{errors.buyerEmail}</p> : null}
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor="learner-name">Learner name</label>
          <p id="learner-name-helper">Helpful for labelling or school handover.</p>
          <input
            id="learner-name" name="learnerName" autoComplete="off" placeholder="e.g. Leo Dlamini"
            value={learnerName}
            aria-describedby={`learner-name-helper${errors.learnerName ? " learner-name-error" : ""}`}
            aria-invalid={Boolean(errors.learnerName)}
            onChange={(event) => { setLearnerName(event.target.value); clearFieldError("learnerName"); }}
          />
          {errors.learnerName ? <p id="learner-name-error" className={styles.fieldError} role="alert">{errors.learnerName}</p> : null}
        </div>
      </div>
    );
  }

  function renderFulfilmentStep() {
    return (
      <div className={styles.fulfilmentStep}>
        <fieldset className={styles.optionFieldset}>
          <legend>Preferred handover option</legend>
          <div className={styles.deliveryOptions}>
            {FULFILMENT_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`${styles.deliveryOption} ${fulfilmentOption === option.value ? styles.deliveryOptionSelected : ""}`}
              >
                <input
                  type="radio" name="deliveryMethod" value={option.value}
                  checked={fulfilmentOption === option.value}
                  onChange={() => { setFulfilmentOption(option.value); clearFieldError("address"); clearFieldError("suburb"); clearFieldError("city"); clearFieldError("province"); }}
                />
                <span className={styles.deliveryIcon}>{deliveryIcon(option.icon)}</span>
                <span>
                  <strong>{option.title}</strong>
                  <small>{option.text}</small>
                  <em>{option.meta}</em>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {fulfilmentOption === "Home delivery" ? (
          <>
            <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "var(--pex-text-muted)", lineHeight: 1.5 }}>
              Home delivery incurs an additional delivery fee based on your location. Please read our{" "}
              <Link href="/delivery-policy" target="_blank" rel="noopener noreferrer" className={styles.inlineAction} style={{ display: "inline", fontSize: "inherit" }}>
                Delivery Policy
              </Link>{" "}
              for more details on pricing and schedules.
            </p>
            <div className={styles.formGrid}>
              {[
                { id: "delivery-address", label: "Street address", value: address, setter: setAddress, error: errors.address, autoComplete: "address-line1" },
                { id: "delivery-suburb", label: "Suburb", value: suburb, setter: setSuburb, error: errors.suburb, autoComplete: "address-level3" },
                { id: "delivery-city", label: "City", value: city, setter: setCity, error: errors.city, autoComplete: "address-level2" },
                { id: "delivery-province", label: "Province", value: province, setter: setProvince, error: errors.province, autoComplete: "address-level1" },
              ].map((field) => (
                <div className={styles.fieldGroup} key={field.id}>
                  <label htmlFor={field.id}>{field.label}</label>
                  <input
                    id={field.id} value={field.value} autoComplete={field.autoComplete}
                    aria-invalid={Boolean(field.error)}
                    aria-describedby={field.error ? `${field.id}-error` : undefined}
                    onChange={(event) => { field.setter(event.target.value); clearFieldError(field.id.replace("delivery-", "") as keyof typeof errors); }}
                  />
                  {field.error ? <p id={`${field.id}-error`} className={styles.fieldError} role="alert">{field.error}</p> : null}
                </div>
              ))}
            </div>
          </>
        ) : null}

        <div className={styles.fieldGroup}>
          <label htmlFor="delivery-notes">Delivery or collection notes optional</label>
          <textarea
            id="delivery-notes" value={deliveryNotes} placeholder="Gate code, preferred pickup time, or anything the team should know"
            onChange={(event) => setDeliveryNotes(event.target.value)}
          />
        </div>
      </div>
    );
  }

  function renderConfirmStep() {
    return (
      <div className={styles.confirmGrid}>
        <ReviewBlock title="Pack" onEdit={() => goToStep(0)}>
          <strong>{schoolName} &mdash; {grade}</strong>
          <span>Full Pack · {contents.length} items{hasPexcover ? " · Pexcover: 1 child" : ""}</span>
        </ReviewBlock>
        <ReviewBlock title="Customer" onEdit={() => goToStep(1)}>
          <strong>{buyerName || "Name required"}</strong>
          <span>{buyerPhone || "Phone required"} · {buyerEmail || "Email required"}</span>
        </ReviewBlock>
        <ReviewBlock title="Delivery / Collection" onEdit={() => goToStep(2)}>
          <strong>{fulfilmentOption}</strong>
          <span>
            {fulfilmentOption === "Home delivery"
              ? [address, suburb, city, province].filter(Boolean).join(", ") || "Address required"
              : "Pexpacks will confirm the handover details."}
          </span>
        </ReviewBlock>
        {hasPexcover ? (
          <ReviewBlock title="Pexcover book covering">
            <strong>1 child</strong>
            <span>{formatCurrency(PEXCOVER_PRICE)} total</span>
          </ReviewBlock>
        ) : null}
        <ReviewBlock title="Estimated total">
          <strong>{formatCurrency(estimatedTotal)}</strong>
          <span>Final amount charged via Paystack.</span>
        </ReviewBlock>
        <label className={`${styles.consentField} ${styles.finalConsent}`}>
          <input
            name="finalConfirmation" type="checkbox" checked={finalConfirmation}
            aria-describedby={errors.finalConfirmation ? "final-confirmation-error" : undefined}
            aria-invalid={Boolean(errors.finalConfirmation)}
            onChange={(event) => { setFinalConfirmation(event.target.checked); clearFieldError("finalConfirmation"); }}
          />
          <span>
            I confirm the order details are correct and agree to the{" "}
            <Link href="/terms" target="_blank" rel="noopener noreferrer">Terms</Link>,{" "}
            <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>,{" "}
            <Link href="/delivery-policy" target="_blank" rel="noopener noreferrer">Delivery Policy</Link>, and{" "}
            <Link href="/returns-refunds-policy" target="_blank" rel="noopener noreferrer">Returns & Refunds Policy</Link>.
          </span>
        </label>
        {errors.finalConfirmation ? (
          <p id="final-confirmation-error" className={styles.fieldError} role="alert">{errors.finalConfirmation}</p>
        ) : null}
      </div>
    );
  }

  function renderPayStep() {
    return (
      <div className={styles.payStep}>
        <div>
          <p className={styles.confirmKicker}>Payment</p>
          <h3>Complete payment via Paystack</h3>
          <p>You will be redirected to Paystack to complete payment securely. Your order will be processed immediately after successful payment.</p>
        </div>
        <ul className={styles.trustList}>
          <li>Secure checkout via Paystack</li>
          <li>Pay with card, EFT, or mobile money</li>
          <li>Instant order confirmation after payment</li>
        </ul>
        {submitError ? (
          <p className={styles.formStatusError} role="alert">{submitError}</p>
        ) : null}
        <div className={styles.payButtonWrapper}>
          <button
            type="button"
            className={styles.payButton}
            onClick={handlePay}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className={styles.payButtonSpinner} />
                Processing...
              </>
            ) : (
              `Pay ${formatCurrency(estimatedTotal)} Securely`
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutShell}>
      <div className={styles.checkoutGrid}>
        <div className={styles.mainColumn}>
          <CheckoutProgress steps={STEPS} activeStep={activeStep} />

          {activeStep === 0 ? (
            <div className={styles.stepCard}>
              <div className={styles.stepIntro}>
                <p className={styles.stepEyebrow}>Step 1 of 5</p>
                <h2 ref={headingRef} tabIndex={-1}>Review Pack</h2>
                <p>Check school, grade and selected items.</p>
              </div>
              {renderReviewStep()}
            </div>
          ) : null}

          {activeStep === 1 ? (
            <div className={styles.stepCard}>
              <div className={styles.stepIntro}>
                <p className={styles.stepEyebrow}>Step 2 of 5</p>
                <h2 ref={headingRef} tabIndex={-1}>Customer Details</h2>
                <p>Tell us who to contact about this order.</p>
              </div>
              {renderDetailsStep()}
            </div>
          ) : null}

          {activeStep === 2 ? (
            <div className={styles.stepCard}>
              <div className={styles.stepIntro}>
                <p className={styles.stepEyebrow}>Step 3 of 5</p>
                <h2 ref={headingRef} tabIndex={-1}>Delivery or Collection</h2>
                <p>Choose how you would like to receive the pack.</p>
              </div>
              {renderFulfilmentStep()}
            </div>
          ) : null}

          {activeStep === 3 ? (
            <div className={styles.stepCard}>
              <div className={styles.stepIntro}>
                <p className={styles.stepEyebrow}>Step 4 of 5</p>
                <h2 ref={headingRef} tabIndex={-1}>Confirm Order</h2>
                <p>Review everything before paying.</p>
              </div>
              {renderConfirmStep()}
            </div>
          ) : null}

          {activeStep === 4 ? (
            <div className={styles.stepCard}>
              <div className={styles.stepIntro}>
                <p className={styles.stepEyebrow}>Step 5 of 5</p>
                <h2 ref={headingRef} tabIndex={-1}>Pay Securely</h2>
                <p>Complete your payment via Paystack.</p>
              </div>
              {renderPayStep()}
            </div>
          ) : null}

          <div className={styles.formActions}>
            <button type="button" onClick={() => goToStep(activeStep - 1)} disabled={activeStep === 0}>
              Back
            </button>
            {activeStep < 4 ? (
              <Button type="button" onClick={handleNext}>
                {activeStep === 0 ? "Continue" : activeStep === 3 ? "Review & Confirm" : "Continue"}
              </Button>
            ) : null}
          </div>
        </div>

        <CheckoutOrderSummary
          packName={`${schoolName} — ${grade}`}
          schoolName={schoolName}
          gradeName={grade}
          packKind="Full Pack"
          itemCount={contents.length}
          estimatedTotal={estimatedTotal}
          fulfilmentOption={fulfilmentOption}
          hasPexcover={hasPexcover}
          pexcoverCount={pexcoverCount}
        />
      </div>

      {activeStep < 4 ? (
        <div className={styles.mobileStickyCta}>
          <Button type="button" onClick={handleNext}>
            {activeStep === 0 ? "Continue" : activeStep === 3 ? "Review & Confirm" : "Continue"}
          </Button>
        </div>
      ) : (
        <div className={styles.mobileStickyCta}>
          <button
            type="button"
            className={styles.payButton}
            onClick={handlePay}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className={styles.payButtonSpinner} />
                Processing...
              </>
            ) : (
              `Pay ${formatCurrency(estimatedTotal)} Securely`
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function CheckoutOrderSummary({
  packName,
  schoolName,
  gradeName,
  packKind,
  itemCount,
  estimatedTotal,
  fulfilmentOption,
  hasPexcover,
  pexcoverCount,
}: {
  packName: string;
  schoolName?: string;
  gradeName?: string;
  packKind: string;
  itemCount: number;
  estimatedTotal?: number;
  fulfilmentOption: string;
  hasPexcover?: boolean;
  pexcoverCount?: number;
}) {
  const [summaryOpen, setSummaryOpen] = useState(false);

  return (
    <aside className={styles.summaryColumn} aria-label="Order summary">
      <button
        type="button"
        className={styles.summaryToggle}
        aria-expanded={summaryOpen}
        onClick={() => setSummaryOpen(!summaryOpen)}
      >
        <span>
          {schoolName && gradeName
            ? `${gradeName} · ${itemCount || "Confirming"} items · ${typeof estimatedTotal === "number" ? formatCurrency(estimatedTotal) : "Total TBC"}`
            : "Select your school"}
        </span>
        <strong>{summaryOpen ? "Hide" : "View summary"}</strong>
      </button>
      <div className={`${styles.summaryCard} ${summaryOpen ? styles.summaryCardOpen : ""}`}>
        <p className={styles.confirmKicker}>Your pack</p>
        <h2>{packName}</h2>
        <div className={styles.summaryMeta}>
          <span>{schoolName ?? "School"}</span>
          <span>{gradeName ?? "Grade"}</span>
          <span>{packKind}</span>
        </div>
        <dl className={styles.priceSummary}>
          <div>
            <dt>Selected items</dt>
            <dd>{itemCount || "Confirming"}</dd>
          </div>
          <div>
            <dt>Delivery / collection</dt>
            <dd>{fulfilmentOption}</dd>
          </div>
          {pexcoverCount && pexcoverCount > 0 ? (
            <div>
              <dt>Pexcover ({pexcoverCount} {pexcoverCount === 1 ? "child" : "children"})</dt>
              <dd>{formatCurrency(pexcoverCount * PEXCOVER_PRICE)}</dd>
            </div>
          ) : null}
          <div>
            <dt>Estimated total</dt>
            <dd>{typeof estimatedTotal === "number" ? formatCurrency(estimatedTotal) : "To be confirmed"}</dd>
          </div>
        </dl>
        <p className={styles.summaryNote}>
          Final amount charged via Paystack. No payment is taken on this page yet.
        </p>
        <ul className={styles.trustList}>
          <li>Packed according to the school list</li>
          <li>Secure checkout via Paystack</li>
          <li>Instant order confirmation</li>
        </ul>
      </div>
    </aside>
  );
}
