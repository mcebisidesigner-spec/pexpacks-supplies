"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildWhatsAppHref,
  ordersEmail,
  ordersEmailHref,
} from "@/data/contact";
import { phasePacks, type GradePackTemplate } from "@/data/phasePacks";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatCurrency";
import { readOrderDraft, type OrderDraft } from "@/lib/order/orderDraft";
import { OrderProgress } from "./OrderProgress";
import styles from "./Order.module.css";

type ApiResponse = {
  success: boolean;
  message: string;
  submissionId?: string;
  errors?: Record<string, string>;
};

type GradeOption = {
  id: string;
  grade: string;
  gradeSlug: string;
  price: number;
  contents: string[];
  deliveryNote: string;
};

type SchoolSearchResult = {
  id: string;
  name: string;
  slug: string;
  city: string;
  province: string;
};

type SchoolDetails = SchoolSearchResult & {
  grades: GradeOption[];
};

type CheckoutStepId =
  | "review"
  | "details"
  | "fulfilment"
  | "confirm"
  | "submit";

type CheckoutStep = {
  id: CheckoutStepId;
  label: string;
  helper: string;
};

type StandardSelection = {
  mode: "standard" | "custom";
  phaseTitle: string;
  phaseSlug: string;
  pack: GradePackTemplate;
  customItems?: string;
  estimatedTotal?: number;
};

type FulfilmentOption = "School collection" | "Home delivery" | "Arrange collection";

type OrderFormProps = {
  initialSchool?: string;
  initialGrade?: string;
  initialPhase?: string;
  initialPackId?: string;
  initialPackType?: string;
  initialCustomItems?: string;
  initialRemovedItems?: string;
  initialEstimatedTotal?: string;
  initialDraftId?: string;
};

const checkoutSteps: CheckoutStep[] = [
  {
    id: "review",
    label: "Review Pack",
    helper: "Check school, grade and selected items.",
  },
  {
    id: "details",
    label: "Customer Details",
    helper: "Tell us who to contact about this order.",
  },
  {
    id: "fulfilment",
    label: "Delivery or Collection",
    helper: "Choose how you would like to receive the pack.",
  },
  {
    id: "confirm",
    label: "Confirm Order",
    helper: "Review everything before submitting.",
  },
  {
    id: "submit",
    label: "Submit Request",
    helper: "PexPacks will confirm payment and fulfilment.",
  },
];

const PEXCOVER_PRICE = 120;

const fulfilmentOptions: Array<{
  value: FulfilmentOption;
  title: string;
  text: string;
  meta: string;
  icon: string;
}> = [
  {
    value: "School collection",
    title: "School Collection",
    text: "Collect from your school or agreed handover point.",
    meta: "Best for official school pack handovers.",
    icon: "school",
  },
  {
    value: "Home delivery",
    title: "Home Delivery",
    text: "Receive your stationery pack at home.",
    meta: "Delivery fee may apply after confirmation.",
    icon: "home",
  },
  {
    value: "Arrange collection",
    title: "Arrange Collection",
    text: "We will contact you to confirm the best pickup option.",
    meta: "Useful when school collection is not available.",
    icon: "pin",
  },
];

