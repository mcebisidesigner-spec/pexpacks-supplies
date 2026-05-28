import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSchoolBySlug, getGradeBySlug } from "@/lib/school-utils";
import { phasePacks } from "@/data/phasePacks";
import { CheckoutForm } from "./CheckoutForm";

type CheckoutPageProps = {
  searchParams: Promise<{ school?: string; grade?: string; phase?: string; pack?: string; draft?: string }>;
};

export const metadata: Metadata = {
  title: "Checkout | Pexpacks",
  description:
    "Complete your stationery pack order and pay securely with PayFast.",
};

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const { school: schoolSlug, grade: gradeSlug, phase, pack, draft } = await searchParams;

  if (phase && pack) {
    const phaseData = phasePacks.find((p) => p.slug === phase);
    const gradePack = phaseData?.gradePacks.find((p) => p.id === pack);

    if (!phaseData || !gradePack) {
      notFound();
    }

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

  if (!schoolSlug || !gradeSlug) {
    notFound();
  }

  const school = await getSchoolBySlug(schoolSlug);
  const grade = await getGradeBySlug(schoolSlug, gradeSlug);

  if (!school || !grade) {
    notFound();
  }

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
