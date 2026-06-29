"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import { calculateTrayTotal } from "@/lib/order/calculateTrayTotal";
import { formatCurrency } from "@/lib/formatCurrency";
import { PEXCOVER_PRICE } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
      <div className={styles.page}>
        <div className={styles.empty}>
          <p className={styles.kicker}>Lay-by Checkout</p>
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
    <div className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.backButton} onClick={handleBackToOrder}>
          Back to order
        </button>
        <a
          href="https://wa.me/27763456622?text=Hi Pexpacks, I need help with lay-by checkout."
          target="_blank"
          rel="noopener noreferrer"
          className={styles.helpLink}
        >
          Need help?
        </a>
      </header>

      <main className={styles.grid}>
        <section className={styles.hero}>
          <span className={styles.heroBadge}>Lay-by Plan</span>
          <h1>Pay over time, secure your pack today</h1>
          <p>
            Spread the cost of your school stationery over <strong>5 months</strong> with{" "}
            <strong>0% interest</strong>. Your deposit is your first month&rsquo;s payment.
            Settle by the end of October and we pack in time for January.
          </p>
        </section>

        <div className={styles.mainColumn}>
          {/* ── Order Summary ── */}
          <section className={styles.card}>
            <div className={styles.cardInner}>
              <div className={styles.cardHeader}>
                <span className={styles.cardNumber}>1</span>
                <h2>Your Order</h2>
              </div>
              <div className={styles.packList}>
                {packs.map((pack, index) => (
                  <div key={pack.id} className={styles.packRow}>
                    <div className={styles.packRowInfo}>
                      <strong>{pack.packName}</strong>
                      <span>
                        {pack.schoolName}
                        {pack.grade ? ` · ${pack.grade}` : ""}
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
                        <p className={styles.fieldError}>{errors[`learner_${index}`]}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.orderTotal}>
                <span>Pack total</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
            </div>
          </section>

          {/* ── Your Details ── */}
          <section className={styles.card}>
            <div className={styles.cardInner}>
              <div className={styles.cardHeader}>
                <span className={styles.cardNumber}>2</span>
                <h2>Your Details</h2>
              </div>
              <p className={styles.cardHelp}>
                We use these for order updates and payment confirmations.
              </p>
              <div className={styles.formGrid}>
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
            </div>
          </section>

          {/* ── Delivery / Collection ── */}
          <section className={styles.card}>
            <div className={styles.cardInner}>
              <div className={styles.cardHeader}>
                <span className={styles.cardNumber}>3</span>
                <h2>Delivery or Collection</h2>
              </div>
              <p className={styles.cardHelp}>
                Choose how you want to receive your pack once the balance is settled.
              </p>
              <div className={styles.deliveryOptions}>
                {[
                  {
                    value: "school_collection" as const,
                    title: "School collection",
                    desc: "Collect from the school or agreed handover point.",
                  },
                  {
                    value: "home_delivery" as const,
                    title: "Home delivery",
                    desc: "Receive your pack at home. Address required.",
                  },
                  {
                    value: "arranged_collection" as const,
                    title: "Arranged collection",
                    desc: "We will contact you to confirm the best option.",
                  },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`${styles.deliveryOption} ${
                      fulfilmentOption === opt.value ? styles.deliveryOptionSelected : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="fulfilment"
                      value={opt.value}
                      checked={fulfilmentOption === opt.value}
                      onChange={() => setFulfilmentOption(opt.value)}
                    />
                    <strong>{opt.title}</strong>
                    <p>{opt.desc}</p>
                  </label>
                ))}
              </div>

              {deliveryExpanded ? (
                <div className={styles.addressGrid}>
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

              <div className={styles.notesField}>
                <label htmlFor="deliveryNotes">Delivery notes (optional)</label>
                <textarea
                  id="deliveryNotes"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Gate codes, collection notes, or anything the team should know."
                  rows={3}
                />
              </div>
            </div>
          </section>

          {/* ── Consent ── */}
          <section className={styles.card}>
            <div className={styles.cardInner}>
              <label className={styles.consentField}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    clearFieldError("consent");
                  }}
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
                <p className={styles.fieldError}>{errors.consent}</p>
              ) : null}
            </div>
          </section>

          {submitError ? (
            <p className={styles.formError} role="alert">
              {submitError}
            </p>
          ) : null}
        </div>

        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <span className={styles.kicker}>Payment Plan</span>
              <h2>Lay-by Summary</h2>
            </div>

            <div className={styles.depositCard}>
              <span className={styles.depositLabel}>Deposit due today</span>
              <strong className={styles.depositAmount}>
                {formatCurrency(plan.deposit)}
              </strong>
              <p className={styles.depositNote}>
                Your pack total of {formatCurrency(total)} is split into{" "}
                {MONTH_COUNT} equal payments with{" "}
                <strong>0% interest</strong>.
              </p>
            </div>

            {/* ── Schedule Timeline ── */}
            <div className={styles.schedule}>
              <span className={styles.scheduleTitle}>Payment Schedule</span>
              {SCHEDULE_MONTHS.map((month, i) => {
                const amount = i === 0 ? plan.deposit : i < MONTH_COUNT - 1 ? plan.instalments[0] : plan.final;
                const isDeposit = i === 0;
                const isPast = false;
                return (
                  <div
                    key={month.label}
                    className={`${styles.scheduleRow} ${isDeposit ? styles.scheduleRowActive : ""} ${isPast ? styles.scheduleRowPast : ""}`}
                  >
                    <div className={styles.scheduleDot}>
                      {isPast ? (
                        <svg viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.36 5.19l-4 4a.75.75 0 01-1.06 0l-2-2a.75.75 0 011.06-1.06L6.9 8.63l3.46-3.5a.75.75 0 011.06 1.06z" />
                        </svg>
                      ) : (
                        <span>{i + 1}</span>
                      )}
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

            <div className={styles.summaryTotal}>
              <span>Full pack total</span>
              <strong>{formatCurrency(total)}</strong>
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
              className={styles.payButton}
              onClick={handlePayDeposit}
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting
                ? "Preparing secure deposit..."
                : `Pay Deposit ${formatCurrency(plan.deposit)}`}
            </Button>

            <p className={styles.securityNote}>
              Secure payment via Paystack. Pexpacks never stores your card details.
            </p>
          </div>
        </aside>
      </main>

      <div className={styles.mobileCta}>
        <Button
          type="button"
          variant="primary"
          className={styles.fullWidth}
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
