import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getItem, getMasterPricingConfig } from "@/lib/admin/items";
import { EditProductClient } from "@/components/admin/items/EditProductClient";
import styles from "@/components/admin/views/CorePagesView.module.css";

interface EditProductPageProps {
  params: Promise<{ productId: string }>;
}

function getProductSlug(item: {
  slug?: string | null;
  name?: string | null;
  sku?: string | null;
  id?: string;
}): string {
  if (item.slug) return item.slug;
  if (item.name) {
    return item.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  if (item.sku) {
    return item.sku
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  return item.id || "";
}

function formatProductNameFromSlug(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  await requireAdmin({ permission: "items.edit" });
  const { productId } = await params;
  const item = await getItem(productId);

  if (item) {
    const productSlug = getProductSlug(item);
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        productId,
      );
    if (isUuid && productSlug && productId !== productSlug) {
      redirect(`/admin/products/${productSlug}/edit`);
    }
  }

  const productSlug = item ? getProductSlug(item) : productId;
  const initialName = item?.name || formatProductNameFromSlug(productId);
  const initialSku = item?.sku || productId;
  const initialCategory = item?.category || "Stationery";
  const returnTo = productSlug
    ? `/admin/products/${productSlug}`
    : "/admin/products";
  const pricingConfig = await getMasterPricingConfig();

  return (
    <div className={styles.container}>
      <EditProductClient
        item={item}
        initialName={initialName}
        initialSku={initialSku}
        initialCategory={initialCategory}
        productSlug={productSlug}
        returnTo={returnTo}
        pricingConfig={pricingConfig}
      />
    </div>
  );
}
