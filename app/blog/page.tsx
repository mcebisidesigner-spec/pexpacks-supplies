import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import { listBlogPosts } from "@/lib/blog";
import { listPublicCmsFiles } from "@/lib/cms";
import { buildMetadata } from "@/lib/seo";
import { SchoolSearchWidget } from "@/components/marketing/SchoolSearchWidget";
import { BlogFilter } from "./BlogFilter";
import { SubscribeForm } from "./SubscribeForm";

export const metadata: Metadata = buildMetadata(
  "Digital Backpack Resources | Pexpacks",
  "Free printables, expert parent guides, and study tools to empower your child's academic year.",
  "/blog"
);

export const revalidate = 300;

export default async function BlogIndex() {
  const [posts, resources] = await Promise.all([
    listBlogPosts(),
    listPublicCmsFiles(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Digital Backpack"
        title="Everything you need."
        text="Download free grade stationery checklists, printable study tools, and expert parent guides to help learners excel all school year long."
        panelText="Free resources for parents and learners"
        panelTitle="Expert guides, printables, study tools & more"
      >
        <div className="flex flex-col sm:flex-row gap-3 mt-5 items-stretch sm:items-center">
          <Button href="#blog-content" variant="primary" className="min-h-[44px]">Browse Resources</Button>
          <Button href="#blog-subscribe" variant="white" className="min-h-[44px]">Stay Updated</Button>
        </div>
      </PageHero>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16" id="blog-content">
        {/* PRIMARY COLUMN: ARTICLES */}
        <main className="flex flex-col gap-6 min-w-0" aria-label="Resource articles">
          <BlogFilter posts={posts} />
        </main>

        {/* SIDEBAR COLUMN: CONVERSION WIDGETS */}
        <aside className="relative z-30 flex flex-col gap-6 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 lg:sticky lg:top-[calc(72px+32px)] z-40 gap-6">
            {/* WIDGET 1: GAUTENG SCHOOL PACK SEARCH */}
            <SchoolSearchWidget headingLevel="h3" />

            {resources.length > 0 ? (
              <div className="resourceHubCard rounded-[20px] border border-teal-600/20 bg-white p-5 grid gap-4 shadow-sm">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-600">Resource Hub</span>
                <h3 className="text-lg font-extrabold text-[#1a2a40] leading-tight m-0">Live parent resources</h3>
                <div className="grid gap-2.5">
                  {resources.slice(0, 4).map((resource) => (
                    <Link
                      key={resource.id}
                      href={resource.file_url}
                      className="group grid grid-cols-[1fr_auto] items-center gap-3 py-3 border-t border-slate-100 text-[#1a2a40] no-underline hover:text-teal-600 transition-colors"
                    >
                      <span className="min-w-0">
                        <strong className="block min-w-0 text-[13.5px] font-extrabold leading-snug group-hover:text-teal-600 transition-colors">{resource.title}</strong>
                        {resource.description ? <small className="block min-w-0 text-slate-500 text-xs leading-normal mt-1">{resource.description}</small> : null}
                      </span>
                      <em className="rounded-full bg-teal-600/10 text-teal-700 text-[10px] not-italic font-extrabold px-2.5 py-1 uppercase tracking-wide shrink-0">{resource.file_type}</em>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            {/* WIDGET 2: 100% CORRECT PACK GUARANTEE */}
            <div className="rounded-[20px] border border-teal-600/15 bg-gradient-to-br from-teal-600/[0.04] to-slate-900/[0.02] p-5 flex flex-col gap-3.5 shadow-sm">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-teal-600 shrink-0" />
                <h3 className="text-[15px] font-extrabold text-[#1a2a40] m-0">Teacher-Approved Guarantee</h3>
              </div>
              <p className="text-[13.5px] text-slate-600 leading-relaxed m-0">
                We strictly cross-reference official, teacher-submitted stationery lists. You receive the exact brand, size, and quantity requested by your school—100% guaranteed.
              </p>
            </div>

            {/* WIDGET 3: PEXCOVER BOOK COVERING PROMOTION */}
            <div className="relative overflow-hidden rounded-[20px] bg-[#1a2a40] text-white p-6 sm:p-7 flex flex-col gap-4 shadow-[0_10px_30px_rgba(15,37,55,0.12)]">
              <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-teal-500/15 pointer-events-none" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">Time-Saving Add-on</span>
              <h3 className="text-lg font-extrabold text-white m-0 leading-snug">Exercise Books Neatly Covered & Named</h3>
              <p className="text-[13.5px] text-white/85 leading-relaxed m-0">
                Add Pexcover to your stationery pack. Our team will cover all exercise books in durable protective film and print clean name tags for your child.
              </p>
              <Link
                href="/blog/what-is-pexcover-book-covering"
                className="mt-1 text-[13.5px] font-bold text-white underline underline-offset-4 hover:text-teal-300 transition-colors w-fit"
                data-conversion-event="blog_pexcover_guide"
              >
                Learn how Pexcover works
              </Link>
            </div>
          </div>
        </aside>
      </div>
      <section className="py-12 sm:py-20 bg-gradient-to-b from-slate-50 to-white" id="blog-subscribe">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SubscribeForm />
        </div>
      </section>
    </>
  );
}
