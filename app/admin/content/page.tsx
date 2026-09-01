import { requireAdmin } from "@/lib/admin/rbac";
import {
  getCmsOverviewMetrics,
  listCmsAnnouncements,
  listCmsFaqs,
  listCmsTestimonials,
  listCmsResources,
} from "@/lib/admin/content";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { UnifiedCmsView } from "@/components/admin/content/UnifiedCmsView";
import adminStyles from "../admin.module.css";

export const metadata = {
  title: "Website Content CMS | Admin | Pexpacks",
};

export default async function ContentHubPage() {
  await requireAdmin({ permission: "content.view" });

  const [metrics, announcements, faqs, testimonials, resources] = await Promise.all([
    getCmsOverviewMetrics(),
    listCmsAnnouncements(),
    listCmsFaqs(),
    listCmsTestimonials(),
    listCmsResources(),
  ]);

  return (
    <div className={adminStyles.adminContainer}>
      <AdminPageHeader
        title="Storefront Content CMS"
        subtitle="Dynamically manage announcement eyebrows, FAQs, testimonials, and resource downloads."
      />

      <UnifiedCmsView
        metrics={metrics}
        announcements={announcements}
        faqs={faqs}
        testimonials={testimonials}
        resources={resources}
      />
    </div>
  );
}
