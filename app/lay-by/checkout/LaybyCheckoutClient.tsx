"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import { calculateTrayTotal } from "@/lib/order/calculateTrayTotal";
import { formatCurrency } from "@/lib/formatCurrency";
import { PEXCOVER_PRICE } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import checkoutStyles from "@/app/checkout/Checkout.module.css";
import styles from "./LaybyCheckout.module.css";

type FulfilmentOption = "school_collection" | "home_delivery" | "arranged_collection";

const SCHEDULE_MONTHS = [
  { label: "June", subtitle: "Deposit" },
  { label: "July", subtitle: "Instalment" },
  { label: "August", subtitle: "Instalment" },
  { label: "September", subtitle: "Instalment" },
  { label: "October", subtitle: "Final" },
] as const;

const MONTH_COUNT = SCHEDULE_MONTHS.length;

function computeInstalmentplan(total: number) {
  const base = Math.ceil(total / MONTH_COUNT);
  const remainder = total - base * (MONTH_COUNT - 1);
  const instalments = Array.from({ length: MONTH_COUNT - 1 }, () => base);
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
  const [fulfilmentOption, setFulfilmentOption] = useState<FulfilmentOption>("school_collection");
  const [address, setAddress] = useState("");
  const [suburb, setSuburb] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const total = useMemo(() => calculateTrayTotal(packs), [packs]);
  const plan = useMemo(() => computeInstalmentplan(total), [total]);

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

    if (!consent) next.consent = "Please accept the order processing consent.";

    setErrors(next);
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
          primarySchoolSlug: uniqueSchools[0]?.slug || packs[0]?.schoolSlug || "",
          notes: deliveryNotes.trim() ? deliveryNotes.trim() : undefined,
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
          <section className={checkoutStyles.checkoutSection} aria-labelledby="layby-order-heading">
            <div className={checkoutStyles.sectionHeader}>
              <span className={checkoutStyles.sectionNumber}>1</span>
              <div>
                <h2 id="layby-order-heading">Your Order</h2>
                <p>Review the packs included in your lay-by plan.</p>
              </div>
            </div>
            <div className={styles.packList}>
              {packs.map((pack, index) => (
                <div key={pack.id} className={styles.packRow}>
                  <div className={styles.packRowInfo}>
                    <strong>{pack.packName}</strong>
                    <span>
                      {pack.schoolName}
                      {pack.grade ? ` \u00b7 ${pack.grade}` : ""}
                    </span>
                    {pack.wantsPexcover ? <span className={styles.pexcoverTag}>+Pexcover</span> : null}
                  </div>
                  <div className={styles.packRowLearner}>
                    <label className={styles.learnerLabel} htmlFor={`learner-${pack.id}`}>
                      Learner name
                    </label>
                    <input
                      id={`learner-${pack.id}`}
                      className={styles.learnerInput}
                      type="text"
                      placeholder="Learner's name"
                      value={learnerInputs[index] || ""}
                      onChange={(e) => {
                        const next = [...learnerInputs];
                        next[index] = e.target.value;
                        setLearnerInputs(next);
                        clearFieldError(`learner_${index}`);
                      }}
                    />
                    {errors[`learner_${index}`] ? (
                      <p className={checkoutStyles.fieldError}>{errors[`learner_${index}`]}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.orderTotal}>
              <span>Pack total</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
          </section>

          {/* ── Your Details (Section 2) ── */}
          <section className={checkoutStyles.checkoutSection} aria-labelledby="layby-details-heading">
            <div className={checkoutStyles.sectionHeader}>
              <span className={checkoutStyles.sectionNumber}>2</span>
              <div>
                <h2 id="layby-details-heading">Your details</h2>
                <p>We use these for order updates and payment confirmations.</p>
              </div>
            </div>
            <div className={checkoutStyles.formGrid}>
              <Input
                id="fullName"
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
            </div>
          </section>

          {/* ── Delivery / Collection (Section 3) ── */}
          <section className={checkoutStyles.checkoutSection} aria-labelledby="layby-fulfilment-heading">
            <div className={checkoutStyles.sectionHeader}>
              <span className={checkoutStyles.sectionNumber}>3</span>
              <div>
                <h2 id="layby-fulfilment-heading">Delivery or collection</h2>
                <p>Choose how you want to receive your pack once the balance is settled.</p>
              </div>
            </div>
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
                    desc: "Receive your pack at home. Address required.",
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

            {deliveryExpanded ? (
              <div className={checkoutStyles.addressPanel}>
                <Input
                  id="address"
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
          </section>

          {/* ── Consent ── */}
          <section className={checkoutStyles.consentCard} aria-label="Consent">
            <label className={`${checkoutStyles.consentField} ${styles.consentFieldAligned}`}>
              <input
                type="checkbox"
                id="layby-consent"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked);
                  clearFieldError("consent");
                }}
                aria-invalid={!!errors.consent}
              />
              <span>
                I agree that Pexpacks may process my personal information to complete this
                lay-by plan, send payment reminders, and arrange delivery or collection. I
                have read and agree to the{" "}
                <a href="/privacy-policy" target="_blank">
                  privacy policy
                </a>
                ,{" "}
                <a href="/lay-by-terms" target="_blank">
                  lay-by terms
                </a>
                , and{" "}
                <a href="/delivery-policy" target="_blank">
                  delivery policy
                </a>
                .
              </span>
            </label>
            {errors.consent ? (
              <p className={checkoutStyles.fieldError}>{errors.consent}</p>
            ) : null}
          </section>

          {submitError ? (
            <p className={checkoutStyles.formStatusError} role="alert">
              {submitError}
            </p>
          ) : null}
        </form>

        {/* ── Sidebar ── */}
        <aside className={checkoutStyles.summaryColumn}>
          <div className={`${checkoutStyles.summaryCard} ${styles.summaryCardLayby}`}>
            <div className={checkoutStyles.summaryHeader}>
              <div>
                <p className={checkoutStyles.checkoutKicker}>Payment Plan</p>
                <h2>Lay-by Summary</h2>
              </div>
              <span>{MONTH_COUNT} months</span>
            </div>

            {/* ── Deposit Card ── */}
            <div className={styles.depositCard}>
              <span className={styles.depositLabel}>Deposit due today</span>
              <strong className={styles.depositAmount}>
                {formatCurrency(plan.deposit)}
              </strong>
              <p className={styles.depositNote}>
                Your pack total of {formatCurrency(total)} is split into{" "}
                {MONTH_COUNT} payments with <strong>0% interest</strong>.
              </p>
            </div>

            {/* ── Schedule ── */}
            <div className={styles.schedule}>
              <span className={styles.scheduleTitle}>Payment Schedule</span>
              {SCHEDULE_MONTHS.map((month, i) => {
                const amount = i === 0 ? plan.deposit : i < MONTH_COUNT - 1 ? plan.instalments[0] : plan.final;
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

            <div className={checkoutStyles.summaryTotals}>
              <div className={styles.summaryTotalRow}>
                <span>Full pack total</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
            </div>

            <div className={styles.summaryFooter}>
              <div className={styles.summaryFooterIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <p>
                Your pack is secured once the deposit is paid. We pack your items after the
                balance is settled by the end of October.
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              className={checkoutStyles.fullWidth}
              onClick={handlePayDeposit}
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting
                ? "Preparing secure deposit..."
                : `Pay Deposit ${formatCurrency(plan.deposit)}`}
            </Button>

            <p className={checkoutStyles.summarySecurity}>
              Secure payment via Paystack. Pexpacks never stores your card details.
            </p>
          </div>
        </aside>
      </div>

      <div className={checkoutStyles.mobileStickyCta}>
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
