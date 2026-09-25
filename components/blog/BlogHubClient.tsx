"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  FileDown,
  FileSpreadsheet,
  RotateCcw,
  Search,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
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
    <div className="min-h-screen bg-slate-50">
      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-12 pb-16 lg:pt-16 lg:pb-20">
        {/* Subtle background glow effects */}
        <div className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-pex-keppel/20 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 -right-24 size-96 rounded-full bg-orange-500/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Heading, Subcopy & Search */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-pex-keppel text-xs sm:text-sm font-extrabold tracking-wide mb-5 shadow-sm">
                <Sparkles className="size-3.5 text-amber-400" />
                <span>Parent & Learner Hub</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight leading-[1.15] m-0">
                Stationery guides, rulings & printable checklists.
              </h1>

              <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
                Everything South African parents and learners need to navigate
                academic transitions, understand school rulings, and conquer
                back-to-school without the stress.
              </p>

              {/* Real-time search input */}
              <div className="mt-8 w-full max-w-xl">
                <div className="relative flex items-center">
                  <Search className="pointer-events-none absolute left-4 size-5 text-slate-400" />
                  <input
                    type="search"
                    aria-label="Search articles by title, subject, or keyword"
                    placeholder="Search by grade, subject, checklist or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-14 pl-12 pr-12 rounded-2xl bg-slate-800/90 border-2 border-slate-700 text-white placeholder:text-slate-400 text-sm sm:text-base font-semibold outline-none transition-all duration-200 focus:border-pex-keppel focus:bg-slate-800 focus:ring-4 focus:ring-pex-keppel/20 shadow-inner"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors"
                      aria-label="Clear search query"
                    >
                      <X className="size-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Right Column: Quick List Upload & School Pack Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-slate-800/80 border border-slate-700/80 p-6 sm:p-7 shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[11px] font-extrabold uppercase tracking-wider">
                    Fast-Track Packing
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-snug m-0">
                  Got your 2027 Stationery List?
                </h3>

                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  Skip mall lines and generic substitutes. Upload your
                  school&apos;s PDF list, or search your school to get the exact,
                  teacher-verified pack delivered directly to you.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/upload-a-list"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-heading font-extrabold text-sm no-underline shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition-all active:scale-[0.98]"
                  >
                    <Upload className="size-4" />
                    <span>Upload a List</span>
                  </Link>

                  <Link
                    href="/schools"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-white border border-slate-600 font-heading font-extrabold text-sm no-underline transition-all active:scale-[0.98]"
                  >
                    <Search className="size-4 text-pex-keppel" />
                    <span>Find My School</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STICKY CATEGORY FILTER BAR ── */}
      <nav
        aria-label="Article categories"
        className="sticky top-16 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5">
              {BLOG_CATEGORIES.map((category) => {
                const isActive = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer select-none ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                    }`}
                  >
                    {category === "Free Printables" ? (
                      <FileDown className="size-3.5 text-amber-500" />
                    ) : null}
                    <span>{category}</span>
                  </button>
                );
              })}
            </div>

            <span className="hidden sm:inline-block shrink-0 text-xs font-semibold text-slate-500 whitespace-nowrap">
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
                className="group flex flex-col rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden"
              >
                {/* Article Header Image */}
                <Link
                  href={`/blog/${article.slug}`}
                  className="relative block aspect-[16/9] w-full overflow-hidden bg-slate-100"
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
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/95 text-white text-[11px] font-extrabold uppercase tracking-wide shadow-md backdrop-blur-xs">
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
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-extrabold uppercase tracking-wider">
                        {article.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-500 text-xs font-semibold">
                        <Clock className="size-3.5" />
                        <span>{article.readTime}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-extrabold font-heading text-slate-900 group-hover:text-pex-keppel transition-colors leading-snug m-0">
                      <Link
                        href={`/blog/${article.slug}`}
                        className="text-inherit no-underline"
                      >
                        {article.title}
                      </Link>
                    </h2>

                    {/* Excerpt */}
                    <p className="mt-3 text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {article.description}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
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
                      className="inline-flex items-center gap-1.5 text-sm font-extrabold text-orange-600 hover:text-orange-700 group-hover:translate-x-0.5 transition-all no-underline"
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
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center max-w-xl mx-auto my-8">
            <div className="mx-auto size-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-4">
              <Search className="size-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 m-0">
              No matching guides found
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              We couldn&apos;t find any articles matching &ldquo;
              {searchQuery || selectedCategory}&rdquo;. Try another search term
              or clear your filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}

        {resourcesNode ? (
          <div className="mt-14 pt-10 border-t border-slate-200">
            {resourcesNode}
          </div>
        ) : null}
      </main>

      {/* ── CONVERSION BANNER ── */}
      <section className="bg-slate-900 text-white py-14 lg:py-16 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-teal-900/40 via-slate-800 to-orange-950/30 border border-slate-700/80 p-8 sm:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <span className="text-xs font-extrabold uppercase tracking-wider text-orange-400">
                Official School Stationery Packs
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold font-heading text-white leading-tight">
                Order your child&apos;s verified stationery list today.
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                We work directly with primary and high schools across South
                Africa. Get every required ruling, brand, and exercise book
                packed neatly with optional pre-covering.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 shrink-0 w-full md:w-auto">
              <Link
                href="/schools"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-pex-keppel hover:bg-teal-600 text-white font-heading font-extrabold text-sm no-underline shadow-md shadow-teal-900/30 transition-all active:scale-[0.98]"
              >
                <Search className="size-4" />
                <span>Find Your School</span>
              </Link>
              <Link
                href="/upload-a-list"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-heading font-extrabold text-sm no-underline transition-all active:scale-[0.98]"
              >
                <Upload className="size-4" />
                <span>Upload a List</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
