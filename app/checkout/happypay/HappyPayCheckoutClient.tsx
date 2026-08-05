"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import { calculateTrayTotal } from "@/lib/order/calculateTrayTotal";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatInstalment, happyPayInstalment } from "@/lib/order/happyPay";
import { PEXCOVER_PRICE } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { HappyPayLogo } from "@/components/bnpl/HappyPayLogo";
import clsx from "clsx";
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

  const [fullName, setFullName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [consent, setConsent] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handlePay() {
    if (submitting) return;
    if (!validate()) return;

    setSubmitError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/ozow/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName: fullName.trim(),
          buyerEmail: buyerEmail.trim().toLowerCase(),
          buyerPhone: normalisePhone(buyerPhone),
          packs: packs.map((pack) => ({
            learnerName: pack.learnerName?.trim() || "",
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
          estimatedTotal: total,
          deliveryMethod: "school_collection",
          primarySchoolSlug:
            uniqueSchools.length > 0 ? uniqueSchools[0].slug : packs[0]?.schoolSlug || "",
          notes: "Happy Pay split payment (2 x instalments)",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.url) {
        throw new Error(
          result.error || "We could not start your Happy Pay payment right now."
        );
      }

      window.location.href = result.url;
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We could not start your payment right now. Please try again or contact Pexpacks on WhatsApp."
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
          href="https://wa.me/27763456622?text=Hi Pexpacks, I need help with Happy Pay checkout."
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
            <p className={checkoutStyles.checkoutKicker}>Happy Pay BNPL</p>
            <HappyPayLogo tone="dark" />
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

          <section className={styles.consentCard} aria-label="Happy Pay consent">
            <label className={styles.consentField}>
              <input
                type="checkbox"
                id="consent"
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
                  Happy Pay terms
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
              {packs.map((pack, index) => (
                <div key={pack.id} className={styles.summaryPack}>
                  <div className={styles.summaryPackTop}>
                    <strong>{pack.packName}</strong>
                    <span>{formatCurrency(getPackTotal(pack))}</span>
                  </div>
                  <p>
                    {pack.schoolName || "School pack"}
                    {pack.grade ? ` · ${pack.grade}` : ""}
                    {index >= 0 ? ` · Learner ${index + 1}` : ""}
                  </p>
                </div>
              ))}
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
