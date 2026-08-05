import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo";
import { getOrderByReference } from "@/lib/orders";
import styles from "@/app/checkout/Checkout.module.css";

export const metadata: Metadata = {
  ...buildMetadata(
    "Payment Confirmed | Pexpacks",
    "Thank you for your Pexpacks order. Your payment has been received.",
    "/checkout/success"
  ),
  robots: {
    index: false,
    follow: false,
  },
};

type SuccessPageProps = {
  searchParams: Promise<{ ref?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { ref } = await searchParams;

  if (!ref) {
    return (
      <div className={styles.checkoutShell}>
        <div className={styles.emptyCheckout}>
          <p className={styles.checkoutKicker}>Payment Confirmed</p>
          <h1>Order placed</h1>
          <p>
            Your payment has been received. We will be in touch shortly with your
            order updates and delivery details.
          </p>
          <Button href="/schools" variant="primary" size="lg">
            Browse more packs
          </Button>
        </div>
      </div>
    );
  }

  const order = await getOrderByReference(ref);

  return (
    <div className={styles.checkoutShell}>
      <div className={styles.emptyCheckout}>
        <p className={styles.checkoutKicker}>Payment Confirmed</p>
        <h1>Thank you for your order!</h1>
        <p>
          Your payment has been received{order ? ` for ${order.school_name} ${order.grade}` : ""}.
        </p>
        <p>
          Your order reference is <strong>{ref}</strong>.
        </p>
        <p>
          We will be in touch shortly with order updates and delivery details.
        </p>
        <Button href="/schools" variant="primary" size="lg">
          Browse more packs
        </Button>
      </div>
    </div>
  );
}
