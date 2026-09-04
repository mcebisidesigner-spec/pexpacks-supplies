"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Building2,
  User,
  Send,
  Download,
  Eye,
  Save,
  Plus,
  Trash2,
  Mail,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import {
  saveLetterAction,
  emailLetterAction,
} from "@/app/admin/letters/actions";
import type {
  AdminLetter,
  AdminLetterInsert,
  LetterQuotationPayload,
  LetterQuotationItem,
} from "@/lib/admin/letters";
import { formatRandFromCents } from "@/lib/admin/quotation";
import styles from "./LetterEditor.module.css";
import modalStyles from "@/components/admin/quotations/QuotationModal.module.css";

interface SchoolOption {
  id: string;
  name: string;
  emis_number?: string | null;
  province?: string | null;
  contact_person?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  physical_address?: string | null;
}

interface QuotationOption {
  id: string;
  quotation_number: string;
  school_name?: string | null;
  recipient_name?: string | null;
  recipient_email?: string | null;
  total_cents: number;
  items?: any[];
}

interface LetterEditorProps {
  initialLetter?: AdminLetter | null;
  schools: SchoolOption[];
  existingQuotations?: QuotationOption[];
}

const PRESET_TEMPLATES = [
  {
    id: "partnership",
    name: "Partnership Proposal",
    subject: "Institutional Stationery & Scholastic Supply Partnership — 2026/2027 Academic Year",
    content: `Dear Principal and School Governing Body,

We are pleased to introduce PexPacks Supplies as your dedicated partner for institutional stationery, scholastic packs, and classroom essentials.

Our mission is to simplify school procurement by delivering premium educational materials directly to your institution with guaranteed supply continuity, wholesale preferential pricing, and tailored delivery schedules.

Key Highlights of Our Institutional Offering:
• Pre-packaged, learner-specific stationery kits tailored to curriculum requirements
• Substantial bulk procurement savings and dedicated institutional credit terms
• Direct-to-school logistics with white-glove palletized delivery and sorting
• Guaranteed stock availability for all major South African scholastic specifications

We invite you to review our attached commercial proposal and schedule a brief introductory consultation with our education procurement team.

We look forward to fostering an enduring and mutually rewarding partnership with your esteemed institution.`,
  },
  {
    id: "quotation_transmittal",
    name: "Quotation Transmittal",
    subject: "Formal Quotation Transmittal: Institutional Scholastic & Office Supplies",
    content: `Dear School Management Team,

Please find enclosed our formal commercial quotation for the requested scholastic supplies and educational stationery packs.

All quoted line items have been carefully vetted to ensure compliance with Department of Basic Education specifications, high manufacturing durability, and maximum cost efficiency.

Terms & Commercial Conditions:
• Validity: This quotation is strictly valid for 30 calendar days from the date of issue.
• Delivery Timelines: Estimated delivery within 3–5 business days following formal purchase order sign-off.
• Settlement: Payment terms as per our approved institutional credit agreement or EFT prior to dispatch.

Should you require any line-item adjustments or additional bundle customizations, please do not hesitate to contact our administrative desk directly.`,
  },
  {
    id: "credit_terms",
    name: "Credit Terms Application",
    subject: "Formal Notification: 30-Day Institutional Account Facility & Settlement Terms",
    content: `Dear Finance Office / Bursar,

Following our recent commercial review, PexPacks Supplies is pleased to confirm the approval of your institutional 30-Day Commercial Account facility.

Account Specifications:
• Approved Billing Entity: School Governing Body / Commercial Desk
• Standard Payment Terms: Strictly 30 days from date of monthly statement
• Remittance Address: accounts@pexpacks.co.za

To ensure seamless order dispatch throughout the academic term, please ensure all authorized purchase orders reference your official institutional customer code.

Thank you for choosing PexPacks Supplies as your trusted scholastic distribution partner.`,
  },
  {
    id: "general",
    name: "General Commercial Notice",
    subject: "Commercial Update & Term Notice from PexPacks Supplies",
    content: `Dear Valued Partner,

We are writing to provide an important administrative and operational update regarding upcoming procurement deadlines and delivery logistics for the forthcoming school term.

Our team remains fully dedicated to providing unparalleled customer care and uninterrupted distribution across all contracted regions.

Please feel free to reach out directly should you have any questions or require custom supply arrangements for your campus.`,
  },
];

