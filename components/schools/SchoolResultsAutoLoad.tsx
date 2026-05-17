"use client";

import { useEffect, useRef } from "react";

type SchoolResultsAutoLoadProps = {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  className?: string;
};

export function SchoolResultsAutoLoad({
  hasMore,
  isLoading,
  onLoadMore,
  className,
}: SchoolResultsAutoLoadProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const latestLoadMore = useRef(onLoadMore);
  const canRequest = useRef(true);

  useEffect(() => {
    latestLoadMore.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    if (!isLoading) {
      canRequest.current = true;
    }
  }, [isLoading]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (
      !sentinel ||
      !hasMore ||
      isLoading ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    const scrollRoot = sentinel.closest<HTMLElement>(
      "[data-school-results-scroll]"
    );

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || !canRequest.current) {
          return;
        }

        canRequest.current = false;
        latestLoadMore.current();
      },
      {
        root: scrollRoot,
        rootMargin: "140px 0px",
        threshold: 0.01,
      }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  if (!hasMore) {
    return null;
  }

  return <div ref={sentinelRef} className={className} aria-hidden="true" />;
}
