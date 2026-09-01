import { requireAdmin } from "@/lib/admin/rbac";
import { getSupplierBySlug } from "@/lib/admin/suppliers";
import {
  supplierCodeFromSlug,
  supplierEmailFromSlug,
  supplierNameFromSlug,
} from "@/lib/admin/supplier-slug";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SupplierEditForm } from "@/components/admin/suppliers/SupplierEditForm";
import styles from "@/components/admin/views/CorePagesView.module.css";

interface EditSupplierPageProps {
  params: Promise<{ supplierName: string }>;
}

export const metadata = {
  title: "Edit Supplier | Admin | Pexpacks",
};

export default async function EditSupplierPage({
  params,
}: EditSupplierPageProps) {
  await requireAdmin({ permission: "suppliers.manage" });
  const { supplierName } = await params;

  const row = await getSupplierBySlug(supplierName);
  const name = row?.name ?? supplierNameFromSlug(supplierName);

  return (
    <div className={styles.container}>
      <AdminPageHeader
        title={`Edit Supplier — ${name}`}
        subtitle="Update supplier contact details, lead times, and commercial terms."
        backHref={`/admin/suppliers/${supplierName}`}
        backLabel="Back to Supplier"
      />

      <SupplierEditForm
        slug={supplierName}
        defaults={{
          slug: supplierName,
          name,
          code: row?.code ?? supplierCodeFromSlug(supplierName),
          contactName: row?.contact_name ?? "Account Representative",
          email: row?.email ?? supplierEmailFromSlug(supplierName),
          telephone: row?.telephone ?? "+27 11 000 0000",
          paymentTerms: row?.payment_terms ?? "30 Days Net",
          leadTimeDays:
            row?.lead_time_days != null ? String(row.lead_time_days) : "3",
          active: row?.active ?? true,
        }}
      />
    </div>
  );
}
