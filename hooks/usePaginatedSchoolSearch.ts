"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  PaginatedSchoolResults,
  SchoolSearchRecord,
} from "@/lib/schools/types";
import {
  trackSchoolSearchCompleted,
  trackSchoolSearchFailed,
} from "@/lib/analytics";

type UsePaginatedSchoolSearchOptions = {
  initialQuery?: string;
  initialGrade?: string;
  initialPhase?: string;
  gradeAllValue?: string;
  phaseAllValue?: string;
  resultLimit?: number;
  initialPanelOpen?: boolean;
  errorMessage: string;
  searchSource: "home" | "schools" | "tray";
};

function shouldSearch(
  gradeAllValue: string,
  grade: string,
  phaseAllValue: string,
  phase: string,
  debouncedQuery: string
) {
  if (grade !== gradeAllValue) return true;
  if (phase !== phaseAllValue) return true;
  return debouncedQuery.trim().length >= 3;
}

export function usePaginatedSchoolSearch({
  initialQuery = "",
  initialGrade = "",
  initialPhase = "",
  gradeAllValue = "",
  phaseAllValue = "",
  resultLimit = 12,
  initialPanelOpen = false,
  errorMessage,
  searchSource,
}: UsePaginatedSchoolSearchOptions) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [grade, setGrade] = useState(initialGrade);
  const [phase, setPhase] = useState(initialPhase);
  const [results, setResults] = useState<SchoolSearchRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [panelOpen, setPanelOpen] = useState(initialPanelOpen);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const activeRequest = useRef<AbortController | null>(null);

  const queryReady =
    grade !== gradeAllValue ||
    phase !== phaseAllValue ||
    debouncedQuery.trim().length >= 3;

  // Client-side in-memory cache for instant keystroke/backspace results.
  const clientSearchCache = useRef(new Map<string, PaginatedSchoolResults>());

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 200);
    return () => window.clearTimeout(timer);
  }, [query]);

  const fetchResults = useCallback(
    async (nextOffset: number, mode: "replace" | "append") => {
      if (!shouldSearch(gradeAllValue, grade, phaseAllValue, phase, debouncedQuery)) {
        setResults([]);
        setTotal(0);
        setHasMore(false);
        return;
      }

      const params = new URLSearchParams({
        q: debouncedQuery.trim(),
        limit: String(resultLimit),
        offset: String(nextOffset),
      });

      if (grade !== gradeAllValue) {
        params.set("grade", grade);
      }

      if (phase !== phaseAllValue) {
        params.set("phase", phase);
      }

      const cacheKey = params.toString();
      if (mode === "replace") {
        const cached = clientSearchCache.current.get(cacheKey);
        if (cached) {
          setResults(cached.results);
          setTotal(cached.total);
          setHasMore(cached.hasMore);
          setHasSearched(true);
          setIsLoading(false);
          setError("");
          return;
        }
      }

      activeRequest.current?.abort();
      const controller = new AbortController();
      activeRequest.current = controller;
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/schools/search?${cacheKey}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("school_search_failed");
        }

        const data = (await response.json()) as PaginatedSchoolResults & {
          success: boolean;
        };

        if (mode === "replace") {
          if (clientSearchCache.current.size > 150) {
            clientSearchCache.current.clear();
          }
          clientSearchCache.current.set(cacheKey, data);
        }

        setResults((current) =>
          mode === "append" ? [...current, ...data.results] : data.results
        );
        setTotal(data.total);
        setHasMore(data.hasMore);
        setHasSearched(true);
        trackSchoolSearchCompleted({
          source: searchSource,
          queryLength: debouncedQuery.trim().length,
          resultCount: data.total,
          offset: nextOffset,
        });
      } catch (fetchError) {
        if (
          fetchError instanceof DOMException &&
          fetchError.name === "AbortError"
        ) {
          return;
        }

        setError(errorMessage);
        trackSchoolSearchFailed({
          source: searchSource,
          queryLength: debouncedQuery.trim().length,
        });
      } finally {
        if (activeRequest.current === controller) {
          setIsLoading(false);
        }
      }
    },
    [debouncedQuery, errorMessage, grade, gradeAllValue, phase, phaseAllValue, resultLimit, searchSource]
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
    if (value.trim().length >= 3) {
      setPanelOpen(true);
    }
  }

  function updateGrade(value: string) {
    setGrade(value);
    setPanelOpen(true);
  }

  function updatePhase(value: string) {
    setPhase(value);
    setPanelOpen(true);
  }

  return {
    query,
    grade,
    phase,
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
    updatePhase,
  };
}

