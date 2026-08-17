import Link from "next/link";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { listOrders, type OrderListFilters } from "@/lib/admin/orders";
import { OrderStatusBadge } from "@/components/admin/orders/OrderStatusBadge";
import { DateField } from "@/components/admin/DateField";
import shared from "../schools/schools.module.css";
import adminStyles from "../admin.module.css";
import styles from "./orders.module.css";

interface OrdersPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    pack_type?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 20;

function buildHref(
  params: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>,
): string {
  const merged = { ...params, ...overrides };
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value) qs.set(key, value);
  }
  const s = qs.toString();
  return s ? `/admin/orders?${s}` : "/admin/orders";
}

function money(v: number | null): string {
  return v == null ? "—" : `R ${v.toFixed(2)}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function packTypeLabel(packType: string | null): string {
  if (!packType) return "—";
  if (packType === "multi-school") return "Multi-school";
  return packType;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const session = await requireAdmin({ permission: "orders.view" });
  const params = await searchParams;

  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const filters: OrderListFilters = {
    q: params.q?.trim() || undefined,
    status: params.status || undefined,
    pack_type: params.pack_type || undefined,
    from: params.from || undefined,
    to: params.to || undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  const { orders, total, pageCount, statusOptions, packTypes } =
    await listOrders(filters);
  const baseParams = {
    q: filters.q,
    status: filters.status,
    pack_type: filters.pack_type,
    from: filters.from,
    to: filters.to,
  };

  const hasFilters = Boolean(
    filters.q ||
    filters.status ||
    filters.pack_type ||
    filters.from ||
    filters.to,
  );

  const exportQs = new URLSearchParams();
  for (const [key, value] of Object.entries(baseParams)) {
    if (value) exportQs.set(key, value);
  }
  const exportHref = `/admin/orders/export${exportQs.toString() ? `?${exportQs.toString()}` : ""}`;

  return (
    <div className={adminStyles.adminContainer}>
      <div className={shared.toolbar}>
        <div className={shared.headerRow}>
          <h1 className={shared.pageTitle}>
            Orders
            <span className={shared.count}>
              {total} {total === 1 ? "order" : "orders"}
            </span>
          </h1>
          {hasPermission(session, "orders.export") ? (
            <Link href={exportHref} className={shared.addButton}>
              Export CSV
            </Link>
          ) : null}
        </div>

        <form method="get" action="/admin/orders" className={shared.filterForm}>
          <input
            type="search"
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="Search reference, name, email, phone…"
            className={`${shared.filterInput} ${shared.searchInput}`}
            aria-label="Search orders"
          />
          <select
            name="status"
            defaultValue={filters.status ?? ""}
            className={shared.filterInput}
          >
            <option value="">All statuses</option>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            name="pack_type"
            defaultValue={filters.pack_type ?? ""}
            className={shared.filterInput}
          >
            <option value="">All pack types</option>
            {packTypes.map((t) => (
              <option key={t} value={t}>
                {packTypeLabel(t)}
              </option>
            ))}
          </select>
          <DateField
            name="from"
            defaultValue={filters.from ?? ""}
            className={shared.filterInput}
            ariaLabel="From date"
            placeholder="From date"
          />
          <DateField
            name="to"
            defaultValue={filters.to ?? ""}
            className={shared.filterInput}
            ariaLabel="To date"
            placeholder="To date"
          />
          <button type="submit" className={shared.applyButton}>
            Apply
          </button>
          {hasFilters ? (
            <Link href="/admin/orders" className={shared.resetLink}>
              Reset
            </Link>
          ) : null}
        </form>
      </div>

      {orders.length === 0 ? (
        <div className={adminStyles.tableCard}>
          <div className={adminStyles.emptyStateContainer}>
            <div className={adminStyles.emptyStateInner}>
              <div className={adminStyles.emptyIconWrapper}>
                <svg viewBox="0 0 24 24">
                  <path d="M4 7h16v13H4z" />
                  <path d="M8 3h8l2 4H6l2-4z" />
                </svg>
              </div>
              <h2 className={adminStyles.emptyStateTitle}>
                {hasFilters ? "No orders match your filters" : "No orders yet"}
              </h2>
              <p className={adminStyles.emptyStateText}>
                {hasFilters
                  ? "Try clearing your filters."
                  : "Orders placed through checkout will appear here."}
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
                  <th>Reference</th>
                  <th>Buyer</th>
                  <th>School / Grade</th>
                  <th>Type</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <div className={styles.reference}>
                        {order.order_reference}
                      </div>
                      <div className={styles.mutedText}>
                        {formatDate(order.created_at)}
                      </div>
                    </td>
                    <td>
                      <div>{order.buyer_name}</div>
                      <div className={styles.mutedText}>
                        {order.buyer_email ?? order.buyer_phone ?? "—"}
                      </div>
                    </td>
                    <td>
                      <div>{order.school_name}</div>
                      <div className={styles.mutedText}>{order.grade}</div>
                    </td>
                    <td>{packTypeLabel(order.pack_type)}</td>
                    <td className={styles.amountValue}>
                      {money(order.estimated_total)}
                    </td>
                    <td>
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td>{formatDate(order.created_at)}</td>
                    <td>
                      <div className={shared.actions}>
                        <Link
                          href={`/admin/orders/${order.order_reference || order.id}`}
                          className={shared.actionLink}
                        >
                          View
                        </Link>
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
            Page {page} of {pageCount} · {total} orders
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
