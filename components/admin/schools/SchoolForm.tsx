"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Building2, GraduationCap, Image as ImageIcon, Save, ShieldCheck } from "lucide-react";
import type { SchoolFormState, SchoolRow } from "@/lib/admin/schools";
import { SCHOOL_STATUSES } from "@/lib/admin/school-constants";
import { SchoolLogoPlaceholder } from "@/components/schools/SchoolLogoPlaceholder";
import { DateField } from "@/components/admin/DateField";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { FloatingTextarea } from "@/components/ui/FloatingTextarea";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { Field, FieldLabel, FieldError, FormRow } from "@/components/admin/ui/Form";
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

export function SchoolForm({ school, action }: SchoolFormProps) {
  const [state, formAction] = useActionState<SchoolFormState, FormData>(
    action,
    { ok: false }
  );

  const [logoPreview, setLogoPreview] = useState<string | null>(
    school?.logo ?? null
  );
  const [logoValue, setLogoValue] = useState<string>(school?.logo ?? "");

  const grades = Array.isArray(school?.grades)
    ? school.grades.filter((g): g is string => typeof g === "string").join(", ")
    : "";

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

      <div className={formStyles.mainColumn}>
        {/* Banner Alert Messages */}
        {state?.ok ? (
          <div className={`${adminStyles.badgeGreen} ${adminStyles.p12} ${adminStyles.text13} ${adminStyles.block}`} role="status">
            &#x2713; {state.message || "School updated successfully."}
          </div>
        ) : state?.message ? (
          <div className={`${adminStyles.badgeRed} ${adminStyles.p12} ${adminStyles.text13} ${adminStyles.block} ${adminStyles.cRed}`} role="alert">
            &#x26A0; {state.message}
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
                label="Principal / Headmaster"
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
          </div>
        </div>

        {/* Section 2: School Profile & Search Pill */}
        <div className={formStyles.card}>
          <div className={formStyles.cardHeader}>
            <div className={adminStyles.sectionIconBlue}>
              <GraduationCap size={16} />
            </div>
            <span>School Profile &amp; Search Pill Configuration</span>
          </div>

          <div className={formStyles.grid3}>
            <div className={formStyles.colSpan3}>
              <FloatingTextarea
                id="description"
                name="description"
                label="Description &amp; Overview"
                defaultValue={str(school?.description)}
                error={state?.errors?.description}
              />
            </div>

            <div className={formStyles.colSpan2}>
              <FloatingInput
                id="grades"
                name="grades"
                label="Offered Grades"
                defaultValue={grades}
                error={state?.errors?.grades}
              />
            </div>

            <div className={formStyles.colSpan1}>
              <FloatingInput
                id="custom_badge"
                name="custom_badge"
                label="Search Pill Badge"
                defaultValue={str(school?.custom_badge) || "2026 Packs"}
                error={state?.errors?.custom_badge}
              />
            </div>

            <div className={formStyles.colSpan1}>
              <FloatingInput
                id="lowest_price"
                name="lowest_price"
                inputMode="decimal"
                label="Lowest Pack Price (R)"
                defaultValue={str(school?.lowest_price)}
                error={state?.errors?.lowest_price}
              />
            </div>

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

            <div className={formStyles.colSpan1}>
              <FloatingInput
                id="latitude"
                name="latitude"
                inputMode="decimal"
                label="Latitude"
                defaultValue={str(school?.latitude)}
                error={state?.errors?.latitude}
              />
            </div>

            <div className={formStyles.colSpan1}>
              <FloatingInput
                id="longitude"
                name="longitude"
                inputMode="decimal"
                label="Longitude"
                defaultValue={str(school?.longitude)}
                error={state?.errors?.longitude}
              />
            </div>
          </div>
        </div>

        {/* Section 3: School Logo */}
        <div className={formStyles.card}>
          <div className={formStyles.cardHeader}>
            <ImageIcon size={16} className={adminStyles.iconAmber} />
            <span>School Logo Branding</span>
          </div>

            <FormRow className={formStyles.logoUploadContainer}>
              <div className={adminStyles.logoUploadBox}>
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="School logo preview" className={adminStyles.logoPreviewImg} />
                ) : (
                  <SchoolLogoPlaceholder width={110} height={110} />
                )}
                <input
                  type="file"
                  name="logo_file"
                  accept="image/png,image/webp,image/svg+xml,image/jpeg"
                  className={adminStyles.logoFileInput}
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

              <div className={`${adminStyles.flex} ${adminStyles["flex-col"]} ${adminStyles["gap-6"]} ${adminStyles.text12}`}>
                <p className={`${adminStyles.cWhite} ${adminStyles.fw600}`}>Upload School Emblem / Logo</p>
                <p className={`${adminStyles.cSubtle} ${styles.text11}`}>PNG, WebP, SVG or JPG (max 10 MB). Auto-fallback placeholder used if empty.</p>
                {logoPreview ? (
                  <AdminButton
                    type="button"
                    variant="ghost"
                    onClick={() => { setLogoPreview(null); setLogoValue(""); }}
                    className={formStyles.removeLogoBtn}
                  >
                    Remove logo
                  </AdminButton>
                ) : null}
              </div>
            </FormRow>
        </div>
      </div>

      {/* Right Sidebar: Status & Form Action Controls */}
      <div className={formStyles.sideColumn}>
        <div className={formStyles.card}>
          <div className={formStyles.cardHeader}>
            <div className={adminStyles.sectionIconTeal}>
              <ShieldCheck size={16} />
            </div>
            <span>Status &amp; Flags</span>
          </div>

          <div className={formStyles.sideGroup}>
            <div className={formStyles.sideField}>
              <label className={formStyles.sideLabel} htmlFor="status">Publication Status</label>
              <select id="status" name="status" defaultValue={school?.status ?? "active"} className={formStyles.sideSelect}>
                {SCHOOL_STATUSES.map((s) => (
                  <option key={s} value={s}>{s === "archived" ? "Hidden" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              {err("status")}
            </div>

            <div className={formStyles.sideField}>
              <label className={formStyles.sideLabel} htmlFor="parent_collection_accepted">Parent Collection Option</label>
              <select id="parent_collection_accepted" name="parent_collection_accepted" defaultValue={school?.parent_collection_accepted ? "accepted" : "non_accepted"} className={formStyles.sideSelect}>
                <option value="accepted">Accepted (Bulk Pickup)</option>
                <option value="non_accepted">Non-accepted</option>
              </select>
              {err("parent_collection_accepted")}
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
                className={adminStyles.hFullBtn}
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