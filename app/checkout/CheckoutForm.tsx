"use client";

import { useCallback, useState } from "react";
import { formatCurrency } from "@/lib/formatCurrency";
import styles from "./Checkout.module.css";

type CheckoutFormProps = {
  schoolSlug: string;
  schoolName: string;
  grade: string;
  gradeSlug: string;
  price: number;
  contents: string[];
  deliveryNote: string;
};

const MAX_VISIBLE_ITEMS = 8;

function LockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function CheckoutForm({
  schoolSlug,
  schoolName,
  grade,
  gradeSlug,
  price,
  contents,
  deliveryNote,
}: CheckoutFormProps) {
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [learnerName, setLearnerName] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<
    "school_collection" | "delivery" | "collection_point"
  >("school_collection");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showAllItems, setShowAllItems] = useState(false);

  const hasMoreItems = contents.length > MAX_VISIBLE_ITEMS;
  const visibleItems = showAllItems
    ? contents
    : contents.slice(0, MAX_VISIBLE_ITEMS);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setSubmitError(null);

      const errors: Record<string, string> = {};
      const saPhone = /^(\+27|0)[1-9]\d{8}$/;
      const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!buyerName.trim() || buyerName.trim().length < 2) {
        errors.buyerName = "Name must be at least 2 characters.";
      }
      if (!buyerEmail.trim()) {
        errors.buyerEmail = "Email address is required.";
      } else if (!email.test(buyerEmail.trim())) {
        errors.buyerEmail = "Please enter a valid email address.";
      }
      if (!buyerPhone.trim()) {
        errors.buyerPhone = "Phone number is required.";
      } else if (!saPhone.test(buyerPhone.trim())) {
        errors.buyerPhone = "Please enter a valid SA phone number.";
      }
      if (!learnerName.trim() || learnerName.trim().length < 2) {
        errors.learnerName = "Learner name is required.";
      }
      setFieldErrors(errors);
      if (Object.keys(errors).length > 0) return;

      setIsSubmitting(true);

      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            buyerName: buyerName.trim(),
            buyerEmail: buyerEmail.trim().toLowerCase(),
            buyerPhone: buyerPhone.trim(),
            learnerName: learnerName.trim(),
            schoolSlug,
            schoolName,
            grade,
            gradeSlug,
            packType: "full",
            items: contents,
            estimatedTotal: price,
            deliveryMethod,
            notes: notes.trim() || undefined,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.checkoutUrl) {
          throw new Error(
            result.error || result.errors
              ? Object.values(result.errors).join(". ")
              : "Unable to start checkout"
          );
        }

        window.location.href = result.checkoutUrl;
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : "Checkout failed. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      buyerName,
      buyerEmail,
      buyerPhone,
      learnerName,
      schoolSlug,
      schoolName,
      grade,
      gradeSlug,
      contents,
      price,
      deliveryMethod,
      notes,
    ]
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Your Pack</h2>
          <p className={styles.cardSubtitle}>
            {schoolName} &mdash; {grade}
          </p>
        </div>

        <div className={styles.packSummary}>
          <div className={styles.packMeta}>
            <span className={styles.packTag}>{grade}</span>
            <span className={styles.packTag}>{contents.length} items</span>
            <span className={styles.packTag}>Full Pack</span>
          </div>

          <p className={styles.packPrice}>{formatCurrency(price)}</p>
        </div>

        <div>
          <p
            style={{
              margin: "0 0 8px",
              color: "var(--pex-primary)",
              fontWeight: 800,
              fontSize: "0.9rem",
            }}
          >
            What&apos;s Included
          </p>
          <ul className={styles.itemList}>
            {visibleItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {hasMoreItems && (
            <button
              type="button"
              className={styles.showMore}
              onClick={() => setShowAllItems(!showAllItems)}
            >
              {showAllItems
                ? "Show less"
                : `Show all ${contents.length} items`}
            </button>
          )}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Buyer Details</h2>
          <p className={styles.cardSubtitle}>
            Who is placing this order?
          </p>
        </div>

        <div className={styles.formGrid}>
          <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
            <label htmlFor="buyerName">Full Name *</label>
            <input
              id="buyerName"
              type="text"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              aria-invalid={!!fieldErrors.buyerName}
              aria-describedby={
                fieldErrors.buyerName ? "err-buyerName" : undefined
              }
              placeholder="Parent or guardian name"
              autoComplete="name"
            />
            {fieldErrors.buyerName && (
              <p className={styles.fieldError} id="err-buyerName">
                {fieldErrors.buyerName}
              </p>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="buyerEmail">Email Address *</label>
            <input
              id="buyerEmail"
              type="email"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              aria-invalid={!!fieldErrors.buyerEmail}
              aria-describedby={
                fieldErrors.buyerEmail ? "err-buyerEmail" : undefined
              }
              placeholder="parent@email.com"
              autoComplete="email"
            />
            {fieldErrors.buyerEmail && (
              <p className={styles.fieldError} id="err-buyerEmail">
                {fieldErrors.buyerEmail}
              </p>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="buyerPhone">Phone Number *</label>
            <input
              id="buyerPhone"
              type="tel"
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              aria-invalid={!!fieldErrors.buyerPhone}
              aria-describedby={
                fieldErrors.buyerPhone ? "err-buyerPhone" : undefined
              }
              placeholder="082 123 4567"
              autoComplete="tel"
            />
            {fieldErrors.buyerPhone && (
              <p className={styles.fieldError} id="err-buyerPhone">
                {fieldErrors.buyerPhone}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Learner Details</h2>
          <p className={styles.cardSubtitle}>
            Who will use this stationery pack?
          </p>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.fieldGroup}>
            <label htmlFor="learnerName">Learner Name *</label>
            <input
              id="learnerName"
              type="text"
              value={learnerName}
              onChange={(e) => setLearnerName(e.target.value)}
              aria-invalid={!!fieldErrors.learnerName}
              aria-describedby={
                fieldErrors.learnerName ? "err-learnerName" : undefined
              }
              placeholder="Child's full name"
              autoComplete="off"
            />
            {fieldErrors.learnerName && (
              <p className={styles.fieldError} id="err-learnerName">
                {fieldErrors.learnerName}
              </p>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="learner-grade">Grade</label>
            <input
              id="learner-grade"
              type="text"
              value={grade}
              disabled
              style={{ opacity: 0.6, cursor: "not-allowed" }}
            />
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Fulfilment</h2>
          <p className={styles.cardSubtitle}>
            How would you like to receive your pack?
          </p>
        </div>

        <div className={styles.deliveryOptions}>
          <label
            className={`${styles.deliveryOption} ${
              deliveryMethod === "school_collection"
                ? styles.deliveryOptionSelected
                : ""
            }`}
          >
            <input
              type="radio"
              name="deliveryMethod"
              value="school_collection"
              checked={deliveryMethod === "school_collection"}
              onChange={() => setDeliveryMethod("school_collection")}
            />
            <strong>School Collection</strong>
            <small>Collect from school during orientation or open day.</small>
          </label>

          <label
            className={`${styles.deliveryOption} ${
              deliveryMethod === "delivery"
                ? styles.deliveryOptionSelected
                : ""
            }`}
          >
            <input
              type="radio"
              name="deliveryMethod"
              value="delivery"
              checked={deliveryMethod === "delivery"}
              onChange={() => setDeliveryMethod("delivery")}
            />
            <strong>Home Delivery</strong>
            <small>Packed and delivered to your door. Delivery fee applies.</small>
          </label>

          <label
            className={`${styles.deliveryOption} ${
              deliveryMethod === "collection_point"
                ? styles.deliveryOptionSelected
                : ""
            }`}
          >
            <input
              type="radio"
              name="deliveryMethod"
              value="collection_point"
              checked={deliveryMethod === "collection_point"}
              onChange={() => setDeliveryMethod("collection_point")}
            />
            <strong>Collection Point</strong>
            <small>Collect from a designated Pexpacks collection point.</small>
          </label>
        </div>

        <p className={styles.fieldHint} style={{ margin: 0 }}>
          {deliveryNote}
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Order Notes</h2>
          <p className={styles.cardSubtitle}>
            Anything we should know? (optional)
          </p>
        </div>

        <div className={styles.fieldGroup}>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Dietary allergies, delivery instructions, special requests..."
            rows={3}
          />
        </div>
      </div>

      {submitError && (
        <div className={styles.formError}>{submitError}</div>
      )}

      <div className={styles.card}>
        <div className={styles.secureBadge}>
          <LockIcon />
          <span>Secure checkout via Paystack</span>
        </div>
        <p className={styles.summaryNote}>
          You will be redirected to Paystack to complete payment securely. Your
          order will be processed immediately after successful payment.
        </p>
      </div>

      <div className={styles.card}>
        <button
          type="submit"
          className={styles.payButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className={styles.payButtonSpinner} />
              Processing...
            </>
          ) : (
            `Pay ${formatCurrency(price)} Securely`
          )}
        </button>
      </div>

      {/* Mobile sticky CTA */}
      <div className={styles.mobileStickyCta}>
        <button
          type="submit"
          className={styles.payButton}
          disabled={isSubmitting}
          style={{ display: "flex" }}
        >
          {isSubmitting ? (
            <>
              <span className={styles.payButtonSpinner} />
              Processing...
            </>
          ) : (
            `Pay ${formatCurrency(price)} Securely`
          )}
        </button>
      </div>
    </form>
  );
}
