import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { listFaqs } from "@/lib/admin/content";
import { setFaqVisibleAction, deleteFaqAction, reorderFaqAction } from "../actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { ReorderPanel } from "@/components/admin/ReorderPanel";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import adminStyles from "../../admin.module.css";
import styles from "../content.module.css";

export const metadata = {
  title: "FAQs | Admin | Pexpacks",
};

function linkCount(links: unknown): number {
  return Array.isArray(links) ? links.length : 0;
}

export default async function FaqsPage() {
  const session = await requireAdmin({ permission: "content.view" });
  const canManage = hasPermission(session, "content.manage");
  const faqs = await listFaqs();

  const reorderItems = faqs.map((f) => ({
    id: f.id,
    label: f.question,
    visible: f.visible,
  }));

  return (
    <div className={adminStyles.adminContainer}>
      <AdminPageHeader
        title="Frequently Asked Questions"
        count={faqs.length}
        subtitle="Questions shown on the FAQ page and in the site FAQ marquees."
        actions={
          <div style={{ display: "flex", gap: "8px" }}>
            <AdminButton
              href="/admin/content"
              variant="secondary"
              icon={<ArrowLeft size={14} />}
            >
              Back to Content
            </AdminButton>
            {canManage && (
              <AdminButton
                href="/admin/content/faqs/new"
                variant="primary"
                icon={<Plus size={14} />}
              >
                New FAQ
              </AdminButton>
            )}
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: canManage ? "1fr 300px" : "1fr", gap: "20px", alignItems: "start" }}>
        {faqs.length === 0 ? (
          <div className={adminStyles.tableCard}>
            <div className={adminStyles.emptyStateContainer}>
              <div className={adminStyles.emptyStateInner}>
                <div className={adminStyles.emptyIconWrapper}>
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <path d="M12 17h.01" />
                  </svg>
                </div>
                <h2 className={adminStyles.emptyStateTitle}>No FAQs yet</h2>
                <p className={adminStyles.emptyStateText}>
                  Create your first FAQ to answer common customer questions.
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
                    <th>Question</th>
                    <th>Category</th>
                    <th>Links</th>
                    <th>Sort</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {faqs.map((faq) => (
                    <tr key={faq.id}>
                      <td>
                        <div className={styles.questionCell}>
                          <div className={styles.questionText}>{faq.question}</div>
                          <div className={styles.answerSnippet}>{faq.answer}</div>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={faq.category} tone="blue" />
                      </td>
                      <td>{linkCount(faq.links)}</td>
                      <td>{faq.sort_order}</td>
                      <td>
                        <StatusBadge
                          status={faq.visible ? "Live" : "Hidden"}
                          showDot
                        />
                      </td>
                      <td>
                        <div className={styles.actions}>
                          {canManage ? (
                            <>
                              <Link
                                href={`/admin/content/faqs/${faq.id}`}
                                className={adminStyles.actionLink}
                              >
                                Edit
                              </Link>
                              <form
                                action={setFaqVisibleAction.bind(null, faq.id, !faq.visible)}
                              >
                                <button
                                  type="submit"
                                  className={`${adminStyles.rowButton} ${styles.rowButtonToggle}`}
                                >
                                  {faq.visible ? "Hide" : "Show"}
                                </button>
                              </form>
                              <form action={deleteFaqAction.bind(null, faq.id)}>
                                <ConfirmButton
                                  label="Delete"
                                  confirmText={`Delete FAQ "${faq.question}"?`}
                                  busyLabel="Deleting…"
                                  className={`${adminStyles.rowButton} ${adminStyles.rowButtonDelete}`}
                                />
                              </form>
                            </>
                          ) : (
                            <span className={styles.mutedAction}>View only</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {canManage && faqs.length > 1 && (
          <ReorderPanel
            title="Sort Order"
            subtitle="Drag or step FAQs up and down."
            items={reorderItems}
            onReorder={reorderFaqAction}
          />
        )}
      </div>
    </div>
  );
}
