import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getPublicSiteSettings } from "@/lib/public-data/settings";
import { TrayCheckoutClient } from "./TrayCheckoutClient";

type CheckoutPageProps = {
  searchParams: Promise<{ school?: string; grade?: string; phase?: string; pack?: string; draft?: string }>;
};

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

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const { school, grade, phase, pack, draft } = await searchParams;

  if (!school && !grade && !phase && !pack) {
    const settings = await getPublicSiteSettings();
    return <TrayCheckoutClient pexcoverPrice={settings.pexcoverPrice} />;
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
