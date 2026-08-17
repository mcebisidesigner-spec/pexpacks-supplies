import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { CSVStationeryImporter } from "@/components/inventory/CSVStationeryImporter";
import {
  listItems,
  listStationeryCatalogueSections,
  type ItemListFilters,
  type ItemListItem,
  type StationeryCatalogueSection,
} from "@/lib/admin/items";
import {
  isOperationsSchemaReady,
  listMasterProducts,
  type MasterProductRow,
} from "@/lib/admin/operations";
import { listPacksForFilter } from "@/lib/admin/packs";
import { hasPermission, requireAdmin } from "@/lib/admin/rbac";
import {
  createMasterProductAction,
  importMasterProductsAction,
} from "../operations-actions";
import admin from "../admin.module.css";
import shared from "../schools/schools.module.css";
import styles from "../operations.module.css";
import { deleteItemAction } from "./actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

type ItemsSearchParams = {
  q?: string | string[];
  search?: string | string[];
  page?: string | string[];
  section?: string | string[];
  view?: string | string[];
};

function parseParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value.find((entry) => entry.trim())?.trim() ?? "";
  }
  return value?.trim() ?? "";
}

function itemHref(item: ItemListItem): string {
  const slug =
    item.slug ||
    item.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  return `/admin/items/${slug || item.id}`;
}

function catalogueHref({
  query,
  section,
  page,
}: {
  query?: string;
  section?: string;
  page?: number;
} = {}): string {
  const params = new URLSearchParams();
  params.set("view", "catalogue");
  if (query) params.set("q", query);
  if (section) params.set("section", section);
  if (page && page > 1) params.set("page", String(page));
  const search = params.toString();
  return `/admin/items?${search}`;
}

function money(value: number | null): string {
  return value == null ? "-" : `R ${Number(value).toFixed(2)}`;
}

function CatalogueTable({ products }: { products: MasterProductRow[] }) {
  return (
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
                      <div className={styles.muted}>{product.description}</div>
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
                      className={`${styles.badge} ${
                        product.pricing_status === "approved"
                          ? styles.good
                          : product.pricing_status === "unpriced"
                            ? styles.danger
                            : styles.warn
                      }`}
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
  );
}

