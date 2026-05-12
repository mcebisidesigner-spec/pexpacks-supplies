import type { SchoolSearchRecord } from "@/lib/schools/types";
import Link from "next/link";
import { SchoolResultCard } from "./SchoolResultCard";
import styles from "./Schools.module.css";

type SchoolResultsPanelProps = {
  isOpen: boolean;
  isLoading: boolean;
  hasSearched: boolean;
  queryReady: boolean;
  results: SchoolSearchRecord[];
  total: number;
  visibleCount: number;
  hasMore: boolean;
  error: string;
  onLoadMore: () => void;
};

export function SchoolResultsPanel({
  isOpen,
  isLoading,
  hasSearched,
  queryReady,
  results,
  total,
  visibleCount,
  hasMore,
  error,
  onLoadMore
}: SchoolResultsPanelProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.resultsPanel} id="school-search-results" aria-live="polite">
      {!queryReady ? <p className={styles.resultsState}>Start typing your school name or choose a grade and region.</p> : null}
      {isLoading ? <p className={styles.resultsState}>Loading schools...</p> : null}
      {error ? <p className={styles.resultsError}>{error}</p> : null}
      {!isLoading && queryReady && hasSearched && !error ? (
        <>
          <div className={styles.resultsCount}>
            <strong>{total === 1 ? "1 school found" : `${total} schools found`}</strong>
            {total > 0 ? <span>Showing {visibleCount} of {total}</span> : null}
          </div>
          {results.length > 0 ? (
            <div className={styles.resultsList}>
              {results.map((school) => (
                <SchoolResultCard school={school} key={school.id} />
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              <h3>No matching schools found.</h3>
              <p>Request your school pack and we&apos;ll help you.</p>
              <Link href="/add-your-school">Add Your School</Link>
            </div>
          )}
          {hasMore ? (
            <button className={styles.loadMoreButton} type="button" onClick={onLoadMore}>
              Load more schools
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
