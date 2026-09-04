import { CSVStationeryImporter } from "@/components/inventory/CSVStationeryImporter";
import { listPacksForFilter } from "@/lib/admin/packs";
import { hasPermission, requireAdmin } from "@/lib/admin/rbac";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
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
        <section className={adminStyles.sidebarCard}>
          <div className={adminStyles.sidebarCardHeader}>
            <div className={adminStyles.sidebarHeaderTitle}>
              <span>Add catalogue product</span>
            </div>
          </div>
          <form
            action={createMasterProductAction}
            className={adminStyles.detailLayout}
          >
            <div className={adminStyles.leftColumn}>
              <div className={adminStyles.formField}>
                <div>
                  <label className={adminStyles.formLabel}>Item name *</label>
                  <input
                    className={`${adminStyles.inputField} ${adminStyles.wide}`}
                    name="name"
                    placeholder="Item name"
                    required
                  />
                </div>
              </div>
              <div className={adminStyles.grid2equal}>
                <div>
                  <label className={adminStyles.formLabel}>Unique SKU</label>
                  <input
                    className={adminStyles.inputField}
                    name="sku"
                    placeholder="Unique SKU"
                    required
                  />
                </div>
                <div>
                  <label className={adminStyles.formLabel}>Category</label>
                  <input
                    className={adminStyles.inputField}
                    name="category"
                    placeholder="Category"
                  />
                </div>
              </div>
              <div className={adminStyles.grid2equal}>
                <div>
                  <label className={adminStyles.formLabel}>Brand</label>
                  <input
                    className={adminStyles.inputField}
                    name="brand"
                    placeholder="Brand"
                  />
                </div>
                <div>
                  <label className={adminStyles.formLabel}>Unit</label>
                  <input
                    className={adminStyles.inputField}
                    name="unit"
                    placeholder="Unit"
                  />
                </div>
              </div>
              <div className={adminStyles.grid2equal}>
                <div>
                  <label className={adminStyles.formLabel}>Packaging</label>
                  <input
                    className={adminStyles.inputField}
                    name="packaging"
                    placeholder="Packaging"
                  />
                </div>
                <div>
                  <label className={adminStyles.formLabel}>Selling price</label>
                  <input
                    className={adminStyles.inputField}
                    name="sellingPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Selling price"
                  />
                </div>
              </div>
              <div className={adminStyles.formField}>
                <div>
                  <label className={adminStyles.formLabel}>Description</label>
                  <input
                    className={`${adminStyles.inputField} ${adminStyles.wide}`}
                    name="description"
                    placeholder="Description"
                  />
                </div>
              </div>
            </div>
            <aside className={adminStyles.sidebarColumn}>
              <div className={adminStyles.sidebarCard}>
                <div className={adminStyles.sidebarHeaderTitle}>
                  <span>Save</span>
                </div>
                <AdminButton type="submit" variant="primary" size="md">
                  Add product
                </AdminButton>
              </div>
            </aside>
          </form>
        </section>
      ) : null}

      {canManage ? (
        <section className={adminStyles.sidebarCard}>
          <div className={adminStyles.sidebarCardHeader}>
            <div className={adminStyles.sidebarHeaderTitle}>
              <span>Bulk CSV catalogue importer</span>
            </div>
          </div>
          <form
            action={importMasterProductsAction}
            className={adminStyles.stackRow}
          >
            <input
              className={adminStyles.inputField}
              type="file"
              name="file"
              accept=".csv,text/csv"
              required
            />
            <AdminButton type="submit" variant="primary" size="md">
              Import catalogue
            </AdminButton>
          </form>
          <p className={adminStyles.muted}>
            Required columns: SKU and item name. Optional: description,
            category, brand, unit, packaging and selling price.
          </p>
        </section>
      ) : null}

      {!canManage && canImportExisting ? (
        <section
          id="bulk-stationery-import"
          aria-label="Bulk CSV stationery import"
          className={itemStyles.csvBannerTiles}
        >
          <CSVStationeryImporter
            packs={await listPacksForFilter()}
            variant="tiles"
          />
        </section>
      ) : null}
    </div>
  );
}
