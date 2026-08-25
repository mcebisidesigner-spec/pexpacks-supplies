import { requireAdmin } from "@/lib/admin/rbac";
import { TestimonialForm } from "@/components/admin/content/TestimonialForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import adminStyles from "../../../admin.module.css";
import styles from "../../content.module.css";

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
      <div className={styles.card}>
        <TestimonialForm id={null} />
      </div>
    </div>
  );
}
