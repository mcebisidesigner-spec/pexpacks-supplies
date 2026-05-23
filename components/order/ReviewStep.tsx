import Link from "next/link";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  PEXCOVER_PRICE,
  type GradePexcoverEntry,
  type SchoolDetails,
  type SchoolSearchResult,
  type StandardSelection,
} from "./OrderFormTypes";
import styles from "./Order.module.css";

type ReviewStepProps = {
  standardSelection: StandardSelection | null;
  selectedSchool: SchoolDetails | null;
  setSelectedSchool: (school: SchoolDetails | null) => void;
  schoolQuery: string;
  setSchoolQuery: (query: string) => void;
  schoolResults: SchoolSearchResult[];
  schoolOpen: boolean;
  setSchoolOpen: (open: boolean) => void;
  setSchoolTouched: (touched: boolean) => void;
  schoolLoading: boolean;
  schoolError: string;
  gradeSlug: string;
  setGradeSlug: (slug: string) => void;
  hasPexcover: boolean;
  setHasPexcover: (value: boolean) => void;
  pexcoverName: string;
  setPexcoverName: (value: string) => void;
  pexcoverSubjects: string;
  setPexcoverSubjects: (value: string) => void;
  pexcoverLabelFormat: string;
  setPexcoverLabelFormat: (value: string) => void;
  pexcoverNotes: string;
  setPexcoverNotes: (value: string) => void;
  selectedPackTitle: string;
  packKind: string;
  schoolName?: string;
  gradeName?: string;
  itemCount: number;
  estimatedTotal?: number;
  selectedPackItems: string[];
  reviewReady: boolean;
  errors: Record<string, string>;
  draftStatus: string;
  clearFieldError: (field: string) => void;
  selectSchool: (result: SchoolSearchResult) => Promise<void>;
  selectionLockedLabel?: string;
  customiseHref?: string;
  gradePexcovers?: GradePexcoverEntry[];
  setGradePexcovers?: (entries: GradePexcoverEntry[]) => void;
  isMultiSchoolPack?: boolean;
};

