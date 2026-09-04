import { requireAdmin } from "@/lib/admin/rbac";
import { listLetters } from "@/lib/admin/letters";
import { LettersListView } from "@/components/admin/letters/LettersListView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Official Letters | Admin | Pexpacks",
  description:
    "Draft official institutional letters, proposals, and commercial correspondence on official letterhead.",
};

interface AdminLettersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminLettersPage({
  searchParams,
}: AdminLettersPageProps) {
  await requireAdmin({ permission: "orders.view" });
  const params = await searchParams;

  const page = Math.max(1, parseInt((params?.page as string) || "1", 10));
  const pageSize = Math.max(
    10,
    Math.min(100, parseInt((params?.pageSize as string) || "20", 10)),
  );
  const search =
    (params?.search as string) || (params?.q as string) || undefined;
  const status = (params?.status as string) || undefined;
  const recipientType = (params?.type as string) || undefined;

  const data = await listLetters({
    page,
    pageSize,
    search,
    status: status && status !== "all" ? status : undefined,
    recipientType:
      recipientType && recipientType !== "all" ? recipientType : undefined,
  });

  return <LettersListView initialData={data} />;
}
