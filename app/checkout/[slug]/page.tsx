import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSchoolBySlug, getGradeBySlug } from "@/lib/school-utils";
import { CheckoutForm } from "../CheckoutForm";
import { buildMetadata } from "@/lib/seo";

type SlugPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ draft?: string }>;
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
