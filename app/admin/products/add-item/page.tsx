import { requireAdmin } from "@/lib/admin/rbac";
import { AddItemClient } from "@/components/admin/items/AddItemClient";
import styles from "@/components/admin/views/CorePagesView.module.css";

export const metadata = {
  title: "Add Product | Admin | Pexpacks",
};

export default async function AddMasterItemPage() {
  await requireAdmin({ permission: "catalogue.manage" });

  return (
    <div className={styles.container}>
      <AddItemClient />
    </div>
  );
}
