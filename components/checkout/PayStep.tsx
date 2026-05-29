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
      <div>
        <p>{title}</p>
        {children}
      </div>
      {onEdit ? (
        <button type="button" onClick={onEdit}>
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
            : "PexPacks will confirm the handover details."}
        </span>
      </ReviewBlock>

      <section className={styles.paymentReadyCard}>
        <p className={styles.confirmKicker}>Secure payment</p>
        <h3>Confirm and pay securely with Paystack</h3>
        <p>
          Review your details before continuing to Paystack. You will be
          redirected to Paystack to complete payment securely.
        </p>
        <ul className={styles.trustList}>
          <li>Secure payment powered by Paystack</li>
          <li>PexPacks does not store your card details</li>
          <li>Your order is saved before payment for tracking</li>
          <li>Confirmation is sent after successful payment</li>
        </ul>
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
