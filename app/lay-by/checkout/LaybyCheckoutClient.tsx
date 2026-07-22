"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import { calculateTrayTotal } from "@/lib/order/calculateTrayTotal";
import { formatCurrency } from "@/lib/formatCurrency";
import { PEXCOVER_PRICE } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import checkoutStyles from "@/app/checkout/Checkout.module.css";
import styles from "./LaybyCheckout.module.css";

type FulfilmentOption = "school_collection" | "home_delivery" | "arranged_collection";
type ContactMethod = "whatsapp" | "phone" | "email";
type CheckoutSummarySection = "order" | "details" | "delivery";

const contactOptions: { value: ContactMethod; label: string }[] = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone", label: "Phone call" },
  { value: "email", label: "Email" },
];

const MONTH_LABELS = ["June", "July", "August", "September", "October"] as const;

function getScheduleMonths(term: number) {
  return MONTH_LABELS.slice(0, term).map((label, i) => ({
    label,
    subtitle: i === 0 ? "Deposit" : i === term - 1 ? "Final" : "Instalment",
  }));
}

function computeInstalmentplan(total: number, term: number) {
  const base = Math.ceil(total / term);
  const remainder = total - base * (term - 1);
  const instalments = Array.from({ length: term - 1 }, () => base);
  return { deposit: base, instalments, final: remainder > 0 ? remainder : base };
}

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

function getPackTotal(pack: ReturnType<typeof usePackTrayStore.getState>["packs"][number]) {
  return pack.totalPrice + (pack.wantsPexcover ? PEXCOVER_PRICE : 0);
}

function getPackItemPreview(pack: ReturnType<typeof usePackTrayStore.getState>["packs"][number]) {
  return pack.items.slice(0, 4);
}

