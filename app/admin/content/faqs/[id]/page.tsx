import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getFaq } from "@/lib/admin/content";
import { FaqForm } from "@/components/admin/content/FaqForm";
import adminStyles from "../../../admin.module.css";
import styles from "../../content.module.css";

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
      <p className={styles.backRow}>
        <Link href="/admin/content/faqs" className={styles.backLink}>
          <ArrowLeft aria-hidden="true" /> Back to FAQs
        </Link>
      </p>
      <div className={adminStyles.headerRow}>
        <div>
          <h1 className={adminStyles.pageTitle}>Edit FAQ</h1>
          <p className={styles.subtitle}>{row.question}</p>
        </div>
      </div>
      <div className={styles.card}>
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
