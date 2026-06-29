import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { LaybyCheckoutClient } from "./LaybyCheckoutClient";

export const metadata: Metadata = {
  ...buildMetadata(
    "Lay-by Checkout | Pexpacks",
    "Complete your lay-by deposit and set up a monthly payment plan for your school stationery pack.",
    "/lay-by/checkout"
  ),
  robots: { index: false, follow: false },
};

export default function LaybyCheckoutPage() {
  return <LaybyCheckoutClient />;
}
