import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import { getItem } from "@/lib/admin/items";
import { ItemForm } from "@/components/admin/items/ItemForm";
import adminStyles from "@/app/admin/admin.module.css";
import shared from "@/app/admin/schools/schools.module.css";

interface EditProductPageProps {
  params: Promise<{ productId: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  await requireAdmin({ permission: "items.edit" });
  const { productId } = await params;
  const item = await getItem(productId);

  return (
    <div className={adminStyles.adminContainer}>
      <p>
        <Link href={`/admin/products/${productId}`} className={adminStyles.resetLink}>
          <ArrowLeft aria-hidden="true" /> Back to product detail
        </Link>
      </p>
      <div className={adminStyles.headerSection}>
        <h1 className={adminStyles.title}>Edit Product Pricing & Cost</h1>
        <p className={adminStyles.subtitle}>{item?.name || "Master Product"}</p>
      </div>
      <ItemForm item={item} packs={[]} />
    </div>
  );
}
