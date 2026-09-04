"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  Building2,
  Image as ImageIcon,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import type { SchoolFormState, SchoolRow } from "@/lib/admin/schools";
import { WarningBannerModal } from "@/components/admin/ui/WarningBannerModal";
import { AdminDropdown } from "@/components/admin/ui/AdminDropdown";
// Redundant legacy checkboxes and statuses removed; authoritative constants imported from school-constants
import { SchoolLogoPlaceholder } from "@/components/schools/SchoolLogoPlaceholder";
import { DEFAULT_PACKS_BADGE } from "@/lib/public-data/seasons";
import { DateField } from "@/components/admin/DateField";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { FieldError } from "@/components/admin/ui/Form";
import { StickyFormBar } from "@/components/admin/ui/StickyFormBar";
import adminStyles from "@/app/admin/admin.module.css";
import formStyles from "./SchoolForm.module.css";
import { DbNotice } from "@/components/admin/ui/DbNotice";

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
      icon={<GraduationCap size={14} />}
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

type GradePreset = "high" | "primary" | "combined" | "custom";

const GRADE_PRESETS = {
  high: ["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
  primary: [
    "Grade R",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
  ],
  combined: ALL_GRADES,
};

function detectInitialPreset(existingGrades: string[]): GradePreset {
  if (!existingGrades || existingGrades.length === 0) return "high";
  const set = new Set(existingGrades);
  const isHigh =
    GRADE_PRESETS.high.every((g) => set.has(g)) &&
    existingGrades.length === GRADE_PRESETS.high.length;
  if (isHigh) return "high";
  const isPrimary =
    GRADE_PRESETS.primary.every((g) => set.has(g)) &&
    existingGrades.length === GRADE_PRESETS.primary.length;
  if (isPrimary) return "primary";
  const isCombined =
    GRADE_PRESETS.combined.every((g) => set.has(g)) &&
    existingGrades.length === GRADE_PRESETS.combined.length;
  if (isCombined) return "combined";
  return "custom";
}

export function SchoolForm({ school, action }: SchoolFormProps) {
  const [state, formAction] = useActionState<SchoolFormState, FormData>(
    action,
    { ok: false },
  );

  const [logoPreview, setLogoPreview] = useState<string | null>(
    school?.logo ?? null,
  );
  const [logoValue, setLogoValue] = useState<string>(school?.logo ?? "");

  const initialPartnership =
    (school as { partnership?: string } | null)?.partnership ??
    ((school as { refused_partnership?: boolean } | null)?.refused_partnership
      ? "refused_partner"
      : school?.is_partner
        ? "partner"
        : "non_partner");
  const [currentPartnership, setCurrentPartnership] =
    useState(initialPartnership);
  const [currentPublication, setCurrentPublication] = useState(
    school?.publication_status === "ready_for_review"
      ? "ready_for_review"
      : "published",
  );
  const [currentFeature, setCurrentFeature] = useState(
    (school as { feature_status?: string } | null)?.feature_status ??
      (school?.is_featured ? "featured" : "unfeatured"),
  );
  const [currentCollection, setCurrentCollection] = useState(
    school?.parent_collection_accepted !== false ? "accepted" : "unaccepted",
  );
  const [showRefusedModal, setShowRefusedModal] = useState(false);

  const initialGradesList = Array.isArray(school?.grades)
    ? (school.grades.filter(
        (g): g is string => typeof g === "string",
      ) as string[])
    : GRADE_PRESETS.high;

  const [selectedGrades, setSelectedGrades] = useState<string[]>(
    initialGradesList.length > 0 ? initialGradesList : GRADE_PRESETS.high,
  );
  const [gradePreset, setGradePreset] = useState<GradePreset>(() =>
    detectInitialPreset(initialGradesList),
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
        : [...prev, grade].sort(
            (a, b) => ALL_GRADES.indexOf(a) - ALL_GRADES.indexOf(b),
          ),
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
    <form ref={formRef} action={formAction} className={adminStyles.stack}>
      <input type="hidden" name="logo" value={logoValue} />

      {/* Banner Alert Messages */}
      {state?.ok ? (
        <DbNotice
          type="success"
          message={state.message || "School updated successfully."}
        />
      ) : state?.message ? (
        <DbNotice type="error" message={state.message} />
      ) : null}

      {/* Two-Column Detail Layout */}
      <div className={adminStyles.detailLayout}>
        {/* ---- LEFT COLUMN ---- */}
        <div className={adminStyles.leftColumn}>
          {/* Section 1: Identity & Location */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Building2 size={16} className={adminStyles.iconTeal} />
                <span>School Identity &amp; Primary Details</span>
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel} htmlFor="name">
                  School Name <span className={adminStyles.muted}>*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  className={adminStyles.inputField}
                  defaultValue={school?.name ?? ""}
                  placeholder="e.g. Example Primary School"
                  required
                />
                {err("name")}
              </div>
            </div>

            <div className={adminStyles.grid2equal}>
              <div>
                <label className={adminStyles.formLabel} htmlFor="slug">
                  URL Slug / Identifier
                </label>
                <input
                  id="slug"
                  name="slug"
                  className={adminStyles.inputField}
                  defaultValue={str(school?.slug)}
                  placeholder="e.g. example-primary-school"
                />
                {err("slug")}
              </div>
              <div>
                <label className={adminStyles.formLabel} htmlFor="city">
                  City / Town
                </label>
                <input
                  id="city"
                  name="city"
                  className={adminStyles.inputField}
                  defaultValue={str(school?.city)}
                  placeholder="e.g. Cape Town"
                />
                {err("city")}
              </div>
            </div>

            <div className={adminStyles.grid2equal}>
              <div>
                <label className={adminStyles.formLabel} htmlFor="province">
                  Province
                </label>
                <input
                  id="province"
                  name="province"
                  className={adminStyles.inputField}
                  defaultValue={str(school?.province)}
                  placeholder="e.g. Western Cape"
                />
                {err("province")}
              </div>
              <div>
                <label className={adminStyles.formLabel} htmlFor="district">
                  District
                </label>
                <input
                  id="district"
                  name="district"
                  className={adminStyles.inputField}
                  defaultValue={str(school?.district)}
                  placeholder="e.g. Metro Central Education District"
                />
                {err("district")}
              </div>
            </div>

            <div className={adminStyles.grid2equal}>
              <div>
                <label className={adminStyles.formLabel} htmlFor="email">
                  Contact Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={adminStyles.inputField}
                  defaultValue={str(school?.email)}
                  placeholder="admin@example.co.za"
                />
                {err("email")}
              </div>
              <div>
                <label className={adminStyles.formLabel} htmlFor="telephone">
                  Telephone
                </label>
                <input
                  id="telephone"
                  name="telephone"
                  className={adminStyles.inputField}
                  defaultValue={str(school?.telephone)}
                  placeholder="+27 21 000 0000"
                />
                {err("telephone")}
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel} htmlFor="principal">
                  School Official Website
                </label>
                <input
                  id="principal"
                  name="principal"
                  className={adminStyles.inputField}
                  defaultValue={str(school?.principal)}
                  placeholder="https://www.example.co.za"
                />
                {err("principal")}
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel} htmlFor="address">
                  Physical Address
                </label>
                <input
                  id="address"
                  name="address"
                  className={adminStyles.inputField}
                  defaultValue={str(school?.address)}
                  placeholder="1 School Road, Suburb, City, 0000"
                />
                {err("address")}
              </div>
            </div>

            {/* Offered Grades */}
            <div className={adminStyles.formField}>
              <div>
                <label
                  className={adminStyles.formLabel}
                  htmlFor="school_type_preset"
                >
                  Offered Grades
                </label>
                <div className={formStyles.floatingSelectWrapper}>
                  <div className={formStyles.floatingSelectContainer}>
                    <select
                      id="school_type_preset"
                      value={gradePreset}
                      onChange={(e) =>
                        handlePresetChange(e.target.value as GradePreset)
                      }
                      className={adminStyles.selectField}
                    >
                      <option value="high">High School (Grade 8–12)</option>
                      <option value="primary">
                        Primary School (Grade R–7)
                      </option>
                      <option value="combined">
                        Combined School (Grade R–12)
                      </option>
                      <option value="custom">Custom (Select Grades)</option>
                    </select>
                  </div>
                  <input
                    type="hidden"
                    name="grades"
                    value={selectedGrades.join(", ")}
                  />
                  {err("grades")}
                </div>
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel} htmlFor="custom_badge">
                  Search Pill Badge
                </label>
                <input
                  id="custom_badge"
                  name="custom_badge"
                  className={adminStyles.inputField}
                  defaultValue={
                    str(school?.custom_badge) || DEFAULT_PACKS_BADGE
                  }
                  placeholder="e.g. Top 10 high school"
                />
                {err("custom_badge")}
              </div>
            </div>

            {gradePreset === "custom" && (
              <div className={adminStyles.formField}>
                <div>
                  <span className={adminStyles.formLabel}>
                    Select Individual Offered Grades (Grade R – 12):
                  </span>
                  <div className={formStyles.gradesChipsGrid}>
                    {ALL_GRADES.map((g) => {
                      const isChecked = selectedGrades.includes(g);
                      return (
                        <label
                          key={g}
                          className={`${formStyles.gradeChip} ${
                            isChecked ? formStyles.gradeChipActive : ""
                          }`}
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
          </div>

          {/* Section: School Logo Branding */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <ImageIcon size={16} className={adminStyles.iconAmber} />
                <span>School Logo Branding</span>
              </div>
            </div>

            <div className={formStyles.logoUploadContainer}>
              <div className={formStyles.logoUploadBox}>
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoPreview}
                    alt="School logo preview"
                    className={formStyles.logoPreviewImg}
                  />
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
                <p className={`${adminStyles.cWhite} ${adminStyles.fw600}`}>
                  Upload School Emblem / Logo
                </p>
                <p className={`${adminStyles.cSubtle} ${adminStyles.muted}`}>
                  PNG, WebP, SVG or JPG (max 10 MB). Auto-fallback placeholder
                  used if empty.
                </p>
                {logoPreview ? (
                  <button
                    type="button"
                    onClick={() => {
                      setLogoPreview(null);
                      setLogoValue("");
                    }}
                    className={formStyles.removeLogoBtn}
                  >
                    Remove logo
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* ---- RIGHT / SIDEBAR COLUMN ---- */}
        <aside className={adminStyles.sidebarColumn}>
          {/* Section: Public & Partnership */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <ShieldCheck size={16} className={adminStyles.iconTeal} />
                <span>Public &amp; Partnership</span>
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label
                  className={adminStyles.formLabel}
                  htmlFor="publication_status"
                >
                  Publication Status
                </label>
                <AdminDropdown
                  id="publication_status"
                  name="publication_status"
                  value={currentPublication}
                  onChange={setCurrentPublication}
                  options={[
                    {
                      value: "published",
                      label: "Published — Live Storefront",
                    },
                    {
                      value: "ready_for_review",
                      label: "Ready for Review — Unpublished",
                    },
                  ]}
                />
                {err("publication_status")}
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel} htmlFor="partnership">
                  Partnership
                </label>
                <AdminDropdown
                  id="partnership"
                  name="partnership"
                  value={currentPartnership}
                  onChange={(next) => {
                    setCurrentPartnership(next);
                    if (next === "refused_partner") {
                      setShowRefusedModal(true);
                    }
                  }}
                  options={[
                    { value: "partner", label: "Partner" },
                    { value: "non_partner", label: "Non-partner" },
                    {
                      value: "refused_partner",
                      label: "Refused Partnership",
                    },
                  ]}
                />
                {err("partnership")}
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label
                  className={adminStyles.formLabel}
                  htmlFor="feature_status"
                >
                  Feature Status
                </label>
                <AdminDropdown
                  id="feature_status"
                  name="feature_status"
                  value={currentFeature}
                  onChange={setCurrentFeature}
                  options={[
                    { value: "featured", label: "Featured" },
                    { value: "unfeatured", label: "Unfeatured" },
                  ]}
                />
                {err("feature_status")}
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label
                  className={adminStyles.formLabel}
                  htmlFor="parent_collection_accepted"
                >
                  Parent Collection Option
                </label>
                <AdminDropdown
                  id="parent_collection_accepted"
                  name="parent_collection_accepted"
                  value={currentCollection}
                  onChange={setCurrentCollection}
                  options={[
                    { value: "accepted", label: "Accepted — Bulk Pickup" },
                    { value: "unaccepted", label: "Unaccepted" },
                  ]}
                />
                {err("parent_collection_accepted")}
              </div>
            </div>

            {currentPartnership === "partner" ? (
              <div className={adminStyles.formField}>
                <div>
                  <label
                    className={adminStyles.formLabel}
                    htmlFor="partner_since"
                  >
                    Partner Since Date
                  </label>
                  <DateField
                    id="partner_since"
                    name="partner_since"
                    defaultValue={str(school?.partner_since)}
                    ariaLabel="Partner since"
                    placeholder="Select partnership date"
                  />
                  {err("partner_since")}
                </div>
              </div>
            ) : (
              <input
                type="hidden"
                name="partner_since"
                value={str(school?.partner_since)}
              />
            )}

            <div className={formStyles.sideActions}>
              <SubmitButton
                label={school ? "Save School Details" : "Create School"}
              />
              <AdminButton
                variant="secondary"
                href={
                  schoolSlugOrId
                    ? `/admin/schools/${schoolSlugOrId}/info`
                    : "/admin/schools"
                }
              >
                Cancel
              </AdminButton>
            </div>
          </div>

          {/* Section: Contact Summary */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <MapPin size={16} className={adminStyles.iconBlue} />
                <span>Contact Snapshot</span>
              </div>
            </div>
            <div className={adminStyles.stack}>
              <div className={adminStyles.stackRow}>
                <Mail size={14} className={adminStyles.iconTeal} />
                <span className={adminStyles.cSubtle}>
                  {str(school?.email) || "—"}
                </span>
              </div>
              <div className={adminStyles.stackRow}>
                <Phone size={14} className={adminStyles.iconTeal} />
                <span className={adminStyles.cSubtle}>
                  {str(school?.telephone) || "—"}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <SaveBar isDirty={isDirty} onSave={saveForm} onDiscard={discardChanges} />

      <WarningBannerModal
        isOpen={showRefusedModal}
        schoolName={school?.name || "This school"}
        onConfirm={() => setShowRefusedModal(false)}
        onCancel={() => {
          setCurrentPartnership("non_partner");
          setShowRefusedModal(false);
        }}
      />
    </form>
  );
}
