"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import type { PackFormState, PackRow, TemplatePack } from "@/lib/admin/packs";
import { PACK_DELIVERY_TYPES } from "@/lib/admin/pack-constants";
import styles from "../schools/SchoolForm.module.css";

interface PackFormProps {
  pack: PackRow | null;
  schools: { id: string; name: string }[];
  templatePacks?: TemplatePack[];
  action: (prev: PackFormState, formData: FormData) => Promise<PackFormState>;
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

export function PackForm({ pack, schools, templatePacks, action }: PackFormProps) {
  const [state, formAction] = useActionState<PackFormState, FormData>(action, {
    ok: false,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(
    pack?.pack_image ?? null
  );
  const [imageValue, setImageValue] = useState<string>(pack?.pack_image ?? "");
  const [templatePackId, setTemplatePackId] = useState<string>("");

  const academicYearRef = useRef<HTMLInputElement | null>(null);
  const deliveryTypeRef = useRef<HTMLSelectElement | null>(null);
  const priceRef = useRef<HTMLInputElement | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  const err = (field: string) =>
    state?.errors?.[field] ? (
      <span className={styles.error} role="alert">
        {state.errors[field]}
      </span>
    ) : null;

  const selectedTemplate =
    templatePacks?.find((t) => t.id === templatePackId) ?? null;

  function handleTemplateChange(packId: string) {
    setTemplatePackId(packId);
    const template = templatePacks?.find((t) => t.id === packId);
    if (!template) return;
    if (academicYearRef.current) {
      academicYearRef.current.value = str(template.academic_year);
    }
    if (deliveryTypeRef.current) {
      deliveryTypeRef.current.value = template.delivery_type ?? "School collection";
    }
    if (priceRef.current) {
      priceRef.current.value = str(template.price);
    }
    if (descriptionRef.current) {
      descriptionRef.current.value = template.description ?? "";
    }
  }

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

      <input type="hidden" name="pack_image" value={imageValue} />
      <input type="hidden" name="copy_from_pack_id" value={templatePackId} />

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Pack details</h2>

        {templatePacks && templatePacks.length > 0 ? (
          <div className={styles.field}>
            <label className={styles.label} htmlFor="template_pack">
              Copy layout &amp; items from an existing pack
            </label>
            <select
              id="template_pack"
              className={styles.input}
              value={templatePackId}
              onChange={(e) => handleTemplateChange(e.target.value)}
            >
              <option value="">Start with an empty pack</option>
              {templatePacks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                  {t.school_name ? ` — ${t.school_name}` : ""}
                </option>
              ))}
            </select>
            <span className={styles.hint}>
              The new pack adopts the selected pack&apos;s layout and copies its
              items as a starting point.
            </span>
            {selectedTemplate ? (
              <span className={styles.hint}>
                Template selected. It pre-fills academic year, delivery type,
                price and description. You can still change these, and you only
                need to pick the school for the new pack.
              </span>
            ) : null}
          </div>
        ) : null}

        <div className={styles.grid}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="title">
              Title *
            </label>
            <input
              id="title"
              name="title"
              className={styles.input}
              defaultValue={pack?.title ?? ""}
              placeholder="e.g. Grade 1 Stationery Pack"
              required
            />
            {err("title")}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="slug">
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              className={styles.input}
              defaultValue={str(pack?.slug)}
              placeholder="auto-generated from title"
            />
            <span className={styles.hint}>
              Used in public URLs. Leave blank to auto-generate.
            </span>
            {err("slug")}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="school_id">
              School
            </label>
            <select
              id="school_id"
              name="school_id"
              className={styles.input}
              defaultValue={str(pack?.school_id)}
            >
              <option value="">No school</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
            {err("school_id")}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="academic_year">
              Academic year
            </label>
            <input
              id="academic_year"
              name="academic_year"
              className={styles.input}
              defaultValue={str(pack?.academic_year)}
              placeholder="e.g. 2026"
              ref={academicYearRef}
            />
            {err("academic_year")}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="delivery_type">
              Delivery type
            </label>
            <select
              id="delivery_type"
              name="delivery_type"
              className={styles.input}
              defaultValue={pack?.delivery_type ?? "School collection"}
              ref={deliveryTypeRef}
            >
              {PACK_DELIVERY_TYPES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {err("delivery_type")}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="price">
              Price (R)
            </label>
            <input
              id="price"
              name="price"
              className={styles.input}
              inputMode="decimal"
              defaultValue={str(pack?.price)}
              placeholder="0.00"
              ref={priceRef}
            />
            {err("price")}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="stock">
              Stock
            </label>
            <input
              id="stock"
              name="stock"
              className={styles.input}
              inputMode="numeric"
              defaultValue={str(pack?.stock)}
              placeholder="0"
            />
            {err("stock")}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="sort_order">
              Sort order
            </label>
            <input
              id="sort_order"
              name="sort_order"
              className={styles.input}
              inputMode="numeric"
              defaultValue={str(pack?.sort_order)}
              placeholder="0"
            />
            <span className={styles.hint}>
              Lower numbers show first on the school page. Leave 0 on a new pack
              to auto-assign the next number.
            </span>
            {err("sort_order")}
          </div>
        </div>

        <div className={styles.checkboxes}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              name="visible"
              defaultChecked={pack?.visible ?? false}
            />
            Visible on site
          </label>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              name="featured"
              defaultChecked={pack?.featured ?? false}
            />
            Featured pack
          </label>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className={styles.textarea}
            rows={4}
            defaultValue={str(pack?.description)}
            ref={descriptionRef}
          />
          {err("description")}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Pack image</h2>
        <div className={styles.logoRow}>
          <label className={styles.logoBox}>
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreview}
                alt="Pack image preview"
                className={styles.logoPreview}
              />
            ) : (
              <span className={styles.logoPlaceholder}>No image</span>
            )}
            <input
              type="file"
              name="pack_image_file"
              accept="image/png,image/webp,image/svg+xml,image/jpeg"
              className={styles.fileInput}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  setImagePreview(url);
                  setImageValue("");
                }
              }}
            />
          </label>
          <div className={styles.logoHint}>
            <p>PNG, WebP, SVG or JPG — max 10 MB.</p>
            {imagePreview ? (
              <button
                type="button"
                className={styles.removeLogo}
                onClick={() => {
                  setImagePreview(null);
                  setImageValue("");
                }}
              >
                Remove image
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Link href="/admin/packs" className={styles.cancelButton}>
          Cancel
        </Link>
        <SubmitButton label={pack ? "Save changes" : "Create pack"} />
      </div>
    </form>
  );
}
