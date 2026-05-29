import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";

type CheckoutPageProps = {
  searchParams: Promise<{ school?: string; grade?: string; phase?: string; pack?: string; draft?: string }>;
};

export const metadata: Metadata = {
  title: "Checkout | Pexpacks",
  description: "Complete your Pexpacks stationery pack order securely.",
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
