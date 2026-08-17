import { requireAdmin } from "@/lib/admin/rbac";
import { TasksPageView } from "@/components/admin/views/TasksPageView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tasks | Admin | Pexpacks",
};

export default async function AdminTasksPage() {
  await requireAdmin({ permission: "tasks.view" });
  return <TasksPageView />;
}
