"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildWhatsAppHref } from "@/data/contact";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatCurrency";
import { readOrderDraft, type OrderDraft } from "@/lib/order/orderDraft";
import { OrderProgress } from "./OrderProgress";
import { ReviewStep } from "./ReviewStep";
import { DetailsStep } from "./DetailsStep";
import { FulfilmentStep } from "./FulfilmentStep";
import { ConfirmStep } from "./ConfirmStep";
import { SubmitStep } from "./SubmitStep";
import { CheckoutNavigation } from "./CheckoutNavigation";
import { OrderSummary } from "./OrderSummary";
import {
  PEXCOVER_PRICE,
  checkoutSteps,
  type ApiResponse,
  type FulfilmentOption,
  type OrderFormProps,
  type SchoolDetails,
  type SchoolSearchResult,
} from "./OrderFormTypes";
import {
  createOrderReference,
  fetchSchoolDetails,
  parseEstimatedTotal,
  resolveStandardSelection,
  isValidEmail,
  isLikelySaPhone,
} from "./orderFormHelpers";
import styles from "./Order.module.css";

export function OrderForm({
  initialSchool = "",
  initialGrade = "",
  initialPhase = "",
  initialPackId = "",
  initialPackType = "",
  initialCustomItems = "",
  initialRemovedItems = "",
  initialEstimatedTotal = "",
  initialDraftId = "",
}: OrderFormProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [orderDraft, setOrderDraft] = useState<OrderDraft | null>(null);
  const [draftStatus, setDraftStatus] = useState("");
  const effectiveInitialSchool = orderDraft?.schoolSlug ?? initialSchool;
  const effectiveInitialGrade =
    orderDraft?.gradeSlug ?? orderDraft?.grade ?? initialGrade;
  const effectiveInitialPhase = orderDraft?.phaseSlug ?? initialPhase;
  const effectiveInitialPackId = orderDraft?.packId ?? initialPackId;
  const effectiveInitialPackType = orderDraft?.type ?? initialPackType;
  const effectiveInitialCustomItems =
    orderDraft?.selectedItems ?? initialCustomItems;
  const effectiveInitialRemovedItems =
    orderDraft?.removedItems ?? initialRemovedItems;
  const effectiveInitialEstimatedTotal =
    typeof orderDraft?.estimatedTotal === "number"
      ? String(orderDraft.estimatedTotal)
      : initialEstimatedTotal;
  const standardSelection = useMemo(
    () =>
      resolveStandardSelection({
        initialPhase: effectiveInitialPhase,
        initialPackId: effectiveInitialPackId,
        initialGrade: effectiveInitialGrade,
        initialPackType: effectiveInitialPackType,
        initialCustomItems: effectiveInitialCustomItems,
        initialEstimatedTotal: effectiveInitialEstimatedTotal,
      }),
    [
      effectiveInitialCustomItems,
      effectiveInitialEstimatedTotal,
      effectiveInitialGrade,
      effectiveInitialPackId,
      effectiveInitialPackType,
      effectiveInitialPhase,
    ]
  );

  const [activeStep, setActiveStep] = useState(0);
  const [selectedSchool, setSelectedSchool] = useState<SchoolDetails | null>(
    null
  );
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schoolResults, setSchoolResults] = useState<SchoolSearchResult[]>([]);
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [schoolTouched, setSchoolTouched] = useState(
    Boolean(effectiveInitialSchool) && !standardSelection
  );
  const [schoolLoading, setSchoolLoading] = useState(false);
  const [schoolError, setSchoolError] = useState("");
  const [gradeSlug, setGradeSlug] = useState(
    standardSelection ? "" : effectiveInitialGrade
  );
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [learnerName, setLearnerName] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] =
    useState("whatsapp");
  const [consent, setConsent] = useState(false);
  const [fulfilmentOption, setFulfilmentOption] =
    useState<FulfilmentOption>("School collection");
  const [address, setAddress] = useState("");
  const [suburb, setSuburb] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [finalConfirmation, setFinalConfirmation] = useState(false);
  const [hasPexcover, setHasPexcover] = useState(false);
  const [pexcoverName, setPexcoverName] = useState("");
  const [pexcoverSubjects, setPexcoverSubjects] = useState("");
  const [pexcoverLabelFormat, setPexcoverLabelFormat] = useState(
    "First Name + Surname"
  );
  const [pexcoverNotes, setPexcoverNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<ApiResponse | null>(null);
  const [orderReference, setOrderReference] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  const currentStep = checkoutSteps[activeStep];
  const selectedGrade = useMemo(
    () =>
      selectedSchool?.grades.find((grade) => grade.gradeSlug === gradeSlug) ??
      null,
    [gradeSlug, selectedSchool]
  );
  const isCustomSchoolPack =
    !standardSelection && effectiveInitialPackType === "custom-school";
  const isFullSchoolPack =
    !standardSelection && effectiveInitialPackType === "full-school";
  const selectedPackTitle = standardSelection
    ? standardSelection.pack.title
    : `${selectedGrade?.grade ?? "Selected"} stationery pack`;
  const selectedPackPrice =
    standardSelection?.estimatedTotal ??
    (isCustomSchoolPack
      ? parseEstimatedTotal(effectiveInitialEstimatedTotal)
      : undefined) ??
    standardSelection?.pack.priceFrom ??
    selectedGrade?.price;
  const selectedPackItems = standardSelection
    ? standardSelection.customItems
      ? standardSelection.customItems.split("; ").filter(Boolean)
      : standardSelection.pack.items.map(
          (item) => `${item.quantity} x ${item.name}`
        )
    : isCustomSchoolPack && effectiveInitialCustomItems
      ? effectiveInitialCustomItems.split("; ").filter(Boolean)
      : (selectedGrade?.contents ?? []);
  const itemCount = selectedPackItems.length;
  const estimatedTotal =
    typeof selectedPackPrice === "number"
      ? selectedPackPrice + (hasPexcover ? PEXCOVER_PRICE : 0)
      : undefined;
  const schoolName = standardSelection
    ? standardSelection.phaseTitle
    : selectedSchool?.name;
  const gradeName = standardSelection
    ? standardSelection.pack.grade
    : selectedGrade?.grade;
  const packKind = standardSelection
    ? standardSelection.mode === "custom"
      ? "Custom pack"
      : "Full pack"
    : isCustomSchoolPack
      ? "Custom pack"
      : "Full pack";
  const reviewReady = Boolean(standardSelection || (selectedSchool && selectedGrade));
  const supportHref = buildWhatsAppHref(
    `Hi Pexpacks, I need help with checkout${orderReference ? ` ${orderReference}` : ""}.`
  );
  const submitError = submitStatus !== null && !submitStatus.success;

  useEffect(() => {
    setOrderReference(createOrderReference());
  }, []);

  useEffect(() => {
    if (!initialDraftId) {
      return;
    }

    const draft = readOrderDraft(initialDraftId);

    if (!draft) {
      setDraftStatus(
        "Your saved custom pack could not be restored. Please confirm the pack details before submitting."
      );
      return;
    }

    setOrderDraft(draft);
    setDraftStatus("");
  }, [initialDraftId]);

  useEffect(() => {
    if (standardSelection || !effectiveInitialSchool) {
      return;
    }

    let cancelled = false;
    setSchoolLoading(true);
    fetchSchoolDetails(effectiveInitialSchool)
      .then(({ school }) => {
        if (cancelled) return;
        setSelectedSchool(school);
        setSchoolQuery(school.name);
        setGradeSlug(
          effectiveInitialGrade || school.grades[0]?.gradeSlug || ""
        );
      })
      .catch(() => {
        if (!cancelled) {
          setSchoolError("We could not load that school. Search for it below.");
        }
      })
      .finally(() => {
        if (!cancelled) setSchoolLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveInitialGrade, effectiveInitialSchool, standardSelection]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#checkout-form") return;

    const timer = setTimeout(() => {
      document
        .getElementById("checkout-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const footer = document.getElementById("site-footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "0px",
      }
    );

    observer.observe(footer);

    return () => {
      observer.unobserve(footer);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (standardSelection || !schoolTouched) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setSchoolLoading(true);
      setSchoolError("");

      try {
        const params = new URLSearchParams({
          q: schoolQuery.trim(),
          limit: "10",
        });
        const response = await fetch(
          `/api/schools/search?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = (await response.json()) as {
          success: true;
          results: SchoolSearchResult[];
        };
        setSchoolResults(data.results);
      } catch {
        if (!controller.signal.aborted) {
          setSchoolResults([]);
          setSchoolError(
            "We could not search schools right now. Please try again."
          );
        }
      } finally {
        if (!controller.signal.aborted) setSchoolLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [schoolQuery, schoolTouched, standardSelection]);

  useEffect(() => {
    if (!headingRef.current) return;
    headingRef.current.focus({ preventScroll: false });
  }, [activeStep]);

  function clearFieldError(field: string) {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function selectSchool(result: SchoolSearchResult) {
    setSchoolLoading(true);
    setSchoolError("");
    clearFieldError("school");

    try {
      const { school } = await fetchSchoolDetails(result.slug);
      setSelectedSchool(school);
      setSchoolQuery(school.name);
      setSchoolOpen(false);
      setGradeSlug(school.grades[0]?.gradeSlug || "");
    } catch {
      setSchoolError("We could not load that school. Please search again.");
    } finally {
      setSchoolLoading(false);
    }
  }

  function validateStep(stepId = currentStep.id) {
    const nextErrors: Record<string, string> = {};

    if (stepId === "review") {
      if (!reviewReady) {
        if (!selectedSchool && !standardSelection) {
          nextErrors.school = "Please search and select a school.";
        }
        if (!selectedGrade && !standardSelection) {
          nextErrors.grade = "Please select the learner grade.";
        }
      }
    }

    if (stepId === "details") {
      if (buyerName.trim().length < 2) {
        nextErrors.buyerName = "Please enter the parent or customer name.";
      }
      if (!isLikelySaPhone(buyerPhone)) {
        nextErrors.buyerPhone =
          "Please enter a valid South African phone number.";
      }
      if (!buyerEmail.trim()) {
        nextErrors.buyerEmail = "Please enter an email address.";
      } else if (!isValidEmail(buyerEmail)) {
        nextErrors.buyerEmail = "Please enter a valid email address.";
      }
      if (!consent) {
        nextErrors.consent =
          "Please agree that Pexpacks may use your information to process this order.";
      }
    }

    if (stepId === "fulfilment" && fulfilmentOption === "Home delivery") {
      if (!address.trim()) nextErrors.address = "Please enter the delivery address.";
      if (!suburb.trim()) nextErrors.suburb = "Please enter the suburb.";
      if (!city.trim()) nextErrors.city = "Please enter the city.";
      if (!province.trim()) nextErrors.province = "Please enter the province.";
    }

    if (stepId === "confirm" && !finalConfirmation) {
      nextErrors.finalConfirmation =
        "Please confirm the details and policies before submitting.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function goToStep(index: number) {
    setSubmitStatus(null);
    setActiveStep(Math.max(0, Math.min(index, checkoutSteps.length - 1)));
  }

  function continueOrder() {
    setSubmitStatus(null);
    if (!validateStep()) {
      return;
    }
    goToStep(activeStep + 1);
  }

  function previousStep() {
    setSubmitStatus(null);
    goToStep(activeStep - 1);
  }

  async function submitOrder() {
    if (!validateStep("confirm")) {
      goToStep(3);
      return;
    }

    if (!standardSelection && (!selectedSchool || !selectedGrade)) {
      setSubmitStatus({
        success: false,
        message:
          "Please select a school and grade before submitting your order request.",
      });
      return;
    }

    setSubmitting(true);
    setSubmitStatus(null);

    const packType = standardSelection
      ? `${standardSelection.mode === "custom" ? "Customised" : "Standard"} ${standardSelection.pack.title}`
      : isCustomSchoolPack
        ? `Custom ${selectedGrade?.grade} stationery pack`
        : isFullSchoolPack
          ? `Full ${selectedGrade?.grade} stationery pack`
          : `${selectedGrade?.grade} stationery pack`;
    const submittedOrderReference = orderReference || createOrderReference();

    if (!orderReference) {
      setOrderReference(submittedOrderReference);
    }

    const fulfilmentMessage =
      fulfilmentOption === "Home delivery"
        ? `Fulfilment: Home delivery. Address: ${address}, ${suburb}, ${city}, ${province}. Notes: ${deliveryNotes || "None"}.`
        : `Fulfilment: ${fulfilmentOption}. Notes: ${deliveryNotes || "None"}.`;
    const pexcoverMessage = hasPexcover
      ? ` Pexcover requested. Learner: ${pexcoverName || learnerName || buyerName}. Subjects: ${pexcoverSubjects || "Standard"}. Label format: ${pexcoverLabelFormat}. Notes: ${pexcoverNotes || "None"}.`
      : "";
    const selectedItemsMessage = selectedPackItems.length
      ? `Selected items: ${selectedPackItems.join("; ")}.`
      : "";
    const removedItemsMessage =
      isCustomSchoolPack && effectiveInitialRemovedItems
        ? ` Removed items: ${effectiveInitialRemovedItems}.`
        : "";

    const payload = {
      formType: isCustomSchoolPack
        ? "custom-pack-enquiry"
        : isFullSchoolPack
          ? "full-pack-enquiry"
          : "school-pack-enquiry",
      fullName: buyerName,
      phone: buyerPhone,
      email: buyerEmail,
      learnerName,
      schoolId: selectedSchool?.id ?? "",
      schoolName: standardSelection
        ? "Standard school phase pack"
        : (selectedSchool?.name ?? ""),
      grade: standardSelection
        ? standardSelection.pack.grade
        : (selectedGrade?.grade ?? ""),
      packType,
      packId: standardSelection ? standardSelection.pack.id : selectedGrade?.id,
      packName: selectedPackTitle,
      selectedItems: selectedPackItems.join("; "),
      removedItems: effectiveInitialRemovedItems,
      estimatedTotal,
      orderReference: submittedOrderReference,
      orderDraftId: initialDraftId,
      preferredContactMethod,
      deliveryMethod: fulfilmentOption,
      address:
        fulfilmentOption === "Home delivery"
          ? [address, suburb, city, province].filter(Boolean).join(", ")
          : undefined,
      suburb: fulfilmentOption === "Home delivery" ? suburb : undefined,
      city: fulfilmentOption === "Home delivery" ? city : undefined,
      province: fulfilmentOption === "Home delivery" ? province : undefined,
      notes: deliveryNotes,
      message: [
        `Order reference: ${submittedOrderReference}.`,
        fulfilmentMessage,
        `Preferred contact: ${preferredContactMethod}.`,
        typeof estimatedTotal === "number"
          ? `Estimated total: ${formatCurrency(estimatedTotal)}.`
          : "Estimated total: to be confirmed.",
        selectedItemsMessage,
        removedItemsMessage,
        pexcoverMessage,
      ]
        .filter(Boolean)
        .join(" "),
      consent,
      companyWebsite: "",
      sourceUrl: window.location.href,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      submittedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/forms/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ApiResponse;
      setSubmitStatus(result);
      if (result.success) {
        goToStep(4);
      }
    } catch {
      setSubmitStatus({
        success: false,
        message:
          "We could not submit your order right now. Please try again or contact us on WhatsApp.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const primaryLabel =
    currentStep.id === "submit"
      ? submitting
        ? "Submitting request"
        : "Submit order request"
      : "Continue";
  const primaryDisabled =
    submitting ||
    (currentStep.id === "review" && !reviewReady) ||
    (currentStep.id === "confirm" && !finalConfirmation);

  return (
    <section className={styles.checkoutShell} id="checkout-form">
      <div className={styles.checkoutGrid}>
        <div className={styles.mainColumn}>
          <OrderProgress
            steps={checkoutSteps.map((step) => step.label)}
            activeStep={activeStep}
          />

          <article className={styles.stepCard} aria-labelledby="checkout-step-title">
            <div className={styles.stepIntro}>
              <p className={styles.stepEyebrow}>
                Step {activeStep + 1} of {checkoutSteps.length}
              </p>
              <h2 id="checkout-step-title" tabIndex={-1} ref={headingRef}>
                {currentStep.label}
              </h2>
              <p>{currentStep.helper}</p>
            </div>

            {currentStep.id === "review" ? (
              <ReviewStep
                standardSelection={standardSelection}
                selectedSchool={selectedSchool}
                setSelectedSchool={setSelectedSchool}
                schoolQuery={schoolQuery}
                setSchoolQuery={setSchoolQuery}
                schoolResults={schoolResults}
                schoolOpen={schoolOpen}
                setSchoolOpen={setSchoolOpen}
                setSchoolTouched={setSchoolTouched}
                schoolLoading={schoolLoading}
                schoolError={schoolError}
                gradeSlug={gradeSlug}
                setGradeSlug={setGradeSlug}
                hasPexcover={hasPexcover}
                setHasPexcover={setHasPexcover}
                pexcoverName={pexcoverName}
                setPexcoverName={setPexcoverName}
                pexcoverSubjects={pexcoverSubjects}
                setPexcoverSubjects={setPexcoverSubjects}
                pexcoverLabelFormat={pexcoverLabelFormat}
                setPexcoverLabelFormat={setPexcoverLabelFormat}
                pexcoverNotes={pexcoverNotes}
                setPexcoverNotes={setPexcoverNotes}
                selectedPackTitle={selectedPackTitle}
                packKind={packKind}
                schoolName={schoolName}
                gradeName={gradeName}
                itemCount={itemCount}
                estimatedTotal={estimatedTotal}
                selectedPackItems={selectedPackItems}
                reviewReady={reviewReady}
                errors={errors}
                draftStatus={draftStatus}
                clearFieldError={clearFieldError}
                selectSchool={selectSchool}
              />
            ) : null}

            {currentStep.id === "details" ? (
              <DetailsStep
                buyerName={buyerName}
                setBuyerName={setBuyerName}
                buyerPhone={buyerPhone}
                setBuyerPhone={setBuyerPhone}
                buyerEmail={buyerEmail}
                setBuyerEmail={setBuyerEmail}
                learnerName={learnerName}
                setLearnerName={setLearnerName}
                preferredContactMethod={preferredContactMethod}
                setPreferredContactMethod={setPreferredContactMethod}
                consent={consent}
                setConsent={setConsent}
                errors={errors}
                clearFieldError={clearFieldError}
              />
            ) : null}

            {currentStep.id === "fulfilment" ? (
              <FulfilmentStep
                fulfilmentOption={fulfilmentOption}
                setFulfilmentOption={setFulfilmentOption}
                address={address}
                setAddress={setAddress}
                suburb={suburb}
                setSuburb={setSuburb}
                city={city}
                setCity={setCity}
                province={province}
                setProvince={setProvince}
                deliveryNotes={deliveryNotes}
                setDeliveryNotes={setDeliveryNotes}
                errors={errors}
                clearFieldError={clearFieldError}
              />
            ) : null}

            {currentStep.id === "confirm" ? (
              <ConfirmStep
                selectedPackTitle={selectedPackTitle}
                schoolName={schoolName}
                gradeName={gradeName}
                itemCount={itemCount}
                buyerName={buyerName}
                buyerPhone={buyerPhone}
                buyerEmail={buyerEmail}
                fulfilmentOption={fulfilmentOption}
                address={address}
                suburb={suburb}
                city={city}
                province={province}
                estimatedTotal={estimatedTotal}
                finalConfirmation={finalConfirmation}
                setFinalConfirmation={setFinalConfirmation}
                errors={errors}
                clearFieldError={clearFieldError}
                goToStep={goToStep}
              />
            ) : null}

            {currentStep.id === "submit" ? (
              <SubmitStep
                submitStatus={submitStatus}
                submitError={submitError}
                orderReference={orderReference}
                selectedPackTitle={selectedPackTitle}
                preferredContactMethod={preferredContactMethod}
              />
            ) : null}

            <label className={styles.honeypot} aria-hidden="true">
              Company website
              <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
            </label>

            {!submitStatus?.success ? (
              <CheckoutNavigation
                activeStep={activeStep}
                primaryLabel={primaryLabel}
                primaryDisabled={primaryDisabled}
                onBack={previousStep}
                onPrimary={
                  currentStep.id === "submit" ? submitOrder : continueOrder
                }
              />
            ) : null}
          </article>
        </div>

        <OrderSummary
          packName={selectedPackTitle}
          schoolName={schoolName}
          gradeName={gradeName}
          packKind={packKind}
          itemCount={itemCount}
          estimatedTotal={estimatedTotal}
          fulfilmentOption={fulfilmentOption}
          supportHref={supportHref}
          summaryOpen={summaryOpen}
          setSummaryOpen={setSummaryOpen}
          hasPexcover={hasPexcover}
        />
      </div>

      {!submitStatus?.success ? (
        <div
          className={[
            styles.mobileStickyCta,
            isFooterVisible ? styles.hiddenCta : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <Button
            type="button"
            onClick={currentStep.id === "submit" ? submitOrder : continueOrder}
            disabled={primaryDisabled}
          >
            {primaryLabel}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
