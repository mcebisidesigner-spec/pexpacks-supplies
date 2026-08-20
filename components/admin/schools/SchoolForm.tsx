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
      className={styles.primaryBtn}
      disabled={pending}
      style={{ width: "100%", justifyContent: "center", height: 38, fontSize: 13 }}
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
      <span style={{ fontSize: 11, color: "#f87171", marginTop: 4, display: "block" }} role="alert">
        {state.errors[field]}
      </span>
    ) : null;

  const schoolSlugOrId = school?.slug || school?.id || "";

  return (
    <form action={formAction} className={styles.detailLayout}>
      <input type="hidden" name="logo" value={logoValue} />

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Banner Alert Messages */}
        {state?.ok ? (
          <div className={styles.badgeGreen} style={{ padding: "10px 14px", fontSize: 13, display: "block" }} role="status">
            ✓ {state.message || "School updated successfully."}
          </div>
        ) : state?.message ? (
          <div className={styles.badgeRed} style={{ padding: "10px 14px", fontSize: 13, display: "block", color: "#f87171", background: "rgba(239, 68, 68, 0.15)" }} role="alert">
            ⚠ {state.message}
          </div>
        ) : null}

        {/* Section 1: Identity & Location */}
        <div className={styles.sidebarCard}>
          <div className={styles.sidebarCardHeader}>
            <div className={styles.sidebarHeaderTitle}>
              <Building2 size={16} style={{ color: "#2dd4bf" }} />
              <span>School Identity & Primary Details</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }} htmlFor="name">
                School Name *
              </label>
              <input
                id="name"
                name="name"
                defaultValue={school?.name ?? ""}
                placeholder="e.g. Sunnyvale Primary School"
                required
                style={{
                  width: "100%",
                  background: "#020617",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: "#ffffff",
                  fontSize: 13,
                }}
              />
              {err("name")}
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }} htmlFor="slug">
                URL Slug / Identifier
              </label>
              <input
                id="slug"
                name="slug"
                defaultValue={str(school?.slug)}
                placeholder="auto-generated from name"
                style={{
                  width: "100%",
                  background: "#020617",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: "#ffffff",
                  fontSize: 13,
                }}
              />
              <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>
                Used in public URLs. Leave blank to auto-generate.
              </span>
              {err("slug")}
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }} htmlFor="city">
                City / Town
              </label>
              <input
                id="city"
                name="city"
                defaultValue={str(school?.city)}
                placeholder="e.g. Pretoria"
                style={{
                  width: "100%",
                  background: "#020617",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: "#ffffff",
                  fontSize: 13,
                }}
              />
              {err("city")}
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }} htmlFor="province">
                Province
              </label>
              <input
                id="province"
                name="province"
                defaultValue={str(school?.province)}
                placeholder="e.g. Gauteng"
                style={{
                  width: "100%",
                  background: "#020617",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: "#ffffff",
                  fontSize: 13,
                }}
              />
              {err("province")}
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }} htmlFor="district">
                District
              </label>
              <input
                id="district"
                name="district"
                defaultValue={str(school?.district)}
                placeholder="e.g. Tshwane South"
                style={{
                  width: "100%",
                  background: "#020617",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: "#ffffff",
                  fontSize: 13,
                }}
              />
              {err("district")}
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }} htmlFor="email">
                Contact Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={str(school?.email)}
                placeholder="admin@school.co.za"
                style={{
                  width: "100%",
                  background: "#020617",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: "#ffffff",
                  fontSize: 13,
                }}
              />
              {err("email")}
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }} htmlFor="telephone">
                Telephone
              </label>
              <input
                id="telephone"
                name="telephone"
                defaultValue={str(school?.telephone)}
                placeholder="+27 12 000 0000"
                style={{
                  width: "100%",
                  background: "#020617",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: "#ffffff",
                  fontSize: 13,
                }}
              />
              {err("telephone")}
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }} htmlFor="principal">
                Principal / Headmaster
              </label>
              <input
                id="principal"
                name="principal"
                defaultValue={str(school?.principal)}
                placeholder="e.g. Dr. A. Smith"
                style={{
                  width: "100%",
                  background: "#020617",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: "#ffffff",
                  fontSize: 13,
                }}
              />
              {err("principal")}
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }} htmlFor="address">
                Physical Address
              </label>
              <input
                id="address"
                name="address"
                defaultValue={str(school?.address)}
                placeholder="e.g. 45 School Road, Centurion"
                style={{
                  width: "100%",
                  background: "#020617",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: "#ffffff",
                  fontSize: 13,
                }}
              />
              {err("address")}
            </div>
          </div>
        </div>

        {/* Section 2: School Profile & Search Pill */}
        <div className={styles.sidebarCard}>
          <div className={styles.sidebarCardHeader}>
            <div className={styles.sidebarHeaderTitle}>
              <GraduationCap size={16} style={{ color: "#60a5fa" }} />
              <span>School Profile & Search Pill Configuration</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }} htmlFor="description">
                Description & Overview
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={str(school?.description)}
                placeholder="Brief introduction for parents searching school stationery packs..."
                style={{
                  width: "100%",
                  background: "#020617",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: "#ffffff",
                  fontSize: 12,
                  resize: "vertical",
                }}
              />
              {err("description")}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }} htmlFor="grades">
                  Offered Grades
                </label>
                <input
                  id="grades"
                  name="grades"
                  defaultValue={grades}
                  placeholder="Grade R, Grade 1, Grade 2"
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                />
                <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>
                  Comma-separated grade names.
                </span>
                {err("grades")}
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }} htmlFor="custom_badge">
                  Search Pill Badge
                </label>
                <input
                  id="custom_badge"
                  name="custom_badge"
                  defaultValue={str(school?.custom_badge) || "2026 Packs"}
                  placeholder="e.g. 2026 Packs"
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                />
                <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>
                  Badge shown on search cards (e.g. 2026 Packs).
                </span>
                {err("custom_badge")}
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }} htmlFor="lowest_price">
                  Lowest Pack Price (R)
                </label>
                <input
                  id="lowest_price"
                  name="lowest_price"
                  inputMode="decimal"
                  defaultValue={str(school?.lowest_price)}
                  placeholder="e.g. 245.00"
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                />
                {err("lowest_price")}
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }} htmlFor="partner_since">
                  Partner Since Date
                </label>
                <DateField
                  id="partner_since"
                  name="partner_since"
                  className={styles.searchInput}
                  defaultValue={str(school?.partner_since)}
                  ariaLabel="Partner since"
                  placeholder="Select partnership date"
                />
                {err("partner_since")}
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }} htmlFor="latitude">
                  Latitude
                </label>
                <input
                  id="latitude"
                  name="latitude"
                  inputMode="decimal"
                  defaultValue={str(school?.latitude)}
                  placeholder="e.g. -25.7479"
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                />
                {err("latitude")}
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }} htmlFor="longitude">
                  Longitude
                </label>
                <input
                  id="longitude"
                  name="longitude"
                  inputMode="decimal"
                  defaultValue={str(school?.longitude)}
                  placeholder="e.g. 28.2293"
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                />
                {err("longitude")}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: School Logo */}
        <div className={styles.sidebarCard}>
          <div className={styles.sidebarCardHeader}>
            <div className={styles.sidebarHeaderTitle}>
              <ImageIcon size={16} style={{ color: "#fbbf24" }} />
              <span>School Logo Branding</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div
              style={{
                position: "relative",
                width: 110,
                height: 110,
                borderRadius: 12,
                border: "1px dashed #334155",
                background: "#020617",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoPreview}
                  alt="School logo preview"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
                <SchoolLogoPlaceholder width={110} height={110} />
              )}
              <input
                type="file"
                name="logo_file"
                accept="image/png,image/webp,image/svg+xml,image/jpeg"
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0,
                  cursor: "pointer",
                }}
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

            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
              <p style={{ margin: 0, color: "#cbd5e1", fontWeight: 600 }}>
                Upload School Emblem / Logo
              </p>
              <p style={{ margin: 0, color: "#64748b", fontSize: 11 }}>
                PNG, WebP, SVG or JPG (max 10 MB). Auto-fallback placeholder used if empty.
              </p>
              {logoPreview ? (
                <button
                  type="button"
                  style={{
                    alignSelf: "flex-start",
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#f87171",
                    cursor: "pointer",
                    textDecoration: "underline",
                    marginTop: 6,
                  }}
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
      </div>

      {/* Right Sidebar: Status & Form Action Controls */}
      <div className={styles.sidebarColumn}>
        <div className={styles.sidebarCard}>
          <div className={styles.sidebarCardHeader}>
            <div className={styles.sidebarHeaderTitle}>
              <ShieldCheck size={16} style={{ color: "#2dd4bf" }} />
              <span>Status & Partnership Flags</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }} htmlFor="status">
                Publication Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={school?.status ?? "active"}
                style={{
                  width: "100%",
                  background: "#020617",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: "#ffffff",
                  fontSize: 13,
                }}
              >
                {SCHOOL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === "archived" ? "Hidden" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              {err("status")}
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }} htmlFor="parent_collection_accepted">
                Parent Collection Option
              </label>
              <select
                id="parent_collection_accepted"
                name="parent_collection_accepted"
                defaultValue={school?.parent_collection_accepted ? "accepted" : "non_accepted"}
                style={{
                  width: "100%",
                  background: "#020617",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: "#ffffff",
                  fontSize: 13,
                }}
              >
                <option value="accepted">Accepted (Bulk Pickup)</option>
                <option value="non_accepted">Non-accepted</option>
              </select>
              {err("parent_collection_accepted")}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#cbd5e1", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={school?.published ?? true}
                  style={{ accentColor: "#0d9488", width: 16, height: 16 }}
                />
                Published on Site
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#cbd5e1", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  name="is_partner"
                  defaultChecked={school?.is_partner ?? false}
                  style={{ accentColor: "#0d9488", width: 16, height: 16 }}
                />
                Partner School
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#cbd5e1", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  name="is_featured"
                  defaultChecked={school?.is_featured ?? false}
                  style={{ accentColor: "#0d9488", width: 16, height: 16 }}
                />
                Featured School
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#f87171", cursor: "pointer", fontWeight: 600 }}>
                <input
                  type="checkbox"
                  name="refused_partnership"
                  defaultChecked={(school as any)?.refused_partnership ?? false}
                  style={{ accentColor: "#ef4444", width: 16, height: 16 }}
                />
                Refused Partnership
              </label>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 10, borderTop: "1px solid #1e293b" }}>
              <SubmitButton label={school ? "Save School Details" : "Create School"} />
              <Link
                href={schoolSlugOrId ? `/admin/schools/${schoolSlugOrId}/info` : "/admin/schools"}
                className={styles.secondaryBtn}
                style={{ width: "100%", justifyContent: "center", height: 38, fontSize: 12 }}
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
