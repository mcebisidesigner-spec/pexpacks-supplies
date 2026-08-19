import { ClipboardCheck } from "lucide-react";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { listApprovals } from "@/lib/admin/operations";
import { formatDateTime } from "@/lib/admin/ui-utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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
        title="Approvals"
        subtitle="Review and decide on pending approval requests across the system."
      />

      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <span>Pending</span>
          <strong>{pendingApprovals.length}</strong>
        </div>
        <div className={styles.kpi}>
          <span>Approved</span>
          <strong>{approved}</strong>
        </div>
        <div className={styles.kpi}>
          <span>Rejected</span>
          <strong>{rejected}</strong>
        </div>
        <div className={styles.kpi}>
          <span>Cancelled</span>
          <strong>{cancelled}</strong>
        </div>
      </div>

      {pendingApprovals.length > 0 ? (
        <section className={styles.formPanel}>
          <h2>Pending approvals</h2>
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
                        <span className={styles.badge}>
                          {approval.approval_type}
                        </span>
                      </td>
                      <td>
                        {approval.entity_type}
                        <div className={styles.mono}>{approval.entity_id}</div>
                      </td>
                      <td className={styles.muted}>
                        {approval.reason || "-"}
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
                            <button className={styles.buttonSecondary}>
                              Submit
                            </button>
                          </form>
                        ) : (
                          "-"
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
            title="No pending approvals"
            text="All approval requests have been reviewed."
          />
        </section>
      )}

      {allApprovals.filter((a) => a.status !== "pending").length > 0 ? (
        <section className={styles.formPanel}>
          <h2>Decided approvals</h2>
          <div className={admin.tableCard}>
            <div className={admin.tableWrapper}>
              <table className={admin.table}>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Entity</th>
                    <th>Status</th>
                    <th>Decision</th>
                    <th>Notes</th>
                    <th>Decided</th>
                  </tr>
                </thead>
                <tbody>
                  {allApprovals
                    .filter((a) => a.status !== "pending")
                    .map((approval) => (
                      <tr key={approval.id}>
                        <td>
                          <span className={styles.badge}>
                            {approval.approval_type}
                          </span>
                        </td>
                        <td>
                          {approval.entity_type}
                          <div className={styles.mono}>
                            {approval.entity_id}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`${styles.badge} ${
                              approval.status === "approved"
                                ? styles.good
                                : approval.status === "rejected"
                                  ? styles.danger
                                  : ""
                            }`}
                          >
                            {approval.status}
                          </span>
                        </td>
                        <td className={styles.mono}>
                          {approval.decided_by?.slice(0, 8) || "-"}
                        </td>
                        <td className={styles.muted}>
                          {approval.decision_notes || "-"}
                        </td>
                        <td className={styles.muted}>
                          {approval.decided_at
                            ? formatDateTime(approval.decided_at)
                            : "-"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
