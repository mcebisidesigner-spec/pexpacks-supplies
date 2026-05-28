import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSchoolBySlug, getGradeBySlug } from "@/lib/school-utils";
import { formatCurrency } from "@/lib/formatCurrency";
import { CheckoutForm } from "./CheckoutForm";
import styles from "./Checkout.module.css";

type CheckoutPageProps = {
  searchParams: Promise<{ school?: string; grade?: string }>;
};

export const metadata: Metadata = {
  title: "Checkout | Pexpacks",
  description:
    "Complete your stationery pack order and pay securely via Paystack.",
};

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const { school: schoolSlug, grade: gradeSlug } = await searchParams;

  if (!schoolSlug || !gradeSlug) {
    notFound();
  }

  const school = await getSchoolBySlug(schoolSlug);
  const grade = await getGradeBySlug(schoolSlug, gradeSlug);

  if (!school || !grade) {
    notFound();
  }

  const pack = grade;

  return (
    <div className={styles.shell}>
      <div className={styles.grid}>
        <div className={styles.mainColumn}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              Complete Your Stationery Pack Order
            </h1>
            <p className={styles.pageSubtitle}>
              Confirm your pack details and continue to secure payment.
            </p>
          </div>

          <CheckoutForm
            schoolSlug={school.slug}
            schoolName={school.name}
            grade={pack.grade}
            gradeSlug={pack.gradeSlug}
            price={pack.price}
            contents={pack.contents}
            deliveryNote={pack.deliveryNote || "Collect from school or arrange delivery."}
          />
        </div>

        <aside className={styles.summaryColumn}>
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>School</span>
              <span className={styles.summaryValue}>{school.name}</span>
            </div>

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Grade</span>
              <span className={styles.summaryValue}>{pack.grade}</span>
            </div>

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Pack</span>
              <span className={styles.summaryValue}>Full Pack</span>
            </div>

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Items</span>
              <span className={styles.summaryValue}>{pack.contents.length}</span>
            </div>

            <hr className={styles.summaryDivider} />

            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span className={styles.totalLabel}>Total</span>
              <span className={styles.totalValue}>
                {formatCurrency(pack.price)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
