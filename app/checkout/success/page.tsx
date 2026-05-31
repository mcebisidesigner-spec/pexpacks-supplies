import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrderStatusClient } from "./OrderStatusClient";

type SuccessPageProps = {
  searchParams: Promise<{ ref?: string; trxref?: string }>;
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
    <div
      style={{
        width: "100%",
        padding:
          "64px var(--gutter-desktop) var(--section-padding-y-desktop)",
        background: "var(--pex-body-bg)",
        display: "grid",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          display: "grid",
          gap: 24,
        }}
      >
        <OrderStatusClient orderReference={ref || null} />
      </div>
    </div>
  );
}
