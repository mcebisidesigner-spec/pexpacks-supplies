"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import type { TrayPackItem } from "@/store/usePackTrayStore";
import { calculateTrayTotal } from "@/lib/order/calculateTrayTotal";
import { formatCurrency } from "@/lib/formatCurrency";
import { calculatePexcoverTotal } from "@/lib/pricing/pexcover";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { buildWhatsAppHref } from "@/data/contact";
import clsx from "clsx";
import {
  trackCheckoutValidationFailed,
  trackPaymentFailed,
  trackPaymentInitiated,
} from "@/lib/analytics";

type FulfilmentOption =
  | "school_collection"
  | "home_delivery"
  | "arranged_collection";
type ContactMethod = "whatsapp" | "phone" | "email";
type CheckoutSummarySection = "details" | "delivery";

const contactOptions: { value: ContactMethod; label: string }[] = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone", label: "Phone call" },
  { value: "email", label: "Email" },
];

const fulfilmentOptions: {
  value: FulfilmentOption;
  title: string;
  description: string;
  note: string;
}[] = [
  {
    value: "school_collection",
    title: "School collection",
    description:
      "Please pick up your stationery pack from the school or the designated handover point.",
    note: "Included",
  },
  {
    value: "home_delivery",
    title: "Home delivery",
    description:
      "Home delivery will incur additional charges, which will be confirmed separately.",
    note: "Address required",
  },
  {
    value: "arranged_collection",
    title: "Arranged collection",
    description:
      "You can choose your own delivery location. We will contact you to confirm your preferred option.",
    note: "We will confirm",
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

function fulfilmentToApiMethod(option: FulfilmentOption) {
  if (option === "school_collection") return "school_collection";
  if (option === "home_delivery") return "delivery";
  return "collection_point";
}

function getPackTotal(pack: TrayPackItem) {
  const pexcoverCost = pack.wantsPexcover
    ? calculatePexcoverTotal(pack.items).pexcoverTotalRands
    : 0;
  return pack.totalPrice + pexcoverCost;
}

function getPackItemPreview(pack: TrayPackItem) {
  return pack.items.slice(0, 4);
}

function FulfilmentIcon({ option }: { option: FulfilmentOption }) {
  if (option === "school_collection") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    );
  }

  if (option === "home_delivery") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8h4l3 3v5h-7V8Z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18M7 15h4" />
    </svg>
  );
}

