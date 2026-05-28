"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatCurrency";
import { PEXCOVER_PRICE } from "@/lib/constants";
import { readOrderDraft } from "@/lib/checkout/draft";
import styles from "./Checkout.module.css";

type CheckoutFormProps = {
  schoolSlug: string;
  schoolName: string;
  grade: string;
  gradeSlug: string;
  price: number;
  contents: string[];
  deliveryNote: string;
  draftId?: string;
};

type CheckoutStep = "review" | "details" | "delivery" | "pay";
type FulfilmentOption = "School collection" | "Home delivery" | "Arrange collection";
type ContactMethod = "whatsapp" | "phone" | "email";

const STEPS: { id: CheckoutStep; label: string; title: string }[] = [
  { id: "review", label: "Review", title: "Review Order" },
  { id: "details", label: "Details", title: "Customer Details" },
  { id: "delivery", label: "Delivery", title: "Delivery or Collection" },
  { id: "pay", label: "Pay", title: "Confirm & Pay" },
];

const FULFILMENT_OPTIONS: { value: FulfilmentOption; title: string; text: string; meta: string; icon: "school" | "home" | "pin" }[] = [
  {
    value: "School collection",
    title: "School Collection",
    text: "Collect your pack from the school or agreed school handover point.",
    meta: "Usually best for school pack campaigns.",
    icon: "school",
  },
  {
    value: "Home delivery",
    title: "Home Delivery",
    text: "Receive your pack at your address. Delivery fee may apply.",
    meta: "Address required before payment.",
    icon: "home",
  },
  {
    value: "Arrange collection",
    title: "Arranged Collection",
    text: "We will contact you to confirm the best pickup option.",
    meta: "Useful when school collection is not available.",
    icon: "pin",
  },
];

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

