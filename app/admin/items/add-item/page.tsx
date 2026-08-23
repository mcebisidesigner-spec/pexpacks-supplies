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
import shared from "../../schools/schools.module.css";
import styles from "../../operations.module.css";
import viewStyles from "@/components/admin/views/CorePagesView.module.css";
import adminStyles from "@/app/admin/admin.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Add Item | Admin",
};

export default async function AddItemPage() {
  const [session, schemaReady] = await Promise.all([
    requireAdmin({ permission: "catalogue.view" }),
    isOperationsSchemaReady(),
  ]);
  const canManage = hasPermission(session, "catalogue.manage");
  const canImportExisting = hasPermission(session, "items.import");

  return (
    <div className={adminStyles.page}>
      <div className={adminStyles.headerSection}>
        <p>
          <Link href="/admin/items" className={adminStyles.resetLink}>
            <ArrowLeft aria-hidden="true" /> Back to items
          </Link>
        </p>
        <h1 className={`${viewStyles.headerTitle} ${viewStyles.text28} ${adminStyles.mt8} ${adminStyles.mb4}`}>
          Stationery Items
        </h1>
        <p className={`${adminStyles.muted} ${adminStyles.text14} ${adminStyles.m0}`}>
          Digital stationery products that can be reused across school packs.
        </p>
      </div>

      {schemaReady && canManage ? (
        <section className={adminStyles.formPanel}>
          <h2>Add catalogue product</h2>
          <form action={createMasterProductAction} className={adminStyles.formGrid}>
            <input
              className={adminStyles.field}
              name="sku"
              placeholder="Unique SKU"
              required
            />
            <input
              className={`${adminStyles.field} ${adminStyles.wide}`}
              name="name"
              placeholder="Item name"
              required
            />
            <input
              className={adminStyles.field}
              name="category"
              placeholder="Category"
            />
            <input className={adminStyles.field} name="brand" placeholder="Brand" />
            <input className={adminStyles.field} name="unit" placeholder="Unit" />
            <input
              className={adminStyles.field}
              name="packaging"
              placeholder="Packaging"
            />
            <input
              className={adminStyles.field}
              name="sellingPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="Selling price"
            />
            <input
              className={`${adminStyles.field} ${adminStyles.wide}`}
              name="description"
              placeholder="Description"
            />
            <button className={adminStyles.button} type="submit">
              Add product
            </button>
          </form>
        </section>
      ) : null}

      {schemaReady && canManage ? (
        <section className={adminStyles.formPanel}>
          <h2>Bulk CSV catalogue importer</h2>
          <form
            action={importMasterProductsAction}
            className={adminStyles.inlineForm}
          >
            <input
              className={adminStyles.field}
              type="file"
              name="file"
              accept=".csv,text/csv"
              required
            />
            <button className={adminStyles.button} type="submit">
              Import catalogue
            </button>
          </form>
          <p className={adminStyles.muted}>
            Required columns: SKU and item name. Optional: description, category, brand, unit, packaging and selling price.
          </p>
        </section>
      ) : null}

      {!schemaReady && canImportExisting ? (
        <section
          id="bulk-stationery-import"
          aria-label="Bulk CSV stationery import"
          className={adminStyles.mt12}
        >
          <CSVStationeryImporter packs={await listPacksForFilter()} />
        </section>
      ) : null}
    </div>
  );
}
