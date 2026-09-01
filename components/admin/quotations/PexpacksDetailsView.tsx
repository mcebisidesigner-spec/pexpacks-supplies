"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  Globe,
  Building2,
  ScrollText,
  FileCode,
  ArrowLeft,
  Info,
  ShieldCheck,
  CreditCard,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";
import type {
  QuotationAllSettings,
  QuotationSystemInfo,
  QuotationBusiness,
  QuotationAddress,
  QuotationContacts,
  QuotationBanking,
  QuotationNotesTerms,
  QuotationDefaults,
} from "@/lib/admin/quotation-settings";
import {
  updateBusinessAndAddressAction,
  updateBankingDetailsAction,
  updateNotesAndTermsAction,
} from "@/app/admin/quotations/pexpacks-details/actions";
import styles from "./PexpacksDetails.module.css";
import adminStyles from "@/app/admin/admin.module.css";
import { useAdminDialog } from "@/components/admin/ui/AdminDialogContext";
import { DbNotice } from "@/components/admin/ui/DbNotice";

type TabKey = "overview" | "address_contacts" | "banking" | "notes_terms" | "system_info";

interface PexpacksDetailsViewProps {
  initialSettings: QuotationAllSettings;
  systemInfo: QuotationSystemInfo;
}

export function PexpacksDetailsView({ initialSettings, systemInfo }: PexpacksDetailsViewProps) {
  const dialog = useAdminDialog();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [business, setBusiness] = useState<QuotationBusiness>(initialSettings.business);
  const [address, setAddress] = useState<QuotationAddress>(initialSettings.address);
  const [contacts, setContacts] = useState<QuotationContacts>(initialSettings.contacts);
  const [banking, setBanking] = useState<QuotationBanking>(initialSettings.banking);
  const [notesTerms, setNotesTerms] = useState<QuotationNotesTerms>(initialSettings.notesTerms);
  const [defaults] = useState<QuotationDefaults>(initialSettings.defaults);

  // Dirty detection
  const [isAddressDirty, setIsAddressDirty] = useState(false);
  const [isBankingDirty, setIsBankingDirty] = useState(false);
  const [isTermsDirty, setIsTermsDirty] = useState(false);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleTabChange = async (tab: TabKey) => {
    const hasUnsaved =
      (activeTab === "address_contacts" && isAddressDirty) ||
      (activeTab === "banking" && isBankingDirty) ||
      (activeTab === "notes_terms" && isTermsDirty);

    if (hasUnsaved) {
      const discard = await dialog.confirm({
        title: "Unsaved Changes",
        message: "You have unsaved changes in this section. Discard changes and switch tabs?",
        confirmLabel: "Discard & Switch",
        cancelLabel: "Keep Editing",
        variant: "warning",
      });
      if (!discard) {
        return;
      }
    }
    setActiveTab(tab);
  };

  // 1. Save Address & Contacts
  const handleSaveAddressContacts = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateBusinessAndAddressAction({
        business,
        address,
        contacts,
      });
      if (res.success) {
        setIsAddressDirty(false);
        showToast("success", res.message || "Pexpacks quotation business and address details updated.");
      } else {
        showToast("error", res.error || "Failed to update business details.");
      }
    });
  };

  // 2. Save Banking Details
  const handleSaveBanking = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateBankingDetailsAction(banking);
      if (res.success) {
        setIsBankingDirty(false);
        showToast("success", res.message || "Official settlement banking details updated.");
      } else {
        showToast("error", res.error || "Failed to update banking details.");
      }
    });
  };

  // 3. Save Notes & Terms
  const handleSaveNotesTerms = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateNotesAndTermsAction(notesTerms);
      if (res.success) {
        setIsTermsDirty(false);
        showToast("success", res.message || "Quotation notes and terms updated.");
      } else {
        showToast("error", res.error || "Failed to update quotation terms.");
      }
    });
  };

  // Helper to mask account number
  const maskedAccountNumber =
    banking.account_number.length > 4
      ? `••••••${banking.account_number.slice(-4)}`
      : banking.account_number;

  return (
    <div className={styles.container}>
      {/* 1. Header & Navigation Back link */}
      <div>
        <Link href="/admin/quotations" className={styles.backButton}>
          <ArrowLeft size={14} /> Back to Quotations
        </Link>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div style={{ position: "fixed", top: "24px", right: "24px", zIndex: 999999, maxWidth: "min(440px, calc(100vw - 32px))", width: "100%" }}>
          <DbNotice
            type={toastMessage.type}
            message={toastMessage.text}
            onClose={() => setToastMessage(null)}
          />
        </div>
      )}

      {/* 2. Main Two-Column Layout */}
      <div className={styles.layoutGrid}>
        {/* Left Sidebar Card */}
        <aside className={styles.sidebarCard}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>Pexpacks Details</h2>
            <p className={styles.sidebarSubtitle}>
              Configure business and commercial information used in Pexpacks quotations.
            </p>
          </div>

          <nav className={styles.navMenu}>
            <button
              type="button"
              onClick={() => handleTabChange("overview")}
              className={`${styles.navItem} ${activeTab === "overview" ? styles.navItemActive : ""}`}
            >
              <LayoutGrid size={16} />
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("address_contacts")}
              className={`${styles.navItem} ${activeTab === "address_contacts" ? styles.navItemActive : ""}`}
            >
              <Globe size={16} />
              <span>Address &amp; contacts</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("banking")}
              className={`${styles.navItem} ${activeTab === "banking" ? styles.navItemActive : ""}`}
            >
              <Building2 size={16} />
              <span>Banking Details</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("notes_terms")}
              className={`${styles.navItem} ${activeTab === "notes_terms" ? styles.navItemActive : ""}`}
            >
              <ScrollText size={16} />
              <span>Notes &amp; Terms</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("system_info")}
              className={`${styles.navItem} ${activeTab === "system_info" ? styles.navItemActive : ""}`}
            >
              <FileCode size={16} />
              <span>Quotation System Info</span>
            </button>
          </nav>
        </aside>

        {/* Right Content Panel */}
        <main className={styles.contentPanel}>
          {/* ================================================================ */}
          {/* TAB 1: OVERVIEW */}
          {/* ================================================================ */}
          {activeTab === "overview" && (
            <>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>Quotation Commercial Overview</h3>
                  <p className={styles.sectionSubtitle}>
                    High-level business identity, banking, and active commercial settings for Pexpacks quotations.
                  </p>
                </div>
              </div>

              <div className={styles.cardsGrid}>
                {/* 1. Business Identity Card */}
                <div className={styles.card}>
                  <div>
                    <div className={styles.cardHeader}>
                      <div>
                        <h4 className={styles.cardTitle}>Pexpacks Business Identity</h4>
                        <p className={styles.cardSubtitle}>Corporate legal &amp; tax registration</p>
                      </div>
                      <span className={adminStyles.badgeCount}>Official</span>
                    </div>

                    <div className={styles.cardBody} style={{ marginTop: "0.75rem" }}>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Trading Name</span>
                        <span className={styles.infoValue}>{business.trading_name}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Registered Name</span>
                        <span className={styles.infoValue}>{business.registered_name}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Company Reg. No.</span>
                        <span className={styles.infoValue}>{business.reg_number}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>VAT Number</span>
                        <span className={styles.infoValue}>{business.vat_number}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Website</span>
                        <span className={styles.infoValue}>{business.website}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardActionRow}>
                    <button
                      type="button"
                      onClick={() => handleTabChange("address_contacts")}
                      className={styles.manageBtn}
                    >
                      Manage Business &amp; Contacts
                    </button>
                  </div>
                </div>

                {/* 2. Physical Address Card */}
                <div className={styles.card}>
                  <div>
                    <div className={styles.cardHeader}>
                      <div>
                        <h4 className={styles.cardTitle}>Head Office Address</h4>
                        <p className={styles.cardSubtitle}>Printed on official quotation letterheads</p>
                      </div>
                      <MapPin size={16} color="#10b981" />
                    </div>

                    <div className={styles.cardBody} style={{ marginTop: "0.75rem" }}>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Address Line 1</span>
                        <span className={styles.infoValue}>{address.address_line1}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Address Line 2</span>
                        <span className={styles.infoValue}>{address.address_line2 || "—"}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Suburb</span>
                        <span className={styles.infoValue}>{address.suburb}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>City / Province</span>
                        <span className={styles.infoValue}>
                          {address.city}, {address.province}
                        </span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Postal / Country</span>
                        <span className={styles.infoValue}>
                          {address.postal_code}, {address.country}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardActionRow}>
                    <button
                      type="button"
                      onClick={() => handleTabChange("address_contacts")}
                      className={styles.manageBtn}
                    >
                      Manage Address
                    </button>
                  </div>
                </div>

                {/* 3. Contact Details Card */}
                <div className={styles.card}>
                  <div>
                    <div className={styles.cardHeader}>
                      <div>
                        <h4 className={styles.cardTitle}>Quotation Contact Channels</h4>
                        <p className={styles.cardSubtitle}>Communication &amp; email delivery endpoints</p>
                      </div>
                      <Mail size={16} color="#38bdf8" />
                    </div>

                    <div className={styles.cardBody} style={{ marginTop: "0.75rem" }}>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Main Telephone</span>
                        <span className={styles.infoValue}>{contacts.main_phone}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Quotation Email</span>
                        <span className={styles.infoValue}>{contacts.quotation_email}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Finance / Accounts</span>
                        <span className={styles.infoValue}>{contacts.finance_email}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Sender Display</span>
                        <span className={styles.infoValue}>{contacts.sender_display_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardActionRow}>
                    <button
                      type="button"
                      onClick={() => handleTabChange("address_contacts")}
                      className={styles.manageBtn}
                    >
                      Manage Contacts
                    </button>
                  </div>
                </div>

                {/* 4. Banking Summary Card */}
                <div className={styles.card}>
                  <div>
                    <div className={styles.cardHeader}>
                      <div>
                        <h4 className={styles.cardTitle}>Settlement Banking Details</h4>
                        <p className={styles.cardSubtitle}>Bank instructions for quotation payments</p>
                      </div>
                      <CreditCard size={16} color="#fbbf24" />
                    </div>

                    <div className={styles.cardBody} style={{ marginTop: "0.75rem" }}>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Bank Name</span>
                        <span className={styles.infoValue}>{banking.bank_name}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Account Holder</span>
                        <span className={styles.infoValue}>{banking.account_holder}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Account Number</span>
                        <span className={styles.infoValue} style={{ fontFamily: "monospace" }}>
                          {maskedAccountNumber}
                        </span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Account Type</span>
                        <span className={styles.infoValue}>{banking.account_type}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Branch Code</span>
                        <span className={styles.infoValue}>{banking.branch_code}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardActionRow}>
                    <button
                      type="button"
                      onClick={() => handleTabChange("banking")}
                      className={styles.manageBtn}
                    >
                      Manage Banking Details
                    </button>
                  </div>
                </div>

                {/* 5. Quotation Commercial Defaults Card */}
                <div className={styles.card}>
                  <div>
                    <div className={styles.cardHeader}>
                      <div>
                        <h4 className={styles.cardTitle}>Commercial Defaults</h4>
                        <p className={styles.cardSubtitle}>Standard validity, VAT &amp; payment clauses</p>
                      </div>
                      <ShieldCheck size={16} color="#a855f7" />
                    </div>

                    <div className={styles.cardBody} style={{ marginTop: "0.75rem" }}>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Default Validity</span>
                        <span className={styles.infoValue}>{defaults.default_validity_days} days</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Payment Terms</span>
                        <span className={styles.infoValue}>{defaults.default_payment_terms}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>VAT Status</span>
                        <span className={styles.infoValue}>
                          {defaults.vat_enabled ? `${defaults.vat_rate}% (Active)` : "Exempt"}
                        </span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Currency</span>
                        <span className={styles.infoValue}>{defaults.default_currency}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Terms Version</span>
                        <span className={styles.infoValue}>{notesTerms.terms_version}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardActionRow}>
                    <button
                      type="button"
                      onClick={() => handleTabChange("notes_terms")}
                      className={styles.manageBtn}
                    >
                      Manage Notes &amp; Terms
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ================================================================ */}
          {/* TAB 2: ADDRESS & CONTACTS */}
          {/* ================================================================ */}
          {activeTab === "address_contacts" && (
            <form onSubmit={handleSaveAddressContacts} className={styles.contentPanel}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>Address &amp; Contacts Configuration</h3>
                  <p className={styles.sectionSubtitle}>
                    Update company entity details and address used on all future quotation PDFs.
                  </p>
                </div>
              </div>

              <div className={styles.noticeBanner}>
                <Info size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>
                  <strong>Document Impact Notice:</strong> Changes made here will be applied to all future quotation
                  documents. Previously sent and converted quotations will preserve their archived PDF snapshots.
                </span>
              </div>

              {/* Business Identity Card */}
              <div className={styles.formCard}>
                <div>
                  <h4 className={styles.cardTitle}>Business Identity</h4>
                  <p className={styles.cardSubtitle}>Official company legal name, registration, and tax details</p>
                </div>

                <div className={styles.formGrid2}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Registered Business Name</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={business.registered_name}
                      onChange={(e) => {
                        setBusiness({ ...business, registered_name: e.target.value });
                        setIsAddressDirty(true);
                      }}
                      required
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Trading Name</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={business.trading_name}
                      onChange={(e) => {
                        setBusiness({ ...business, trading_name: e.target.value });
                        setIsAddressDirty(true);
                      }}
                      required
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Company Registration Number</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={business.reg_number}
                      onChange={(e) => {
                        setBusiness({ ...business, reg_number: e.target.value });
                        setIsAddressDirty(true);
                      }}
                      required
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>VAT Number</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={business.vat_number}
                      onChange={(e) => {
                        setBusiness({ ...business, vat_number: e.target.value });
                        setIsAddressDirty(true);
                      }}
                      required
                    />
                  </div>

                  <div className={styles.formField} style={{ gridColumn: "1 / -1" }}>
                    <label className={styles.formLabel}>Website URL</label>
                    <input
                      type="url"
                      className={styles.formInput}
                      value={business.website}
                      onChange={(e) => {
                        setBusiness({ ...business, website: e.target.value });
                        setIsAddressDirty(true);
                      }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Physical Address Card */}
              <div className={styles.formCard}>
                <div>
                  <h4 className={styles.cardTitle}>Physical Business Address</h4>
                  <p className={styles.cardSubtitle}>Head Office location printed on the quotation letterhead</p>
                </div>

                <div className={styles.formGrid2}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Address Line 1</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={address.address_line1}
                      onChange={(e) => {
                        setAddress({ ...address, address_line1: e.target.value });
                        setIsAddressDirty(true);
                      }}
                      placeholder="e.g. 33 Kelly Rd"
                      required
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Address Line 2 (Building / Complex)</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={address.address_line2}
                      onChange={(e) => {
                        setAddress({ ...address, address_line2: e.target.value });
                        setIsAddressDirty(true);
                      }}
                      placeholder="e.g. Meerzicht Business Park"
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Suburb</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={address.suburb}
                      onChange={(e) => {
                        setAddress({ ...address, suburb: e.target.value });
                        setIsAddressDirty(true);
                      }}
                      placeholder="e.g. Jet Park"
                      required
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>City / Town</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={address.city}
                      onChange={(e) => {
                        setAddress({ ...address, city: e.target.value });
                        setIsAddressDirty(true);
                      }}
                      placeholder="e.g. Boksburg"
                      required
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Province</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={address.province}
                      onChange={(e) => {
                        setAddress({ ...address, province: e.target.value });
                        setIsAddressDirty(true);
                      }}
                      placeholder="e.g. Gauteng"
                      required
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Postal Code</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={address.postal_code}
                      onChange={(e) => {
                        setAddress({ ...address, postal_code: e.target.value });
                        setIsAddressDirty(true);
                      }}
                      placeholder="e.g. 1459"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Channels Card */}
              <div className={styles.formCard}>
                <div>
                  <h4 className={styles.cardTitle}>Primary Quotation Contacts</h4>
                  <p className={styles.cardSubtitle}>Contact phone numbers and email channels</p>
                </div>

                <div className={styles.formGrid2}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Main Telephone</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={contacts.main_phone}
                      onChange={(e) => {
                        setContacts({ ...contacts, main_phone: e.target.value });
                        setIsAddressDirty(true);
                      }}
                      placeholder="e.g. 078 003 6048"
                      required
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Support / WhatsApp Telephone</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={contacts.support_phone}
                      onChange={(e) => {
                        setContacts({ ...contacts, support_phone: e.target.value });
                        setIsAddressDirty(true);
                      }}
                      placeholder="e.g. 078 003 6048"
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Quotation Delivery Email</label>
                    <input
                      type="email"
                      className={styles.formInput}
                      value={contacts.quotation_email}
                      onChange={(e) => {
                        setContacts({ ...contacts, quotation_email: e.target.value });
                        setIsAddressDirty(true);
                      }}
                      placeholder="e.g. helpme@pexpacks.co.za"
                      required
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Accounts / Finance Email</label>
                    <input
                      type="email"
                      className={styles.formInput}
                      value={contacts.finance_email}
                      onChange={(e) => {
                        setContacts({ ...contacts, finance_email: e.target.value });
                        setIsAddressDirty(true);
                      }}
                      placeholder="e.g. accounts@pexpacks.co.za"
                      required
                    />
                  </div>

                  <div className={styles.formField} style={{ gridColumn: "1 / -1" }}>
                    <label className={styles.formLabel}>Quotation Sender Display Name</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={contacts.sender_display_name}
                      onChange={(e) => {
                        setContacts({ ...contacts, sender_display_name: e.target.value });
                        setIsAddressDirty(true);
                      }}
                      placeholder="e.g. Pexpacks Supplies Quotations Desk"
                    />
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className={styles.actionFooter}>
                <button
                  type="button"
                  onClick={() => {
                    setBusiness(initialSettings.business);
                    setAddress(initialSettings.address);
                    setContacts(initialSettings.contacts);
                    setIsAddressDirty(false);
                  }}
                  className={styles.cancelBtn}
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={isPending}>
                  {isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {/* ================================================================ */}
          {/* TAB 3: BANKING DETAILS */}
          {/* ================================================================ */}
          {activeTab === "banking" && (
            <form onSubmit={handleSaveBanking} className={styles.contentPanel}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>Settlement Banking Details</h3>
                  <p className={styles.sectionSubtitle}>
                    Manage the authoritative bank account instructions displayed on all official Pexpacks quotations.
                  </p>
                </div>
              </div>

              <div className={styles.noticeBanner}>
                <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>
                  <strong>Security &amp; Audit Notice:</strong> Banking information is securely access-controlled. All
                  modifications are recorded in the immutable audit log with sensitive account masking.
                </span>
              </div>

              <div className={styles.formCard}>
                <div>
                  <h4 className={styles.cardTitle}>Official Settlement Account</h4>
                  <p className={styles.cardSubtitle}>Primary bank account used for EFT and quotation deposits</p>
                </div>

                <div className={styles.formGrid2}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Bank Name</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={banking.bank_name}
                      onChange={(e) => {
                        setBanking({ ...banking, bank_name: e.target.value });
                        setIsBankingDirty(true);
                      }}
                      placeholder="e.g. FNB / RMB"
                      required
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Account Holder</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={banking.account_holder}
                      onChange={(e) => {
                        setBanking({ ...banking, account_holder: e.target.value });
                        setIsBankingDirty(true);
                      }}
                      placeholder="e.g. Pexpacks"
                      required
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Account Number</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={banking.account_number}
                      onChange={(e) => {
                        setBanking({ ...banking, account_number: e.target.value });
                        setIsBankingDirty(true);
                      }}
                      placeholder="e.g. 63215756991"
                      required
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Account Type</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={banking.account_type}
                      onChange={(e) => {
                        setBanking({ ...banking, account_type: e.target.value });
                        setIsBankingDirty(true);
                      }}
                      placeholder="e.g. Current Account / Cheque"
                      required
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Branch Name</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={banking.branch_name}
                      onChange={(e) => {
                        setBanking({ ...banking, branch_name: e.target.value });
                        setIsBankingDirty(true);
                      }}
                      placeholder="e.g. Universal Branch"
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Branch Code</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={banking.branch_code}
                      onChange={(e) => {
                        setBanking({ ...banking, branch_code: e.target.value });
                        setIsBankingDirty(true);
                      }}
                      placeholder="e.g. 250655"
                      required
                    />
                  </div>

                  <div className={styles.formField} style={{ gridColumn: "1 / -1" }}>
                    <label className={styles.formLabel}>Payment Reference Instructions</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={banking.payment_reference_instructions}
                      onChange={(e) => {
                        setBanking({ ...banking, payment_reference_instructions: e.target.value });
                        setIsBankingDirty(true);
                      }}
                      placeholder="e.g. Use Quotation Number as payment reference (e.g. PX-Q-YYYY-XXXX)"
                    />
                  </div>

                  <div className={styles.formField} style={{ gridColumn: "1 / -1" }}>
                    <label className={styles.formLabel}>Settlement / Banking Notes</label>
                    <textarea
                      className={styles.formTextarea}
                      value={banking.banking_notes}
                      onChange={(e) => {
                        setBanking({ ...banking, banking_notes: e.target.value });
                        setIsBankingDirty(true);
                      }}
                      placeholder="e.g. Please email proof of payment to helpme@pexpacks.co.za"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className={styles.actionFooter}>
                <button
                  type="button"
                  onClick={() => {
                    setBanking(initialSettings.banking);
                    setIsBankingDirty(false);
                  }}
                  className={styles.cancelBtn}
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={isPending}>
                  {isPending ? "Saving..." : "Save Banking Details"}
                </button>
              </div>
            </form>
          )}

          {/* ================================================================ */}
          {/* TAB 4: NOTES & TERMS */}
          {/* ================================================================ */}
          {activeTab === "notes_terms" && (
            <form onSubmit={handleSaveNotesTerms} className={styles.contentPanel}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>Quotation Notes &amp; Terms</h3>
                  <p className={styles.sectionSubtitle}>
                    Standard introductory messaging and formal commercial terms &amp; conditions.
                  </p>
                </div>
                <span className={adminStyles.badgeCount}>Version {notesTerms.terms_version}</span>
              </div>

              {/* Quotation Notes Card */}
              <div className={styles.formCard}>
                <div>
                  <h4 className={styles.cardTitle}>Default Quotation Notes</h4>
                  <p className={styles.cardSubtitle}>
                    Standard introductory note displayed above or alongside commercial terms
                  </p>
                </div>

                <div className={styles.formField}>
                  <textarea
                    className={styles.formTextarea}
                    value={notesTerms.quotation_notes}
                    onChange={(e) => {
                      setNotesTerms({ ...notesTerms, quotation_notes: e.target.value });
                      setIsTermsDirty(true);
                    }}
                    placeholder="Enter default quotation message..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Terms & Conditions Card */}
              <div className={styles.formCard}>
                <div>
                  <h4 className={styles.cardTitle}>Terms &amp; Conditions Clauses</h4>
                  <p className={styles.cardSubtitle}>
                    Legal &amp; operational clauses regarding quote validity, packaging, delivery, and payment terms
                  </p>
                </div>

                <div className={styles.formField}>
                  <textarea
                    className={styles.formTextarea}
                    value={notesTerms.terms_and_conditions}
                    onChange={(e) => {
                      setNotesTerms({ ...notesTerms, terms_and_conditions: e.target.value });
                      setIsTermsDirty(true);
                    }}
                    placeholder="Enter terms and conditions..."
                    rows={8}
                    required
                  />
                </div>

                <div className={styles.formGrid2}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Terms Version</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={notesTerms.terms_version}
                      onChange={(e) => {
                        setNotesTerms({ ...notesTerms, terms_version: e.target.value });
                        setIsTermsDirty(true);
                      }}
                      placeholder="e.g. v1.3"
                    />
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className={styles.actionFooter}>
                <button
                  type="button"
                  onClick={() => {
                    setNotesTerms(initialSettings.notesTerms);
                    setIsTermsDirty(false);
                  }}
                  className={styles.cancelBtn}
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={isPending}>
                  {isPending ? "Saving..." : "Save Notes & Terms"}
                </button>
              </div>
            </form>
          )}

          {/* ================================================================ */}
          {/* TAB 5: QUOTATION SYSTEM INFO */}
          {/* ================================================================ */}
          {activeTab === "system_info" && (
            <div className={styles.contentPanel}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>Quotation System Telemetry &amp; Defaults</h3>
                  <p className={styles.sectionSubtitle}>
                    Safe document generation metadata, sequence counters, and template diagnostics.
                  </p>
                </div>
              </div>

              <div className={styles.cardsGrid}>
                {/* 1. Numbering Sequence Card */}
                <div className={styles.card}>
                  <div>
                    <div className={styles.cardHeader}>
                      <div>
                        <h4 className={styles.cardTitle}>Quotation Numbering</h4>
                        <p className={styles.cardSubtitle}>Deterministic sequential reference pattern</p>
                      </div>
                      <span className={adminStyles.badgeCount}>{systemInfo.currentYear}</span>
                    </div>

                    <div className={styles.cardBody} style={{ marginTop: "0.75rem" }}>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Prefix Pattern</span>
                        <span className={styles.infoValue}>{systemInfo.prefix}-YYYY-XXXX</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Current Year</span>
                        <span className={styles.infoValue}>{systemInfo.currentYear}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Next Sequential Quote</span>
                        <span className={styles.infoValue} style={{ color: "#10b981", fontWeight: 700 }}>
                          {systemInfo.nextQuoteNumber}
                        </span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Total Quotations Created</span>
                        <span className={styles.infoValue}>{systemInfo.totalQuotationsCount}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Latest Quote ID</span>
                        <span className={styles.infoValue}>{systemInfo.latestQuoteNumber || "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. PDF Template Engine Card */}
                <div className={styles.card}>
                  <div>
                    <div className={styles.cardHeader}>
                      <div>
                        <h4 className={styles.cardTitle}>Document &amp; PDF Template</h4>
                        <p className={styles.cardSubtitle}>React-PDF compilation engine state</p>
                      </div>
                      <FileCode size={16} color="#10b981" />
                    </div>

                    <div className={styles.cardBody} style={{ marginTop: "0.75rem" }}>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Active Template</span>
                        <span className={styles.infoValue}>{systemInfo.activePdfTemplate}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Template Version</span>
                        <span className={styles.infoValue}>{systemInfo.pdfTemplateVersion}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Active Season</span>
                        <span className={styles.infoValue} style={{ color: "#38bdf8", fontWeight: 600 }}>
                          {systemInfo.activeSeason}
                        </span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Page Format</span>
                        <span className={styles.infoValue}>A4 Standard Portrait</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Commercial Engine Defaults Card */}
                <div className={styles.card}>
                  <div>
                    <div className={styles.cardHeader}>
                      <div>
                        <h4 className={styles.cardTitle}>Commercial Defaults</h4>
                        <p className={styles.cardSubtitle}>Global rules applied to new quotes</p>
                      </div>
                      <ShieldCheck size={16} color="#fbbf24" />
                    </div>

                    <div className={styles.cardBody} style={{ marginTop: "0.75rem" }}>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Default Currency</span>
                        <span className={styles.infoValue}>{systemInfo.currency}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Default Validity</span>
                        <span className={styles.infoValue}>{systemInfo.defaultValidityDays} Calendar Days</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>VAT Calculation</span>
                        <span className={styles.infoValue}>
                          {systemInfo.vatEnabled ? `${systemInfo.vatRate}% Included` : "Zero Rated"}
                        </span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Default Settlement</span>
                        <span className={styles.infoValue}>{systemInfo.defaultPaymentTerms}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Telemetry & Audit History Card */}
                <div className={styles.card}>
                  <div>
                    <div className={styles.cardHeader}>
                      <div>
                        <h4 className={styles.cardTitle}>Audit &amp; Operational Dates</h4>
                        <p className={styles.cardSubtitle}>Latest quotation activity timestamps</p>
                      </div>
                      <Clock size={16} color="#a855f7" />
                    </div>

                    <div className={styles.cardBody} style={{ marginTop: "0.75rem" }}>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Latest Quote Created</span>
                        <span className={styles.infoValue}>
                          {systemInfo.latestQuoteCreatedAt
                            ? new Date(systemInfo.latestQuoteCreatedAt).toLocaleString("en-ZA")
                            : "—"}
                        </span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Latest Quote Sent</span>
                        <span className={styles.infoValue}>
                          {systemInfo.latestQuoteSentAt
                            ? new Date(systemInfo.latestQuoteSentAt).toLocaleString("en-ZA")
                            : "—"}
                        </span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Last Settings Modified</span>
                        <span className={styles.infoValue}>
                          {systemInfo.lastSettingsUpdated
                            ? new Date(systemInfo.lastSettingsUpdated).toLocaleString("en-ZA")
                            : "—"}
                        </span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Modified By</span>
                        <span className={styles.infoValue}>{systemInfo.lastSettingsUpdatedBy}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
