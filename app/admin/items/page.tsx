import Link from "next/link";
import { requireAdmin } from "@/lib/admin/rbac";
import { listItems, type ItemListFilters } from "@/lib/admin/items";
import { listPacksForFilter } from "@/lib/admin/packs";
import { deleteItemAction } from "./actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import shared from "../schools/schools.module.css";
import adminStyles from "../admin.module.css";
import styles from "../packs/packs.module.css";

interface ItemsPageProps {
  searchParams: Promise<{
    q?: string;
    pack_id?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 30;

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
  await requireAdmin({ permission: "items.view" });
  const params = await searchParams;

  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const filters: ItemListFilters = {
    q: params.q?.trim() || undefined,
    pack_id: params.pack_id || undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  const { items, total, pageCount } = await listItems(filters);
  const packs = await listPacksForFilter();
  const baseParams = { q: filters.q, pack_id: filters.pack_id };
  const hasFilters = Boolean(filters.q || filters.pack_id);

  return (
    <div className={adminStyles.adminContainer}>
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

        <form method="get" action="/admin/items" className={shared.filterForm}>
          <input
            type="search"
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="Search item name or description…"
            className={`${shared.filterInput} ${shared.searchInput}`}
            aria-label="Search items"
          />
          <select name="pack_id" defaultValue={filters.pack_id ?? ""} className={shared.filterInput}>
            <option value="">All packs</option>
            {packs.map((pack) => (
              <option key={pack.id} value={pack.id}>
                {pack.title}
              </option>
            ))}
          </select>
          <button type="submit" className={shared.applyButton}>
            Apply
          </button>
          {hasFilters ? (
            <Link href="/admin/items" className={shared.resetLink}>
              Reset
            </Link>
          ) : null}
        </form>
      </div>

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
                  <th>Item Name</th>
                  <th>Description</th>
                  <th>Pack-Qty</th>
                  <th>Total Price</th>
                  <th>Visible</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className={styles.packCell}>
                        <div>
                          <div className={styles.packName}>{item.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>{item.description || "—"}</td>
                    <td>{item.quantity}</td>
                    <td className={styles.priceCell}>{money(item.unit_price)}</td>
                    <td>
                      <span
                        className={`${shared.flag} ${
                          item.visible ? styles.badgeVisible : styles.badgeHidden
                        }`}
                      >
                        {item.visible ? "Visible" : "Hidden"}
                      </span>
                    </td>
                    <td>
                      <div className={shared.actions}>
                        <Link
                          href={`/admin/items/${item.id}`}
                          className={shared.actionLink}
                        >
                          Edit
                        </Link>
                        <form action={deleteItemAction.bind(null, item.id)}>
                          <ConfirmButton
                            label="Delete"
                            confirmText={`Permanently delete "${item.name}"? This cannot be undone.`}
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
  );
}
