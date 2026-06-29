import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/marketing/CTASection";
import { PageHero } from "@/components/marketing/PageHero";
import { SchoolSearchWidget } from "@/components/marketing/SchoolSearchWidget";
import { blogPosts, getPostBySlug } from "@/data/blog";
import { buildMetadata, siteUrl } from "@/lib/seo";
import { IMAGE_BLUR_DATA_URL } from "@/lib/constants";
import { articleSchema } from "@/lib/schema";
import styles from "../Blog.module.css";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import cardStyles from "@/components/marketing/MarketingCards.module.css";

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const post = getPostBySlug(resolvedParams.slug);

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
      ? styles.postOrderedList
      : styles.postList;
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
        <figure key={`img-${i}`} className={styles.postImageWrapper}>
          <Image
            src={img.src}
            alt={img.alt}
            width={800}
            height={450}
            className={styles.postImage}
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
            <figcaption className={styles.postImageCaption}>
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
        <h2 key={`h2-${i}`} id={id} className={styles.postHeading}>
          {title}
        </h2>
      );
      continue;
    }

    /* ── Blockquote ── */
    if (line.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote key={`bq-${i}`} className={styles.postBlockquote}>
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
        elements.push(<p key={`p-${i}`}>{renderInlineContent(cleaned)}</p>);
      }
      elements.push(
        <div key={`pills-${i}`} className={styles.postLinkPillRow}>
          {pills.map((pill, pi) => (
            <Link key={pi} href={pill.href} className={styles.postLinkPill}>
              {pill.text}
              <span aria-hidden="true">&rarr;</span>
            </Link>
          ))}
        </div>
      );
      continue;
    }

    elements.push(<p key={`p-${i}`}>{renderInlineContent(line)}</p>);
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
  const post = getPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const publishedDate = new Date(post.date).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const headings = extractHeadings(post.content);
  const relatedPosts = blogPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema(post)) }}
      />
      <PageHero
        eyebrow={post.category}
        title={post.title}
            panelText={`By ${post.author}`}
        panelTitle={publishedDate}
      >
        <Link href="/blog" className={styles.backLink}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: "middle" }}>
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Resource Hub
        </Link>
      </PageHero>

      <section className={styles.documentSection}>
        <div className={styles.documentInner}>
          {/* ── Sidebar ── */}
          <aside className={styles.sidebarShell}>
            <nav className={styles.sidebarCard} aria-label="Article sections">
              {headings.length > 0 ? (
                <>
                  <p className={styles.sidebarEyebrow}>Jump to</p>
                  <h2 className={styles.sidebarTitle}>Contents</h2>
                  <ol className={styles.sidebarToc}>
                    {headings.map((h) => (
                      <li key={h.id}>
                        <a href={`#${h.id}`}>{h.title}</a>
                      </li>
                    ))}
                  </ol>
                  <hr className={styles.sidebarDivider} />
                </>
              ) : null}

              <div className={styles.sidebarMeta}>
                <div>
                  <span className={styles.sidebarMetaLabel}>Published</span>
                  <span className={styles.sidebarMetaValue}>{publishedDate}</span>
                </div>
                <div>
                  <span className={styles.sidebarMetaLabel}>Author</span>
                  <span className={styles.sidebarMetaValue}>{post.author}</span>
                </div>
                <div>
                  <span className={styles.sidebarMetaLabel}>Category</span>
                  <span className={styles.sidebarMetaValue}>{post.category}</span>
                </div>
              </div>

              <Link href="/schools" className={styles.sidebarCta}>
                Find Your School Pack
              </Link>
            </nav>
          </aside>

          {/* ── Main content ── */}
          <div className={styles.documentContent}>
            {post.image ? (
              <div className={styles.postHeroCard}>
                <Image
                  src={post.image}
                  alt={post.title}
                  width={800}
                  height={450}
                  className={styles.postImage}
                  placeholder="blur"
                  blurDataURL={IMAGE_BLUR_DATA_URL}
                  priority
                />
              </div>
            ) : null}

            <article className={styles.documentCard}>
              <div className={styles.postCardBody}>
                {renderContent(post.content)}
              </div>
            </article>

            <aside
              className={styles.knowledgeCard}
              aria-label="Explore more resources"
            >
              <p className={styles.sidebarEyebrow}>Keep digging</p>
              <h2 className={styles.knowledgeTitle}>
                Dive deeper into related topics
              </h2>
              <p className={styles.knowledgeText}>
                Discover helpful resources to make your back-to-school
                experience smoother.
              </p>
              <div className={styles.postKnowledgeGrid}>
                <Link href="/schools" className={styles.postKnowledgePill}>
                  Browse school packs
                </Link>
                <Link href="/lay-by" className={styles.postKnowledgePill}>
                  Lay-by payment plans
                </Link>
                <Link href="/add-your-school" className={styles.postKnowledgePill}>
                  Request your school
                </Link>
                <Link href="/faq" className={styles.postKnowledgePill}>
                  Frequently asked questions
                </Link>
                <Link href="/business-starter-brand-package" className={styles.postKnowledgePill}>
                  BrandPack
                </Link>
                <Link href="/partnership" className={styles.postKnowledgePill}>
                  School partnerships
                </Link>
              </div>
            </aside>

            {relatedPosts.length > 0 ? (
              <section
                className={styles.documentCard}
                aria-label="Continue reading"
              >
                <div className={styles.postCardHeader}>
                  <h2>Continue reading</h2>
                </div>
                <div className={styles.postCardBody}>
                  <div className={styles.postRelatedGrid}>
                    {relatedPosts.map((rp) => (
                      <Link
                        key={rp.id}
                        href={`/blog/${rp.slug}`}
                        className={styles.postRelatedCard}
                      >
                        <h3>{rp.title}</h3>
                        <p>{rp.excerpt}</p>
                        <span>Read more &rarr;</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            <div className={`${styles.documentCard} ${styles.searchWidgetCard}`}>
              <div className={styles.postCardBody}>
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

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.splitBand}>
            <div>
              <p className={sectionStyles.sectionEyebrow}>Start a business?</p>
              <h2>BrandPack</h2>
              <p>
                Launch your business professionally with a complete branding package — CIPC registration, logo, business cards, flyers, letterhead and a 5-page website.
              </p>
              <div className={sectionStyles.buttonRow}>
                <Button href="/business-starter-brand-package" variant="primary">
                  View BrandPack
                </Button>
              </div>
            </div>
            <div className={cardStyles.packCard}>
              <div className={cardStyles.packCardHead}>
                <h3 style={{ fontSize: "20px" }}>School partnerships</h3>
              </div>
              <div className={cardStyles.packCardBody}>
                <p className={cardStyles.packDescription}>
                  Schools can submit stationery lists so parents order
                  grade-specific packs. No admin, no hassle.
                </p>
              </div>
              <div className={cardStyles.packCardButtonWrap}>
                <Link href="/partnership" className={cardStyles.cardLink}>
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
