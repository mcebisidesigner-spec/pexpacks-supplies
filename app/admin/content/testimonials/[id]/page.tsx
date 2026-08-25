import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getTestimonial } from "@/lib/admin/content";
import { TestimonialForm } from "@/components/admin/content/TestimonialForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import adminStyles from "../../../admin.module.css";
import styles from "../../content.module.css";

export const metadata = {
  title: "Edit Testimonial | Admin | Pexpacks",
};

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin({ permission: "content.manage" });
  const { id } = await params;
  const row = await getTestimonial(id);
  if (!row) notFound();

  return (
    <div className={adminStyles.adminContainer}>
      <AdminPageHeader
        backHref="/admin/content/testimonials"
        backLabel="Back to Testimonials"
        title="Edit Testimonial"
        subtitle={row.name}
      />
      <div className={styles.card}>
        <TestimonialForm
          id={row.id}
          defaults={{
            name: row.name,
            role: row.role,
            context: row.context,
            quote: row.quote,
            rating: row.rating,
            visible: row.visible,
            sort_order: row.sort_order,
          }}
        />
      </div>
    </div>
  );
}
