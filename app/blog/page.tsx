import type { Metadata } from "next";
import Link from "next/link";
import { BlogHubClient } from "@/components/blog/BlogHubClient";
import { getAllBlogArticles } from "@/lib/blog-data";
import { listPublicCmsFiles } from "@/lib/cms";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(
  "Stationery Guides & Printable Checklists | Pexpacks Resource Hub",
  "Free grade stationery checklists, school ruling guides, and expert parent advice to help South African learners excel all school year long.",
  "/blog",
);

export const revalidate = 300;

export default async function BlogPage() {
  const [articles, resources] = await Promise.all([
    getAllBlogArticles(),
    listPublicCmsFiles(),
  ]);

  const liveResourcesNode =
    resources.length > 0 ? (
      <div className="resourceHubCard rounded-card border border-pex-border bg-white p-6 sm:p-7 grid gap-4 shadow-card">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-pex-keppel">
            Resource Hub Downloads
          </span>
          <span className="text-xs text-pex-muted font-semibold">
            Official PDF templates
          </span>
        </div>

        <h3 className="text-xl font-extrabold font-heading text-pex-navy leading-tight m-0">
          Live parent resources & downloadable printables
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          {resources.slice(0, 4).map((resource) => (
            <Link
              key={resource.id}
              href={resource.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group grid grid-cols-[1fr_auto] items-center gap-3 p-4 rounded-xl bg-pex-bg-soft border border-pex-border text-pex-navy no-underline hover:border-pex-keppel/50 hover:bg-pex-bg-mint transition-all"
            >
              <span className="min-w-0">
                <strong className="block min-w-0 text-sm font-extrabold leading-snug group-hover:text-pex-keppel transition-colors">
                  {resource.title}
                </strong>
                {resource.description ? (
                  <small className="block min-w-0 text-pex-muted text-xs leading-normal mt-1 line-clamp-1">
                    {resource.description}
                  </small>
                ) : null}
              </span>
              <em className="rounded-full bg-pex-keppel/10 text-pex-keppel-dark text-[10px] not-italic font-extrabold px-2.5 py-1 uppercase tracking-wide shrink-0">
                {resource.file_type}
              </em>
            </Link>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <BlogHubClient articles={articles} resourcesNode={liveResourcesNode} />
  );
}
