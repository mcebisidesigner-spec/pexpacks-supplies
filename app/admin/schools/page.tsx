import { requireAdmin } from "@/lib/admin/rbac";
import { listSchools } from "@/lib/admin/schools";
import { SchoolsPageView } from "@/components/admin/views/SchoolsPageView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Schools Directory | Admin | Pexpacks",
};

interface AdminSchoolsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminSchoolsPage({ searchParams }: AdminSchoolsPageProps) {
  await requireAdmin({ permission: "schools.view" });
  const params = await searchParams;

  const page = Math.max(1, parseInt((params.page as string) || "1", 10));
  const pageSize = Math.max(10, Math.min(100, parseInt((params.pageSize as string) || "10", 10)));
  const q = (params.q as string) || "";
  const city = (params.city as string) || undefined;
  const province = (params.province as string) || undefined;
  const status = (params.status as string) || undefined;

  const initialData = await listSchools({
    page,
    pageSize,
    q: q || undefined,
    city: city && city !== "all" ? city : undefined,
    province: province && province !== "all" ? province : undefined,
    status: status && status !== "all" ? status : undefined,
  });

  return <SchoolsPageView initialData={initialData} />;
}
