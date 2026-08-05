import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { HappyPayCheckoutClient } from "./HappyPayCheckoutClient";

export const metadata: Metadata = {
  ...buildMetadata(
    "Split in 2 with Happy Pay | Pexpacks",
    "Split your Pexpacks order into 2 interest-free payments with Happy Pay. Pay 50% today and the rest in 30 days.",
    "/checkout/happypay"
  ),
  robots: {
    index: false,
    follow: false,
  },
};

export default function HappyPayCheckoutPage() {
  return <HappyPayCheckoutClient />;
}
