"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import { calculateTrayTotal } from "@/lib/order/calculateTrayTotal";
import { formatCurrency } from "@/lib/formatCurrency";
import { PEXCOVER_PRICE } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import styles from "@/app/checkout/Checkout.module.css";

type FulfilmentOption = "School collection" | "Delivery" | "Collection point";
type ContactMethod = "whatsapp" | "phone" | "email";

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

export function TrayCheckoutClient() {
  const router = useRouter();
  const packs = usePackTrayStore((s) => s.packs);
  const clearPacks = usePackTrayStore((s) => s.clearPacks);
  const openTray = usePackTrayStore((s) => s.openTray);
  const updatePackDetails = usePackTrayStore((s) => s.updatePackDetails);

  const [editNameIndex, setEditNameIndex] = useState<number | null>(null);
  const [learnerInputs, setLearnerInputs] = useState<string[]>(
    () => packs.map((p) => p.learnerName || "")
  );

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
      if (name && name !== (pack.learnerName || "")) {
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

  const handleBackToOrder = useCallback(() => {
    openTray();
    router.back();
  }, [openTray, router]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [preferredContactMethod] =
    useState<ContactMethod>("whatsapp");
  const [consent, setConsent] = useState(false);

  const [fulfilmentOption, setFulfilmentOption] =
    useState<FulfilmentOption>("School collection");
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

  const total = useMemo(() => calculateTrayTotal(packs), [packs]);

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
    if (isSingleSchool) {
      setFulfilmentOption("School collection");
    }
  }, [isSingleSchool]);

  const deliveryAddressSummary = useMemo(() => {
    return [address, suburb, city, province, postalCode]
      .filter(Boolean)
      .join(", ");
  }, [address, suburb, city, province, postalCode]);

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

    if (!firstName.trim() || firstName.trim().length < 2)
      nextErrors.firstName = "Please enter your first name.";
    if (!lastName.trim() || lastName.trim().length < 2)
      nextErrors.lastName = "Please enter your surname.";
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
      if (!(learnerInputs[i]?.trim())) {
        nextErrors[`learner_${i}`] = `Please enter a name for learner ${i + 1}.`;
      }
    }

    if (fulfilmentOption === "Delivery") {
      if (!address.trim()) nextErrors.address = "Please enter the delivery address.";
      if (!suburb.trim()) nextErrors.suburb = "Please enter the suburb.";
      if (!city.trim()) nextErrors.city = "Please enter the city.";
      if (!province.trim()) nextErrors.province = "Please enter the province.";
    }

    if (fulfilmentOption === "School collection" && uniqueSchools.length > 1 && !multiSchoolDrop) {
      nextErrors.multiSchoolDrop = "Select which school the box should be dropped at.";
    }
    if (!consent)
      nextErrors.consent = "Please accept the order processing consent.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handlePay() {
    if (!validate()) return;

    setSubmitError(null);
    setSubmitting(true);



    const notes = [
      deliveryNotes.trim() ? `Notes: ${deliveryNotes.trim()}` : "",
      fulfilmentOption === "Delivery"
        ? `Address: ${deliveryAddressSummary}`
        : "",
      preferredContactMethod
        ? `Preferred contact: ${preferredContactMethod}`
        : "",
    ]
      .filter(Boolean)
      .join(" | ");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName: `${firstName.trim()} ${lastName.trim()}`.trim(),
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
          estimatedTotal: total,
          deliveryMethod:
            fulfilmentOption === "School collection"
              ? "school_collection"
              : fulfilmentOption === "Delivery"
                ? "delivery"
                : "collection_point",
          primarySchoolSlug:
            uniqueSchools.length > 1
              ? multiSchoolDrop
              : uniqueSchools[0]?.slug || packs[0]?.schoolSlug || "",
          notes: notes || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.checkoutUrl) {
        const msg =
          result.errors && typeof result.errors === "object"
            ? Object.values(result.errors).join(". ")
            : result.error || "Unable to continue to Paystack";
        throw new Error(msg);
      }

      clearPacks();
      window.location.href = result.checkoutUrl;
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We could not continue to Paystack right now. Please try again or contact Pexpacks on WhatsApp."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (packs.length === 0) {
    return (
      <div className={styles.checkoutShell}>
        <div className={styles.checkoutGrid}>
          <div className={styles.stepCard}>
            <h1>No packs in your order</h1>
            <p>Add a school pack before checking out.</p>
            <Link href="/schools" className={styles.backLink}>
              Find a school pack
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutShell}>
      <div className={styles.checkoutHeader}>
        <button
          type="button"
          className={styles.backToOrder}
          onClick={handleBackToOrder}
        >
          Back to Order
        </button>
        <a
          href={`https://wa.me/27763456622?text=Hi Pexpacks, I need help with checkout.`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.helpLink}
        >
          Need Help?
        </a>
      </div>

      <div className={styles.checkoutGrid}>
        <div className={styles.mainColumn}>
          <section className={styles.stepCard}>
            <div className={styles.stepIntro}>
              <h1 tabIndex={-1}>Complete Your Order</h1>
              <p>
                Review all packs, enter your details, and pay securely once.
              </p>
            </div>

            {/* Learner Packs Review */}
            <div style={{ display: "grid", gap: 16, marginBottom: 28 }}>
              <h2 style={{ color: "var(--pex-primary)", fontFamily: "var(--font-heading)", fontSize: "1.2rem", margin: 0 }}>
                Learner Packs ({packs.length})
              </h2>
              {packs.map((pack, index) => (
                <div
                  key={pack.id}
                  style={{
                    padding: 16,
                    border: "1px solid var(--pex-border)",
                    borderRadius: "var(--radius-card)",
                    background: "var(--pex-bg-soft)",
                  }}
                >
                  <div style={{ display: "grid", gap: 8 }}>
                    {/* School Name & Grade (Priority 1) */}
                    <div>
                      {pack.schoolName ? (
                        <h3 style={{ margin: 0, color: "var(--pex-navy)", fontSize: 18, fontWeight: 900, fontFamily: "var(--font-heading)", lineHeight: 1.25 }}>
                          {pack.schoolName}
                        </h3>
                      ) : null}
                      {pack.grade ? (
                        <span style={{ color: "var(--pex-keppel)", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 2, display: "block" }}>
                          {pack.grade}
                        </span>
                      ) : null}
                    </div>

                    {/* Learner Name (Priority 2) */}
                    <div style={{ display: "grid", gap: 4 }}>
                      <p style={{ margin: 0, color: "var(--pex-text-muted)", fontSize: 12, fontWeight: 750, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Learner {index + 1}
                      </p>
                      {editNameIndex === index ? (
                        <Input
                          type="text"
                          value={learnerInputs[index] || ""}
                          onChange={(e) => handleLearnerNameChange(index, e.target.value)}
                          onBlur={() => handleLearnerNameBlur(index)}
                          onKeyDown={(e) => handleLearnerNameKeyDown(e, index)}
                          placeholder="Enter Learner Name"
                          aria-label={`Learner ${index + 1} name`}
                          autoFocus
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            textTransform: "capitalize",
                            color: "var(--pex-primary)",
                            border: "2px solid var(--pex-keppel)",
                            borderRadius: "var(--radius-input)",
                            padding: "6px 10px",
                            background: "#fff",
                            width: "100%",
                            boxSizing: "border-box",
                          }}
                        />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: learnerInputs[index]?.trim() ? "var(--pex-primary)" : "var(--pex-text-muted)", fontSize: 15, fontWeight: 700, textTransform: "capitalize" }}>
                            {learnerInputs[index]?.trim() || "Enter Learner Name"}
                          </span>
                          <Button
                            type="button"
                            variant="secondary"
                            className="rounded-full"
                            style={{ padding: 6, minWidth: 32, minHeight: 32, height: 32, width: 32 }}
                            onClick={() => setEditNameIndex(index)}
                            ariaLabel={`Edit learner ${index + 1} name`}
                          >
                            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Pack Info & Pexcover Addon */}
                    <div style={{ display: "grid", gap: 2 }}>
                      <span style={{ color: "var(--pex-text-muted)", fontSize: 13 }}>
                        {pack.packName} &middot; {pack.packMode === "full" ? "Full Pack" : "Customised"} &middot; {pack.items.length} {pack.items.length === 1 ? "item" : "items"}
                      </span>
                      {pack.wantsPexcover ? (
                        <span style={{ color: "var(--pex-keppel)", fontSize: 13, fontWeight: 700 }}>
                          ✓ Includes Pexcover Book Covering (+{formatCurrency(PEXCOVER_PRICE)})
                        </span>
                      ) : null}
                    </div>

                    {/* Line Item Total */}
                    <strong style={{ color: "var(--pex-coral)", fontSize: 18 }}>
                      {formatCurrency(pack.totalPrice + (pack.wantsPexcover ? PEXCOVER_PRICE : 0))}
                    </strong>
                  </div>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderTop: "2px solid var(--pex-coral)",
                  fontWeight: 900,
                  fontSize: 20,
                  color: "var(--pex-primary)",
                }}
              >
                <span>Combined total</span>
                <span style={{ color: "var(--pex-coral)" }}>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Customer Details */}
            <h2 style={{ color: "var(--pex-primary)", fontFamily: "var(--font-heading)", fontSize: "1.2rem", margin: "0 0 16px" }}>
              Customer Details
            </h2>
            <div className={styles.formGrid}>
              <Input
                id="firstName"
                label="First name"
                type="text"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); clearFieldError("firstName"); }}
                placeholder="Enter first name"
                error={errors.firstName}
                autoComplete="given-name"
              />
              <Input
                id="lastName"
                label="Surname"
                type="text"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); clearFieldError("lastName"); }}
                placeholder="Enter surname"
                error={errors.lastName}
                autoComplete="family-name"
              />

              <Input
                id="buyerPhone"
                label="Phone number"
                type="tel"
                value={buyerPhone}
                onChange={(e) => { setBuyerPhone(e.target.value); clearFieldError("buyerPhone"); }}
                placeholder="e.g. 078 003 6048"
                error={errors.buyerPhone}
                autoComplete="tel"
              />

              <Input
                id="buyerEmail"
                label="Email address"
                type="email"
                value={buyerEmail}
                onChange={(e) => { setBuyerEmail(e.target.value); clearFieldError("buyerEmail"); }}
                placeholder="name@example.com"
                error={errors.buyerEmail}
                autoComplete="email"
              />

              {/* Learner name errors */}
              {packs.map((pack, index) => {
                const errKey = `learner_${index}`;
                return errors[errKey] ? (
                  <p key={errKey} className={styles.fieldError} style={{ gridColumn: "1 / -1" }}>
                    Learner {index + 1} ({pack.packName}): {errors[errKey]}
                  </p>
                ) : null;
              })}
            </div>

            {/* Delivery */}
            <h2 className={styles.checkoutSectionTitle}>
              Delivery or Collection
            </h2>
            <div className={styles.formGrid}>
              <div className={styles.optionFieldset} style={{ gridColumn: "1 / -1" }}>
                <div className={styles.deliveryOptions}>
                  {(["School collection", "Delivery", "Collection point"] as const).map((opt) => (
                    <label
                      key={opt}
                      className={`${styles.deliveryOption} ${fulfilmentOption === opt ? styles.deliveryOptionSelected : ""}`}
                    >
                      <Input
                        type="radio"
                        name="fulfilment"
                        value={opt}
                        checked={fulfilmentOption === opt}
                        onChange={() => setFulfilmentOption(opt)}
                        className={styles.srOnly}
                        wrapperClassName="!contents"
                      />
                      <div className={styles.deliveryIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          {opt === "School collection" ? (
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                          ) : opt === "Delivery" ? (
                            <>
                              <rect x="1" y="3" width="15" height="13" rx="2" />
                              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                              <circle cx="5.5" cy="18.5" r="2.5" />
                              <circle cx="18.5" cy="18.5" r="2.5" />
                            </>
                          ) : (
                            <path d="M21 10V6a2 2 0 00-2-2H5a2 2 0 00-2 2v4m18 0v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6m18 0H3" />
                          )}
                        </svg>
                      </div>
                      <div className={styles.deliveryOptionText}>
                        <strong>{opt}</strong>
                        <small>
                          {opt === "School collection"
                            ? `Collect from${isSingleSchool && uniqueSchools[0] ? ` ${uniqueSchools[0].name}` : ""}`
                            : opt === "Delivery"
                              ? "Deliver to your address"
                              : "Pick up from a collection point"}
                        </small>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {fulfilmentOption === "School collection" && uniqueSchools.length > 1 ? (
                <div className={styles.schoolDropoffGroup} style={{ gridColumn: "1 / -1" }}>
                  <label className={styles.schoolDropoffLabel}>
                    Which school should the main box be dropped at?
                  </label>
                  <div className={styles.schoolDropoffRow}>
                    {uniqueSchools.map((s) => {
                      const isSelected = multiSchoolDrop === s.slug;
                      return (
                        <label
                          key={s.slug}
                          className={`${styles.schoolDropoffCard} ${isSelected ? styles.schoolDropoffCardActive : ""}`}
                        >
                          <Input
                            type="radio"
                            name="multiSchoolDrop"
                            value={s.slug}
                            checked={isSelected}
                            onChange={() => setMultiSchoolDrop(s.slug)}
                            className={styles.schoolDropoffRadio}
                            wrapperClassName="!contents"
                          />
                          <span className={styles.schoolDropoffText}>
                            {s.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {errors.multiSchoolDrop ? (
                    <p className={styles.fieldError} style={{ marginTop: 4 }}>{errors.multiSchoolDrop}</p>
                  ) : null}
                </div>
              ) : null}

              {fulfilmentOption === "Delivery" ? (
                <>
                  <div className={styles.fieldGroup}>
                  <Input
                    id="address"
                    label="Street address"
                    type="text"
                    value={address}
                    onChange={(e) => { setAddress(e.target.value); clearFieldError("address"); }}
                    placeholder="e.g. 42 Main Road"
                    error={errors.address}
                    autoComplete="street-address"
                  />
                  </div>
                  <Input
                    id="suburb"
                    label="Suburb"
                    type="text"
                    value={suburb}
                    onChange={(e) => { setSuburb(e.target.value); clearFieldError("suburb"); }}
                    placeholder="e.g. Gardens"
                    error={errors.suburb}
                  />
                  <Input
                    id="city"
                    label="City"
                    type="text"
                    value={city}
                    onChange={(e) => { setCity(e.target.value); clearFieldError("city"); }}
                    placeholder="e.g. Cape Town"
                    error={errors.city}
                  />
                  <Input
                    id="province"
                    label="Province"
                    type="text"
                    value={province}
                    onChange={(e) => { setProvince(e.target.value); clearFieldError("province"); }}
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
                </>
              ) : null}

              <Textarea
                id="deliveryNotes"
                label="Order notes (optional)"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className={styles.orderNotesField}
              />
            </div>

            {/* Secure Payment Gateway Trust Card */}
            <section className={styles.paymentReadyCard} style={{ marginTop: 28, marginBottom: 28 }}>
              <div className={styles.paymentSecurityHeader}>
                <svg className={styles.securityLockIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <div>
                  <p className={styles.confirmKicker}>Secure Payment Gateway</p>
                  <h3>Confirm and pay securely with Paystack</h3>
                </div>
              </div>
              
              <p className={styles.paymentSubtext}>
                A secure Paystack window will open directly on this page to process your payment. Pexpacks does not store or see your card details.
              </p>

              <div className={styles.badgeLabelContainer}>
                <span>Accepted Payment Methods</span>
              </div>

              <div className={styles.paymentBadgeRow}>
                <div className={styles.paymentBadgeItem} title="Visa">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/visa.png" alt="Visa" style={{ height: 18, width: "auto" }} />
                </div>
                <div className={styles.paymentBadgeItem} title="Mastercard">
                  <svg viewBox="0 0 32 20" width="28" height="18" aria-hidden="true">
                    <circle cx="10" cy="10" r="10" fill="#EB001B" />
                    <circle cx="22" cy="10" r="10" fill="#F79E1B" fillOpacity="0.85" />
                    <path d="M16 10a9.98 9.98 0 0 0 2-6 9.98 9.98 0 0 0-4 6 9.98 9.98 0 0 0 2 6z" fill="#FF5F00" />
                  </svg>
                </div>
                <div className={styles.paymentBadgeItem} title="Capitec Pay">
                  <div className={styles.capitecBadge}>
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <circle cx="12" cy="12" r="11" fill="#005B94" />
                      <path d="M12 1a11 11 0 0 1 0 22v-11z" fill="#E31B23" />
                    </svg>
                    <span>Capitec Pay</span>
                  </div>
                </div>
                <div className={styles.paymentBadgeItem} title="SnapScan">
                  <div className={styles.snapscanBadge}>
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <rect width="24" height="24" rx="6" fill="#1CA9E5" />
                      <circle cx="12" cy="12" r="6" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
                      <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" />
                      <path d="M12 6.5v2.5M12 15v2.5M6.5 12h2.5M15 12h2.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span>SnapScan</span>
                  </div>
                </div>
                <div className={styles.paymentBadgeItem} title="Instant EFT">
                  <div className={styles.eftBadge}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                    <span>Instant EFT</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Consent checkbox placed directly before pay button */}
            <div className={styles.consentField} style={{ marginTop: 20, marginBottom: 20 }}>
              <Input
                type="checkbox"
                id="consent"
                checked={consent}
                onChange={(e) => { setConsent(e.target.checked); clearFieldError("consent"); }}
                aria-invalid={!!errors.consent}
                className="!w-5 !h-5 !min-h-0"
                wrapperClassName="!contents"
              />
              <span>
                I agree that Pexpacks may process my personal information to complete this order, send payment and order updates, and contact me about delivery or collection. I have read and agree to the{" "}
                <a href="/privacy-policy" target="_blank">privacy policy</a>,{" "}
                <a href="/terms" target="_blank">terms of use</a>,{" "}
                <a href="/delivery-policy" target="_blank">delivery policy</a>, and{" "}
                <a href="/returns-refunds-policy" target="_blank">returns &amp; refunds policy</a>.
                {errors.consent ? <small style={{ color: "var(--pex-error)", display: "block", marginTop: 4 }}>{errors.consent}</small> : null}
              </span>
            </div>

            {/* Submit error */}
            {submitError ? (
              <p className={styles.formStatusError} role="alert" style={{ marginTop: 20 }}>
                {submitError}
              </p>
            ) : null}

            {/* Pay button */}
            <div className={styles.payButtonWrapper} style={{ marginTop: 24 }}>
              <Button
                type="button"
                variant="primary"
                size="lg"
                className={styles.fullWidth}
                onClick={handlePay}
                disabled={submitting}
                aria-busy={submitting}
              >
                {submitting
                  ? "Preparing secure checkout..."
                  : `Pay Securely ${formatCurrency(total)}`}
              </Button>
            </div>
          </section>
        </div>
      </div>

      <div className={styles.mobileStickyCta}>
        <Button
          type="button"
          variant="primary"
          className={styles.fullWidth}
          onClick={handlePay}
          disabled={submitting}
        >
          {submitting
            ? "Preparing..."
            : `Pay Securely ${formatCurrency(total)}`}
        </Button>
      </div>
    </div>
  );
}
