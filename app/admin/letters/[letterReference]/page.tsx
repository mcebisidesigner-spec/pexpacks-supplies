import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getLetterById } from "@/lib/admin/letters";
import { LetterEditor } from "@/components/admin/letters/LetterEditor";

export const dynamic = "force-dynamic";

interface LetterEditPageProps {
  params: Promise<{ letterReference: string }>;
}

export async function generateMetadata({ params }: LetterEditPageProps) {
  const { letterReference } = await params;
  const letter = await getLetterById(letterReference);
  if (!letter) {
    return { title: "Letter Not Found | Admin | Pexpacks" };
  }
  return {
    title: `${letter.reference_number} - Edit Official Letter | Admin | Pexpacks`,
    description: `Edit official letter ${letter.reference_number} for ${letter.recipient_organization}`,
  };
}

export default async function LetterEditPage({ params }: LetterEditPageProps) {
  await requireAdmin({ permission: "orders.view" });
  const { letterReference } = await params;
  const letter = await getLetterById(letterReference);

  if (!letter) {
    notFound();
  }

  // If the user accessed via UUID or alternative identifier, redirect permanently to canonical [letterReference]
  if (
    letter.reference_number &&
    decodeURIComponent(letterReference).trim().toLowerCase() !==
      letter.reference_number.trim().toLowerCase()
  ) {
    redirect(`/admin/letters/${encodeURIComponent(letter.reference_number)}`);
  }

  return <LetterEditor initialLetter={letter} />;
}

