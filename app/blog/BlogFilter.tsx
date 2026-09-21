"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/data/blog";

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
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActive(cat.key)}
              aria-pressed={active === cat.key}
              className={cn(
                "inline-flex h-11 min-h-11 items-center justify-center whitespace-nowrap px-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-150 ease-in-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pex-keppel focus-visible:ring-offset-2 active:translate-y-0",
                active === cat.key
                  ? "bg-pex-navy !text-white border-pex-navy shadow-sm hover:bg-[#152238] hover:-translate-y-px"
                  : "border-slate-200 bg-white !text-pex-navy shadow-sm hover:border-pex-keppel hover:!text-pex-keppel hover:bg-pex-bg-soft hover:-translate-y-px"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((post) => {
          const fmt = getFormat(post);
          return (
            <Link
              href={`/blog/${post.slug}`}
              className="group flex flex-col bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-pex-keppel/30 transition-all"
              key={post.id}
            >
              <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-4 bg-slate-50">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-pex-keppel mb-1.5">{fmt.tag}</span>
              <h2 className="text-lg font-bold text-pex-navy font-heading m-0 mb-3 group-hover:text-pex-keppel transition-colors line-clamp-2">{post.title}</h2>
              <span className="mt-auto text-xs font-bold text-pex-keppel inline-flex items-center gap-1">
                {fmt.action} <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
