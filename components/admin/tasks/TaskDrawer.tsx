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
      className="fixed inset-0 bg-black/65 backdrop-blur-xs z-50 flex justify-end animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-[520px] h-full bg-[var(--db-surface-inner,#090e17)] border-l border-[var(--db-border,#1e293b)] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6 bg-[var(--db-surface,#0c1322)] border-b border-[var(--db-border,#1e293b)] flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={status} showDot />
              <StatusBadge status={task.priority} showDot />
              {task.due_at && (
                <span className="flex items-center gap-1 text-slate-400 text-xs">
                  <Clock size={12} /> Due{" "}
                  {new Date(task.due_at).toLocaleDateString("en-ZA")}
                </span>
              )}
            </div>
            <h2 className="m-0 text-lg font-bold text-white tracking-tight leading-tight">
              {task.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800/50 border border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors"
            aria-label="Close drawer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-6">
          {task.entity_type && (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Linked Record
              </span>
              <div className="flex items-center gap-2.5 p-2.5 sm:px-3.5 rounded-lg bg-slate-800/40 border border-slate-700/60 text-xs font-semibold text-blue-400">
                <Link2 size={14} />
                <span>
                  {task.entity_type.toUpperCase()}:{" "}
                  {task.entity_id || "General"}
                </span>
              </div>
            </div>
          )}

          {task.description && (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Description &amp; Objective
              </span>
              <div className="p-3.5 rounded-lg bg-[var(--db-surface,#0c1322)] border border-[var(--db-border,#1e293b)] text-xs sm:text-sm text-slate-300 leading-relaxed">
                {task.description}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Activity Thread &amp; Notes
            </span>
            <div className="flex flex-col gap-3">
              {isLoadingComments ? (
                <div className="p-5 text-center text-slate-400 text-xs sm:text-sm">
                  Loading activity thread...
                </div>
              ) : comments.length === 0 ? (
                <div className="p-5 text-center text-slate-400 text-xs sm:text-sm flex flex-col items-center gap-2">
                  <MessageSquare
                    size={20}
                    className="opacity-50"
                  />
                  <div>No discussion yet. Start the conversation below.</div>
                </div>
              ) : (
                comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 sm:px-3.5 rounded-lg bg-[var(--db-surface,#0c1322)] border border-[var(--db-border,#1e293b)] flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold text-slate-300">Staff Member</span>
                      <span>
                        {new Date(c.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-200 leading-normal break-words">
                      {c.body}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-4 sm:px-6 bg-[var(--db-surface,#0c1322)] border-t border-[var(--db-border,#1e293b)] flex flex-col gap-3">
          <form
            onSubmit={handleAddComment}
            className="flex items-center gap-2 w-full"
          >
            <div className="flex-1">
              <input
                className="w-full h-9 bg-[var(--db-surface-inner,#090e17)] border border-[var(--db-border,#1e293b)] rounded-lg px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
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

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
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
