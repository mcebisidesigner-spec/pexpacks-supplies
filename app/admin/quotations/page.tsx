import { requireAdmin } from "@/lib/admin/rbac";
import { listQuotations } from "@/lib/admin/quotations";
import { QuotationsListView } from "@/components/admin/quotations/QuotationsListView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Quotations | Admin | Pexpacks",
  description: "Manage school quotations, price proposals, and branded PDF generation.",
};

interface AdminQuotationsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function QuotationsPage({ searchParams }: AdminQuotationsPageProps) {
  await requireAdmin({ permission: "orders.view" });
  const params = await searchParams;

  const page = Math.max(1, parseInt((params?.page as string) || "1", 10));
  const pageSize = Math.max(10, Math.min(100, parseInt((params?.pageSize as string) || "20", 10)));
  const q = (params?.q as string) || (params?.search as string) || "";
  const status = (params?.status as string) || undefined;

  const data = await listQuotations({
    page,
    pageSize,
    search: q || undefined,
    status: status && status !== "all" ? status : undefined,
  });

  return <QuotationsListView initialData={data} />;
}
