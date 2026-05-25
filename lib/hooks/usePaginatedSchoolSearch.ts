"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  PaginatedSchoolResults,
  SchoolSearchRecord,
} from "@/lib/schools/types";

type UsePaginatedSchoolSearchOptions = {
  initialQuery?: string;
  initialGrade?: string;
  gradeAllValue?: string;
  resultLimit?: number;
  initialPanelOpen?: boolean;
  errorMessage: string;
};

function shouldSearch() {
  return true;
}

export function usePaginatedSchoolSearch({
  initialQuery = "",
  initialGrade = "",
  gradeAllValue = "",
  resultLimit = 12,
  initialPanelOpen = false,
  errorMessage,
}: UsePaginatedSchoolSearchOptions) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [grade, setGrade] = useState(initialGrade);
  const [results, setResults] = useState<SchoolSearchRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [panelOpen, setPanelOpen] = useState(initialPanelOpen);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const activeRequest = useRef<AbortController | null>(null);

  const queryReady = true;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 350);
    return () => window.clearTimeout(timer);
  }, [query]);

  const fetchResults = useCallback(
    async (nextOffset: number, mode: "replace" | "append") => {
      if (!shouldSearch()) {
        setResults([]);
        setTotal(0);
        setHasMore(false);
        return;
      }

      activeRequest.current?.abort();
      const controller = new AbortController();
      activeRequest.current = controller;
      setIsLoading(true);
      setError("");

      const params = new URLSearchParams({
        q: debouncedQuery.trim(),
        limit: String(resultLimit),
        offset: String(nextOffset),
      });

      if (grade !== gradeAllValue) {
        params.set("grade", grade);
      }

      try {
        const response = await fetch(`/api/schools/search?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("school_search_failed");
        }

        const data = (await response.json()) as PaginatedSchoolResults & {
          success: boolean;
        };
        setResults((current) =>
          mode === "append" ? [...current, ...data.results] : data.results
        );
        setTotal(data.total);
        setHasMore(data.hasMore);
        setHasSearched(true);
      } catch (fetchError) {
        if (
          fetchError instanceof DOMException &&
          fetchError.name === "AbortError"
        ) {
          return;
        }

        setError(errorMessage);
      } finally {
        if (activeRequest.current === controller) {
          setIsLoading(false);
        }
      }
    },
    [debouncedQuery, errorMessage, grade, gradeAllValue, resultLimit]
  );

  useEffect(() => {
    if (!panelOpen) {
      return;
    }

    if (!queryReady) {
      setResults([]);
      setTotal(0);
      setHasMore(false);
      setHasSearched(false);
      return;
    }

    void fetchResults(0, "replace");
  }, [fetchResults, panelOpen, queryReady]);

  useEffect(() => {
    return () => activeRequest.current?.abort();
  }, []);

  function updateQuery(value: string) {
    setQuery(value);
    setPanelOpen(true);
  }

  function updateGrade(value: string) {
    setGrade(value);
    setPanelOpen(true);
  }

  return {
    query,
    grade,
    results,
    total,
    hasMore,
    hasSearched,
    panelOpen,
    isLoading,
    error,
    queryReady,
    setPanelOpen,
    fetchResults,
    updateQuery,
    updateGrade,
  };
}