export function ReviewStep({
  standardSelection,
  selectedSchool,
  setSelectedSchool,
  schoolQuery,
  setSchoolQuery,
  schoolResults,
  schoolOpen,
  setSchoolOpen,
  setSchoolTouched,
  schoolLoading,
  schoolError,
  gradeSlug,
  setGradeSlug,
  hasPexcover,
  setHasPexcover,
  pexcoverName,
  setPexcoverName,
  pexcoverSubjects,
  setPexcoverSubjects,
  pexcoverLabelFormat,
  setPexcoverLabelFormat,
  pexcoverNotes,
  setPexcoverNotes,
  selectedPackTitle,
  packKind,
  schoolName,
  gradeName,
  itemCount,
  estimatedTotal,
  selectedPackItems,
  reviewReady,
  errors,
  draftStatus,
  clearFieldError,
  selectSchool,
  selectionLockedLabel,
  customiseHref,
  gradePexcovers,
  setGradePexcovers,
  isMultiSchoolPack,
}: ReviewStepProps) {
  return (
    <div className={styles.reviewGrid}>
      {selectionLockedLabel ? (
        <div className={styles.selectionCard}>
          <div>
            <p className={styles.confirmKicker}>School and grades</p>
            <h3>{schoolName ?? "Selected school"}</h3>
            <p>{selectionLockedLabel}</p>
          </div>
        </div>
      ) : !standardSelection ? (
        <div className={styles.selectionCard}>
          <div className={styles.fieldGroup}>
            <label htmlFor="order-school-search">School name</label>
            <p id="school-helper">
              Search and select the school this pack belongs to.
            </p>
            <input
              id="order-school-search"
              name="orderSchoolSearch"
              type="search"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={schoolOpen}
              aria-controls="order-school-results"
              aria-describedby={`school-helper${errors.school ? " school-error" : ""}`}
              aria-invalid={Boolean(errors.school)}
              autoComplete="off"
              placeholder="Start typing your school name"
              value={schoolQuery}
              onFocus={() => {
                setSchoolTouched(true);
                setSchoolOpen(true);
              }}
              onChange={(event) => {
                setSchoolQuery(event.target.value);
                setSelectedSchool(null);
                setGradeSlug("");
                setSchoolTouched(true);
                setSchoolOpen(true);
                clearFieldError("school");
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") setSchoolOpen(false);
              }}
            />
            {errors.school ? (
              <p id="school-error" className={styles.fieldError}>
                {errors.school}
              </p>
            ) : null}
            {schoolOpen ? (
              <div
                className={styles.schoolResults}
                id="order-school-results"
                role="listbox"
              >
                {schoolLoading ? (
                  <p className={styles.schoolEmpty}>Searching schools...</p>
                ) : null}
                {!schoolLoading && schoolResults.length
                  ? schoolResults.map((result) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedSchool?.slug === result.slug}
                        className={styles.schoolResult}
                        key={result.id}
                        onClick={() => selectSchool(result)}
                      >
                        <strong>{result.name}</strong>
                        <span>
                          {result.city}, {result.province}
                        </span>
                      </button>
                    ))
                  : null}
                {!schoolLoading && !schoolResults.length ? (
                  <p className={styles.schoolEmpty}>
                    No matching schools found. You can also{" "}
                    <Link href="/schools" target="_blank" rel="noopener noreferrer">browse schools</Link>.
                  </p>
                ) : null}
              </div>
            ) : null}
            {schoolError ? (
              <p className={styles.fieldError} role="alert">
                {schoolError}
              </p>
            ) : null}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="order-grade-select">Grade</label>
            <p id="grade-helper">Choose the grade pack you want to order.</p>
            <select
              id="order-grade-select"
              name="orderGrade"
              value={gradeSlug}
              aria-describedby={`grade-helper${errors.grade ? " grade-error" : ""}`}
              aria-invalid={Boolean(errors.grade)}
              onChange={(event) => {
                setGradeSlug(event.target.value);
                clearFieldError("grade");
              }}
            >
              <option value="">Choose a grade</option>
              {selectedSchool?.grades.map((grade) => (
                <option value={grade.gradeSlug} key={grade.id}>
                  {grade.grade}
                </option>
              ))}
            </select>
            {errors.grade ? (
              <p id="grade-error" className={styles.fieldError}>
                {errors.grade}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className={styles.packReviewCard}>
        <div>
          <p className={styles.confirmKicker}>Your pack</p>
          <h3>{selectedPackTitle}</h3>
          <p>
            {reviewReady
              ? `${packKind} for ${schoolName ?? "selected school"}${gradeName ? `, ${gradeName}` : ""}.`
              : "Select your school and grade to prepare the pack summary."}
          </p>
        </div>
        {draftStatus ? (
          <p className={styles.formStatusError} role="alert">
            {draftStatus}
          </p>
        ) : null}
        <div className={styles.packFacts}>
          <span>{packKind}</span>
          <span>
            {itemCount
              ? `${itemCount} selected items`
              : "Items confirm after selection"}
          </span>
          <span>
            {typeof estimatedTotal === "number"
              ? formatCurrency(estimatedTotal)
              : "Total to be confirmed"}
          </span>
        </div>
        {selectedPackItems.length ? (
          <ul className={styles.itemPreview}>
            {selectedPackItems.slice(0, 8).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyPreview}>
            Pack items will appear here once the grade is selected.
          </p>
        )}
        {selectedPackItems.length > 8 ? (
          <p className={styles.moreItems}>
            +{selectedPackItems.length - 8} more items included
          </p>
        ) : null}
        <Link
          className={styles.inlineAction}
          target="_blank"
          rel="noopener noreferrer"
          href={
            customiseHref ??
            (selectedSchool
              ? `/schools/${selectedSchool.slug}/${gradeSlug}#grade-actions`
              : "/schools")
          }
        >
          Customise pack
        </Link>
      </div>

      {isMultiSchoolPack && gradePexcovers && setGradePexcovers ? (
        <div className={styles.addonCard}>
          <div>
            <p className={styles.confirmKicker}>Optional add-on per grade</p>
            <h3>Pexcover book covering</h3>
            <p>
              Select which grades get covered and labelled exercise books.{" "}
              <Link
                href="/blog/what-is-pexcover-book-covering"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.inlineAction}
                style={{ display: "inline", fontSize: "inherit" }}
              >
                Read more
              </Link>
            </p>
          </div>
          <div className={styles.gradePexcoverList}>
            {gradePexcovers.map((entry, index) => (
              <div key={entry.gradeLabel} className={styles.gradePexcoverRow}>
                <label className={styles.addonCheckbox}>
                  <input
                    type="checkbox"
                    checked={entry.selected}
                    onChange={() => {
                      const next = gradePexcovers.map((e, i) =>
                        i === index ? { ...e, selected: !e.selected } : e,
                      );
                      setGradePexcovers(next);
                    }}
                  />
                  <span>
                    {entry.gradeLabel} &middot;{" "}
                    {formatCurrency(PEXCOVER_PRICE)}
                  </span>
                </label>
                {entry.selected ? (
                  <input
                    className={styles.pexcoverChildInput}
                    type="text"
                    placeholder="Child name for labels (optional)"
                    value={entry.childName}
                    onChange={(e) => {
                      const next = gradePexcovers.map((g, i) =>
                        i === index
                          ? { ...g, childName: e.target.value }
                          : g,
                      );
                      setGradePexcovers(next);
                    }}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className={`${styles.addonCard} ${
            hasPexcover ? styles.addonCardActive : ""
          }`}
        >
          <div>
            <p className={styles.confirmKicker}>Optional add-on</p>
            <h3>Pexcover book covering</h3>
            <p>
              Add covered and labelled exercise books to help the pack arrive
              ready for the first school day.{" "}
              <Link
                href="/blog/what-is-pexcover-book-covering"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.inlineAction}
                style={{ display: "inline", fontSize: "inherit" }}
              >
                Read more
              </Link>
            </p>
            <p
              style={{
                margin: "6px 0 0 0",
                fontSize: "12px",
                color: "var(--pex-text-muted)",
                lineHeight: 1.45,
              }}
            >
              Pexcover applies to exercise books included in the selected school
              pack.
            </p>
          </div>
          <label className={styles.addonCheckbox}>
            <input
              type="checkbox"
              checked={hasPexcover}
              onChange={(event) => setHasPexcover(event.target.checked)}
            />
            <span>Add Pexcover for {formatCurrency(PEXCOVER_PRICE)}</span>
          </label>
          {hasPexcover ? (
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label htmlFor="pexcover-name">Learner name for labels</label>
                <input
                  id="pexcover-name"
                  value={pexcoverName}
                  placeholder="Optional"
                  onChange={(event) => setPexcoverName(event.target.value)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label htmlFor="pexcover-format">Label format</label>
                <select
                  id="pexcover-format"
                  value={pexcoverLabelFormat}
                  onChange={(event) => setPexcoverLabelFormat(event.target.value)}
                >
                  <option>First Name + Surname</option>
                  <option>First Name + Initial</option>
                  <option>Initials + Surname</option>
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <label htmlFor="pexcover-subjects">Subject names optional</label>
                <input
                  id="pexcover-subjects"
                  value={pexcoverSubjects}
                  placeholder="English, Maths, Life Skills"
                  onChange={(event) => setPexcoverSubjects(event.target.value)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label htmlFor="pexcover-notes">Special notes optional</label>
                <input
                  id="pexcover-notes"
                  value={pexcoverNotes}
                  placeholder="Any covering instructions?"
                  onChange={(event) => setPexcoverNotes(event.target.value)}
                />
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
