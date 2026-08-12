"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import { calculateTrayTotal } from "@/lib/order/calculateTrayTotal";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatInstalment, happyPayInstalment } from "@/lib/order/happyPay";
import { PEXCOVER_PRICE } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { HappyPayLogo } from "@/components/bnpl/HappyPayLogo";
import clsx from "clsx";
import { buildWhatsAppHref } from "@/data/contact";
import styles from "./HappyPayCheckout.module.css";
import checkoutStyles from "@/app/checkout/Checkout.module.css";

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
  const digits = normalisePhone(value);
  return (
    (digits.startsWith("0") && digits.length === 10) ||
    (digits.startsWith("27") && digits.length === 11) ||
    (digits.startsWith("0027") && digits.length === 13)
  );
}

function getPackTotal(pack: {
  totalPrice: number;
  wantsPexcover?: boolean;
}) {
  return pack.totalPrice + (pack.wantsPexcover ? PEXCOVER_PRICE : 0);
}

export function HappyPayCheckoutClient() {
  const router = useRouter();
  const packs = usePackTrayStore((s) => s.packs);
  const openTray = usePackTrayStore((s) => s.openTray);
  const updatePackDetails = usePackTrayStore((s) => s.updatePackDetails);

  const [fullName, setFullName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [consent, setConsent] = useState(false);

  // Per-pack learner names — inline edit-on-click pattern
  const [learnerInputs, setLearnerInputs] = useState<string[]>(() =>
    packs.map((p) => p.learnerName || "")
  );
  const [editNameIndex, setEditNameIndex] = useState<number | null>(null);
  const fieldRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  // Keep learnerInputs in sync when packs change (e.g. pack removed)
  useEffect(() => {
    setLearnerInputs((prev) => {
      if (prev.length === packs.length) return prev;
      return packs.map((pack, index) => prev[index] ?? pack.learnerName ?? "");
    });
  }, [packs]);

  const total = useMemo(() => calculateTrayTotal(packs), [packs]);
  const instalment = happyPayInstalment(total);

  const uniqueSchools = useMemo(() => {
    const map = new Map<string, { name: string; slug: string }>();
    packs.forEach((p) => {
      if (p.schoolSlug && p.schoolName && !map.has(p.schoolSlug)) {
        map.set(p.schoolSlug, { name: p.schoolName, slug: p.schoolSlug });
      }
    });
    return Array.from(map.values());
  }, [packs]);

  const canSubmit = packs.length > 0 && total > 0 && !submitting;

  const handleBackToOrder = useCallback(() => {
    openTray();
    router.back();
  }, [openTray, router]);

  // ── Learner name handlers ────────────────────────────────────────────────
  const handleLearnerNameChange = useCallback(
    (index: number, value: string) => {
      setLearnerInputs((prev) => {
        const next = [...prev];
        next[index] = value;
        return next;
      });
    },
    []
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
    [packs, learnerInputs, updatePackDetails]
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
    [packs]
  );

  function clearFieldError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};

    if (packs.length === 0)
      nextErrors.packs = "Choose a school pack before checkout.";
    if (total <= 0) nextErrors.total = "Your order total must be greater than zero.";
    if (!fullName.trim() || fullName.trim().length < 2)
      nextErrors.fullName = "Please enter your full name.";
    if (!buyerPhone.trim()) nextErrors.buyerPhone = "Please enter your phone number.";
    else if (!isLikelySaPhone(buyerPhone))
      nextErrors.buyerPhone = "Please enter a valid South African phone number.";
    if (!buyerEmail.trim()) nextErrors.buyerEmail = "Please enter your email address.";
    else if (!isValidEmail(buyerEmail.trim()))
      nextErrors.buyerEmail = "Please enter a valid email address.";
    if (!consent) nextErrors.consent = "Please accept the Happy Pay terms consent.";

    // Validate each learner name
    packs.forEach((_, index) => {
      const name = learnerInputs[index]?.trim() || "";
      if (!name || name.length < 2) {
        nextErrors[`learner_${index}`] = `Please enter learner ${index + 1}'s name.`;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handlePay() {
    if (submitting) return;
    if (!validate()) return;

    setSubmitError(null);
    setSubmitting(true);

    try {
      if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current = crypto.randomUUID();
      }

      const response = await fetch("/api/ozow/checkout", {
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
            modifications: pack.modifications,
            wantsPexcover: pack.wantsPexcover || false,
            pexcoverPrice: pack.wantsPexcover ? PEXCOVER_PRICE : 0,
            basePackPrice: pack.totalPrice,
          })),
          isTrayOrder: true,
          isBnpl: true,
          orderId: idempotencyKeyRef.current,
          amount: total,
          customerEmail: buyerEmail.trim().toLowerCase(),
          estimatedTotal: total,
          deliveryMethod: "school_collection",
          primarySchoolSlug:
            uniqueSchools.length > 0 ? uniqueSchools[0].slug : packs[0]?.schoolSlug || "",
          notes: "Happy Pay split payment (2 x instalments)",
          idempotencyKey: idempotencyKeyRef.current,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        console.error("Ozow Checkout Error Response:", response.status, data);
        const errorMessage =
          data.error ||
          data.message ||
          "Failed to initialize Happy Pay payment.";
        setSubmitError(errorMessage);
        return;
      }

      window.location.href = data.url;
      return;
    } catch (error) {
      console.error("Ozow Checkout Exception:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to initialize payment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (packs.length === 0) {
    return (
      <div className={checkoutStyles.checkoutShell}>
        <div className={checkoutStyles.emptyCheckout}>
          <p className={checkoutStyles.checkoutKicker}>Happy Pay</p>
          <h1>No packs in your order.</h1>
          <p>Choose a school pack before splitting your payment with Happy Pay.</p>
          <Button href="/schools" variant="primary" size="lg">
            Find a school pack
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={checkoutStyles.checkoutShell}>
      <header className={checkoutStyles.checkoutHeader}>
        <button
          type="button"
          className={checkoutStyles.backToOrder}
          onClick={handleBackToOrder}
        >
          Back to order
        </button>
        <a
          href={buildWhatsAppHref("Hi Pexpacks, I need help with Happy Pay checkout.")}
          target="_blank"
          rel="noopener noreferrer"
          className={checkoutStyles.helpLink}
        >
          Need help?
        </a>
      </header>

      <div className={checkoutStyles.checkoutGrid}>
        <section className={clsx(checkoutStyles.stepCard, checkoutStyles.checkoutHero, styles.hero)}>
          <div className={styles.heroTop}>
            <p className={checkoutStyles.checkoutKicker}>Buy Now Pay Later</p>
            <HappyPayLogo tone="dark" className={styles.heroLogo} />
          </div>
          <h1>
            Split in 2 with Happy Pay &mdash; Pay {formatInstalment(instalment)}{" "}
            Today
          </h1>
          <p>
            Pay 50% now and the rest in 30 days. Interest-free, no hidden fees.
            Happy Pay settles your full order with Pexpacks today so your packs
            are dispatched right away.
          </p>

          <ol className={styles.schedule}>
            <li className={styles.scheduleItem}>
              <span className={styles.scheduleBadge}>Payment 1</span>
              <span className={styles.scheduleMeta}>
                <strong>Today</strong>
                <span>{formatInstalment(instalment)}</span>
              </span>
            </li>
            <li className={styles.scheduleItem}>
              <span className={styles.scheduleBadge}>Payment 2</span>
              <span className={styles.scheduleMeta}>
                <strong>In 30 days</strong>
                <span>{formatInstalment(instalment)}</span>
              </span>
            </li>
          </ol>
        </section>

        <form
          className={styles.mainColumn}
          aria-label="Happy Pay customer details"
          onSubmit={(e) => e.preventDefault()}
        >
          <section className={styles.detailsSection} aria-labelledby="hp-details-heading">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNumber}>1</span>
              <div>
                <h2 id="hp-details-heading">Your details</h2>
                <p>
                  Happy Pay needs these details to set up your split payment.
                  Your pack is only reserved after you approve the first payment.
                </p>
              </div>
            </div>

            <div className={styles.formGrid}>
              <Input
                id="fullName"
                label="Full name"
                helper="Name on your Happy Pay account."
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
                helper="Used for payment approval and order updates."
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
                helper="Happy Pay sends your instalment schedule here."
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

          {/* ── Learner details ─────────────────────────────────────── */}
          <section className={styles.detailsSection} aria-labelledby="hp-learners-heading">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNumber}>2</span>
              <div>
                <h2 id="hp-learners-heading">Learner details</h2>
                <p>Add a name for each learner so we know which pack belongs to whom.</p>
              </div>
            </div>

            <div className={styles.formGrid}>
              {packs.map((pack, index) => (
                <div key={pack.id}>
                  <Input
                    ref={(node) => {
                      fieldRefs.current[`learner_${index}`] = node;
                    }}
                    id={`learnerName_${index}`}
                    label={
                      packs.length === 1
                        ? "Learner name"
                        : `Learner ${index + 1} name`
                    }
                    helper={`For: ${pack.packName}${pack.grade ? ` · ${pack.grade}` : ""}`}
                    type="text"
                    value={learnerInputs[index] || ""}
                    onChange={(e) => {
                      handleLearnerNameChange(index, e.target.value);
                      clearFieldError(`learner_${index}`);
                    }}
                    onBlur={() => handleLearnerNameBlur(index)}
                    placeholder="e.g. Amahle Dlamini"
                    error={errors[`learner_${index}`]}
                    autoComplete="off"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className={styles.consentCard} aria-label="Happy Pay consent">
            <label className={styles.consentField}>
              <input
                type="checkbox"
                id="hp-consent"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked);
                  clearFieldError("consent");
                }}
                aria-invalid={!!errors.consent}
              />
              <span>
                I understand that by paying with Happy Pay, I will be split-billed
                2 equal interest-free instalments (50% today, 50% in 30 days)
                charged to the payment method I approve with Happy Pay. Happy Pay
                is an independent company and Pexpacks acts only as a referral
                consultant. I have read and agree to the{" "}
                <a href="/happy-pay-terms" target="_blank">
                  happy pay terms
                </a>
                ,{" "}
                <a href="/privacy-policy" target="_blank">
                  privacy policy
                </a>
                , and{" "}
                <a href="/terms" target="_blank">
                  terms of use
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

        <aside className={checkoutStyles.summaryColumn} aria-labelledby="hp-summary-heading">
          <div className={checkoutStyles.summaryCard}>
            <div className={styles.summaryHeader}>
              <div>
                <p className={checkoutStyles.checkoutKicker}>Happy Pay plan</p>
                <h2 id="hp-summary-heading">Your split</h2>
              </div>
              <span>
                {packs.length} {packs.length === 1 ? "pack" : "packs"}
              </span>
            </div>

            <div className={styles.summaryPacks}>
              {packs.map((pack, index) => {
                const lName = learnerInputs[index]?.trim();
                const learnerLabel = lName
                  ? `Learner ${index + 1}: ${lName}`
                  : `Learner ${index + 1}: Add name`;
                return (
                  <div key={pack.id} className={styles.summaryPack}>
                    <div className={styles.summaryPackTop}>
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
                            onKeyDown={(e) => handleLearnerNameKeyDown(e, index)}
                            placeholder="Learner name"
                            aria-label={`Learner ${index + 1} name`}
                            autoFocus
                          />
                        ) : (
                          <button
                            type="button"
                            className={clsx(
                              styles.learnerLabel,
                              errors[`learner_${index}`] && styles.learnerLabelError
                            )}
                            onClick={() => setEditNameIndex(index)}
                            aria-label={`Edit learner ${index + 1} name`}
                          >
                            {learnerLabel}
                          </button>
                        )}
                      </div>
                      <span>{formatCurrency(getPackTotal(pack))}</span>
                    </div>
                    <p>
                      {pack.schoolName || "School pack"}
                      {pack.grade ? ` · ${pack.grade}` : ""}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className={styles.splitSummary}>
              <div>
                <span>Total order</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
              <div>
                <span>Today (50%)</span>
                <strong>{formatInstalment(instalment)}</strong>
              </div>
              <div>
                <span>In 30 days (50%)</span>
                <strong>{formatInstalment(instalment)}</strong>
              </div>
              <div className={styles.splitNote}>
                0% interest. No application fees.
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              className={clsx(checkoutStyles.fullWidth, styles.desktopPayButton)}
              onClick={handlePay}
              disabled={!canSubmit}
              aria-busy={submitting}
            >
              {submitting
                ? "Connecting to Happy Pay..."
                : `Confirm & Pay 1st Instalment`}
            </Button>

            <Button
              type="button"
              variant="outline"
              className={checkoutStyles.fullWidth}
              onClick={handleBackToOrder}
            >
              Edit order
            </Button>

            <p className={checkoutStyles.summarySecurity}>
              Your details are secure. Happy Pay handles the payment on behalf of
              Pexpacks.
            </p>
          </div>
        </aside>
      </div>

      <div className={checkoutStyles.mobileStickyCta}>
        <Button
          type="button"
          variant="primary"
          className={checkoutStyles.fullWidth}
          onClick={handlePay}
          disabled={!canSubmit}
          aria-busy={submitting}
        >
          {submitting
            ? "Connecting..."
            : `Pay 1st Instalment ${formatInstalment(instalment)}`}
        </Button>
      </div>
    </div>
  );
}
