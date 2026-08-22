"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import {
  Building2,
  GraduationCap,
  Image as ImageIcon,
  Save,
  ShieldCheck,
} from "lucide-react";
import type { SchoolFormState, SchoolRow } from "@/lib/admin/schools";
import { SCHOOL_STATUSES } from "@/lib/admin/school-constants";
import { SchoolLogoPlaceholder } from "@/components/schools/SchoolLogoPlaceholder";
import { DateField } from "@/components/admin/DateField";
import styles from "@/components/admin/views/CorePagesView.module.css";

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
    <button
      type="submit"
      className={`${styles.primaryBtn} ${styles.hFullBtn}`}
      disabled={pending}
    >
      <Save size={14} /> {pending ? "Saving..." : label}
    </button>
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
  const [logoPreview, setLogoPreview] = useState<string | null>(school?.logo ?? null);
  const [logoValue, setLogoValue] = useState<string>(school?.logo ?? "");

  const grades = Array.isArray(school?.grades)
    ? school.grades.filter((g): g is string => typeof g === "string").join(", ")
    : "";

  const err = (field: string) =>
    state?.errors?.[field] ? (
      <span className={`${styles.text11} ${styles.cRed} ${styles.mt4} ${styles.block}`} role="alert">
        {state.errors[field]}
      </span>
    ) : null;

  const schoolSlugOrId = school?.slug || school?.id || "";

  return (
    <form action={formAction} className={styles.detailLayout}>
      <input type="hidden" name="logo" value={logoValue} />

      <div className={`${styles.flex} ${styles["flex-col"]} ${styles["gap-18"]}`}>
        {/* Banner Alert Messages */}
        {state?.ok ? (
          <div className={`${styles.badgeGreen} ${styles.p12} ${styles.text13} ${styles.block}`} role="status">
            &#x2713; {state.message || "School updated successfully."}
          </div>
        ) : state?.message ? (
          <div className={`${styles.badgeRed} ${styles.p12} ${styles.text13} ${styles.block} ${styles.cRed}`} style={{ background: "rgba(239, 68, 68, 0.15)" }} role="alert">
            &#x26A0; {state.message}
          </div>
        ) : null}

        {/* Section 1: Identity & Location */}
        <div className={styles.sidebarCard}>
          <div className={styles.sidebarCardHeader}>
            <div className={styles.sidebarHeaderTitle}>
              <div className={styles.sectionIconTeal}>
                <Building2 size={16} />
              </div>
              <span className={`${styles.text15} ${styles.fw700} ${styles.cWhite}`}>
                School Identity &amp; Primary Details
              </span>
            </div>
          </div>

          <div className={styles.grid2equal}>
            <div>
              <label className={styles.formLabel} htmlFor="name">School Name *</label>
              <input id="name" name="name" defaultValue={school?.name ?? ""} placeholder="e.g. Sunnyvale Primary School" required className={styles.inputField} />
              {err("name")}
            </div>

            <div>
              <label className={styles.formLabel} htmlFor="slug">URL Slug / Identifier</label>
              <input id="slug" name="slug" defaultValue={str(school?.slug)} placeholder="auto-generated from name" className={styles.inputField} />
              <span className={`${styles.text11} ${styles.cSubtle} ${styles.mt4} ${styles.block}`}>Used in public URLs. Leave blank to auto-generate.</span>
              {err("slug")}
            </div>

            <div>
              <label className={styles.formLabel} htmlFor="city">City / Town</label>
              <input id="city" name="city" defaultValue={str(school?.city)} placeholder="e.g. Pretoria" className={styles.inputField} />
              {err("city")}
            </div>

            <div>
              <label className={styles.formLabel} htmlFor="province">Province</label>
              <input id="province" name="province" defaultValue={str(school?.province)} placeholder="e.g. Gauteng" className={styles.inputField} />
              {err("province")}
            </div>

            <div>
              <label className={styles.formLabel} htmlFor="district">District</label>
              <input id="district" name="district" defaultValue={str(school?.district)} placeholder="e.g. Tshwane South" className={styles.inputField} />
              {err("district")}
            </div>

            <div>
              <label className={styles.formLabel} htmlFor="email">Contact Email</label>
              <input id="email" name="email" type="email" defaultValue={str(school?.email)} placeholder="admin@school.co.za" className={styles.inputField} />
              {err("email")}
            </div>

            <div>
              <label className={styles.formLabel} htmlFor="telephone">Telephone</label>
              <input id="telephone" name="telephone" defaultValue={str(school?.telephone)} placeholder="+27 12 000 0000" className={styles.inputField} />
              {err("telephone")}
            </div>

            <div>
              <label className={styles.formLabel} htmlFor="principal">Principal / Headmaster</label>
              <input id="principal" name="principal" defaultValue={str(school?.principal)} placeholder="e.g. Dr. A. Smith" className={styles.inputField} />
              {err("principal")}
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label className={styles.formLabel} htmlFor="address">Physical Address</label>
              <input id="address" name="address" defaultValue={str(school?.address)} placeholder="e.g. 45 School Road, Centurion" className={styles.inputField} />
              {err("address")}
            </div>
          </div>
        </div>

        {/* Section 2: School Profile & Search Pill */}
        <div className={styles.sidebarCard}>
          <div className={styles.sidebarCardHeader}>
            <div className={styles.sidebarHeaderTitle}>
              <div className={styles.sectionIconBlue}>
                <GraduationCap size={16} />
              </div>
              <span className={`${styles.text15} ${styles.fw700} ${styles.cWhite}`}>
                School Profile &amp; Search Pill Configuration
              </span>
            </div>
          </div>

          <div className={`${styles.flex} ${styles["flex-col"]} ${styles["gap-14"]}`}>
            <div>
              <label className={styles.formLabel} htmlFor="description">Description &amp; Overview</label>
              <textarea id="description" name="description" rows={3} defaultValue={str(school?.description)} placeholder="Brief introduction for parents searching school stationery packs..." className={`${styles.textareaField} ${styles.textareaFieldMd}`} />
              {err("description")}
            </div>

            <div className={styles.grid2equal}>
              <div>
                <label className={styles.formLabel} htmlFor="grades">Offered Grades</label>
                <input id="grades" name="grades" defaultValue={grades} placeholder="Grade R, Grade 1, Grade 2" className={styles.inputField} />
                <span className={`${styles.text11} ${styles.cSubtle} ${styles.mt4} ${styles.block}`}>Comma-separated grade names.</span>
                {err("grades")}
              </div>

              <div>
                <label className={styles.formLabel} htmlFor="custom_badge">Search Pill Badge</label>
                <input id="custom_badge" name="custom_badge" defaultValue={str(school?.custom_badge) || "2026 Packs"} placeholder="e.g. 2026 Packs" className={styles.inputField} />
                <span className={`${styles.text11} ${styles.cSubtle} ${styles.mt4} ${styles.block}`}>Badge shown on search cards (e.g. 2026 Packs).</span>
                {err("custom_badge")}
              </div>

              <div>
                <label className={styles.formLabel} htmlFor="lowest_price">Lowest Pack Price (R)</label>
                <input id="lowest_price" name="lowest_price" inputMode="decimal" defaultValue={str(school?.lowest_price)} placeholder="e.g. 245.00" className={styles.inputField} />
                {err("lowest_price")}
              </div>

              <div>
                <label className={styles.formLabel} htmlFor="partner_since">Partner Since Date</label>
                <DateField id="partner_since" name="partner_since" className={styles.searchInput} defaultValue={str(school?.partner_since)} ariaLabel="Partner since" placeholder="Select partnership date" />
                {err("partner_since")}
              </div>

              <div>
                <label className={styles.formLabel} htmlFor="latitude">Latitude</label>
                <input id="latitude" name="latitude" inputMode="decimal" defaultValue={str(school?.latitude)} placeholder="e.g. -25.7479" className={styles.inputField} />
                {err("latitude")}
              </div>

              <div>
                <label className={styles.formLabel} htmlFor="longitude">Longitude</label>
                <input id="longitude" name="longitude" inputMode="decimal" defaultValue={str(school?.longitude)} placeholder="e.g. 28.2293" className={styles.inputField} />
                {err("longitude")}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: School Logo */}
        <div className={styles.sidebarCard}>
          <div className={styles.sidebarCardHeader}>
            <div className={styles.sidebarHeaderTitle}>
              <ImageIcon size={16} className={styles.iconAmber} />
              <span>School Logo Branding</span>
            </div>
          </div>

          <div className={`${styles.flex} ${styles["gap-16"]} ${styles.itemsCenter}`}>
            <div className={styles.logoUploadBox}>
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview} alt="School logo preview" className={styles.logoPreviewImg} />
              ) : (
                <SchoolLogoPlaceholder width={110} height={110} />
              )}
              <input
                type="file"
                name="logo_file"
                accept="image/png,image/webp,image/svg+xml,image/jpeg"
                className={styles.logoFileInput}
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

            <div className={`${styles.flex} ${styles["flex-col"]} ${styles["gap-6"]} ${styles.text12}`}>
              <p className={`${styles.cWhite} ${styles.fw600}`}>Upload School Emblem / Logo</p>
              <p className={`${styles.cSubtle} ${styles.text11}`}>PNG, WebP, SVG or JPG (max 10 MB). Auto-fallback placeholder used if empty.</p>
              {logoPreview ? (
                <button
                  type="button"
                  className={`${styles.text11} ${styles.fw700} ${styles.cRed} ${styles.underline} ${styles.mt6}`}
                  style={{ alignSelf: "flex-start", background: "none", border: "none", padding: 0, cursor: "pointer" }}
                  onClick={() => { setLogoPreview(null); setLogoValue(""); }}
                >
                  Remove logo
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Status & Form Action Controls */}
      <div className={styles.sidebarColumn}>
        <div className={styles.sidebarCard}>
          <div className={styles.sidebarCardHeader}>
            <div className={styles.sidebarHeaderTitle}>
              <div className={styles.sectionIconTeal}>
                <ShieldCheck size={16} />
              </div>
              <span className={`${styles.text15} ${styles.fw700} ${styles.cWhite}`}>
                Status &amp; Partnership Flags
              </span>
            </div>
          </div>

          <div className={`${styles.flex} ${styles["flex-col"]} ${styles["gap-14"]}`}>
            <div>
              <label className={styles.formLabel} htmlFor="status">Publication Status</label>
              <select id="status" name="status" defaultValue={school?.status ?? "active"} className={styles.inputField}>
                {SCHOOL_STATUSES.map((s) => (
                  <option key={s} value={s}>{s === "archived" ? "Hidden" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              {err("status")}
            </div>

            <div>
              <label className={styles.formLabel} htmlFor="parent_collection_accepted">Parent Collection Option</label>
              <select id="parent_collection_accepted" name="parent_collection_accepted" defaultValue={school?.parent_collection_accepted ? "accepted" : "non_accepted"} className={styles.inputField}>
                <option value="accepted">Accepted (Bulk Pickup)</option>
                <option value="non_accepted">Non-accepted</option>
              </select>
              {err("parent_collection_accepted")}
            </div>

            <div className={`${styles.flex} ${styles["flex-col"]} ${styles["gap-8"]} ${styles.mt4}`}>
              <label className={`${styles.flex} ${styles.itemsCenter} ${styles["gap-8"]} ${styles.text12} ${styles.cWhite} ${styles.cursorPointer}`}>
                <input type="checkbox" name="published" defaultChecked={school?.published ?? true} className={styles.checkbox} />
                Published on Site
              </label>
              <label className={`${styles.flex} ${styles.itemsCenter} ${styles["gap-8"]} ${styles.text12} ${styles.cWhite} ${styles.cursorPointer}`}>
                <input type="checkbox" name="is_partner" defaultChecked={school?.is_partner ?? false} className={styles.checkbox} />
                Partner School
              </label>
              <label className={`${styles.flex} ${styles.itemsCenter} ${styles["gap-8"]} ${styles.text12} ${styles.cWhite} ${styles.cursorPointer}`}>
                <input type="checkbox" name="is_featured" defaultChecked={school?.is_featured ?? false} className={styles.checkbox} />
                Featured School
              </label>
              <label className={`${styles.flex} ${styles.itemsCenter} ${styles["gap-8"]} ${styles.text12} ${styles.cRed} ${styles.cursorPointer} ${styles.fw600}`}>
                <input type="checkbox" name="refused_partnership" defaultChecked={(school as any)?.refused_partnership ?? false} className={styles.checkboxRed} />
                Refused Partnership
              </label>
            </div>

            <div className={`${styles.flex} ${styles["flex-col"]} ${styles["gap-10"]} ${styles.pt10}`} style={{ borderTop: "1px solid #1e293b" }}>
              <SubmitButton label={school ? "Save School Details" : "Create School"} />
              <Link href={schoolSlugOrId ? `/admin/schools/${schoolSlugOrId}/info` : "/admin/schools"} className={`${styles.secondaryBtn} ${styles.hFullBtn} ${styles.text12}`}>
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}