import { requireAdmin } from "@/lib/admin/rbac";
import { getMasterPricingConfig } from "@/lib/admin/items";
import { listSuppliersSimple } from "@/lib/admin/operations";
import { AddItemClient } from "@/components/admin/items/AddItemClient";
import styles from "@/components/admin/views/CorePagesView.module.css";

export const metadata = {
  title: "Add Product | Admin | Pexpacks",
};

export default async function AddMasterItemPage() {
  await requireAdmin({ permission: "catalogue.manage" });
  const [pricingConfig, suppliers] = await Promise.all([
    getMasterPricingConfig(),
    listSuppliersSimple(),
  ]);

  return (
    <div className={styles.container}>
      <AddItemClient pricingConfig={pricingConfig} suppliers={suppliers} />
    </div>
  );
}
