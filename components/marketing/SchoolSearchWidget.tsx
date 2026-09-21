"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type SchoolSearchResult = {
  id: string;
  name: string;
  slug: string;
  city: string;
  province: string;
};

type SchoolSearchWidgetProps = {
  compact?: boolean;
  titleText?: string;
  bodyText?: string;
  headingLevel?: "h2" | "h3";
};

export function SchoolSearchWidget({
  compact = false,
  titleText = "Find your school pack",
  bodyText = "Search for your school to find its grade packs. If it is not listed, upload the school list and I will help you work through it.",
  headingLevel = "h3",
}: SchoolSearchWidgetProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SchoolSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({ q: query.trim(), limit: "10" });
        const response = await fetch(
          `/api/schools/search?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) throw new Error("Search failed");

        const data = (await response.json()) as {
          success: true;
          results: SchoolSearchResult[];
        };
        setResults(data.results);
        setOpen(true);
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
          setError("I could not search schools right now. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/schools?q=${encodeURIComponent(query.trim())}`);
  }

  function selectSchool(result: SchoolSearchResult) {
    setOpen(false);
    router.push(`/schools/${result.slug}`);
  }

  const checkIconSvg = <Check className="size-4 shrink-0 mt-0.5 text-[var(--pex-keppel)]" strokeWidth={3} aria-hidden="true" />;

  return (
    <article
      className={cn(
        "relative z-[1] bg-[var(--card-bg,#ffffff)] rounded-[var(--radius-card,20px)] border-[var(--card-border,1px_solid_rgba(15,37,55,0.08))] p-[clamp(24px,4vw,36px)] [box-shadow:var(--card-shadow,0_10px_30px_rgba(15,37,55,0.03))] transition-all duration-[250ms] ease flex flex-col gap-[20px] hover:[box-shadow:var(--card-shadow-hover,0_20px_40px_rgba(15,37,55,0.06))] hover:border-[var(--color-teal-border)] data-[results-open=true]:z-[80] focus-within:z-[80]",
        compact && "compact-widget"
      )}
      data-results-open={open ? "true" : undefined}
      style={{ border: "var(--card-border, 1px solid rgba(15,37,55,0.08))" }}
    >
      <span className="font-[var(--font-button)] text-[12px] font-extrabold text-[var(--pex-keppel)] uppercase tracking-[0.05em]">
        Find your pack
      </span>
      {headingLevel === "h2" ? (
        <h2 className="text-[var(--pex-navy)] text-[22px] font-extrabold leading-[1.25] m-0">
          {titleText}
        </h2>
      ) : (
        <h3 className="text-[var(--pex-navy)] text-[22px] font-extrabold leading-[1.25] m-0">
          {titleText}
        </h3>
      )}
      <p className="text-[var(--pex-text)] text-[15px] leading-[1.5] m-0">
        {bodyText}
      </p>

      <form onSubmit={handleSearch} className="flex flex-col gap-[var(--space-3)] w-full">
        <div className="relative z-[1] flex flex-col gap-[6px]" ref={wrapperRef}>
          <label
            htmlFor="widgetSchoolQuery"
            className="text-[var(--text-2xs)] font-bold text-[var(--pex-navy)]"
          >
            Enter school name
          </label>
          <input
            id="widgetSchoolQuery"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError("");
            }}
            onFocus={() => {
              if (results.length > 0 || loading) setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="e.g. Parktown Primary"
            className="w-full min-h-[48px] px-[var(--space-4)] py-[var(--space-3)] rounded-full border border-[var(--pex-border,rgba(15,37,55,0.12))] bg-[var(--pex-bg,#f4f7f6)] font-inherit text-[15px] text-[var(--pex-navy)] outline-none transition-all duration-[200ms] ease focus:border-[var(--pex-keppel)] focus:bg-white focus:[box-shadow:0_0_0_4px_rgba(33,158,154,0.12)]"
            required
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls="widget-school-results"
          />
          {open ? (
            <div
              className="absolute z-[90] top-[calc(100%+8px)] inset-x-0 max-h-[420px] overflow-y-auto border border-[rgba(15,37,55,0.08)] rounded-[var(--radius-card,20px)] p-[var(--space-2)] bg-white [box-shadow:0_20px_40px_rgba(15,37,55,0.12)]"
              id="widget-school-results"
              role="listbox"
            >
              {loading ? (
                <p className="m-0 px-[14px] py-[var(--space-3)] text-[var(--pex-text-muted,#5a6b7a)] text-[var(--text-sm)]">
                  Searching school packs...
                </p>
              ) : null}
              {!loading && results.length > 0
                ? results.map((result) => (
                    <button
                      type="button"
                      role="option"
                      aria-selected={false}
                      className="w-full min-h-[58px] border-0 rounded-[14px] px-[14px] py-[var(--space-3)] bg-transparent text-[var(--pex-navy,#1a2a40)] text-left grid gap-[3px] cursor-pointer transition-all duration-[150ms] ease font-inherit text-inherit hover:bg-[var(--pex-bg,#f4f7f6)] focus-visible:bg-[var(--pex-bg,#f4f7f6)] focus-visible:outline-none"
                      key={result.id}
                      onClick={() => selectSchool(result)}
                    >
                      <strong>{result.name}</strong>
                      <span className="text-[var(--pex-text-muted,#5a6b7a)] text-[var(--text-sm)]">
                        {result.city}, {result.province}
                      </span>
                    </button>
                  ))
                : null}
              {!loading && !results.length && query.trim() ? (
                <p className="m-0 px-[14px] py-[var(--space-3)] text-[var(--pex-text-muted,#5a6b7a)] text-[var(--text-sm)]">
                  I could not find a matching school. Try another name or{" "}<Link href="/schools">browse all schools</Link>.
                </p>
              ) : null}
              {error ? (
                <p
                  className="m-0 px-[14px] py-[var(--space-3)] text-[var(--pex-error,#dc2626)] text-[var(--text-sm)] font-bold"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </form>

      {!compact && (
        <>
          <div className="h-[1px] bg-[rgba(15,37,55,0.08)] my-[4px]" role="separator" />
          <ul className="list-none p-0 m-0 flex flex-col gap-[10px]">
            <li className="flex items-start gap-[10px] text-[13.5px] text-[var(--pex-text)] leading-[1.4]">
              {checkIconSvg}
              <span>Packs prepared to match the available school list</span>
            </li>
            <li className="flex items-start gap-[10px] text-[13.5px] text-[var(--pex-text)] leading-[1.4]">
              {checkIconSvg}
              <span>Clear grade-by-grade pack information</span>
            </li>
            <li className="flex items-start gap-[10px] text-[13.5px] text-[var(--pex-text)] leading-[1.4]">
              {checkIconSvg}
              <span>Personal help when something needs a closer look</span>
            </li>
          </ul>
        </>
      )}
    </article>
  );
}
