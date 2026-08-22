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
      <div className={styles.settingsTabBar}>
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
              className={[
                isActive ? styles.primaryBtn : styles.secondaryBtn,
                isActive ? styles.settingsTabBtnActive : styles.settingsTabBtnInactive,
                styles.settingsTabBtn,
              ].join(" ")}
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
          <div className={styles.formStack}>
            {/* Company Information */}
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarCardHeader}>
                <div className={styles.sidebarHeaderTitle}>
                  <Building2 size={16} className={styles.setIconTeal} />
                  <span>Company Identity & Legal Registration</span>
                </div>
              </div>

              <div className={styles.settingsGrid2}>
                <div>
                  <label className={styles.formLabel}>
                    Legal Entity Name
                  </label>
                  <input
                    name="company_name"
                    defaultValue="Pexpacks Supplies (Pty) Ltd"
                    className={styles.inputField}
                  />
                </div>

                <div>
                  <label className={styles.formLabel}>
                    CIPC Registration Number
                  </label>
                  <input
                    name="reg_number"
                    defaultValue="2024/182736/07"
                    className={styles.inputField}
                  />
                </div>

                <div>
                  <label className={styles.formLabel}>
                    SARS VAT Registration Number
                  </label>
                  <input
                    name="vat_number"
                    defaultValue="4920192837"
                    className={styles.inputField}
                  />
                </div>

                <div>
                  <label className={styles.formLabel}>
                    Support Email Address
                  </label>
                  <input
                    type="email"
                    name="support_email"
                    defaultValue="care@pexpacks.co.za"
                    className={styles.inputField}
                  />
                </div>
              </div>
            </div>

            {/* Address & Operational Hours */}
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarCardHeader}>
                <div className={styles.sidebarHeaderTitle}>
                  <Globe size={16} className={styles.setIconBlue} />
                  <span>Physical Address & Time Zone</span>
                </div>
              </div>

              <div className={styles.settingsGrid2}>
                <div>
                  <label className={styles.formLabel}>
                    Physical Warehouse Address
                  </label>
                  <textarea
                    name="address"
                    rows={3}
                    defaultValue="128 Logistics Hub, Midrand Industrial Park, Midrand, Gauteng, 1685"
                    className={styles.textareaField}
                  />
                </div>

                <div className={styles.sidebarItemStack}>
                  <div>
                    <label className={styles.formLabel}>
                      System Time Zone
                    </label>
                    <input
                      name="timezone"
                      defaultValue="Africa/Johannesburg (SAST UTC+2)"
                      disabled
                      className={`${styles.inputField} ${styles.inputFieldMuted}`}
                    />
                  </div>

                  <div>
                    <label className={styles.formLabel}>
                      Operating Hours
                    </label>
                    <input
                      name="operating_hours"
                      defaultValue="Mon - Fri: 07:30 - 17:00 SAST"
                      className={styles.inputField}
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
                  <Mail size={16} className={styles.setIconAmber} />
                  <span>Communication Defaults</span>
                </div>
              </div>

              <div className={styles.formStackCompact}>
                {[
                  { label: "Send Automated Order Confirmation Emails", active: true },
                  { label: "Send Dispatch SMS Notifications to Parents", active: true },
                  { label: "Send Payment Reminder Notifications", active: true },
                  { label: "Weekly School Procurement Digest", active: false },
                ].map((pref) => (
                  <div key={pref.label} className={styles.prefRow}>
                    <span className={styles.prefLabel}>{pref.label}</span>
                    <input type="checkbox" defaultChecked={pref.active} className={styles.settingsCheckbox} />
                  </div>
                ))}

                <div className={styles.pt12}>
                  <button type="submit" className={`${styles.primaryBtn} ${styles.wFullBtn}`}>
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
        <div className={styles.formStack}>
          <div className={styles.headerRow}>
            <div className={styles.headerTitleGroup}>
              <h2 className={styles.userSectionTitle}>Administrative Users & Access Matrix</h2>
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
                      <td><strong className={styles.tableUserName}>{user.name}</strong></td>
                      <td>{user.email}</td>
                      <td><span className={styles.badgeTeal}>{user.role}</span></td>
                      <td><span className={styles.tablePerms}>{user.perms}</span></td>
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
                <Shield size={16} className={styles.setIconGreen} />
                <span>Role Permission Matrix Configuration</span>
              </div>
            </div>

            <div className={styles.permGrid3}>
              <div>
                <strong className={styles.permGroupTitle}>Catalogue & Master Products</strong>
                <div className={styles.checkboxStack}>
                  <label><input type="checkbox" defaultChecked /> Create / Edit Master Items</label>
                  <label><input type="checkbox" defaultChecked /> Delete Catalogue Items</label>
                  <label><input type="checkbox" defaultChecked /> Modify Margin Rules</label>
                </div>
              </div>

              <div>
                <strong className={styles.permGroupTitle}>Orders & Commerce</strong>
                <div className={styles.checkboxStack}>
                  <label><input type="checkbox" defaultChecked /> View Orders</label>
                  <label><input type="checkbox" defaultChecked /> Issue Order Refunds</label>
                  <label><input type="checkbox" defaultChecked /> Delete Orders (Super Admin Only)</label>
                </div>
              </div>

              <div>
                <strong className={styles.permGroupTitle}>Financial & Settlements</strong>
                <div className={styles.checkboxStack}>
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
          <div className={styles.formStack}>
            {/* Tax & Invoicing */}
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarCardHeader}>
                <div className={styles.sidebarHeaderTitle}>
                  <Receipt size={16} className={styles.setIconTeal} />
                  <span>Tax & Invoice Configuration</span>
                </div>
              </div>

              <div className={styles.settingsGrid2}>
                <div>
                  <label className={styles.formLabel}>
                    Standard South African VAT Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="vat_rate"
                    defaultValue="15.0"
                    className={styles.inputField}
                  />
                </div>

                <div>
                  <label className={styles.formLabel}>
                    Invoice Reference Prefix
                  </label>
                  <input
                    name="invoice_prefix"
                    defaultValue="PX-INV-"
                    className={styles.inputField}
                  />
                </div>
              </div>
            </div>

            {/* Banking Details */}
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarCardHeader}>
                <div className={styles.sidebarHeaderTitle}>
                  <CreditCard size={16} className={styles.setIconGreen} />
                  <span>Settlement Bank Account Details (EFT)</span>
                </div>
              </div>

              <div className={styles.settingsGrid3}>
                <div>
                  <label className={styles.formLabel}>
                    Bank Name
                  </label>
                  <input
                    name="bank_name"
                    defaultValue="Nedbank South Africa"
                    className={styles.inputField}
                  />
                </div>

                <div>
                  <label className={styles.formLabel}>
                    Account Number
                  </label>
                  <input
                    name="account_number"
                    defaultValue="1029384756"
                    className={styles.inputField}
                  />
                </div>

                <div>
                  <label className={styles.formLabel}>
                    Branch Code
                  </label>
                  <input
                    name="branch_code"
                    defaultValue="198765"
                    className={styles.inputField}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sidebarColumn}>
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarCardHeader}>
                <div className={styles.sidebarHeaderTitle}>
                  <Receipt size={16} className={styles.setIconAmber} />
                  <span>Supplier Credit Terms</span>
                </div>
              </div>

              <div className={styles.formStackCompact}>
                <div>
                  <label className={styles.formLabel}>
                    Default Credit Terms
                  </label>
                  <select
                    name="default_credit_terms"
                    defaultValue="30 Days Net"
                    className={styles.selectField}
                  >
                    <option value="30 Days Net">30 Days Net</option>
                    <option value="60 Days Net">60 Days Net</option>
                    <option value="COD">Cash On Delivery (COD)</option>
                  </select>
                </div>

                <div>
                  <label className={styles.formLabel}>
                    Early Settlement Discount (%)
                  </label>
                  <input
                    name="settlement_discount"
                    defaultValue="2.5% within 7 Days"
                    className={styles.inputField}
                  />
                </div>

                <div className={styles.pt12}>
                  <button type="submit" className={`${styles.primaryBtn} ${styles.wFullBtn}`}>
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
        <div className={styles.formStack}>
          {/* Document & Email Templates */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <FileText size={16} className={styles.setIconTeal} />
                <span>Document & Transactional Email Templates</span>
              </div>
            </div>

            <div className={styles.settingsGrid2}>
              {[
                { title: "Packing Slip Template", desc: "Warehouse pick & pack sheet printed per order.", badge: "PDF / Print" },
                { title: "School RFQ Quote Template", desc: "Bulk school pricing quotation template.", badge: "PDF" },
                { title: "Order Confirmation Email", desc: "Sent to parents immediately upon successful Ozow payment.", badge: "HTML Email" },
                { title: "Packing Complete & Collection Ready", desc: "Automated SMS/Email notification when bag is ready.", badge: "Email + SMS" },
              ].map((tmpl, idx) => (
                <div key={idx} className={styles.templateCard}>
                  <div className={styles.templateCardHead}>
                    <strong className={styles.templateCardTitle}>{tmpl.title}</strong>
                    <span className={styles.badgeTeal}>{tmpl.badge}</span>
                  </div>
                  <p className={styles.templateCardDesc}>{tmpl.desc}</p>
                  <button className={`${styles.secondaryBtn} ${styles.templateEditBtn}`}>
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
                <ImageIcon size={16} className={styles.setIconBlue} />
                <span>Brand Assets & Marketing Collateral</span>
              </div>
            </div>

            <div className={styles.settingsGrid3}>
              <div className={styles.brandAssetBox}>
                <strong className={styles.brandAssetTitle}>Primary Pexpacks Logo</strong>
                <span className={styles.brandAssetSub}>SVG / PNG Vector</span>
              </div>
              <div className={styles.brandAssetBox}>
                <strong className={styles.brandAssetTitle}>Dark Mode Dashboard Logo</strong>
                <span className={styles.brandAssetSub}>White / Mint Variant</span>
              </div>
              <div className={styles.brandAssetBox}>
                <strong className={styles.brandAssetTitle}>School Pack Catalog Banners</strong>
                <span className={styles.brandAssetSub}>High-Res WebP</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
