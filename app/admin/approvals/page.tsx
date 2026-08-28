import { CheckCircle2, Clock, XCircle, Ban, ClipboardCheck } from "lucide-react";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { listApprovals } from "@/lib/admin/operations";
import { formatDateTime } from "@/lib/admin/ui-utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MetricCard } from "@/components/admin/ui/AdminCard";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { EmptyState } from "@/components/admin/EmptyState";
import { updateApprovalAction } from "../operations-actions";
import admin from "../admin.module.css";
import styles from "../operations.module.css";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const [session, allApprovals, pendingApprovals] = await Promise.all([
    requireAdmin({ permission: "approvals.manage" }),
    listApprovals(),
    listApprovals("pending"),
  ]);

  const approved = allApprovals.filter((a) => a.status === "approved").length;
  const rejected = allApprovals.filter((a) => a.status === "rejected").length;
  const cancelled = allApprovals.filter((a) => a.status === "cancelled").length;

  return (
    <div className={styles.page}>
      <AdminPageHeader
        title="Approvals & Governance"
        subtitle="Review and action pending authorization requests across procurement and pricing."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "20px" }}>
        <MetricCard
          label="Pending Approvals"
          value={pendingApprovals.length}
          subtext="Awaiting manager sign-off"
          icon={<Clock size={16} />}
          iconTone={pendingApprovals.length > 0 ? "amber" : "green"}
        />
        <MetricCard
          label="Approved Requests"
          value={approved}
          subtext="Successfully authorized"
          icon={<CheckCircle2 size={16} />}
          iconTone="green"
        />
        <MetricCard
          label="Rejected"
          value={rejected}
          subtext="Declined requests"
          icon={<XCircle size={16} />}
          iconTone="red"
        />
        <MetricCard
          label="Cancelled"
          value={cancelled}
          subtext="Withdrawn by requester"
          icon={<Ban size={16} />}
          iconTone="blue"
        />
      </div>

      {pendingApprovals.length > 0 ? (
        <section className={styles.formPanel}>
          <h2>Pending approvals ({pendingApprovals.length})</h2>
          <div className={admin.tableCard}>
            <div className={admin.tableWrapper}>
              <table className={admin.table}>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Entity</th>
                    <th>Reason</th>
                    <th>Requested</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApprovals.map((approval) => (
                    <tr key={approval.id}>
                      <td>
                        <StatusBadge status={approval.approval_type} tone="blue" showDot />
                      </td>
                      <td>
                        <strong>{approval.entity_type}</strong>
                        <div className={styles.mono}>{approval.entity_id}</div>
                      </td>
                      <td className={styles.muted}>
                        {approval.reason || "—"}
                      </td>
                      <td className={styles.muted}>
                        {formatDateTime(approval.created_at)}
                      </td>
                      <td>
                        {hasPermission(session, "approvals.manage") ? (
                          <form
                            action={updateApprovalAction.bind(null, approval.id)}
                            className={styles.inlineForm}
                          >
                            <select
                              className={`${styles.field} ${styles.compact}`}
                              name="status"
                            >
                              <option value="approved">Approve</option>
                              <option value="rejected">Reject</option>
                              <option value="cancelled">Cancel</option>
                            </select>
                            <input
                              className={`${styles.field} ${styles.compact}`}
                              name="decisionNotes"
                              placeholder="Notes"
                            />
                            <AdminButton type="submit">Submit</AdminButton>
                          </form>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : (
        <section className={styles.formPanel}>
          <EmptyState
            icon={<ClipboardCheck aria-hidden="true" />}
            title="All caught up!"
            text="No pending approval requests require your review at this time."
          />
        </section>
      )}
    </div>
  );
}
