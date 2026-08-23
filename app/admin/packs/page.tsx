import { requireAdmin } from "@/lib/admin/rbac";
import { listSchoolGroupedSummary } from "@/lib/admin/packs";
import { SchoolPacksView } from "@/components/admin/packs/SchoolPacksView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "School Packs | Admin | Pexpacks",
};

interface AdminSchoolPacksPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminSchoolPacksPage({ searchParams }: AdminSchoolPacksPageProps) {
  await requireAdmin({ permission: "packs.view" });
  const params = await searchParams;
  const q = (params.q as string) || "";
  const page = Math.max(1, parseInt((params.page as string) || "1", 10));

  const initialData = await listSchoolGroupedSummary({
    page,
    pageSize: 500,
    q: q || undefined,
  });

  return <SchoolPacksView initialData={initialData} />;
}
