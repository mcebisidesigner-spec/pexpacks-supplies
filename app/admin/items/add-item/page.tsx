import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CSVStationeryImporter } from "@/components/inventory/CSVStationeryImporter";
import { isOperationsSchemaReady } from "@/lib/admin/operations";
import { listPacksForFilter } from "@/lib/admin/packs";
import { hasPermission, requireAdmin } from "@/lib/admin/rbac";
import {
  createMasterProductAction,
  importMasterProductsAction,
} from "../../operations-actions";
import admin from "../../admin.module.css";
import shared from "../../schools/schools.module.css";
import styles from "../../operations.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Add Item | Admin",
};

export default async function AddItemPage() {
  const session = await requireAdmin({ permission: "catalogue.view" });
  const schemaReady = await isOperationsSchemaReady();
  const canManage = hasPermission(session, "catalogue.manage");
  const canImportExisting = hasPermission(session, "items.import");

  return (
    <div className={styles.page}>
      <div className={admin.headerSection}>
        <p>
          <Link href="/admin/items" className={shared.resetLink}>
            <ArrowLeft aria-hidden="true" /> Back to items
          </Link>
        </p>
        <h1 className={styles.headerTitle} style={{ fontSize: "28px", margin: "8px 0 4px" }}>
          Stationery Items
        </h1>
        <p className={styles.muted} style={{ fontSize: "14px", margin: 0 }}>
          Digital stationery products that can be reused across school packs.
        </p>
      </div>

      {schemaReady && canManage ? (
        <section className={styles.formPanel}>
          <h2>Add catalogue product</h2>
          <form action={createMasterProductAction} className={styles.formGrid}>
            <input
              className={styles.field}
              name="sku"
              placeholder="Unique SKU"
              required
            />
            <input
              className={`${styles.field} ${styles.wide}`}
              name="name"
              placeholder="Item name"
              required
            />
            <input
              className={styles.field}
              name="category"
              placeholder="Category"
            />
            <input className={styles.field} name="brand" placeholder="Brand" />
            <input className={styles.field} name="unit" placeholder="Unit" />
            <input
              className={styles.field}
              name="packaging"
              placeholder="Packaging"
            />
            <input
              className={styles.field}
              name="sellingPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="Selling price"
            />
            <input
              className={`${styles.field} ${styles.wide}`}
              name="description"
              placeholder="Description"
            />
            <button className={styles.button} type="submit">
              Add product
            </button>
          </form>
        </section>
      ) : null}

      {schemaReady && canManage ? (
        <section className={styles.formPanel}>
          <h2>Bulk CSV catalogue importer</h2>
          <form
            action={importMasterProductsAction}
            className={styles.inlineForm}
          >
            <input
              className={styles.field}
              type="file"
              name="file"
              accept=".csv,text/csv"
              required
            />
            <button className={styles.button} type="submit">
              Import catalogue
            </button>
          </form>
          <p className={styles.muted}>
            Required columns: SKU and item name. Optional: description, category, brand, unit, packaging and selling price.
          </p>
        </section>
      ) : null}

      {!schemaReady && canImportExisting ? (
        <section
          id="bulk-stationery-import"
          aria-label="Bulk CSV stationery import"
          style={{ marginTop: "12px" }}
        >
          <CSVStationeryImporter packs={await listPacksForFilter()} />
        </section>
      ) : null}
    </div>
  );
}
