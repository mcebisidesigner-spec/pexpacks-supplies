import { Metadata } from "next";
import Link from "next/link";
import { CTASection } from "@/components/marketing/CTASection";
import { PageHero } from "@/components/marketing/PageHero";
import { blogPosts } from "@/data/blog";
import styles from "./Blog.module.css";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(
  "Digital Backpack Resources | Pexpacks",
  "Free printables, expert parent guides, and study tools to empower your child's academic year.",
  "/blog"
);

import { SchoolSearchWidget } from "@/components/marketing/SchoolSearchWidget";
import { BlogFilter } from "./BlogFilter";
import { SubscribeForm } from "./SubscribeForm";

export default function BlogIndex() {
  return (
    <>
      <PageHero
        eyebrow="Digital Backpack"
        title="Everything you need, beyond the box."
        panelText="Free resources for parents and learners"
        panelTitle="Expert guides, printables, study tools &amp; more"
      />

      <div className={styles.blogContainer}>
        {/* PRIMARY COLUMN: ARTICLES */}
        <main className={styles.articlesColumn} aria-label="Resource articles">
          <BlogFilter posts={blogPosts} />
        </main>

        {/* SIDEBAR COLUMN: CONVERSION WIDGETS */}
        <aside className={styles.sidebarColumn}>
          <div className={styles.stickySidebar}>
            {/* WIDGET 1: GAUTENG SCHOOL PACK SEARCH */}
            <SchoolSearchWidget headingLevel="h3" />

            {/* WIDGET 2: 100% CORRECT PACK GUARANTEE */}
            <div className={styles.guaranteeCard}>
              <div className={styles.guaranteeHeader}>
                <svg className={styles.guaranteeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 11 11 13 15 9" />
                </svg>
                <h3 className={styles.guaranteeTitle}>Teacher-Approved Guarantee</h3>
              </div>
              <p className={styles.guaranteeText}>
                We strictly cross-reference official, teacher-submitted stationery lists. You receive the exact brand, size, and quantity requested by your school—100% guaranteed.
              </p>
            </div>

            {/* WIDGET 3: PEXCOVER BOOK COVERING PROMOTION */}
            <div className={styles.pexcoverPromoCard}>
              <span className={styles.promoEyebrow}>Time-Saving Add-on</span>
              <h3 className={styles.promoTitle}>Exercise Books Neatly Covered & Named</h3>
              <p className={styles.promoText}>
                Add Pexcover to your stationery pack. Our team will cover all exercise books in durable protective film and print clean name tags for your child.
              </p>
              <Link href="/blog/what-is-pexcover-book-covering" className={styles.promoLink}>
                Learn how Pexcover works
              </Link>
            </div>
          </div>
        </aside>
      </div>
      <CTASection
        eyebrow="Ready to simplify"
        title="Find your school pack"
        text="Search for your school or choose a standard grade pack. Pexpacks delivers the exact stationery your child needs."
        primaryHref="/schools"
        primaryLabel="Find Your School Pack"
        secondaryHref="/faq"
        secondaryLabel="Read FAQs"
      />

      <section className={styles.subscribeSection}>
        <div className={styles.subscribeInner}>
          <SubscribeForm />
        </div>
      </section>
    </>
  );
}
