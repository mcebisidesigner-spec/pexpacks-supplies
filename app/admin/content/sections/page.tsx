import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { contentSections, getWebsiteContent } from "@/lib/admin/content";
import { WebsiteContentForm } from "@/components/admin/content/WebsiteContentForm";
import adminStyles from "../../admin.module.css";
import styles from "../content.module.css";

export const metadata = {
  title: "Content Sections | Admin | Pexpacks",
};

export default async function ContentSectionsPage() {
  const session = await requireAdmin({ permission: "content.view" });
  const sections = await contentSections();
  const values = (await getWebsiteContent()) as Record<
    string,
    Record<string, unknown>
  >;
  const canManage = hasPermission(session, "content.manage");

  return (
    <div className={adminStyles.adminContainer}>
      <div className={adminStyles.headerRow}>
        <div>
          <h1 className={adminStyles.pageTitle}>Content sections</h1>
          <p className={styles.subtitle}>
            Site-wide copy for the homepage, page heroes, announcement bar,
            footer and SEO defaults. Changes publish to the live site
            immediately.
          </p>
        </div>
      </div>
      <Link href="/admin/content" className={styles.backLink}>
        <ArrowLeft aria-hidden="true" /> Website content
      </Link>

      <div className={styles.stack}>
        {sections.map((section) => (
          <section key={section.key} className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>{section.label}</h2>
              <p className={styles.cardSubtitle}>{section.description}</p>
            </div>
            {canManage ? (
              <WebsiteContentForm
                section={section}
                values={values[section.key] as Record<string, unknown>}
              />
            ) : (
              <p className={styles.emptyNote}>You have view-only access.</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
