"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/data/blog";
import styles from "./Blog.module.css";

const CATEGORIES = [
  { label: "All Resources", key: "all" },
  { label: "Free Printables", key: "free-printables" },
  { label: "Parent Guides", key: "parent-guides" },
  { label: "Study Hacks", key: "study-hacks" },
];

const CATEGORY_MAP: Record<string, string[]> = {
  "free-printables": ["Guides", "Education"],
  "parent-guides": ["Parenting Tips"],
  "study-hacks": ["Education"],
};

const FORMAT_MAP: Record<string, { tag: string; action: string }> = {
  "Parenting Tips": { tag: "Parent Guide", action: "Read Guide" },
  "Guides": { tag: "Guide", action: "Read Guide" },
  "Education": { tag: "Article", action: "Read Article" },
  "Services": { tag: "Guide", action: "Read Guide" },
};

function getFormat(post: BlogPost) {
  return FORMAT_MAP[post.category] || { tag: "Article", action: "Read Article" };
}

export function BlogFilter({ posts }: { posts: BlogPost[] }) {
  const [active, setActive] = useState("all");

  const filtered =
    active === "all"
      ? posts
      : posts.filter((p) => CATEGORY_MAP[active]?.includes(p.category));

  return (
    <>
      <div className={styles.filterRow}>
        <div className={styles.filterTrack}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActive(cat.key)}
              className={`${styles.filterPill} ${active === cat.key ? styles.activePill : ""}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.articlesGrid}>
        {filtered.map((post) => {
          const fmt = getFormat(post);
          return (
            <Link
              href={`/blog/${post.slug}`}
              className={styles.blogCard}
              key={post.id}
            >
              <div className={styles.cardImage}>
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                  className={styles.cardImageEl}
                />
              </div>
              <span className={styles.cardTag}>{fmt.tag}</span>
              <h2 className={styles.blogTitle}>{post.title}</h2>
              <span className={styles.cardAction}>
                {fmt.action} <span className={styles.actionArrow}>&rarr;</span>
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
