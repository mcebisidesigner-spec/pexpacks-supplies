import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Pagination } from "@/components/admin/Pagination";
import { CSVStationeryImporter } from "@/components/inventory/CSVStationeryImporter";
import {
  listItems,
  type ItemListItem,
} from "@/lib/admin/items";
import {
  isOperationsSchemaReady,
  listMasterProducts,
  type MasterProductRow,
} from "@/lib/admin/operations";
import { listPacksForFilter } from "@/lib/admin/packs";
import { hasPermission, requireAdmin } from "@/lib/admin/rbac";
import { money, PAGE_SIZE } from "@/lib/admin/ui-utils";
import admin from "../admin.module.css";
import shared from "../schools/schools.module.css";
import styles from "../operations.module.css";
import { deleteItemAction } from "./actions";

export const dynamic = "force-dynamic";

type ItemsSearchParams = {
  q?: string | string[];
  search?: string | string[];
  page?: string | string[];
  section?: string | string[];
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
  const page = Math.max(1, Number.parseInt(parseParam(params.page), 10) || 1);
  const schemaReady = await isOperationsSchemaReady();

  const [masterCatalogue, existingCatalogue] = await Promise.all([
    schemaReady
      ? listMasterProducts(query)
      : Promise.resolve({ products: [] as MasterProductRow[], total: 0 }),
    listItems({
      q: query || undefined,
      category: selectedSection || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
  ]);

  const canEditExisting = hasPermission(session, "items.edit");
  const canDeleteExisting = hasPermission(session, "items.delete");
  const canImportExisting = hasPermission(session, "items.import");
  const canCreateItem = hasPermission(session, "items.create");

  return (
    <div className={styles.page}>
      <AdminPageHeader
        title="Master Catalogue"
        subtitle="Digital stationery products and master items reusable across school packs."
        actions={
          canCreateItem ? (
            <Link href="/admin/items/add-item" className={shared.addButton}>
              Add item
            </Link>

          ) : null
        }
      />

      <form method="get" action="/admin/items" className={shared.filterForm}>
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
        {query || selectedSection ? (
          <Link href="/admin/items" className={shared.resetLink}>
            Reset
          </Link>
        ) : null}
      </form>

      {existingCatalogue.items.length ? (
        <ExistingItemsTable
          items={existingCatalogue.items}
          canEdit={canEditExisting}
          canDelete={canDeleteExisting}
        />
      ) : null}

      {!existingCatalogue.items.length && schemaReady ? (
        <CatalogueTable products={masterCatalogue.products} />
      ) : null}

      {!existingCatalogue.items.length && !schemaReady ? (
        <ExistingItemsTable
          items={existingCatalogue.items}
          canEdit={canEditExisting}
          canDelete={canDeleteExisting}
        />
      ) : null}

      <Pagination
        basePath="/admin/items"
        params={{ q: query, section: selectedSection }}
        currentPage={page}
        totalPages={existingCatalogue.pageCount}
      />

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
