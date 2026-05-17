import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CTASection } from "@/components/marketing/CTASection";
import { blogPosts, getPostBySlug } from "@/data/blog";
import styles from "../Blog.module.css";

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
    return {
      title: "Post Not Found | PexPacks",
    };
  }

  return {
    title: `${post.title} | PexPacks Resource Hub`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
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

  return (
    <>
      <article className={styles.postContainer}>
        <Link href="/blog" className={styles.backLink}>
          &larr; Back to Resource Hub
        </Link>

        <header className={styles.postHeader}>
          <span className={styles.blogCategory}>{post.category}</span>
          <h1>{post.title}</h1>
          <div className={styles.blogMeta}>
            <span>By {post.author}</span>
            <span aria-hidden="true">&bull;</span>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-ZA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </header>

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
        </div>
      </article>
      <CTASection
        eyebrow="Skip the hassle"
        title="Ready to order your school pack?"
        text="Don't spend hours hunting for these items. Let PexPacks deliver your exact school list straight to your door."
        primaryHref="/schools"
        primaryLabel="Find Your School Pack"
        secondaryHref="/add-your-school#school-request-form"
        secondaryLabel="My school isn't listed"
      />
    </>
  );
}
