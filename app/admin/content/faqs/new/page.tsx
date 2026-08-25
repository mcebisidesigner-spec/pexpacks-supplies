import { requireAdmin } from "@/lib/admin/rbac";
import { FaqForm } from "@/components/admin/content/FaqForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import adminStyles from "../../../admin.module.css";
import styles from "../../content.module.css";

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
      <div className={styles.card}>
        <FaqForm id={null} />
      </div>
    </div>
  );
}
