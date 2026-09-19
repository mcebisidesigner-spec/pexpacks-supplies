import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getFaq } from "@/lib/admin/content";
import { FaqForm } from "@/components/admin/content/FaqForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import adminStyles from "../../../adminStyles";

export const metadata = {
  title: "Edit FAQ | Admin | Pexpacks",
};

export default async function EditFaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin({ permission: "content.manage" });
  const { id } = await params;
  const row = await getFaq(id);
  if (!row) notFound();

  return (
    <div className={adminStyles.adminContainer}>
      <AdminPageHeader
        backHref="/admin/content/faqs"
        backLabel="Back to FAQs"
        title="Edit FAQ"
        subtitle={row.question}
      />
      <div className="bg-[var(--db-surface)] border border-[var(--db-border)] rounded-[var(--db-radius-card)] p-5 flex flex-col gap-3">
        <FaqForm
          id={row.id}
          defaults={{
            slug: row.slug ?? "",
            category: row.category,
            question: row.question,
            answer: row.answer,
            links: Array.isArray(row.links)
              ? (row.links as { label: string; href: string }[])
              : [],
            visible: row.visible,
            sort_order: row.sort_order,
          }}
        />
      </div>
    </div>
  );
}
