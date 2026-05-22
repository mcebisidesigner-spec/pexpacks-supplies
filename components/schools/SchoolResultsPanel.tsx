import type { SchoolSearchRecord } from "@/lib/schools/types";
import heroSearchStyles from "@/components/marketing/HeroSearch.module.css";
import { InlineSchoolWaitlist } from "./InlineSchoolWaitlist";
import { SchoolResultCard } from "./SchoolResultCard";
import { SchoolResultsAutoLoad } from "./SchoolResultsAutoLoad";
import { ViralReferralBanner } from "./ViralReferralBanner";
import styles from "./SchoolResultsPanel.module.css";

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
  query?: string;
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
  query = "",
  onLoadMore,
}: SchoolResultsPanelProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles.resultsPanel}
      id="school-search-results"
      aria-live="polite"
      data-school-results-scroll
    >
      {!queryReady ? (
        <p className={styles.resultsState}>
          Start typing your school name or choose a grade and region.
        </p>
      ) : null}
      {isLoading ? (
        <p className={styles.resultsState}>Loading schools...</p>
      ) : null}
      {error ? <p className={styles.resultsError}>{error}</p> : null}
      {!isLoading && queryReady && hasSearched && !error ? (
        <>
          <div className={styles.resultsCount}>
            <strong>
              {total === 1 ? "1 school found" : `${total} schools found`}
            </strong>
            {total > 0 ? (
              <span>
                Showing {visibleCount} of {total}
              </span>
            ) : null}
          </div>
          {results.length > 0 ? (
            <div className={styles.resultsList}>
              {results.map((school) => (
                <SchoolResultCard school={school} key={school.id} />
              ))}
            </div>
          ) : (
            <div className={heroSearchStyles.noResultsState}>
              <p className={heroSearchStyles.heroSearchState}>
                No matching schools found.
              </p>
              <InlineSchoolWaitlist schoolName={query} source="schools-search" />
              <ViralReferralBanner compact />
            </div>
          )}
          <SchoolResultsAutoLoad
            hasMore={hasMore}
            isLoading={isLoading}
            onLoadMore={onLoadMore}
            className={styles.loadMoreSentinel}
          />
          {hasMore ? (
            <button
              className={styles.loadMoreButton}
              type="button"
              onClick={onLoadMore}
            >
              Load more schools
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
