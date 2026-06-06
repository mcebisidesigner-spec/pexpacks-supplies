import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrderStatusClient } from "./OrderStatusClient";
import styles from "./SuccessPage.module.css";

type SuccessPageProps = {
  searchParams: Promise<{ ref?: string; trxref?: string; reference?: string }>;
};

export const metadata: Metadata = {
  title: "Payment Confirmed | Pexpacks",
  description: "Your payment has been confirmed. Your order is being prepared.",
};

export default async function SuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { ref, trxref } = await searchParams;

  if (ref && !trxref) {
    redirect(`/checkout/cancelled?ref=${encodeURIComponent(ref)}`);
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <OrderStatusClient orderReference={ref || null} />
      </div>
    </div>
  );
}
