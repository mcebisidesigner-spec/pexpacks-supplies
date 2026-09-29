import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo";
import { getOrderByReference } from "@/lib/orders";
import { CheckoutSuccessTracker } from "./CheckoutSuccessTracker";

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
      <div className="w-full min-h-screen py-12 px-4 md:px-8 bg-pex-bg-soft flex items-center justify-center font-sans">
        <CheckoutSuccessTracker orderReference="unknown" />
        <div className="max-w-md w-full mx-auto text-center bg-white p-6 sm:p-8 rounded-card border border-pex-border shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-pex-keppel mb-2">Payment Confirmed</p>
          <h1 className="text-2xl font-bold text-pex-navy font-heading mb-3">Order placed</h1>
          <p className="text-sm text-pex-muted leading-relaxed mb-6">
            Your payment has been received. We will be in touch shortly with your
            order updates and delivery details.
          </p>
          <Button href="/schools" variant="primary" size="lg" className="w-full sm:w-auto">
            Browse more packs
          </Button>
        </div>
      </div>
    );
  }

  const order = await getOrderByReference(ref);

  return (
    <div className="w-full min-h-screen py-12 px-4 md:px-8 bg-pex-bg-soft flex items-center justify-center font-sans">
      <CheckoutSuccessTracker
        orderReference={ref}
        school={order?.school_name}
        grade={order?.grade}
        amount={typeof order?.estimated_total === "number" ? order.estimated_total : undefined}
      />
      <div className="max-w-md w-full mx-auto text-center bg-white p-6 sm:p-8 rounded-card border border-pex-border shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-pex-keppel mb-2">Payment Confirmed</p>
        <h1 className="text-2xl font-bold text-pex-navy font-heading mb-3">Thank you for your order!</h1>
        <p className="text-sm text-pex-muted leading-relaxed mb-2">
          Your payment has been received{order ? ` for ${order.school_name} ${order.grade}` : ""}.
        </p>
        <p className="text-sm text-pex-navy font-medium mb-2">
          Your order reference is <strong className="font-bold text-pex-keppel">{ref}</strong>.
        </p>
        <p className="text-sm text-pex-muted leading-relaxed mb-6">
          We will be in touch shortly with order updates and delivery details.
        </p>
        <Button href="/schools" variant="primary" size="lg" className="w-full sm:w-auto">
          Browse more packs
        </Button>
      </div>
    </div>
  );
}
