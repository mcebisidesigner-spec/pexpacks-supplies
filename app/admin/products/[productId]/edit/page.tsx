import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getItem } from "@/lib/admin/items";
import { ItemForm } from "@/components/admin/items/ItemForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import styles from "@/components/admin/views/CorePagesView.module.css";

interface EditProductPageProps {
  params: Promise<{ productId: string }>;
}

function getProductSlug(item: { slug?: string | null; name?: string | null; sku?: string | null; id?: string }): string {
  if (item.slug) return item.slug;
  if (item.name) {
    return item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  if (item.sku) {
    return item.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  return item.id || "";
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  await requireAdmin({ permission: "items.edit" });
  const { productId } = await params;
  const item = await getItem(productId);

  if (item) {
    const productSlug = getProductSlug(item);
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
    if (isUuid && productSlug && productId !== productSlug) {
      redirect(`/admin/products/${productSlug}/edit`);
    }
  }

  const productSlug = item ? getProductSlug(item) : productId;

  return (
    <div className={styles.container}>
      <AdminPageHeader
        backHref={productSlug ? `/admin/products/${productSlug}` : "/admin/products"}
        backLabel="Back to Product"
        title={item?.name || "Product Details"}
        titleHighlight="Edit Item"
        subtitle={`SKU: ${item?.sku || productId} • Manage pricing, cost verification, and master catalogue metadata.`}
      />

      <ItemForm
        item={item}
        packs={[]}
        returnTo={productSlug ? `/admin/products/${productSlug}` : "/admin/products"}
      />
    </div>
  );
}
