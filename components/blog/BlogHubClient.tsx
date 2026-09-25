"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Clock,
  FileDown,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { PageHero } from "@/components/marketing/PageHero";
import { Button } from "@/components/ui/Button";
import {
  BLOG_CATEGORIES,
  type BlogArticle,
  type BlogCategoryFilter,
} from "@/lib/blog-data";

type BlogHubClientProps = {
  articles: BlogArticle[];
  resourcesNode?: React.ReactNode;
};

export function BlogHubClient({ articles, resourcesNode }: BlogHubClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<BlogCategoryFilter>("All Resources");

  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return articles.filter((article) => {
      // Category check
      const matchesCategory =
        selectedCategory === "All Resources" ||
        (selectedCategory === "Free Printables"
          ? article.hasPrintable
          : article.category === selectedCategory);

      if (!matchesCategory) return false;

      // Search query check
      if (!q) return true;

      const titleMatch = article.title.toLowerCase().includes(q);
      const descMatch = article.description.toLowerCase().includes(q);
      const phaseMatch = article.phase.toLowerCase().includes(q);
      const tagsMatch = article.tags.some((t) => t.toLowerCase().includes(q));

      return titleMatch || descMatch || phaseMatch || tagsMatch;
    });
  }, [articles, searchQuery, selectedCategory]);

  function resetFilters() {
    setSearchQuery("");
    setSelectedCategory("All Resources");
  }

  return (
    <div className="min-h-screen bg-pex-body-bg">
      {/* ── HERO SECTION (MATCHES APP PAGEHERO EXACT DESIGN SPECIFICATION) ── */}
      <PageHero
        eyebrow="Parent & Learner Hub"
        title="School stationery guides +"
        text="Clear ruling breakdowns, teacher-verified stationery checklists, and practical guidance to help South African parents prepare for the school year without the January rush."
        panelChildren={
          <div className="flex flex-col justify-between h-full">
            <div>
              <p className="m-0 mb-2 text-slate-600 text-sm font-semibold leading-relaxed">
                Official rulings, transition checklists & Pexcover guides
              </p>
              <strong className="block text-pex-navy text-2xl sm:text-3xl font-semibold leading-tight tracking-tight mb-4">
                What parents get
              </strong>
            </div>

            <div className="relative flex items-center mt-1">
              <Search className="pointer-events-none absolute left-3.5 size-4 text-pex-muted" />
              <input
                type="search"
                aria-label="Search articles by title, subject, or keyword"
                placeholder="Search by grade, subject, checklist or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-9 rounded-xl bg-pex-bg-soft border border-pex-border text-pex-navy placeholder:text-pex-muted text-sm font-medium outline-none transition-all duration-150 focus:border-pex-keppel focus:bg-white focus:ring-2 focus:ring-pex-keppel/20"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 p-1 rounded-full text-pex-muted hover:text-pex-navy transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
          </div>
        }
      >
        <div className="flex flex-col sm:flex-row gap-3 mt-5 items-stretch sm:items-center">
          <Button
            href="/upload-a-list"
            variant="primary"
            className="w-full sm:w-auto min-h-[44px]"
          >
            Upload a List
          </Button>
          <Button
            href="/schools"
            variant="white"
            className="w-full sm:w-auto min-h-[44px]"
          >
            Find My School
          </Button>
        </div>
      </PageHero>

      {/* ── STICKY CATEGORY FILTER BAR (MATCHES REFERENCE IMAGE BUTTONS UI) ── */}
      <nav
        aria-label="Article categories"
        className="sticky top-16 z-20 bg-white/95 backdrop-blur-md border-b border-pex-border shadow-xs"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1">
              {BLOG_CATEGORIES.map((category) => {
                const isActive = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-150 cursor-pointer select-none ${
                      isActive
                        ? "bg-pex-navy text-white shadow-sm border border-pex-navy"
                        : "bg-white text-slate-800 border border-slate-200/90 shadow-2xs hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <span>{category}</span>
                  </button>
                );
              })}
            </div>

            <span className="hidden sm:inline-block shrink-0 text-xs font-semibold text-pex-muted whitespace-nowrap">
              {filteredArticles.length === 1
                ? "1 guide"
                : `${filteredArticles.length} guides`}
            </span>
          </div>
        </div>
      </nav>

      {/* ── ARTICLE GRID SECTION ── */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                className="group flex flex-col rounded-card bg-white border border-pex-border shadow-card hover:shadow-card-hover hover:border-pex-keppel/50 transition-all duration-300 overflow-hidden"
              >
                {/* Article Header Image */}
                <Link
                  href={`/blog/${article.slug}`}
                  className="relative block aspect-[16/9] w-full overflow-hidden bg-pex-bg-soft"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Printable Badge Tag */}
                  {article.hasPrintable ? (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pex-coral text-white text-[11px] font-extrabold uppercase tracking-wide shadow-md">
                      <FileDown className="size-3" />
                      <span>Printable</span>
                    </span>
                  ) : null}
                </Link>

                {/* Article Body */}
                <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between">
                  <div>
                    {/* Category & Read Time */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-pex-bg-soft text-pex-navy text-xs font-extrabold uppercase tracking-wider">
                        {article.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-pex-muted text-xs font-semibold">
                        <Clock className="size-3.5" />
                        <span>{article.readTime}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-extrabold font-heading text-pex-navy group-hover:text-pex-keppel transition-colors leading-snug m-0">
                      <Link
                        href={`/blog/${article.slug}`}
                        className="text-inherit no-underline"
                      >
                        {article.title}
                      </Link>
                    </h2>

                    {/* Excerpt */}
                    <p className="mt-3 text-sm text-pex-muted line-clamp-3 leading-relaxed">
                      {article.description}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-6 pt-5 border-t border-pex-border flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-pex-muted">
                      <Calendar className="size-3.5" />
                      <span>
                        {new Date(article.date).toLocaleDateString("en-ZA", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </span>

                    <Link
                      href={`/blog/${article.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-extrabold text-pex-coral hover:text-pex-coral-hover group-hover:translate-x-0.5 transition-all no-underline"
                    >
                      <span>
                        {article.hasPrintable ? "Read & Print" : "Read Guide"}
                      </span>
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* Empty State Fallback */
          <div className="rounded-card border-2 border-dashed border-pex-border bg-white p-12 text-center max-w-xl mx-auto my-8">
            <div className="mx-auto size-14 rounded-2xl bg-pex-bg-soft text-pex-navy flex items-center justify-center mb-4">
              <Search className="size-6 text-pex-keppel" />
            </div>
            <h3 className="text-lg font-extrabold text-pex-navy m-0">
              No matching guides found
            </h3>
            <p className="mt-2 text-sm text-pex-muted">
              We couldn&apos;t find any articles matching &ldquo;
              {searchQuery || selectedCategory}&rdquo;. Try another search term
              or clear your filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pex-navy text-white font-bold text-xs uppercase tracking-wider hover:bg-pex-navy/90 transition-colors cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}

        {resourcesNode ? (
          <div className="mt-14 pt-10 border-t border-pex-border">
            {resourcesNode}
          </div>
        ) : null}
      </main>

      {/* ── CONVERSION BANNER (APP BRAND SPECIFICATION) ── */}
      <section className="bg-pex-navy text-white py-14 lg:py-16 border-t border-pex-navy">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-card bg-white/5 border border-white/10 p-8 sm:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <span className="text-xs font-extrabold uppercase tracking-wider text-pex-coral">
                Official School Stationery Packs
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold font-heading text-white leading-tight">
                Order your child&apos;s verified stationery list today.
              </h2>
              <p className="mt-3 text-sm sm:text-base text-white/80 leading-relaxed">
                We work directly with primary and high schools across South
                Africa. Get every required ruling, brand, and exercise book
                packed neatly with optional pre-covering.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 shrink-0 w-full md:w-auto">
              <Button
                href="/schools"
                variant="primary"
                className="w-full sm:w-auto min-h-[44px]"
              >
                Find Your School
              </Button>
              <Button
                href="/upload-a-list"
                variant="white"
                className="w-full sm:w-auto min-h-[44px]"
              >
                Upload a List
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
