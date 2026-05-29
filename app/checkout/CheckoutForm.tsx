"use client";

import { useRouter } from "next/navigation";
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
import { PayStep } from "@/components/checkout/PayStep";
import { OrderSummaryCard } from "@/components/checkout/OrderSummaryCard";
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
  const [buyerName, setBuyerName] = useState("");
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
        `Hi PexPacks, I need help with checkout for ${schoolName} ${grade}.`
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
      document
        .querySelector<HTMLElement>(`[data-field="${first}"], #${first}`)
        ?.focus();
    });
  }

  function validateStep(step: number): boolean {
    const nextErrors: Record<string, string> = {};

    if (step === 1) {
      if (!buyerName.trim() || buyerName.trim().length < 2)
        nextErrors.buyerName = "Please enter your full name.";
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
      if (!consent)
        nextErrors.consent = "Please accept the order processing consent.";
    }

    if (step === 2 && fulfilmentOption === "Delivery") {
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
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.checkoutUrl) {
        const msg =
          result.errors && typeof result.errors === "object"
            ? Object.values(result.errors).join(". ")
            : result.error || "Unable to continue to Paystack";
        throw new Error(msg);
      }

      window.location.href = result.checkoutUrl;
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We could not continue to Paystack right now. Please try again or contact PexPacks on WhatsApp."
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
            buyerName={buyerName}
            onBuyerNameChange={setBuyerName}
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
            consent={consent}
            onConsentChange={setConsent}
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
            errors={errors}
            onClearError={clearFieldError}
          />
        );
      case 3:
        return (
          <PayStep
            schoolName={schoolName}
            grade={grade}
            buyerName={buyerName}
            buyerPhone={buyerPhone}
            buyerEmail={buyerEmail}
            fulfilmentOption={fulfilmentOption}
            deliveryAddressSummary={deliveryAddressSummary}
            itemCount={itemCount}
            hasPexcover={hasPexcover}
            totalToPay={totalToPay}
            submitting={submitting}
            submitError={submitError}
            onEditPack={() => goToStep(0)}
            onEditCustomer={() => goToStep(1)}
            onEditDelivery={() => goToStep(2)}
            onPay={handlePay}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className={styles.checkoutShell}>
      <div className={styles.checkoutHeader}>
        {activeStep > 0 ? (
          <>
            <button
              type="button"
              className={`${styles.backLink} ${styles.desktopOnly}`}
              onClick={() => router.back()}
            >
              Back to packs
            </button>
            <button
              type="button"
              className={`${styles.backLink} ${styles.mobileOnly}`}
              onClick={() => goToStep(activeStep - 1)}
            >
              Back
            </button>
          </>
        ) : (
          <button
            type="button"
            className={styles.backLink}
            onClick={() => router.back()}
          >
            Back to packs
          </button>
        )}
        <div
          className={`${styles.stickyHeaderButton} ${isSticky ? styles.isSticky : ""}`}
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
            <span className={styles.stickyCtaLabel}>Total to pay</span>
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
                  ? "Review everything before continuing to Paystack."
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
            ) : null}
          </div>
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
        />
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
              : `Pay Securely ${formatCurrency(totalToPay)}`}
          </Button>
        )}
      </div>
    </div>
  );
}
