import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

type CheckoutPageProps = {
  searchParams: Promise<{ school?: string; grade?: string; phase?: string; pack?: string; draft?: string }>;
};

export const metadata: Metadata = {
  ...buildMetadata(
    "Checkout",
    "Complete your Pexpacks stationery pack order securely.",
    "/checkout"
  ),
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const { school, grade, phase, pack, draft } = await searchParams;

  if (!school && !grade && !phase && !pack) {
    notFound();
  }

  let slug: string;

  if (phase && pack) {
    slug = `${encodeURIComponent(phase)}+${encodeURIComponent(pack)}`;
  } else if (school && grade) {
    slug = `${encodeURIComponent(school)}+${encodeURIComponent(grade)}`;
  } else {
    notFound();
  }

  const url = draft
    ? `/checkout/${slug}?draft=${encodeURIComponent(draft)}`
    : `/checkout/${slug}`;

  redirect(url);
}
