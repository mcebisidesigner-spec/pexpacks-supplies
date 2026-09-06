import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { TrayCheckoutClient } from "./TrayCheckoutClient";

export const metadata: Metadata = {
  ...buildMetadata(
    "Checkout | Pexpacks",
    "Complete your Pexpacks multi-learner order securely.",
    "/checkout"
  ),
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <TrayCheckoutClient />;
}
