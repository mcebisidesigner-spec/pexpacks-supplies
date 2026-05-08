import { ordersEmail, ordersEmailHref, phoneHref, phoneNumber } from "@/data/contact";
import { schools } from "@/data/schools";
import { formatCurrency } from "@/lib/formatCurrency";
import styles from "./Order.module.css";

type OrderSummaryProps = {
  schoolSlug: string;
  gradeSlug: string;
};

export function OrderSummary({ schoolSlug, gradeSlug }: OrderSummaryProps) {
  const school = schools.find((item) => item.slug === schoolSlug);
  const grade = school?.grades.find((item) => item.gradeSlug === gradeSlug);

  return (
    <aside className={styles.summary} aria-label="Order summary">
      <p>Order summary</p>
      <h2>{school?.name ?? "Select a school"}</h2>
      <dl>
        <div>
          <dt>Grade</dt>
          <dd>{grade?.grade ?? "Select grade"}</dd>
        </div>
        <div>
          <dt>Pack price</dt>
          <dd>{grade ? formatCurrency(grade.price) : "Pending"}</dd>
        </div>
      </dl>
      <span>
        No online payment is taken here. PexPacks will confirm your enquiry order details from{" "}
        <a href={ordersEmailHref}>{ordersEmail}</a> or <a href={phoneHref}>{phoneNumber}</a>.
      </span>
    </aside>
  );
}
