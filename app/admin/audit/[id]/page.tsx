import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getAuditLog } from "@/lib/admin/audit";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import adminStyles from "../../adminStyles";

interface AuditDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default async function AuditDetailPage({ params }: AuditDetailPageProps) {
  await requireAdmin({ permission: "audit.view" });
  const { id: idParam } = await params;
  const id = Number.parseInt(idParam, 10);
  if (Number.isNaN(id)) notFound();

  const log = await getAuditLog(id);
  if (!log) notFound();

  const detailsJson = log.details ? JSON.stringify(log.details, null, 2) : null;

  return (
    <div className={adminStyles.adminContainer}>
      <AdminPageHeader
        backHref="/admin/audit"
        backLabel="Back to Audit Logs"
        title={`Log #${log.id}`}
        subtitle={log.action}
      />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 mb-5">
        <div className="bg-[var(--pex-bg)] border border-[var(--db-border)] rounded-xl p-3 px-3.5">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[var(--db-text-muted)]">Time</div>
          <div className="mt-1 text-sm font-bold text-[var(--a-text)] break-words">{formatDateTime(log.created_at)}</div>
        </div>
        <div className="bg-[var(--pex-bg)] border border-[var(--db-border)] rounded-xl p-3 px-3.5">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[var(--db-text-muted)]">Actor</div>
          <div className="mt-1 text-sm font-bold text-[var(--a-text)] break-words">{log.actor_name ?? "—"}</div>
        </div>
        <div className="bg-[var(--pex-bg)] border border-[var(--db-border)] rounded-xl p-3 px-3.5">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[var(--db-text-muted)]">Action</div>
          <div className="mt-1 text-sm font-bold text-[var(--a-text)] break-words">{log.action}</div>
        </div>
        <div className="bg-[var(--pex-bg)] border border-[var(--db-border)] rounded-xl p-3 px-3.5">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[var(--db-text-muted)]">Entity type</div>
          <div className="mt-1 text-sm font-bold text-[var(--a-text)] break-words">{log.entity_type}</div>
        </div>
        <div className="bg-[var(--pex-bg)] border border-[var(--db-border)] rounded-xl p-3 px-3.5">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[var(--db-text-muted)]">Entity ID</div>
          <div className="mt-1 text-sm font-bold text-[var(--a-text)] break-words">{log.entity_id ?? "—"}</div>
        </div>
      </div>

      <div className="bg-[var(--pex-bg)] border border-[var(--db-border)] rounded-2xl overflow-hidden mb-4">
        <div className="p-[20px_22px_0]">
          <h2 className="m-0 text-lg font-extrabold text-[var(--a-text)]">Summary</h2>
        </div>
        <div className="p-[16px_22px_22px]">
          <p className={adminStyles.m0}>{log.summary}</p>
        </div>
      </div>

      <div className="bg-[var(--pex-bg)] border border-[var(--db-border)] rounded-2xl overflow-hidden mb-4">
        <div className="p-[20px_22px_0]">
          <h2 className="m-0 text-lg font-extrabold text-[var(--a-text)]">Details</h2>
        </div>
        <div className="p-[16px_22px_22px]">
          {detailsJson ? (
            <pre className="bg-[var(--db-surface-inner)] border border-[var(--db-border)] rounded-[10px] p-[14px_16px] font-mono text-[12.5px] leading-[1.6] text-[var(--a-text)] overflow-x-auto whitespace-pre-wrap break-words">{detailsJson}</pre>
          ) : (
            <p className={`text-[var(--db-text-muted)] ${adminStyles.m0}`}>
              No additional details recorded for this entry.
            </p>
          )}
        </div>
      </div>

      {(log.ip || log.user_agent) && (
        <div className="bg-[var(--pex-bg)] border border-[var(--db-border)] rounded-2xl overflow-hidden mb-4">
          <div className="p-[20px_22px_0]">
            <h2 className="m-0 text-lg font-extrabold text-[var(--a-text)]">Request context</h2>
          </div>
          <div className="p-[16px_22px_22px]">
            <pre className="bg-[var(--db-surface-inner)] border border-[var(--db-border)] rounded-[10px] p-[14px_16px] font-mono text-[12.5px] leading-[1.6] text-[var(--a-text)] overflow-x-auto whitespace-pre-wrap break-words">
              {`IP: ${log.ip ?? "—"}\nUser agent: ${log.user_agent ?? "—"}`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
