"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Link2,
  MessageSquare,
  Send,
  X,
} from "lucide-react";
import styles from "./TaskDrawer.module.css";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import {
  loadTaskActivitiesAction,
  addTaskCommentAction,
  approveTaskAction,
  updateTaskStatusAction,
} from "@/app/admin/tasks/actions";
import type { TaskRow, TaskCommentRow } from "@/lib/admin/operations";

export interface TaskDrawerProps {
  task: TaskRow | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated?: () => void;
}

export function TaskDrawer({
  task,
  isOpen,
  onClose,
  onTaskUpdated,
}: TaskDrawerProps) {
  const [comments, setComments] = useState<TaskCommentRow[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [status, setStatus] = useState<string>(task?.status || "open");

  useEffect(() => {
    if (task) {
      setStatus(task.status);
    }
  }, [task]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lazy load activities only when drawer is opened
  useEffect(() => {
    if (!isOpen || !task) {
      setComments([]);
      return;
    }

    let isMounted = true;
    setIsLoadingComments(true);

    loadTaskActivitiesAction(task.id).then((res) => {
      if (isMounted) {
        setComments(res.comments);
        setIsLoadingComments(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, task]);

  if (!isOpen || !task) return null;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const text = commentText.trim();
    setCommentText("");
    setIsSubmittingComment(true);

    // Optimistic comment insert
    const tempComment: TaskCommentRow = {
      id: `temp-${Date.now()}`,
      task_id: task.id,
      author_id: null,
      body: text,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setComments((prev) => [...prev, tempComment]);

    const res = await addTaskCommentAction(task.id, text);
    setIsSubmittingComment(false);

    if (res.ok && res.comment) {
      const savedComment = res.comment;
      setComments((prev) =>
        prev.map((c) => (c.id === tempComment.id ? savedComment : c)),
      );
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    const res = await approveTaskAction(task.id);
    setIsApproving(false);
    if (res.ok) {
      setStatus("completed");
      onTaskUpdated?.();
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    await updateTaskStatusAction(task.id, newStatus);
    onTaskUpdated?.();
  };

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.metaRow}>
              <StatusBadge status={status} showDot />
              <StatusBadge status={task.priority} showDot />
              {task.due_at && (
                <span
                  className={styles.metaRow}
                  style={{ color: "#94a3b8", fontSize: "12px" }}
                >
                  <Clock size={12} /> Due{" "}
                  {new Date(task.due_at).toLocaleDateString("en-ZA")}
                </span>
              )}
            </div>
            <h2 className={styles.title}>{task.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Close drawer"
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.body}>
          {task.entity_type && (
            <div className={styles.section}>
              <span className={styles.sectionTitle}>Linked Record</span>
              <div className={styles.linkedEntityBox}>
                <Link2 size={14} />
                <span>
                  {task.entity_type.toUpperCase()}:{" "}
                  {task.entity_id || "General"}
                </span>
              </div>
            </div>
          )}

          {task.description && (
            <div className={styles.section}>
              <span className={styles.sectionTitle}>
                Description &amp; Objective
              </span>
              <div className={styles.descriptionBox}>{task.description}</div>
            </div>
          )}

          <div className={styles.section}>
            <span className={styles.sectionTitle}>
              Activity Thread &amp; Notes
            </span>
            <div className={styles.threadList}>
              {isLoadingComments ? (
                <div className={styles.emptyComments}>
                  Loading activity thread...
                </div>
              ) : comments.length === 0 ? (
                <div className={styles.emptyComments}>
                  <MessageSquare
                    size={20}
                    style={{ margin: "0 auto 8px", opacity: 0.5 }}
                  />
                  <div>No discussion yet. Start the conversation below.</div>
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className={styles.commentCard}>
                    <div className={styles.commentTop}>
                      <span className={styles.commentAuthor}>Staff Member</span>
                      <span>
                        {new Date(c.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className={styles.commentBody}>{c.body}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <form
            onSubmit={handleAddComment}
            className="flex items-center gap-2 w-full"
          >
            <div className="flex-1">
              <input
                className={styles.commentInput}
                placeholder="Write a comment or note..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={isSubmittingComment}
                aria-label="Write a comment or note"
              />
            </div>
            <AdminButton
              type="submit"
              variant="teal"
              size="md"
              loading={isSubmittingComment}
              icon={<Send size={13} />}
            >
              Send
            </AdminButton>
          </form>

          <div className={styles.actionsRow}>
            <div style={{ display: "flex", gap: "6px" }}>
              {status !== "in_progress" && (
                <AdminButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleStatusChange("in_progress")}
                >
                  In Progress
                </AdminButton>
              )}
              {status !== "completed" && (
                <AdminButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleStatusChange("completed")}
                >
                  Mark Complete
                </AdminButton>
              )}
            </div>

            {status !== "completed" && (
              <AdminButton
                type="button"
                variant="primary"
                size="sm"
                loading={isApproving}
                icon={<CheckCircle2 size={13} />}
                onClick={handleApprove}
              >
                Approve Action &amp; Apply
              </AdminButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
