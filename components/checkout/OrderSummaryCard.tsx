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
  pexcoverPrice?: number;
  summaryOpen: boolean;
  whatsAppHref: string;
  deliveryFeePending?: boolean;
};

export function OrderSummaryCard({
  schoolName,
  gradeName,
  packPrice,
  itemCount,
  totalToPay,
  fulfilmentOption,
  hasPexcover,
  pexcoverPrice = 0,
  summaryOpen,
  whatsAppHref,
  deliveryFeePending = false,
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
              <dd>{formatCurrency(pexcoverPrice)}</dd>
            </div>
          ) : null}
          <div className={styles.packListRow}>
            <dt>Stationery pack list</dt>
            <dd>{formatCurrency(packPrice)}</dd>
          </div>
          <div className={styles.summaryTotalRow}>
            <dt>{deliveryFeePending ? "Pack total payable now" : "Total to pay"}</dt>
            <dd>{formatCurrency(totalToPay)}</dd>
          </div>
        </dl>

        {deliveryFeePending ? (
          <p className={styles.deliveryFeeNotice}>
            Home delivery is charged separately. Pexpacks will confirm the fee
            with you before dispatch.
          </p>
        ) : null}

        <TrustChecklist />
        <WhatsAppHelpBlock href={whatsAppHref} />
      </div>
    </aside>
  );
}
