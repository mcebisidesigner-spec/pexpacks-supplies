import { ordersEmail, ordersEmailHref } from "@/data/contact";
import { formatCurrency } from "@/lib/formatCurrency";
import { PEXCOVER_PRICE } from "@/lib/constants";
import { type FulfilmentOption } from "./OrderFormTypes";
import styles from "./Order.module.css";

type OrderSummaryProps = {
  packName: string;
  schoolName?: string;
  gradeName?: string;
  packKind: string;
  itemCount: number;
  estimatedTotal?: number;
  fulfilmentOption: FulfilmentOption;
  supportHref: string;
  summaryOpen: boolean;
  setSummaryOpen: (open: boolean) => void;
  hasPexcover?: boolean;
};

export function OrderSummary({
  packName,
  schoolName,
  gradeName,
  packKind,
  itemCount,
  estimatedTotal,
  fulfilmentOption,
  supportHref,
  summaryOpen,
  setSummaryOpen,
  hasPexcover,
}: OrderSummaryProps) {
  return (
    <aside className={styles.summaryColumn} aria-label="Order summary">
      <button
        className={styles.summaryToggle}
        type="button"
        aria-expanded={summaryOpen}
        onClick={() => setSummaryOpen(!summaryOpen)}
      >
        <span>
          {gradeName ?? "Pack"} · {itemCount || "Confirming"} items ·{" "}
          {typeof estimatedTotal === "number"
            ? formatCurrency(estimatedTotal)
            : "Total TBC"}
        </span>
        <strong>{summaryOpen ? "Hide" : "View summary"}</strong>
      </button>
      <div
        className={`${styles.summaryCard} ${summaryOpen ? styles.summaryCardOpen : ""}`}
      >
        <p className={styles.confirmKicker}>Your pack</p>
        <h2>{packName}</h2>
        <div className={styles.summaryMeta}>
          <span>{schoolName ?? "School to confirm"}</span>
          <span>{gradeName ?? "Grade to confirm"}</span>
          <span>{packKind}</span>
        </div>
        <dl className={styles.priceSummary}>
          <div>
            <dt>Selected items</dt>
            <dd>{itemCount || "Confirming"}</dd>
          </div>
          {hasPexcover ? (
            <div style={{ color: "var(--pex-keppel)", fontWeight: 700 }}>
              <dt>Pexcover book covering</dt>
              <dd>+ {formatCurrency(PEXCOVER_PRICE)}</dd>
            </div>
          ) : null}
          <div>
            <dt>Delivery / collection</dt>
            <dd>{fulfilmentOption}</dd>
          </div>
          <div>
            <dt>Estimated total</dt>
            <dd>
              {typeof estimatedTotal === "number"
                ? formatCurrency(estimatedTotal)
                : "To be confirmed"}
            </dd>
          </div>
        </dl>
        <p className={styles.summaryNote}>
          Final amount will be confirmed before payment. No online payment is
          taken on this page.
        </p>
        <ul className={styles.trustList}>
          <li>Packed according to the school list</li>
          <li>Customisable before submission</li>
          <li>Privacy-aware order request</li>
        </ul>
        {supportHref ? (
          <a className={styles.supportLink} href={supportHref}>
            Need help? Chat to Pexpacks
          </a>
        ) : (
          <a className={styles.supportLink} href={ordersEmailHref}>
            Need help? Email {ordersEmail}
          </a>
        )}
      </div>
    </aside>
  );
}
