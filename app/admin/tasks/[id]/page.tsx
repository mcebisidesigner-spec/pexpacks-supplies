import Link from "next/link";
import { ArrowLeft, CheckSquare, Clock, MessageSquare, Paperclip, Save, Tag, Send } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
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
      <div>
        <Link href="/admin/tasks" className={`${styles.secondaryBtn} ${adminStyles.backLinkOverride}`}>
          <ArrowLeft size={14} /> Back to Tasks
        </Link>
      </div>

      <div className={adminStyles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>
            {formattedTitle}
            <span className={adminStyles.badgeBlue}>● In Progress</span>
          </h1>
          <p className={styles.headerSubtitle}>Task Ref: TSK-{id.slice(0, 8).toUpperCase()} • Category: Procurement</p>
        </div>
        <div className={styles.headerActions}>
          <form action="/admin/tasks" method="GET" className={`${adminStyles.flex} ${adminStyles.gap8}`}>
            <select name="status" defaultValue="In Progress" className={adminStyles.selectField}>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Blocked">Blocked</option>
              <option value="Completed">Completed</option>
            </select>
          </form>
        </div>
      </div>

      <div className={adminStyles.detailLayout}>
        <div className={`${adminStyles.flex} ${adminStyles["flex-col"]} ${adminStyles.gap18}`}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <CheckSquare size={16} className={adminStyles.iconTeal} />
                <span>Task Information &amp; Inline Description</span>
              </div>
            </div>

            <form action="/admin/tasks" method="GET" className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel}>Task Title</label>
                <input name="title" defaultValue={formattedTitle} className={`${adminStyles.inputField} ${adminStyles.inputFieldLg}`} />
              </div>
              <div>
                <label className={adminStyles.formLabel}>Description &amp; Specifications</label>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue="Review Grade 1-3 stationery pack contents for Primrose Hill Primary. Verify manufacturer quantities, confirm Pritt glue stick 43g availability, and update line-item costs."
                  className={`${adminStyles.textareaField} ${adminStyles.textareaFieldMd}`}
                />
              </div>
              <div className={`${adminStyles.flex} ${adminStyles.justifyEnd}`}>
                <button type="submit" className={`${styles.primaryBtn} ${adminStyles.h34}`}>
                  <Save size={13} /> Save Changes
                </button>
              </div>
            </form>
          </div>

          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <MessageSquare size={16} className={adminStyles.iconBlue} />
                <span>Activity &amp; Threaded Comments</span>
              </div>
            </div>

            <div className={adminStyles.commentStack}>
              <div className={adminStyles.activityItem}>
                <div className={adminStyles.commentHeader}>
                  <span className={adminStyles.commentAuthor}>Kwanele G.</span>
                  <span className={adminStyles.commentTimestamp}>Yesterday at 14:20</span>
                </div>
                <p className={adminStyles.commentBody}>
                  @Mcebisi M. Waltons confirmed quote for Pritt 43g glue sticks at R 19.50 per unit. Updated supplier matrix.
                </p>
              </div>

              <div className={adminStyles.activityItem}>
                <div className={adminStyles.commentHeader}>
                  <span className={adminStyles.commentAuthor}>Mcebisi M.</span>
                  <span className={adminStyles.commentTimestamp}>Today at 09:15</span>
                </div>
                <p className={adminStyles.commentBody}>
                  Thanks @Kwanele G. Approved for batch wave 064. Moving status to In Progress.
                </p>
              </div>

              <div className={adminStyles.chatInputWrap}>
                <input placeholder="Write a comment... (use @mention or attach file)" className={adminStyles.chatInput} />
                <button className={`${styles.secondaryBtn} ${adminStyles.btnSm}`} title="Attach file">
                  <Paperclip size={14} />
                </button>
                <button className={`${styles.primaryBtn} ${adminStyles.btnMd}`}>
                  <Send size={13} /> Post
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={adminStyles.sidebarColumn}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Tag size={16} className={adminStyles.iconTeal} />
                <span>Task Metadata</span>
              </div>
            </div>
            <div className={`${adminStyles.flex} ${adminStyles["flex-col"]} ${adminStyles.gap10}`}>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Assignee:</span>
                <span className={adminStyles.sidebarStatVal}>Mcebisi M.</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Priority:</span>
                <span className={`${adminStyles.cRed} ${adminStyles.fw700}`}>High Priority</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Due Date:</span>
                <span className={adminStyles.sidebarStatVal}>28 May 2024</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Created By:</span>
                <span className={adminStyles.sidebarStatVal}>Liam M.</span>
              </div>
            </div>
          </div>

          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Clock size={16} className={adminStyles.cAmber} />
                <span>Audit History Timeline</span>
              </div>
            </div>
            <div className={adminStyles.timelineStack}>
              <div className={adminStyles.timelineEntry}>
                <div className={adminStyles.timelineTitle}>Status changed to In Progress</div>
                <div className={adminStyles.timelineMeta}>20 Aug 2026 09:15 • By Mcebisi M.</div>
              </div>
              <div className={adminStyles.timelineEntryMuted}>
                <div className={adminStyles.timelineTitle}>Priority updated to High</div>
                <div className={adminStyles.timelineMeta}>19 Aug 2026 14:20 • By Kwanele G.</div>
              </div>
              <div className={adminStyles.timelineEntryMuted}>
                <div className={adminStyles.timelineTitle}>Task Created</div>
                <div className={adminStyles.timelineMeta}>18 Aug 2026 10:00 • By Liam M.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
