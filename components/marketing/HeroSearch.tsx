"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { normaliseSchoolQuery } from "@/lib/schools/normaliseSchoolQuery";
import styles from "./HeroSearch.module.css";

const gradeOptions = [
  "Grade R",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

type SchoolSearchResult = {
  id: string;
  name: string;
  slug: string;
  city: string;
  province: string;
};

type SchoolDetails = SchoolSearchResult & {
  grades: {
    id: string;
    grade: string;
    gradeSlug: string;
  }[];
};

async function fetchSchoolSearch(query: string, limit = 8) {
  const params = new URLSearchParams({
    q: query.trim(),
    limit: String(limit),
  });

  const response = await fetch(`/api/schools/search?${params.toString()}`);

  if (!response.ok) {
    throw new Error("school_search_failed");
  }

  return (await response.json()) as {
    success: true;
    results: SchoolSearchResult[];
    total: number;
  };
}

async function fetchSchoolDetails(slug: string) {
  const response = await fetch(`/api/schools/${encodeURIComponent(slug)}`);

  if (!response.ok) {
    throw new Error("school_details_failed");
  }

  return (await response.json()) as {
    success: true;
    school: SchoolDetails;
  };
}

function findGradeBySearchValue(school: SchoolDetails, gradeValue: string) {
  const normalizedGrade = gradeValue.trim().toLowerCase();
  return school.grades.find(
    (grade) =>
      grade.grade.toLowerCase() === normalizedGrade ||
      grade.gradeSlug.toLowerCase() === normalizedGrade
  );
}

export function HeroSearch() {
  const router = useRouter();
  const errorId = useId();
  const resultsId = useId();
  const modalTitleId = useId();
  const modalDescriptionId = useId();
  const [schoolName, setSchoolName] = useState("");
  const [grade, setGrade] = useState("");
  const [error, setError] = useState<ReactNode>("");
  const modalRef = useRef<HTMLDivElement>(null);
  const [showMissingSchoolDialog, setShowMissingSchoolDialog] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [schoolTouched, setSchoolTouched] = useState(false);
  const [schoolLoading, setSchoolLoading] = useState(false);
  const [schoolResults, setSchoolResults] = useState<SchoolSearchResult[]>([]);
  const [selectedSchool, setSelectedSchool] =
    useState<SchoolSearchResult | null>(null);

  useEffect(() => {
    if (!schoolTouched) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setSchoolLoading(true);

      try {
        const params = new URLSearchParams({
          q: schoolName.trim(),
          limit: "8",
        });
        const response = await fetch(
          `/api/schools/search?${params.toString()}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("school_search_failed");
        }

        const data = (await response.json()) as {
          success: true;
          results: SchoolSearchResult[];
        };
        setSchoolResults(data.results);
      } catch {
        if (!controller.signal.aborted) {
          setSchoolResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSchoolLoading(false);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [schoolName, schoolTouched]);

  useEffect(() => {
    if (!showMissingSchoolDialog || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    firstElement.focus();
    modal.addEventListener("keydown", handleTabKey);
    return () => modal.removeEventListener("keydown", handleTabKey);
  }, [showMissingSchoolDialog]);

  async function resolveSchoolForSubmit(trimmedSchoolName: string) {
    if (
      selectedSchool &&
      normaliseSchoolQuery(selectedSchool.name) ===
        normaliseSchoolQuery(trimmedSchoolName)
    ) {
      return { school: selectedSchool, ambiguous: false };
    }

    const data = await fetchSchoolSearch(trimmedSchoolName, 8);
    const normalizedQuery = normaliseSchoolQuery(trimmedSchoolName);
    const exactMatches = data.results.filter(
      (school) => normaliseSchoolQuery(school.name) === normalizedQuery
    );

    if (exactMatches.length === 1) {
      return { school: exactMatches[0], ambiguous: false };
    }

    if (data.results.length === 1 && data.total === 1) {
      return { school: data.results[0], ambiguous: false };
    }

    return {
      school: null,
      ambiguous: data.total > 1 || data.results.length > 1,
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedSchoolName = schoolName.trim();
    const selectedGrade = grade.trim();

    setShowMissingSchoolDialog(false);

    if (!trimmedSchoolName && !selectedGrade) {
      setError(
        "Please enter your school name and select a grade before finding your pack."
      );
      return;
    }

    if (!trimmedSchoolName) {
      setError("Please enter your school name before finding your pack.");
      return;
    }

    if (!selectedGrade) {
      setError("Please select a grade before finding your pack.");
      return;
    }

    setSchoolLoading(true);

    try {
      const { school, ambiguous } =
        await resolveSchoolForSubmit(trimmedSchoolName);

      if (ambiguous) {
        setError(
          "Please enter the full school name so we can find the correct pack."
        );
        return;
      }

      if (!school) {
        setError("");
        setShowMissingSchoolDialog(true);
        return;
      }

      const details = await fetchSchoolDetails(school.slug);
      const gradePack = findGradeBySearchValue(details.school, selectedGrade);

      if (!gradePack) {
        setError(
          <>
            We do not have a {selectedGrade} pack listed for{" "}
            {details.school.name} yet.{" "}
            <Link
              href="/standard-school-packs"
              className={styles.inlineTextLink}
            >
              Explore our standard packs
            </Link>{" "}
            or{" "}
            <Link href="/contact" className={styles.inlineTextLink}>
              contact us
            </Link>
            .
          </>
        );
        return;
      }

      setError("");
      router.push(`/schools/${details.school.slug}/${gradePack.gradeSlug}`);
    } catch {
      setError("We could not search schools right now. Please try again.");
    } finally {
      setSchoolLoading(false);
    }
  }

  return (
    <form
      className={styles.heroSearch}
      onSubmit={handleSubmit}
      role="search"
      noValidate
    >
      <label className={[styles.field, styles.schoolSearchField].join(" ")}>
        <span>Find your school</span>
        <input
          name="q"
          type="search"
          placeholder="e.g. Parktown Primary"
          autoComplete="organization"
          value={schoolName}
          onFocus={() => {
            setSchoolTouched(true);
            setResultsOpen(true);
          }}
          onChange={(event) => {
            setSchoolName(event.target.value);
            setSelectedSchool(null);
            setSchoolTouched(true);
            setResultsOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setResultsOpen(false);
            }
          }}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={resultsOpen}
          aria-controls={resultsId}
          aria-describedby={error ? errorId : undefined}
        />
        {resultsOpen ? (
          <div
            className={styles.heroSearchResults}
            id={resultsId}
            role="listbox"
          >
            {schoolLoading ? (
              <p className={styles.heroSearchState}>Searching schools...</p>
            ) : null}
            {!schoolLoading && schoolResults.length
              ? schoolResults.map((school) => (
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedSchool?.slug === school.slug}
                    className={styles.heroSearchResult}
                    key={school.id}
                    onClick={() => {
                      setSelectedSchool(school);
                      setSchoolName(school.name);
                      setResultsOpen(false);
                      setError("");
                    }}
                  >
                    <strong>{school.name}</strong>
                    <span>
                      {school.city}, {school.province}
                    </span>
                  </button>
                ))
              : null}
            {!schoolLoading && !schoolResults.length ? (
              <div className={styles.noResultsState}>
                <p className={styles.heroSearchState}>
                  No matching schools found.
                </p>
                <Link
                  href="/add-your-school#school-request-form"
                  className={styles.addSchoolLink}
                >
                  Add your school
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}
      </label>
      <label className={styles.field}>
        <span>Select grade</span>
        <select
          name="grade"
          value={grade}
          onChange={(event) => setGrade(event.target.value)}
          aria-describedby={error ? errorId : undefined}
        >
          <option value="" disabled>
            Choose grade
          </option>
          {gradeOptions.map((gradeOption) => (
            <option value={gradeOption} key={gradeOption}>
              {gradeOption}
            </option>
          ))}
        </select>
      </label>
      <button
        className={styles.searchButton}
        type="submit"
        disabled={schoolLoading}
      >
        {schoolLoading ? "Searching..." : "Find My Pack"}
      </button>
      {error ? (
        <p className={styles.searchError} id={errorId} role="alert">
          {error}
        </p>
      ) : null}
      {showMissingSchoolDialog ? (
        <div className={styles.modalOverlay} role="presentation">
          <div
            ref={modalRef}
            className={styles.modalCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
            aria-describedby={modalDescriptionId}
          >
            <p className={styles.eyebrow}>Search support</p>
            <h2 id={modalTitleId}>School not found</h2>
            <p id={modalDescriptionId}>
              Your school is not in our database. Would you like to add your
              school?
            </p>
            <div className={styles.modalActions}>
              <Link
                className={styles.modalPrimaryAction}
                href="/add-your-school#school-request-form"
              >
                Yes
              </Link>
              <Link className={styles.modalSecondaryAction} href="/contact">
                Contact Us
              </Link>
              <button
                className={styles.modalDismiss}
                type="button"
                onClick={() => setShowMissingSchoolDialog(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
