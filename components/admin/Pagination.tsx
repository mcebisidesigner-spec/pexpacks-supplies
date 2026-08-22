import Link from "next/link";
import styles from "../../app/admin/admin.module.css";
import { buildHref } from "@/lib/admin/ui-utils";

type PaginationProps = {
  basePath: string;
  params: Record<string, string | number | undefined | null>;
  currentPage: number;
  totalPages: number;
};

export function Pagination({
  basePath,
  params,
  currentPage,
  totalPages,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;

  return (
    <div className={styles.pagination}>
      <span className={styles.paginationInfo}>
        Page {currentPage} of {totalPages}
      </span>
      <div className={styles.pageNav}>
        <Link
          className={styles.pageButton}
          aria-disabled={prevDisabled}
          href={prevDisabled ? "#" : buildHref(basePath, params, { page: currentPage - 1 })}
        >
          ← Prev
        </Link>
        <Link
          className={styles.pageButton}
          aria-disabled={nextDisabled}
          href={nextDisabled ? "#" : buildHref(basePath, params, { page: currentPage + 1 })}
        >
          Next →
        </Link>
      </div>
    </div>
  );
}
