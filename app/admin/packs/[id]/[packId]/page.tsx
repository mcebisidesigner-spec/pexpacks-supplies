import React from "react";
import Link from "next/link";
import { ArrowLeft, Building2, GraduationCap, Save, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { hasPermission, requireAdmin } from "@/lib/admin/rbac";
import { getPack } from "@/lib/admin/packs";
import { getSchool } from "@/lib/admin/schools";
import { PackPriceForm } from "@/components/admin/packs/PackPriceForm";
import { PackItemsSection } from "@/components/admin/packs/PackItemsSection";
import styles from "@/components/admin/views/CorePagesView.module.css";

interface NestedEditPackPageProps {
  params: Promise<{ id: string; packId: string }>;
}

export default async function NestedEditPackPage({ params }: NestedEditPackPageProps) {
  const session = await requireAdmin({ permission: "packs.view" });
  const { id, packId } = await params;

  // 1. Fetch School metadata
  const school = await getSchool(id);

  // 2. Fetch Pack details
  const { pack, items } = await getPack(packId);
  if (!pack) notFound();

  const subtotal = items.reduce(
    (sum, item) => sum + (item.unit_price ?? 0) * item.quantity,
    0
  );

  const schoolName = school?.name || "Dawnview High priv";
  const schoolSlugOrId = school?.slug || school?.id || id;
  const backHref = `/admin/packs/${schoolSlugOrId}`;
  const isVisible = pack.visible ?? true;

  return (
    <div className={styles.container}>
      {/* Top Back Link matching sample */}
      <div>
        <Link
          href={backHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 500,
            color: "#94a3b8",
            textDecoration: "none",
            transition: "color 140ms ease",
          }}
        >
          <ArrowLeft size={14} /> Back to {schoolName}
        </Link>
      </div>

      {/* Header Row matching sample */}
      <div className={styles.headerRow} style={{ marginTop: 4, marginBottom: 8 }}>
        <div className={styles.headerTitleGroup}>
          <h1
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            Edit School: {schoolName}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 10px",
                borderRadius: 12,
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#10b981",
                fontSize: 11,
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              <span style={{ fontSize: 8 }}>●</span> {isVisible ? "active" : "draft"}
            </span>
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>
            Update school profile, primary contacts, address, grades, search badge, logo, and partnership status.
          </p>
        </div>
      </div>

      {/* 2-Column Layout matching sample design language */}
      <div className={styles.detailLayout}>
        {/* Main Content Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Section 1 Card: School Identity & Primary Details */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "rgba(45, 212, 191, 0.12)",
                    border: "1px solid rgba(45, 212, 191, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2dd4bf",
                    flexShrink: 0,
                  }}
                >
                  <Building2 size={16} />
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#ffffff" }}>
                  School Identity & Primary Details
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  School Name *
                </label>
                <input
                  defaultValue={schoolName}
                  readOnly
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  URL Slug / Identifier
                </label>
                <input
                  defaultValue={school?.slug || "dawnview-high-school"}
                  readOnly
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                />
                <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>
                  Used in public URLs. Leave blank to auto-generate.
                </span>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  City / Town
                </label>
                <input
                  defaultValue={school?.city || "Germiston"}
                  readOnly
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Province
                </label>
                <input
                  defaultValue={school?.province || "Gauteng"}
                  readOnly
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  District
                </label>
                <input
                  defaultValue={school?.district || "Ekurhuleni"}
                  readOnly
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Contact Email
                </label>
                <input
                  defaultValue={school?.email || "admin@school.co.za"}
                  readOnly
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Telephone
                </label>
                <input
                  defaultValue={school?.telephone || "+27 12 000 0000"}
                  readOnly
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Principal / Headmaster
                </label>
                <input
                  defaultValue={school?.principal || "e.g. Dr. A. Smith"}
                  readOnly
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Grade Pack Pricing & Items Section */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "rgba(96, 165, 250, 0.12)",
                    border: "1px solid rgba(96, 165, 250, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#60a5fa",
                    flexShrink: 0,
                  }}
                >
                  <GraduationCap size={16} />
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#ffffff" }}>
                  Stationery Pack Items & Price Configuration
                </span>
              </div>
            </div>

            <PackPriceForm
              packId={pack.id}
              price={pack.price}
              itemCount={items.length}
              subtotal={subtotal}
              schoolName={schoolName}
              packTitle={pack.title}
            />

            <PackItemsSection
              packId={pack.id}
              packTitle={pack.title}
              items={items}
              subtotal={subtotal}
              showImporter={hasPermission(session, "items.import")}
            />
          </div>
        </div>

        {/* Right Sidebar: Status & Partnership Flags */}
        <div className={styles.sidebarColumn}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "rgba(45, 212, 191, 0.12)",
                    border: "1px solid rgba(45, 212, 191, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2dd4bf",
                    flexShrink: 0,
                  }}
                >
                  <ShieldCheck size={16} />
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#ffffff" }}>
                  Status & Partnership Flags
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Publication Status
                </label>
                <select
                  defaultValue={isVisible ? "active" : "draft"}
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Parent Collection Option
                </label>
                <select
                  defaultValue={school?.parent_collection_accepted ? "accepted" : "accepted"}
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                >
                  <option value="accepted">Accepted (Bulk Pickup)</option>
                  <option value="non_accepted">Non-accepted</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#cbd5e1", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    defaultChecked={school?.published ?? true}
                    style={{ accentColor: "#10b981", width: 16, height: 16 }}
                  />
                  Published on Site
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#cbd5e1", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    defaultChecked={school?.is_partner ?? true}
                    style={{ accentColor: "#10b981", width: 16, height: 16 }}
                  />
                  Partner School
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#cbd5e1", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    defaultChecked={school?.is_featured ?? true}
                    style={{ accentColor: "#10b981", width: 16, height: 16 }}
                  />
                  Featured School
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#f87171", cursor: "pointer", fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    defaultChecked={(school as any)?.refused_partnership ?? false}
                    style={{ accentColor: "#ef4444", width: 16, height: 16 }}
                  />
                  Refused Partnership
                </label>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 10, borderTop: "1px solid #1e293b" }}>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  style={{ width: "100%", justifyContent: "center", height: 42, fontSize: 13, fontWeight: 700 }}
                >
                  <Save size={14} /> Save Pack Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
