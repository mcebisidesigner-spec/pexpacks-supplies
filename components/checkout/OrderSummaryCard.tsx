import { PEXCOVER_PRICE } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatCurrency";
import { TrustChecklist } from "./TrustChecklist";
import { WhatsAppHelpBlock } from "./WhatsAppHelpBlock";
import clsx from "clsx";
import styles from "./OrderSummaryCard.module.css";

type OrderSummaryCardProps = {
  schoolName: string;
  gradeName: string;
  packPrice: number;
  itemCount: number;
  totalToPay: number;
  fulfilmentOption: string;
  hasPexcover: boolean;
  summaryOpen: boolean;
  whatsAppHref: string;
};

export function OrderSummaryCard({
  schoolName,
  gradeName,
  packPrice,
  itemCount,
  totalToPay,
  fulfilmentOption,
  hasPexcover,
  summaryOpen,
  whatsAppHref,
}: OrderSummaryCardProps) {
  return (
    <aside className={styles.summaryColumn} aria-label="Order summary">
      <div
        className={clsx(styles.summaryCard, summaryOpen && styles.summaryCardOpen)}
        id="checkout-order-summary"
      >
        <p className={styles.confirmKicker}>Order summary</p>
        <h2>{schoolName}</h2>
        <p className={styles.summaryGrade}>{gradeName}</p>

        <dl className={styles.priceSummary}>
          <div>
            <dt>Items</dt>
            <dd>{itemCount}</dd>
          </div>
          <div>
            <dt>Delivery/Collection</dt>
            <dd>{fulfilmentOption}</dd>
          </div>
          {hasPexcover ? (
            <div>
              <dt>
                Pexcover <span>(Book covering)</span>
              </dt>
              <dd>{formatCurrency(PEXCOVER_PRICE)}</dd>
            </div>
          ) : null}
          <div className={styles.packListRow}>
            <dt>Stationery pack list</dt>
            <dd>{formatCurrency(packPrice)}</dd>
          </div>
          <div className={styles.summaryTotalRow}>
            <dt>Total to pay</dt>
            <dd>{formatCurrency(totalToPay)}</dd>
          </div>
        </dl>

        <TrustChecklist />
        <WhatsAppHelpBlock href={whatsAppHref} />
      </div>
    </aside>
  );
}
