import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { listTestimonials } from "@/lib/admin/content";
import { setTestimonialVisibleAction, deleteTestimonialAction } from "../actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import adminStyles from "../../admin.module.css";
import styles from "../content.module.css";

export const metadata = {
  title: "Testimonials | Admin | Pexpacks",
};

export default async function TestimonialsPage() {
  const session = await requireAdmin({ permission: "content.view" });
  const canManage = hasPermission(session, "content.manage");
  const testimonials = await listTestimonials();

  return (
    <div className={adminStyles.adminContainer}>
      <div className={adminStyles.toolbar}>
        <div className={adminStyles.headerRow}>
          <div>
            <h1 className={adminStyles.pageTitle}>
              Testimonials
              <span className={adminStyles.count}>
                {testimonials.length} {testimonials.length === 1 ? "item" : "items"}
              </span>
            </h1>
            <p className={styles.subtitle}>
              Shown in the homepage testimonial marquee, newest first by sort order.
            </p>
          </div>
          {canManage ? (
            <Link href="/admin/content/testimonials/new" className={adminStyles.addButton}>
              + New testimonial
            </Link>
          ) : null}
        </div>
        <Link href="/admin/content" className={styles.backLink}>
          <ArrowLeft aria-hidden="true" /> Website content
        </Link>
      </div>

      {testimonials.length === 0 ? (
        <div className={adminStyles.tableCard}>
          <div className={adminStyles.emptyStateContainer}>
            <div className={adminStyles.emptyStateInner}>
              <div className={adminStyles.emptyIconWrapper}>
                <svg viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h2 className={adminStyles.emptyStateTitle}>No testimonials yet</h2>
              <p className={adminStyles.emptyStateText}>
                Add your first testimonial to show social proof on the homepage.
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
                  <th>Person</th>
                  <th>Quote</th>
                  <th>Rating</th>
                  <th>Sort</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.name}</strong>
                      <div className={adminStyles.schoolName}>
                        {[t.role, t.context].filter(Boolean).join(" · ") || "—"}
                      </div>
                    </td>
                    <td>
                      <div className={styles.quote}>
                        “{t.quote.slice(0, 90)}
                        {t.quote.length > 90 ? "…" : ""}”
                      </div>
                    </td>
                    <td>{"★".repeat(t.rating)}</td>
                    <td>{t.sort_order}</td>
                    <td>
                      <span
                        className={`${adminStyles.badge} ${
                          t.visible ? adminStyles.badgePaid : adminStyles.badgeMuted
                        }`}
                      >
                        {t.visible ? "Live" : "Hidden"}
                      </span>
                    </td>
                    <td>
                      {canManage ? (
                        <div className={styles.actions}>
                          <Link
                            href={`/admin/content/testimonials/${t.id}`}
                            className={adminStyles.actionLink}
                          >
                            Edit
                          </Link>
                          <form action={setTestimonialVisibleAction.bind(null, t.id, !t.visible)}>
                            <button
                              type="submit"
                              className={`${adminStyles.rowButton} ${
                                t.visible ? styles.rowButtonHide : styles.rowButtonShow
                              }`}
                            >
                              {t.visible ? "Hide" : "Show"}
                            </button>
                          </form>
                          <form action={deleteTestimonialAction.bind(null, t.id)}>
                            <ConfirmButton
                              label="Delete"
                              confirmText={`Delete the testimonial from ${t.name}? This cannot be undone.`}
                              busyLabel="Deleting…"
                              className={`${adminStyles.rowButton} ${adminStyles.rowButtonDelete}`}
                            />
                          </form>
                        </div>
                      ) : (
                        <span className={styles.emptyNote}>View only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
