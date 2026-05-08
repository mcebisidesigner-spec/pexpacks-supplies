"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useId, useState } from "react";
import { allGrades, schools } from "@/data/schools";
import { getGradeBySearchValue, resolveSchoolSearch } from "@/lib/school-utils";
import styles from "./Marketing.module.css";

export function HeroSearch() {
  const router = useRouter();
  const errorId = useId();
  const modalTitleId = useId();
  const modalDescriptionId = useId();
  const [schoolName, setSchoolName] = useState("");
  const [grade, setGrade] = useState("");
  const [error, setError] = useState<ReactNode>("");
  const [showMissingSchoolDialog, setShowMissingSchoolDialog] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedSchoolName = schoolName.trim();
    const selectedGrade = grade.trim();

    setShowMissingSchoolDialog(false);

    if (!trimmedSchoolName && !selectedGrade) {
      setError(
        "Please enter your school name and select a grade before finding your pack.",
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

    const { school, ambiguous } = resolveSchoolSearch(trimmedSchoolName);

    if (ambiguous) {
      setError(
        "Please enter the full school name so we can find the correct pack.",
      );
      return;
    }

    if (!school) {
      setError("");
      setShowMissingSchoolDialog(true);
      return;
    }

    const gradePack = getGradeBySearchValue(school, selectedGrade);

    if (!gradePack) {
      setError(
        <>
          We do not have a {selectedGrade} pack listed for {school.name} yet.{" "}
          <Link
            href="/standard-school-packs"
            className={styles.inlineTextLink}>
            Explore our standard packs
          </Link>{" "}
          or{" "}
          <Link href="/contact" className={styles.inlineTextLink}>
            contact us
          </Link>
          .
        </>,
      );
      return;
    }

    setError("");
    router.push(`/schools/${school.slug}/${gradePack.gradeSlug}`);
  }

  return (
    <form
      className={styles.heroSearch}
      onSubmit={handleSubmit}
      role="search"
      noValidate>
      <label className={styles.field}>
        <span>Find your school</span>
        <input
          name="q"
          type="search"
          placeholder="e.g. Parktown Primary"
          autoComplete="organization"
          list="school-options"
          value={schoolName}
          onChange={(event) => setSchoolName(event.target.value)}
          aria-describedby={error ? errorId : undefined}
        />
      </label>
      <label className={styles.field}>
        <span>Select grade</span>
        <select
          name="grade"
          value={grade}
          onChange={(event) => setGrade(event.target.value)}
          aria-describedby={error ? errorId : undefined}>
          <option value="" disabled>
            Choose grade
          </option>
          {allGrades.map((grade) => (
            <option value={grade} key={grade}>
              {grade}
            </option>
          ))}
        </select>
      </label>
      <button className={styles.searchButton} type="submit">
        Find My Pack
      </button>
      {error ?
        <p className={styles.searchError} id={errorId} role="alert">
          {error}
        </p>
      : null}
      <datalist id="school-options">
        {schools.map((school) => (
          <option value={school.name} key={school.id} />
        ))}
      </datalist>
      {showMissingSchoolDialog ?
        <div className={styles.modalOverlay} role="presentation">
          <div
            className={styles.modalCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
            aria-describedby={modalDescriptionId}>
            <h2 id={modalTitleId}>School not found</h2>
            <p id={modalDescriptionId}>
              Your school is not in our database. Would you like to add your
              school?
            </p>
            <div className={styles.modalActions}>
              <Link
                className={styles.modalPrimaryAction}
                href="/add-your-school">
                Yes
              </Link>
              <Link className={styles.modalSecondaryAction} href="/contact">
                Contact Us
              </Link>
              <button
                className={styles.modalDismiss}
                type="button"
                onClick={() => setShowMissingSchoolDialog(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      : null}
    </form>
  );
}
