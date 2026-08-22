import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getAuditLog } from "@/lib/admin/audit";
import adminStyles from "../../admin.module.css";
import styles from "../audit.module.css";

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
      <p>
        <Link href="/admin/audit" className={adminStyles.resetLink}>
          <ArrowLeft aria-hidden="true" /> Back to audit logs
        </Link>
      </p>

      <div className={adminStyles.headerRow}>
        <h1 className={adminStyles.pageTitle}>
          Log #{log.id}
          <span className={adminStyles.count}>{log.action}</span>
        </h1>
      </div>

      <div className={styles.detailMeta}>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}>Time</div>
          <div className={styles.metaValue}>{formatDateTime(log.created_at)}</div>
        </div>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}>Actor</div>
          <div className={styles.metaValue}>{log.actor_name ?? "—"}</div>
        </div>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}>Action</div>
          <div className={styles.metaValue}>{log.action}</div>
        </div>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}>Entity type</div>
          <div className={styles.metaValue}>{log.entity_type}</div>
        </div>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}>Entity ID</div>
          <div className={styles.metaValue}>{log.entity_id ?? "—"}</div>
        </div>
      </div>

      <div className={styles.detailCard}>
        <div className={styles.detailCardHeader}>
          <h2 className={styles.detailCardTitle}>Summary</h2>
        </div>
        <div className={styles.detailCardBody}>
          <p className={adminStyles.m0}>{log.summary}</p>
        </div>
      </div>

      <div className={styles.detailCard}>
        <div className={styles.detailCardHeader}>
          <h2 className={styles.detailCardTitle}>Details</h2>
        </div>
        <div className={styles.detailCardBody}>
          {detailsJson ? (
            <pre className={styles.preBlock}>{detailsJson}</pre>
          ) : (
            <p className={`${styles.mutedText} ${adminStyles.m0}`}>
              No additional details recorded for this entry.
            </p>
          )}
        </div>
      </div>

      {(log.ip || log.user_agent) && (
        <div className={styles.detailCard}>
          <div className={styles.detailCardHeader}>
            <h2 className={styles.detailCardTitle}>Request context</h2>
          </div>
          <div className={styles.detailCardBody}>
            <pre className={styles.preBlock}>
              {`IP: ${log.ip ?? "—"}\nUser agent: ${log.user_agent ?? "—"}`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