function ExistingItemsTable({
  items,
  canEdit,
  canDelete,
}: {
  items: ItemListItem[];
  canEdit: boolean;
  canDelete: boolean;
}) {
  if (!items.length) {
    return (
      <div className={admin.tableCard}>
        <div className={styles.empty}>
          <PackageSearch aria-hidden="true" />
          <p>No existing stationery items match this search.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={admin.tableCard}>
      <div className={admin.tableWrapper}>
        <table className={admin.table}>
          <thead>
            <tr>
              <th>Item code</th>
              <th>Item name</th>
              <th>Description</th>
              <th>Pack / Unit</th>
              <th>Qty</th>
              <th>Price</th>
              {canEdit || canDelete ? <th>Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className={styles.mono}>
                  {(item as ItemListItem & { sku?: string | null }).category ||
                    (item as ItemListItem & { sku?: string | null }).sku ||
                    "-"}
                </td>
                <td className={styles.name}>{item.name}</td>
                <td>{item.description || "-"}</td>
                <td>{item.specification || "-"}</td>
                <td>{item.quantity}</td>
                <td className={styles.money}>{money(item.unit_price)}</td>
                {canEdit || canDelete ? (
                  <td>
                    <div className={shared.actions}>
                      {canEdit ? (
                        <Link href={itemHref(item)} className={shared.actionLink}>
                          Edit
                        </Link>
                      ) : null}
                      {canDelete ? (
                        <form action={deleteItemAction.bind(null, item.id)}>
                          <ConfirmButton
                            label="Delete"
                            title="Delete item"
                            confirmText="This cannot be undone."
                            busyLabel="Deleting..."
                            className={`${shared.rowButton} ${shared.rowButtonDelete}`}
                          />
                        </form>
                      ) : null}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function MasterCataloguePage({
  searchParams,
}: {
  searchParams: Promise<ItemsSearchParams>;
}) {
  const session = await requireAdmin({ permission: "catalogue.view" });
  const params = await searchParams;
  const query = parseParam(params.search) || parseParam(params.q);
  const selectedSection = parseParam(params.section);
  const view = parseParam(params.view);
  const showCatalogue = view === "catalogue" || Boolean(query || selectedSection);
  const page = Math.max(1, Number.parseInt(parseParam(params.page), 10) || 1);
  const schemaReady = await isOperationsSchemaReady();

  const masterCatalogue = schemaReady && showCatalogue
    ? await listMasterProducts(query)
    : { products: [] as MasterProductRow[], total: 0 };

  const legacyFilters: ItemListFilters = {
    q: query || undefined,
    category: selectedSection || undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  const [existingCatalogue] = await Promise.all([
    showCatalogue
      ? listItems(legacyFilters)
      : Promise.resolve({ items: [] as ItemListItem[], total: 0, page, pageCount: 0 }),
  ]);

  const canManage = hasPermission(session, "catalogue.manage");
  const canEditExisting = hasPermission(session, "items.edit");
  const canDeleteExisting = hasPermission(session, "items.delete");
  const canImportExisting = hasPermission(session, "items.import");

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Stationery Items</h1>
          <p>
            Digital stationery products that can be reused across school packs.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link href={catalogueHref()} className={shared.addButton}>
            View catalogue
          </Link>
          {!schemaReady && hasPermission(session, "items.create") ? (
            <Link href="/admin/items/new" className={shared.addButton}>
              + Add item
            </Link>
          ) : null}
        </div>
      </header>

      {showCatalogue ? (
        <form method="get" className={shared.filterForm}>
          <input type="hidden" name="view" value="catalogue" />
          {selectedSection ? (
            <input type="hidden" name="section" value={selectedSection} />
          ) : null}
          <input
            className={`${shared.filterInput} ${shared.searchInput}`}
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search SKU, item name, description, category or brand..."
          />
          <button className={shared.applyButton} type="submit">
            Apply
          </button>
          <Link href="/admin/items" className={shared.resetLink}>
            Hide catalogue
          </Link>
        </form>
      ) : null}

      {showCatalogue && existingCatalogue.items.length ? (
        <ExistingItemsTable
          items={existingCatalogue.items}
          canEdit={canEditExisting}
          canDelete={canDeleteExisting}
        />
      ) : null}

      {showCatalogue && !existingCatalogue.items.length && schemaReady ? (
        <CatalogueTable products={masterCatalogue.products} />
      ) : null}

      {showCatalogue && !existingCatalogue.items.length && !schemaReady ? (
        <ExistingItemsTable
          items={existingCatalogue.items}
          canEdit={canEditExisting}
          canDelete={canDeleteExisting}
        />
      ) : null}

      {showCatalogue && existingCatalogue.pageCount > 1 ? (
        <div className={shared.pagination}>
          <span className={shared.paginationInfo}>
            Page {page} of {existingCatalogue.pageCount} - {existingCatalogue.total}{" "}
            items
          </span>
          <div className={shared.pageNav}>
            {page > 1 ? (
              <Link
                href={catalogueHref({
                  query,
                  section: selectedSection,
                  page: page - 1,
                })}
                className={shared.pageButton}
              >
                Prev
              </Link>
            ) : (
              <span className={shared.pageButton} aria-disabled="true">
                Prev
              </span>
            )}
            {page < existingCatalogue.pageCount ? (
              <Link
                href={catalogueHref({
                  query,
                  section: selectedSection,
                  page: page + 1,
                })}
                className={shared.pageButton}
              >
                Next
              </Link>
            ) : (
              <span className={shared.pageButton} aria-disabled="true">
                Next
              </span>
            )}
          </div>
        </div>
      ) : null}

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
            Required columns: SKU and item name. Optional: description,
            category, brand, unit, packaging and selling price.
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
