import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSchoolBySlug, getGradeBySlug } from "@/lib/school-utils";
import { phasePacks } from "@/data/phasePacks";
import { CheckoutForm } from "../CheckoutForm";

type SlugPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ draft?: string }>;
};

export const metadata: Metadata = {
  title: "Checkout | Pexpacks",
  description: "Complete your stationery pack order and pay securely with PayFast.",
};

export default async function SlugPage({ params, searchParams }: SlugPageProps) {
  const { slug } = await params;
  const { draft } = await searchParams;

  const separatorIndex = slug.indexOf("+");
  if (separatorIndex === -1) notFound();

  const first = slug.slice(0, separatorIndex);
  const second = slug.slice(separatorIndex + 1);

  const phaseData = phasePacks.find((p) => p.slug === first);
  if (phaseData) {
    const gradePack = phaseData.gradePacks.find((p) => p.id === second);
    if (!gradePack) notFound();

    return (
      <CheckoutForm
        schoolSlug={phaseData.slug}
        schoolName={phaseData.title}
        grade={gradePack.grade}
        gradeSlug={gradePack.id}
        price={gradePack.priceFrom}
        contents={gradePack.items.map(item => `${item.quantity} x ${item.name}`)}
        deliveryNote="Collect from school or arrange delivery."
        draftId={draft}
      />
    );
  }

  const school = await getSchoolBySlug(first);
  if (!school) notFound();

  const grade = await getGradeBySlug(first, second);
  if (!grade) notFound();

  return (
    <CheckoutForm
      schoolSlug={school.slug}
      schoolName={school.name}
      grade={grade.grade}
      gradeSlug={grade.gradeSlug}
      price={grade.price}
      contents={grade.contents}
      deliveryNote={grade.deliveryNote || ""}
      draftId={draft}
    />
  );
}
