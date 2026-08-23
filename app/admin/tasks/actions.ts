"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser, hasPermission } from "@/lib/admin/rbac";
import {
  createOperationalTask,
  updateOperationalTaskStatus,
  listTaskComments,
  createTaskComment,
  getTask,
} from "@/lib/admin/operations";

async function assertAdminSession(permission: string) {
  const session = await getAdminUser();
  if (!session || !hasPermission(session, permission as any)) {
    throw new Error("Unauthorized: Insufficient permissions.");
  }
  return session;
}

export async function createTaskAction(formData: FormData) {
  const session = await assertAdminSession("tasks.manage");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const priority = String(formData.get("priority") || "normal");
  const dueAt = String(formData.get("due_at") || "");
  const entityType = String(formData.get("entity_type") || "");
  const entityId = String(formData.get("entity_id") || "");

  if (!title) {
    return { ok: false, error: "Title is required." };
  }

  try {
    const task = await createOperationalTask({
      title,
      description: description || undefined,
      priority,
      dueAt: dueAt || undefined,
      entityType: entityType || undefined,
      entityId: entityId || undefined,
      createdBy: session.user.id,
    });
    revalidatePath("/admin/tasks");
    return { ok: true, task };
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to create task." };
  }
}

export async function updateTaskStatusAction(taskId: string, status: string) {
  await assertAdminSession("tasks.manage");
  try {
    await updateOperationalTaskStatus(taskId, status);
    revalidatePath("/admin/tasks");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to update task status." };
  }
}

export async function loadTaskActivitiesAction(taskId: string) {
  await assertAdminSession("tasks.view");
  try {
    const comments = await listTaskComments(taskId);
    return { ok: true, comments };
  } catch (err: any) {
    return { ok: false, comments: [] };
  }
}

export async function addTaskCommentAction(taskId: string, body: string) {
  const session = await assertAdminSession("tasks.view");
  if (!body.trim()) {
    return { ok: false, error: "Comment body cannot be empty." };
  }

  try {
    const comment = await createTaskComment({
      taskId,
      authorId: session.user.id,
      body: body.trim(),
    });
    return { ok: true, comment };
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to add comment." };
  }
}

export async function approveTaskAction(taskId: string, notes?: string) {
  const session = await assertAdminSession("approvals.manage");
  try {
    const task = await getTask(taskId);
    if (!task) {
      return { ok: false, error: "Task not found." };
    }
    if (task.status === "completed") {
      return { ok: true, alreadyCompleted: true };
    }

    // Transactional status update and comment logging
    await updateOperationalTaskStatus(taskId, "completed");
    await createTaskComment({
      taskId,
      authorId: session.user.id,
      body: `Action approved and marked as completed by ${session.user.email || "Administrator"}.${notes ? ` Notes: ${notes}` : ""}`,
    });

    revalidatePath("/admin/tasks");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to approve task." };
  }
}
