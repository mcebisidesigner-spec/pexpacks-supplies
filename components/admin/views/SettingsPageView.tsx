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
import adminStyles from "@/app/admin/admin.module.css";

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
      <div className={adminStyles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>Settings & Configuration</h1>
          <p className={styles.headerSubtitle}>
            Manage operational defaults, user access matrix, financial parameters, and document templates.
          </p>
        </div>
      </div>

      {/* Responsive 4-Tab Navigation Bar */}
      <div className={adminStyles.settingsTabBar}>
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
                isActive ? adminStyles.settingsTabBtnActive : adminStyles.settingsTabBtnInactive,
                adminStyles.settingsTabBtn,
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
        <form action="/admin/settings/general" method="GET" className={adminStyles.detailLayout}>
          <div className={adminStyles.formStack}>
            {/* Company Information */}
            <div className={adminStyles.sidebarCard}>
              <div className={adminStyles.sidebarCardHeader}>
                <div className={adminStyles.sidebarHeaderTitle}>
                  <Building2 size={16} className={adminStyles.setIconTeal} />
                  <span>Company Identity & Legal Registration</span>
                </div>
              </div>

              <div className={adminStyles.settingsGrid2}>
                <div>
                  <label className={adminStyles.formLabel}>
                    Legal Entity Name
                  </label>
                  <input
                    name="company_name"
                    defaultValue="Pexpacks Supplies (Pty) Ltd"
                    className={adminStyles.inputField}
                  />
                </div>

                <div>
                  <label className={adminStyles.formLabel}>
                    CIPC Registration Number
                  </label>
                  <input
                    name="reg_number"
                    defaultValue="2024/182736/07"
                    className={adminStyles.inputField}
                  />
                </div>

                <div>
                  <label className={adminStyles.formLabel}>
                    SARS VAT Registration Number
                  </label>
                  <input
                    name="vat_number"
                    defaultValue="4920192837"
                    className={adminStyles.inputField}
                  />
                </div>

                <div>
                  <label className={adminStyles.formLabel}>
                    Support Email Address
                  </label>
                  <input
                    type="email"
                    name="support_email"
                    defaultValue="care@pexpacks.co.za"
                    className={adminStyles.inputField}
                  />
                </div>
              </div>
            </div>

            {/* Address & Operational Hours */}
            <div className={adminStyles.sidebarCard}>
              <div className={adminStyles.sidebarCardHeader}>
                <div className={adminStyles.sidebarHeaderTitle}>
                  <Globe size={16} className={adminStyles.setIconBlue} />
                  <span>Physical Address & Time Zone</span>
                </div>
              </div>

              <div className={adminStyles.settingsGrid2}>
                <div>
                  <label className={adminStyles.formLabel}>
                    Physical Warehouse Address
                  </label>
                  <textarea
                    name="address"
                    rows={3}
                    defaultValue="128 Logistics Hub, Midrand Industrial Park, Midrand, Gauteng, 1685"
                    className={adminStyles.textareaField}
                  />
                </div>

                <div className={adminStyles.sidebarItemStack}>
                  <div>
                    <label className={adminStyles.formLabel}>
                      System Time Zone
                    </label>
                    <input
                      name="timezone"
                      defaultValue="Africa/Johannesburg (SAST UTC+2)"
                      disabled
                      className={`${adminStyles.inputField} ${adminStyles.inputFieldMuted}`}
                    />
                  </div>

                  <div>
                    <label className={adminStyles.formLabel}>
                      Operating Hours
                    </label>
                    <input
                      name="operating_hours"
                      defaultValue="Mon - Fri: 07:30 - 17:00 SAST"
                      className={adminStyles.inputField}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={adminStyles.sidebarColumn}>
            <div className={adminStyles.sidebarCard}>
              <div className={adminStyles.sidebarCardHeader}>
                <div className={adminStyles.sidebarHeaderTitle}>
                  <Mail size={16} className={adminStyles.setIconAmber} />
                  <span>Communication Defaults</span>
                </div>
              </div>

              <div className={adminStyles.formStackCompact}>
                {[
                  { label: "Send Automated Order Confirmation Emails", active: true },
                  { label: "Send Dispatch SMS Notifications to Parents", active: true },
                  { label: "Send Payment Reminder Notifications", active: true },
                  { label: "Weekly School Procurement Digest", active: false },
                ].map((pref) => (
                  <div key={pref.label} className={adminStyles.prefRow}>
                    <span className={adminStyles.prefLabel}>{pref.label}</span>
                    <input type="checkbox" defaultChecked={pref.active} className={adminStyles.settingsCheckbox} />
                  </div>
                ))}

                <div className={adminStyles.pt12}>
                  <button type="submit" className={`${styles.primaryBtn} ${adminStyles.wFullBtn}`}>
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
        <div className={adminStyles.formStack}>
          <div className={adminStyles.headerRow}>
            <div className={styles.headerTitleGroup}>
              <h2 className={adminStyles.userSectionTitle}>Administrative Users & Access Matrix</h2>
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
          <div className={adminStyles.tableCard}>
            <div className={adminStyles.tableWrapper}>
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
                      <td><strong className={adminStyles.tableUserName}>{user.name}</strong></td>
                      <td>{user.email}</td>
                      <td><span className={adminStyles.badgeTeal}>{user.role}</span></td>
                      <td><span className={adminStyles.tablePerms}>{user.perms}</span></td>
                      <td><span className={adminStyles.badgeGreen}>{user.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Permission Matrix Toggles Card */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Shield size={16} className={adminStyles.setIconGreen} />
                <span>Role Permission Matrix Configuration</span>
              </div>
            </div>

            <div className={adminStyles.permGrid3}>
              <div>
                <strong className={adminStyles.permGroupTitle}>Catalogue & Master Products</strong>
                <div className={adminStyles.checkboxStack}>
                  <label><input type="checkbox" defaultChecked /> Create / Edit Master Items</label>
                  <label><input type="checkbox" defaultChecked /> Delete Catalogue Items</label>
                  <label><input type="checkbox" defaultChecked /> Modify Margin Rules</label>
                </div>
              </div>

              <div>
                <strong className={adminStyles.permGroupTitle}>Orders & Commerce</strong>
                <div className={adminStyles.checkboxStack}>
                  <label><input type="checkbox" defaultChecked /> View Orders</label>
                  <label><input type="checkbox" defaultChecked /> Issue Order Refunds</label>
                  <label><input type="checkbox" defaultChecked /> Delete Orders (Super Admin Only)</label>
                </div>
              </div>

              <div>
                <strong className={adminStyles.permGroupTitle}>Financial & Settlements</strong>
                <div className={adminStyles.checkboxStack}>
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
        <form action="/admin/settings/financial" method="GET" className={adminStyles.detailLayout}>
          <div className={adminStyles.formStack}>
            {/* Tax & Invoicing */}
            <div className={adminStyles.sidebarCard}>
              <div className={adminStyles.sidebarCardHeader}>
                <div className={adminStyles.sidebarHeaderTitle}>
                  <Receipt size={16} className={adminStyles.setIconTeal} />
                  <span>Tax & Invoice Configuration</span>
                </div>
              </div>

              <div className={adminStyles.settingsGrid2}>
                <div>
                  <label className={adminStyles.formLabel}>
                    Standard South African VAT Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="vat_rate"
                    defaultValue="15.0"
                    className={adminStyles.inputField}
                  />
                </div>

                <div>
                  <label className={adminStyles.formLabel}>
                    Invoice Reference Prefix
                  </label>
                  <input
                    name="invoice_prefix"
                    defaultValue="PX-INV-"
                    className={adminStyles.inputField}
                  />
                </div>
              </div>
            </div>

            {/* Banking Details */}
            <div className={adminStyles.sidebarCard}>
              <div className={adminStyles.sidebarCardHeader}>
                <div className={adminStyles.sidebarHeaderTitle}>
                  <CreditCard size={16} className={adminStyles.setIconGreen} />
                  <span>Settlement Bank Account Details (EFT)</span>
                </div>
              </div>

              <div className={adminStyles.settingsGrid3}>
                <div>
                  <label className={adminStyles.formLabel}>
                    Bank Name
                  </label>
                  <input
                    name="bank_name"
                    defaultValue="Nedbank South Africa"
                    className={adminStyles.inputField}
                  />
                </div>

                <div>
                  <label className={adminStyles.formLabel}>
                    Account Number
                  </label>
                  <input
                    name="account_number"
                    defaultValue="1029384756"
                    className={adminStyles.inputField}
                  />
                </div>

                <div>
                  <label className={adminStyles.formLabel}>
                    Branch Code
                  </label>
                  <input
                    name="branch_code"
                    defaultValue="198765"
                    className={adminStyles.inputField}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={adminStyles.sidebarColumn}>
            <div className={adminStyles.sidebarCard}>
              <div className={adminStyles.sidebarCardHeader}>
                <div className={adminStyles.sidebarHeaderTitle}>
                  <Receipt size={16} className={adminStyles.setIconAmber} />
                  <span>Supplier Credit Terms</span>
                </div>
              </div>

              <div className={adminStyles.formStackCompact}>
                <div>
                  <label className={adminStyles.formLabel}>
                    Default Credit Terms
                  </label>
                  <select
                    name="default_credit_terms"
                    defaultValue="30 Days Net"
                    className={adminStyles.selectField}
                  >
                    <option value="30 Days Net">30 Days Net</option>
                    <option value="60 Days Net">60 Days Net</option>
                    <option value="COD">Cash On Delivery (COD)</option>
                  </select>
                </div>

                <div>
                  <label className={adminStyles.formLabel}>
                    Early Settlement Discount (%)
                  </label>
                  <input
                    name="settlement_discount"
                    defaultValue="2.5% within 7 Days"
                    className={adminStyles.inputField}
                  />
                </div>

                <div className={adminStyles.pt12}>
                  <button type="submit" className={`${styles.primaryBtn} ${adminStyles.wFullBtn}`}>
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
        <div className={adminStyles.formStack}>
          {/* Document & Email Templates */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <FileText size={16} className={adminStyles.setIconTeal} />
                <span>Document & Transactional Email Templates</span>
              </div>
            </div>

            <div className={adminStyles.settingsGrid2}>
              {[
                { title: "Packing Slip Template", desc: "Warehouse pick & pack sheet printed per order.", badge: "PDF / Print" },
                { title: "School RFQ Quote Template", desc: "Bulk school pricing quotation template.", badge: "PDF" },
                { title: "Order Confirmation Email", desc: "Sent to parents immediately upon successful Ozow payment.", badge: "HTML Email" },
                { title: "Packing Complete & Collection Ready", desc: "Automated SMS/Email notification when bag is ready.", badge: "Email + SMS" },
              ].map((tmpl, idx) => (
                <div key={idx} className={adminStyles.templateCard}>
                  <div className={adminStyles.templateCardHead}>
                    <strong className={adminStyles.templateCardTitle}>{tmpl.title}</strong>
                    <span className={adminStyles.badgeTeal}>{tmpl.badge}</span>
                  </div>
                  <p className={adminStyles.templateCardDesc}>{tmpl.desc}</p>
                  <button className={`${styles.secondaryBtn} ${adminStyles.templateEditBtn}`}>
                    Edit Template
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Brand Assets & Product Media */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <ImageIcon size={16} className={adminStyles.setIconBlue} />
                <span>Brand Assets & Marketing Collateral</span>
              </div>
            </div>

            <div className={adminStyles.settingsGrid3}>
              <div className={adminStyles.brandAssetBox}>
                <strong className={adminStyles.brandAssetTitle}>Primary Pexpacks Logo</strong>
                <span className={adminStyles.brandAssetSub}>SVG / PNG Vector</span>
              </div>
              <div className={adminStyles.brandAssetBox}>
                <strong className={adminStyles.brandAssetTitle}>Dark Mode Dashboard Logo</strong>
                <span className={adminStyles.brandAssetSub}>White / Mint Variant</span>
              </div>
              <div className={adminStyles.brandAssetBox}>
                <strong className={adminStyles.brandAssetTitle}>School Pack Catalog Banners</strong>
                <span className={adminStyles.brandAssetSub}>High-Res WebP</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
