import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import { getItem } from "@/lib/admin/items";
import { ItemForm } from "@/components/admin/items/ItemForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import adminStyles from "@/app/admin/admin.module.css";
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
        title="Edit Product Pricing & Cost"
        subtitle={item?.name || "Master Product"}
        actions={
          <AdminButton
            href={`/admin/products/${productId}`}
            variant="secondary"
            icon={<ArrowLeft size={14} />}
          >
            Back to Product
          </AdminButton>
        }
      />

      <ItemForm item={item} packs={[]} />
    </div>
  );
}
