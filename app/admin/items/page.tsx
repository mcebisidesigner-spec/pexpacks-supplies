import { PackageSearch } from "lucide-react";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { listMasterProducts } from "@/lib/admin/operations";
import {
  createMasterProductAction,
  importMasterProductsAction,
} from "../operations-actions";
import admin from "../admin.module.css";
import shared from "../schools/schools.module.css";
import styles from "../operations.module.css";

export const dynamic = "force-dynamic";

export default async function MasterCataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireAdmin({ permission: "catalogue.view" });
  const { q = "" } = await searchParams;
  const { products, total } = await listMasterProducts(q);
  const canManage = hasPermission(session, "catalogue.manage");

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Stationery Items</h1>
          <p>
            {total} canonical products. Each SKU exists once and can be reused
            across school packs.
          </p>
        </div>
      </header>

      <form method="get" className={shared.filterForm}>
        <input
          className={`${shared.filterInput} ${shared.searchInput}`}
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search SKU, item name, category or brand..."
        />
        <button className={shared.applyButton} type="submit">
          Apply
        </button>
      </form>

      {canManage ? (
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

      {canManage ? (
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
            Required columns: SKU and item name. Optional: description,
            category, brand, unit, packaging and selling price.
          </p>
        </section>
      ) : null}

      <div className={admin.tableCard}>
        {products.length ? (
          <div className={admin.tableWrapper}>
            <table className={admin.table}>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Item name</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Unit / Pack</th>
                  <th>Cost</th>
                  <th>Selling price</th>
                  <th>Pricing</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className={styles.mono}>{product.sku}</td>
                    <td>
                      <div className={styles.name}>{product.name}</div>
                      {product.description ? (
                        <div className={styles.muted}>
                          {product.description}
                        </div>
                      ) : null}
                    </td>
                    <td>{product.category || "-"}</td>
                    <td>{product.brand || "-"}</td>
                    <td>
                      {[product.unit, product.packaging]
                        .filter(Boolean)
                        .join(" / ") || "-"}
                    </td>
                    <td className={styles.money}>
                      {product.latest_verified_cost == null
                        ? "-"
                        : `R ${Number(product.latest_verified_cost).toFixed(2)}`}
                    </td>
                    <td className={styles.money}>
                      R {Number(product.current_selling_price).toFixed(2)}
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${product.pricing_status === "approved" ? styles.good : product.pricing_status === "unpriced" ? styles.danger : styles.warn}`}
                      >
                        {product.pricing_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.empty}>
            <PackageSearch aria-hidden="true" />
            <p>No catalogue products match this search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
