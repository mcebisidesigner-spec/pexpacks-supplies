import { Button } from "@/components/ui/Button";
import type { ApiResponse } from "./OrderFormTypes";
import styles from "./Order.module.css";

type SubmitStepProps = {
  submitStatus: ApiResponse | null;
  submitError: boolean;
  orderReference: string;
  selectedPackTitle: string;
  preferredContactMethod: string;
};

export function SubmitStep({
  submitStatus,
  submitError,
  orderReference,
  selectedPackTitle,
  preferredContactMethod,
}: SubmitStepProps) {
  return (
    <div className={styles.submitStep}>
      {submitStatus?.success ? (
        <div className={styles.successCard} role="status" aria-live="polite">
          <span className={styles.successIcon}>✓</span>
          <p className={styles.confirmKicker}>Order request received</p>
          <h3>Thank you. We have your request.</h3>
          <p>
            The PexPacks team will contact you to confirm availability,
            payment, packing and delivery details.
          </p>
          <dl className={styles.successDetails}>
            <div>
              <dt>Reference</dt>
              <dd>{orderReference}</dd>
            </div>
            <div>
              <dt>Pack</dt>
              <dd>{selectedPackTitle}</dd>
            </div>
            <div>
              <dt>Contact method</dt>
              <dd>{preferredContactMethod}</dd>
            </div>
          </dl>
          <div className={styles.successActions}>
            <Button href="/" variant="secondary">Back to Home</Button>
            <Button href="/schools">Find another pack</Button>
          </div>
        </div>
      ) : (
        <div className={styles.paymentReadyCard}>
          <p className={styles.confirmKicker}>Payment readiness</p>
          <h3>Submit your order request</h3>
          <p>
            Online payment is not taken on this page yet. PexPacks will
            confirm the final amount, invoice or payment instructions
            before any payment is due.
          </p>
          <ul>
            <li>Secure order request</li>
            <li>Final price confirmed before payment</li>
            <li>WhatsApp support available</li>
          </ul>
          {submitError && submitStatus && !submitStatus.success ? (
            <p className={styles.formStatusError} role="alert">
              {submitStatus.message}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
