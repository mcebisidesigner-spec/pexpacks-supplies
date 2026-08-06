import { requireAdmin } from "@/lib/admin/rbac";
import { TestimonialForm } from "@/components/admin/content/TestimonialForm";
import adminStyles from "../../../admin.module.css";
import styles from "../../content.module.css";

export const metadata = {
  title: "New Testimonial | Admin | Pexpacks",
};

export default async function NewTestimonialPage() {
  await requireAdmin({ permission: "content.manage" });

  return (
    <div className={adminStyles.adminContainer}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>New testimonial</h1>
          <p className={styles.subtitle}>Add a customer quote to the homepage marquee.</p>
        </div>
      </div>
      <div className={styles.card}>
        <TestimonialForm id={null} />
      </div>
    </div>
  );
}
