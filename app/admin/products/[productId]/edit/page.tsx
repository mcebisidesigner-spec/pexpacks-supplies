import { requireAdmin } from "@/lib/admin/rbac";
import { getItem } from "@/lib/admin/items";
import { ItemForm } from "@/components/admin/items/ItemForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import styles from "@/components/admin/views/CorePagesView.module.css";

interface EditProductPageProps {
  params: Promise<{ productId: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  await requireAdmin({ permission: "items.edit" });
  const { productId } = await params;
  const item = await getItem(productId);

  return (
    <div className={styles.container}>
      <AdminPageHeader
        backHref="/admin/products"
        backLabel="Back to Products"
        title={item?.name || "Product Details"}
        titleHighlight="Edit Item"
        subtitle={`SKU: ${item?.sku || productId} • Manage pricing, cost verification, and master catalogue metadata.`}
      />

      <ItemForm item={item} packs={[]} />
    </div>
  );
}
