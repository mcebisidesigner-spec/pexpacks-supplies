import { requireAdmin } from "@/lib/admin/rbac";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { QuotationBuilderForm } from "@/components/admin/quotations/QuotationBuilderForm";

export const metadata = {
  title: "New Quotation | Admin | Pexpacks",
  description: "Compose a new quotation for a school or client.",
};

export default async function NewQuotationPage() {
  await requireAdmin({ permission: "orders.view" });
  const admin = createSupabaseAdminClient();

  // Fetch active schools
  const { data: schoolsData } = await admin
    .from("schools")
    .select("id, name, city, province")
    .order("name", { ascending: true })
    .limit(200);

  // Fetch master products for autocomplete
  const { data: productsData } = await admin
    .from("master_products")
    .select("id, name, sku, unit, current_selling_price")
    .order("name", { ascending: true })
    .limit(100);

  const schools = (schoolsData ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    city: s.city,
    province: s.province,
  }));

  const masterProducts = (productsData ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    unit: p.unit,
    base_price: Number(p.current_selling_price || 0),
  }));

  return (
    <QuotationBuilderForm schools={schools} masterProducts={masterProducts} />
  );
}
