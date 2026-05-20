import Link from "next/link";
import { formatCurrency } from "@/lib/formatCurrency";
import { ReviewBlock } from "./ReviewBlock";
import type { FulfilmentOption } from "./OrderFormTypes";
import styles from "./Order.module.css";

type ConfirmStepProps = {
  selectedPackTitle: string;
  schoolName?: string;
  gradeName?: string;
  itemCount: number;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  fulfilmentOption: FulfilmentOption;
  address: string;
  suburb: string;
  city: string;
  province: string;
  estimatedTotal?: number;
  finalConfirmation: boolean;
  setFinalConfirmation: (value: boolean) => void;
  errors: Record<string, string>;
  clearFieldError: (field: string) => void;
  goToStep: (index: number) => void;
};

export function ConfirmStep({
  selectedPackTitle,
  schoolName,
  gradeName,
  itemCount,
  buyerName,
  buyerPhone,
  buyerEmail,
  fulfilmentOption,
  address,
  suburb,
  city,
  province,
  estimatedTotal,
  finalConfirmation,
  setFinalConfirmation,
  errors,
  clearFieldError,
  goToStep,
}: ConfirmStepProps) {
  return (
    <div className={styles.confirmGrid}>
      <ReviewBlock title="Pack" onEdit={() => goToStep(0)}>
        <strong>{selectedPackTitle}</strong>
        <span>
          {schoolName ?? "School to confirm"} · {gradeName ?? "Grade to confirm"} ·{" "}
          {itemCount || "Confirming"} items
        </span>
      </ReviewBlock>
      <ReviewBlock title="Customer" onEdit={() => goToStep(1)}>
        <strong>{buyerName || "Name required"}</strong>
        <span>
          {buyerPhone || "Phone required"} · {buyerEmail || "Email required"}
        </span>
      </ReviewBlock>
      <ReviewBlock title="Delivery / Collection" onEdit={() => goToStep(2)}>
        <strong>{fulfilmentOption}</strong>
        <span>
          {fulfilmentOption === "Home delivery"
            ? [address, suburb, city, province].filter(Boolean).join(", ") ||
              "Address required"
            : "PexPacks will confirm the handover details."}
        </span>
      </ReviewBlock>
      <ReviewBlock title="Estimated total">
        <strong>
          {typeof estimatedTotal === "number"
            ? formatCurrency(estimatedTotal)
            : "To be confirmed"}
        </strong>
        <span>Final amount will be confirmed before payment.</span>
      </ReviewBlock>
      <label className={`${styles.consentField} ${styles.finalConsent}`}>
        <input
          name="finalConfirmation"
          type="checkbox"
          checked={finalConfirmation}
          aria-describedby={
            errors.finalConfirmation ? "final-confirmation-error" : undefined
          }
          aria-invalid={Boolean(errors.finalConfirmation)}
          onChange={(event) => {
            setFinalConfirmation(event.target.checked);
            clearFieldError("finalConfirmation");
          }}
        />
        <span>
          I confirm the order details are correct and agree to the{" "}
          <Link href="/terms">Terms</Link>,{" "}
          <Link href="/privacy-policy">Privacy Policy</Link>,{" "}
          <Link href="/delivery-policy">Delivery Policy</Link>, and{" "}
          <Link href="/returns-refunds-policy">
            Returns & Refunds Policy
          </Link>
          .
        </span>
      </label>
      {errors.finalConfirmation ? (
        <p id="final-confirmation-error" className={styles.fieldError}>
          {errors.finalConfirmation}
        </p>
      ) : null}
    </div>
  );
}