function createOrderReference() {
  return `PEX-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;
}

async function fetchSchoolDetails(slug: string) {
  const response = await fetch(`/api/schools/${encodeURIComponent(slug)}`);

  if (!response.ok) {
    throw new Error("School not found");
  }

  return (await response.json()) as { success: true; school: SchoolDetails };
}

function parseEstimatedTotal(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function resolveStandardSelection({
  initialPhase,
  initialPackId,
  initialGrade,
  initialPackType,
  initialCustomItems,
  initialEstimatedTotal,
}: Pick<
  OrderFormProps,
  | "initialPhase"
  | "initialPackId"
  | "initialGrade"
  | "initialPackType"
  | "initialCustomItems"
  | "initialEstimatedTotal"
>): StandardSelection | null {
  if (!initialPhase) {
    return null;
  }

  const phase = phasePacks.find((pack) => pack.slug === initialPhase);
  if (!phase) {
    return null;
  }

  const selectedPack =
    phase.gradePacks.find((pack) => pack.id === initialPackId) ||
    phase.gradePacks.find(
      (pack) => pack.grade.toLowerCase() === initialGrade?.toLowerCase()
    );

  if (!selectedPack) {
    return null;
  }

  return {
    mode: initialPackType === "custom" ? "custom" : "standard",
    phaseTitle: phase.title,
    phaseSlug: phase.slug,
    pack: selectedPack,
    customItems: initialCustomItems,
    estimatedTotal: parseEstimatedTotal(initialEstimatedTotal),
  };
}

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
  const reviewReady = standardSelection || Boolean(selectedSchool && selectedGrade);
  const supportHref = buildWhatsAppHref(
    `Hi PexPacks, I need help with checkout${orderReference ? ` ${orderReference}` : ""}.`
  );

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
          "Please agree that PexPacks may use your information to process this order.";
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
              <div className={styles.reviewGrid}>
                {!standardSelection ? (
                  <div className={styles.selectionCard}>
                    <div className={styles.fieldGroup}>
                      <label htmlFor="order-school-search">School name</label>
                      <p id="school-helper">
                        Search and select the school this pack belongs to.
                      </p>
                      <input
                        id="order-school-search"
                        name="orderSchoolSearch"
                        type="search"
                        role="combobox"
                        aria-autocomplete="list"
                        aria-expanded={schoolOpen}
                        aria-controls="order-school-results"
                        aria-describedby={`school-helper${errors.school ? " school-error" : ""}`}
                        aria-invalid={Boolean(errors.school)}
                        autoComplete="off"
                        placeholder="Start typing your school name"
                        value={schoolQuery}
                        onFocus={() => {
                          setSchoolTouched(true);
                          setSchoolOpen(true);
                        }}
                        onChange={(event) => {
                          setSchoolQuery(event.target.value);
                          setSelectedSchool(null);
                          setGradeSlug("");
                          setSchoolTouched(true);
                          setSchoolOpen(true);
                          clearFieldError("school");
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") setSchoolOpen(false);
                        }}
                      />
                      {errors.school ? (
                        <p id="school-error" className={styles.fieldError}>
                          {errors.school}
                        </p>
                      ) : null}
                      {schoolOpen ? (
                        <div
                          className={styles.schoolResults}
                          id="order-school-results"
                          role="listbox"
                        >
                          {schoolLoading ? (
                            <p className={styles.schoolEmpty}>Searching schools...</p>
                          ) : null}
                          {!schoolLoading && schoolResults.length
                            ? schoolResults.map((result) => (
                                <button
                                  type="button"
                                  role="option"
                                  aria-selected={
                                    selectedSchool?.slug === result.slug
                                  }
                                  className={styles.schoolResult}
                                  key={result.id}
                                  onClick={() => selectSchool(result)}
                                >
                                  <strong>{result.name}</strong>
                                  <span>
                                    {result.city}, {result.province}
                                  </span>
                                </button>
                              ))
                            : null}
                          {!schoolLoading && !schoolResults.length ? (
                            <p className={styles.schoolEmpty}>
                              No matching schools found. You can also{" "}
                              <Link href="/schools">browse schools</Link>.
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                      {schoolError ? (
                        <p className={styles.fieldError} role="alert">
                          {schoolError}
                        </p>
                      ) : null}
                    </div>

                    <div className={styles.fieldGroup}>
                      <label htmlFor="order-grade-select">Grade</label>
                      <p id="grade-helper">
                        Choose the grade pack you want to order.
                      </p>
                      <select
                        id="order-grade-select"
                        name="orderGrade"
                        value={gradeSlug}
                        aria-describedby={`grade-helper${errors.grade ? " grade-error" : ""}`}
                        aria-invalid={Boolean(errors.grade)}
                        onChange={(event) => {
                          setGradeSlug(event.target.value);
                          clearFieldError("grade");
                        }}
                      >
                        <option value="">Choose a grade</option>
                        {selectedSchool?.grades.map((grade) => (
                          <option value={grade.gradeSlug} key={grade.id}>
                            {grade.grade}
                          </option>
                        ))}
                      </select>
                      {errors.grade ? (
                        <p id="grade-error" className={styles.fieldError}>
                          {errors.grade}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <div className={styles.packReviewCard}>
                  <div>
                    <p className={styles.confirmKicker}>Your pack</p>
                    <h3>{selectedPackTitle}</h3>
                    <p>
                      {reviewReady
                        ? `${packKind} for ${schoolName ?? "selected school"}${gradeName ? `, ${gradeName}` : ""}.`
                        : "Select your school and grade to prepare the pack summary."}
                    </p>
                  </div>
                  {draftStatus ? (
                    <p className={styles.formStatusError} role="alert">
                      {draftStatus}
                    </p>
                  ) : null}
                  <div className={styles.packFacts}>
                    <span>{packKind}</span>
                    <span>
                      {itemCount ? `${itemCount} selected items` : "Items confirm after selection"}
                    </span>
                    <span>
                      {typeof estimatedTotal === "number"
                        ? formatCurrency(estimatedTotal)
                        : "Total to be confirmed"}
                    </span>
                  </div>
                  {selectedPackItems.length ? (
                    <ul className={styles.itemPreview}>
                      {selectedPackItems.slice(0, 8).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.emptyPreview}>
                      Pack items will appear here once the grade is selected.
                    </p>
                  )}
                  {selectedPackItems.length > 8 ? (
                    <p className={styles.moreItems}>
                      +{selectedPackItems.length - 8} more items included
                    </p>
                  ) : null}
                  <Link
                    className={styles.inlineAction}
                    href={
                      standardSelection
                        ? `/${standardSelection.phaseSlug}`
                        : selectedSchool && selectedGrade
                          ? `/schools/${selectedSchool.slug}/${selectedGrade.gradeSlug}`
                          : "/schools"
                    }
                  >
                    Edit or customise pack
                  </Link>
                </div>

                <div
                  className={`${styles.addonCard} ${
                    hasPexcover ? styles.addonCardActive : ""
                  }`}
                >
                  <div>
                    <p className={styles.confirmKicker}>Optional add-on</p>
                    <h3>Pexcover book covering</h3>
                    <p>
                      Add covered and labelled exercise books to help the pack
                      arrive ready for the first school day. Pexcover applies to
                      exercise books included in the selected school pack.{" "}
                      <Link
                        href="/blog/what-is-pexcover-book-covering"
                        className={styles.inlineAction}
                        style={{ display: "inline", fontSize: "inherit" }}
                      >
                        Read more
                      </Link>
                    </p>
                  </div>
                  <label className={styles.addonCheckbox}>
                    <input
                      type="checkbox"
                      checked={hasPexcover}
                      onChange={(event) => setHasPexcover(event.target.checked)}
                    />
                    <span>Add Pexcover for {formatCurrency(PEXCOVER_PRICE)}</span>
                  </label>
                  {hasPexcover ? (
                    <div className={styles.formGrid}>
                      <div className={styles.fieldGroup}>
                        <label htmlFor="pexcover-name">
                          Learner name for labels
                        </label>
                        <input
                          id="pexcover-name"
                          value={pexcoverName}
                          placeholder="Optional"
                          onChange={(event) =>
                            setPexcoverName(event.target.value)
                          }
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label htmlFor="pexcover-format">Label format</label>
                        <select
                          id="pexcover-format"
                          value={pexcoverLabelFormat}
                          onChange={(event) =>
                            setPexcoverLabelFormat(event.target.value)
                          }
                        >
                          <option>First Name + Surname</option>
                          <option>First Name + Initial</option>
                          <option>Initials + Surname</option>
                        </select>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label htmlFor="pexcover-subjects">
                          Subject names optional
                        </label>
                        <input
                          id="pexcover-subjects"
                          value={pexcoverSubjects}
                          placeholder="English, Maths, Life Skills"
                          onChange={(event) =>
                            setPexcoverSubjects(event.target.value)
                          }
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label htmlFor="pexcover-notes">Special notes optional</label>
                        <input
                          id="pexcover-notes"
                          value={pexcoverNotes}
                          placeholder="Any covering instructions?"
                          onChange={(event) =>
                            setPexcoverNotes(event.target.value)
                          }
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {currentStep.id === "details" ? (
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
                    I agree that PexPacks may use my information to process this
                    order and contact me about it.{" "}
                    <Link href="/privacy-policy">Privacy policy</Link>
                  </span>
                </label>
                {errors.consent ? (
                  <p id="consent-error" className={styles.fieldError}>
                    {errors.consent}
                  </p>
                ) : null}
                <p className={styles.privacyNotice}>
                  We only use your details to process your PexPacks order and
                  provide support.
                </p>
              </div>
            ) : null}

            {currentStep.id === "fulfilment" ? (
              <div className={styles.fulfilmentStep}>
                <fieldset className={styles.optionFieldset}>
                  <legend>Preferred handover option</legend>
                  <div className={styles.deliveryOptions}>
                    {fulfilmentOptions.map((option) => (
                      <label
                        className={`${styles.deliveryOption} ${
                          fulfilmentOption === option.value
                            ? styles.deliveryOptionSelected
                            : ""
                        }`}
                        key={option.value}
                      >
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value={option.value}
                          checked={fulfilmentOption === option.value}
                          onChange={() => {
                            setFulfilmentOption(option.value);
                            setErrors({});
                          }}
                        />
                        <span className={styles.deliveryIcon}>
                          {deliveryIcon(option.icon)}
                        </span>
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
                      <Link
                        href="/delivery-policy"
                        className={styles.inlineAction}
                        style={{ display: "inline", fontSize: "inherit" }}
                      >
                        Delivery Policy
                      </Link>{" "}
                      for more details on pricing and schedules.
                    </p>
                    <div className={styles.formGrid}>
                      {[
                      {
                        id: "delivery-address",
                        label: "Street address",
                        value: address,
                        setter: setAddress,
                        error: errors.address,
                        autoComplete: "address-line1",
                      },
                      {
                        id: "delivery-suburb",
                        label: "Suburb",
                        value: suburb,
                        setter: setSuburb,
                        error: errors.suburb,
                        autoComplete: "address-level3",
                      },
                      {
                        id: "delivery-city",
                        label: "City",
                        value: city,
                        setter: setCity,
                        error: errors.city,
                        autoComplete: "address-level2",
                      },
                      {
                        id: "delivery-province",
                        label: "Province",
                        value: province,
                        setter: setProvince,
                        error: errors.province,
                        autoComplete: "address-level1",
                      },
                    ].map((field) => (
                      <div className={styles.fieldGroup} key={field.id}>
                        <label htmlFor={field.id}>{field.label}</label>
                        <input
                          id={field.id}
                          value={field.value}
                          autoComplete={field.autoComplete}
                          aria-invalid={Boolean(field.error)}
                          aria-describedby={field.error ? `${field.id}-error` : undefined}
                          onChange={(event) => {
                            field.setter(event.target.value);
                            clearFieldError(
                              field.id.replace("delivery-", "") as keyof typeof errors
                            );
                          }}
                        />
                        {field.error ? (
                          <p id={`${field.id}-error`} className={styles.fieldError}>
                            {field.error}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </>
              ) : null}

                <div className={styles.fieldGroup}>
                  <label htmlFor="delivery-notes">Delivery or collection notes optional</label>
                  <textarea
                    id="delivery-notes"
                    value={deliveryNotes}
                    placeholder="Gate code, preferred pickup time, or anything the team should know"
                    onChange={(event) => setDeliveryNotes(event.target.value)}
                  />
                </div>
              </div>
            ) : null}

            {currentStep.id === "confirm" ? (
              <div className={styles.confirmGrid}>
                <ReviewBlock title="Pack" onEdit={() => goToStep(0)}>
                  <strong>{selectedPackTitle}</strong>
                  <span>
                    {schoolName ?? "School to confirm"} · {gradeName ?? "Grade to confirm"} ·{" "}
                    {itemCount || "Confirming"} items
                  </span>
                </ReviewBlock>
                <ReviewBlock title="Customer" onEdit={() => goToStep(1)}>
                  <strong>{buyerName || "Name required"}</strong>
                  <span>
                    {buyerPhone || "Phone required"} · {buyerEmail || "Email required"}
                  </span>
                </ReviewBlock>
                <ReviewBlock title="Delivery / Collection" onEdit={() => goToStep(2)}>
                  <strong>{fulfilmentOption}</strong>
                  <span>
                    {fulfilmentOption === "Home delivery"
                      ? [address, suburb, city, province].filter(Boolean).join(", ") ||
                        "Address required"
                      : "PexPacks will confirm the handover details."}
                  </span>
                </ReviewBlock>
                <ReviewBlock title="Estimated total">
                  <strong>
                    {typeof estimatedTotal === "number"
                      ? formatCurrency(estimatedTotal)
                      : "To be confirmed"}
                  </strong>
                  <span>Final amount will be confirmed before payment.</span>
                </ReviewBlock>
                <label className={`${styles.consentField} ${styles.finalConsent}`}>
                  <input
                    name="finalConfirmation"
                    type="checkbox"
                    checked={finalConfirmation}
                    aria-describedby={
                      errors.finalConfirmation ? "final-confirmation-error" : undefined
                    }
                    aria-invalid={Boolean(errors.finalConfirmation)}
                    onChange={(event) => {
                      setFinalConfirmation(event.target.checked);
                      clearFieldError("finalConfirmation");
                    }}
                  />
                  <span>
                    I confirm the order details are correct and agree to the{" "}
                    <Link href="/terms">Terms</Link>,{" "}
                    <Link href="/privacy-policy">Privacy Policy</Link>,{" "}
                    <Link href="/delivery-policy">Delivery Policy</Link>, and{" "}
                    <Link href="/returns-refunds-policy">
                      Returns & Refunds Policy
                    </Link>
                    .
                  </span>
                </label>
                {errors.finalConfirmation ? (
                  <p id="final-confirmation-error" className={styles.fieldError}>
                    {errors.finalConfirmation}
                  </p>
                ) : null}
              </div>
            ) : null}

            {currentStep.id === "submit" ? (
              <div className={styles.submitStep}>
                {submitStatus?.success ? (
                  <div className={styles.successCard} role="status" aria-live="polite">
                    <span className={styles.successIcon}>✓</span>
                    <p className={styles.confirmKicker}>Order request received</p>
                    <h3>Thank you. We have your request.</h3>
                    <p>
                      The PexPacks team will contact you to confirm availability,
                      payment, packing and delivery details.
                    </p>
                    <dl className={styles.successDetails}>
                      <div>
                        <dt>Reference</dt>
                        <dd>{orderReference}</dd>
                      </div>
                      <div>
                        <dt>Pack</dt>
                        <dd>{selectedPackTitle}</dd>
                      </div>
                      <div>
                        <dt>Contact method</dt>
                        <dd>{preferredContactMethod}</dd>
                      </div>
                    </dl>
                    <div className={styles.successActions}>
                      <Button href="/" variant="secondary">Back to Home</Button>
                      <Button href="/schools">Find another pack</Button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.paymentReadyCard}>
                    <p className={styles.confirmKicker}>Payment readiness</p>
                    <h3>Submit your order request</h3>
                    <p>
                      Online payment is not taken on this page yet. PexPacks will
                      confirm the final amount, invoice or payment instructions
                      before any payment is due.
                    </p>
                    <ul>
                      <li>Secure order request</li>
                      <li>Final price confirmed before payment</li>
                      <li>WhatsApp support available</li>
                    </ul>
                    {submitStatus && !submitStatus.success ? (
                      <p className={styles.formStatusError} role="alert">
                        {submitStatus.message}
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
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
        <div className={styles.mobileStickyCta}>
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

function CheckoutNavigation({
  activeStep,
  primaryLabel,
  primaryDisabled,
  onBack,
  onPrimary,
}: {
  activeStep: number;
  primaryLabel: string;
  primaryDisabled: boolean;
  onBack: () => void;
  onPrimary: () => void;
}) {
  return (
    <div className={styles.formActions}>
      <button type="button" onClick={onBack} disabled={activeStep === 0}>
        Back
      </button>
      <Button type="button" onClick={onPrimary} disabled={primaryDisabled}>
        {primaryLabel}
      </Button>
    </div>
  );
}

function ReviewBlock({
  title,
  children,
  onEdit,
}: {
  title: string;
  children: ReactNode;
  onEdit?: () => void;
}) {
  return (
    <section className={styles.reviewBlock}>
      <div>
        <p>{title}</p>
        {children}
      </div>
      {onEdit ? (
        <button type="button" onClick={onEdit}>
          Edit
        </button>
      ) : null}
    </section>
  );
}

function OrderSummary({
  packName,
  schoolName,
  gradeName,
  packKind,
  itemCount,
  estimatedTotal,
  fulfilmentOption,
  supportHref,
  summaryOpen,
  setSummaryOpen,
  hasPexcover,
}: {
  packName: string;
  schoolName?: string;
  gradeName?: string;
  packKind: string;
  itemCount: number;
  estimatedTotal?: number;
  fulfilmentOption: FulfilmentOption;
  supportHref: string;
  summaryOpen: boolean;
  setSummaryOpen: (open: boolean) => void;
  hasPexcover?: boolean;
}) {
  return (
    <aside className={styles.summaryColumn} aria-label="Order summary">
      <button
        className={styles.summaryToggle}
        type="button"
        aria-expanded={summaryOpen}
        onClick={() => setSummaryOpen(!summaryOpen)}
      >
        <span>
          {gradeName ?? "Pack"} · {itemCount || "Confirming"} items ·{" "}
          {typeof estimatedTotal === "number"
            ? formatCurrency(estimatedTotal)
            : "Total TBC"}
        </span>
        <strong>{summaryOpen ? "Hide" : "View summary"}</strong>
      </button>
      <div
        className={`${styles.summaryCard} ${summaryOpen ? styles.summaryCardOpen : ""}`}
      >
        <p className={styles.confirmKicker}>Your pack</p>
        <h2>{packName}</h2>
        <div className={styles.summaryMeta}>
          <span>{schoolName ?? "School to confirm"}</span>
          <span>{gradeName ?? "Grade to confirm"}</span>
          <span>{packKind}</span>
        </div>
        <dl className={styles.priceSummary}>
          <div>
            <dt>Selected items</dt>
            <dd>{itemCount || "Confirming"}</dd>
          </div>
          {hasPexcover ? (
            <div style={{ color: "var(--pex-keppel)", fontWeight: 700 }}>
              <dt>Pexcover book covering</dt>
              <dd>+ {formatCurrency(PEXCOVER_PRICE)}</dd>
            </div>
          ) : null}
          <div>
            <dt>Delivery / collection</dt>
            <dd>{fulfilmentOption}</dd>
          </div>
          <div>
            <dt>Estimated total</dt>
            <dd>
              {typeof estimatedTotal === "number"
                ? formatCurrency(estimatedTotal)
                : "To be confirmed"}
            </dd>
          </div>
        </dl>
        <p className={styles.summaryNote}>
          Final amount will be confirmed before payment. No online payment is
          taken on this page.
        </p>
        <ul className={styles.trustList}>
          <li>Packed according to the school list</li>
          <li>Customisable before submission</li>
          <li>Privacy-aware order request</li>
        </ul>
        {supportHref ? (
          <a className={styles.supportLink} href={supportHref}>
            Need help? Chat to PexPacks
          </a>
        ) : (
          <a className={styles.supportLink} href={ordersEmailHref}>
            Need help? Email {ordersEmail}
          </a>
        )}
      </div>
    </aside>
  );
}
