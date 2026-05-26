import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/marketing/CTASection";
import { PageHero } from "@/components/marketing/PageHero";
import { SchoolSearchWidget } from "@/components/marketing/SchoolSearchWidget";
import { blogPosts, getPostBySlug } from "@/data/blog";
import { RatingStrip } from "@/components/shared/RatingStrip";
import { buildMetadata, siteUrl } from "@/lib/seo";
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
    `/blog/${post.slug}`
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

  return (
    <>
      <PageHero
        eyebrow={post.category}
        title={post.title}
        text={post.excerpt}
        panelText={`By ${post.author}`}
        panelTitle={publishedDate}
      >
        <Link href="/blog" className={styles.backLink}>
          Back to Resource Hub
        </Link>
      </PageHero>

      <article className={styles.postContainer}>
        {post.image ? (
          <div className={styles.postHeroImage}>
            <Image
              src={post.image}
              alt={post.title}
              width={800}
              height={450}
              className={styles.postImage}
              priority
            />
          </div>
        ) : null}

        <div className={styles.postContent}>
          {post.content.map((paragraph, index) => {
            const imageMatch = paragraph.match(/^!\[(.*?)\]\((.*?)\)$/);

            if (imageMatch) {
              return (
                <div key={index} className={styles.postInlineImage}>
                  <Image
                    src={imageMatch[2]}
                    alt={imageMatch[1]}
                    width={800}
                    height={450}
                    className={styles.postImage}
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "16px",
                      marginTop: "24px",
                      marginBottom: "32px",
                      border: "1px solid rgba(0,0,0,0.05)",
                    }}
                  />
                </div>
              );
            }

            if (paragraph.startsWith("## ")) {
              return (
                <h2
                  key={index}
                  style={{
                    marginTop: "32px",
                    marginBottom: "16px",
                    fontSize: "24px",
                    color: "var(--pex-primary)",
                  }}
                >
                  {paragraph.replace("## ", "")}
                </h2>
              );
            }

            return <p key={index}>{paragraph}</p>;
          })}
          
          {/* CONTEXTUAL SEARCH INLINE FUNNEL */}
          <div className={styles.postInlineWidget}>
            <SchoolSearchWidget 
              compact={true} 
              titleText="Find your official school pack"
              bodyText="Save time and buy the exact teacher-approved stationery kit for your school & grade in just 3 clicks."
            />
          </div>
        </div>
      </article>
      <CTASection
        eyebrow="Skip the hassle"
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
              <p className={sectionStyles.sectionEyebrow}>Need office stationery?</p>
              <h2>Business supplies</h2>
              <p>
                Pexpacks prepares practical office packs for SMEs, home offices, and small teams with custom quotes and bulk pricing.
              </p>
              <div className={sectionStyles.buttonRow}>
                <Button href="/office" variant="primary">View Office Packs</Button>
                <Button href="/office#contact-enquiry" variant="white">Request a Quote</Button>
              </div>
            </div>
            <div className={cardStyles.packCard}>
              <div className={cardStyles.packCardHead}>
                <h3 style={{ fontSize: "20px" }}>School partnerships</h3>
              </div>
              <div className={cardStyles.packCardBody}>
                <p className={cardStyles.packDescription}>
                  Schools can submit stationery lists so parents order grade-specific packs. No admin, no hassle.
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
      <RatingStrip />
    </>
  );
}
