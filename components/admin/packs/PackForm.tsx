"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import type { PackFormState, PackSchool } from "@/lib/admin/packs";
import { ArticlePackCard } from "@/components/packs/ArticlePackCard";
import type { PackListItem } from "@/components/packs/packListTypes";
import GradePackItemSelector, {
  type PackLine,
} from "@/components/grade-packs/GradePackItemSelector";
import { formatCurrency } from "@/lib/formatCurrency";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "./PackForm.module.css";
import { DbNotice } from "@/components/admin/ui/DbNotice";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <AdminButton
      type="submit"
      variant="primary"
      size="md"
      loading={pending}
      icon={<Save size={14} />}
    >
      {label}
    </AdminButton>
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
        className={adminStyles.inputField}
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
                className={`${styles.pickerOption}${school.id === value ? ` ${styles.pickerOptionSelected}` : ""}`}
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
        <span className={adminStyles.error} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

interface PackFormProps {
  schools: PackSchool[];
  defaultSchoolId?: string;
  action: (prev: PackFormState, formData: FormData) => Promise<PackFormState>;
}

export function PackForm({
  schools,
  defaultSchoolId = "",
  action,
}: PackFormProps) {
  const [state, formAction] = useActionState<PackFormState, FormData>(action, {
    ok: false,
  });
  const [schoolId, setSchoolId] = useState(defaultSchoolId);
  const [grade, setGrade] = useState("");
  const itemsRef = useRef<PackLine[]>([]);
  const itemsInputRef = useRef<HTMLInputElement>(null);

  const selectedSchool =
    schools.find((school) => school.id === schoolId) ?? null;
  const previewGrade = displayGrade(grade);
  const previewItems: PackListItem[] = [];

  function handleItemsChange(lines: PackLine[]) {
    itemsRef.current = lines;
  }

  function handleSubmit() {
    if (itemsInputRef.current) {
      itemsInputRef.current.value = JSON.stringify(itemsRef.current);
    }
  }

  const err = (field: string) =>
    state?.errors?.[field] ? (
      <span className={adminStyles.error} role="alert">
        {state.errors[field]}
      </span>
    ) : null;

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className={adminStyles.formStack}
    >
      <input
        type="hidden"
        name="items"
        ref={itemsInputRef}
        defaultValue="[]"
        aria-hidden="true"
      />
      {state?.ok ? (
        <DbNotice
          type="success"
          message={state.message || "Pack saved successfully."}
        />
      ) : state?.message ? (
        <DbNotice type="error" message={state.message} />
      ) : null}

      <div className={adminStyles.sidebarCard}>
        <div className={adminStyles.sidebarCardHeader}>
          <span className={adminStyles.sidebarHeaderTitle}>Pack details</span>
        </div>

        <div className={adminStyles.formField}>
          <label className={adminStyles.formLabel} htmlFor="school_picker">
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

        <div className={adminStyles.formField}>
          <label className={adminStyles.formLabel} htmlFor="grade">
            Grade *
          </label>
          <input
            id="grade"
            name="grade"
            className={adminStyles.inputField}
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="e.g. Grade 10, 10 or R"
            required
          />
          <span className={adminStyles.mutedText}>
            The grade shown on the pack card, e.g. Grade 10.
          </span>
          {err("grade")}
        </div>

        <div className={adminStyles.formField}>
          <label className={adminStyles.formLabel}>
            <input
              type="checkbox"
              name="visible"
              defaultChecked
              className={adminStyles.checkbox}
            />
            Visible on site
          </label>
          <label className={adminStyles.formLabel}>
            <input
              type="checkbox"
              name="featured"
              className={adminStyles.checkbox}
            />
            Featured pack
          </label>
        </div>
      </div>

      <div className={adminStyles.sidebarCard}>
        <div className={adminStyles.sidebarCardHeader}>
          <span className={adminStyles.sidebarHeaderTitle}>
            Preview — public pack card
          </span>
        </div>
        <p className={adminStyles.mutedText}>
          This is how the pack appears on the school page. The card and its list
          are populated automatically by the web app — only the school, grade
          and price drive what it shows.
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
            Will be created as &ldquo;{selectedSchool.name} {grade.trim()}{" "}
            Pack&rdquo;.
          </p>
        ) : null}
      </div>

      <div className={adminStyles.sidebarCard}>
        <div className={adminStyles.sidebarCardHeader}>
          <span className={adminStyles.sidebarHeaderTitle}>
            Items (optional)
          </span>
        </div>
        <p className={adminStyles.mutedText}>
          Search the stationery inventory to add items to this pack now. The
          pack price is set from their total and can be adjusted afterwards. You
          can also add, edit or import items after the pack is created.
        </p>
        <GradePackItemSelector
          initialItems={[]}
          showSave={false}
          onItemsChange={handleItemsChange}
          onSave={() => {}}
        />
        {err("items")}
      </div>

      <div className={adminStyles.stackRow}>
        <AdminButton
          type="button"
          variant="secondary"
          size="md"
          href="/admin/packs"
        >
          Cancel
        </AdminButton>
        <SubmitButton label="Create pack" />
      </div>
    </form>
  );
}
