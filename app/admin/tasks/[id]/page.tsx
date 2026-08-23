import { ArrowLeft, CheckSquare, Clock, MessageSquare, Paperclip, Save, Tag, Send } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "@/components/admin/views/CorePagesView.module.css";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  await requireAdmin({ permission: "tasks.view" });
  const { id } = await params;

  const formattedTitle = id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className={styles.container}>
      <AdminPageHeader
        title={formattedTitle}
        subtitle={`Task Ref: TSK-${id.slice(0, 8).toUpperCase()} • Category: Procurement`}
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <StatusBadge status="in_progress" tone="blue" showDot />
            <AdminButton
              href="/admin/tasks"
              variant="secondary"
              icon={<ArrowLeft size={14} />}
            >
              Back to Tasks
            </AdminButton>
          </div>
        }
      />

      <div className={adminStyles.detailLayout}>
        <div className={`${adminStyles.flex} ${adminStyles["flex-col"]} ${adminStyles.gap18}`}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <CheckSquare size={16} className={adminStyles.iconTeal} />
                <span>Task Information &amp; Description</span>
              </div>
            </div>

            <form action="/admin/tasks" method="GET" className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel}>Task Title</label>
                <input
                  name="title"
                  defaultValue={formattedTitle}
                  className={`${adminStyles.inputField} ${adminStyles.inputFieldLg}`}
                />
              </div>

              <div>
                <label className={adminStyles.formLabel}>Description</label>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue="Review order and verify supplier delivery dates for the upcoming school season."
                  className={adminStyles.inputField}
                />
              </div>

              <div className={adminStyles.pt12}>
                <button type="submit" className={styles.primaryBtn}>
                  <Save size={14} /> Update Task
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className={adminStyles.sidebarColumn}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Tag size={16} className={adminStyles.iconBlue} />
                <span>Metadata</span>
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel}>Status</label>
                <select name="status" defaultValue="in_progress" className={adminStyles.inputField}>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label className={adminStyles.formLabel}>Priority</label>
                <select name="priority" defaultValue="high" className={adminStyles.inputField}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className={adminStyles.formLabel}>Assignee</label>
                <input
                  name="assigned_to"
                  defaultValue="Mcebisi Hlatshwayo"
                  className={adminStyles.inputField}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
