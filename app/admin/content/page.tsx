import Link from "next/link";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { listTestimonials, listFaqs } from "@/lib/admin/content";
import adminStyles from "../admin.module.css";
import styles from "./content.module.css";

export const metadata = {
  title: "Website Content | Admin | Pexpacks",
};

export default async function ContentHubPage() {
  const session = await requireAdmin({ permission: "content.view" });
  const [testimonials, faqs] = await Promise.all([listTestimonials(), listFaqs()]);
  const canManage = hasPermission(session, "content.manage");

  const cards = [
    {
      href: "/admin/content/testimonials",
      title: "Testimonials",
      text: "Manage the quotes shown in the homepage testimonial marquee.",
      count: `${testimonials.filter((t) => t.visible).length} live of ${testimonials.length}`,
    },
    {
      href: "/admin/content/faqs",
      title: "FAQs",
      text: "Manage the questions and answers shown on the FAQ page and site sections.",
      count: `${faqs.filter((f) => f.visible).length} live of ${faqs.length}`,
    },
    {
      href: "/admin/content/sections",
      title: "Content sections",
      text: "Edit homepage, footer and SEO copy that appears across the site.",
      count: "5 sections",
    },
  ];

  return (
    <div className={adminStyles.adminContainer}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Website Content</h1>
          <p className={styles.subtitle}>
            Manage testimonials, FAQs and site-wide copy.
            {canManage ? "" : " You have view-only access."}
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className={styles.hubCard}>
            <h2 className={styles.hubCardTitle}>{card.title}</h2>
            <p className={styles.hubCardText}>{card.text}</p>
            <span className={styles.hubCardCount}>{card.count}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
