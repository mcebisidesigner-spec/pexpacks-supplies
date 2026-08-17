import Link from "next/link";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { listPayments, type PaymentFilters } from "@/lib/admin/payments";
import { PAYMENT_GATEWAY_LABELS } from "@/lib/admin/order-constants";
import { OrderStatusBadge } from "@/components/admin/orders/OrderStatusBadge";
import { RefundButton } from "@/components/admin/orders/RefundButton";
import shared from "../schools/schools.module.css";
import adminStyles from "../admin.module.css";
import orderStyles from "../orders/orders.module.css";

interface PaymentsPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
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
  return s ? `/admin/payments?${s}` : "/admin/payments";
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

function paymentMethod(payment: {
  payment_gateway: string | null;
  metadata: unknown;
}): string {
  const metadata =
    payment.metadata &&
    typeof payment.metadata === "object" &&
    !Array.isArray(payment.metadata)
      ? (payment.metadata as Record<string, unknown>)
      : null;
  const gateway =
    metadata?.gateway &&
    typeof metadata.gateway === "object" &&
    !Array.isArray(metadata.gateway)
      ? (metadata.gateway as Record<string, unknown>)
      : null;
  const method =
    typeof metadata?.method === "string"
      ? metadata.method
      : typeof gateway?.method === "string"
        ? gateway.method
        : "";
  if (method.toLowerCase() === "happypay") return "Ozow · Happy Pay";
  return (
    PAYMENT_GATEWAY_LABELS[payment.payment_gateway ?? ""] ??
    payment.payment_gateway ??
    "—"
  );
}

export default async function PaymentsPage({
  searchParams,
}: PaymentsPageProps) {
  const session = await requireAdmin({ permission: "payments.view" });
  const params = await searchParams;

  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const filters: PaymentFilters = {
    q: params.q?.trim() || undefined,
    status: params.status || undefined,
    from: params.from || undefined,
    to: params.to || undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  const { payments, total, pageCount, paidTotal, paidCount, statusOptions } =
    await listPayments(filters);
  const baseParams = {
    q: filters.q,
    status: filters.status,
    from: filters.from,
    to: filters.to,
  };

  const hasFilters = Boolean(
    filters.q || filters.status || filters.from || filters.to,
  );
  const canRefund = hasPermission(session, "payments.refund");

  return (
    <div className={adminStyles.adminContainer}>
      <div className={shared.toolbar}>
        <div className={shared.headerRow}>
          <h1 className={shared.pageTitle}>
            Payments
            <span className={shared.count}>
              {total} {total === 1 ? "payment" : "payments"}
            </span>
          </h1>
        </div>

        <div className={orderStyles.summaryStrip}>
          <div className={orderStyles.summaryItem}>
            <span className={orderStyles.summaryLabel}>
              Captured revenue (paid)
            </span>
            <span className={orderStyles.summaryValue}>{money(paidTotal)}</span>
          </div>
          <div className={orderStyles.summaryItem}>
            <span className={orderStyles.summaryLabel}>Paid orders</span>
            <span className={orderStyles.summaryValue}>{paidCount}</span>
          </div>
          <div className={orderStyles.summaryItem}>
            <span className={orderStyles.summaryLabel}>Payments shown</span>
            <span className={orderStyles.summaryValue}>{total}</span>
          </div>
        </div>

        <form
          method="get"
          action="/admin/payments"
          className={shared.filterForm}
        >
          <input
            type="search"
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="Search reference or buyer…"
            className={`${shared.filterInput} ${shared.searchInput}`}
            aria-label="Search payments"
          />
          <select
            name="status"
            defaultValue={filters.status ?? ""}
            className={shared.filterInput}
          >
            <option value="">All payment statuses</option>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            name="from"
            defaultValue={filters.from ?? ""}
            className={shared.filterInput}
            aria-label="From date"
          />
          <input
            type="date"
            name="to"
            defaultValue={filters.to ?? ""}
            className={shared.filterInput}
            aria-label="To date"
          />
          <button type="submit" className={shared.applyButton}>
            Apply
          </button>
          {hasFilters ? (
            <Link href="/admin/payments" className={shared.resetLink}>
              Reset
            </Link>
          ) : null}
        </form>
      </div>

      {payments.length === 0 ? (
        <div className={adminStyles.tableCard}>
          <div className={adminStyles.emptyStateContainer}>
            <div className={adminStyles.emptyStateInner}>
              <div className={adminStyles.emptyIconWrapper}>
                <svg viewBox="0 0 24 24">
                  <path d="M3 5h18v14H3z" />
                  <path d="M3 10h18" />
                  <path d="M7 15h6" />
                </svg>
              </div>
              <h2 className={adminStyles.emptyStateTitle}>
                {hasFilters
                  ? "No payments match your filters"
                  : "No payments yet"}
              </h2>
              <p className={adminStyles.emptyStateText}>
                Payment attempts recorded against orders will appear here.
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
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Gateway</th>
                  <th>Gateway ref</th>
                  <th>Paid</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className={orderStyles.mono}>
                        {p.order_reference}
                      </div>
                      <div className={orderStyles.mutedText}>
                        {formatDate(p.created_at)}
                      </div>
                    </td>
                    <td>
                      <div>{p.buyer_name}</div>
                      <div className={orderStyles.mutedText}>
                        {p.buyer_email ?? "—"}
                      </div>
                    </td>
                    <td className={orderStyles.amountValue}>
                      {money(p.estimated_total)}
                    </td>
                    <td>
                      <OrderStatusBadge status={p.status} />
                    </td>
                    <td>{paymentMethod(p)}</td>
                    <td>
                      <span className={orderStyles.mono}>
                        {p.gateway_reference ?? p.payment_reference ?? "—"}
                      </span>
                    </td>
                    <td>{formatDate(p.paid_at)}</td>
                    <td>
                      <div className={shared.actions}>
                        <Link
                          href={`/admin/orders/${p.order_reference || p.id}`}
                          className={shared.actionLink}
                        >
                          View
                        </Link>
                        {canRefund &&
                        !["refunded", "cancelled"].includes(p.status) ? (
                          <RefundButton
                            id={p.id}
                            amount={money(p.estimated_total)}
                          />
                        ) : null}
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
            Page {page} of {pageCount} · {total} payments
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
