import { requireAdmin } from "@/lib/admin/rbac";
import { TestimonialForm } from "@/components/admin/content/TestimonialForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import adminStyles from "../../../adminStyles";

export const metadata = {
  title: "New Testimonial | Admin | Pexpacks",
};

export default async function NewTestimonialPage() {
  await requireAdmin({ permission: "content.manage" });

  return (
    <div className={adminStyles.adminContainer}>
      <AdminPageHeader
        backHref="/admin/content/testimonials"
        backLabel="Back to Testimonials"
        title="New Testimonial"
        subtitle="Add a customer quote to the homepage marquee."
      />
      <div className="bg-[var(--db-surface)] border border-[var(--db-border)] rounded-[var(--db-radius-card)] p-5 flex flex-col gap-3">
        <TestimonialForm id={null} />
      </div>
    </div>
  );
}
