"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ordersEmail, ordersEmailHref } from "@/data/contact";
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

type OrderStepId =
  | "school"
  | "grade"
  | "pack"
  | "addons"
  | "details"
  | "confirm";

type OrderStep = {
  id: OrderStepId;
  label: string;
};

type StandardSelection = {
  mode: "standard" | "custom";
  phaseTitle: string;
  phaseSlug: string;
  pack: GradePackTemplate;
  customItems?: string;
  estimatedTotal?: number;
};

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

const schoolOrderSteps: OrderStep[] = [
  { id: "school", label: "Select school" },
  { id: "grade", label: "Select grade" },
  { id: "pack", label: "Confirm pack" },
  { id: "addons", label: "Add-ons" },
  { id: "details", label: "Enter details" },
  { id: "confirm", label: "Confirm order" },
];

const standardOrderSteps: OrderStep[] = [
  { id: "pack", label: "Confirm pack" },
  { id: "addons", label: "Add-ons" },
  { id: "details", label: "Enter details" },
  { id: "confirm", label: "Confirm order" },
];

const PEXCOVER_PRICE = 120;

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
  const formRef = useRef<HTMLFormElement>(null);
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

  const stepFlow = standardSelection ? standardOrderSteps : schoolOrderSteps;
  const steps = stepFlow.map((step) => step.label);
  const hasPreselectedSchoolPack =
    !standardSelection &&
    Boolean(effectiveInitialSchool && effectiveInitialGrade) &&
    (effectiveInitialPackType === "custom-school" ||
      effectiveInitialPackType === "full-school");

  const [activeStep, setActiveStep] = useState(hasPreselectedSchoolPack ? 2 : 0);
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
  const [deliveryPreference, setDeliveryPreference] =
    useState("School collection");
  const [preferredContactMethod, setPreferredContactMethod] =
    useState("whatsapp");
  const [consent, setConsent] = useState(false);
  const [hasPexcover, setHasPexcover] = useState(false);
  const [pexcoverName, setPexcoverName] = useState("");
  const [pexcoverSubjects, setPexcoverSubjects] = useState("");
  const [pexcoverLabelFormat, setPexcoverLabelFormat] = useState(
    "First Name + Surname"
  );
  const [pexcoverNotes, setPexcoverNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<ApiResponse | null>(null);
  const [orderReference, setOrderReference] = useState("");

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
    if (!orderDraft) {
      return;
    }

    if (
      !standardSelection &&
      (effectiveInitialPackType === "custom-school" ||
        effectiveInitialPackType === "full-school")
    ) {
      setActiveStep(2);
      setGradeSlug(effectiveInitialGrade);
    }
  }, [
    effectiveInitialGrade,
    effectiveInitialPackType,
    orderDraft,
    standardSelection,
  ]);

  const currentStep = stepFlow[activeStep]?.id ?? "confirm";

  const selectedGrade = useMemo(
    () =>
      selectedSchool?.grades.find((grade) => grade.gradeSlug === gradeSlug) ??
      null,
    [gradeSlug, selectedSchool]
  );

  const selectedPackTitle = standardSelection
    ? standardSelection.pack.title
    : `${selectedGrade?.grade ?? "Selected"} stationery pack`;
  const isCustomSchoolPack =
    !standardSelection && effectiveInitialPackType === "custom-school";
  const isFullSchoolPack =
    !standardSelection && effectiveInitialPackType === "full-school";
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
  const selectedPackNote = standardSelection
    ? standardSelection.mode === "custom"
      ? "Your customised pack has been prepared for checkout. The adjusted items below will be included in the enquiry."
      : "Your standard grade pack is already selected. Continue to add optional services and complete checkout details."
    : isCustomSchoolPack
      ? "Your customised school pack has been prepared. Continue to add optional services and complete checkout details."
      : isFullSchoolPack
        ? "Your full school pack is selected. Every item on the official list will be included in the enquiry."
    : (selectedGrade?.deliveryNote ?? "");

  useEffect(() => {
    if (standardSelection || !effectiveInitialSchool) {
      return;
    }

    let cancelled = false;
    setSchoolLoading(true);
    fetchSchoolDetails(effectiveInitialSchool)
      .then(({ school }) => {
        if (cancelled) {
          return;
        }
        setSelectedSchool(school);
        setSchoolQuery(school.name);
        setGradeSlug(effectiveInitialGrade || school.grades[0]?.gradeSlug || "");
      })
      .catch(() => {
        if (!cancelled) {
          setSchoolError("We could not load that school. Search for it below.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSchoolLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveInitialGrade, effectiveInitialSchool, standardSelection]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash === "#checkout-form") {
      const timer = setTimeout(() => {
        const el = document.getElementById("checkout-form");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 350);
      return () => clearTimeout(timer);
    }
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
          {
            signal: controller.signal,
          }
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
        if (!controller.signal.aborted) {
          setSchoolLoading(false);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [schoolQuery, schoolTouched, standardSelection]);

  function nextStep() {
    setActiveStep((step) => Math.min(step + 1, stepFlow.length - 1));
  }

  function previousStep() {
    setActiveStep((step) => Math.max(step - 1, 0));
  }

  async function selectSchool(result: SchoolSearchResult) {
    setSchoolLoading(true);
    setSchoolError("");

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

  function continueOrder() {
    if (currentStep === "school" && !selectedSchool) {
      setSchoolError("Please search and select a school before continuing.");
      return;
    }

    if (currentStep === "grade" && !selectedGrade) {
      setSchoolError("Please select a grade before continuing.");
      return;
    }

    if (currentStep === "details" && !formRef.current?.reportValidity()) {
      return;
    }

    setSchoolError("");
    setSubmitStatus(null);
    nextStep();
  }

  async function submitOrder() {
    if (!standardSelection && (!selectedSchool || !selectedGrade)) {
      setSubmitStatus({
        success: false,
        message:
          "Please select a school and grade before submitting your order enquiry.",
      });
      return;
    }

    setSubmitting(true);
    setSubmitStatus(null);

    const formData = formRef.current
      ? new FormData(formRef.current)
      : new FormData();
    const packType = standardSelection
      ? `${standardSelection.mode === "custom" ? "Customised" : "Standard"} ${standardSelection.pack.title}`
      : isCustomSchoolPack
        ? `Custom ${selectedGrade?.grade} stationery pack`
        : isFullSchoolPack
          ? `Full ${selectedGrade?.grade} stationery pack`
      : `${selectedGrade?.grade} stationery pack`;
    const standardPackMessage = standardSelection
      ? [
          `Selected route: ${standardSelection.mode === "custom" ? "customised standard pack" : "standard pack"}.`,
          `Phase: ${standardSelection.phaseTitle}.`,
          `Pack: ${standardSelection.pack.title}.`,
          typeof selectedPackPrice === "number"
            ? `Estimated pack total: ${formatCurrency(selectedPackPrice)}.`
            : null,
          standardSelection.customItems
            ? `Custom items: ${standardSelection.customItems}.`
            : null,
        ]
          .filter(Boolean)
          .join(" ")
      : "Please confirm availability, delivery or collection options, and payment instructions.";
    const selectedItemsMessage = selectedPackItems.length
      ? `Selected items: ${selectedPackItems.join("; ")}.`
      : "";
    const removedItemsMessage =
      isCustomSchoolPack && effectiveInitialRemovedItems
        ? `Removed items: ${effectiveInitialRemovedItems}.`
        : "";
    const submittedOrderReference = orderReference || createOrderReference();

    if (!orderReference) {
      setOrderReference(submittedOrderReference);
    }

    const pexcoverMessage = hasPexcover
      ? `\n\n--- PEXCOVER ADD-ON REQUESTED ---\nLearner: ${pexcoverName || buyerName}\nSubjects: ${
          pexcoverSubjects || "Standard"
        }\nLabel Format: ${pexcoverLabelFormat}\nNotes: ${pexcoverNotes || "None"}`
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
      schoolId: selectedSchool?.id ?? "",
      schoolName: standardSelection
        ? "Standard school phase pack"
        : (selectedSchool?.name ?? ""),
      grade: standardSelection
        ? standardSelection.pack.grade
        : (selectedGrade?.grade ?? ""),
      packType,
      selectedItems: selectedPackItems.join("; "),
      removedItems: effectiveInitialRemovedItems,
      estimatedTotal:
        typeof selectedPackPrice === "number" ? selectedPackPrice : undefined,
      orderReference: submittedOrderReference,
      orderDraftId: initialDraftId,
      preferredContactMethod,
      message: `Order reference: ${submittedOrderReference}. Delivery preference: ${deliveryPreference}. ${standardPackMessage} ${selectedItemsMessage} ${removedItemsMessage}${pexcoverMessage}`,
      consent,
      companyWebsite:
        typeof formData.get("companyWebsite") === "string"
          ? formData.get("companyWebsite")
          : "",
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      submittedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ApiResponse;
      setSubmitStatus(result);
    } catch {
      setSubmitStatus({
        success: false,
        message:
          "We could not submit your enquiry right now. Please try again or contact us directly.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.orderShell}>
      <div className={styles.orderPanel}>
        <OrderProgress steps={steps} activeStep={activeStep} />
        <div className={styles.checkoutSummary} aria-label="Checkout summary">
          <div>
            <span>Pack</span>
            <strong>{selectedPackTitle}</strong>
          </div>
          <div>
            <span>Items</span>
            <strong>{selectedPackItems.length || "Confirming"}</strong>
          </div>
          <div>
            <span>Estimated total</span>
            <strong>
              {typeof selectedPackPrice === "number"
                ? formatCurrency(selectedPackPrice + (hasPexcover ? PEXCOVER_PRICE : 0))
                : "To be confirmed"}
            </strong>
          </div>
          <div>
            <span>Reference</span>
            <strong>{orderReference || "Preparing"}</strong>
          </div>
        </div>
        <form className={styles.form} ref={formRef}>
          {currentStep === "school" ? (
            <div className={styles.schoolSearch}>
              <label htmlFor="order-school-search">
                <span>Select school</span>
              </label>
              <input
                id="order-school-search"
                name="orderSchoolSearch"
                type="search"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={schoolOpen}
                aria-controls="order-school-results"
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
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setSchoolOpen(false);
                  }
                }}
              />
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
                          aria-selected={selectedSchool?.slug === result.slug}
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
                      No matching schools found. Try a different name.
                    </p>
                  ) : null}
                </div>
              ) : null}
              {selectedSchool ? (
                <p className={styles.selectedSchool}>
                  Selected: <strong>{selectedSchool.name}</strong>
                </p>
              ) : null}
              {schoolError ? (
                <p className={styles.formStatusError} role="alert">
                  {schoolError}
                </p>
              ) : null}
            </div>
          ) : null}

          {currentStep === "grade" ? (
            <label htmlFor="order-grade-select">
              <span>Select grade</span>
              <select
                id="order-grade-select"
                name="orderGrade"
                value={gradeSlug}
                onChange={(event) => setGradeSlug(event.target.value)}
                required
              >
                <option value="">Choose a grade</option>
                {selectedSchool?.grades.map((grade) => (
                  <option value={grade.gradeSlug} key={grade.id}>
                    {grade.grade}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {currentStep === "pack" ? (
            <div className={styles.confirmPack} id="checkout-form">
              <p className={styles.confirmKicker}>Selected pack</p>
              <h2>{selectedPackTitle}</h2>
              {draftStatus ? (
                <p className={styles.formStatusError} role="alert">
                  {draftStatus}
                </p>
              ) : null}
              <p>{selectedPackNote}</p>
              {typeof selectedPackPrice === "number" ? (
                <p className={styles.priceNote}>
                  Estimated pack price: {formatCurrency(selectedPackPrice)}
                </p>
              ) : null}
              <ul>
                {selectedPackItems.slice(0, 8).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {currentStep === "addons" ? (
            <div className={styles.addonSection}>
              <p className={styles.confirmKicker}>Optional add-on services</p>

              <div
                className={`${styles.addonCard} ${hasPexcover ? styles.addonCardActive : ""}`}
              >
                <div className={styles.addonHeader}>
                  <div className={styles.addonTitle}>
                    <h3>Add Pexcover</h3>
                    <span className={styles.addonPrice}>
                      +{formatCurrency(PEXCOVER_PRICE)} per pack
                    </span>
                  </div>
                  <p>
                    Exercise books covered, labelled, and ready from day one.
                  </p>
                  <p className={styles.addonSubtext}>
                    Save time, protect schoolwork, and help your child start
                    organised.
                  </p>
                </div>

                <label className={styles.addonCheckbox}>
                  <input
                    type="checkbox"
                    checked={hasPexcover}
                    onChange={(event) => setHasPexcover(event.target.checked)}
                  />
                  <span>Yes, add Pexcover to this pack</span>
                </label>

                <p className={styles.addonNote}>
                  Pexcover applies to exercise books included in the selected
                  school pack.
                </p>

                {hasPexcover ? (
                  <div
                    className={styles.addonDetails}
                    aria-expanded={hasPexcover}
                  >
                    <p className={styles.addonDetailsHelper}>
                      Only complete these fields if you want specific name or
                      subject details written on the books.
                    </p>
                    <div className={styles.detailGrid}>
                      <label>
                        <span>Learner name to write on books</span>
                        <input
                          placeholder="e.g. John Doe"
                          value={pexcoverName}
                          onChange={(event) =>
                            setPexcoverName(event.target.value)
                          }
                        />
                      </label>
                      <label>
                        <span>Preferred label format</span>
                        <select
                          value={pexcoverLabelFormat}
                          onChange={(event) =>
                            setPexcoverLabelFormat(event.target.value)
                          }
                        >
                          <option>First Name + Surname</option>
                          <option>First Name + Initial</option>
                          <option>Initials + Surname</option>
                        </select>
                      </label>
                      <label className={styles.fullWidthField}>
                        <span>Subject names, if required by school</span>
                        <input
                          placeholder="e.g. English, Maths, Life Skills"
                          value={pexcoverSubjects}
                          onChange={(event) =>
                            setPexcoverSubjects(event.target.value)
                          }
                        />
                      </label>
                      <label className={styles.fullWidthField}>
                        <span>Special notes</span>
                        <input
                          placeholder="Any specific covering instructions?"
                          value={pexcoverNotes}
                          onChange={(event) =>
                            setPexcoverNotes(event.target.value)
                          }
                        />
                      </label>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {currentStep === "details" ? (
            <div className={styles.detailGrid}>
              <label>
                <span>Parent or buyer name</span>
                <input
                  name="name"
                  placeholder="Your full name"
                  required
                  value={buyerName}
                  onChange={(event) => setBuyerName(event.target.value)}
                />
              </label>
              <label>
                <span>Phone number</span>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+27"
                  required
                  value={buyerPhone}
                  onChange={(event) => setBuyerPhone(event.target.value)}
                />
              </label>
              <label>
                <span>Email address</span>
                <input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={buyerEmail}
                  onChange={(event) => setBuyerEmail(event.target.value)}
                />
              </label>
              <label>
                <span>Delivery preference</span>
                <select
                  name="delivery"
                  value={deliveryPreference}
                  onChange={(event) =>
                    setDeliveryPreference(event.target.value)
                  }
                >
                  <option>School collection</option>
                  <option>Home delivery</option>
                  <option>Office delivery</option>
                </select>
              </label>
              {deliveryPreference === "Home delivery" ? (
                <div className={styles.deliveryNotice}>
                  <p>
                    Home delivery incurs an additional delivery fee based on
                    your location. Please{" "}
                    <Link
                      href="/delivery-policy"
                      className={styles.deliveryPolicyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      read our Delivery Policy
                    </Link>{" "}
                    for more details on pricing and schedules.
                  </p>
                </div>
              ) : null}
              <label>
                <span>Preferred contact method</span>
                <select
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
              </label>
              <label className={styles.consentField}>
                <input
                  name="consent"
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                />
                <span>
                  I consent to Pexpacks using my information to contact me about
                  this enquiry and provide related support.{" "}
                  <Link href="/privacy-policy" className={styles.privacyLink}>
                    Privacy policy
                  </Link>
                </span>
              </label>
              <p className={styles.privacyNotice}>
                We only use your details to respond to your enquiry and manage
                your stationery pack request. You may contact Pexpacks to
                update, correct, or request deletion of your information.
              </p>
            </div>
          ) : null}

          {currentStep === "confirm" ? (
            <div className={styles.confirmPack}>
              <p className={styles.confirmKicker}>Final check</p>
              <h2>Confirm order</h2>
              <dl className={styles.finalSummary}>
                <div>
                  <dt>Pack</dt>
                  <dd>{selectedPackTitle}</dd>
                </div>
                <div>
                  <dt>Grade</dt>
                  <dd>
                    {standardSelection
                      ? standardSelection.pack.grade
                      : (selectedGrade?.grade ?? "Selected grade")}
                  </dd>
                </div>
                {typeof selectedPackPrice === "number" ? (
                <div>
                  <dt>Estimated total</dt>
                  <dd>
                      {formatCurrency(
                        selectedPackPrice + (hasPexcover ? PEXCOVER_PRICE : 0)
                      )}
                  </dd>
                </div>
              ) : null}
                <div>
                  <dt>Reference</dt>
                  <dd>{orderReference || "Preparing"}</dd>
                </div>
              </dl>
              <p>
                This is an enquiry order. No online payment is taken here.
                Pexpacks will confirm availability, delivery details and payment
                options. Order support is available at{" "}
                <a href={ordersEmailHref}>{ordersEmail}</a>.
              </p>
              {submitStatus ? (
                <p
                  className={
                    submitStatus.success
                      ? styles.formStatusSuccess
                      : styles.formStatusError
                  }
                  role={submitStatus.success ? "status" : "alert"}
                  aria-live="polite"
                >
                  {submitStatus.message}
                </p>
              ) : null}
            </div>
          ) : null}

          <label className={styles.honeypot} aria-hidden="true">
            Company website
            <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
          </label>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={previousStep}
              disabled={activeStep === 0}
            >
              Back
            </button>
            <Button
              type="button"
              onClick={
                activeStep === stepFlow.length - 1 ? submitOrder : continueOrder
              }
              disabled={
                submitting || (currentStep === "school" && schoolLoading)
              }
            >
              {activeStep === stepFlow.length - 1
                ? submitting
                  ? "Submitting enquiry"
                  : "Submit order enquiry"
                : "Continue"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
