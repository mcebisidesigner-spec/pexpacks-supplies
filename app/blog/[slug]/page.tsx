import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileDown,
  Info,
  Layers,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Tag,
  Upload,
} from "lucide-react";
import {
  getAllBlogArticles,
  getBlogArticleBySlug,
  getRelatedBlogArticles,
} from "@/lib/blog-data";
import { PrintableChecklistCard } from "@/components/blog/PrintableChecklistCard";
import { JsonLd } from "@/components/ui/JsonLd";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import { buildMetadata, siteUrl } from "@/lib/seo";

export const revalidate = 300;

export async function generateStaticParams() {
  const articles = getAllBlogArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getBlogArticleBySlug(slug);

  if (!article) {
    return buildMetadata("Article Not Found | Pexpacks", "", "/blog");
  }

  const metadata = buildMetadata(
    `${article.title} | Pexpacks Resources`,
    article.description,
    `/blog/${article.slug}`,
    article.image,
  );

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: article.date,
      authors: [article.author.name],
    },
    alternates: {
      canonical: `${siteUrl}/blog/${article.slug}`,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getBlogArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = getRelatedBlogArticles(article.slug, 3);

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Resources", path: "/blog" },
    { name: article.title, path: `/blog/${article.slug}` },
  ];

  const structuredArticle = {
    title: article.title,
    excerpt: article.description,
    image: article.image,
    date: article.date,
    author: article.author.name,
    slug: article.slug,
  };

  return (
    <>
      <JsonLd data={articleSchema(structuredArticle)} />
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />

      <div className="min-h-screen bg-slate-50 print:bg-white">
        {/* ── BREADCRUMBS ── */}
        <nav
          aria-label="Breadcrumbs"
          className="border-b border-slate-200/80 bg-white print:hidden"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5">
            <ol className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden m-0 p-0 list-none">
              <li>
                <Link
                  href="/"
                  className="hover:text-slate-900 transition-colors no-underline font-medium text-slate-500"
                >
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="size-3.5 text-slate-400 shrink-0" />
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-slate-900 transition-colors no-underline font-medium text-slate-500"
                >
                  Resources
                </Link>
              </li>
              <li>
                <ChevronRight className="size-3.5 text-slate-400 shrink-0" />
              </li>
              <li
                className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs md:max-w-md"
                aria-current="page"
              >
                {article.title}
              </li>
            </ol>
          </div>
        </nav>

        {/* ── ARTICLE HEADER ── */}
        <header className="bg-slate-900 text-white pt-10 pb-14 sm:pt-14 sm:pb-16 print:bg-white print:text-black print:p-0 print:border-b-2 print:border-black">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4 print:hidden">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-pex-keppel text-xs font-extrabold uppercase tracking-wide">
                  <BookOpen className="size-3.5" />
                  <span>{article.category}</span>
                </span>

                <span className="inline-block px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">
                  {article.phase}
                </span>

                {article.hasPrintable ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-extrabold uppercase tracking-wide">
                    <FileDown className="size-3.5" />
                    <span>Printable Checklist</span>
                  </span>
                ) : null}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight leading-[1.18] m-0 print:text-black print:text-2xl">
                {article.title}
              </h1>

              {/* Description */}
              <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal print:text-slate-800 print:text-sm">
                {article.description}
              </p>

              {/* Metadata Bar */}
              <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-slate-300 print:border-slate-300 print:text-black print:mt-4 print:pt-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center font-heading font-extrabold text-white text-sm shrink-0 print:border-black">
                    {article.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <strong className="block font-bold text-white print:text-black">
                      {article.author.name}
                    </strong>
                    <span className="block text-xs text-slate-400 print:text-slate-600">
                      {article.author.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 font-medium print:text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-4 text-slate-400" />
                    <span>
                      {new Date(article.date).toLocaleDateString("en-ZA", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-4 text-slate-400" />
                    <span>{article.readTime}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── MAIN ARTICLE & SIDEBAR LAYOUT ── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* ── LEFT COLUMN (PROSE + CHECKLIST) ── */}
            <article className="lg:col-span-8 min-w-0">
              {/* Featured Image */}
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-slate-200 shadow-md mb-10 bg-slate-100 print:hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 750px"
                  className="object-cover"
                />
              </div>

              {/* Prose Content Container */}
              <div className="prose prose-slate max-w-none prose-headings:font-heading prose-headings:font-extrabold prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-orange-600 prose-a:font-bold prose-strong:text-slate-900">
                {/* Intro Paragraphs */}
                {article.content.intro.map((p, i) => (
                  <p
                    key={i}
                    className={
                      i === 0
                        ? "text-base sm:text-lg leading-relaxed text-slate-800 font-medium"
                        : "text-base leading-relaxed text-slate-700"
                    }
                  >
                    {p}
                  </p>
                ))}

                {/* Structured Sections */}
                {article.content.sections.map((section, idx) => (
                  <section key={section.heading} className="my-8">
                    <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 mt-8 mb-2">
                      {section.heading}
                    </h2>

                    {section.subheading ? (
                      <p className="text-sm font-bold text-pex-keppel uppercase tracking-wide mb-4">
                        {section.subheading}
                      </p>
                    ) : null}

                    {section.body.map((bodyPara, pIdx) => (
                      <p
                        key={pIdx}
                        className="text-base leading-relaxed text-slate-700 my-4"
                      >
                        {bodyPara}
                      </p>
                    ))}

                    {/* Section Callout (if present) */}
                    {section.callout ? (
                      <div
                        className={`my-6 rounded-2xl p-5 border-l-4 ${
                          section.callout.type === "warning"
                            ? "border-amber-500 bg-amber-50/80 text-amber-950"
                            : section.callout.type === "tip"
                              ? "border-teal-500 bg-teal-50/80 text-teal-950"
                              : "border-blue-500 bg-blue-50/80 text-blue-950"
                        }`}
                      >
                        <strong className="block text-sm font-extrabold mb-1">
                          {section.callout.title}
                        </strong>
                        <p className="text-xs sm:text-sm m-0 leading-relaxed font-medium">
                          {section.callout.text}
                        </p>
                      </div>
                    ) : null}
                  </section>
                ))}

                {/* ── EMBEDDED CHECKLIST (If available) ── */}
                {article.printableChecklist ? (
                  <PrintableChecklistCard
                    checklist={article.printableChecklist}
                  />
                ) : null}

                {/* Conclusion */}
                <div className="my-10 rounded-3xl bg-slate-100/90 border border-slate-200/90 p-6 sm:p-8">
                  <h3 className="text-lg sm:text-xl font-extrabold font-heading text-slate-900 mb-3 m-0">
                    Final Takeaway for Parents
                  </h3>
                  {article.content.conclusion.map((c, i) => (
                    <p
                      key={i}
                      className="text-sm sm:text-base leading-relaxed text-slate-700 my-2.5"
                    >
                      {c}
                    </p>
                  ))}
                </div>

                {/* Tags */}
                {article.tags.length > 0 ? (
                  <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center gap-2 print:hidden not-prose">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mr-1 inline-flex items-center gap-1">
                      <Tag className="size-3.5" />
                      <span>Tags:</span>
                    </span>
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>

            {/* ── RIGHT COLUMN (STICKY SIDEBAR) ── */}
            <aside className="lg:col-span-4 print:hidden">
              <div className="lg:sticky lg:top-24 space-y-6">
                {/* WIDGET 1: Skip the Mall Lines (Order Pack CTA) */}
                <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-7 shadow-lg border border-slate-800">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-[11px] font-extrabold uppercase tracking-wide mb-3">
                    <Sparkles className="size-3.5" />
                    <span>Fast & Stress-Free</span>
                  </div>

                  <h3 className="text-xl font-extrabold font-heading text-white m-0 leading-snug">
                    Skip the Mall Lines
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Order your child&apos;s verified school stationery pack in a few
                    clicks. Exact brands, required rulings, and delivery straight
                    to your door before Term 1 starts.
                  </p>

                  <div className="mt-6 space-y-2.5">
                    <Link
                      href="/schools"
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-pex-keppel hover:bg-teal-600 text-white font-heading font-extrabold text-sm no-underline shadow-md shadow-teal-900/30 transition-all active:scale-[0.98]"
                    >
                      <Search className="size-4" />
                      <span>Find My School Pack</span>
                    </Link>

                    <Link
                      href="/upload-a-list"
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-heading font-extrabold text-sm no-underline transition-all active:scale-[0.98]"
                    >
                      <Upload className="size-4 text-orange-400" />
                      <span>Upload Custom List</span>
                    </Link>
                  </div>
                </div>

                {/* WIDGET 2: Pexcover Book Covering Banner */}
                <div className="rounded-3xl bg-gradient-to-br from-teal-900/90 to-slate-900 text-white p-6 sm:p-7 shadow-sm border border-teal-800/40">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-extrabold uppercase tracking-wider mb-2">
                    <ShieldCheck className="size-4 text-amber-400" />
                    <span>Pexcover Protection</span>
                  </div>

                  <h4 className="text-lg font-extrabold text-white m-0 leading-tight">
                    Exercise Books Neatly Covered & Named
                  </h4>

                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                    Add Pexcover to any stationery pack. All exercise books
                    arrive wrapped in heavy-duty 80-micron clear protective film
                    with custom learner & subject labels.
                  </p>

                  <Link
                    href="/schools"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-orange-400 hover:text-orange-300 transition-colors no-underline"
                  >
                    <span>Browse school packs with Pexcover</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>

                {/* WIDGET 3: Related Resources List */}
                {relatedArticles.length > 0 ? (
                  <div className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-sm">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-4 m-0">
                      Related Resources
                    </h4>

                    <div className="space-y-4">
                      {relatedArticles.map((rel) => (
                        <Link
                          key={rel.id}
                          href={`/blog/${rel.slug}`}
                          className="group block no-underline border-b border-slate-100 last:border-b-0 pb-3 last:pb-0"
                        >
                          <span className="block text-[11px] font-extrabold text-pex-keppel uppercase tracking-wide mb-1">
                            {rel.category}
                          </span>
                          <strong className="block text-xs sm:text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors leading-snug">
                            {rel.title}
                          </strong>
                          <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                            <Clock className="size-3" />
                            <span>{rel.readTime}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </div>

        {/* ── BOTTOM MORE RESOURCES SECTION ── */}
        <section className="bg-white border-t border-slate-200 py-12 sm:py-16 print:hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 m-0">
                  More From the Resource Hub
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 m-0">
                  Helpful guides and printables to empower learners all year long.
                </p>
              </div>

              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-orange-600 hover:text-orange-700 transition-colors no-underline"
              >
                <span>View All Resources</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((item) => (
                <Link
                  key={item.id}
                  href={`/blog/${item.slug}`}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-md transition-all no-underline"
                >
                  <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-100 mb-4">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <span className="text-[11px] font-extrabold text-pex-keppel uppercase tracking-wider mb-1">
                    {item.category}
                  </span>

                  <strong className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors leading-snug line-clamp-2">
                    {item.title}
                  </strong>

                  <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
