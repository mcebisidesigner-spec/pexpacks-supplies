import Link from "next/link";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { listAuditLogs, type AuditFilters } from "@/lib/admin/audit";
import { DateField } from "@/components/admin/DateField";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { buildHref, formatDateTime, PAGE_SIZE } from "@/lib/admin/ui-utils";
import adminStyles from "../admin.module.css";
import styles from "./audit.module.css";

interface AuditPageProps {
  searchParams: Promise<{
    q?: string;
    entity_type?: string;
    action?: string;
    actor?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}

export default async function AuditPage({ searchParams }: AuditPageProps) {
  const session = await requireAdmin({ permission: "audit.view" });
  const params = await searchParams;

  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const filters: AuditFilters = {
    q: params.q?.trim() || undefined,
    entity_type: params.entity_type || undefined,
    action: params.action || undefined,
    actor: params.actor || undefined,
    from: params.from || undefined,
    to: params.to || undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  const { logs, total, pageCount, entityTypes, actions, actors } =
    await listAuditLogs(filters);
  const baseParams = {
    q: filters.q,
    entity_type: filters.entity_type,
    action: filters.action,
    actor: filters.actor,
    from: filters.from,
    to: filters.to,
  };
  const hasFilters = Boolean(
    filters.q ||
    filters.entity_type ||
    filters.action ||
    filters.actor ||
    filters.from ||
    filters.to,
  );
  const canExport = hasPermission(session, "audit.export");

  return (
    <div className={adminStyles.adminContainer}>
      <AdminPageHeader
        title="Audit Logs"
        count={total}
        actions={
          canExport ? (
            <Link
              href={buildHref("/admin/audit/export", baseParams)}
              className={styles.exportLink}
            >
              Export CSV
            </Link>
          ) : null
        }
      />

      <div className={adminStyles.toolbar}>
        <form method="get" action="/admin/audit" className={adminStyles.filterForm}>
          <input
            type="search"
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="Search summary, actor or ID…"
            className={`${adminStyles.filterInput} ${adminStyles.searchInput}`}
            aria-label="Search audit logs"
          />
          <select
            name="entity_type"
            defaultValue={filters.entity_type ?? ""}
            className={adminStyles.filterInput}
          >
            <option value="">All entities</option>
            {entityTypes.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
          <select
            name="action"
            defaultValue={filters.action ?? ""}
            className={adminStyles.filterInput}
          >
            <option value="">All actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select
            name="actor"
            defaultValue={filters.actor ?? ""}
            className={adminStyles.filterInput}
          >
            <option value="">All actors</option>
            {actors.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <DateField
            name="from"
            defaultValue={filters.from ?? ""}
            className={adminStyles.filterInput}
            ariaLabel="From date"
            placeholder="From date"
          />
          <DateField
            name="to"
            defaultValue={filters.to ?? ""}
            className={adminStyles.filterInput}
            ariaLabel="To date"
            placeholder="To date"
          />
          <button type="submit" className={adminStyles.applyButton}>
            Apply
          </button>
          {hasFilters ? (
            <Link href="/admin/audit" className={adminStyles.resetLink}>
              Reset
            </Link>
          ) : null}
        </form>
      </div>

      {logs.length === 0 ? (
        <div className={adminStyles.tableCard}>
          <div className={adminStyles.emptyStateContainer}>
            <div className={adminStyles.emptyStateInner}>
              <div className={adminStyles.emptyIconWrapper}>
                <svg viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M9 13h6M9 17h6" />
                </svg>
              </div>
              <h2 className={adminStyles.emptyStateTitle}>
                {hasFilters
                  ? "No logs match your filters"
                  : "No audit activity yet"}
              </h2>
              <p className={adminStyles.emptyStateText}>
                {hasFilters
                  ? "Try widening the date range or clearing filters."
                  : "Admin actions will be recorded here as they happen."}
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
                  <th>Time</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Summary</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDateTime(log.created_at)}</td>
                    <td className={styles.actorCell}>
                      {log.actor_name ?? "—"}
                    </td>
                    <td className={styles.actionCell}>{log.action}</td>
                    <td>
                      <div className={styles.entityCell}>
                        {log.entity_type}
                        {log.entity_id
                          ? ` · ${log.entity_id.slice(0, 12)}`
                          : ""}
                      </div>
                    </td>
                    <td>
                      <div className={styles.summaryCell}>
                        <span className={styles.summaryText}>
                          {log.summary}
                        </span>
                      </div>
                    </td>
                    <td>
                      <Link
                        href={`/admin/audit/${log.id}`}
                        className={adminStyles.actionLink}
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination
        basePath="/admin/audit"
        params={baseParams}
        currentPage={page}
        totalPages={pageCount}
      />
    </div>
  );
}
