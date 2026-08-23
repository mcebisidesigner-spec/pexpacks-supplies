import { requireAdmin } from "@/lib/admin/rbac";
import { listOrders } from "@/lib/admin/orders";
import { OrdersPageView } from "@/components/admin/views/OrdersPageView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Orders & Commerce | Admin | Pexpacks",
};

interface AdminOrdersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  await requireAdmin({ permission: "orders.view" });
  const params = await searchParams;

  const page = Math.max(1, parseInt((params.page as string) || "1", 10));
  const pageSize = Math.max(10, Math.min(100, parseInt((params.pageSize as string) || "25", 10)));
  const q = (params.q as string) || "";
  const status = (params.status as string) || (params.tab as string) || "";
  const pack_type = (params.pack_type as string) || undefined;

  const result = await listOrders({
    page,
    pageSize,
    q: q || undefined,
    status: status && status !== "all" ? status : undefined,
    pack_type,
  });

  return <OrdersPageView initialData={result} />;
}
