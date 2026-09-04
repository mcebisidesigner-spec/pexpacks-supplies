import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getLetterById } from "@/lib/admin/letters";
import { LetterEditor } from "@/components/admin/letters/LetterEditor";

export const dynamic = "force-dynamic";

interface LetterEditPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: LetterEditPageProps) {
  const { id } = await params;
  const letter = await getLetterById(id);
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
  const { id } = await params;
  const letter = await getLetterById(id);

  if (!letter) {
    notFound();
  }

  return <LetterEditor initialLetter={letter} />;
}
