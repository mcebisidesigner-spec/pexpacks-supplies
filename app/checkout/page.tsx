import { redirect, notFound } from "next/navigation";

type CheckoutPageProps = {
  searchParams: Promise<{ school?: string; grade?: string; phase?: string; pack?: string; draft?: string }>;
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