function deliveryIcon(type: "school" | "home" | "pin") {
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

function CheckoutProgress({ activeStep }: { activeStep: number }) {
  const currentStep = STEPS[activeStep] ?? STEPS[0];
  const progressValue = ((activeStep + 1) / STEPS.length) * 100;

  return (
    <>
      <ol className={styles.progress} aria-label="Checkout progress">
        {STEPS.map((step, index) => {
          const isComplete = index < activeStep;
          const isCurrent = index === activeStep;
          return (
            <li
              key={step.id}
              className={[isComplete ? styles.progressActive : "", isCurrent ? styles.progressCurrent : ""].filter(Boolean).join(" ")}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span aria-hidden="true">{isComplete ? "\u2713" : index + 1}</span>
              <strong>{step.label}</strong>
              <small>{isCurrent ? "Current step" : isComplete ? "Completed" : "Upcoming"}</small>
            </li>
          );
        })}
      </ol>
      <div className={styles.mobileProgress} role="group" aria-label={`Step ${activeStep + 1} of ${STEPS.length}: ${currentStep.title}`}>
        <span>Step {activeStep + 1} of {STEPS.length}</span>
        <strong>{currentStep.title}</strong>
        <div className={styles.mobileProgressBar} aria-hidden="true">
          <i style={{ width: `${progressValue}%` }} />
        </div>
      </div>
    </>
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

export function CheckoutForm({
  schoolSlug,
  schoolName,
  grade,
  gradeSlug,
  price: defaultPrice,
  contents,
  deliveryNote,
  draftId,
}: CheckoutFormProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftTotal, setDraftTotal] = useState<number | null>(null);

  const [activeStep, setActiveStep] = useState(0);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] = useState<ContactMethod>("whatsapp");
  const [learnerName, setLearnerName] = useState("");
  const [consent, setConsent] = useState(false);

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
  const [postalCode, setPostalCode] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!draftId || draftLoaded) return;
    const draft = readOrderDraft(draftId);
    if (!draft) return;

    if (draft.estimatedTotal != null) {
      setDraftTotal(draft.estimatedTotal);
    }
    if (draft.pexcoverRequested) {
      setHasPexcover(true);
    }
    if (draft.pexcoverName) {
      setPexcoverName(draft.pexcoverName);
    }
    setDraftLoaded(true);
  }, [draftId, draftLoaded]);

  const packPrice = draftTotal ?? defaultPrice;
  const pexcoverCount = hasPexcover ? 1 : 0;
  const totalToPay = packPrice + (hasPexcover ? PEXCOVER_PRICE : 0);
  const backToPackHref = `/schools/${schoolSlug}/${gradeSlug}`;
  const currentStep = STEPS[activeStep] ?? STEPS[0];
  const itemCount = contents.length;

  const deliveryAddressSummary = useMemo(() => {
    return [address, suburb, city, province, postalCode].filter(Boolean).join(", ");
  }, [address, suburb, city, province, postalCode]);

  function focusStepHeading() {
    window.requestAnimationFrame(() => headingRef.current?.focus());
  }

  function goToStep(index: number) {
    const safeIndex = Math.max(0, Math.min(index, STEPS.length - 1));
    setErrors({});
    setSubmitError(null);
    setActiveStep(safeIndex);
    focusStepHeading();
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

  function focusFirstInvalid(nextErrors: Record<string, string>) {
    const first = Object.keys(nextErrors)[0];
    if (!first) return;
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-field="${first}"], #${first}`)?.focus();
    });
  }

  function validateStep(step: number): boolean {
    const nextErrors: Record<string, string> = {};

    if (step === 1) {
      if (!buyerName.trim() || buyerName.trim().length < 2) nextErrors.buyerName = "Please enter your full name.";
      if (!buyerPhone.trim()) nextErrors.buyerPhone = "Please enter your phone number.";
      else if (!isLikelySaPhone(buyerPhone)) nextErrors.buyerPhone = "Please enter a valid South African phone number.";
      if (!buyerEmail.trim()) nextErrors.buyerEmail = "Please enter your email address.";
      else if (!isValidEmail(buyerEmail.trim())) nextErrors.buyerEmail = "Please enter a valid email address.";
      if (!learnerName.trim() || learnerName.trim().length < 2) nextErrors.learnerName = "Please enter the learner name.";
      if (!consent) nextErrors.consent = "Please accept the order processing consent.";
    }

    if (step === 2 && fulfilmentOption === "Home delivery") {
      if (!address.trim()) nextErrors.address = "Please enter the delivery address.";
      if (!suburb.trim()) nextErrors.suburb = "Please enter the suburb.";
      if (!city.trim()) nextErrors.city = "Please enter the city.";
      if (!province.trim()) nextErrors.province = "Please enter the province.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      focusFirstInvalid(nextErrors);
      return false;
    }
    return true;
  }

  function handleNext() {
    if (validateStep(activeStep)) {
      goToStep(activeStep + 1);
    }
  }

  async function handlePay() {
    const detailsValid = validateStep(1);
    if (!detailsValid) {
      goToStep(1);
      return;
    }

    const deliveryValid = validateStep(2);
    if (!deliveryValid) {
      goToStep(2);
      return;
    }

    setSubmitError(null);
    setSubmitting(true);

    const fulfilmentNotes = [
      deliveryNotes.trim() ? `Notes: ${deliveryNotes.trim()}` : "",
      fulfilmentOption === "Home delivery" ? `Address: ${deliveryAddressSummary}` : "",
      preferredContactMethod ? `Preferred contact: ${preferredContactMethod}` : "",
      deliveryNote ? `Pack note: ${deliveryNote}` : "",
    ].filter(Boolean).join(" | ");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim().toLowerCase(),
          buyerPhone: normalisePhone(buyerPhone),
          learnerName: learnerName.trim(),
          schoolSlug,
          schoolName,
          grade,
          gradeSlug,
          packType: "full",
          items: contents,
          estimatedTotal: totalToPay,
          deliveryMethod:
            fulfilmentOption === "School collection"
              ? "school_collection"
              : fulfilmentOption === "Home delivery"
                ? "delivery"
                : "collection_point",
          notes: fulfilmentNotes || undefined,
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
            : "Unable to continue to PayFast"
        );
      }

      window.location.href = result.checkoutUrl;
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We could not continue to PayFast right now. Please try again or contact PexPacks on WhatsApp."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function renderReviewStep() {
    return (
      <div className={styles.reviewGrid}>
        <section className={styles.packReviewCard}>
          <div>
            <p className={styles.confirmKicker}>Fixed order selection</p>
            <h3>{schoolName} - {grade}</h3>
            <p>Full stationery pack for {schoolName}, {grade}. The pack is fixed at checkout so payment can be processed securely.</p>
          </div>
          <div className={styles.packFacts}>
            <span>Full Pack</span>
            <span>{itemCount} items</span>
            <span>{formatCurrency(packPrice)}</span>
          </div>
          <ul className={styles.itemPreview} aria-label="Included items preview">
            {contents.slice(0, 8).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {contents.length > 8 ? (
            <p className={styles.moreItems}>+{contents.length - 8} more items included</p>
          ) : null}
          <p className={styles.changeHint}>
            Need to change something? <Link href={backToPackHref}>Go back to the pack page</Link>.
          </p>
        </section>

        <section className={`${styles.addonCard} ${hasPexcover ? styles.addonCardActive : ""}`}>
          <div>
            <p className={styles.confirmKicker}>Optional add-on</p>
            <h3>Pexcover book covering</h3>
            <p>Add covered and labelled exercise books so the pack arrives closer to first-day ready.</p>
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
        </section>
      </div>
    );
  }

  function renderDetailsStep() {
    return (
      <div className={styles.formGrid}>
        <div className={styles.fieldGroup}>
          <label htmlFor="buyerName">Full name</label>
          <p id="buyerName-helper">We use this to confirm your order and payment updates.</p>
          <input id="buyerName" data-field="buyerName" name="fullName" autoComplete="name" placeholder="e.g. Sarah Dlamini" value={buyerName} aria-describedby={`buyerName-helper${errors.buyerName ? " buyerName-error" : ""}`} aria-invalid={Boolean(errors.buyerName)} onChange={(event) => { setBuyerName(event.target.value); clearFieldError("buyerName"); }} />
          {errors.buyerName ? <p id="buyerName-error" className={styles.fieldError} role="alert">{errors.buyerName}</p> : null}
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor="buyerPhone">Phone number</label>
          <p id="buyerPhone-helper">WhatsApp or call is fastest for support.</p>
          <input id="buyerPhone" data-field="buyerPhone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="078 003 6048" value={buyerPhone} aria-describedby={`buyerPhone-helper${errors.buyerPhone ? " buyerPhone-error" : ""}`} aria-invalid={Boolean(errors.buyerPhone)} onChange={(event) => { setBuyerPhone(event.target.value); clearFieldError("buyerPhone"); }} />
          {errors.buyerPhone ? <p id="buyerPhone-error" className={styles.fieldError} role="alert">{errors.buyerPhone}</p> : null}
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor="buyerEmail">Email address</label>
          <p id="buyerEmail-helper">Used for PayFast/order updates.</p>
          <input id="buyerEmail" data-field="buyerEmail" name="email" type="email" autoComplete="email" placeholder="name@example.com" value={buyerEmail} aria-describedby={`buyerEmail-helper${errors.buyerEmail ? " buyerEmail-error" : ""}`} aria-invalid={Boolean(errors.buyerEmail)} onChange={(event) => { setBuyerEmail(event.target.value); clearFieldError("buyerEmail"); }} />
          {errors.buyerEmail ? <p id="buyerEmail-error" className={styles.fieldError} role="alert">{errors.buyerEmail}</p> : null}
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor="learnerName">Learner name</label>
          <p id="learnerName-helper">Helpful for labels and school handover.</p>
          <input id="learnerName" data-field="learnerName" name="learnerName" autoComplete="off" placeholder="e.g. Leo Dlamini" value={learnerName} aria-describedby={`learnerName-helper${errors.learnerName ? " learnerName-error" : ""}`} aria-invalid={Boolean(errors.learnerName)} onChange={(event) => { setLearnerName(event.target.value); clearFieldError("learnerName"); }} />
          {errors.learnerName ? <p id="learnerName-error" className={styles.fieldError} role="alert">{errors.learnerName}</p> : null}
        </div>

        <fieldset className={`${styles.optionFieldset} ${styles.contactMethodGroup}`}>
          <legend>Preferred contact method</legend>
          <div className={styles.contactOptions}>
            {(["whatsapp", "phone", "email"] as ContactMethod[]).map((method) => (
              <label key={method} className={preferredContactMethod === method ? styles.contactOptionSelected : ""}>
                <input type="radio" name="preferredContactMethod" value={method} checked={preferredContactMethod === method} onChange={() => setPreferredContactMethod(method)} />
                <span>{method === "whatsapp" ? "WhatsApp" : method === "phone" ? "Phone" : "Email"}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className={styles.consentField}>
          <input data-field="consent" name="consent" type="checkbox" checked={consent} aria-describedby={errors.consent ? "consent-error" : "privacy-note"} aria-invalid={Boolean(errors.consent)} onChange={(event) => { setConsent(event.target.checked); clearFieldError("consent"); }} />
          <span>
            I agree that PexPacks may use my information to process this order, send payment updates, and contact me about delivery or collection.
            <small id="privacy-note">We only use your details to process your order and provide support.</small>
          </span>
        </label>
        {errors.consent ? <p id="consent-error" className={styles.fieldError} role="alert">{errors.consent}</p> : null}
      </div>
    );
  }

  function renderFulfilmentStep() {
    return (
      <div className={styles.fulfilmentStep}>
        <fieldset className={styles.optionFieldset}>
          <legend>Choose how you will receive your pack</legend>
          <div className={styles.deliveryOptions}>
            {FULFILMENT_OPTIONS.map((option) => (
              <label key={option.value} className={`${styles.deliveryOption} ${fulfilmentOption === option.value ? styles.deliveryOptionSelected : ""}`}>
                <input type="radio" name="deliveryMethod" value={option.value} checked={fulfilmentOption === option.value} onChange={() => { setFulfilmentOption(option.value); ["address", "suburb", "city", "province"].forEach(clearFieldError); }} />
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
          <div className={styles.addressPanel}>
            <p>
              Home delivery may include a delivery fee depending on your location. We will confirm any delivery-specific details before fulfilment.
            </p>
            <div className={styles.formGrid}>
              {[
                { id: "address", label: "Address line", value: address, setter: setAddress, error: errors.address, autoComplete: "address-line1" },
                { id: "suburb", label: "Suburb", value: suburb, setter: setSuburb, error: errors.suburb, autoComplete: "address-level3" },
                { id: "city", label: "City", value: city, setter: setCity, error: errors.city, autoComplete: "address-level2" },
                { id: "province", label: "Province", value: province, setter: setProvince, error: errors.province, autoComplete: "address-level1" },
                { id: "postalCode", label: "Postal code optional", value: postalCode, setter: setPostalCode, error: undefined, autoComplete: "postal-code" },
              ].map((field) => (
                <div className={styles.fieldGroup} key={field.id}>
                  <label htmlFor={field.id}>{field.label}</label>
                  <input id={field.id} data-field={field.id} value={field.value} autoComplete={field.autoComplete} aria-invalid={Boolean(field.error)} aria-describedby={field.error ? `${field.id}-error` : undefined} onChange={(event) => { field.setter(event.target.value); clearFieldError(field.id); }} />
                  {field.error ? <p id={`${field.id}-error`} className={styles.fieldError} role="alert">{field.error}</p> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className={styles.fieldGroup}>
          <label htmlFor="delivery-notes">Delivery or collection notes optional</label>
          <textarea id="delivery-notes" value={deliveryNotes} placeholder="Gate code, preferred pickup time, or anything our team should know" onChange={(event) => setDeliveryNotes(event.target.value)} />
        </div>
      </div>
    );
  }

  function renderPayStep() {
    return (
      <div className={styles.confirmGrid}>
        <ReviewBlock title="Pack" onEdit={() => goToStep(0)}>
          <strong>{schoolName} - {grade}</strong>
          <span>Full Pack - {itemCount} items{hasPexcover ? " - Pexcover add-on" : ""}</span>
        </ReviewBlock>
        <ReviewBlock title="Customer" onEdit={() => goToStep(1)}>
          <strong>{buyerName || "Name required"}</strong>
          <span>{buyerPhone || "Phone required"} - {buyerEmail || "Email required"}</span>
        </ReviewBlock>
        <ReviewBlock title="Delivery / Collection" onEdit={() => goToStep(2)}>
          <strong>{fulfilmentOption}</strong>
          <span>{fulfilmentOption === "Home delivery" ? deliveryAddressSummary || "Address required" : "PexPacks will confirm the handover details."}</span>
        </ReviewBlock>

        <section className={styles.paymentReadyCard}>
          <p className={styles.confirmKicker}>Secure payment</p>
          <h3>Confirm and pay securely with PayFast</h3>
          <p>Review your details before continuing to PayFast. You will be redirected to PayFast to complete payment.</p>
          <ul className={styles.trustList}>
            <li>Secure payment powered by PayFast</li>
            <li>PexPacks does not store your card details</li>
            <li>POPIA-aware order handling</li>
            <li>WhatsApp support is available if you need help</li>
          </ul>
        </section>

        {submitError ? <p className={styles.formStatusError} role="alert">{submitError}</p> : null}
        <div className={styles.payButtonWrapper}>
          <button type="button" className={styles.payButton} onClick={handlePay} disabled={submitting} aria-busy={submitting}>
            {submitting ? (
              <>
                <span className={styles.payButtonSpinner} />
                Redirecting to PayFast...
              </>
            ) : (
              `Pay ${formatCurrency(totalToPay)} securely with PayFast`
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutShell}>
      <div className={styles.checkoutHeader}>
        <Link href="/" className={styles.checkoutLogo} aria-label="PexPacks home">PexPacks</Link>
        <Link href={backToPackHref} className={styles.backLink}>Back to packs</Link>
        <a className={styles.helpLink} href="https://wa.me/27780036048" target="_blank" rel="noopener noreferrer">Need help?</a>
      </div>

      <div className={styles.checkoutGrid}>
        <div className={styles.mainColumn}>
          <CheckoutProgress activeStep={activeStep} />

          <section className={styles.stepCard} aria-labelledby="checkout-step-heading">
            <div className={styles.stepIntro}>
              <p className={styles.stepEyebrow}>Step {activeStep + 1} of {STEPS.length}</p>
              <h2 id="checkout-step-heading" ref={headingRef} tabIndex={-1}>{currentStep.title}</h2>
              <p>
                {activeStep === 0 ? "Check your pack details before continuing to payment." : null}
                {activeStep === 1 ? "We will use these details to confirm your order and send updates." : null}
                {activeStep === 2 ? "Choose how you want to receive your pack." : null}
                {activeStep === 3 ? "Review everything before continuing to PayFast." : null}
              </p>
            </div>

            {activeStep === 0 ? renderReviewStep() : null}
            {activeStep === 1 ? renderDetailsStep() : null}
            {activeStep === 2 ? renderFulfilmentStep() : null}
            {activeStep === 3 ? renderPayStep() : null}
          </section>

          <div className={styles.formActions}>
            <button type="button" onClick={() => goToStep(activeStep - 1)} disabled={activeStep === 0}>Back</button>
            {activeStep < 3 ? (
              <Button type="button" onClick={handleNext}>
                {activeStep === 2 ? "Review and pay" : activeStep === 0 ? "Continue to details" : "Continue to delivery"}
              </Button>
            ) : null}
          </div>
        </div>

        <CheckoutOrderSummary
          packName={`${schoolName} - ${grade}`}
          schoolName={schoolName}
          gradeName={grade}
          itemCount={contents.length}
          totalToPay={totalToPay}
          fulfilmentOption={fulfilmentOption}
          hasPexcover={hasPexcover}
          pexcoverCount={pexcoverCount}
        />
      </div>

      <div className={styles.mobileStickyCta}>
        {activeStep < 3 ? (
          <Button type="button" onClick={handleNext}>
            {activeStep === 2 ? "Review and pay" : "Continue"}
          </Button>
        ) : (
          <button type="button" className={styles.payButton} onClick={handlePay} disabled={submitting}>
            {submitting ? "Redirecting..." : "Pay with PayFast"}
          </button>
        )}
      </div>
    </div>
  );
}

function CheckoutOrderSummary({
  packName,
  schoolName,
  gradeName,
  itemCount,
  totalToPay,
  fulfilmentOption,
  hasPexcover,
  pexcoverCount,
}: {
  packName: string;
  schoolName?: string;
  gradeName?: string;
  itemCount: number;
  totalToPay: number;
  fulfilmentOption: string;
  hasPexcover?: boolean;
  pexcoverCount?: number;
}) {
  const [summaryOpen, setSummaryOpen] = useState(false);

  return (
    <aside className={styles.summaryColumn} aria-label="Order summary">
      <button type="button" className={styles.summaryToggle} aria-expanded={summaryOpen} onClick={() => setSummaryOpen(!summaryOpen)}>
        <span>{gradeName} - {itemCount} items - {formatCurrency(totalToPay)}</span>
        <strong>{summaryOpen ? "Hide" : "View summary"}</strong>
      </button>
      <div className={`${styles.summaryCard} ${summaryOpen ? styles.summaryCardOpen : ""}`}>
        <p className={styles.confirmKicker}>Order summary</p>
        <h2>{packName}</h2>
        <div className={styles.summaryMeta}>
          <span>{schoolName ?? "School pack"}</span>
          <span>{gradeName ?? "Grade"}</span>
          <span>Full Pack</span>
        </div>
        <dl className={styles.priceSummary}>
          <div>
            <dt>Selected items</dt>
            <dd>{itemCount}</dd>
          </div>
          <div>
            <dt>Delivery / collection</dt>
            <dd>{fulfilmentOption}</dd>
          </div>
          {hasPexcover && pexcoverCount ? (
            <div>
              <dt>Pexcover add-on</dt>
              <dd>{formatCurrency(pexcoverCount * PEXCOVER_PRICE)}</dd>
            </div>
          ) : null}
          <div>
            <dt>Total to pay</dt>
            <dd>{formatCurrency(totalToPay)}</dd>
          </div>
        </dl>
        <p className={styles.summaryNote}>You will complete payment through PayFast. PexPacks does not store card details.</p>
        <ul className={styles.trustList}>
          <li>Packed according to the school list</li>
          <li>Secure PayFast payment</li>
          <li>POPIA-aware checkout</li>
        </ul>
        <a className={styles.supportLink} href="https://wa.me/27780036048" target="_blank" rel="noopener noreferrer">WhatsApp support</a>
      </div>
    </aside>
  );
}
