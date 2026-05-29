"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/formatCurrency";
import { PexcoverAddOn } from "./PexcoverAddOn";
import { PackItemsList } from "./PackItemsList";
import styles from "@/app/checkout/Checkout.module.css";

type SchoolResult = {
  slug: string;
  name: string;
  city: string;
  province: string;
  grades: string[];
};

type Grade = {
  id: string;
  grade: string;
  gradeSlug: string;
  price: number;
};

type ReviewOrderStepProps = {
  schoolSlug: string;
  schoolName: string;
  grade: string;
  gradeSlug: string;
  packPrice: number;
  contents: string[];
  hasPexcover: boolean;
  onPexcoverToggle: (selected: boolean) => void;
  pexcoverName: string;
  onPexcoverNameChange: (name: string) => void;
  pexcoverSubjects: string;
  onPexcoverSubjectsChange: (subjects: string) => void;
  pexcoverLabelFormat: string;
  onPexcoverLabelFormatChange: (format: string) => void;
  pexcoverNotes: string;
  onPexcoverNotesChange: (notes: string) => void;
  pexcoverPrice: number;
};

export function ReviewOrderStep({
  schoolSlug,
  schoolName,
  grade,
  gradeSlug,
  packPrice,
  contents,
  hasPexcover,
  onPexcoverToggle,
  pexcoverName,
  onPexcoverNameChange,
  pexcoverSubjects,
  onPexcoverSubjectsChange,
  pexcoverLabelFormat,
  onPexcoverLabelFormatChange,
  pexcoverNotes,
  onPexcoverNotesChange,
  pexcoverPrice,
}: ReviewOrderStepProps) {
  const router = useRouter();
  const [showSchoolSearch, setShowSchoolSearch] = useState(false);
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schoolResults, setSchoolResults] = useState<SchoolResult[]>([]);
  const [showGradeDrawer, setShowGradeDrawer] = useState(false);
  const [availableGrades, setAvailableGrades] = useState<Grade[]>([]);
  const schoolSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`/api/schools/${schoolSlug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.school?.grades) {
          setAvailableGrades(data.school.grades);
        }
      })
      .catch(() => {});
  }, [schoolSlug]);

  const handleSchoolSearch = useCallback((query: string) => {
    setSchoolQuery(query);
    if (schoolSearchTimeout.current) clearTimeout(schoolSearchTimeout.current);
    if (!query.trim()) {
      setSchoolResults([]);
      return;
    }
    schoolSearchTimeout.current = setTimeout(async () => {
      try {
        const r = await fetch(
          `/api/schools/search?q=${encodeURIComponent(query)}&limit=8`
        );
        const data = await r.json();
        if (data.success) setSchoolResults(data.results ?? []);
      } catch {
        /* ignore */
      }
    }, 280);
  }, []);

  function navigateToCheckout(slug: string, gSlug: string) {
    router.push(
      `/checkout/${encodeURIComponent(slug)}+${encodeURIComponent(gSlug)}`
    );
  }

  return (
    <div className={styles.reviewGrid}>
      <section className={styles.reviewLeftCol}>
        <div
          className={styles.selectionPanel}
          aria-label="Selected school and grade"
        >
          <div className={styles.reviewSchoolCard}>
            <p className={styles.confirmKicker}>School</p>
            {showSchoolSearch ? (
              <div className={styles.schoolSearchWrap}>
                <label className={styles.srOnly} htmlFor="school-search">
                  Search for a school
                </label>
                <input
                  id="school-search"
                  className={styles.schoolSearchInput}
                  type="search"
                  placeholder="Search for a school..."
                  value={schoolQuery}
                  onChange={(e) => handleSchoolSearch(e.target.value)}
                  autoFocus
                />
                {schoolResults.length > 0 ? (
                  <div className={styles.schoolResults}>
                    {schoolResults.map((s) => (
                      <button
                        key={s.slug}
                        type="button"
                        className={styles.schoolResultItem}
                        onClick={() => {
                          const firstGrade = s.grades?.[0];
                          if (firstGrade) navigateToCheckout(s.slug, firstGrade);
                        }}
                      >
                        <strong>{s.name}</strong>
                        <span>
                          {s.city}, {s.province}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : schoolQuery.trim() && schoolResults.length === 0 ? (
                  <p className={styles.schoolNoResults}>No schools found.</p>
                ) : null}
                <button
                  type="button"
                  className={styles.schoolSearchCancel}
                  onClick={() => {
                    setShowSchoolSearch(false);
                    setSchoolQuery("");
                    setSchoolResults([]);
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className={`${styles.reviewSchoolDisplay} ${styles.hasValue}`}>
                <h3>{schoolName}</h3>
                <button
                  type="button"
                  className={styles.reviewChangeBtn}
                  onClick={() => setShowSchoolSearch(true)}
                >
                  Change school
                </button>
              </div>
            )}
          </div>

          <div className={styles.reviewGradeCard}>
            <p className={styles.confirmKicker}>Grade</p>
            <button
              type="button"
              className={`${styles.gradeDrawerTrigger} ${styles.hasValue}`}
              onClick={() => setShowGradeDrawer(!showGradeDrawer)}
              aria-expanded={showGradeDrawer}
              aria-controls="grade-drawer-panel"
            >
              <span>{grade}</span>
              <svg
                className={styles.gradeChevron}
                viewBox="0 0 24 24"
                aria-hidden="true"
                style={{
                  transform: showGradeDrawer ? "rotate(180deg)" : "none",
                }}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {showGradeDrawer && availableGrades.length > 0 ? (
              <div
                className={styles.gradeDrawerPanel}
                id="grade-drawer-panel"
                role="listbox"
                aria-label="Available grades"
              >
                {availableGrades.map((g) => (
                  <button
                    key={g.gradeSlug}
                    type="button"
                    className={`${styles.gradeDrawerItem} ${g.gradeSlug === gradeSlug ? styles.gradeDrawerItemActive : ""}`}
                    role="option"
                    aria-selected={g.gradeSlug === gradeSlug}
                    onClick={() => {
                      setShowGradeDrawer(false);
                      if (g.gradeSlug !== gradeSlug)
                        navigateToCheckout(schoolSlug, g.gradeSlug);
                    }}
                  >
                    <span>{g.grade}</span>
                    <span className={styles.gradeDrawerPrice}>
                      {formatCurrency(g.price)}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <PexcoverAddOn
          selected={hasPexcover}
          onToggle={onPexcoverToggle}
          pexcoverName={pexcoverName}
          onNameChange={onPexcoverNameChange}
          pexcoverSubjects={pexcoverSubjects}
          onSubjectsChange={onPexcoverSubjectsChange}
          pexcoverLabelFormat={pexcoverLabelFormat}
          onLabelFormatChange={onPexcoverLabelFormatChange}
          pexcoverNotes={pexcoverNotes}
          onNotesChange={onPexcoverNotesChange}
          price={pexcoverPrice}
        />
      </section>

      <section className={styles.reviewRightCol}>
        <PackItemsList items={contents} price={packPrice} />
      </section>
    </div>
  );
}
