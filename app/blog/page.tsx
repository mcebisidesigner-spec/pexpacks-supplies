import { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/PageHero";
import { blogPosts } from "@/data/blog";
import styles from "./Blog.module.css";

export const metadata: Metadata = {
  title: "Back to School Resource Hub | Pexpacks",
  description:
    "Helpful guides, stationery checklists, and tips for parents preparing for the new school year.",
};

import { SchoolSearchWidget } from "@/components/marketing/SchoolSearchWidget";

export default function BlogIndex() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Back to school hub"
        text="Practical advice, stationery checklists, and survival guides to help parents prepare for the new school year without the stress."
      />

      <div className={styles.blogContainer}>
        {/* PRIMARY COLUMN: ARTICLES */}
        <main className={styles.articlesColumn} aria-label="Resource articles">
          <div className={styles.articlesGrid}>
            {blogPosts.map((post) => (
              <Link
                href={`/blog/${post.slug}`}
                className={styles.blogCard}
                key={post.id}
              >
                <span className={styles.blogCategory}>{post.category}</span>
                <h2 className={styles.blogTitle}>{post.title}</h2>
                <p className={styles.blogExcerpt}>{post.excerpt}</p>
                <div className={styles.blogMeta}>
                  <span>{post.author}</span>
                  <span>•</span>
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("en-ZA", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>
                <span className={styles.readMore}>Read more</span>
              </Link>
            ))}
          </div>
        </main>

        {/* SIDEBAR COLUMN: CONVERSION WIDGETS */}
        <aside className={styles.sidebarColumn}>
          <div className={styles.stickySidebar}>
            {/* WIDGET 1: GAUTENG SCHOOL PACK SEARCH */}
            <SchoolSearchWidget />

            {/* WIDGET 2: 100% CORRECT PACK GUARANTEE */}
            <div className={styles.guaranteeCard}>
              <div className={styles.guaranteeHeader}>
                <svg className={styles.guaranteeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 11 11 13 15 9" />
                </svg>
                <h4 className={styles.guaranteeTitle}>Teacher-Approved Guarantee</h4>
              </div>
              <p className={styles.guaranteeText}>
                We strictly cross-reference official, teacher-submitted stationery lists. You receive the exact brand, size, and quantity requested by your school—100% guaranteed.
              </p>
            </div>

            {/* WIDGET 3: PEXCOVER BOOK COVERING PROMOTION */}
            <div className={styles.pexcoverPromoCard}>
              <span className={styles.promoEyebrow}>Time-Saving Add-on</span>
              <h4 className={styles.promoTitle}>Exercise Books Neatly Covered & Named</h4>
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
    </>
  );
}
