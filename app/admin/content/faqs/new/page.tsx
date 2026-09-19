import { requireAdmin } from "@/lib/admin/rbac";
import { FaqForm } from "@/components/admin/content/FaqForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import adminStyles from "../../../adminStyles";

export const metadata = {
  title: "New FAQ | Admin | Pexpacks",
};

export default async function NewFaqPage() {
  await requireAdmin({ permission: "content.manage" });

  return (
    <div className={adminStyles.adminContainer}>
      <AdminPageHeader
        backHref="/admin/content/faqs"
        backLabel="Back to FAQs"
        title="New FAQ"
        subtitle="Add a question and answer to the FAQ content."
      />
      <div className="bg-[var(--db-surface)] border border-[var(--db-border)] rounded-[var(--db-radius-card)] p-5 flex flex-col gap-3">
        <FaqForm id={null} />
      </div>
    </div>
  );
}
