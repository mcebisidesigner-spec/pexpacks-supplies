import { ArrowLeft, Calendar, CheckSquare, Clock, Flag, Save, UserCheck, Tag } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "@/components/admin/views/CorePagesView.module.css";

export const metadata = {
  title: "New Task | Admin | Pexpacks",
};

export default async function NewTaskPage() {
  await requireAdmin({ permission: "tasks.manage" });

  return (
    <div className={styles.container}>
      <AdminPageHeader
        title="Create New Task"
        subtitle="Assign operational action items across procurement, pricing, school approval, and packing."
        actions={
          <AdminButton
            href="/admin/tasks"
            variant="secondary"
            icon={<ArrowLeft size={14} />}
          >
            Back to Tasks
          </AdminButton>
        }
      />

      <form action="/admin/tasks" method="GET" className={adminStyles.detailLayout}>
        <div className={`${adminStyles.flex} ${adminStyles["flex-col"]} ${adminStyles["gap-18"]}`}>
          {/* Task Details */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <CheckSquare size={16} className={adminStyles.iconTeal} />
                <span>Task Overview &amp; Description</span>
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
                  Detailed Instructions &amp; Notes
                </label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Include links, supplier details, or specific actions required..."
                  className={adminStyles.inputField}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Task Metadata Sidebar */}
        <div className={adminStyles.sidebarColumn}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Tag size={16} className={adminStyles.iconBlue} />
                <span>Properties &amp; Assignment</span>
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel}>Department / Category</label>
                <select name="category" className={adminStyles.inputField}>
                  <option value="Procurement">Procurement</option>
                  <option value="Fulfilment">Fulfilment</option>
                  <option value="Pricing">Pricing</option>
                  <option value="School Partner">School Partner</option>
                </select>
              </div>

              <div>
                <label className={adminStyles.formLabel}>Priority</label>
                <select name="priority" className={adminStyles.inputField} defaultValue="Medium">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className={adminStyles.formLabel}>Assignee</label>
                <select name="assigned_to" className={adminStyles.inputField}>
                  <option value="Sarah Jenkins">Sarah Jenkins (Procurement)</option>
                  <option value="Mcebisi Hlatshwayo">Mcebisi Hlatshwayo (Growth)</option>
                  <option value="Warehouse Lead">Warehouse Lead (Fulfilment)</option>
                </select>
              </div>

              <div>
                <label className={adminStyles.formLabel}>Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  className={adminStyles.inputField}
                />
              </div>

              <div className={adminStyles.pt12}>
                <button type="submit" className={`${styles.primaryBtn} ${adminStyles.hFullBtn}`}>
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
