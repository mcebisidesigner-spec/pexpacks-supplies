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
  description: "Complete your Pexpacks stationery pack order securely.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SlugPage({ params, searchParams }: SlugPageProps) {
  const { slug } = await params;
  const { draft } = await searchParams;

  const decodedSlug = decodeURIComponent(slug);
  let separatorIndex = decodedSlug.indexOf("+");
  if (separatorIndex === -1) {
    separatorIndex = decodedSlug.indexOf(" ");
  }
  
  if (separatorIndex === -1) {
    notFound();
  }

  const first = decodedSlug.slice(0, separatorIndex);
  const second = decodedSlug.slice(separatorIndex + 1);

  let resolvedSecond = second;
  let resolvedDraftId = draft;

  if (second.endsWith("=customised")) {
    resolvedSecond = second.slice(0, -"=customised".length);
    resolvedDraftId = "customised";
  }

  const phaseData = phasePacks.find((p) => p.slug === first);
  if (phaseData) {
    const gradePack = phaseData.gradePacks.find((p) => p.id === resolvedSecond);
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
        draftId={resolvedDraftId}
      />
    );
  }

  const school = await getSchoolBySlug(first);
  if (!school) notFound();

  const grade = await getGradeBySlug(first, resolvedSecond);
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
      draftId={resolvedDraftId}
    />
  );
}
