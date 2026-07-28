"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/formatCurrency";
import { PexcoverAddOn } from "./PexcoverAddOn";
import { PackItemsList } from "./PackItemsList";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import styles from "./ReviewOrderStep.module.css";
import clsx from "clsx";

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

export const ReviewOrderStep = memo(function ReviewOrderStep({
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
                <Input
                  id="school-search"
                  label="Search for a school"
                  type="search"
                  placeholder="Search for a school..."
                  value={schoolQuery}
                  onChange={(e) => handleSchoolSearch(e.target.value)}
                  autoFocus
                  className={styles.schoolSearchInput}
                  wrapperClassName="!contents"
                />
                {schoolResults.length > 0 ? (
                  <div className={styles.schoolResults}>
                    {schoolResults.map((s) => (
                      <Button
                        key={s.slug}
                        type="button"
                        variant="secondary"
                        className={clsx(styles.schoolResultItem, "rounded-full")}
                        onClick={() => {
                          const firstGrade = s.grades?.[0];
                          if (firstGrade) navigateToCheckout(s.slug, firstGrade);
                        }}
                      >
                        <div className="flex flex-col text-left w-full">
                          <strong>{s.name}</strong>
                          <span>
                            {s.city}, {s.province}
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : schoolQuery.trim() && schoolResults.length === 0 ? (
                  <p className={styles.schoolNoResults}>No schools found.</p>
                ) : null}
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-full"
                  onClick={() => {
                    setShowSchoolSearch(false);
                    setSchoolQuery("");
                    setSchoolResults([]);
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className={clsx(styles.reviewSchoolDisplay, styles.hasValue)}>
                <h3>{schoolName}</h3>
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-full"
                  style={{ padding: 6, minWidth: 32, minHeight: 32, height: 32, width: 32 }}
                  onClick={() => setShowSchoolSearch(true)}
                  ariaLabel="Change school"
                >
                  <span className={styles.schoolSearchIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </span>
                </Button>
              </div>
            )}
          </div>

          <div className={styles.reviewGradeCard}>
            <p className={styles.confirmKicker}>Grade</p>
            <Button
              type="button"
              variant="secondary"
              className={clsx(styles.gradeDrawerTrigger, styles.hasValue, "rounded-full", "justify-between", "w-full")}
              onClick={() => setShowGradeDrawer(!showGradeDrawer)}
              aria-expanded={showGradeDrawer}
              aria-controls="grade-drawer-panel"
            >
              <div className="flex justify-between items-center w-full">
                <span>{grade}</span>
                <svg
                  className={styles.gradeChevron}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  style={{
                    transform: showGradeDrawer ? "rotate(180deg)" : "none",
                    width: 18,
                    height: 18,
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 3
                  }}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </Button>
            {showGradeDrawer && availableGrades.length > 0 ? (
              <div
                className={styles.gradeDrawerPanel}
                id="grade-drawer-panel"
                role="listbox"
                aria-label="Available grades"
              >
                {availableGrades.map((g) => (
                  <Button
                    key={g.gradeSlug}
                    type="button"
                    variant="secondary"
                    className={clsx(styles.gradeDrawerItem, g.gradeSlug === gradeSlug && styles.gradeDrawerItemActive, "rounded-full", "justify-between", "w-full")}
                    onClick={() => {
                      setShowGradeDrawer(false);
                      if (g.gradeSlug !== gradeSlug)
                        navigateToCheckout(schoolSlug, g.gradeSlug);
                    }}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span>{g.grade}</span>
                      <span className={styles.gradeDrawerPrice}>
                        {formatCurrency(g.price)}
                      </span>
                    </div>
                  </Button>
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
});