export function LaybyCheckoutClient() {
  const router = useRouter();
  const packs = usePackTrayStore((s) => s.packs);
  const openTray = usePackTrayStore((s) => s.openTray);
  const updatePackDetails = usePackTrayStore((s) => s.updatePackDetails);

  const [learnerInputs, setLearnerInputs] = useState<string[]>(() =>
    packs.map((p) => p.learnerName || "")
  );
  const [fullName, setFullName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] =
    useState<ContactMethod>("whatsapp");
  const [fulfilmentOption, setFulfilmentOption] = useState<FulfilmentOption>("school_collection");
  const [multiSchoolDrop, setMultiSchoolDrop] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [suburb, setSuburb] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [ageConfirmation, setAgeConfirmation] = useState(false);
  const [settlementConfirmation, setSettlementConfirmation] = useState(false);
  const [cancellationConfirmation, setCancellationConfirmation] = useState(false);
  const [consent, setConsent] = useState(false);
  const [typedSignature, setTypedSignature] = useState("");
  const [signatureDay, setSignatureDay] = useState("");
  const [signatureMonth, setSignatureMonth] = useState("");
  const [signatureYear, setSignatureYear] = useState("");
  const signatureDate = useMemo(() => {
    if (!signatureDay || !signatureMonth || !signatureYear) return "";
    const dd = signatureDay.padStart(2, "0");
    return `${signatureYear}-${signatureMonth}-${dd}`;
  }, [signatureDay, signatureMonth, signatureYear]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState(5);
  const [expandedPacks, setExpandedPacks] = useState<Record<string, boolean>>(
    {},
  );
  const [mobileSectionSummaryOpen, setMobileSectionSummaryOpen] = useState<
    Record<CheckoutSummarySection, boolean>
  >({
    order: true,
    details: true,
    delivery: true,
  });
  const fieldRefs = useRef<
    Record<string, HTMLInputElement | HTMLTextAreaElement | null>
  >({});
  const sectionRefs = useRef<
    Record<CheckoutSummarySection, HTMLElement | null>
  >({
    order: null,
    details: null,
    delivery: null,
  });
  const consentRef = useRef<HTMLElement | null>(null);
  const summaryRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setLearnerInputs((prev) => {
      if (prev.length === packs.length) return prev;
      return packs.map((pack, index) => prev[index] ?? pack.learnerName ?? "");
    });
  }, [packs]);

  const total = useMemo(() => calculateTrayTotal(packs), [packs]);
  const plan = useMemo(() => computeInstalmentplan(total, selectedTerm), [total, selectedTerm]);
  const scheduleMonths = useMemo(() => getScheduleMonths(selectedTerm), [selectedTerm]);

  const dateDayOptions = useMemo(() => Array.from({ length: 31 }, (_, i) => String(i + 1)), []);
  const dateMonthOptions = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];
  const dateYearOptions = ["2026"];

  const deliveryExpanded = fulfilmentOption === "home_delivery";
  const deliveryAddressSummary = [address, suburb, city, province, postalCode].filter(Boolean).join(", ");

  const uniqueSchools = useMemo(() => {
    const map = new Map<string, { name: string; slug: string }>();
    packs.forEach((p) => {
      if (p.schoolSlug && p.schoolName && !map.has(p.schoolSlug)) {
        map.set(p.schoolSlug, { name: p.schoolName, slug: p.schoolSlug });
      }
    });
    return Array.from(map.values());
  }, [packs]);

  const isSingleSchool = uniqueSchools.length <= 1;

  useEffect(() => {
    if (isSingleSchool && fulfilmentOption === "school_collection") {
      setMultiSchoolDrop(uniqueSchools[0]?.slug ?? null);
    }
  }, [fulfilmentOption, isSingleSchool, uniqueSchools]);

  const handleBackToOrder = useCallback(() => {
    openTray();
    router.back();
  }, [openTray, router]);

  function clearFieldError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  const orderSectionHasErrors = Object.keys(errors).some((key) =>
    key.startsWith("learner_"),
  );
  const detailsSectionHasErrors = Boolean(
    errors.fullName || errors.buyerPhone || errors.buyerEmail,
  );
  const deliverySectionHasErrors = Boolean(
    errors.address ||
      errors.suburb ||
      errors.city ||
      errors.province ||
      errors.multiSchoolDrop,
  );
  const showOrderHiddenWarning =
    orderSectionHasErrors && !mobileSectionSummaryOpen.order;
  const showDetailsHiddenWarning =
    detailsSectionHasErrors && !mobileSectionSummaryOpen.details;
  const showDeliveryHiddenWarning =
    deliverySectionHasErrors && !mobileSectionSummaryOpen.delivery;

  const toggleMobileSectionSummary = useCallback(
    (section: CheckoutSummarySection) => {
      setMobileSectionSummaryOpen((current) => ({
        ...current,
        [section]: !current[section],
      }));
    },
    [],
  );

  function getSectionForError(field: string): CheckoutSummarySection | null {
    if (field.startsWith("learner_")) return "order";
    if (field === "fullName" || field === "buyerPhone" || field === "buyerEmail")
      return "details";
    if (
      field === "address" ||
      field === "suburb" ||
      field === "city" ||
      field === "province" ||
      field === "multiSchoolDrop"
    )
      return "delivery";
    return null;
  }

  function guideToIncompleteField(field: string) {
    const section = getSectionForError(field);
    if (section) {
      setMobileSectionSummaryOpen((current) => ({
        ...current,
        [section]: true,
      }));
    }
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const fieldNode = fieldRefs.current[field];
        const target =
          fieldNode ||
          (section ? sectionRefs.current[section] : null) ||
          (field === "consent" ? consentRef.current : null);
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
        if (fieldNode) {
          fieldNode.focus({ preventScroll: true });
        } else if (target instanceof HTMLElement) {
          target.focus({ preventScroll: true });
        }
      });
    });
  }

  function validate(): boolean {
    const next: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2)
      next.fullName = "Please enter your full name.";
    if (!buyerPhone.trim())
      next.buyerPhone = "Please enter your phone number.";
    else if (!isLikelySaPhone(buyerPhone))
      next.buyerPhone = "Please enter a valid South African phone number.";
    if (!buyerEmail.trim())
      next.buyerEmail = "Please enter your email address.";
    else if (!isValidEmail(buyerEmail.trim()))
      next.buyerEmail = "Please enter a valid email address.";

    for (let i = 0; i < packs.length; i++) {
      if (!learnerInputs[i]?.trim()) {
        next[`learner_${i}`] = `Please enter a name for learner ${i + 1}.`;
      }
    }

    if (deliveryExpanded) {
      if (!address.trim()) next.address = "Please enter the delivery address.";
      if (!suburb.trim()) next.suburb = "Please enter the suburb.";
      if (!city.trim()) next.city = "Please enter the city.";
      if (!province.trim()) next.province = "Please enter the province.";
    }

    if (
      fulfilmentOption === "school_collection" &&
      uniqueSchools.length > 1 &&
      !multiSchoolDrop
    ) {
      next.multiSchoolDrop =
        "Select which school the box should be dropped at.";
    }

    if (!ageConfirmation)
      next.ageConfirmation = "Please confirm that you are authorised to enter this lay-by agreement.";
    if (!settlementConfirmation)
      next.settlementConfirmation = "Please confirm that the lay-by settlement date is understood.";
    if (!cancellationConfirmation)
      next.cancellationConfirmation = "Please confirm that the cancellation terms are understood.";
    if (!consent)
      next.consent = "Please accept the lay-by processing and legal terms consent.";
    if (!typedSignature.trim() || typedSignature.trim().length < 2)
      next.typedSignature = "Please type your full legal name.";
    if (!signatureDay)
      next.signatureDay = "Please select the signature day.";
    if (!signatureMonth)
      next.signatureMonth = "Please select the signature month.";
    if (!signatureYear)
      next.signatureYear = "Please select the signature year.";

    setErrors(next);

    const firstError = Object.keys(next)[0];
    if (firstError) {
      guideToIncompleteField(firstError);
    }

    return Object.keys(next).length === 0;
  }

  async function handlePayDeposit() {
    if (submitting) return;
    if (!validate()) return;

    setSubmitError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/layby/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName: fullName.trim(),
          buyerEmail: buyerEmail.trim().toLowerCase(),
          buyerPhone: normalisePhone(buyerPhone),
          packs: packs.map((pack, pi) => ({
            learnerName: learnerInputs[pi]?.trim() || pack.learnerName?.trim() || "",
            schoolSlug: pack.schoolSlug || "",
            schoolName: pack.schoolName || "",
            grade: pack.grade || "",
            gradeSlug: pack.gradeSlug || "",
            packName: pack.packName,
            packMode: pack.packMode,
            items: pack.items.map((i) => ({
              name: i.name,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
            })),
            totalPrice: pack.totalPrice,
            wantsPexcover: pack.wantsPexcover || false,
            pexcoverPrice: pack.wantsPexcover ? PEXCOVER_PRICE : 0,
            basePackPrice: pack.totalPrice,
          })),
          fullTotal: total,
          depositAmount: plan.deposit,
          estimatedTotal: total,
          deliveryMethod:
            fulfilmentOption === "school_collection"
              ? "school_collection"
              : fulfilmentOption === "home_delivery"
                ? "delivery"
                : "collection_point",
          primarySchoolSlug:
            uniqueSchools.length > 1
              ? multiSchoolDrop
              : uniqueSchools[0]?.slug || packs[0]?.schoolSlug || "",
          notes: [
            deliveryNotes.trim() ? `Notes: ${deliveryNotes.trim()}` : "",
            deliveryExpanded ? `Address: ${deliveryAddressSummary}` : "",
            preferredContactMethod
              ? `Preferred contact: ${preferredContactMethod}`
              : "",
            typedSignature.trim() ? `Signed by: ${typedSignature.trim()}` : "",
            signatureDate ? `Signature date: ${signatureDate}` : "",
          ]
            .filter(Boolean)
            .join(" | ") || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.checkoutUrl) {
        throw new Error(
          result.error || "We could not process your deposit. Please try again."
        );
      }

      window.location.href = result.checkoutUrl;
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We could not process your deposit. Please try again or contact Pexpacks."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (packs.length === 0) {
    return (
      <div className={`${checkoutStyles.checkoutShell} ${styles.page}`}>
        <div className={checkoutStyles.emptyCheckout}>
          <p className={checkoutStyles.checkoutKicker}>Lay-by Checkout</p>
          <h1>No packs in your order.</h1>
          <p>Choose a school pack and add it to your order before starting a lay-by plan.</p>
          <Button href="/schools" variant="primary" size="lg">
            Find a School Pack
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${checkoutStyles.checkoutShell} ${styles.page}`}>
      <header className={checkoutStyles.checkoutHeader}>
        <button
          type="button"
          className={checkoutStyles.backToOrder}
          onClick={handleBackToOrder}
        >
          Back to order
        </button>
        <a
          href="https://wa.me/27763456622?text=Hi Pexpacks, I need help with lay-by checkout."
          target="_blank"
          rel="noopener noreferrer"
          className={checkoutStyles.helpLink}
        >
          Need help?
        </a>
      </header>

      <div className={checkoutStyles.checkoutGrid}>
        {/* ── Hero ── */}
        <section className={`${checkoutStyles.stepCard} ${checkoutStyles.checkoutHero}`}>
          <p className={checkoutStyles.checkoutKicker}>Lay-by Plan</p>
          <h1 tabIndex={-1}>Pay over time, secure your pack today</h1>
          <p>
            Spread the cost of your school stationery over <strong>5 months</strong> with{" "}
            <strong>0% interest</strong>. Your deposit is your first month&rsquo;s payment.
            Settle by the end of October and we pack in time for January.
          </p>
        </section>

        <form
          className={checkoutStyles.mainColumn}
          aria-label="Lay-by checkout details"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* ── Order Summary (Section 1) ── */}
          <section
            ref={(node) => { sectionRefs.current.order = node }}
            tabIndex={-1}
            className={`${checkoutStyles.checkoutSection} ${
              showOrderHiddenWarning ? checkoutStyles.checkoutSectionWarning : ""
            }`}
            aria-labelledby="layby-order-heading"
          >
            <div className={checkoutStyles.sectionHeader}>
              <span className={checkoutStyles.sectionNumber}>1</span>
              <div>
                <h2 id="layby-order-heading">Your Order</h2>
                <p>Review the packs included in your lay-by plan.</p>
              </div>
              <button
                type="button"
                className={checkoutStyles.mobileSummaryToggle}
                onClick={() => toggleMobileSectionSummary("order")}
                aria-expanded={mobileSectionSummaryOpen.order}
                aria-controls="layby-order-summary"
              >
                {mobileSectionSummaryOpen.order ? "Hide Summary" : "View Summary"}
              </button>
            </div>
            <div
              id="layby-order-summary"
              className={`${checkoutStyles.mobileCollapsibleSummary} ${
                mobileSectionSummaryOpen.order
                  ? checkoutStyles.mobileCollapsibleSummaryOpen
                  : ""
              }`}
            >
              <div className={checkoutStyles.orderSummaryList}>
                {packs.map((pack, index) => {
                  const isExpanded = !!expandedPacks[pack.id];
                  const previewItems = getPackItemPreview(pack);
                  const hiddenCount = Math.max(
                    pack.items.length - previewItems.length,
                    0,
                  );
                  return (
                    <article key={pack.id} className={checkoutStyles.orderPackCard}>
                      <div className={checkoutStyles.orderPackTop}>
                        <div className={styles.orderLearnerLine}>
                          <label htmlFor={`learner-${pack.id}`}>
                            Learner {index + 1}:
                          </label>
                          <input
                            id={`learner-${pack.id}`}
                            ref={(node) => {
                              fieldRefs.current[`learner_${index}`] = node;
                            }}
                            className={`${styles.orderLearnerInput} ${
                              errors[`learner_${index}`] ? styles.orderLearnerInputError : ""
                            }`}
                            type="text"
                            placeholder="Add learner name"
                            value={learnerInputs[index] || ""}
                            onBlur={() => {
                              const name = learnerInputs[index]?.trim() || "";
                              if (name !== (pack.learnerName || "")) {
                                updatePackDetails(
                                  pack.id,
                                  name,
                                  pack.wantsPexcover || false,
                                );
                              }
                            }}
                            onChange={(e) => {
                              const next = [...learnerInputs];
                              next[index] = e.target.value;
                              setLearnerInputs(next);
                              clearFieldError(`learner_${index}`);
                            }}
                          />
                        </div>
                        <strong className={checkoutStyles.orderPackPrice}>
                          {formatCurrency(getPackTotal(pack))}
                        </strong>
                      </div>
                      <div className={checkoutStyles.orderPackBody}>
                        <h3>{pack.packName}</h3>
                        <p>
                          {pack.schoolName || "School pack"}
                          {pack.grade ? ` \u00b7 ${pack.grade}` : ""}
                        </p>
                        <div className={checkoutStyles.orderPackBadges}>
                          <span>
                            {pack.packMode === "full"
                              ? "Full pack"
                              : "Customised"}
                          </span>
                          <span>
                            {pack.items.length}{" "}
                            {pack.items.length === 1 ? "item" : "items"}
                          </span>
                          {pack.wantsPexcover ? <span>Pexcover</span> : null}
                        </div>
                        {errors[`learner_${index}`] ? (
                          <p className={checkoutStyles.fieldError}>
                            {errors[`learner_${index}`]}
                          </p>
                        ) : null}
                        <button
                          type="button"
                          className={checkoutStyles.itemsToggle}
                          onClick={() =>
                            setExpandedPacks((current) => ({
                              ...current,
                              [pack.id]: !current[pack.id],
                            }))
                          }
                          aria-expanded={isExpanded}
                          aria-controls={`layby-pack-items-${pack.id}`}
                        >
                          <span>{isExpanded ? "Hide items" : "View items"}</span>
                          <span aria-hidden="true">{isExpanded ? "-" : "+"}</span>
                        </button>
                        {isExpanded ? (
                          <ul
                            id={`layby-pack-items-${pack.id}`}
                            className={checkoutStyles.itemisedList}
                          >
                            {previewItems.map((item) => (
                              <li key={item.id}>
                                <span>{item.name}</span>
                                <span>x{item.quantity}</span>
                                <strong>
                                  {typeof item.unitPrice === "number"
                                    ? formatCurrency(
                                        item.unitPrice * item.quantity,
                                      )
                                    : "Included"}
                                </strong>
                              </li>
                            ))}
                            {pack.wantsPexcover ? (
                              <li className={checkoutStyles.itemisedPexcover}>
                                <span>
                                  Pexcover <em>(Book covering)</em>
                                </span>
                                <span />
                                <strong>{formatCurrency(PEXCOVER_PRICE)}</strong>
                              </li>
                            ) : null}
                            {hiddenCount > 0 ? (
                              <li className={checkoutStyles.itemisedMore}>
                                +{hiddenCount} more items
                              </li>
                            ) : null}
                          </ul>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
            {showOrderHiddenWarning ? (
              <p className={checkoutStyles.mobileHiddenSummaryWarning} role="alert">
                Fill in learner names (Click "View Summary")
              </p>
            ) : null}
          </section>

          {/* ── Your Details (Section 2) ── */}
          <section
            ref={(node) => { sectionRefs.current.details = node }}
            tabIndex={-1}
            className={`${checkoutStyles.checkoutSection} ${
              showDetailsHiddenWarning ? checkoutStyles.checkoutSectionWarning : ""
            }`}
            aria-labelledby="layby-details-heading"
          >
            <div className={checkoutStyles.sectionHeader}>
              <span className={checkoutStyles.sectionNumber}>2</span>
              <div>
                <h2 id="layby-details-heading">Your details</h2>
                <p>We use these for order updates and payment confirmations.</p>
              </div>
              <button
                type="button"
                className={checkoutStyles.mobileSummaryToggle}
                onClick={() => toggleMobileSectionSummary("details")}
                aria-expanded={mobileSectionSummaryOpen.details}
                aria-controls="layby-details-summary"
              >
                {mobileSectionSummaryOpen.details ? "Hide Summary" : "View Summary"}
              </button>
            </div>
            <div
              id="layby-details-summary"
              className={`${checkoutStyles.mobileCollapsibleSummary} ${
                mobileSectionSummaryOpen.details
                  ? checkoutStyles.mobileCollapsibleSummaryOpen
                  : ""
              }`}
            >
            <div className={checkoutStyles.formGrid}>
              <Input
                id="fullName"
                ref={(node) => { fieldRefs.current.fullName = node }}
                label="Full name"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  clearFieldError("fullName");
                }}
                placeholder="e.g. Sarah Dlamini"
                error={errors.fullName}
                autoComplete="name"
              />
              <Input
                id="buyerPhone"
                ref={(node) => { fieldRefs.current.buyerPhone = node }}
                label="Phone number"
                type="tel"
                value={buyerPhone}
                onChange={(e) => {
                  setBuyerPhone(e.target.value);
                  clearFieldError("buyerPhone");
                }}
                placeholder="e.g. 078 003 6048"
                error={errors.buyerPhone}
                autoComplete="tel"
              />
              <Input
                id="buyerEmail"
                ref={(node) => { fieldRefs.current.buyerEmail = node }}
                label="Email address"
                type="email"
                value={buyerEmail}
                onChange={(e) => {
                  setBuyerEmail(e.target.value);
                  clearFieldError("buyerEmail");
                }}
                placeholder="name@example.com"
                error={errors.buyerEmail}
                autoComplete="email"
              />
              <fieldset className={checkoutStyles.contactMethodGroup}>
                <legend>Preferred contact method</legend>
                <p>
                  Choose how we should reach you about lay-by reminders and
                  pack updates.
                </p>
                <div className={checkoutStyles.segmentedOptions}>
                  {contactOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`${checkoutStyles.segmentedOption} ${
                        preferredContactMethod === option.value
                          ? checkoutStyles.segmentedOptionActive
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="preferredContactMethod"
                        value={option.value}
                        checked={preferredContactMethod === option.value}
                        onChange={() =>
                          setPreferredContactMethod(option.value)
                        }
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
            </div>
            {showDetailsHiddenWarning ? (
              <p className={checkoutStyles.mobileHiddenSummaryWarning} role="alert">
                Fill in your details (Click "View Summary")
              </p>
            ) : null}
          </section>

          {/* ── Delivery / Collection (Section 3) ── */}
          <section
            ref={(node) => { sectionRefs.current.delivery = node }}
            tabIndex={-1}
            className={`${checkoutStyles.checkoutSection} ${
              showDeliveryHiddenWarning ? checkoutStyles.checkoutSectionWarning : ""
            }`}
            aria-labelledby="layby-fulfilment-heading"
          >
            <div className={checkoutStyles.sectionHeader}>
              <span className={checkoutStyles.sectionNumber}>3</span>
              <div>
                <h2 id="layby-fulfilment-heading">Delivery or collection</h2>
                <p>Choose how you want to receive your pack once the balance is settled.</p>
              </div>
              <button
                type="button"
                className={checkoutStyles.mobileSummaryToggle}
                onClick={() => toggleMobileSectionSummary("delivery")}
                aria-expanded={mobileSectionSummaryOpen.delivery}
                aria-controls="layby-fulfilment-summary"
              >
                {mobileSectionSummaryOpen.delivery ? "Hide Summary" : "View Summary"}
              </button>
            </div>
            <div
              id="layby-fulfilment-summary"
              className={`${checkoutStyles.mobileCollapsibleSummary} ${
                mobileSectionSummaryOpen.delivery
                  ? checkoutStyles.mobileCollapsibleSummaryOpen
                  : ""
              }`}
            >
            <fieldset className={checkoutStyles.optionFieldset}>
              <legend className={checkoutStyles.srOnly}>Delivery or collection method</legend>
              <div className={checkoutStyles.deliveryOptions}>
                {[
                  {
                    value: "school_collection" as const,
                    title: "School collection",
                    desc: "Collect from the school or agreed handover point.",
                    note: "Included",
                  },
                  {
                    value: "home_delivery" as const,
                    title: "Home delivery",
                    desc: "Receive your packs at home. Address required.",
                    note: "Address required",
                  },
                  {
                    value: "arranged_collection" as const,
                    title: "Arranged collection",
                    desc: "We will contact you to confirm the best option.",
                    note: "We will confirm",
                  },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`${checkoutStyles.deliveryOption} ${
                      fulfilmentOption === opt.value ? checkoutStyles.deliveryOptionSelected : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="fulfilment"
                      value={opt.value}
                      checked={fulfilmentOption === opt.value}
                      onChange={() => setFulfilmentOption(opt.value)}
                    />
                    <div className={checkoutStyles.deliveryOptionHeader}>
                      <span className={checkoutStyles.deliveryIcon}>
                        {opt.value === "school_collection" ? (
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                        ) : opt.value === "home_delivery" ? (
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <rect x="1" y="3" width="15" height="13" rx="2" />
                            <path d="M16 8h4l3 3v5h-7V8Z" />
                            <circle cx="5.5" cy="18.5" r="2.5" />
                            <circle cx="18.5" cy="18.5" r="2.5" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <rect x="3" y="5" width="18" height="14" rx="2" />
                            <path d="M3 10h18M7 15h4" />
                          </svg>
                        )}
                      </span>
                      <strong>{opt.title}</strong>
                    </div>
                    <p className={checkoutStyles.deliveryDescription}>{opt.desc}</p>
                    <span className={checkoutStyles.deliveryBadge}>{opt.note}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {fulfilmentOption === "school_collection" &&
            uniqueSchools.length > 1 ? (
              <div className={checkoutStyles.schoolDropoffGroup}>
                <p className={checkoutStyles.schoolDropoffLabel}>
                  Which school should the main box be dropped at?
                </p>
                <div className={checkoutStyles.schoolDropoffRow}>
                  {uniqueSchools.map((school) => {
                    const isSelected = multiSchoolDrop === school.slug;
                    return (
                      <label
                        key={school.slug}
                        className={`${checkoutStyles.schoolDropoffCard} ${
                          isSelected ? checkoutStyles.schoolDropoffCardActive : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="multiSchoolDrop"
                          value={school.slug}
                          checked={isSelected}
                          onChange={() => {
                            setMultiSchoolDrop(school.slug);
                            clearFieldError("multiSchoolDrop");
                          }}
                          className={checkoutStyles.schoolDropoffRadio}
                        />
                        <span className={checkoutStyles.schoolDropoffText}>
                          {school.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {errors.multiSchoolDrop ? (
                  <p className={checkoutStyles.fieldError}>
                    {errors.multiSchoolDrop}
                  </p>
                ) : null}
              </div>
            ) : null}

            {deliveryExpanded && (
              <p className={styles.deliveryCostNote}>
                Please note that home delivery incurs a separate fee based on
                your location.<span className={styles.brDesktop} />We will
                WhatsApp you to confirm the exact courier costs.
              </p>
            )}

            {deliveryExpanded ? (
              <div className={checkoutStyles.addressPanel}>
                <Input
                  id="address"
                  ref={(node) => { fieldRefs.current.address = node }}
                  label="Address line"
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    clearFieldError("address");
                  }}
                  placeholder="e.g. 42 Main Road"
                  error={errors.address}
                />
                <Input
                  id="suburb"
                  ref={(node) => { fieldRefs.current.suburb = node }}
                  label="Suburb"
                  type="text"
                  value={suburb}
                  onChange={(e) => {
                    setSuburb(e.target.value);
                    clearFieldError("suburb");
                  }}
                  placeholder="e.g. Gardens"
                  error={errors.suburb}
                />
                <Input
                  id="city"
                  ref={(node) => { fieldRefs.current.city = node }}
                  label="City"
                  type="text"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    clearFieldError("city");
                  }}
                  placeholder="e.g. Cape Town"
                  error={errors.city}
                />
                <Input
                  id="province"
                  ref={(node) => { fieldRefs.current.province = node }}
                  label="Province"
                  type="text"
                  value={province}
                  onChange={(e) => {
                    setProvince(e.target.value);
                    clearFieldError("province");
                  }}
                  placeholder="e.g. Western Cape"
                  error={errors.province}
                />
                <Input
                  id="postalCode"
                  label="Postal code"
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 8001"
                />
              </div>
            ) : null}
            <Textarea
              id="deliveryNotes"
              label="Delivery notes (optional)"
              helper="Add gate codes, collection notes, or anything the Pexpacks team should know."
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              rows={4}
              className={checkoutStyles.deliveryNotesField}
            />
            </div>
            {showDeliveryHiddenWarning ? (
              <p className={checkoutStyles.mobileHiddenSummaryWarning} role="alert">
                Fill in delivery details (Click "View Summary")
              </p>
            ) : null}
          </section>

          {/* ── Declarations and signature ── */}
          <section
            ref={consentRef}
            tabIndex={-1}
            className={styles.declarationCard}
            aria-labelledby="layby-declarations-heading"
          >
            <h2 id="layby-declarations-heading">Declarations and signature</h2>
            <div className={styles.declarationList}>
              <label className={styles.declarationOption}>
                <input
                  ref={(node) => {
                    fieldRefs.current.ageConfirmation = node;
                  }}
                  type="checkbox"
                  id="ageConfirmation"
                  name="ageConfirmation"
                  checked={ageConfirmation}
                  onChange={(e) => {
                    setAgeConfirmation(e.target.checked);
                    clearFieldError("ageConfirmation");
                  }}
                  aria-invalid={!!errors.ageConfirmation}
                />
                <span>
                  I confirm that I am 18 years or older and authorised to enter
                  into this lay-by agreement.
                </span>
              </label>
              {errors.ageConfirmation ? (
                <p className={checkoutStyles.fieldError}>{errors.ageConfirmation}</p>
              ) : null}

              <label className={styles.declarationOption}>
                <input
                  ref={(node) => {
                    fieldRefs.current.settlementConfirmation = node;
                  }}
                  type="checkbox"
                  id="settlementConfirmation"
                  name="settlementConfirmation"
                  checked={settlementConfirmation}
                  onChange={(e) => {
                    setSettlementConfirmation(e.target.checked);
                    clearFieldError("settlementConfirmation");
                  }}
                  aria-invalid={!!errors.settlementConfirmation}
                />
                <span>
                  I understand that the lay-by must be fully settled by October
                  31st for January packing and delivery.
                </span>
              </label>
              {errors.settlementConfirmation ? (
                <p className={checkoutStyles.fieldError}>
                  {errors.settlementConfirmation}
                </p>
              ) : null}

              <label className={styles.declarationOption}>
                <input
                  ref={(node) => {
                    fieldRefs.current.cancellationConfirmation = node;
                  }}
                  type="checkbox"
                  id="cancellationConfirmation"
                  name="cancellationConfirmation"
                  checked={cancellationConfirmation}
                  onChange={(e) => {
                    setCancellationConfirmation(e.target.checked);
                    clearFieldError("cancellationConfirmation");
                  }}
                  aria-invalid={!!errors.cancellationConfirmation}
                />
                <span>
                  I understand that cancellation before completion allows a
                  refund of instalments paid, less the standard 1% cancellation
                  penalty permitted by law.
                </span>
              </label>
              {errors.cancellationConfirmation ? (
                <p className={checkoutStyles.fieldError}>
                  {errors.cancellationConfirmation}
                </p>
              ) : null}

              <label className={styles.declarationOption}>
                <input
                  ref={(node) => {
                    fieldRefs.current.consent = node;
                  }}
                  type="checkbox"
                  id="layby-consent"
                  name="consent"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    clearFieldError("consent");
                  }}
                  aria-invalid={!!errors.consent}
                />
                <span>
                  I consent to Pexpacks processing this information to prepare
                  and manage my lay-by application, in line with the{" "}
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                    privacy policy
                  </a>
                  ,{" "}
                  <a href="/terms" target="_blank" rel="noopener noreferrer">
                    terms of use
                  </a>
                  ,{" "}
                  <a href="/delivery-policy" target="_blank" rel="noopener noreferrer">
                    delivery policy
                  </a>
                  ,{" "}
                  <a href="/lay-by-terms" target="_blank" rel="noopener noreferrer">
                    lay-by terms
                  </a>
                  , and{" "}
                  <a
                    href="/returns-refunds-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    returns &amp; refunds policy
                  </a>
                  .
                </span>
              </label>
              {errors.consent ? (
                <p className={checkoutStyles.fieldError}>{errors.consent}</p>
              ) : null}
            </div>

            <div className={styles.signatureGrid}>
              <Input
                id="typedSignature"
                name="typedSignature"
                ref={(node) => {
                  fieldRefs.current.typedSignature = node;
                }}
                label="Typed signature"
                type="text"
                value={typedSignature}
                onChange={(e) => {
                  setTypedSignature(e.target.value);
                  clearFieldError("typedSignature");
                }}
                placeholder="Type your full legal name"
                error={errors.typedSignature}
                autoComplete="name"
              />
              <div className={styles.dateSelectsGrid}>
                <Select
                  id="signatureDay"
                  name="signatureDay"
                  label="Day"
                  placeholder="Day"
                  options={dateDayOptions}
                  value={signatureDay}
                  onValueChange={(v) => {
                    setSignatureDay(v);
                    clearFieldError("signatureDay");
                  }}
                  error={errors.signatureDay}
                />
                <Select
                  id="signatureMonth"
                  name="signatureMonth"
                  label="Month"
                  placeholder="Month"
                  options={dateMonthOptions}
                  value={signatureMonth}
                  onValueChange={(v) => {
                    setSignatureMonth(v);
                    clearFieldError("signatureMonth");
                  }}
                  error={errors.signatureMonth}
                />
                <Select
                  id="signatureYear"
                  name="signatureYear"
                  label="Year"
                  placeholder="Year"
                  options={dateYearOptions}
                  value={signatureYear}
                  onValueChange={(v) => {
                    setSignatureYear(v);
                    clearFieldError("signatureYear");
                  }}
                  error={errors.signatureYear}
                />
              </div>
            </div>
          </section>

          {submitError ? (
            <p className={checkoutStyles.formStatusError} role="alert">
              {submitError}
            </p>
          ) : null}
        </form>

        {/* ── Sidebar ── */}
        <aside ref={summaryRef} tabIndex={-1} className={checkoutStyles.summaryColumn}>
          <div className={`${checkoutStyles.summaryCard} ${styles.summaryCardLayby}`}>
            <div className={checkoutStyles.summaryHeader}>
              <div>
                <p className={checkoutStyles.checkoutKicker}>Payment Plan</p>
                <h2>Lay-by Summary</h2>
              </div>
            </div>

            {/* ── Term Selector ── */}
            <div className={styles.termSelector}>
              <span className={styles.termLabel}>Payment term</span>
              <div className={styles.termOptions}>
                {[3, 4, 5].map((term) => (
                  <label
                    key={term}
                    className={`${styles.termOption} ${
                      selectedTerm === term ? styles.termOptionActive : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="layby-term"
                      value={term}
                      checked={selectedTerm === term}
                      onChange={() => setSelectedTerm(term)}
                    />
                    <span>{term} months</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ── Deposit Card ── */}
            <div className={styles.depositCard}>
              <span className={styles.depositLabel}>Deposit due today</span>
              <strong className={styles.depositAmount}>
                {formatCurrency(plan.deposit)}
              </strong>
              <p className={styles.depositNote}>
                Your pack total of {formatCurrency(total)} is split into{" "}
                {selectedTerm} payments with <strong>0% interest</strong>.
              </p>
            </div>

            {/* ── Schedule ── */}
            <div className={styles.schedule}>
              <div className={styles.scheduleHeader}>
                <span className={styles.scheduleTitle}>Payment Schedule</span>
              </div>
              <div>
                {scheduleMonths.map((month, i) => {
                  const amount =
                    i === 0
                      ? plan.deposit
                      : i < selectedTerm - 1
                        ? plan.instalments[0]
                        : plan.final;
                  const isDeposit = i === 0;
                  return (
                    <div
                      key={month.label}
                      className={`${styles.scheduleRow} ${isDeposit ? styles.scheduleRowActive : ""}`}
                    >
                      <div className={styles.scheduleDot}>
                        <span>{i + 1}</span>
                      </div>
                      <div className={styles.scheduleInfo}>
                        <strong>
                          {month.label}
                          {isDeposit ? " (Today)" : ""}
                        </strong>
                        <span>{month.subtitle}</span>
                      </div>
                      <span className={styles.scheduleAmount}>
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className={styles.scheduleNote}>
              You can settle this lay-by in full before the{" "}
              {scheduleMonths.length}-month term ends at any time. Packs and
              stationery <strong>will not be packed or dispatched</strong> until
              the full payment is confirmed and received by Pexpacks in the
              holding account.
            </p>

            <div className={styles.finalAmountPanel}>
              <div className={styles.finalAmountRow}>
                <span>Pack subtotal</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
              <div className={`${styles.finalAmountRow} ${styles.finalAmountGrand}`}>
                <span>Final amount</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
              <Button
                type="button"
                variant="outline"
                className={styles.editOrderButton}
                onClick={handleBackToOrder}
              >
                Edit order
              </Button>
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              className={`${checkoutStyles.fullWidth} ${checkoutStyles.desktopPayButton}`}
              onClick={handlePayDeposit}
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting
                ? "Preparing secure deposit..."
                : `Pay Deposit ${formatCurrency(plan.deposit)}`}
            </Button>

            <p className={checkoutStyles.summarySecurity}>
              Secure payment via Paystack. Pexpacks never stores your card
              details.
            </p>
          </div>
        </aside>
      </div>

      <div
        className={`${checkoutStyles.mobileStickyCta} ${styles.mobileStickyActions}`}
      >
        <Button
          type="button"
          variant="primary"
          className={checkoutStyles.fullWidth}
          onClick={handlePayDeposit}
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting
            ? "Preparing..."
            : `Pay Deposit ${formatCurrency(plan.deposit)}`}
        </Button>
      </div>
    </div>
  );
}
