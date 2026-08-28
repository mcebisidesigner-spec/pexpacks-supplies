import { requireAdmin } from "@/lib/admin/rbac";
import { listSchoolGroupedSummary } from "@/lib/admin/packs";
import { PacksPageView } from "@/components/admin/views/PacksPageView";

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
  const pageSize = Math.max(10, Math.min(100, parseInt((params.pageSize as string) || "25", 10)));
  const status = (params.status as string) || undefined;

  const initialData = await listSchoolGroupedSummary({
    page,
    pageSize,
    q: q || undefined,
    visible: status === "active" ? "true" : status === "inactive" ? "false" : undefined,
  });

  return <PacksPageView initialData={initialData} />;
}
