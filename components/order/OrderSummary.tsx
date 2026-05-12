import { ordersEmail, ordersEmailHref, phoneHref, phoneNumber } from "@/data/contact";
import { formatCurrency } from "@/lib/formatCurrency";
import styles from "./Order.module.css";

type OrderSummaryProps = {
  schoolName?: string;
  gradeName?: string;
  gradePrice?: number;
  hasPexcover?: boolean;
};

const PEXCOVER_PRICE = 120;

export function OrderSummary({ schoolName, gradeName, gradePrice }: OrderSummaryProps) {
  return (
    <aside className={styles.summary} aria-label="Order summary">
      <p>Order summary</p>
      <h2>{schoolName ?? "Select a school"}</h2>
      <dl>
        <div>
          <dt>Grade</dt>
          <dd>{gradeName ?? "Select grade"}</dd>
        </div>
        <div>
          <dt>Pack price</dt>
          <dd>{typeof gradePrice === "number" ? formatCurrency(gradePrice) : "Pending"}</dd>
        </div>
        {hasPexcover && (
          <div>
            <dt>Pexcover Add-On</dt>
            <dd>{formatCurrency(PEXCOVER_PRICE)}</dd>
          </div>
        )}
        {typeof gradePrice === "number" && (
          <div className={styles.summaryTotal}>
            <dt>Total</dt>
            <dd>{formatCurrency(gradePrice + (hasPexcover ? PEXCOVER_PRICE : 0))}</dd>
          </div>
        )}
      </dl>
      <span>
        No online payment is taken here. Pexpacks will confirm your enquiry order details from{" "}
        <a href={ordersEmailHref}>{ordersEmail}</a> or <a href={phoneHref}>{phoneNumber}</a>.
      </span>
    </aside>
  );
}