export function TrayCheckoutClient() {
  const router = useRouter();
  const packs = usePackTrayStore((s) => s.packs);
  const openTray = usePackTrayStore((s) => s.openTray);
  const updatePackDetails = usePackTrayStore((s) => s.updatePackDetails);

  const [expandedPacks, setExpandedPacks] = useState<Record<string, boolean>>(
    {},
  );
  const [editNameIndex, setEditNameIndex] = useState<number | null>(null);
  const [learnerInputs, setLearnerInputs] = useState<string[]>(() =>
    packs.map((p) => p.learnerName || ""),
  );

  const [fullName, setFullName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] =
    useState<ContactMethod>("whatsapp");
  const [consent, setConsent] = useState(false);

  const [disallowSchoolCollection, setDisallowSchoolCollection] =
    useState(false);
  const [fulfilmentOption, setFulfilmentOption] =
    useState<FulfilmentOption>("school_collection");
  const [multiSchoolDrop, setMultiSchoolDrop] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [suburb, setSuburb] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  const [mobileSectionSummaryOpen, setMobileSectionSummaryOpen] = useState<
    Record<CheckoutSummarySection, boolean>
  >({
    details: true,
    delivery: true,
  });
  const fieldRefs = useRef<
    Record<string, HTMLInputElement | HTMLTextAreaElement | null>
  >({});
  const sectionRefs = useRef<
    Record<CheckoutSummarySection, HTMLElement | null>
  >({
    details: null,
    delivery: null,
  });
  const consentRef = useRef<HTMLElement | null>(null);
  const summaryRef = useRef<HTMLElement | null>(null);

  const total = useMemo(() => calculateTrayTotal(packs), [packs]);

  const pexcoverPacks = useMemo(
    () => packs.filter((p) => p.wantsPexcover),
    [packs],
  );
  const pexcoverCount = pexcoverPacks.length;

  const pexcoverTotal = useMemo(
    () =>
      pexcoverPacks.reduce(
        (sum, p) => sum + calculatePexcoverTotal(p.items).pexcoverTotalRands,
        0,
      ),
    [pexcoverPacks],
  );
  const itemsTotal = total - pexcoverTotal;

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
  const deliveryExpanded = fulfilmentOption === "home_delivery";
  const canSubmit = packs.length > 0 && total > 0 && !submitting;
  const detailsSectionHasErrors = Boolean(
    errors.fullName ||
    errors.buyerPhone ||
    errors.buyerEmail ||
    Object.keys(errors).some((key) => key.startsWith("learner_")),
  );
  const showDetailsHiddenWarning =
    detailsSectionHasErrors && !mobileSectionSummaryOpen.details;

  const toggleMobileSectionSummary = useCallback(
    (section: CheckoutSummarySection) => {
      setMobileSectionSummaryOpen((current) => ({
        ...current,
        [section]: !current[section],
      }));
    },
    [],
  );

  useEffect(() => {
    setLearnerInputs((prev) => {
      if (prev.length === packs.length) return prev;
      return packs.map((pack, index) => prev[index] ?? pack.learnerName ?? "");
    });
  }, [packs]);

  useEffect(() => {
    if (uniqueSchools.length === 0) return;
    const slugs = uniqueSchools.map((s) => s.slug).filter(Boolean);
    if (slugs.length === 0) return;

    fetch("/api/schools/visibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (
          data?.success &&
          Array.isArray(data.collectionDisallowedSlugs) &&
          data.collectionDisallowedSlugs.length > 0
        ) {
          setDisallowSchoolCollection(true);
          setFulfilmentOption((cur) =>
            cur === "school_collection" ? "home_delivery" : cur,
          );
        } else {
          setDisallowSchoolCollection(false);
        }
      })
      .catch(() => {});
  }, [uniqueSchools]);

  const availableFulfilmentOptions = useMemo(() => {
    return fulfilmentOptions.filter(
      (opt) => !disallowSchoolCollection || opt.value !== "school_collection",
    );
  }, [disallowSchoolCollection]);

  useEffect(() => {
    if (isSingleSchool && fulfilmentOption === "school_collection") {
      setMultiSchoolDrop(uniqueSchools[0]?.slug ?? null);
    }
  }, [fulfilmentOption, isSingleSchool, uniqueSchools]);

  const deliveryAddressSummary = useMemo(() => {
    return [address, suburb, city, province, postalCode]
      .filter(Boolean)
      .join(", ");
  }, [address, suburb, city, province, postalCode]);

  const handleLearnerNameChange = useCallback(
    (index: number, value: string) => {
      setLearnerInputs((prev) => {
        const next = [...prev];
        next[index] = value;
        return next;
      });
    },
    [],
  );

  const handleLearnerNameBlur = useCallback(
    (index: number) => {
      const pack = packs[index];
      if (!pack) return;
      const name = learnerInputs[index]?.trim() || "";
      if (name !== (pack.learnerName || "")) {
        updatePackDetails(pack.id, name, pack.wantsPexcover || false);
      }
      setEditNameIndex(null);
    },
    [packs, learnerInputs, updatePackDetails],
  );

  const handleLearnerNameKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === "Enter") {
        (e.target as HTMLInputElement).blur();
      }
      if (e.key === "Escape") {
        setLearnerInputs((prev) => {
          const next = [...prev];
          next[index] = packs[index]?.learnerName || "";
          return next;
        });
        setEditNameIndex(null);
      }
    },
    [packs],
  );

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

  function getSectionForError(field: string): CheckoutSummarySection | null {
    if (
      field === "fullName" ||
      field === "buyerPhone" ||
      field === "buyerEmail"
    ) {
      return "details";
    }

    if (
      field === "address" ||
      field === "suburb" ||
      field === "city" ||
      field === "province" ||
      field === "multiSchoolDrop"
    ) {
      return "delivery";
    }

    return null;
  }

  function guideToIncompleteField(field: string) {
    const section = getSectionForError(field);
    const learnerMatch = field.match(/^learner_(\d+)$/);

    if (section) {
      setMobileSectionSummaryOpen((current) => ({
        ...current,
        [section]: true,
      }));
    }

    if (learnerMatch) {
      setEditNameIndex(Number(learnerMatch[1]));
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const fieldNode = fieldRefs.current[field];
        const target =
          fieldNode ||
          (learnerMatch ? summaryRef.current : null) ||
          (field === "consent" ? consentRef.current : null) ||
          (section ? sectionRefs.current[section] : null);

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
    const nextErrors: Record<string, string> = {};

    if (packs.length === 0)
      nextErrors.packs = "Choose a school pack before checkout.";
    if (total <= 0)
      nextErrors.total = "Your order total must be greater than zero.";
    if (!fullName.trim() || fullName.trim().length < 2)
      nextErrors.fullName = "Please enter your full name.";
    if (!buyerPhone.trim())
      nextErrors.buyerPhone = "Please enter your phone number.";
    else if (!isLikelySaPhone(buyerPhone))
      nextErrors.buyerPhone =
        "Please enter a valid South African phone number.";
    if (!buyerEmail.trim())
      nextErrors.buyerEmail = "Please enter your email address.";
    else if (!isValidEmail(buyerEmail.trim()))
      nextErrors.buyerEmail = "Please enter a valid email address.";

    for (let i = 0; i < packs.length; i++) {
      if (!learnerInputs[i]?.trim()) {
        nextErrors[`learner_${i}`] =
          `Please enter a name for learner ${i + 1}.`;
      }
    }

    if (deliveryExpanded) {
      if (!address.trim())
        nextErrors.address = "Please enter the delivery address.";
      if (!suburb.trim()) nextErrors.suburb = "Please enter the suburb.";
      if (!city.trim()) nextErrors.city = "Please enter the city.";
      if (!province.trim()) nextErrors.province = "Please enter the province.";
    }

    if (
      fulfilmentOption === "school_collection" &&
      uniqueSchools.length > 1 &&
      !multiSchoolDrop
    ) {
      nextErrors.multiSchoolDrop =
        "Select which school the box should be dropped at.";
    }
    if (!consent)
      nextErrors.consent = "Please accept the order processing consent.";

    setErrors(nextErrors);

    const firstError = Object.keys(nextErrors)[0];
    if (firstError) {
      trackCheckoutValidationFailed({
        checkoutMode: "tray",
        step: getSectionForError(firstError) || "order",
        fields: Object.keys(nextErrors),
      });
      guideToIncompleteField(firstError);
    }

    return Object.keys(nextErrors).length === 0;
  }

  async function handlePay() {
    if (submitting) return;
    if (!validate()) return;

    setSubmitError(null);
    setSubmitting(true);

    const notes = [
      deliveryNotes.trim() ? `Notes: ${deliveryNotes.trim()}` : "",
      deliveryExpanded ? `Address: ${deliveryAddressSummary}` : "",
      preferredContactMethod
        ? `Preferred contact: ${preferredContactMethod}`
        : "",
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
          amount: total,
          customerEmail: buyerEmail.trim().toLowerCase(),
          buyerName: fullName.trim(),
          buyerEmail: buyerEmail.trim().toLowerCase(),
          buyerPhone: normalisePhone(buyerPhone),
          packs: packs.map((pack, pi) => ({
            learnerName:
              learnerInputs[pi]?.trim() || pack.learnerName?.trim() || "",
            schoolSlug: pack.schoolSlug || "",
            schoolName: pack.schoolName || "",
            grade: pack.grade || "",
            gradeSlug: pack.gradeSlug || "",
            packName: pack.packName,
            packMode: pack.packMode,
            source: pack.source,
            items: pack.items.map((i) => ({
              id: i.itemId ?? i.id,
              name: i.name,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
            })),
            totalPrice: pack.totalPrice,
            modifications: pack.modifications,
            wantsPexcover: pack.wantsPexcover || false,
            pexcoverPaperStyle: pack.pexcoverPaperStyle,
            pexcoverPrice: pack.wantsPexcover
              ? calculatePexcoverTotal(pack.items).pexcoverTotalRands
              : 0,
            basePackPrice: pack.totalPrice,
          })),
          isTrayOrder: true,
          estimatedTotal: total,
          deliveryMethod: fulfilmentToApiMethod(fulfilmentOption),
          primarySchoolSlug:
            uniqueSchools.length > 1
              ? multiSchoolDrop
              : uniqueSchools[0]?.slug || packs[0]?.schoolSlug || "",
          notes: notes || undefined,
          idempotencyKey: idempotencyKeyRef.current,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        console.error("Ozow Checkout Error Response:", response.status, data);
        trackPaymentFailed({
          checkoutMode: "tray",
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

      if (idempotencyKeyRef.current) {
        trackPaymentInitiated({
          orderId: idempotencyKeyRef.current,
          totalPrice: total,
        });
      }
      window.location.href = data.url;
      return;
    } catch (error) {
      console.error("Ozow Checkout Exception:", error);
      trackPaymentFailed({
        checkoutMode: "tray",
        failureType: "network",
      });
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to initialize Ozow payment.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full min-h-screen py-8 md:py-12 px-4 md:px-8 bg-[var(--pex-bg-soft)] font-[family-name:var(--font-body)] text-[var(--pex-navy)] pb-24 lg:pb-12">
      <header className="flex justify-between items-center max-w-[var(--layout-max-width)] mx-auto mb-8">
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--pex-keppel)] hover:text-[var(--pex-navy)] transition-colors cursor-pointer bg-transparent border-0 p-0"
          onClick={handleBackToOrder}
        >
          ← Back to order
        </button>
        <a
          href={buildWhatsAppHref("Hi Pexpacks, I need help with checkout.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--pex-muted)] hover:text-[var(--pex-keppel)] transition-colors"
        >
          Need help?
        </a>
      </header>

      <div className="max-w-[var(--layout-max-width)] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        <section className="col-span-1 lg:col-span-2 bg-white rounded-[var(--radius-card)] p-6 sm:p-8 border border-[var(--pex-border)] shadow-[var(--shadow-card)]">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--pex-keppel)] mb-2">Checkout</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--pex-navy)] font-[family-name:var(--font-heading)] m-0 mb-2 leading-tight">Review your packs and confirm your order.</h1>
          <p className="text-sm sm:text-base text-[var(--pex-muted)] m-0 max-w-2xl leading-relaxed">
            Add your details, choose delivery or collection, and submit your
            order. We will be in touch with payment details.
          </p>
        </section>

        <form
          className="flex flex-col gap-8"
          aria-label="Checkout details"
          onSubmit={(e) => e.preventDefault()}
        >
          <section
            ref={(node) => {
              sectionRefs.current.details = node;
            }}
            tabIndex={-1}
            className={clsx(
              "bg-white rounded-[var(--radius-card)] p-6 sm:p-8 border border-[var(--pex-border)] shadow-[var(--shadow-card)] outline-none transition-shadow",
              showDetailsHiddenWarning && "ring-2 ring-[var(--pex-coral)] ring-offset-2",
            )}
            aria-labelledby="customer-details-heading"
          >
            <div className="flex items-start gap-4 mb-6 relative">
              <span className="w-8 h-8 rounded-full bg-[var(--pex-navy)] text-white text-sm font-bold flex items-center justify-center shrink-0">1</span>
              <div>
                <h2 id="customer-details-heading" className="text-xl font-bold text-[var(--pex-navy)] font-[family-name:var(--font-heading)] m-0 mb-1">Your details</h2>
                <p className="text-xs sm:text-sm text-[var(--pex-muted)] m-0">
                  We use these details for order updates and delivery or
                  collection support.
                </p>
              </div>
              <button
                type="button"
                className="ml-auto text-xs font-bold text-[var(--pex-keppel)] hover:underline md:hidden shrink-0"
                onClick={() => toggleMobileSectionSummary("details")}
                aria-expanded={mobileSectionSummaryOpen.details}
                aria-controls="customer-details-summary"
              >
                {mobileSectionSummaryOpen.details
                  ? "Hide Summary"
                  : "View Summary"}
              </button>
            </div>
            <div
              id="customer-details-summary"
              className={clsx(
                "hidden md:block",
                mobileSectionSummaryOpen.details && "!block",
              )}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <Input
                  id="fullName"
                  ref={(node) => {
                    fieldRefs.current.fullName = node;
                  }}
                  label="Full name"
                  helper="We use this to confirm your order and payment updates."
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
                  ref={(node) => {
                    fieldRefs.current.buyerPhone = node;
                  }}
                  label="Phone number"
                  helper="WhatsApp or call is fastest for support."
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
                  ref={(node) => {
                    fieldRefs.current.buyerEmail = node;
                  }}
                  label="Email address"
                  helper="Used for order updates and payment confirmation."
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
                <fieldset className="col-span-1 md:col-span-2 border-0 p-0 m-0 mt-2">
                  <legend className="text-sm font-bold text-[var(--pex-navy)] mb-1">Preferred contact method</legend>
                  <p className="text-xs text-[var(--pex-muted)] mb-3">
                    Choose how we should reach you if the order needs a quick
                    check.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[var(--pex-bg-soft)] p-1.5 rounded-[var(--radius-sm)] border border-[var(--pex-border)]">
                    {contactOptions.map((option) => (
                      <label
                        key={option.value}
                        className={clsx(
                          "flex items-center justify-center gap-2 py-2.5 px-3 rounded-[var(--radius-sm)] text-xs sm:text-sm font-semibold text-[var(--pex-muted)] cursor-pointer transition-all hover:text-[var(--pex-navy)] select-none",
                          preferredContactMethod === option.value &&
                            "bg-white text-[var(--pex-keppel)] shadow-sm font-bold",
                        )}
                      >
                        <input
                          type="radio"
                          name="preferredContactMethod"
                          value={option.value}
                          checked={preferredContactMethod === option.value}
                          onChange={() =>
                            setPreferredContactMethod(option.value)
                          }
                          className="sr-only"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
              {packs.map((pack, index) => {
                const errKey = `learner_${index}`;
                return errors[errKey] ? (
                  <p key={errKey} className="text-xs font-semibold text-[var(--pex-coral)] mt-1.5 block">
                    Learner {index + 1} ({pack.packName}): {errors[errKey]}
                  </p>
                ) : null;
              })}
            </div>
            {showDetailsHiddenWarning ? (
              <p className="mt-4 p-3 rounded-[var(--radius-sm)] bg-[rgba(235,94,85,0.08)] border border-[rgba(235,94,85,0.25)] text-xs text-[var(--pex-coral)] font-semibold md:hidden" role="alert">
                Fill in your details (Click "View Summary")
              </p>
            ) : null}
          </section>

          <section
            ref={(node) => {
              sectionRefs.current.delivery = node;
            }}
            tabIndex={-1}
            className="bg-white rounded-[var(--radius-card)] p-6 sm:p-8 border border-[var(--pex-border)] shadow-[var(--shadow-card)] outline-none"
            aria-labelledby="fulfilment-heading"
          >
            <div className="flex items-start gap-4 mb-6 relative">
              <span className="w-8 h-8 rounded-full bg-[var(--pex-navy)] text-white text-sm font-bold flex items-center justify-center shrink-0">2</span>
              <div>
                <h2 id="fulfilment-heading" className="text-xl font-bold text-[var(--pex-navy)] font-[family-name:var(--font-heading)] m-0 mb-1">Delivery or collection</h2>
                <p className="text-xs sm:text-sm text-[var(--pex-muted)] m-0">Choose how you want to receive this order.</p>
              </div>
              <button
                type="button"
                className="ml-auto text-xs font-bold text-[var(--pex-keppel)] hover:underline md:hidden shrink-0"
                onClick={() => toggleMobileSectionSummary("delivery")}
                aria-expanded={mobileSectionSummaryOpen.delivery}
                aria-controls="fulfilment-summary"
              >
                {mobileSectionSummaryOpen.delivery
                  ? "Hide Summary"
                  : "View Summary"}
              </button>
            </div>

            <div
              id="fulfilment-summary"
              className={clsx(
                "hidden md:block",
                mobileSectionSummaryOpen.delivery && "!block",
              )}
            >
              <fieldset className="border-0 p-0 m-0">
                <legend className="sr-only">
                  Delivery or collection method
                </legend>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  {availableFulfilmentOptions.map((option) => (
                    <label
                      key={option.value}
                      className={clsx(
                        "flex flex-col p-4 sm:p-5 rounded-[var(--radius-md)] border-2 border-[var(--pex-border)] bg-white cursor-pointer transition-all hover:border-[rgba(33,158,154,0.4)] relative",
                        fulfilmentOption === option.value &&
                          "border-[var(--pex-keppel)] bg-[rgba(33,158,154,0.03)] shadow-sm",
                      )}
                    >
                      <input
                        type="radio"
                        name="fulfilment"
                        value={option.value}
                        checked={fulfilmentOption === option.value}
                        onChange={() => {
                          setFulfilmentOption(option.value);
                          clearFieldError("multiSchoolDrop");
                        }}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3 mb-1.5 text-sm sm:text-base font-bold text-[var(--pex-navy)]">
                        <span className="w-8 h-8 rounded-full bg-[rgba(33,158,154,0.1)] text-[var(--pex-keppel)] flex items-center justify-center shrink-0">
                          <FulfilmentIcon option={option.value} />
                        </span>
                        <strong>{option.title}</strong>
                      </div>
                      <p className="text-xs sm:text-sm text-[var(--pex-muted)] m-0 leading-relaxed pl-11">
                        {option.description}
                      </p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[rgba(33,158,154,0.1)] text-[var(--pex-keppel)] self-start mt-2 ml-11">
                        {option.note}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {fulfilmentOption === "school_collection" &&
              uniqueSchools.length > 1 ? (
                <div className="mt-6 pt-6 border-t border-[var(--pex-border)]">
                  <p className="text-xs sm:text-sm font-bold text-[var(--pex-navy)] mb-3">
                    Which school should the main box be dropped at?
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {uniqueSchools.map((school) => {
                      const isSelected = multiSchoolDrop === school.slug;
                      return (
                        <label
                          key={school.slug}
                          className={clsx(
                            "flex items-center gap-3 p-3 rounded-[var(--radius-sm)] border border-[var(--pex-border)] bg-white hover:border-[var(--pex-keppel)] cursor-pointer transition-all",
                            isSelected && "border-[var(--pex-keppel)] bg-[rgba(33,158,154,0.05)] shadow-xs",
                          )}
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
                            className="accent-[var(--pex-keppel)] w-4 h-4 cursor-pointer"
                          />
                          <span className="text-xs sm:text-sm font-semibold text-[var(--pex-navy)]">
                            {school.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {errors.multiSchoolDrop ? (
                    <p className="text-xs font-semibold text-[var(--pex-coral)] mt-1.5 block">
                      {errors.multiSchoolDrop}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {deliveryExpanded ? (
                <div className="mt-6 pt-6 border-t border-[var(--pex-border)] grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="address"
                    ref={(node) => {
                      fieldRefs.current.address = node;
                    }}
                    label="Address line"
                    type="text"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      clearFieldError("address");
                    }}
                    placeholder="e.g. 42 Main Road"
                    error={errors.address}
                    autoComplete="street-address"
                  />
                  <Input
                    id="suburb"
                    ref={(node) => {
                      fieldRefs.current.suburb = node;
                    }}
                    label="Suburb"
                    type="text"
                    autoComplete="address-level2"
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
                    ref={(node) => {
                      fieldRefs.current.city = node;
                    }}
                    label="City"
                    type="text"
                    autoComplete="address-level2"
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
                    ref={(node) => {
                      fieldRefs.current.province = node;
                    }}
                    label="Province"
                    type="text"
                    autoComplete="address-level1"
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
                    autoComplete="postal-code"
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
                className="mt-4 w-full"
              />
            </div>
          </section>

          <section
            ref={consentRef}
            tabIndex={-1}
            className="bg-white rounded-[var(--radius-card)] p-6 sm:p-8 border border-[var(--pex-border)] shadow-[var(--shadow-card)] outline-none"
            aria-label="Consent"
          >
            <label className="flex items-start gap-3 cursor-pointer text-xs sm:text-sm text-[var(--pex-muted)] leading-relaxed [&_a]:text-[var(--pex-keppel)] [&_a]:underline [&_a]:font-medium hover:[&_a]:text-[var(--pex-primary)]">
              <input
                ref={(node) => {
                  fieldRefs.current.consent = node;
                }}
                type="checkbox"
                id="consent"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked);
                  clearFieldError("consent");
                }}
                aria-invalid={!!errors.consent}
                className="mt-1 w-4 h-4 accent-[var(--pex-keppel)] rounded shrink-0 cursor-pointer"
              />
              <span>
                I agree that Pexpacks may process my personal information to
                complete this order, send order updates, and contact me about
                delivery or collection. I have read and agree to the{" "}
                <a href="/privacy-policy" target="_blank">
                  privacy policy
                </a>
                ,{" "}
                <a href="/terms" target="_blank">
                  terms of use
                </a>
                ,{" "}
                <a href="/delivery-policy" target="_blank">
                  delivery policy
                </a>
                ,{" "}
                <a href="/happy-pay-terms" target="_blank">
                  happy pay terms
                </a>
                , and{" "}
                <a href="/returns-refunds-policy" target="_blank">
                  returns &amp; refunds policy
                </a>
                .
              </span>
            </label>
            {errors.consent ? (
              <p className="text-xs font-semibold text-[var(--pex-coral)] mt-1.5 block">{errors.consent}</p>
            ) : null}
          </section>

          {submitError ? (
            <p className="p-4 rounded-[var(--radius-sm)] bg-[rgba(235,94,85,0.08)] border border-[rgba(235,94,85,0.25)] text-xs sm:text-sm text-[var(--pex-coral)] font-semibold leading-relaxed" role="alert">
              {submitError}
            </p>
          ) : null}
        </form>

        <aside
          ref={summaryRef}
          tabIndex={-1}
          className="w-full lg:sticky lg:top-24"
          aria-labelledby="order-summary-heading"
        >
          <div className="bg-white rounded-[var(--radius-card)] p-6 sm:p-8 border border-[var(--pex-border)] shadow-[var(--shadow-card)]">
            <div className="flex justify-between items-start pb-4 border-b border-[var(--pex-border)] mb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--pex-keppel)] mb-2">Your order</p>
                <h2 id="order-summary-heading" className="text-xl font-bold text-[var(--pex-navy)] font-[family-name:var(--font-heading)] m-0">Order summary</h2>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[rgba(33,158,154,0.1)] text-[var(--pex-keppel)]">
                {packs.length} {packs.length === 1 ? "pack" : "packs"}
              </span>
            </div>

            <div className="flex flex-col gap-4 mb-6 divide-y divide-[var(--pex-border)]">
              {packs.map((pack, index) => {
                const isExpanded = !!expandedPacks[pack.id];
                const previewItems = getPackItemPreview(pack);
                const hiddenCount = Math.max(
                  pack.items.length - previewItems.length,
                  0,
                );
                const learnerName = learnerInputs[index]?.trim();
                const learnerLabel = learnerName
                  ? `Learner ${index + 1}: ${learnerName}`
                  : `Learner ${index + 1}: Add learner name`;
                return (
                  <article key={pack.id} className="pt-4 first:pt-0">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div>
                        {editNameIndex === index ? (
                          <Input
                            ref={(node) => {
                              fieldRefs.current[`learner_${index}`] = node;
                            }}
                            type="text"
                            value={learnerInputs[index] || ""}
                            onChange={(e) =>
                              handleLearnerNameChange(index, e.target.value)
                            }
                            onBlur={() => handleLearnerNameBlur(index)}
                            onKeyDown={(e) =>
                              handleLearnerNameKeyDown(e, index)
                            }
                            placeholder="Learner name"
                            aria-label={`Learner ${index + 1} name`}
                            autoFocus
                          />
                        ) : (
                          <button
                            type="button"
                            className={clsx(
                              "text-xs font-bold text-[var(--pex-keppel)] hover:underline cursor-pointer bg-transparent border-0 p-0 text-left",
                              errors[`learner_${index}`] &&
                                "text-[var(--pex-coral)] underline",
                            )}
                            onClick={() => setEditNameIndex(index)}
                            aria-label={`Edit learner ${index + 1} name`}
                          >
                            {learnerLabel}
                          </button>
                        )}
                      </div>
                      <strong className="text-sm font-bold text-[var(--pex-navy)] shrink-0">
                        {formatCurrency(getPackTotal(pack))}
                      </strong>
                    </div>

                    <div className="mb-2">
                      <h3 className="text-sm sm:text-base font-bold text-[var(--pex-navy)] m-0 mb-1">{pack.packName}</h3>
                      <p className="text-xs text-[var(--pex-muted)] m-0 mb-2">
                        {pack.schoolName || "School pack"}
                        {pack.grade ? ` · ${pack.grade}` : ""}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--pex-bg-soft)] text-[var(--pex-muted)] border border-[var(--pex-border)]">
                          {pack.packMode === "full"
                            ? "Full pack"
                            : "Customised"}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--pex-bg-soft)] text-[var(--pex-muted)] border border-[var(--pex-border)]">
                          {pack.items.length}{" "}
                          {pack.items.length === 1 ? "item" : "items"}
                        </span>
                        {pack.wantsPexcover ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[rgba(33,158,154,0.1)] text-[var(--pex-keppel)] border border-[rgba(33,158,154,0.2)]">
                            Pexcover
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--pex-keppel)] hover:underline cursor-pointer bg-transparent border-0 p-0"
                      aria-expanded={isExpanded}
                      aria-controls={`pack-items-${pack.id}`}
                      onClick={() =>
                        setExpandedPacks((prev) => ({
                          ...prev,
                          [pack.id]: !prev[pack.id],
                        }))
                      }
                    >
                      <span>{isExpanded ? "Hide items" : "View items"}</span>
                      <span aria-hidden="true">{isExpanded ? "-" : "+"}</span>
                    </button>

                    {isExpanded ? (
                      <ul
                        id={`pack-items-${pack.id}`}
                        className="mt-3 p-3 rounded-[var(--radius-sm)] bg-[var(--pex-bg-soft)] text-xs text-[var(--pex-muted)] space-y-1.5 list-none m-0"
                      >
                        {previewItems.map((item, itemIndex) => {
                          return (
                            <li key={`${pack.id}-${item.name}-${itemIndex}`} className="flex justify-between items-center">
                              <span>{item.name}</span>
                              <span className="font-medium text-[var(--pex-navy)]">Qty {item.quantity}</span>
                            </li>
                          );
                        })}
                        {pack.wantsPexcover ? (
                          <li className="text-[var(--pex-keppel)] font-medium">
                            <span>
                              Pexcover <em>(Book covering)</em>
                            </span>
                          </li>
                        ) : null}
                        {hiddenCount > 0 ? (
                          <li className="text-[11px] text-[var(--pex-muted)] italic pt-1 border-t border-[var(--pex-border)]">
                            + {hiddenCount} more items in this pack
                          </li>
                        ) : null}
                      </ul>
                    ) : null}
                  </article>
                );
              })}
            </div>

            <div className="space-y-2.5 py-4 border-t border-b border-[var(--pex-border)] mb-4 text-xs sm:text-sm text-[var(--pex-muted)] [&>div]:flex [&>div]:justify-between [&>div]:items-center [&>div>strong]:text-[var(--pex-navy)] [&>div>strong]:font-semibold">
              <div>
                <span>Pack subtotal</span>
                <strong>{formatCurrency(itemsTotal)}</strong>
              </div>
              {pexcoverCount > 0 ? (
                <div className="text-[var(--pex-keppel)]">
                  <span>
                    Pexcover <em>(Book covering)</em> x{pexcoverCount}
                  </span>
                  <strong>{formatCurrency(pexcoverTotal)}</strong>
                </div>
              ) : null}
              {fulfilmentOption === "home_delivery" ? (
                <div>
                  <span>Delivery fee</span>
                  <strong>To confirm</strong>
                </div>
              ) : null}
              <div className="!text-base !font-bold !text-[var(--pex-navy)] pt-2 border-t border-dashed border-[var(--pex-border)]">
                <span>
                  {fulfilmentOption === "home_delivery"
                    ? "Pack total payable now"
                    : "Total payable now"}
                </span>
                <strong>{formatCurrency(total)}</strong>
              </div>
            </div>

            {fulfilmentOption === "home_delivery" ? (
              <p className="text-xs text-[var(--pex-muted)] italic leading-relaxed mb-4">
                The home-delivery fee is not included in this payment. We will
                confirm the fee with you separately before dispatch.
              </p>
            ) : null}

            {errors.packs || errors.total ? (
              <p className="p-4 rounded-[var(--radius-sm)] bg-[rgba(235,94,85,0.08)] border border-[rgba(235,94,85,0.25)] text-xs sm:text-sm text-[var(--pex-coral)] font-semibold leading-relaxed mb-4" role="alert">
                {errors.packs || errors.total}
              </p>
            ) : null}

            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full mb-3 hidden lg:flex"
              onClick={handlePay}
              disabled={!canSubmit}
              aria-busy={submitting}
            >
              {submitting
                ? "Preparing your order..."
                : fulfilmentOption === "home_delivery"
                  ? `Pay Pack Total ${formatCurrency(total)}`
                  : `Pay Now ${formatCurrency(total)}`}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleBackToOrder}
            >
              Edit order
            </Button>

            <p className="text-[11px] text-[var(--pex-muted)] text-center mt-3 leading-relaxed">
              Your order details are secure. Pexpacks will never share your
              information.
            </p>
          </div>
        </aside>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-[var(--pex-border)] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-40 lg:hidden">
        <Button
          type="button"
          variant="primary"
          className="w-full min-h-[48px] text-base font-bold shadow-md"
          onClick={handlePay}
          disabled={!canSubmit}
          aria-busy={submitting}
        >
          {submitting
            ? "Preparing..."
            : fulfilmentOption === "home_delivery"
              ? `Pay Pack Total ${formatCurrency(total)}`
              : `Pay Now ${formatCurrency(total)}`}
        </Button>
      </div>
    </div>
  );
}
