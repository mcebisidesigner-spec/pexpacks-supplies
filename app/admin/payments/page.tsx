import { requireAdmin } from "@/lib/admin/rbac";
import { listPayments } from "@/lib/admin/payments";
import { PaymentsPageView } from "@/components/admin/views/PaymentsPageView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payments | Admin | Pexpacks",
};

interface AdminPaymentsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminPaymentsPage({ searchParams }: AdminPaymentsPageProps) {
  await requireAdmin({ permission: "payments.view" });
  const params = await searchParams;

  const page = Math.max(1, parseInt((params.page as string) || "1", 10));
  const pageSize = Math.max(10, Math.min(100, parseInt((params.pageSize as string) || "25", 10)));
  const q = (params.q as string) || "";
  const status = (params.status as string) || "";

  const result = await listPayments({
    page,
    pageSize,
    q: q || undefined,
    status: status && status !== "all" ? status : undefined,
  });

  return <PaymentsPageView initialData={result} />;
}
