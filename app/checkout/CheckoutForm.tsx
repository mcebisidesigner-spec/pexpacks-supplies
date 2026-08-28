"use client";

import { useRouter } from "next/navigation";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatCurrency";
import { PEXCOVER_PRICE } from "@/lib/constants";
import { readOrderDraft } from "@/lib/checkout/draft";
import { buildWhatsAppHref } from "@/data/contact";
import { CheckoutProgress } from "@/components/checkout/CheckoutProgress";
import { ReviewOrderStep } from "@/components/checkout/ReviewOrderStep";
import { DetailsStep } from "@/components/checkout/DetailsStep";
import { DeliveryStep } from "@/components/checkout/DeliveryStep";
import { OrderSummaryCard } from "@/components/checkout/OrderSummaryCard";
import heroStyles from "@/components/marketing/HeroBase.module.css";
import styles from "./Checkout.module.css";
import clsx from "clsx";
import {
  trackCheckoutStepCompleted,
  trackCheckoutValidationFailed,
  trackPaymentFailed,
  trackPaymentInitiated,
} from "@/lib/analytics";

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
type FulfilmentOption = "School collection" | "Delivery" | "Collection point";
type ContactMethod = "whatsapp" | "phone" | "email";

const STEPS: { id: CheckoutStep; label: string; title: string }[] = [
  { id: "review", label: "Review", title: "Review Order" },
  { id: "details", label: "Details", title: "Customer Details" },
  { id: "delivery", label: "Delivery", title: "Delivery or Collection" },
  { id: "pay", label: "Pay", title: "Confirm & Pay" },
];

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalisePhone(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("+")) {
    return `+${trimmed.slice(1).replace(/\D/g, "")}`;
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("0027") && digits.length >= 13) {
    return `+27${digits.slice(4)}`;
  }
  return digits;
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
  const router = useRouter();
  const openTray = usePackTrayStore((s) => s.openTray);
  const handleBackToOrder = () => {
    openTray();
    router.back();
  };
  const [isSticky, setIsSticky] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(max-width: 1024px)").matches) {
      setSummaryOpen(true);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 96) {
        setIsSticky(false);
      } else if (currentScrollY > lastScrollY.current + 4) {
        setIsSticky(true);
      } else if (currentScrollY < lastScrollY.current - 4) {
        setIsSticky(false);
      } else {
        lastScrollY.current = currentScrollY;
        return;
      }

      lastScrollY.current = currentScrollY;
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftTotal, setDraftTotal] = useState<number | null>(null);

  const [activeStep, setActiveStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] =
    useState<ContactMethod>("whatsapp");
  const [learnerName, setLearnerName] = useState("");
  const [learnerNotes, setLearnerNotes] = useState("");
  const [consent, setConsent] = useState(false);

  const [hasPexcover, setHasPexcover] = useState(false);
  const [pexcoverName, setPexcoverName] = useState("");
  const [pexcoverSubjects, setPexcoverSubjects] = useState("");
  const [pexcoverLabelFormat, setPexcoverLabelFormat] =
    useState("First Name + Surname");
  const [pexcoverNotes, setPexcoverNotes] = useState("");

  const [fulfilmentOption, setFulfilmentOption] =
    useState<FulfilmentOption>("School collection");
  const [address, setAddress] = useState("");
  const [suburb, setSuburb] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const idempotencyKeyRef = useRef<string | null>(null);
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
  const totalToPay = packPrice + (hasPexcover ? PEXCOVER_PRICE : 0);
  const currentStep = STEPS[activeStep] ?? STEPS[0];
  const itemCount = contents.length;
  const whatsAppHref = useMemo(
    () =>
      buildWhatsAppHref(
        `Hi Pexpacks, I need help with checkout for ${schoolName} ${grade}.`
      ),
    [grade, schoolName]
  );

  const deliveryAddressSummary = useMemo(() => {
    return [address, suburb, city, province, postalCode]
      .filter(Boolean)
      .join(", ");
  }, [address, suburb, city, province, postalCode]);

  function focusStepHeading() {
    window.requestAnimationFrame(() => headingRef.current?.focus());
  }

  function focusFirstInvalid(nextErrors: Record<string, string>) {
    const first = Object.keys(nextErrors)[0];
    if (!first) return;
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const target = document.querySelector<HTMLElement>(
          `[data-field="${first}"], #${first}`
        );
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
        target?.focus({ preventScroll: true });
      });
    });
  }

  function goToStep(index: number, options?: { preserveErrors?: boolean }) {
    const safeIndex = Math.max(0, Math.min(index, STEPS.length - 1));
    if (!options?.preserveErrors) {
      setErrors({});
    }
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

  function getStepErrors(step: number): Record<string, string> {
    const nextErrors: Record<string, string> = {};

    if (step === 1) {
      if (!firstName.trim() || firstName.trim().length < 2)
        nextErrors.firstName = "Please enter your first name.";
      if (!lastName.trim() || lastName.trim().length < 2)
        nextErrors.lastName = "Please enter your surname.";
      if (!buyerPhone.trim())
        nextErrors.buyerPhone = "Please enter your phone number.";
      else if (!isLikelySaPhone(buyerPhone))
        nextErrors.buyerPhone =
          "Please enter a valid South African phone number.";
      if (!buyerEmail.trim())
        nextErrors.buyerEmail = "Please enter your email address.";
      else if (!isValidEmail(buyerEmail.trim()))
        nextErrors.buyerEmail = "Please enter a valid email address.";
      if (!learnerName.trim() || learnerName.trim().length < 2)
        nextErrors.learnerName = "Please enter the learner name.";
    }

    if (step === 2) {
      if (fulfilmentOption === "Delivery") {
        if (!address.trim()) nextErrors.address = "Please enter the delivery address.";
        if (!suburb.trim()) nextErrors.suburb = "Please enter the suburb.";
        if (!city.trim()) nextErrors.city = "Please enter the city.";
        if (!province.trim()) nextErrors.province = "Please enter the province.";
      }
      if (!consent)
        nextErrors.consent = "Please accept the order processing consent.";
    }

    return nextErrors;
  }

  function validateStep(step: number): boolean {
    const nextErrors = getStepErrors(step);

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      trackCheckoutValidationFailed({
        checkoutMode: "single-pack",
        step: STEPS[step]?.id || "unknown",
        fields: Object.keys(nextErrors),
      });
      focusFirstInvalid(nextErrors);
      return false;
    }
    return true;
  }

  function handleNext() {
    if (validateStep(activeStep)) {
      trackCheckoutStepCompleted({
        checkoutMode: "single-pack",
        step: currentStep.id,
      });
      goToStep(activeStep + 1);
    }
  }

  async function handlePay() {
    const detailsErrors = getStepErrors(1);
    if (Object.keys(detailsErrors).length > 0) {
      trackCheckoutValidationFailed({
        checkoutMode: "single-pack",
        step: "details",
        fields: Object.keys(detailsErrors),
      });
      setErrors(detailsErrors);
      goToStep(1, { preserveErrors: true });
      focusFirstInvalid(detailsErrors);
      return;
    }

    const deliveryErrors = getStepErrors(2);
    if (Object.keys(deliveryErrors).length > 0) {
      trackCheckoutValidationFailed({
        checkoutMode: "single-pack",
        step: "delivery",
        fields: Object.keys(deliveryErrors),
      });
      setErrors(deliveryErrors);
      goToStep(2, { preserveErrors: true });
      focusFirstInvalid(deliveryErrors);
      return;
    }

    setSubmitError(null);
    setSubmitting(true);

    const fulfilmentNotes = [
      deliveryNotes.trim() ? `Notes: ${deliveryNotes.trim()}` : "",
      learnerNotes.trim() ? `Learner notes: ${learnerNotes.trim()}` : "",
      fulfilmentOption === "Delivery"
        ? `Address: ${deliveryAddressSummary}`
        : "",
      preferredContactMethod
        ? `Preferred contact: ${preferredContactMethod}`
        : "",
      deliveryNote ? `Pack note: ${deliveryNote}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    try {
      if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current = crypto.randomUUID();
      }

      const response = await fetch("/api/ozow/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: idempotencyKeyRef.current,
          amount: totalToPay,
          customerEmail: buyerEmail.trim().toLowerCase(),
          buyerName: `${firstName.trim()} ${lastName.trim()}`.trim(),
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
              : fulfilmentOption === "Delivery"
                ? "delivery"
                : "collection_point",
          notes: fulfilmentNotes || undefined,
          pexcoverSelected: hasPexcover,
          pexcoverAmount: hasPexcover ? PEXCOVER_PRICE : 0,
          pexcoverName: pexcoverName.trim() || undefined,
          pexcoverSubjects: pexcoverSubjects.trim() || undefined,
          pexcoverLabelFormat: pexcoverLabelFormat.trim() || undefined,
          pexcoverNotes: pexcoverNotes.trim() || undefined,
          idempotencyKey: idempotencyKeyRef.current,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        console.error("Ozow Checkout Error Response:", response.status, data);
        trackPaymentFailed({
          checkoutMode: "single-pack",
          failureType: response.ok ? "invalid_response" : "api",
          statusCode: response.status,
        });
        const errorMessage =
          data.error ||
          data.message ||
          (data.errors && typeof data.errors === "object"
            ? Object.values(data.errors).join(". ")
            : "Failed to initialize Ozow payment.");
        setSubmitError(errorMessage);
        return;
      }

      trackPaymentInitiated({
        orderId: idempotencyKeyRef.current,
        totalPrice: totalToPay,
      });
      window.location.href = data.url;
      return;
    } catch (error) {
      console.error("Ozow Checkout Exception:", error);
      trackPaymentFailed({
        checkoutMode: "single-pack",
        failureType: "network",
      });
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to initialize Ozow payment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function renderStepContent() {
    switch (activeStep) {
      case 0:
        return (
          <ReviewOrderStep
            schoolSlug={schoolSlug}
            schoolName={schoolName}
            grade={grade}
            gradeSlug={gradeSlug}
            packPrice={packPrice}
            contents={contents}
            hasPexcover={hasPexcover}
            onPexcoverToggle={setHasPexcover}
            pexcoverName={pexcoverName}
            onPexcoverNameChange={setPexcoverName}
            pexcoverSubjects={pexcoverSubjects}
            onPexcoverSubjectsChange={setPexcoverSubjects}
            pexcoverLabelFormat={pexcoverLabelFormat}
            onPexcoverLabelFormatChange={setPexcoverLabelFormat}
            pexcoverNotes={pexcoverNotes}
            onPexcoverNotesChange={setPexcoverNotes}
            pexcoverPrice={PEXCOVER_PRICE}
          />
        );
      case 1:
        return (
          <DetailsStep
            firstName={firstName}
            onFirstNameChange={setFirstName}
            lastName={lastName}
            onLastNameChange={setLastName}
            buyerPhone={buyerPhone}
            onBuyerPhoneChange={setBuyerPhone}
            buyerEmail={buyerEmail}
            onBuyerEmailChange={setBuyerEmail}
            learnerName={learnerName}
            onLearnerNameChange={setLearnerName}
            schoolName={schoolName}
            grade={grade}
            learnerNotes={learnerNotes}
            onLearnerNotesChange={setLearnerNotes}
            preferredContactMethod={preferredContactMethod}
            onPreferredContactMethodChange={setPreferredContactMethod}
            errors={errors}
            onClearError={clearFieldError}
          />
        );
      case 2:
        return (
          <DeliveryStep
            fulfilmentOption={fulfilmentOption}
            onFulfilmentOptionChange={setFulfilmentOption}
            address={address}
            onAddressChange={setAddress}
            suburb={suburb}
            onSuburbChange={setSuburb}
            city={city}
            onCityChange={setCity}
            province={province}
            onProvinceChange={setProvince}
            postalCode={postalCode}
            onPostalCodeChange={setPostalCode}
            deliveryNotes={deliveryNotes}
            onDeliveryNotesChange={setDeliveryNotes}
            consent={consent}
            onConsentChange={setConsent}
            errors={errors}
            onClearError={clearFieldError}
          />
        );
      case 3:
        return (
          <div className={styles.confirmGrid}>
            <section className={styles.reviewBlock}>
              <div className={styles.reviewBlockContent}>
                <p className={styles.reviewBlockTitle}>Order Summary</p>
                <strong>{schoolName} - {grade}</strong>
                <span>{itemCount} items{hasPexcover ? " + Pexcover" : ""}</span>
              </div>
            </section>

            <section className={styles.reviewBlock}>
              <div className={styles.reviewBlockContent}>
                <p className={styles.reviewBlockTitle}>Customer</p>
                <strong>{`${firstName.trim()} ${lastName.trim()}`.trim() || "Name required"}</strong>
                <span>{buyerPhone || "Phone required"} - {buyerEmail || "Email required"}</span>
              </div>
            </section>

            <section className={styles.reviewBlock}>
              <div className={styles.reviewBlockContent}>
                <p className={styles.reviewBlockTitle}>Delivery / Collection</p>
                <strong>{fulfilmentOption}</strong>
                <span>
                  {fulfilmentOption === "Delivery"
                    ? deliveryAddressSummary || "Address required"
                    : "Pexpacks will confirm the handover details."}
                </span>
              </div>
            </section>

            <section className={styles.paymentReadyCard}>
              <div className={styles.paymentSecurityHeader}>
                <svg className={styles.securityLockIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <div>
                  <p className={styles.confirmKicker}>Confirm Your Order</p>
                  <h3>Review and confirm</h3>
                </div>
              </div>
              <p className={styles.paymentSubtext}>
                You will be redirected to Ozow to pay the pack total securely.
                {fulfilmentOption === "Delivery"
                  ? " The home-delivery fee is not included and will be confirmed with you separately before dispatch."
                  : ""}
              </p>
            </section>

            {submitError ? (
              <p className={styles.formStatusError} role="alert">
                {submitError}
              </p>
            ) : null}
          </div>
        );
      default:
        return null;
    }
  }
`r`n  return (
    <div className={styles.checkoutShell}>
      <div className={styles.checkoutHeader}>
        {activeStep > 0 ? (
          <div>
            <Button
              type="button"
              variant="secondary"
              className={clsx(styles.desktopOnly, "rounded-full")}
              onClick={handleBackToOrder}
            >
              Back to Order
            </Button>
            <Button
              type="button"
              variant="secondary"
              className={clsx(styles.mobileOnly, "rounded-full")}
              onClick={() => goToStep(activeStep - 1)}
            >
              Back
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="secondary"
            className="rounded-full"
            onClick={handleBackToOrder}
          >
            Back to Order
          </Button>
        )}
        <div
          className={clsx(styles.stickyHeaderButton, isSticky && styles.isSticky)}
        >
          <Button
            variant="white"
            size="lg"
            iconDirection="none"
            className={styles.stickyCtaBtn}
            onClick={() => setSummaryOpen(!summaryOpen)}
            aria-expanded={summaryOpen}
            aria-controls="checkout-order-summary"
          >
            <span className={styles.stickyCtaLabel}>
              {fulfilmentOption === "Delivery" ? "Pack total" : "Total to pay"}
            </span>
            <span className={styles.stickyCtaPrice}>
              {formatCurrency(totalToPay)}
            </span>
          </Button>
        </div>
        <a
          href={whatsAppHref}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.helpLink}
        >
          Need Help?
        </a>
      </div>

      <div className={styles.checkoutGrid}>
        <div className={styles.mainColumn}>
          <CheckoutProgress steps={STEPS} activeStep={activeStep} />

          <section className={styles.stepCard} aria-labelledby="checkout-step-heading">
            <div className={styles.stepIntro}>
              <p className={clsx(heroStyles.eyebrow, styles.stepEyebrow)}>
                Secure checkout
              </p>
              <h1
                id="checkout-step-heading"
                ref={headingRef}
                tabIndex={-1}
              >
                {currentStep.title}
              </h1>
              <p>
                {activeStep === 0
                  ? "Make sure you check your pack details before continuing to the next step. You can change the school and grade below."
                  : null}
                {activeStep === 1
                  ? "We will use these details to confirm your order and send updates."
                  : null}
                {activeStep === 2
                  ? "Choose how you want to receive your pack."
                  : null}
                {activeStep === 3
                  ? "Review everything before confirming your order."
                  : null}
              </p>
            </div>

            {renderStepContent()}
          </section>

          <div className={styles.formActions}>
            <Button
              type="button"
              variant="outline"
              iconDirection="left"
              onClick={() => goToStep(activeStep - 1)}
              disabled={activeStep === 0}
            >
              Back
            </Button>
            {activeStep < 3 ? (
              <Button type="button" variant="primary" onClick={handleNext}>
                {activeStep === 2
                  ? "Review and pay"
                  : activeStep === 0
                    ? "Continue to details"
                    : "Continue to delivery"}
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={handlePay}
                disabled={submitting}
                aria-busy={submitting}
              >
                {submitting
                  ? "Preparing secure checkout..."
                  : fulfilmentOption === "Delivery"
                    ? `Pay Pack Total ${formatCurrency(totalToPay)}`
                    : `Pay Securely ${formatCurrency(totalToPay)}`}
              </Button>
            )}
          </div>

          <OrderSummaryCard
            schoolName={schoolName}
            gradeName={grade}
            packPrice={packPrice}
            itemCount={contents.length}
            totalToPay={totalToPay}
            fulfilmentOption={fulfilmentOption}
            hasPexcover={hasPexcover}
            summaryOpen={summaryOpen}
            whatsAppHref={whatsAppHref}
            deliveryFeePending={fulfilmentOption === "Delivery"}
          />
        </div>
      </div>

      <div className={styles.mobileStickyCta}>
        {activeStep < 3 ? (
          <Button
            type="button"
            variant="primary"
            className={styles.fullWidth}
            onClick={handleNext}
          >
            {activeStep === 2
              ? "Review and pay"
              : activeStep === 0
                ? "Continue to details"
                : "Continue to delivery"}
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            className={styles.fullWidth}
            onClick={handlePay}
            disabled={submitting}
          >
            {submitting
              ? "Preparing secure checkout..."
              : fulfilmentOption === "Delivery"
                ? `Pay Pack Total ${formatCurrency(totalToPay)}`
                : `Pay Securely ${formatCurrency(totalToPay)}`}
          </Button>
        )}
      </div>
    </div>
  );
}
