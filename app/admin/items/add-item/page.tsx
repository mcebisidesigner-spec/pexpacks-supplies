import { CSVStationeryImporter } from "@/components/inventory/CSVStationeryImporter";
import { listPacksForFilter } from "@/lib/admin/packs";
import { hasPermission, requireAdmin } from "@/lib/admin/rbac";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  createMasterProductAction,
  importMasterProductsAction,
} from "../../operations-actions";
import adminStyles from "@/app/admin/admin.module.css";
import itemStyles from "@/components/admin/packs/ItemsManager.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Add Item | Admin",
};

export default async function AddItemPage() {
  const session = await requireAdmin({ permission: "catalogue.view" });
  const canManage = hasPermission(session, "catalogue.manage");
  const canImportExisting = hasPermission(session, "items.import");

  return (
    <div className={adminStyles.page}>
      <AdminPageHeader
        backHref="/admin/items"
        backLabel="Back to Items"
        title="Stationery Items"
        subtitle="Digital stationery products that can be reused across school packs."
      />

      {canManage ? (
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

      {canManage ? (
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

      {!canManage && canImportExisting ? (
        <section
          id="bulk-stationery-import"
          aria-label="Bulk CSV stationery import"
          className={itemStyles.csvBannerTiles}
        >
          <CSVStationeryImporter packs={await listPacksForFilter()} variant="tiles" />
        </section>
      ) : null}
    </div>
  );
}
