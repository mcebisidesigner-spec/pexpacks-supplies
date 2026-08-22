import Link from "next/link";
import { ArrowLeft, Calendar, CheckSquare, Clock, Flag, Save, UserCheck, Tag } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "@/components/admin/views/CorePagesView.module.css";

export const metadata = {
  title: "New Task | Admin | Pexpacks",
};

export default async function NewTaskPage() {
  await requireAdmin({ permission: "tasks.manage" });

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <div>
        <Link
          href="/admin/tasks"
          className={`${styles.secondaryBtn} ${adminStyles.backLinkOverride}`}
        >
          <ArrowLeft size={14} /> Back to Tasks
        </Link>
      </div>

      {/* Header */}
      <div className={adminStyles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>Create New Task</h1>
          <p className={styles.headerSubtitle}>
            Assign operational action items across procurement, pricing, school approval, and packing.
          </p>
        </div>
      </div>

      <form action="/admin/tasks" method="GET" className={adminStyles.detailLayout}>
        <div className={`${adminStyles.flex} ${styles["flex-col"]} ${styles["gap-18"]}`}>
          {/* Task Details */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <CheckSquare size={16} className={adminStyles.iconTeal} />
                <span>Task Overview & Description</span>
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel}>
                  Task Title *
                </label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Confirm PO-11256 supplier delivery dates"
                  className={`${adminStyles.inputField} ${adminStyles.inputFieldLg}`}
                />
              </div>

              <div>
                <label className={adminStyles.formLabel}>
                  Detailed Description
                </label>
                <textarea
                  name="description"
                  rows={5}
                  placeholder="Outline requirements, affected school codes, and expected deliverables..."
                  className={`${adminStyles.textareaField} ${adminStyles.textareaFieldMd}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className={adminStyles.sidebarColumn}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Tag size={16} className={adminStyles.iconBlue} />
                <span>Assignment & Priority</span>
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel}>
                  Category
                </label>
                <select
                  name="category"
                  defaultValue="Procurement"
                  className={adminStyles.selectField}
                >
                  <option value="Procurement">Procurement</option>
                  <option value="Pricing">Pricing</option>
                  <option value="School Approval">School Approval</option>
                  <option value="Packing">Packing</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className={adminStyles.formLabel}>
                  Priority Level
                </label>
                <select
                  name="priority"
                  defaultValue="High"
                  className={adminStyles.selectField}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className={adminStyles.formLabel}>
                  Assignee
                </label>
                <select
                  name="assignee"
                  defaultValue="Kwanele G."
                  className={adminStyles.selectField}
                >
                  <option value="Mcebisi M.">Mcebisi M. (Operations Manager)</option>
                  <option value="Kwanele G.">Kwanele G. (Procurement Lead)</option>
                  <option value="Liam M.">Liam M. (General Manager)</option>
                  <option value="Warehouse Team">Warehouse Packing Team</option>
                </select>
              </div>

              <div>
                <label className={adminStyles.formLabel}>
                  Due Date
                </label>
                <input
                  type="date"
                  name="due_date"
                  defaultValue="2026-08-30"
                  className={adminStyles.inputField}
                />
              </div>

              <div className={styles["pt-8"]}>
                <button
                  type="submit"
                  className={`${styles.primaryBtn} ${styles["h-full-btn"]}`}
                >
                  <Save size={14} /> Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
