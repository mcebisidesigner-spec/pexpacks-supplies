"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Building2, ChevronDown, Image as ImageIcon, Save, ShieldCheck } from "lucide-react";
import type { SchoolFormState, SchoolRow } from "@/lib/admin/schools";
import { SchoolLogoPlaceholder } from "@/components/schools/SchoolLogoPlaceholder";
import { DEFAULT_PACKS_BADGE } from "@/lib/public-data/seasons";
import { DateField } from "@/components/admin/DateField";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { Field, FieldLabel, FieldError } from "@/components/admin/ui/Form";
import { StickyFormBar } from "@/components/admin/ui/StickyFormBar";
import styles from "@/components/admin/views/CorePagesView.module.css";
import adminStyles from "@/app/admin/admin.module.css";
import formStyles from "./SchoolForm.module.css";

interface SchoolFormProps {
  school: SchoolRow | null;
  action: (
    prev: SchoolFormState,
    formData: FormData,
  ) => Promise<SchoolFormState>;
}

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

function SaveBar({
  isDirty,
  onSave,
  onDiscard,
}: {
  isDirty: boolean;
  onSave: () => void;
  onDiscard: () => void;
}) {
  const { pending } = useFormStatus();
  return (
    <StickyFormBar
      isDirty={isDirty}
      onSave={onSave}
      onDiscard={onDiscard}
      saving={pending}
    />
  );
}

function str(v: string | number | null | undefined): string {
  return v == null ? "" : String(v);
}

const ALL_GRADES = [
  "Grade R", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
  "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"
];

type GradePreset = "high" | "primary" | "combined" | "custom";

