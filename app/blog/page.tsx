import { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/data/blog";
import styles from "./Blog.module.css";

export const metadata: Metadata = {
  title: "Back to School Resource Hub | PexPacks",
  description: "Helpful guides, stationery checklists, and tips for parents preparing for the new school year.",
};

export default function BlogIndex() {
  return (
    <>
      <header className={styles.blogHeader}>
        <div className={styles.blogHeaderInner}>
          <h1>Back to School Resource Hub</h1>
          <p>Practical advice, stationery checklists, and survival guides to help parents prepare for the new school year without the stress.</p>
        </div>
      </header>
      
      <div className={styles.blogGrid}>
        {blogPosts.map((post) => (
          <Link href={`/blog/${post.slug}`} className={styles.blogCard} key={post.id}>
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
    </>
  );
}
