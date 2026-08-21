"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Check,
  CreditCard,
  FileText,
  Globe,
  Image as ImageIcon,
  Mail,
  Plus,
  Receipt,
  Save,
  Shield,
  UserPlus,
  Users,
} from "lucide-react";
import styles from "./CorePagesView.module.css";

interface SettingsPageViewProps {
  activeTab?: "general" | "user-roles" | "financial" | "templates";
}

export function SettingsPageView({ activeTab = "general" }: SettingsPageViewProps) {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<"general" | "user-roles" | "financial" | "templates">(activeTab);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleTabChange = (tab: "general" | "user-roles" | "financial" | "templates") => {
    setCurrentTab(tab);
    router.push(`/admin/settings/${tab}`);
  };

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>Settings & Configuration</h1>
          <p className={styles.headerSubtitle}>
            Manage operational defaults, user access matrix, financial parameters, and document templates.
          </p>
        </div>
      </div>

      {/* Responsive 4-Tab Navigation Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          borderBottom: "1px solid #1e293b",
          paddingBottom: 12,
          marginBottom: 20,
        }}
      >
        {[
          { id: "general", label: "1. General Settings", icon: Building2 },
          { id: "user-roles", label: "2. Users & Roles", icon: Users },
          { id: "financial", label: "3. Financial & Tax", icon: Receipt },
          { id: "templates", label: "4. Templates & Media", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id as any)}
              className={isActive ? styles.primaryBtn : styles.secondaryBtn}
              style={{
                height: 44, // 44px+ mobile touch target requirement
                minHeight: 44,
                padding: "0 18px",
                fontSize: 13,
                fontWeight: 700,
                flex: "1 1 auto",
                justifyContent: "center",
                background: isActive ? "#0d9488" : "#0f172a",
                borderColor: isActive ? "#2dd4bf" : "#1e293b",
                color: isActive ? "#ffffff" : "#94a3b8",
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: GENERAL SETTINGS */}
      {currentTab === "general" && (
        <form action="/admin/settings/general" method="GET" className={styles.detailLayout}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Company Information */}
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarCardHeader}>
                <div className={styles.sidebarHeaderTitle}>
                  <Building2 size={16} style={{ color: "#2dd4bf" }} />
                  <span>Company Identity & Legal Registration</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                    Legal Entity Name
                  </label>
                  <input
                    name="company_name"
                    defaultValue="Pexpacks Supplies (Pty) Ltd"
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
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                    CIPC Registration Number
                  </label>
                  <input
                    name="reg_number"
                    defaultValue="2024/182736/07"
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
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                    SARS VAT Registration Number
                  </label>
                  <input
                    name="vat_number"
                    defaultValue="4920192837"
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
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                    Support Email Address
                  </label>
                  <input
                    type="email"
                    name="support_email"
                    defaultValue="care@pexpacks.co.za"
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
                </div>
              </div>
            </div>

            {/* Address & Operational Hours */}
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarCardHeader}>
                <div className={styles.sidebarHeaderTitle}>
                  <Globe size={16} style={{ color: "#60a5fa" }} />
                  <span>Physical Address & Time Zone</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                    Physical Warehouse Address
                  </label>
                  <textarea
                    name="address"
                    rows={3}
                    defaultValue="128 Logistics Hub, Midrand Industrial Park, Midrand, Gauteng, 1685"
                    style={{
                      width: "100%",
                      background: "#020617",
                      border: "1px solid #334155",
                      borderRadius: 8,
                      padding: "8px 12px",
                      color: "#ffffff",
                      fontSize: 12,
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                      System Time Zone
                    </label>
                    <input
                      name="timezone"
                      defaultValue="Africa/Johannesburg (SAST UTC+2)"
                      disabled
                      style={{
                        width: "100%",
                        background: "#020617",
                        border: "1px solid #334155",
                        borderRadius: 8,
                        padding: "8px 12px",
                        color: "#94a3b8",
                        fontSize: 13,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                      Operating Hours
                    </label>
                    <input
                      name="operating_hours"
                      defaultValue="Mon - Fri: 07:30 - 17:00 SAST"
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
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sidebarColumn}>
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarCardHeader}>
                <div className={styles.sidebarHeaderTitle}>
                  <Mail size={16} style={{ color: "#fbbf24" }} />
                  <span>Communication Defaults</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Send Automated Order Confirmation Emails", active: true },
                  { label: "Send Dispatch SMS Notifications to Parents", active: true },
                  { label: "Send Payment Reminder Notifications", active: true },
                  { label: "Weekly School Procurement Digest", active: false },
                ].map((pref) => (
                  <div key={pref.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                    <span style={{ color: "#cbd5e1" }}>{pref.label}</span>
                    <input type="checkbox" defaultChecked={pref.active} style={{ accentColor: "#0d9488", width: 16, height: 16 }} />
                  </div>
                ))}

                <div style={{ paddingTop: 12 }}>
                  <button type="submit" className={styles.primaryBtn} style={{ width: "100%", justifyContent: "center" }}>
                    <Save size={14} /> Save General Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: USERS & ROLES */}
      {currentTab === "user-roles" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className={styles.headerRow} style={{ marginTop: 0 }}>
            <div className={styles.headerTitleGroup}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", margin: 0 }}>Administrative Users & Access Matrix</h2>
            </div>
            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => setShowInviteModal(!showInviteModal)}
              >
                <UserPlus size={14} /> Invite New User
              </button>
            </div>
          </div>

          {/* User Table */}
          <div className={styles.tableCard}>
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>USER NAME</th>
                    <th>EMAIL</th>
                    <th>ASSIGNED ROLE</th>
                    <th>PERMISSIONS</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Mcebisi M.", email: "mcebisi@pexpacks.co.za", role: "Super Admin", perms: "Full System Access", status: "Active" },
                    { name: "Kwanele G.", email: "kwanele@pexpacks.co.za", role: "Operations Manager", perms: "Read, Write, Catalogue, Finance", status: "Active" },
                    { name: "Liam M.", email: "liam@pexpacks.co.za", role: "Procurement Lead", perms: "Read, Write, Suppliers, POs", status: "Active" },
                    { name: "Warehouse Packing Staff", email: "warehouse@pexpacks.co.za", role: "Packing Staff", perms: "Fulfilment & Packing Only", status: "Active" },
                  ].map((user, idx) => (
                    <tr key={idx} className={styles.dataRow}>
                      <td><strong style={{ color: "#ffffff" }}>{user.name}</strong></td>
                      <td>{user.email}</td>
                      <td><span className={styles.badgeTeal}>{user.role}</span></td>
                      <td><span style={{ fontSize: 11, color: "#cbd5e1" }}>{user.perms}</span></td>
                      <td><span className={styles.badgeGreen}>{user.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Permission Matrix Toggles Card */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Shield size={16} style={{ color: "#34d399" }} />
                <span>Role Permission Matrix Configuration</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, fontSize: 12 }}>
              <div>
                <strong style={{ color: "#ffffff", display: "block", marginBottom: 8 }}>Catalogue & Master Products</strong>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label><input type="checkbox" defaultChecked /> Create / Edit Master Items</label>
                  <label><input type="checkbox" defaultChecked /> Delete Catalogue Items</label>
                  <label><input type="checkbox" defaultChecked /> Modify Margin Rules</label>
                </div>
              </div>

              <div>
                <strong style={{ color: "#ffffff", display: "block", marginBottom: 8 }}>Orders & Commerce</strong>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label><input type="checkbox" defaultChecked /> View Orders</label>
                  <label><input type="checkbox" defaultChecked /> Issue Order Refunds</label>
                  <label><input type="checkbox" defaultChecked /> Delete Orders (Super Admin Only)</label>
                </div>
              </div>

              <div>
                <strong style={{ color: "#ffffff", display: "block", marginBottom: 8 }}>Financial & Settlements</strong>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label><input type="checkbox" defaultChecked /> Perform Bank Reconciliation</label>
                  <label><input type="checkbox" defaultChecked /> Override Credit Terms</label>
                  <label><input type="checkbox" defaultChecked /> Export Financial Summaries</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FINANCIAL SETTINGS */}
      {currentTab === "financial" && (
        <form action="/admin/settings/financial" method="GET" className={styles.detailLayout}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Tax & Invoicing */}
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarCardHeader}>
                <div className={styles.sidebarHeaderTitle}>
                  <Receipt size={16} style={{ color: "#2dd4bf" }} />
                  <span>Tax & Invoice Configuration</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                    Standard South African VAT Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="vat_rate"
                    defaultValue="15.0"
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
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                    Invoice Reference Prefix
                  </label>
                  <input
                    name="invoice_prefix"
                    defaultValue="PX-INV-"
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
                </div>
              </div>
            </div>

            {/* Banking Details */}
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarCardHeader}>
                <div className={styles.sidebarHeaderTitle}>
                  <CreditCard size={16} style={{ color: "#34d399" }} />
                  <span>Settlement Bank Account Details (EFT)</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                    Bank Name
                  </label>
                  <input
                    name="bank_name"
                    defaultValue="Nedbank South Africa"
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
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                    Account Number
                  </label>
                  <input
                    name="account_number"
                    defaultValue="1029384756"
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
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                    Branch Code
                  </label>
                  <input
                    name="branch_code"
                    defaultValue="198765"
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
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sidebarColumn}>
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarCardHeader}>
                <div className={styles.sidebarHeaderTitle}>
                  <Receipt size={16} style={{ color: "#fbbf24" }} />
                  <span>Supplier Credit Terms</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                    Default Credit Terms
                  </label>
                  <select
                    name="default_credit_terms"
                    defaultValue="30 Days Net"
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
                    <option value="30 Days Net">30 Days Net</option>
                    <option value="60 Days Net">60 Days Net</option>
                    <option value="COD">Cash On Delivery (COD)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                    Early Settlement Discount (%)
                  </label>
                  <input
                    name="settlement_discount"
                    defaultValue="2.5% within 7 Days"
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
                </div>

                <div style={{ paddingTop: 12 }}>
                  <button type="submit" className={styles.primaryBtn} style={{ width: "100%", justifyContent: "center" }}>
                    <Save size={14} /> Save Financial Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 4: TEMPLATES & MEDIA */}
      {currentTab === "templates" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Document & Email Templates */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <FileText size={16} style={{ color: "#2dd4bf" }} />
                <span>Document & Transactional Email Templates</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              {[
                { title: "Packing Slip Template", desc: "Warehouse pick & pack sheet printed per order.", badge: "PDF / Print" },
                { title: "School RFQ Quote Template", desc: "Bulk school pricing quotation template.", badge: "PDF" },
                { title: "Order Confirmation Email", desc: "Sent to parents immediately upon successful Ozow payment.", badge: "HTML Email" },
                { title: "Packing Complete & Collection Ready", desc: "Automated SMS/Email notification when bag is ready.", badge: "Email + SMS" },
              ].map((tmpl, idx) => (
                <div key={idx} style={{ background: "#020617", border: "1px solid #334155", borderRadius: 8, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <strong style={{ color: "#ffffff", fontSize: 13 }}>{tmpl.title}</strong>
                    <span className={styles.badgeTeal}>{tmpl.badge}</span>
                  </div>
                  <p style={{ margin: "0 0 10px", fontSize: 11, color: "#94a3b8" }}>{tmpl.desc}</p>
                  <button className={styles.secondaryBtn} style={{ height: 28, fontSize: 11 }}>
                    Edit Template
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Brand Assets & Product Media */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <ImageIcon size={16} style={{ color: "#60a5fa" }} />
                <span>Brand Assets & Marketing Collateral</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              <div style={{ background: "#020617", border: "1px dashed #334155", borderRadius: 8, padding: 14, textAlign: "center" }}>
                <strong style={{ color: "#ffffff", fontSize: 12, display: "block", marginBottom: 4 }}>Primary Pexpacks Logo</strong>
                <span style={{ fontSize: 11, color: "#64748b" }}>SVG / PNG Vector</span>
              </div>
              <div style={{ background: "#020617", border: "1px dashed #334155", borderRadius: 8, padding: 14, textAlign: "center" }}>
                <strong style={{ color: "#ffffff", fontSize: 12, display: "block", marginBottom: 4 }}>Dark Mode Dashboard Logo</strong>
                <span style={{ fontSize: 11, color: "#64748b" }}>White / Mint Variant</span>
              </div>
              <div style={{ background: "#020617", border: "1px dashed #334155", borderRadius: 8, padding: 14, textAlign: "center" }}>
                <strong style={{ color: "#ffffff", fontSize: 12, display: "block", marginBottom: 4 }}>School Pack Catalog Banners</strong>
                <span style={{ fontSize: 11, color: "#64748b" }}>High-Res WebP</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
