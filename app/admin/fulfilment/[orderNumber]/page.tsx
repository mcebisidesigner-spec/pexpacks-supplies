import Link from "next/link";
import { ArrowLeft, Barcode, CheckSquare, ClipboardList, PackageCheck, Save, Truck, UserCheck } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import styles from "@/components/admin/views/CorePagesView.module.css";

interface FulfilmentDetailPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function FulfilmentDetailPage({ params }: FulfilmentDetailPageProps) {
  await requireAdmin({ permission: "fulfilment.view" });
  const { orderNumber } = await params;

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <div>
        <Link
          href="/admin/fulfilment"
          className={styles.secondaryBtn}
          style={{
            height: 32,
            fontSize: 11,
            background: "transparent",
            border: "none",
            color: "#94a3b8",
            paddingLeft: 0,
          }}
        >
          <ArrowLeft size={14} /> Back to Packing & Fulfilment
        </Link>
      </div>

      {/* Header */}
      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>
            Fulfilment Workbench: {orderNumber}
            <span className={styles.badgeTeal}>● In Packing</span>
          </h1>
          <p className={styles.headerSubtitle}>
            School: 3d Christian Academy • Grade 4 Pack • Learner: Ethan Morgan • Opening: 15 Jan 2027
          </p>
        </div>
      </div>

      {/* 6-Stage Stepper Bar */}
      <div className={styles.tableCard} style={{ padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", marginBottom: 12 }}>
          Packing Lifecycle Stepper
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
          {[
            { stage: "Queued", active: false, done: true },
            { stage: "Picking", active: false, done: true },
            { stage: "Packed", active: true, done: false },
            { stage: "Quality Check", active: false, done: false },
            { stage: "Ready for Dispatch", active: false, done: false },
            { stage: "Completed", active: false, done: false },
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              className={item.active ? styles.primaryBtn : styles.secondaryBtn}
              style={{
                justifyContent: "center",
                fontSize: 11,
                padding: "8px 4px",
                borderColor: item.active ? "#2dd4bf" : item.done ? "#059669" : "#334155",
                background: item.active ? "#0d9488" : item.done ? "#064e3b" : "transparent",
                color: item.active || item.done ? "#ffffff" : "#94a3b8",
              }}
            >
              {item.done ? "✓ " : ""}{item.stage}
            </button>
          ))}
        </div>
      </div>

      {/* Packing Workbench Layout */}
      <div className={styles.detailLayout} style={{ marginTop: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Interactive Packing Checklist */}
          <div className={styles.tableCard}>
            <div style={{ padding: "14px 16px", fontWeight: 700, borderBottom: "1px solid #1e293b", color: "#ffffff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckSquare size={16} style={{ color: "#2dd4bf" }} />
                <span>Reusable Bag Items Checklist (4 of 5 Checked)</span>
              </div>
              <span className={styles.badgeGreen}>80% Complete</span>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>CHECK</th>
                    <th>ITEM DESCRIPTION</th>
                    <th>QTY</th>
                    <th>UNIT FORMAT</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={styles.dataRow}>
                    <td><input type="checkbox" defaultChecked style={{ width: 16, height: 16, accentColor: "#2dd4bf" }} /></td>
                    <td><strong style={{ color: "#ffffff" }}>A4 Counter Book (Quad 192p)</strong></td>
                    <td>4</td>
                    <td>Each</td>
                    <td><span className={styles.badgeGreen}>Packed</span></td>
                  </tr>
                  <tr className={styles.dataRow}>
                    <td><input type="checkbox" defaultChecked style={{ width: 16, height: 16, accentColor: "#2dd4bf" }} /></td>
                    <td><strong style={{ color: "#ffffff" }}>Staedtler HB Pencils (Box 12)</strong></td>
                    <td>1</td>
                    <td>Box</td>
                    <td><span className={styles.badgeGreen}>Packed</span></td>
                  </tr>
                  <tr className={styles.dataRow}>
                    <td><input type="checkbox" defaultChecked style={{ width: 16, height: 16, accentColor: "#2dd4bf" }} /></td>
                    <td><strong style={{ color: "#ffffff" }}>Pritt Glue Stick 43g</strong></td>
                    <td>2</td>
                    <td>Each</td>
                    <td><span className={styles.badgeGreen}>Packed</span></td>
                  </tr>
                  <tr className={styles.dataRow}>
                    <td><input type="checkbox" defaultChecked style={{ width: 16, height: 16, accentColor: "#2dd4bf" }} /></td>
                    <td><strong style={{ color: "#ffffff" }}>Flip File 40 Pocket</strong></td>
                    <td>2</td>
                    <td>Each</td>
                    <td><span className={styles.badgeGreen}>Packed</span></td>
                  </tr>
                  <tr className={styles.dataRow} style={{ background: "rgba(245, 158, 11, 0.05)" }}>
                    <td><input type="checkbox" style={{ width: 16, height: 16, accentColor: "#2dd4bf" }} /></td>
                    <td><strong style={{ color: "#fbbf24" }}>Ruler 30cm Shatterproof (Substituted: Clear)</strong></td>
                    <td>1</td>
                    <td>Each</td>
                    <td><span className={styles.badgeAmber}>Pending Verification</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Packing Notes & Barcode Panel */}
        <div className={styles.sidebarColumn}>
          <form action="/admin/fulfilment" method="GET" className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Barcode size={16} style={{ color: "#2dd4bf" }} />
                <span>Bag Tracking & Staff Log</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Fabric Bag Barcode / Serial
                </label>
                <input
                  name="bag_serial"
                  defaultValue="BAG-3DCA-8492"
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                    fontFamily: "monospace",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Assigned Packer
                </label>
                <select
                  name="packer"
                  defaultValue="Kwanele G."
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
                  <option value="Kwanele G.">Kwanele G. (Lead Packer)</option>
                  <option value="Mcebisi M.">Mcebisi M.</option>
                  <option value="Liam M.">Liam M.</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Packing Notes / Substitution Exceptions
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue="Substituted blue shatterproof ruler with clear 30cm ruler due to supplier stock buffer."
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
              </div>

              <div style={{ paddingTop: 8 }}>
                <button type="submit" className={styles.primaryBtn} style={{ width: "100%", justifyContent: "center" }}>
                  <Save size={14} /> Save Packing Log
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
