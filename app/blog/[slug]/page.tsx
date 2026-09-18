import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { CTASection } from "@/components/marketing/CTASection";
import { PageHero } from "@/components/marketing/PageHero";
import { SchoolSearchWidget } from "@/components/marketing/SchoolSearchWidget";
import { listBlogPosts, getBlogPost } from "@/lib/blog";
import { buildMetadata, siteUrl } from "@/lib/seo";
import { IMAGE_BLUR_DATA_URL } from "@/lib/constants";
import { articleSchema } from "@/lib/schema";

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await listBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getBlogPost(resolvedParams.slug);

  if (!post) {
    return buildMetadata("Post Not Found | Pexpacks", "", "/blog");
  }

  const metadata = buildMetadata(
    `${post.title} | Pexpacks Resource Hub`,
    post.excerpt,
    `/blog/${post.slug}`,
    post.image
  );

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
    alternates: {
      canonical: `${siteUrl}/blog/${post.slug}`,
    },
  };
}

/* ── Helpers ── */

type ParsedImage = { alt: string; src: string };

function parseImage(line: string): ParsedImage | null {
  const match = line.match(/^!\[(.*?)\]\((.*?)\)$/);
  return match ? { alt: match[1], src: match[2] } : null;
}

function parseLinkPills(
  text: string
): { text: string; href: string }[] {
  const pills: { text: string; href: string }[] = [];
  const regex = /\[link_pill:\s*(.*?)\s*\|\s*(.*?)\s*\]/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    pills.push({ text: match[1], href: match[2] });
  }
  return pills;
}

