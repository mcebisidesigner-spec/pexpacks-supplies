import type { Metadata } from "next";
import { TrayCheckoutClient } from "./TrayCheckoutClient";

export const metadata: Metadata = {
  title: "Checkout | Pexpacks",
  description: "Complete your Pexpacks multi-learner order securely.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TrayCheckoutPage() {
  return <TrayCheckoutClient />;
}