export function LetterEditor({
  initialLetter,
  schools,
  existingQuotations = [],
}: LetterEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Mode & Recipient
  const [recipientMode, setRecipientMode] = useState<"school" | "manual">(
    initialLetter?.recipient_mode || (initialLetter?.school_id ? "school" : "manual")
  );
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(
    initialLetter?.school_id || ""
  );
  const [schoolSearchQuery, setSchoolSearchQuery] = useState<string>("");
  const [showSchoolDropdown, setShowSchoolDropdown] = useState<boolean>(false);

  // Recipient Fields
  const [recipientName, setRecipientName] = useState<string>(
    initialLetter?.recipient_name || ""
  );
  const [recipientTitle, setRecipientTitle] = useState<string>(
    initialLetter?.recipient_title || ""
  );
  const [recipientOrg, setRecipientOrg] = useState<string>(
    initialLetter?.recipient_organization || ""
  );
  const [recipientEmail, setRecipientEmail] = useState<string>(
    initialLetter?.recipient_email || ""
  );
  const [recipientPhone, setRecipientPhone] = useState<string>(
    initialLetter?.recipient_phone || ""
  );
  const [recipientAddress, setRecipientAddress] = useState<string>(
    initialLetter?.recipient_address || ""
  );

  // Document Fields
  const [subject, setSubject] = useState<string>(
    initialLetter?.subject || "Institutional Stationery & Scholastic Supply Partnership"
  );
  const [content, setContent] = useState<string>(
    initialLetter?.content || PRESET_TEMPLATES[0].content
  );
  const [signatoryName, setSignatoryName] = useState<string>(
    initialLetter?.signatory_name || "Mcebisi Hlatshwayo"
  );
  const [signatoryTitle, setSignatoryTitle] = useState<string>(
    initialLetter?.signatory_title || "Managing Director"
  );
  const [signatoryEmail, setSignatoryEmail] = useState<string>(
    initialLetter?.signatory_email || "info@pexpacks.co.za"
  );
  const [signatoryPhone, setSignatoryPhone] = useState<string>(
    initialLetter?.signatory_phone || "+27 81 234 5678"
  );

  // Quotation Integration
  const [includeQuotation, setIncludeQuotation] = useState<boolean>(
    initialLetter?.include_quotation || false
  );
  const [quotationRefId, setQuotationRefId] = useState<string>(
    initialLetter?.quotation_id || ""
  );
  const [quotationTitle, setQuotationTitle] = useState<string>(
    initialLetter?.quotation_payload?.title || "Itemized Quotation Schedule"
  );
  const [quotationNotes, setQuotationNotes] = useState<string>(
    initialLetter?.quotation_payload?.notes || "All prices include 15% VAT where applicable. Valid for 30 days."
  );
  const [quotationItems, setQuotationItems] = useState<LetterQuotationItem[]>(
    initialLetter?.quotation_payload?.items || [
      {
        id: "item-1",
        description: "Grade R-7 Comprehensive Stationery Pack",
        quantity: 100,
        unit_price_cents: 25000,
        vat_rate: 0.15,
        total_cents: 2500000,
      },
      {
        id: "item-2",
        description: "Standard Blue Ballpoint Pens (Box of 50)",
        quantity: 20,
        unit_price_cents: 12500,
        vat_rate: 0.15,
        total_cents: 250000,
      },
    ]
  );

  // UI state
  const [activeTemplate, setActiveTemplate] = useState<string>("partnership");
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [emailModalOpen, setEmailModalOpen] = useState<boolean>(false);
  const [emailSubject, setEmailSubject] = useState<string>(
    `Official PexPacks Letter: ${subject}`
  );
  const [emailBodyMessage, setEmailBodyMessage] = useState<string>(
    `Dear ${recipientName || "Valued Partner"},\n\nPlease find attached the official correspondence from PexPacks Supplies.\n\nKind regards,\n${signatoryName}\n${signatoryTitle}\nPexPacks Supplies`
  );
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Filter schools
  const filteredSchools = schools.filter(
    (s) =>
      s.name.toLowerCase().includes(schoolSearchQuery.toLowerCase()) ||
      (s.emis_number && s.emis_number.includes(schoolSearchQuery))
  );

  // On school select
  function handleSelectSchool(school: SchoolOption) {
    setSelectedSchoolId(school.id);
    setRecipientOrg(school.name);
    if (school.contact_person) setRecipientName(school.contact_person);
    if (school.contact_email) setRecipientEmail(school.contact_email);
    if (school.contact_phone) setRecipientPhone(school.contact_phone);
    if (school.physical_address) setRecipientAddress(school.physical_address);
    setSchoolSearchQuery(school.name);
    setShowSchoolDropdown(false);
  }

  // Preset Template Apply
  function handleApplyTemplate(template: typeof PRESET_TEMPLATES[0]) {
    setActiveTemplate(template.id);
    setSubject(template.subject);
    setContent(template.content);
  }

  // Quotation calculations
  const quoteSubtotalCents = quotationItems.reduce(
    (sum, item) => sum + item.unit_price_cents * item.quantity,
    0
  );
  const quoteVatCents = Math.round(quoteSubtotalCents * 0.15);
  const quoteTotalCents = quoteSubtotalCents + quoteVatCents;

  function handleAddQuoteItem() {
    setQuotationItems([
      ...quotationItems,
      {
        id: `item-${Date.now()}`,
        description: "Scholastic Material Item",
        quantity: 1,
        unit_price_cents: 1000,
        vat_rate: 0.15,
        total_cents: 1000,
      },
    ]);
  }

  function handleUpdateQuoteItem(
    index: number,
    field: keyof LetterQuotationItem,
    val: any
  ) {
    const next = [...quotationItems];
    const current = { ...next[index], [field]: val };
    if (field === "quantity" || field === "unit_price_cents") {
      current.total_cents = Number(current.quantity) * Number(current.unit_price_cents);
    }
    next[index] = current;
    setQuotationItems(next);
  }

  function handleRemoveQuoteItem(index: number) {
    setQuotationItems(quotationItems.filter((_, i) => i !== index));
  }

  // Pull in existing quotation
  function handleSelectExistingQuotation(quoteId: string) {
    setQuotationRefId(quoteId);
    const quote = existingQuotations.find((q) => q.id === quoteId);
    if (quote && quote.items && quote.items.length > 0) {
      setQuotationItems(
        quote.items.map((item: any, idx: number) => ({
          id: item.id || `item-${idx}`,
          sku: item.sku || "",
          description: item.description || item.title || "Quoted Product",
          quantity: item.quantity || 1,
          unit_price_cents: item.unit_price_cents || 0,
          vat_rate: item.vat_rate || 0.15,
          total_cents: (item.quantity || 1) * (item.unit_price_cents || 0),
        }))
      );
    }
  }

  // Save Document
  async function handleSave(status: "draft" | "generated" = "draft") {
    setFeedback(null);

    const quotationPayload: LetterQuotationPayload | undefined = includeQuotation
      ? {
          title: quotationTitle,
          notes: quotationNotes,
          items: quotationItems,
          subtotal_cents: quoteSubtotalCents,
          vat_cents: quoteVatCents,
          total_cents: quoteTotalCents,
        }
      : undefined;

    const payload: AdminLetterInsert = {
      subject,
      content,
      recipient_mode: recipientMode,
      school_id: recipientMode === "school" ? selectedSchoolId || null : null,
      recipient_name: recipientName,
      recipient_title: recipientTitle || null,
      recipient_organization: recipientOrg || null,
      recipient_email: recipientEmail || null,
      recipient_phone: recipientPhone || null,
      recipient_address: recipientAddress || null,
      signatory_name: signatoryName,
      signatory_title: signatoryTitle,
      signatory_email: signatoryEmail || null,
      signatory_phone: signatoryPhone || null,
      signatory_company: "PexPacks Supplies (Pty) Ltd",
      include_quotation: includeQuotation,
      quotation_id: includeQuotation ? quotationRefId || null : null,
      quotation_payload: quotationPayload,
      status,
    };

    startTransition(async () => {
      const result = await saveLetterAction(payload, initialLetter?.id);
      if (result.success && result.letter) {
        setFeedback({
          type: "success",
          message: `Letter successfully saved as ${status.toUpperCase()} (${result.letter.reference_number}).`,
        });
        if (!initialLetter?.id) {
          router.push(`/admin/letters/${result.letter.id}`);
        } else {
          router.refresh();
        }
      } else {
        setFeedback({
          type: "error",
          message: result.error || "Failed to save document.",
        });
      }
    });
  }

  // Email Document Action
  async function handleSendEmail() {
    if (!initialLetter?.id) {
      setFeedback({
        type: "error",
        message: "Please save the document before sending via email.",
      });
      return;
    }
    if (!recipientEmail) {
      setFeedback({
        type: "error",
        message: "Please specify a recipient email address.",
      });
      return;
    }

    startTransition(async () => {
      const res = await emailLetterAction({
        letterId: initialLetter.id,
        toEmail: recipientEmail,
        subject: emailSubject,
        message: emailBodyMessage,
      });

      if (res.success) {
        setEmailModalOpen(false);
        setFeedback({
          type: "success",
          message: `Official document successfully dispatched to ${recipientEmail}.`,
        });
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to dispatch email.",
        });
      }
    });
  }

  // Open native Mailto
  function handleOpenMailto() {
    const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(
      `Dear ${recipientName || "Valued Customer"},\n\nPlease find attached the official correspondence from PexPacks Supplies regarding: ${subject}.\n\nReference: ${
        initialLetter?.reference_number || "PX-DOC-DRAFT"
      }\n\nKind regards,\n${signatoryName}\n${signatoryTitle}\nPexPacks Supplies`
    )}`;
    window.location.href = mailtoUrl;
  }

  return (
    <div className={styles.container}>
      {/* Top Header & Breadcrumbs */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              href="/admin/letters"
              className="db-btn db-btn-secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 36, padding: "0 12px" }}
            >
              <ArrowLeft size={16} /> Back to Letters
            </Link>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "var(--db-text-primary)" }}>
                {initialLetter ? `Edit Letter: ${initialLetter.reference_number}` : "Create Official Commercial Letter"}
              </h1>
              <p style={{ fontSize: 13, color: "var(--db-text-muted)", margin: "4px 0 0 0" }}>
                Draft institutional correspondence, proposals, and quotation-backed cover letters on official PexPacks letterhead.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={() => handleSave("draft")}
              disabled={isPending}
              className="db-btn db-btn-secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Save size={16} /> Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave("generated")}
              disabled={isPending}
              className="db-btn db-btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <CheckCircle2 size={16} /> Finalize Document
            </button>
          </div>
        </div>
      </div>

      {/* Flash Alert Banner */}
      {feedback && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            fontWeight: 600,
            background:
              feedback.type === "success"
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(239, 68, 68, 0.15)",
            border: `1px solid ${
              feedback.type === "success"
                ? "rgba(16, 185, 129, 0.4)"
                : "rgba(239, 68, 68, 0.4)"
            }`,
            color:
              feedback.type === "success"
                ? "var(--db-brand, #10b981)"
                : "#f87171",
          }}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertTriangle size={18} />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className={styles.splitLayout}>
        {/* Main Content Column */}
        <div className={styles.mainColumn}>
          {/* Card 1: Recipient Routing */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleGroup}>
                <h2 className={styles.cardTitle}>
                  <Building2 size={18} className={styles.cardIcon} /> Recipient Target & Routing
                </h2>
                <p className={styles.cardSubtitle}>
                  Choose registered South African school database entity or manual institutional / international client.
                </p>
              </div>

              {/* Mode Toggle */}
              <div className={styles.modeToggle}>
                <button
                  type="button"
                  onClick={() => setRecipientMode("school")}
                  className={`${styles.modeToggleButton} ${
                    recipientMode === "school" ? styles.modeToggleButtonActive : ""
                  }`}
                >
                  <Building2 size={14} /> Registered School
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientMode("manual")}
                  className={`${styles.modeToggleButton} ${
                    recipientMode === "manual" ? styles.modeToggleButtonActive : ""
                  }`}
                >
                  <User size={14} /> Private / Manual Client
                </button>
              </div>
            </div>

            {/* School Search or Manual Fields */}
            {recipientMode === "school" ? (
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Search Registered School <span className={styles.labelRequired}>*</span>
                </label>
                <div className={styles.searchWrapper}>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Search by school name or EMIS number..."
                    value={schoolSearchQuery}
                    onChange={(e) => {
                      setSchoolSearchQuery(e.target.value);
                      setShowSchoolDropdown(true);
                    }}
                    onFocus={() => setShowSchoolDropdown(true)}
                  />
                  {showSchoolDropdown && filteredSchools.length > 0 && (
                    <div className={styles.searchResultsDropdown}>
                      {filteredSchools.slice(0, 8).map((school) => (
                        <button
                          key={school.id}
                          type="button"
                          className={styles.searchResultItem}
                          onClick={() => handleSelectSchool(school)}
                        >
                          <div>
                            <span className={styles.schoolName}>{school.name}</span>
                            {school.province && (
                              <span className={styles.schoolLocation}>
                                ({school.province})
                              </span>
                            )}
                          </div>
                          {school.emis_number && (
                            <span className={styles.schoolEmis}>
                              EMIS: {school.emis_number}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Recipient Details Form Grid */}
            <div className={styles.grid2}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Addressee / Contact Person <span className={styles.labelRequired}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Dr. Jane Smith / The Principal"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Recipient Title / Designation</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Head of Procurement / Principal"
                  value={recipientTitle}
                  onChange={(e) => setRecipientTitle(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.grid3}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Organization / School Name <span className={styles.labelRequired}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Sandton Primary School"
                  value={recipientOrg}
                  onChange={(e) => setRecipientOrg(e.target.value)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Recipient Email <span className={styles.labelRequired}>*</span>
                </label>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="e.g. principal@school.co.za"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Recipient Contact Phone</label>
                <input
                  type="tel"
                  className={styles.input}
                  placeholder="e.g. +27 11 555 0192"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Recipient Physical / Postal Address</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. 104 Willowbrook Road, Sandton, Johannesburg, 2196"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Card 2: Subject & Letterhead Content */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleGroup}>
                <h2 className={styles.cardTitle}>
                  <FileText size={18} className={styles.cardIcon} /> Document Body & Template
                </h2>
                <p className={styles.cardSubtitle}>
                  Select quick institutional template presets or customize the formal correspondence body.
                </p>
              </div>

              {/* Template Picker Pills */}
              <div className={styles.templatePicker}>
                <span className={styles.templateLabel}>
                  <Sparkles size={12} style={{ display: "inline", marginRight: 4 }} /> Presets:
                </span>
                {PRESET_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className={`${styles.templatePill} ${
                      activeTemplate === tmpl.id ? styles.templatePillActive : ""
                    }`}
                  >
                    {tmpl.name}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Document Subject / Reference Heading <span className={styles.labelRequired}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="Subject line..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Formal Body Content <span className={styles.labelRequired}>*</span>
              </label>
              <textarea
                className={styles.textarea}
                placeholder="Compose letter content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>

          {/* Card 3: Embedded Quotation Schedule */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleGroup}>
                <h2 className={styles.cardTitle}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkboxInput}
                      checked={includeQuotation}
                      onChange={(e) => setIncludeQuotation(e.target.checked)}
                    />
                    Include Itemized Commercial Quotation Schedule
                  </label>
                </h2>
                <p className={styles.cardSubtitle}>
                  Embed formal financial schedules and VAT line items directly into the generated PDF document.
                </p>
              </div>

              {includeQuotation && existingQuotations.length > 0 && (
                <div style={{ minWidth: 220 }}>
                  <select
                    className={styles.select}
                    value={quotationRefId}
                    onChange={(e) => handleSelectExistingQuotation(e.target.value)}
                  >
                    <option value="">-- Import Existing Quotation --</option>
                    {existingQuotations.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.quotation_number} — {formatRandFromCents(q.total_cents)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {includeQuotation && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className={styles.grid2}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Quotation Schedule Heading</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={quotationTitle}
                      onChange={(e) => setQuotationTitle(e.target.value)}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Quotation Notes / Terms</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={quotationNotes}
                      onChange={(e) => setQuotationNotes(e.target.value)}
                    />
                  </div>
                </div>

                {/* Line Items Table */}
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.th} style={{ width: "45%" }}>Description</th>
                        <th className={styles.th} style={{ width: "15%" }}>Qty</th>
                        <th className={styles.th} style={{ width: "20%" }}>Unit (Cents)</th>
                        <th className={styles.th} style={{ width: "15%" }}>Total</th>
                        <th className={styles.th} style={{ width: "5%" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotationItems.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className={styles.td}>
                            <input
                              type="text"
                              className={styles.tableInput}
                              value={item.description}
                              onChange={(e) =>
                                handleUpdateQuoteItem(idx, "description", e.target.value)
                              }
                            />
                          </td>
                          <td className={styles.td}>
                            <input
                              type="number"
                              className={styles.tableInput}
                              value={item.quantity}
                              min={1}
                              onChange={(e) =>
                                handleUpdateQuoteItem(idx, "quantity", parseInt(e.target.value) || 1)
                              }
                            />
                          </td>
                          <td className={styles.td}>
                            <input
                              type="number"
                              className={styles.tableInput}
                              value={item.unit_price_cents}
                              step={100}
                              onChange={(e) =>
                                handleUpdateQuoteItem(idx, "unit_price_cents", parseInt(e.target.value) || 0)
                              }
                            />
                          </td>
                          <td className={styles.td} style={{ fontWeight: 600 }}>
                            {formatRandFromCents(item.total_cents)}
                          </td>
                          <td className={styles.td}>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuoteItem(idx)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#f87171",
                                cursor: "pointer",
                                padding: 4,
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                  <button
                    type="button"
                    onClick={handleAddQuoteItem}
                    className="db-btn db-btn-secondary"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <Plus size={16} /> Add Quotation Line
                  </button>

                  <div className={styles.quoteSummary}>
                    <div className={styles.summaryRow}>
                      <span>Subtotal (Excl. VAT):</span>
                      <span>{formatRandFromCents(quoteSubtotalCents)}</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>VAT (15%):</span>
                      <span>{formatRandFromCents(quoteVatCents)}</span>
                    </div>
                    <div className={styles.summaryTotal}>
                      <span>Quotation Total:</span>
                      <span>{formatRandFromCents(quoteTotalCents)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel: Signatory & Multi-Channel Actions */}
        <div className={styles.sideColumn}>
          <div className={styles.stickySide}>
            {/* Card: Document Meta */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle} style={{ fontSize: 14 }}>
                Document Metadata
              </h3>
              <div className={styles.specList}>
                <div className={styles.specRow}>
                  <span className={styles.specLabel}>Reference</span>
                  <span className={styles.specValue}>
                    {initialLetter?.reference_number || "AUTO-GENERATED"}
                  </span>
                </div>
                <div className={styles.specRow}>
                  <span className={styles.specLabel}>Status</span>
                  <span className={styles.specValue} style={{ textTransform: "uppercase" }}>
                    {initialLetter?.status || "DRAFT"}
                  </span>
                </div>
                <div className={styles.specRow}>
                  <span className={styles.specLabel}>Recipient Type</span>
                  <span className={styles.specValue} style={{ textTransform: "capitalize" }}>
                    {recipientMode}
                  </span>
                </div>
              </div>
            </div>

            {/* Card: Signatory Controls */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle} style={{ fontSize: 14 }}>
                Authorized Signatory
              </h3>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Signatory Name</label>
                <input
                  type="text"
                  className={styles.input}
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Signatory Designation</label>
                <input
                  type="text"
                  className={styles.input}
                  value={signatoryTitle}
                  onChange={(e) => setSignatoryTitle(e.target.value)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Direct Email</label>
                <input
                  type="email"
                  className={styles.input}
                  value={signatoryEmail}
                  onChange={(e) => setSignatoryEmail(e.target.value)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Direct Phone</label>
                <input
                  type="tel"
                  className={styles.input}
                  value={signatoryPhone}
                  onChange={(e) => setSignatoryPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Card: Multi-Channel Distribution */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle} style={{ fontSize: 14 }}>
                Distribution & Output
              </h3>

              <div className={styles.actionStack}>
                {initialLetter?.id ? (
                  <>
                    <a
                      href={`/api/admin/letters/${initialLetter.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="db-btn db-btn-secondary"
                      style={{ width: "100%", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: 8 }}
                    >
                      <Download size={16} /> Download PDF
                    </a>

                    <button
                      type="button"
                      onClick={() => setPreviewOpen(true)}
                      className="db-btn db-btn-secondary"
                      style={{ width: "100%", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: 8 }}
                    >
                      <Eye size={16} /> Live PDF Preview
                    </button>

                    <button
                      type="button"
                      onClick={() => setEmailModalOpen(true)}
                      className="db-btn db-btn-primary"
                      style={{ width: "100%", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: 8 }}
                    >
                      <Send size={16} /> Dispatch via Email
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenMailto}
                      className="db-btn db-btn-secondary"
                      style={{ width: "100%", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: 8 }}
                    >
                      <Mail size={16} /> Open Mail Client (mailto:)
                    </button>
                  </>
                ) : (
                  <p style={{ fontSize: 12, color: "var(--db-text-muted)", margin: 0, textAlign: "center" }}>
                    Save document draft to enable PDF download, live preview, and direct email distribution.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Live Preview Modal */}
      {previewOpen && initialLetter?.id && (
        <div className={modalStyles.modalOverlay} onClick={() => setPreviewOpen(false)}>
          <div
            className={modalStyles.modalContent}
            style={{ maxWidth: 900, height: "85vh", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={modalStyles.modalHeader}>
              <h2 className={modalStyles.modalTitle}>
                PDF Preview: {initialLetter.reference_number}
              </h2>
              <button
                type="button"
                className={modalStyles.closeBtn}
                onClick={() => setPreviewOpen(false)}
              >
                ✕
              </button>
            </div>
            <div style={{ flex: 1, padding: 16, background: "#1e293b" }}>
              <iframe
                src={`/api/admin/letters/${initialLetter.id}/pdf`}
                style={{ width: "100%", height: "100%", border: "none", borderRadius: 8 }}
                title="Letter PDF Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* Email Dispatch Modal */}
      {emailModalOpen && initialLetter?.id && (
        <div className={modalStyles.modalOverlay} onClick={() => setEmailModalOpen(false)}>
          <div
            className={modalStyles.modalContent}
            style={{ maxWidth: 580 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={modalStyles.modalHeader}>
              <h2 className={modalStyles.modalTitle}>
                Dispatch Document via Resend
              </h2>
              <button
                type="button"
                className={modalStyles.closeBtn}
                onClick={() => setEmailModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className={modalStyles.modalBody} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Recipient Email Address</label>
                <input
                  type="email"
                  className={styles.input}
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Email Subject</label>
                <input
                  type="text"
                  className={styles.input}
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Email Message Body</label>
                <textarea
                  className={styles.textarea}
                  style={{ minHeight: 140 }}
                  value={emailBodyMessage}
                  onChange={(e) => setEmailBodyMessage(e.target.value)}
                />
              </div>

              <div
                style={{
                  padding: 12,
                  borderRadius: 6,
                  background: "var(--db-surface-inner)",
                  border: "1px solid var(--db-border)",
                  fontSize: 12,
                  color: "var(--db-text-muted)",
                }}
              >
                📎 <strong>Attachment:</strong> {initialLetter.reference_number}.pdf (Rendered official letterhead document)
              </div>
            </div>

            <div className={modalStyles.modalFooter}>
              <button
                type="button"
                className="db-btn db-btn-secondary"
                onClick={() => setEmailModalOpen(false)}
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="db-btn db-btn-primary"
                onClick={handleSendEmail}
                disabled={isPending || !recipientEmail}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Send size={16} /> {isPending ? "Sending..." : "Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
