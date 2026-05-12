import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { blogPosts, getPostBySlug } from "@/data/blog";
import styles from "../Blog.module.css";
import { CTASection } from "@/components/marketing/CTASection";

// This is crucial for static generation of all blog posts
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  
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

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

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
            <span>•</span>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-ZA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </header>

        {post.image && (
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
        )}

        <div className={styles.postContent}>
          {post.content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
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
