import Link from "next/link";
import { ArrowLeft, CheckSquare, Clock, MessageSquare, Paperclip, Save, Tag, Send } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
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
        <Link href="/admin/tasks" className={`${styles.secondaryBtn} ${styles.backLinkOverride}`}>
          <ArrowLeft size={14} /> Back to Tasks
        </Link>
      </div>

      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>
            {formattedTitle}
            <span className={styles.badgeBlue}>● In Progress</span>
          </h1>
          <p className={styles.headerSubtitle}>Task Ref: TSK-{id.slice(0, 8).toUpperCase()} • Category: Procurement</p>
        </div>
        <div className={styles.headerActions}>
          <form action="/admin/tasks" method="GET" className={`${styles.flex} ${styles.gap8}`}>
            <select name="status" defaultValue="In Progress" className={styles.selectField}>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Blocked">Blocked</option>
              <option value="Completed">Completed</option>
            </select>
          </form>
        </div>
      </div>

      <div className={styles.detailLayout}>
        <div className={`${styles.flex} ${styles["flex-col"]} ${styles.gap18}`}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <CheckSquare size={16} className={styles.iconTeal} />
                <span>Task Information &amp; Inline Description</span>
              </div>
            </div>

            <form action="/admin/tasks" method="GET" className={styles.formField}>
              <div>
                <label className={styles.formLabel}>Task Title</label>
                <input name="title" defaultValue={formattedTitle} className={`${styles.inputField} ${styles.inputFieldLg}`} />
              </div>
              <div>
                <label className={styles.formLabel}>Description &amp; Specifications</label>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue="Review Grade 1-3 stationery pack contents for Primrose Hill Primary. Verify manufacturer quantities, confirm Pritt glue stick 43g availability, and update line-item costs."
                  className={`${styles.textareaField} ${styles.textareaFieldMd}`}
                />
              </div>
              <div className={`${styles.flex} ${styles.justifyEnd}`}>
                <button type="submit" className={`${styles.primaryBtn} ${styles.h34}`}>
                  <Save size={13} /> Save Changes
                </button>
              </div>
            </form>
          </div>

          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <MessageSquare size={16} className={styles.iconBlue} />
                <span>Activity &amp; Threaded Comments</span>
              </div>
            </div>

            <div className={styles.commentStack}>
              <div className={styles.activityItem}>
                <div className={styles.commentHeader}>
                  <span className={styles.commentAuthor}>Kwanele G.</span>
                  <span className={styles.commentTimestamp}>Yesterday at 14:20</span>
                </div>
                <p className={styles.commentBody}>
                  @Mcebisi M. Waltons confirmed quote for Pritt 43g glue sticks at R 19.50 per unit. Updated supplier matrix.
                </p>
              </div>

              <div className={styles.activityItem}>
                <div className={styles.commentHeader}>
                  <span className={styles.commentAuthor}>Mcebisi M.</span>
                  <span className={styles.commentTimestamp}>Today at 09:15</span>
                </div>
                <p className={styles.commentBody}>
                  Thanks @Kwanele G. Approved for batch wave 064. Moving status to In Progress.
                </p>
              </div>

              <div className={styles.chatInputWrap}>
                <input placeholder="Write a comment... (use @mention or attach file)" className={styles.chatInput} />
                <button className={`${styles.secondaryBtn} ${styles.btnSm}`} title="Attach file">
                  <Paperclip size={14} />
                </button>
                <button className={`${styles.primaryBtn} ${styles.btnMd}`}>
                  <Send size={13} /> Post
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sidebarColumn}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Tag size={16} className={styles.iconTeal} />
                <span>Task Metadata</span>
              </div>
            </div>
            <div className={`${styles.flex} ${styles["flex-col"]} ${styles.gap10}`}>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Assignee:</span>
                <span className={styles.sidebarStatVal}>Mcebisi M.</span>
              </div>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Priority:</span>
                <span className={`${styles.cRed} ${styles.fw700}`}>High Priority</span>
              </div>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Due Date:</span>
                <span className={styles.sidebarStatVal}>28 May 2024</span>
              </div>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Created By:</span>
                <span className={styles.sidebarStatVal}>Liam M.</span>
              </div>
            </div>
          </div>

          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Clock size={16} className={styles.cAmber} />
                <span>Audit History Timeline</span>
              </div>
            </div>
            <div className={styles.timelineStack}>
              <div className={styles.timelineEntry}>
                <div className={styles.timelineTitle}>Status changed to In Progress</div>
                <div className={styles.timelineMeta}>20 Aug 2026 09:15 • By Mcebisi M.</div>
              </div>
              <div className={styles.timelineEntryMuted}>
                <div className={styles.timelineTitle}>Priority updated to High</div>
                <div className={styles.timelineMeta}>19 Aug 2026 14:20 • By Kwanele G.</div>
              </div>
              <div className={styles.timelineEntryMuted}>
                <div className={styles.timelineTitle}>Task Created</div>
                <div className={styles.timelineMeta}>18 Aug 2026 10:00 • By Liam M.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
