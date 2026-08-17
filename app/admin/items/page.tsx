import Link from "next/link";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { listItems, listDistinctStationeryItems, type ItemListFilters } from "@/lib/admin/items";
import { listPacksForFilter } from "@/lib/admin/packs";
import { deleteItemAction } from "./actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { CSVStationeryImporter } from "@/components/inventory/CSVStationeryImporter";
import { ItemFilterForm } from "@/components/admin/items/ItemFilterForm";
import shared from "../schools/schools.module.css";
import adminStyles from "../admin.module.css";
import styles from "../packs/packs.module.css";

interface ItemsPageProps {
  searchParams: Promise<{
    q?: string | string[];
    search?: string | string[];
    pack_id?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 30;

function parseParam(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v.find((x) => x && String(x).trim())?.trim() || "";
  return typeof v === "string" ? v.trim() : "";
}

function buildHref(
  params: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>
): string {
  const merged = { ...params, ...overrides };
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value) qs.set(key, value);
  }
  const s = qs.toString();
  return s ? `/admin/items?${s}` : "/admin/items";
}

function money(v: number | null): string {
  return v == null ? "—" : `R ${v.toFixed(2)}`;
}

export default async function ItemsPage({ searchParams }: ItemsPageProps) {
  const session = await requireAdmin({ permission: "items.view" });
  const params = await searchParams;

  const queryStr = parseParam(params.search) || parseParam(params.q);
  const page = Math.max(1, parseInt(parseParam(params.page) || "1", 10) || 1);
  const filters: ItemListFilters = {
    q: queryStr || undefined,
    pack_id: parseParam(params.pack_id) || undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  const { items, total, pageCount } = await listItems(filters);
  const inventoryItems = await listDistinctStationeryItems();
  const baseParams = { search: queryStr || undefined, pack_id: filters.pack_id };
  const hasFilters = Boolean(queryStr || filters.pack_id);

  return (
    <div className={`${adminStyles.adminContainer} ${adminStyles.stack}`}>
      <div className={shared.toolbar}>
        <div className={shared.headerRow}>
          <h1 className={shared.pageTitle}>
            Stationery Items
            <span className={shared.count}>
              {total} {total === 1 ? "item" : "items"}
            </span>
          </h1>
          <Link href="/admin/items/new" className={shared.addButton}>
            + Add item
          </Link>
        </div>

        <ItemFilterForm
          initialSearch={queryStr}
          inventoryItems={inventoryItems}
          hasFilters={hasFilters}
        />
      </div>

      <div>
        {items.length === 0 ? (
          <div className={adminStyles.tableCard}>
            <div className={adminStyles.emptyStateContainer}>
              <div className={adminStyles.emptyStateInner}>
                <div className={adminStyles.emptyIconWrapper}>
                  <svg viewBox="0 0 24 24">
                    <path d="M12 3v10M8 8h8M4 21V9h16v12H4z" />
                  </svg>
                </div>
                <h2 className={adminStyles.emptyStateTitle}>
                  {hasFilters ? "No items match your filters" : "No items yet"}
                </h2>
                <p className={adminStyles.emptyStateText}>
                  {hasFilters
                    ? "Try clearing your filters."
                    : "Add a new item, or add items from a pack's edit page."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className={adminStyles.tableCard}>
            <div className={adminStyles.tableWrapper}>
              <table className={adminStyles.table}>
                <thead>
                  <tr>
                    <th>ITEM CODE</th>
                    <th>ITEM NAME</th>
                    <th>Pack / Unit</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className={styles.mutedText}>
                          {(item as { category?: string | null; sku?: string | null }).category || (item as { sku?: string | null }).sku || "—"}
                        </span>
                      </td>
                      <td>
                        <div className={styles.packCell}>
                          <div>
                            <div className={styles.packName}>{item.name}</div>
                            {item.description ? (
                              <div className={styles.mutedText}>{item.description}</div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td>
                        {item.specification || (item as { packaging?: string | null }).packaging || "—"}
                      </td>
                      <td>{item.quantity}</td>
                      <td className={styles.priceCell}>{money(item.unit_price)}</td>
                      <td>
                        <div className={shared.actions}>
                          <Link
                            href={`/admin/items/${item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || item.id}`}
                            className={shared.actionLink}
                          >
                            Edit
                          </Link>
                          <form action={deleteItemAction.bind(null, item.id)}>
                            <ConfirmButton
                              label="Delete"
                              title="Delete Permanently"
                              confirmText="This cannot be undone."
                              busyLabel="Deleting…"
                              className={`${shared.rowButton} ${shared.rowButtonDelete}`}
                            />
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {pageCount > 1 ? (
          <div className={shared.pagination}>
            <span className={shared.paginationInfo}>
              Page {page} of {pageCount} · {total} items
            </span>
            <div className={shared.pageNav}>
              <Link
                href={buildHref(baseParams, { page: String(page - 1) })}
                className={shared.pageButton}
                aria-disabled={page <= 1}
                aria-label="Previous page"
              >
                ← Prev
              </Link>
              <Link
                href={buildHref(baseParams, { page: String(page + 1) })}
                className={shared.pageButton}
                aria-disabled={page >= pageCount}
                aria-label="Next page"
              >
                Next →
              </Link>
            </div>
          </div>
        ) : null}
      </div>

      {hasPermission(session, "items.import") ? (
        <section id="bulk-stationery-import" aria-label="Bulk CSV stationery import" style={{ marginTop: "12px" }}>
          <CSVStationeryImporter packs={await listPacksForFilter()} />
        </section>
      ) : null}
    </div>
  );
}
