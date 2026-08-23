import { requireAdmin } from "@/lib/admin/rbac";
import { listOperationalTasks } from "@/lib/admin/operations";
import { TasksPageView } from "@/components/admin/views/TasksPageView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tasks & Collaboration | Admin | Pexpacks",
};

export default async function AdminTasksPage() {
  await requireAdmin({ permission: "tasks.view" });
  const tasks = await listOperationalTasks();
  return <TasksPageView initialTasks={tasks} />;
}