const GRADE_PRESETS = {
  high: ["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
  primary: ["Grade R", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"],
  combined: ALL_GRADES,
};

function detectInitialPreset(existingGrades: string[]): GradePreset {
  if (!existingGrades || existingGrades.length === 0) return "high";
  const set = new Set(existingGrades);
  const isHigh = GRADE_PRESETS.high.every((g) => set.has(g)) && existingGrades.length === GRADE_PRESETS.high.length;
  if (isHigh) return "high";
  const isPrimary = GRADE_PRESETS.primary.every((g) => set.has(g)) && existingGrades.length === GRADE_PRESETS.primary.length;
  if (isPrimary) return "primary";
  const isCombined = GRADE_PRESETS.combined.every((g) => set.has(g)) && existingGrades.length === GRADE_PRESETS.combined.length;
  if (isCombined) return "combined";
  return "custom";
}

export function SchoolForm({ school, action }: SchoolFormProps) {
  const [state, formAction] = useActionState<SchoolFormState, FormData>(
    action,
    { ok: false }
  );

  const [logoPreview, setLogoPreview] = useState<string | null>(
    school?.logo ?? null
  );
  const [logoValue, setLogoValue] = useState<string>(school?.logo ?? "");

  const initialGradesList = Array.isArray(school?.grades)
    ? (school.grades.filter((g): g is string => typeof g === "string") as string[])
    : GRADE_PRESETS.high;

  const [selectedGrades, setSelectedGrades] = useState<string[]>(
    initialGradesList.length > 0 ? initialGradesList : GRADE_PRESETS.high
  );
  const [gradePreset, setGradePreset] = useState<GradePreset>(
    () => detectInitialPreset(initialGradesList)
  );

  const handlePresetChange = (preset: GradePreset) => {
    setGradePreset(preset);
    if (preset === "high") setSelectedGrades(GRADE_PRESETS.high);
    else if (preset === "primary") setSelectedGrades(GRADE_PRESETS.primary);
    else if (preset === "combined") setSelectedGrades(GRADE_PRESETS.combined);
  };

  const handleToggleGrade = (grade: string) => {
    setGradePreset("custom");
    setSelectedGrades((prev) =>
      prev.includes(grade)
        ? prev.filter((g) => g !== grade)
        : [...prev, grade].sort((a, b) => ALL_GRADES.indexOf(a) - ALL_GRADES.indexOf(b))
    );
  };

  const err = (field: string) =>
    state?.errors?.[field] ? (
      <FieldError role="alert">{state.errors[field]}</FieldError>
    ) : null;

  const schoolSlugOrId = school?.slug || school?.id || "";

  const formRef = useRef<HTMLFormElement>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const markDirty = () => setIsDirty(true);
    const clearDirty = () => setIsDirty(false);

    form.addEventListener("input", markDirty);
    form.addEventListener("change", markDirty);
    form.addEventListener("submit", clearDirty);
    form.addEventListener("reset", clearDirty);

    return () => {
      form.removeEventListener("input", markDirty);
      form.removeEventListener("change", markDirty);
      form.removeEventListener("submit", clearDirty);
      form.removeEventListener("reset", clearDirty);
    };
  }, []);

  const saveForm = () => {
    formRef.current?.requestSubmit();
  };

  const discardChanges = () => {
    formRef.current?.reset();
    setIsDirty(false);
  };

  return (
    <form ref={formRef} action={formAction} className={formStyles.formLayout}>
      <input type="hidden" name="logo" value={logoValue} />

      {/* Banner Alert Messages */}
      {state?.ok ? (
        <div className={`${adminStyles.badgeGreen} ${adminStyles.p12} ${adminStyles.text13} ${adminStyles.block}`} role="status">
          ✓ {state.message || "School updated successfully."}
        </div>
      ) : state?.message ? (
        <div className={`${adminStyles.badgeRed} ${adminStyles.p12} ${adminStyles.text13} ${adminStyles.block} ${adminStyles.cRed}`} role="alert">
          ⚠ {state.message}
        </div>
      ) : null}

      {/* Section 1: Identity & Location */}
      <div className={formStyles.card}>
          <div className={formStyles.cardHeader}>
            <div className={adminStyles.sectionIconTeal}>
              <Building2 size={16} />
            </div>
            <span>School Identity &amp; Primary Details</span>
          </div>

          <div className={formStyles.grid3}>
            <div className={formStyles.colSpan2}>
              <FloatingInput
                id="name"
                name="name"
                label="School Name"
                defaultValue={school?.name ?? ""}
                required
                error={state?.errors?.name}
              />
            </div>

            <div className={formStyles.colSpan1}>
              <FloatingInput
                id="slug"
                name="slug"
                label="URL Slug / Identifier"
                defaultValue={str(school?.slug)}
                error={state?.errors?.slug}
              />
            </div>

            <div className={formStyles.colSpan1}>
              <FloatingInput
                id="city"
                name="city"
                label="City / Town"
                defaultValue={str(school?.city)}
                error={state?.errors?.city}
              />
            </div>

            <div className={formStyles.colSpan1}>
              <FloatingInput
                id="province"
                name="province"
                label="Province"
                defaultValue={str(school?.province)}
                error={state?.errors?.province}
              />
            </div>

            <div className={formStyles.colSpan1}>
              <FloatingInput
                id="district"
                name="district"
                label="District"
                defaultValue={str(school?.district)}
                error={state?.errors?.district}
              />
            </div>

            <div className={formStyles.colSpan1}>
              <FloatingInput
                id="email"
                name="email"
                type="email"
                label="Contact Email"
                defaultValue={str(school?.email)}
                error={state?.errors?.email}
              />
            </div>

            <div className={formStyles.colSpan1}>
              <FloatingInput
                id="telephone"
                name="telephone"
                label="Telephone"
                defaultValue={str(school?.telephone)}
                error={state?.errors?.telephone}
              />
            </div>

            <div className={formStyles.colSpan1}>
              <FloatingInput
                id="principal"
                name="principal"
                label="School Official Website"
                defaultValue={str(school?.principal)}
                error={state?.errors?.principal}
              />
            </div>

            <div className={formStyles.colSpan3}>
              <FloatingInput
                id="address"
                name="address"
                label="Physical Address"
                defaultValue={str(school?.address)}
                error={state?.errors?.address}
              />
            </div>
            <div className={formStyles.colSpan2}>
              <div className={formStyles.floatingSelectWrapper}>
                <div className={formStyles.floatingSelectContainer}>
                  <select
                    id="school_type_preset"
                    value={gradePreset}
                    onChange={(e) => handlePresetChange(e.target.value as GradePreset)}
                    className={formStyles.floatingSelect}
                  >
                    <option value="high">High School (Grade 8–12)</option>
                    <option value="primary">Primary School (Grade R–7)</option>
                    <option value="combined">Combined School (Grade R–12)</option>
                    <option value="custom">Custom (Select Grades)</option>
                  </select>
                  <label htmlFor="school_type_preset" className={formStyles.floatingSelectLabel}>
                    Offered Grades
                  </label>
                  <span className={formStyles.floatingSelectArrow}>
                    <ChevronDown size={14} />
                  </span>
                </div>
                <input type="hidden" name="grades" value={selectedGrades.join(", ")} />
                {err("grades")}
              </div>
            </div>

            <div className={formStyles.colSpan1}>
              <FloatingInput
                id="custom_badge"
                name="custom_badge"
                label="Search Pill Badge"
                defaultValue={str(school?.custom_badge) || DEFAULT_PACKS_BADGE}
                error={state?.errors?.custom_badge}
              />
            </div>

            {gradePreset === "custom" && (
              <div className={formStyles.colSpan3}>
                <div className={formStyles.customGradesBox}>
                  <span className={formStyles.customGradesTitle}>
                    Select Individual Offered Grades (Grade R – 12):
                  </span>
                  <div className={formStyles.gradesChipsGrid}>
                    {ALL_GRADES.map((g) => {
                      const isChecked = selectedGrades.includes(g);
                      return (
                        <label
                          key={g}
                          className={`${formStyles.gradeChip} ${isChecked ? formStyles.gradeChipActive : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleGrade(g)}
                            className={formStyles.gradeChipCheckbox}
                          />
                          <span>{g}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className={formStyles.colSpan1}>
              <Field>
                <FieldLabel htmlFor="partner_since">Partner Since Date</FieldLabel>
                <DateField
                  id="partner_since"
                  name="partner_since"
                  defaultValue={str(school?.partner_since)}
                  ariaLabel="Partner since"
                  placeholder="Select partnership date"
                />
                {err("partner_since")}
              </Field>
            </div>
          </div>
        </div>

      {/* Bottom Horizontal Row (Desktop: Side-by-Side, Mobile: Stacked) */}
      <div className={formStyles.bottomRow}>
        {/* Section 3: School Logo Branding (Left Card) */}
        <div className={formStyles.card}>
          <div className={formStyles.cardHeader}>
            <ImageIcon size={16} className={adminStyles.iconAmber} />
            <span>School Logo Branding</span>
          </div>

          <div className={formStyles.logoUploadContainer}>
            <div className={formStyles.logoUploadBox}>
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview} alt="School logo preview" className={formStyles.logoPreviewImg} />
              ) : (
                <SchoolLogoPlaceholder width={80} height={80} />
              )}
              <input
                type="file"
                name="logo_file"
                accept="image/png,image/webp,image/svg+xml,image/jpeg"
                className={formStyles.logoFileInput}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setLogoPreview(url);
                    setLogoValue("");
                  }
                }}
              />
            </div>

            <div className={formStyles.logoInfoGroup}>
              <p className={`${adminStyles.cWhite} ${adminStyles.fw600}`}>Upload School Emblem / Logo</p>
              <p className={`${adminStyles.cSubtle} ${styles.text11}`}>PNG, WebP, SVG or JPG (max 10 MB). Auto-fallback placeholder used if empty.</p>
              {logoPreview ? (
                <button
                  type="button"
                  onClick={() => { setLogoPreview(null); setLogoValue(""); }}
                  className={formStyles.removeLogoBtn}
                >
                  Remove logo
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Section 4: Status & Flags (Right Card) */}
        <div className={formStyles.card}>
          <div className={formStyles.cardHeader}>
            <div className={adminStyles.sectionIconTeal}>
              <ShieldCheck size={16} />
            </div>
            <span>Status &amp; Flags</span>
</div>

          <div className={formStyles.sideGroup}>
            <div className={formStyles.sideFieldsRow}>
              <div className={formStyles.sideField}>
                <label className={formStyles.sideLabel} htmlFor="parent_collection_accepted">Parent Collection Option</label>
                <select id="parent_collection_accepted" name="parent_collection_accepted" defaultValue={school?.parent_collection_accepted ? "accepted" : "non_accepted"} className={formStyles.sideSelect}>
                  <option value="accepted">Accepted (Bulk Pickup)</option>
                  <option value="non_accepted">Non-accepted</option>
                </select>
                {err("parent_collection_accepted")}
              </div>
            </div>

            <div className={formStyles.checkboxList}>
              <label className={formStyles.checkboxLabel}>
                <input type="checkbox" name="published" defaultChecked={school?.published ?? true} className={adminStyles.checkbox} />
                Published on Site
              </label>
              <label className={formStyles.checkboxLabel}>
                <input type="checkbox" name="is_partner" defaultChecked={school?.is_partner ?? false} className={adminStyles.checkbox} />
                Partner School
              </label>
              <label className={formStyles.checkboxLabel}>
                <input type="checkbox" name="is_featured" defaultChecked={school?.is_featured ?? false} className={adminStyles.checkbox} />
                Featured School
              </label>
              <label className={`${formStyles.checkboxLabel} ${formStyles.checkboxDanger}`}>
                <input type="checkbox" name="refused_partnership" defaultChecked={(school as { refused_partnership?: boolean } | null)?.refused_partnership ?? false} className={adminStyles.checkboxRed} />
                Refused Partnership
              </label>
            </div>

            <div className={formStyles.sideActions}>
              <SubmitButton label={school ? "Save School Details" : "Create School"} />
              <AdminButton
                variant="secondary"
                href={schoolSlugOrId ? `/admin/schools/${schoolSlugOrId}/info` : "/admin/schools"}
              >
                Cancel
              </AdminButton>
            </div>
          </div>
        </div>
      </div>

      <SaveBar isDirty={isDirty} onSave={saveForm} onDiscard={discardChanges} />
    </form>
  );
}