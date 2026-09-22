"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import { calculateTrayTotal } from "@/lib/order/calculateTrayTotal";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatInstalment, happyPayInstalment } from "@/lib/order/happyPay";
import { calculatePexcoverTotal } from "@/lib/pricing/pexcover";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { HappyPayLogo } from "@/components/bnpl/HappyPayLogo";
import { cn } from "@/lib/utils";
import { buildWhatsAppHref } from "@/data/contact";

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
  items?: Parameters<typeof calculatePexcoverTotal>[0];
}) {
  const pexcoverCost = pack.wantsPexcover
    ? calculatePexcoverTotal(pack.items).pexcoverTotalRands
    : 0;
  return pack.totalPrice + pexcoverCost;
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
    packs.map((p) => p.learnerName || ""),
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
    if (!consent)
      nextErrors.consent = "Please accept the Happy Pay terms consent.";

    // Validate each learner name
    packs.forEach((_, index) => {
      const name = learnerInputs[index]?.trim() || "";
      if (!name || name.length < 2) {
        nextErrors[`learner_${index}`] =
          `Please enter learner ${index + 1}'s name.`;
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
            learnerName:
              learnerInputs[pi]?.trim() || pack.learnerName?.trim() || "",
            schoolSlug: pack.schoolSlug || "",
            schoolName: pack.schoolName || "",
            grade: pack.grade || "",
            gradeSlug: pack.gradeSlug || "",
            packName: pack.packName,
            packMode: pack.packMode,
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
          isBnpl: true,
          orderId: idempotencyKeyRef.current,
          amount: total,
          customerEmail: buyerEmail.trim().toLowerCase(),
          estimatedTotal: total,
          deliveryMethod: "school_collection",
          primarySchoolSlug:
            uniqueSchools.length > 0
              ? uniqueSchools[0].slug
              : packs[0]?.schoolSlug || "",
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
          : "Failed to initialize payment.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (packs.length === 0) {
    return (
      <div className="w-full min-h-screen py-12 px-4 md:px-8 bg-[var(--pex-bg-soft)] flex items-center justify-center font-[family-name:var(--font-body)]">
        <div className="max-w-md w-full mx-auto text-center bg-white p-6 sm:p-8 rounded-[var(--radius-card)] border border-[var(--pex-border)] shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--pex-keppel)] mb-2">Happy Pay</p>
          <h1 className="text-2xl font-bold text-[var(--pex-navy)] font-[family-name:var(--font-heading)] mb-3">No packs in your order.</h1>
          <p className="text-sm text-[var(--pex-muted)] leading-relaxed mb-6">
            Choose a school pack before splitting your payment with Happy Pay.
          </p>
          <Button href="/schools" variant="primary" size="lg" className="w-full sm:w-auto">
            Find a school pack
          </Button>
        </div>
      </div>
    );
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
          href={buildWhatsAppHref(
            "Hi Pexpacks, I need help with Happy Pay checkout.",
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--pex-muted)] hover:text-[var(--pex-keppel)] transition-colors"
        >
          Need help?
        </a>
      </header>

      <div className="max-w-[var(--layout-max-width)] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        <section className="col-span-1 lg:col-span-2 bg-white rounded-[var(--radius-card)] p-6 sm:p-8 border border-[var(--pex-border)] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-4 mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--pex-keppel)] mb-0">Buy Now Pay Later</p>
            <HappyPayLogo tone="dark" className="h-6 w-auto" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--pex-navy)] font-[family-name:var(--font-heading)] m-0 mb-2 leading-tight max-w-2xl">
            Split in 2 with Happy Pay &mdash; Pay {formatInstalment(instalment)}{" "}
            Today
          </h1>
          <p className="text-sm sm:text-base text-[var(--pex-muted)] m-0 max-w-xl leading-relaxed">
            Pay 50% now and the rest in 30 days. Interest-free, no hidden fees.
            Happy Pay settles your full order with Pexpacks today so your packs
            are dispatched right away.
          </p>

          <ol className="list-none m-0 p-0 grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-xl mt-6">
            <li className="grid gap-1.5 p-3.5 sm:p-4 border border-[var(--pex-border)] rounded-[var(--radius-card)] bg-[var(--pex-bg-soft)]">
              <span className="w-fit px-2.5 py-1 rounded-full bg-[rgba(33,158,154,0.12)] text-[var(--pex-keppel)] text-[11px] font-extrabold tracking-wider uppercase">Payment 1</span>
              <span className="grid gap-0.5">
                <strong className="text-[var(--pex-navy)] text-sm font-semibold">Today</strong>
                <span className="text-[var(--pex-coral)] font-[family-name:var(--font-heading)] text-lg sm:text-xl font-black">{formatInstalment(instalment)}</span>
              </span>
            </li>
            <li className="grid gap-1.5 p-3.5 sm:p-4 border border-[var(--pex-border)] rounded-[var(--radius-card)] bg-[var(--pex-bg-soft)]">
              <span className="w-fit px-2.5 py-1 rounded-full bg-[rgba(235,94,85,0.12)] text-[var(--pex-coral)] text-[11px] font-extrabold tracking-wider uppercase">Payment 2</span>
              <span className="grid gap-0.5">
                <strong className="text-[var(--pex-navy)] text-sm font-semibold">In 30 days</strong>
                <span className="text-[var(--pex-coral)] font-[family-name:var(--font-heading)] text-lg sm:text-xl font-black">{formatInstalment(instalment)}</span>
              </span>
            </li>
          </ol>
        </section>

        <form
          className="flex flex-col gap-8"
          aria-label="Happy Pay customer details"
          onSubmit={(e) => e.preventDefault()}
        >
          <section
            className="bg-white rounded-[var(--radius-card)] p-6 sm:p-8 border border-[var(--pex-border)] shadow-[var(--shadow-card)] outline-none"
            aria-labelledby="hp-details-heading"
          >
            <div className="flex items-start gap-4 mb-6">
              <span className="w-8 h-8 rounded-full bg-[var(--pex-navy)] text-white text-sm font-bold flex items-center justify-center shrink-0">1</span>
              <div>
                <h2 id="hp-details-heading" className="text-xl font-bold text-[var(--pex-navy)] font-[family-name:var(--font-heading)] m-0 mb-1">Your details</h2>
                <p className="text-xs sm:text-sm text-[var(--pex-muted)] m-0">
                  Happy Pay needs these details to set up your split payment.
                  Your pack is only reserved after you approve the first
                  payment.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
          <section
            className="bg-white rounded-[var(--radius-card)] p-6 sm:p-8 border border-[var(--pex-border)] shadow-[var(--shadow-card)] outline-none"
            aria-labelledby="hp-learners-heading"
          >
            <div className="flex items-start gap-4 mb-6">
              <span className="w-8 h-8 rounded-full bg-[var(--pex-navy)] text-white text-sm font-bold flex items-center justify-center shrink-0">2</span>
              <div>
                <h2 id="hp-learners-heading" className="text-xl font-bold text-[var(--pex-navy)] font-[family-name:var(--font-heading)] m-0 mb-1">Learner details</h2>
                <p className="text-xs sm:text-sm text-[var(--pex-muted)] m-0">
                  Add a name for each learner so we know which pack belongs to
                  whom.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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

          <section
            className="bg-white rounded-[var(--radius-card)] p-6 sm:p-8 border border-[var(--pex-border)] shadow-[var(--shadow-card)] outline-none"
            aria-label="Happy Pay consent"
          >
            <label className="flex items-start gap-3 cursor-pointer text-xs sm:text-sm text-[var(--pex-muted)] leading-relaxed">
              <input
                type="checkbox"
                id="hp-consent"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked);
                  clearFieldError("consent");
                }}
                aria-invalid={!!errors.consent}
                className="mt-1 w-4 h-4 accent-[var(--pex-keppel)] rounded shrink-0 cursor-pointer"
              />
              <span>
                I understand that by paying with Happy Pay, I will be
                split-billed 2 equal interest-free instalments (50% today, 50%
                in 30 days) charged to the payment method I approve with Happy
                Pay. Happy Pay is an independent company and Pexpacks acts only
                as a referral consultant. I have read and agree to the{" "}
                <a href="/happy-pay-terms" target="_blank" className="relative inline-block font-medium text-[var(--pex-keppel)] no-underline after:absolute after:bottom-[-3px] after:left-0 after:h-[1.5px] after:w-0 after:bg-current after:transition-[width] after:duration-200 after:ease-out hover:text-[var(--pex-keppel-dark)] hover:after:w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pex-keppel)] focus-visible:ring-offset-2 motion-reduce:after:transition-none">
                  happy pay terms
                </a>
                ,{" "}
                <a href="/privacy-policy" target="_blank" className="relative inline-block font-medium text-[var(--pex-keppel)] no-underline after:absolute after:bottom-[-3px] after:left-0 after:h-[1.5px] after:w-0 after:bg-current after:transition-[width] after:duration-200 after:ease-out hover:text-[var(--pex-keppel-dark)] hover:after:w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pex-keppel)] focus-visible:ring-offset-2 motion-reduce:after:transition-none">
                  privacy policy
                </a>
                , and{" "}
                <a href="/terms" target="_blank" className="relative inline-block font-medium text-[var(--pex-keppel)] no-underline after:absolute after:bottom-[-3px] after:left-0 after:h-[1.5px] after:w-0 after:bg-current after:transition-[width] after:duration-200 after:ease-out hover:text-[var(--pex-keppel-dark)] hover:after:w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pex-keppel)] focus-visible:ring-offset-2 motion-reduce:after:transition-none">
                  terms of use
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
          className="w-full lg:sticky lg:top-24"
          aria-labelledby="hp-summary-heading"
        >
          <div className="bg-white rounded-[var(--radius-card)] p-6 sm:p-8 border border-[var(--pex-border)] shadow-[var(--shadow-card)]">
            <div className="flex justify-between items-start pb-4 border-b border-[var(--pex-border)] mb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--pex-keppel)] mb-2">Happy Pay plan</p>
                <h2 id="hp-summary-heading" className="text-xl font-bold text-[var(--pex-navy)] font-[family-name:var(--font-heading)] m-0">Your split</h2>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#0B5C50] text-white shadow-sm">
                {packs.length} {packs.length === 1 ? "pack" : "packs"}
              </span>
            </div>

            <div className="flex flex-col gap-3 mb-6 divide-y divide-[var(--pex-border)]">
              {packs.map((pack, index) => {
                const lName = learnerInputs[index]?.trim();
                const learnerLabel = lName
                  ? `Learner ${index + 1}: ${lName}`
                  : `Learner ${index + 1}: Add name`;
                return (
                  <div key={pack.id} className="pt-3 first:pt-0">
                    <div className="flex justify-between items-start gap-4 mb-1">
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
                            className={cn(
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
                      <span className="text-sm font-bold text-[var(--pex-navy)] shrink-0">{formatCurrency(getPackTotal(pack))}</span>
                    </div>
                    <p className="text-xs text-[var(--pex-muted)] m-0">
                      {pack.schoolName || "School pack"}
                      {pack.grade ? ` · ${pack.grade}` : ""}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2.5 py-4 border-t border-b border-[var(--pex-border)] mb-6 text-xs sm:text-sm text-[var(--pex-muted)] [&>div]:flex [&>div]:justify-between [&>div]:items-center [&>div>strong]:text-[var(--pex-navy)] [&>div>strong]:font-semibold">
              <div>
                <span>Total order</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
              <div>
                <span>Today (50%)</span>
                <strong className="text-[var(--pex-coral)] font-bold">{formatInstalment(instalment)}</strong>
              </div>
              <div>
                <span>In 30 days (50%)</span>
                <strong className="text-[var(--pex-coral)] font-bold">{formatInstalment(instalment)}</strong>
              </div>
              <div className="!text-[11px] !text-[var(--pex-keppel)] !font-semibold pt-1">
                0% interest. No application fees.
              </div>
            </div>

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
                ? "Connecting to Happy Pay..."
                : `Confirm & Pay 1st Instalment`}
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
              Your details are secure. Happy Pay handles the payment on behalf
              of Pexpacks.
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
            ? "Connecting..."
            : `Pay 1st Instalment ${formatInstalment(instalment)}`}
        </Button>
      </div>
    </div>
  );
}
