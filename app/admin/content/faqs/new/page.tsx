import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import { FaqForm } from "@/components/admin/content/FaqForm";
import adminStyles from "../../../admin.module.css";
import styles from "../../content.module.css";

export const metadata = {
  title: "New FAQ | Admin | Pexpacks",
};

export default async function NewFaqPage() {
  await requireAdmin({ permission: "content.manage" });

  return (
    <div className={adminStyles.adminContainer}>
      <p className={styles.backRow}>
        <Link href="/admin/content/faqs" className={styles.backLink}>
          <ArrowLeft aria-hidden="true" /> Back to FAQs
        </Link>
      </p>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>New FAQ</h1>
          <p className={styles.subtitle}>Add a question and answer to the FAQ content.</p>
        </div>
      </div>
      <div className={styles.card}>
        <FaqForm id={null} />
      </div>
    </div>
  );
}
