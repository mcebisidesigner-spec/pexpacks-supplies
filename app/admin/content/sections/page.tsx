import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { contentSections, getWebsiteContent } from "@/lib/admin/content";
import { WebsiteContentForm } from "@/components/admin/content/WebsiteContentForm";
import adminStyles from "../../adminStyles";

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
          <p className="text-xs text-[var(--db-text-muted)] mt-1 max-w-2xl">
            Site-wide copy for the homepage, page heroes, announcement bar,
            footer and SEO defaults. Changes publish to the live site
            immediately.
          </p>
        </div>
      </div>
      <Link href="/admin/content" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--db-text-muted)] hover:text-white transition-colors mb-4">
        <ArrowLeft aria-hidden="true" size={14} /> Website content
      </Link>

      <div className="flex flex-col gap-5">
        {sections.map((section) => (
          <section key={section.key} className="bg-[var(--db-surface)] border border-[var(--db-border)] rounded-[var(--db-radius-card)] p-5 flex flex-col gap-4 shadow-[var(--db-shadow-card)]">
            <div className="flex flex-col gap-1 pb-3 border-b border-[var(--db-border-muted,rgba(255,255,255,0.06))]">
              <h2 className="text-sm font-extrabold text-white m-0">{section.label}</h2>
              <p className="text-xs text-[var(--db-text-muted)] m-0 leading-relaxed">{section.description}</p>
            </div>
            {canManage ? (
              <WebsiteContentForm
                section={section}
                values={values[section.key] as Record<string, unknown>}
              />
            ) : (
              <p className="text-xs text-[var(--db-text-muted)] italic m-0">You have view-only access.</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
