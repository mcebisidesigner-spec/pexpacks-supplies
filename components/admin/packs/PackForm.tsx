"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import clsx from "clsx";
import type { PackFormState, PackSchool } from "@/lib/admin/packs";
import { ArticlePackCard } from "@/components/packs/ArticlePackCard";
import type { PackListItem } from "@/components/packs/packListTypes";
import { formatCurrency } from "@/lib/formatCurrency";
import formStyles from "../schools/SchoolForm.module.css";
import styles from "./PackForm.module.css";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={formStyles.saveButton} disabled={pending}>
      {pending ? "Creating…" : label}
    </button>
  );
}

function displayGrade(raw: string): string {
  const cleaned = raw.trim();
  if (!cleaned) return "Grade";
  if (/^r$/i.test(cleaned)) return "Grade R";
  if (/^\d+$/.test(cleaned)) return `Grade ${cleaned}`;
  return cleaned;
}

interface SchoolPickerProps {
  schools: PackSchool[];
  value: string;
  onChange: (id: string) => void;
  error?: string;
}

function SchoolPicker({ schools, value, onChange, error }: SchoolPickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = schools.find((school) => school.id === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return schools;
    return schools.filter((school) => school.name.toLowerCase().includes(q));
  }, [schools, query]);

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

  const inputValue = open ? query : (selected?.name ?? "");

  return (
    <div className={styles.picker} ref={wrapperRef}>
      <input
        type="text"
        id="school_picker"
        className={formStyles.input}
        placeholder="Search or select a school…"
        value={inputValue}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={(e) => {
          setOpen(true);
          e.currentTarget.select();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        role="combobox"
        aria-expanded={open}
        aria-controls="school-picker-listbox"
        aria-autocomplete="list"
        autoComplete="off"
      />
      <input type="hidden" name="school_id" value={value} />
      {open ? (
        <div
          id="school-picker-listbox"
          className={styles.pickerMenu}
          role="listbox"
        >
          {filtered.length ? (
            filtered.map((school) => (
              <button
                key={school.id}
                type="button"
                role="option"
                aria-selected={school.id === value}
                className={clsx(
                  styles.pickerOption,
                  school.id === value && styles.pickerOptionSelected
                )}
                onClick={() => {
                  onChange(school.id);
                  setQuery("");
                  setOpen(false);
                }}
              >
                {school.name}
              </button>
            ))
          ) : (
            <p className={styles.pickerEmpty}>
              No schools match &ldquo;{query.trim()}&rdquo;.
            </p>
          )}
        </div>
      ) : null}
      {error ? (
        <span className={formStyles.error} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

interface PackFormProps {
  schools: PackSchool[];
  action: (prev: PackFormState, formData: FormData) => Promise<PackFormState>;
}

export function PackForm({ schools, action }: PackFormProps) {
  const [state, formAction] = useActionState<PackFormState, FormData>(action, {
    ok: false,
  });
  const [schoolId, setSchoolId] = useState("");
  const [grade, setGrade] = useState("");

  const selectedSchool = schools.find((school) => school.id === schoolId) ?? null;
  const previewGrade = displayGrade(grade);
  const previewItems: PackListItem[] = [];

  const err = (field: string) =>
    state?.errors?.[field] ? (
      <span className={formStyles.error} role="alert">
        {state.errors[field]}
      </span>
    ) : null;

  return (
    <form action={formAction} className={formStyles.form}>
      {state?.ok ? (
        <p className={formStyles.success} role="status">
          {state.message}
        </p>
      ) : state?.message ? (
        <p className={formStyles.error} role="alert">
          {state.message}
        </p>
      ) : null}

      <div className={formStyles.section}>
        <h2 className={formStyles.sectionTitle}>Pack details</h2>

        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="school_picker">
            Which school *
          </label>
          <SchoolPicker
            schools={schools}
            value={schoolId}
            onChange={setSchoolId}
            error={state?.errors?.school_id}
          />
          {err("school_id")}
        </div>

        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="grade">
            Grade *
          </label>
          <input
            id="grade"
            name="grade"
            className={formStyles.input}
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="e.g. Grade 10, 10 or R"
            required
          />
          <span className={formStyles.hint}>
            The grade shown on the pack card, e.g. Grade 10.
          </span>
          {err("grade")}
        </div>

        <div className={formStyles.checkboxes}>
          <label className={formStyles.checkbox}>
            <input type="checkbox" name="visible" defaultChecked />
            Visible on site
          </label>
          <label className={formStyles.checkbox}>
            <input type="checkbox" name="featured" />
            Featured pack
          </label>
        </div>
      </div>

      <div className={formStyles.section}>
        <h2 className={formStyles.sectionTitle}>Preview — public pack card</h2>
        <p className={formStyles.hint}>
          This is how the pack appears on the school page. The card and its list
          are populated automatically by the web app — only the school, grade and
          price drive what it shows.
        </p>
        {selectedSchool ? (
          <p className={styles.previewSchool}>{selectedSchool.name}</p>
        ) : null}
        <div className={styles.previewCard}>
          <ArticlePackCard
            gradeLabel={previewGrade}
            bestFor={`Best for ${previewGrade} learners`}
            title={`${previewGrade} Stationery Pack`}
            description="Prepared according to the official school list."
            priceLabel={`From ${formatCurrency(0)}`}
            items={previewItems}
            viewCompleteAriaLabel="Preview complete stationery list"
            onViewCompleteList={() => {}}
            actions={<span className={styles.previewAction}>Preview</span>}
          />
        </div>
        {selectedSchool && grade.trim() ? (
          <p className={styles.previewTitle}>
            Will be created as &ldquo;{selectedSchool.name} {grade.trim()} Pack&rdquo;.
          </p>
        ) : null}
      </div>

      <div className={formStyles.actions}>
        <Link href="/admin/packs" className={formStyles.cancelButton}>
          Cancel
        </Link>
        <SubmitButton label="Create pack" />
      </div>
    </form>
  );
}
