import { requireAdmin } from "@/lib/admin/rbac";
import { LetterEditor } from "@/components/admin/letters/LetterEditor";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New Official Letter | Admin | Pexpacks",
  description:
    "Draft official institutional letter or proposal on Pexpacks letterhead.",
};

export default async function NewLetterPage() {
  await requireAdmin({ permission: "orders.view" });
  return <LetterEditor initialLetter={null} />;
}
