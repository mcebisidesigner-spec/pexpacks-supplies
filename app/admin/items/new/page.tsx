import Link from "next/link";
import { requireAdmin } from "@/lib/admin/rbac";
import { listPacksForFilter } from "@/lib/admin/packs";
import { ItemForm } from "@/components/admin/items/ItemForm";
import adminStyles from "../../admin.module.css";
import shared from "../../schools/schools.module.css";

export const metadata = {
  title: "Add item | Admin",
};

export default async function NewItemPage() {
  await requireAdmin({ permission: "items.create" });
  const packs = await listPacksForFilter();

  return (
    <div className={adminStyles.adminContainer}>
      <p>
        <Link href="/admin/items" className={shared.resetLink}>
          ← Back to items
        </Link>
      </p>
      <div className={adminStyles.headerSection}>
        <h1 className={adminStyles.title}>Add an item</h1>
        <p className={adminStyles.subtitle}>
          Add a new stationery item to a pack.
        </p>
      </div>
      <ItemForm item={null} packs={packs} />
    </div>
  );
}
