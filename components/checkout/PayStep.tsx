import { formatCurrency } from "@/lib/formatCurrency";
import { Button } from "@/components/ui/Button";
import styles from "@/app/checkout/Checkout.module.css";

type PayStepProps = {
  schoolName: string;
  grade: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  fulfilmentOption: string;
  deliveryAddressSummary: string;
  itemCount: number;
  hasPexcover: boolean;
  totalToPay: number;
  submitting: boolean;
  submitError: string | null;
  onEditPack: () => void;
  onEditCustomer: () => void;
  onEditDelivery: () => void;
  onPay: () => void;
};

function ReviewBlock({
  title,
  children,
  onEdit,
}: {
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
}) {
  return (
    <section className={styles.reviewBlock}>
      <div className={styles.reviewBlockContent}>
        <p className={styles.reviewBlockTitle}>{title}</p>
        {children}
      </div>
      {onEdit ? (
        <button type="button" className={styles.reviewEditBtn} onClick={onEdit}>
          Edit
        </button>
      ) : null}
    </section>
  );
}

export function PayStep({
  schoolName,
  grade,
  buyerName,
  buyerPhone,
  buyerEmail,
  fulfilmentOption,
  deliveryAddressSummary,
  itemCount,
  hasPexcover,
  totalToPay,
  submitting,
  submitError,
  onEditPack,
  onEditCustomer,
  onEditDelivery,
  onPay,
}: PayStepProps) {
  return (
    <div className={styles.confirmGrid}>
      <ReviewBlock title="Pack" onEdit={onEditPack}>
        <strong>
          {schoolName} - {grade}
        </strong>
        <span>
          Full Pack - {itemCount} items
          {hasPexcover ? " - Pexcover add-on" : ""}
        </span>
      </ReviewBlock>

      <ReviewBlock title="Customer" onEdit={onEditCustomer}>
        <strong>{buyerName || "Name required"}</strong>
        <span>
          {buyerPhone || "Phone required"} - {buyerEmail || "Email required"}
        </span>
      </ReviewBlock>

      <ReviewBlock title="Delivery / Collection" onEdit={onEditDelivery}>
        <strong>{fulfilmentOption}</strong>
        <span>
          {fulfilmentOption === "Delivery"
            ? deliveryAddressSummary || "Address required"
            : "Pexpacks will confirm the handover details."}
        </span>
      </ReviewBlock>

      <section className={styles.paymentReadyCard}>
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
            <svg viewBox="0 0 24 15" width="38" height="24" aria-hidden="true">
              <path d="M10.15 1.56L8.14 12.38H5.02L3.01 4.54c-.11-.47-.4-.82-.87-.99C1.46 3.25.47 2.92 0 2.82l.06-.21h4.94c.64 0 1.2.42 1.34 1.11l1.58 8.16L11 2.82h3.11l-2.01 9.56H9.15l1-5.69-1.89-5.13zm12.31 4.41c-.04-.54-.42-1.07-1.34-1.39-1.12-.39-2.24-.62-2.24-1.12 0-.34.33-.61.99-.61a3.7 3.7 0 0 1 2.06.63l.36.19.46-2.5c-.64-.28-1.76-.56-2.91-.56-2.9 0-4.93 1.48-4.95 3.73-.02 1.56 1.45 2.42 2.56 2.94.9.42 1.3.8 1.3 1.23-.01.66-.82.97-1.57.97-1.05 0-1.61-.16-2.47-.53l-.35-.16-.48 2.5c.7.31 1.98.59 3.3.59 3.07 0 5.08-1.45 5.12-3.71M24 2.82l-2.33 9.56h-2.33l2.33-9.56H24z" fill="#1A1F71" />
            </svg>
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

      {submitError ? (
        <p className={styles.formStatusError} role="alert">
          {submitError}
        </p>
      ) : null}

      <div className={styles.payButtonWrapper}>
        <Button
          type="button"
          variant="primary"
          size="lg"
          className={styles.fullWidth}
          onClick={onPay}
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? (
            <>
              <span className={styles.payButtonSpinner} />
              Preparing secure checkout...
            </>
          ) : (
            `Pay Securely ${formatCurrency(totalToPay)}`
          )}
        </Button>
      </div>
    </div>
  );
}
