"use client";

import Link from "next/link";
import { trackSchoolCardClicked } from "@/lib/analytics";
import styles from "./SchoolsBreadcrumbs.module.css";

type SchoolsBreadcrumbsProps = {
  school?: { name: string; slug: string };
  grade?: string;
};

export function SchoolsBreadcrumbs({ school, grade }: SchoolsBreadcrumbsProps) {
  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      <Link href="/" className={styles.crumb}>
        Home
      </Link>
      <span className={styles.separator} aria-hidden="true">
        /
      </span>
      <Link
        href="/schools"
        className={styles.crumb}
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
          <span className={styles.separator} aria-hidden="true">
            /
          </span>
          <Link
            href={`/schools/${school.slug}`}
            className={styles.crumb}
            aria-current={!grade ? "page" : undefined}
          >
            {school.name}
          </Link>
        </>
      ) : null}
      {grade ? (
        <>
          <span className={styles.separator} aria-hidden="true">
            /
          </span>
          <span className={styles.crumbCurrent} aria-current="page">
            {grade}
          </span>
        </>
      ) : null}
    </nav>
  );
}
