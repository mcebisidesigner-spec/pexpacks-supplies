"use client";

import Link from "next/link";
import { trackSchoolCardClicked } from "@/lib/analytics";

type SchoolsBreadcrumbsProps = {
  school?: { name: string; slug: string };
  grade?: string;
};

export function SchoolsBreadcrumbs({ school, grade }: SchoolsBreadcrumbsProps) {
  return (
    <nav className="w-full max-w-[var(--layout-max-width)] mx-auto px-4 md:px-8 pt-4 flex items-center flex-wrap gap-2 text-sm" aria-label="Breadcrumb">
      <Link href="/" className="text-pex-keppel font-extrabold no-underline hover:underline hover:text-pex-keppel/80 underline-offset-2 transition-colors">
        Home
      </Link>
      <span className="text-pex-border select-none" aria-hidden="true">
        /
      </span>
      <Link
        href="/schools"
        className="text-pex-keppel font-extrabold no-underline hover:underline hover:text-pex-keppel/80 underline-offset-2 transition-colors"
        onClick={() =>
          trackSchoolCardClicked({
            schoolSlug: "",
            placement: "browse",
            position: 0,
          })
        }
      >
        Schools
      </Link>
      {school ? (
        <>
          <span className="text-pex-border select-none" aria-hidden="true">
            /
          </span>
          <Link
            href={`/schools/${school.slug}`}
            className="text-pex-keppel font-extrabold no-underline hover:underline hover:text-pex-keppel/80 underline-offset-2 transition-colors"
            aria-current={!grade ? "page" : undefined}
          >
            {school.name}
          </Link>
        </>
      ) : null}
      {grade ? (
        <>
          <span className="text-pex-border select-none" aria-hidden="true">
            /
          </span>
          <span className="text-pex-muted font-extrabold max-w-[280px] truncate" aria-current="page">
            {grade}
          </span>
        </>
      ) : null}
    </nav>
  );
}
