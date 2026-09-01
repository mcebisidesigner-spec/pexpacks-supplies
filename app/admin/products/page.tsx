import { requireAdmin } from "@/lib/admin/rbac";
import { listMasterProducts, getSupplierCostStats } from "@/lib/admin/operations";
import { MasterProductsPageView } from "@/components/admin/views/MasterProductsPageView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Master Products & Inventory | Admin | Pexpacks",
};

interface AdminProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  await requireAdmin({ permission: "items.view" });
  const params = await searchParams;

  const page = Math.max(1, parseInt((params.page as string) || "1", 10));
  const pageSize = Math.max(10, Math.min(100, parseInt((params.pageSize as string) || "10", 10)));
  const query = (params.q as string) || "";
  const category = (params.category as string) || "all";
  const sort = (params.sort as string) || "name";
  const order = (params.order as "asc" | "desc") || "asc";

  const [data, supplierStats] = await Promise.all([
    listMasterProducts({
      page,
      pageSize,
      query,
      category,
      sort,
      order,
    }),
    getSupplierCostStats(),
  ]);

  return <MasterProductsPageView initialData={data} supplierStats={supplierStats} />;
}