function renderInlineContent(text: string): ReactNode {
  const parts: ReactNode[] = [];
  const strongPattern = /<strong>\s*([\s\S]*?)\s*<\/strong>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = strongPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(<strong key={`strong-${match.index}`}>{match[1]}</strong>);
    lastIndex = strongPattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

function extractHeadings(
  content: string[]
): { id: string; title: string }[] {
  return content
    .filter((line) => line.startsWith("## "))
    .map((line) => {
      const title = line.replace("## ", "");
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      return { id, title };
    });
}

function renderContent(content: string[]): ReactNode[] {
  const elements: ReactNode[] = [];
  let listBuffer: {
    items: string[];
    ordered: boolean;
  } | null = null;

  function flushList() {
    if (!listBuffer) return;
    const ListTag = listBuffer.ordered ? "ol" : "ul";
    const cls = listBuffer.ordered
      ? "list-decimal pl-5 sm:pl-6 my-5 grid gap-2 text-slate-700 text-[16px] sm:text-[17px] leading-relaxed"
      : "list-disc pl-5 sm:pl-6 my-5 grid gap-2 text-slate-700 text-[16px] sm:text-[17px] leading-relaxed";
    elements.push(
      <ListTag key={`list-${elements.length}`} className={cls}>
        {listBuffer.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ListTag>
    );
    listBuffer = null;
  }

  for (let i = 0; i < content.length; i++) {
    const line = content[i];

    /* ── Image ── */
    const img = parseImage(line);
    if (img) {
      flushList();
      const next = i + 1 < content.length ? content[i + 1] : "";
      const isCaption =
        next &&
        !parseImage(next) &&
        !next.startsWith("## ") &&
        !next.startsWith("> ") &&
        !next.startsWith("[link_pill:") &&
        !next.trim().match(/^[-*\d]/);
      if (isCaption) i++;

      elements.push(
        <figure key={`img-${i}`} className="my-6">
          <Image
            src={img.src}
            alt={img.alt}
            width={800}
            height={450}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 800px, 800px"
            className="w-full h-auto object-cover block rounded-2xl border border-black/5"
            placeholder="blur"
            blurDataURL={IMAGE_BLUR_DATA_URL}
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "16px",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          />
          {isCaption ? (
            <figcaption className="mt-2.5 text-sm text-slate-500 leading-normal text-center">
              {content[i]}
            </figcaption>
          ) : null}
        </figure>
      );
      continue;
    }

    /* ── Heading ── */
    if (line.startsWith("## ")) {
      flushList();
      const title = line.replace("## ", "");
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      elements.push(
        <h2 key={`h2-${i}`} id={id} className="mt-8 sm:mt-10 mb-4 text-xl sm:text-2xl font-extrabold text-[#1a2a40] leading-snug first:mt-0">
          {title}
        </h2>
      );
      continue;
    }

    /* ── Blockquote ── */
    if (line.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote key={`bq-${i}`} className="my-5 py-4 px-5 border-l-4 border-teal-600 bg-slate-50 rounded-r-xl text-[#1a2a40] text-base sm:text-lg font-semibold leading-relaxed">
          {line.replace("> ", "")}
        </blockquote>
      );
      continue;
    }

    /* ── List items ── */
    const bulletMatch = line.match(/^[-*]\s+(.+)/);
    const numMatch = line.match(/^\d+[.)]\s+(.+)/);
    const listItem = bulletMatch
      ? { ordered: false, text: bulletMatch[1] }
      : numMatch
        ? { ordered: true, text: numMatch[1] }
        : null;

    if (listItem) {
      if (!listBuffer) {
        listBuffer = { items: [], ordered: listItem.ordered };
      }
      listBuffer.items.push(listItem.text);
      continue;
    }
    if (listBuffer && line.trim() === "") {
      continue;
    }
    flushList();

    /* ── Paragraph (with optional inline link pills) ── */
    const pills = parseLinkPills(line);
    if (pills.length > 0) {
      const cleaned = line
        .replace(/\[link_pill:\s*.*?\s*\|\s*.*?\s*\]/g, "")
        .trim();
      if (cleaned) {
        elements.push(<p key={`p-${i}`} className="mb-5 last:mb-0">{renderInlineContent(cleaned)}</p>);
      }
      elements.push(
        <div key={`pills-${i}`} className="flex flex-wrap gap-3 my-5">
          {pills.map((pill, pi) => (
            <Link key={pi} href={pill.href} className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-white border border-teal-600 text-teal-700 font-extrabold text-sm no-underline hover:bg-teal-600 hover:text-white hover:-translate-y-0.5 hover:shadow-md transition-all">
              {pill.text}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          ))}
        </div>
      );
      continue;
    }

    elements.push(<p key={`p-${i}`} className="mb-5 last:mb-0">{renderInlineContent(line)}</p>);
  }

  flushList();

  return elements;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const post = await getBlogPost(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const publishedDate = new Date(post.date).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const headings = extractHeadings(post.content);
  const relatedPosts = (await listBlogPosts())
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  return (
    <>
      <JsonLd data={articleSchema(post)} />
      <PageHero
        eyebrow={post.category}
        title={post.title}
        panelText={`By ${post.author}`}
        panelTitle={publishedDate}
      >
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-teal-600 font-extrabold text-sm sm:text-base no-underline mt-4 hover:opacity-80 transition-opacity">
          <ArrowLeft className="w-4 h-4" />
          Back to Resource Hub
        </Link>
      </PageHero>

      <section className="bg-gradient-to-b from-slate-50 to-white">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)] gap-6 lg:gap-8 items-start max-w-7xl mx-auto py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
          {/* ── Sidebar ── */}
          <aside className="lg:sticky lg:top-[calc(72px+16px)] self-start z-20">
            <nav className="border border-slate-200/90 rounded-[24px] p-5 bg-white/80 backdrop-blur-md shadow-sm" aria-label="Article sections">
              {headings.length > 0 ? (
                <>
                  <p className="m-0 text-teal-600 text-xs font-extrabold uppercase tracking-wider">Jump to</p>
                  <h2 className="mt-1.5 mb-4 text-[#1a2a40] text-xl font-bold leading-tight">Contents</h2>
                  <ol className="grid gap-1 m-0 p-0 list-none">
                    {headings.map((h) => (
                      <li key={h.id}>
                        <a href={`#${h.id}`} className="block rounded-md px-2.5 py-2 text-slate-700 text-xs font-bold leading-snug no-underline hover:bg-slate-100 hover:text-teal-600 hover:translate-x-0.5 transition-all">
                          {h.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                  <hr className="my-4 border-0 h-px bg-slate-200" />
                </>
              ) : null}

              <div className="grid gap-2.5">
                <div className="grid gap-0.5">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Published</span>
                  <span className="text-sm font-semibold text-[#1a2a40] leading-snug">{publishedDate}</span>
                </div>
                <div className="grid gap-0.5">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Author</span>
                  <span className="text-sm font-semibold text-[#1a2a40] leading-snug">{post.author}</span>
                </div>
                <div className="grid gap-0.5">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Category</span>
                  <span className="text-sm font-semibold text-[#1a2a40] leading-snug">{post.category}</span>
                </div>
              </div>

              <Link href="/schools" className="block mt-5 py-3 px-4 rounded-full bg-[#1a2a40] text-white font-extrabold text-sm text-center no-underline hover:bg-teal-600 hover:-translate-y-0.5 transition-all" data-conversion-event="article_find_school_pack">
                Find Your School Pack
              </Link>
            </nav>
          </aside>

          {/* ── Main content ── */}
          <div className="grid gap-5 min-w-0">
            {post.image ? (
              <div className="rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-sm border border-slate-200/90">
                <Image
                  src={post.image}
                  alt={post.title}
                  width={800}
                  height={450}
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="w-full h-auto object-cover block"
                  placeholder="blur"
                  blurDataURL={IMAGE_BLUR_DATA_URL}
                  priority
                />
              </div>
            ) : null}

            <article className="relative border border-slate-200/90 rounded-[24px] sm:rounded-[28px] bg-white/95 shadow-sm overflow-hidden">
              <div className="p-5 sm:p-7 text-slate-700 text-[16px] sm:text-[17px] leading-relaxed">
                {renderContent(post.content)}
              </div>
            </article>

            <aside
              className="border border-teal-600/25 rounded-[24px] sm:rounded-[28px] p-5 sm:p-7 bg-gradient-to-br from-teal-600/[0.06] to-white/90 shadow-sm"
              aria-label="Explore more resources"
            >
              <p className="m-0 text-teal-600 text-xs font-extrabold uppercase tracking-wider">Keep digging</p>
              <h2 className="mt-1.5 mb-2.5 text-[#1a2a40] text-xl sm:text-2xl font-bold leading-tight">
                Dive deeper into related topics
              </h2>
              <p className="m-0 mb-5 text-slate-600 text-sm sm:text-[15px] leading-relaxed max-w-[660px]">
                Discover helpful resources to make your back-to-school
                experience smoother.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                <Link href="/schools" className="flex items-center gap-2 p-3 sm:px-4 rounded-xl bg-white border border-slate-200 shadow-xs text-xs font-bold text-[#1a2a40] no-underline hover:border-teal-600 hover:text-teal-600 hover:-translate-y-0.5 transition-all" data-conversion-event="article_browse_school_packs">
                  Browse school packs
                </Link>
                <Link href="/happy-pay" className="flex items-center gap-2 p-3 sm:px-4 rounded-xl bg-white border border-slate-200 shadow-xs text-xs font-bold text-[#1a2a40] no-underline hover:border-teal-600 hover:text-teal-600 hover:-translate-y-0.5 transition-all">
                  Split in 2 with Happy Pay
                </Link>
                <Link href="/add-your-school" className="flex items-center gap-2 p-3 sm:px-4 rounded-xl bg-white border border-slate-200 shadow-xs text-xs font-bold text-[#1a2a40] no-underline hover:border-teal-600 hover:text-teal-600 hover:-translate-y-0.5 transition-all" data-conversion-event="article_request_school">
                  Request your school
                </Link>
                <Link href="/faq" className="flex items-center gap-2 p-3 sm:px-4 rounded-xl bg-white border border-slate-200 shadow-xs text-xs font-bold text-[#1a2a40] no-underline hover:border-teal-600 hover:text-teal-600 hover:-translate-y-0.5 transition-all">
                  Frequently asked questions
                </Link>
                <Link href="/partnership" className="flex items-center gap-2 p-3 sm:px-4 rounded-xl bg-white border border-slate-200 shadow-xs text-xs font-bold text-[#1a2a40] no-underline hover:border-teal-600 hover:text-teal-600 hover:-translate-y-0.5 transition-all">
                  School partnerships
                </Link>
              </div>
            </aside>

            {relatedPosts.length > 0 ? (
              <section
                className="relative border border-slate-200/90 rounded-[24px] sm:rounded-[28px] bg-white/95 shadow-sm overflow-hidden"
                aria-label="Continue reading"
              >
                <div className="pt-6 sm:pt-7 px-5 sm:px-7">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#1a2a40] m-0">Continue reading</h2>
                </div>
                <div className="p-5 sm:p-7">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {relatedPosts.map((rp) => (
                      <Link
                        key={rp.id}
                        href={`/blog/${rp.slug}`}
                        className="group border border-slate-200 rounded-2xl p-5 bg-white shadow-xs no-underline flex flex-col hover:-translate-y-1 hover:shadow-md transition-all"
                      >
                        <h3 className="text-base m-0 mb-2 text-[#1a2a40] font-extrabold leading-snug group-hover:text-teal-600 transition-colors">{rp.title}</h3>
                        <p className="text-xs text-slate-500 m-0 flex-1 leading-relaxed line-clamp-3">{rp.excerpt}</p>
                        <span className="mt-3.5 text-xs font-extrabold text-teal-600 group-hover:opacity-80 transition-opacity flex items-center gap-1">Read more &rarr;</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            <div className="relative border border-slate-200/90 rounded-[24px] sm:rounded-[28px] bg-white/95 shadow-sm overflow-visible z-30 focus-within:z-40">
              <div className="p-5 sm:p-7">
                <SchoolSearchWidget
                  compact={true}
                  titleText="Find your official school pack"
                  bodyText="Save time and buy the exact teacher-approved stationery kit for your school & grade in just 3 clicks."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Skip the queues"
        title="Ready to order your school pack?"
        text="Don't spend hours hunting for these items. Let Pexpacks deliver your exact school list straight to your door."
        primaryHref="/schools"
        primaryLabel="Find Your School Pack"
        secondaryHref="/add-your-school#school-request-form"
        secondaryLabel="My school isn't listed"
      />

      <section className="py-12 sm:py-16 bg-slate-50 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-teal-600 mb-2">Beat Janu-worry</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a2a40] mb-3 leading-tight">Plan ahead, pay at your own pace</h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                Find your child&rsquo;s school pack early, lock in your list,
                and order at your own pace so back-to-school is stress-free.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <Button href="/schools" variant="primary" className="min-h-[44px]" data-conversion-event="article_find_school_pack_bottom">
                  Find Your School Pack
                </Button>
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-[#1a2a40] m-0">School partnerships</h3>
              </div>
              <div>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed m-0">
                  Schools can submit stationery lists so parents order
                  grade-specific packs. No admin, no hassle.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/partnership" className="inline-flex items-center gap-1.5 text-sm font-extrabold text-teal-600 hover:text-teal-700 transition-colors" data-conversion-event="article_partnership">
                  Explore partnerships &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
