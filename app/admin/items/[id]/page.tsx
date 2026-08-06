import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getItem } from "@/lib/admin/items";
import { listPacksForFilter } from "@/lib/admin/packs";
import { ItemForm } from "@/components/admin/items/ItemForm";
import adminStyles from "../../admin.module.css";
import shared from "../../schools/schools.module.css";

interface EditItemPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditItemPage({ params }: EditItemPageProps) {
  await requireAdmin({ permission: "items.edit" });
  const { id } = await params;
  const [item, packs] = await Promise.all([getItem(id), listPacksForFilter()]);
  if (!item) notFound();

  return (
    <div className={adminStyles.adminContainer}>
      <p>
        <Link href="/admin/items" className={shared.resetLink}>
          ← Back to items
        </Link>
      </p>
      <div className={adminStyles.headerSection}>
        <h1 className={adminStyles.title}>Edit item</h1>
        <p className={adminStyles.subtitle}>{item.name}</p>
      </div>
      <ItemForm item={item} packs={packs} />
    </div>
  );
}
