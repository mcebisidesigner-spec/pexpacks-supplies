"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import type { SchoolFormState, SchoolRow } from "@/lib/admin/schools";
import { SCHOOL_STATUSES } from "@/lib/admin/school-constants";
import { SchoolLogoPlaceholder } from "@/components/schools/SchoolLogoPlaceholder";
import styles from "./SchoolForm.module.css";

interface SchoolFormProps {
  school: SchoolRow | null;
  action: (prev: SchoolFormState, formData: FormData) => Promise<SchoolFormState>;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.saveButton} disabled={pending}>
      {pending ? "Saving…" : label}
    </button>
  );
}

function str(v: string | number | null | undefined): string {
  return v == null ? "" : String(v);
}

export function SchoolForm({ school, action }: SchoolFormProps) {
  const [state, formAction] = useActionState<SchoolFormState, FormData>(action, {
    ok: false,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(
    school?.logo ?? null
  );
  const [logoValue, setLogoValue] = useState<string>(school?.logo ?? "");

  const grades = Array.isArray(school?.grades)
    ? school.grades.filter((g): g is string => typeof g === "string").join(", ")
    : "";

  const err = (field: string) =>
    state?.errors?.[field] ? (
      <span className={styles.error} role="alert">
        {state.errors[field]}
      </span>
    ) : null;

  return (
    <form action={formAction} className={styles.form}>
      {state?.ok ? (
        <p className={styles.success} role="status">
          {state.message}
        </p>
      ) : state?.message ? (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      ) : null}

      <input type="hidden" name="logo" value={logoValue} />

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Identity</h2>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              School name *
            </label>
            <input
              id="name"
              name="name"
              className={styles.input}
              defaultValue={school?.name ?? ""}
              placeholder="e.g. Sunnyvale Primary School"
              required
            />
            {err("name")}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="slug">
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              className={styles.input}
              defaultValue={str(school?.slug)}
              placeholder="auto-generated from name"
            />
            <span className={styles.hint}>
              Used in public URLs. Leave blank to auto-generate.
            </span>
            {err("slug")}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="city">
              City / Town
            </label>
            <input
              id="city"
              name="city"
              className={styles.input}
              defaultValue={str(school?.city)}
            />
            {err("city")}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="province">
              Province
            </label>
            <input
              id="province"
              name="province"
              className={styles.input}
              defaultValue={str(school?.province)}
            />
            {err("province")}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="district">
              District
            </label>
            <input
              id="district"
              name="district"
              className={styles.input}
              defaultValue={str(school?.district)}
            />
            {err("district")}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="address">
              Physical address
            </label>
            <input
              id="address"
              name="address"
              className={styles.input}
              defaultValue={str(school?.address)}
            />
            {err("address")}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={styles.input}
              defaultValue={str(school?.email)}
            />
            {err("email")}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="telephone">
              Telephone
            </label>
            <input
              id="telephone"
              name="telephone"
              className={styles.input}
              defaultValue={str(school?.telephone)}
            />
            {err("telephone")}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="principal">
              Principal
            </label>
            <input
              id="principal"
              name="principal"
              className={styles.input}
              defaultValue={str(school?.principal)}
            />
            {err("principal")}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="parent_collection_accepted">
              Parent collection
            </label>
            <select
              id="parent_collection_accepted"
              name="parent_collection_accepted"
              className={styles.input}
              defaultValue={school?.parent_collection_accepted ? "accepted" : "non_accepted"}
            >
              <option value="accepted">Accepted</option>
              <option value="non_accepted">Non-accepted</option>
            </select>
            {err("parent_collection_accepted")}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>School profile</h2>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className={styles.textarea}
            rows={4}
            defaultValue={str(school?.description)}
          />
          {err("description")}
        </div>

        <div className={styles.grid}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="grades">
              Grades
            </label>
            <input
              id="grades"
              name="grades"
              className={styles.input}
              defaultValue={grades}
              placeholder="Grade R, Grade 1, Grade 2"
            />
            <span className={styles.hint}>Comma-separated grade names.</span>
            {err("grades")}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="custom_badge">
              Search Pill Badge
            </label>
            <input
              id="custom_badge"
              name="custom_badge"
              className={styles.input}
              defaultValue={str(school?.custom_badge) || "2026 Packs"}
              placeholder="e.g. 2026 Packs"
            />
            <span className={styles.hint}>Custom badge pill shown on search card (e.g. 2026 Packs).</span>
            {err("custom_badge")}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="lowest_price">
              Lowest pack price (R)
            </label>
            <input
              id="lowest_price"
              name="lowest_price"
              className={styles.input}
              inputMode="decimal"
              defaultValue={str(school?.lowest_price)}
              placeholder="e.g. 245.00"
            />
            {err("lowest_price")}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="partner_since">
              Partner since
            </label>
            <input
              id="partner_since"
              name="partner_since"
              type="date"
              className={styles.input}
              defaultValue={str(school?.partner_since)}
            />
            {err("partner_since")}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="latitude">
              Latitude
            </label>
            <input
              id="latitude"
              name="latitude"
              className={styles.input}
              inputMode="decimal"
              defaultValue={str(school?.latitude)}
            />
            {err("latitude")}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="longitude">
              Longitude
            </label>
            <input
              id="longitude"
              name="longitude"
              className={styles.input}
              inputMode="decimal"
              defaultValue={str(school?.longitude)}
            />
            {err("longitude")}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              className={styles.input}
              defaultValue={school?.status ?? "active"}
            >
              {SCHOOL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "archived" ? "hidden" : s}
                </option>
              ))}
            </select>
            {err("status")}
          </div>
        </div>

        <div className={styles.checkboxes}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              name="published"
              defaultChecked={school?.published ?? true}
            />
            Published on site
          </label>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              name="is_partner"
              defaultChecked={school?.is_partner ?? false}
            />
            Partner school
          </label>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              name="is_featured"
              defaultChecked={school?.is_featured ?? false}
            />
            Featured
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Logo</h2>
        <div className={styles.logoRow}>
          <label className={styles.logoBox}>
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoPreview}
                alt="School logo preview"
                className={styles.logoPreview}
              />
            ) : (
              <SchoolLogoPlaceholder
                className={styles.logoPreview}
                width={120}
                height={120}
              />
            )}
            <input
              type="file"
              name="logo_file"
              accept="image/png,image/webp,image/svg+xml,image/jpeg"
              className={styles.fileInput}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  setLogoPreview(url);
                  setLogoValue("");
                }
              }}
            />
          </label>
          <div className={styles.logoHint}>
            <p>PNG, WebP, SVG or JPG — max 10 MB.</p>
            <p>
              No logo? The default placeholder is used automatically until you
              upload one.
            </p>
            {logoPreview ? (
              <button
                type="button"
                className={styles.removeLogo}
                onClick={() => {
                  setLogoPreview(null);
                  setLogoValue("");
                }}
              >
                Remove logo
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Link href="/admin/schools" className={styles.cancelButton}>
          Cancel
        </Link>
        <SubmitButton label={school ? "Save changes" : "Create school"} />
      </div>
    </form>
  );
}
