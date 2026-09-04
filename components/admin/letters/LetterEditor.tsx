"use client";

import React, { useState, useEffect, useTransition } from "react";
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
  Sparkles,
} from "lucide-react";
import {
  saveLetterAction,
  sendLetterEmailAction,
  searchSchoolsForLetterAction,
  searchQuotationsForLetterAction,
} from "@/app/admin/letters/actions";
import type {
  AdminLetterRecord,
  LetterQuotationItem,
  LetterQuotationData,
  SaveLetterInput,
} from "@/lib/admin/letters";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "./LetterEditor.module.css";

interface SchoolOption {
  id: string;
  name: string;
  province?: string | null;
  city?: string | null;
  principal?: string | null;
  email?: string | null;
  telephone?: string | null;
  address?: string | null;
}

interface QuotationOption {
  id: string;
  quote_number: string;
  school_name?: string | null;
  recipient_name?: string | null;
  total_amount: number;
  items?: LetterQuotationItem[];
}

interface LetterEditorProps {
  initialLetter?: AdminLetterRecord | null;
}

function formatRand(amount: number): string {
  return `R ${Number(amount || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const PRESET_TEMPLATES = [
  {
    id: "new_letter",
    name: "New Letter",
    subject: "",
    content: "",
  },
  {
    id: "partnership",
    name: "Partnership Proposal",
    subject:
      "Institutional Stationery & Scholastic Supply Partnership — 2026/2027 Academic Year",
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
    subject:
      "Formal Quotation Transmittal: Institutional Scholastic & Office Supplies",
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
    subject:
      "Formal Notification: 30-Day Institutional Account Facility & Settlement Terms",
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

export function LetterEditor({ initialLetter }: LetterEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [existingQuotations, setExistingQuotations] = useState<
    QuotationOption[]
  >([]);

  // Mode & Recipient
  const recipientModeInit: "school" | "manual" =
    initialLetter?.recipient_type === "registered_school" ? "school" : "manual";
  const [recipientMode, setRecipientMode] = useState<"school" | "manual">(
    initialLetter?.school_id ? "school" : recipientModeInit,
  );
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(
    initialLetter?.school_id || "",
  );
  const [schoolSearchQuery, setSchoolSearchQuery] = useState<string>("");
  const [showSchoolDropdown, setShowSchoolDropdown] = useState<boolean>(false);

  // Recipient Fields
  const [recipientName, setRecipientName] = useState<string>(
    initialLetter?.recipient_name || "",
  );
  const [recipientTitle, setRecipientTitle] = useState<string>(
    initialLetter?.recipient_title || "",
  );
  const [recipientOrg, setRecipientOrg] = useState<string>(
    initialLetter?.recipient_organization || "",
  );
  const [recipientEmail, setRecipientEmail] = useState<string>(
    initialLetter?.recipient_email || "",
  );
  const [recipientAddress, setRecipientAddress] = useState<string>(
    initialLetter?.recipient_address || "",
  );

  // Document Fields
  const [subject, setSubject] = useState<string>(initialLetter?.subject || "");
  const [content, setContent] = useState<string>(
    initialLetter?.body_markdown || "",
  );
  const [signatoryName, setSignatoryName] = useState<string>(
    initialLetter?.signatory_name || "Mcebisi Hlatshwayo",
  );
  const [signatoryTitle, setSignatoryTitle] = useState<string>(
    initialLetter?.signatory_title || "Managing Director",
  );

  // Quotation Integration
  const [includeQuotation, setIncludeQuotation] = useState<boolean>(
    initialLetter?.include_quotation || false,
  );
  const [quotationRefId, setQuotationRefId] = useState<string>(
    initialLetter?.quotation_id || "",
  );
  const [quotationTitle, setQuotationTitle] = useState<string>(
    initialLetter?.quotation_data?.quote_number
      ? `Quotation ${initialLetter.quotation_data.quote_number}`
      : "Itemized Quotation Schedule",
  );
  const [quotationNotes, setQuotationNotes] = useState<string>(
    initialLetter?.quotation_data?.notes ||
      "All prices include 15% VAT where applicable. Valid for 30 days.",
  );
  const [quotationItems, setQuotationItems] = useState<LetterQuotationItem[]>(
    initialLetter?.quotation_data?.items || [
      {
        item_title: "Grade R-7 Comprehensive Stationery Pack",
        quantity: 100,
        unit_price: 250.0,
        total_price: 25000.0,
      },
      {
        item_title: "Standard Blue Ballpoint Pens (Box of 50)",
        quantity: 20,
        unit_price: 125.0,
        total_price: 2500.0,
      },
    ],
  );

  // UI state
  const [activeTemplate, setActiveTemplate] = useState<string>(
    initialLetter ? "" : "new_letter",
  );
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [emailModalOpen, setEmailModalOpen] = useState<boolean>(false);
  const [emailSubject, setEmailSubject] = useState<string>(
    `Official PexPacks Letter: ${subject}`,
  );
  const [emailBodyMessage, setEmailBodyMessage] = useState<string>(
    `Dear ${recipientName || "Valued Partner"},\n\nPlease find attached the official correspondence from PexPacks Supplies.\n\nKind regards,\n${signatoryName}\n${signatoryTitle}\nPexPacks Supplies`,
  );
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Load schools & quotations for the pickers
  useEffect(() => {
    let active = true;
    (async () => {
      const [schoolRes, quoteRes] = await Promise.all([
        searchSchoolsForLetterAction(""),
        searchQuotationsForLetterAction(""),
      ]);
      if (!active) return;
      if (schoolRes.ok && Array.isArray(schoolRes.data)) {
        setSchools(schoolRes.data as SchoolOption[]);
      }
      if (quoteRes.ok && Array.isArray(quoteRes.data)) {
        setExistingQuotations(quoteRes.data as QuotationOption[]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Filter schools
  const filteredSchools = schools.filter(
    (s) =>
      s.name.toLowerCase().includes(schoolSearchQuery.toLowerCase()) ||
      (s.city &&
        s.city.toLowerCase().includes(schoolSearchQuery.toLowerCase())) ||
      (s.province &&
        s.province.toLowerCase().includes(schoolSearchQuery.toLowerCase())),
  );

  // On school select
  function handleSelectSchool(school: SchoolOption) {
    setSelectedSchoolId(school.id);
    setRecipientOrg(school.name);
    if (school.principal) setRecipientName(school.principal);
    if (school.email) setRecipientEmail(school.email);
    if (school.address || school.city || school.province) {
      setRecipientAddress(
        [school.address, school.city, school.province]
          .filter(Boolean)
          .join(", "),
      );
    }
    setSchoolSearchQuery(school.name);
    setShowSchoolDropdown(false);
  }

  // Preset Template Apply
  function handleApplyTemplate(template: (typeof PRESET_TEMPLATES)[0]) {
    setActiveTemplate(template.id);
    setSubject(template.subject);
    setContent(template.content);
    if (template.id === "new_letter") {
      setIncludeQuotation(false);
    } else if (template.id === "quotation_transmittal") {
      setIncludeQuotation(true);
    }
  }

  // Quotation calculations (rands)
  const quoteSubtotal = quotationItems.reduce(
    (sum, item) => sum + (item.unit_price || 0) * (item.quantity || 0),
    0,
  );
  const quoteVat = Math.round(quoteSubtotal * 0.15 * 100) / 100;
  const quoteTotal = Math.round((quoteSubtotal + quoteVat) * 100) / 100;

  function computeLineTotal(item: LetterQuotationItem): number {
    return (
      Math.round((item.unit_price || 0) * (item.quantity || 0) * 100) / 100
    );
  }

  function handleAddQuoteItem() {
    setQuotationItems([
      ...quotationItems,
      {
        item_title: "Scholastic Material Item",
        quantity: 1,
        unit_price: 10.0,
        total_price: 10.0,
      },
    ]);
  }

  function handleUpdateQuoteItem(
    index: number,
    field: keyof LetterQuotationItem,
    val: unknown,
  ) {
    const next = [...quotationItems];
    const current = { ...next[index], [field]: val } as LetterQuotationItem;
    if (field === "quantity" || field === "unit_price") {
      current.total_price = computeLineTotal(current);
    }
    next[index] = current;
    setQuotationItems(next);
  }

  function handleRemoveQuoteItem(index: number) {
    setQuotationItems(quotationItems.filter((_, i) => i !== index));
  }

  // Pull in existing quotation (rands)
  function handleSelectExistingQuotation(quoteId: string) {
    setQuotationRefId(quoteId);
    const quote = existingQuotations.find((q) => q.id === quoteId);
    if (quote && quote.items && quote.items.length > 0) {
      setQuotationItems(
        quote.items.map((item, idx) => ({
          id: item.id || `item-${idx}`,
          item_title: item.item_title || "Quoted Product",
          sku: item.sku || "",
          unit: item.unit || "",
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          total_price:
            item.total_price ??
            Math.round((item.quantity || 1) * (item.unit_price || 0) * 100) /
              100,
        })),
      );
      setQuotationTitle(
        quote.quote_number ? `Quotation ${quote.quote_number}` : quotationTitle,
      );
    }
  }

  function buildQuotationData(): LetterQuotationData | undefined {
    if (!includeQuotation) return undefined;
    return {
      quote_number: initialLetter?.quotation_data?.quote_number || undefined,
      subtotal: Math.round(quoteSubtotal * 100) / 100,
      vat_rate: 0.15,
      vat_amount: quoteVat,
      total_amount: quoteTotal,
      currency: "ZAR",
      notes: quotationNotes,
      items: quotationItems.map((item) => ({
        item_title: item.item_title,
        sku: item.sku || null,
        unit: item.unit || null,
        quantity: item.quantity,
        unit_price: item.unit_price || 0,
        total_price: item.total_price || computeLineTotal(item),
      })),
    };
  }

  // Save Document
  async function handleSave(status: "draft" | "generated" = "draft") {
    setFeedback(null);

    const input: SaveLetterInput = {
      id: initialLetter?.id,
      school_id:
        recipientMode === "school" && selectedSchoolId
          ? selectedSchoolId
          : null,
      quotation_id: includeQuotation && quotationRefId ? quotationRefId : null,
      recipient_type:
        recipientMode === "school" ? "registered_school" : "private_client",
      recipient_organization: recipientOrg || "Pexpacks Supplies (Pty) Ltd",
      recipient_title: recipientTitle || null,
      recipient_name: recipientName || "Valued Client",
      recipient_email: recipientEmail,
      recipient_country: "South Africa",
      recipient_address: recipientAddress || null,
      subject: subject,
      body_markdown: content,
      include_quotation: includeQuotation,
      quotation_data: buildQuotationData(),
      signatory_name: signatoryName,
      signatory_title: signatoryTitle,
      status,
    };

    startTransition(async () => {
      const result = await saveLetterAction(input);
      if (result.ok && result.data) {
        const saved = result.data;
        setFeedback({
          type: "success",
          message: `Letter successfully saved as ${status.toUpperCase()} (${saved.reference_number}).`,
        });
        if (!initialLetter?.id) {
          router.push(
            `/admin/letters/${encodeURIComponent(saved.reference_number)}`,
          );
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
      const res = await sendLetterEmailAction({
        letterId: initialLetter.id,
        recipientEmail,
        customMessage: emailBodyMessage,
      });

      if (res.ok) {
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
    const mailtoUrl = `mailto:${encodeURIComponent(
      recipientEmail,
    )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      `Dear ${recipientName || "Valued Customer"},\n\nPlease find attached the official correspondence from PexPacks Supplies regarding: ${subject}.\n\nReference: ${
        initialLetter?.reference_number || "PX-DOC-DRAFT"
      }\n\nKind regards,\n${signatoryName}\n${signatoryTitle}\nPexPacks Supplies`,
    )}`;
    window.location.href = mailtoUrl;
  }

  return (
    <div className={adminStyles.page}>
      <AdminPageHeader
        backHref="/admin/letters"
        backLabel="Back to Letters"
        title={initialLetter ? "Edit Official Letter" : "New Official Letter"}
        titleHighlight={
          initialLetter ? initialLetter.reference_number : undefined
        }
        subtitle="Draft institutional correspondence, proposals, and quotation-backed cover letters on official PexPacks letterhead."
        actions={
          <>
            <AdminButton
              variant="secondary"
              icon={<Save size={14} />}
              disabled={isPending}
              onClick={() => handleSave("draft")}
            >
              Save Draft
            </AdminButton>
            <AdminButton
              variant="primary"
              icon={<CheckCircle2 size={14} />}
              disabled={isPending}
              onClick={() => handleSave("generated")}
            >
              Finalize Document
            </AdminButton>
          </>
        }
      />

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
      <div className={adminStyles.detailLayout}>
        {/* Main Content Column */}
        <div className={adminStyles.leftColumn}>
          {/* Card 1: Recipient Routing */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Building2 size={16} className={adminStyles.iconTeal} />
                <span>Recipient Target &amp; Routing</span>
              </div>

              {/* Mode Toggle */}
              <div className={styles.modeToggle}>
                <button
                  type="button"
                  onClick={() => setRecipientMode("school")}
                  className={`${styles.modeToggleButton} ${
                    recipientMode === "school"
                      ? styles.modeToggleButtonActive
                      : ""
                  }`}
                >
                  <Building2 size={14} /> Registered School
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientMode("manual")}
                  className={`${styles.modeToggleButton} ${
                    recipientMode === "manual"
                      ? styles.modeToggleButtonActive
                      : ""
                  }`}
                >
                  <User size={14} /> Private / Manual Client
                </button>
              </div>
            </div>

            {/* School Search or Manual Fields */}
            {recipientMode === "school" ? (
              <div className={adminStyles.formField}>
                <div>
                  <label className={adminStyles.formLabel}>
                    Search Registered School *
                  </label>
                  <div className={styles.searchWrapper}>
                    <input
                      type="text"
                      className={adminStyles.inputField}
                      placeholder="Search by school name or town..."
                      value={schoolSearchQuery}
                      onChange={(e) => {
                        setSchoolSearchQuery(e.target.value);
                        setShowSchoolDropdown(true);
                      }}
                      onFocus={() => setShowSchoolDropdown(true)}
                    />
                    {showSchoolDropdown && filteredSchools.length > 0 && (
                      <div className={styles.searchResultsDropdown}>
                        {filteredSchools.slice(0, 50).map((school) => (
                          <button
                            key={school.id}
                            type="button"
                            className={styles.searchResultItem}
                            onClick={() => handleSelectSchool(school)}
                          >
                            <div>
                              <span className={styles.schoolName}>
                                {school.name}
                              </span>
                              {school.province && (
                                <span className={styles.schoolLocation}>
                                  ({school.province})
                                </span>
                              )}
                            </div>
                            {school.city && (
                              <span className={styles.schoolEmis}>
                                {school.city}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Recipient Details Form Grid */}
            <div className={adminStyles.grid2equal}>
              <div>
                <label className={adminStyles.formLabel}>
                  Addressee / Contact Person *
                </label>
                <input
                  type="text"
                  className={adminStyles.inputField}
                  placeholder="e.g. Dr. Jane Smith / The Principal"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>
              <div>
                <label className={adminStyles.formLabel}>
                  Recipient Title / Designation
                </label>
                <input
                  type="text"
                  className={adminStyles.inputField}
                  placeholder="e.g. Head of Procurement / Principal"
                  value={recipientTitle}
                  onChange={(e) => setRecipientTitle(e.target.value)}
                />
              </div>
            </div>

            <div className={adminStyles.grid2equal}>
              <div>
                <label className={adminStyles.formLabel}>
                  Organization / School Name *
                </label>
                <input
                  type="text"
                  className={adminStyles.inputField}
                  placeholder="e.g. Sandton Primary School"
                  value={recipientOrg}
                  onChange={(e) => setRecipientOrg(e.target.value)}
                />
              </div>
              <div>
                <label className={adminStyles.formLabel}>
                  Recipient Email *
                </label>
                <input
                  type="email"
                  className={adminStyles.inputField}
                  placeholder="e.g. principal@school.co.za"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel}>
                  Recipient Physical / Postal Address
                </label>
                <input
                  type="text"
                  className={adminStyles.inputField}
                  placeholder="e.g. 104 Willowbrook Road, Sandton, Johannesburg, 2196"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Subject & Letterhead Content */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <FileText size={16} className={adminStyles.iconBlue} />
                <span>Document Body &amp; Template</span>
              </div>
            </div>

            {/* Template Picker Pills */}
            <div className={styles.templatePicker}>
              <span className={styles.templateLabel}>
                <Sparkles
                  size={12}
                  style={{ display: "inline", marginRight: 4 }}
                />{" "}
                Presets:
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

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel}>
                  Document Subject / Reference Heading *
                </label>
                <input
                  type="text"
                  className={adminStyles.inputField}
                  placeholder="Subject line..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div>
                <label className={adminStyles.formLabel}>
                  Formal Body Content *
                </label>
                <textarea
                  className={`${adminStyles.textareaField} ${adminStyles.textareaFieldMd}`}
                  style={{ minHeight: 300 }}
                  placeholder="Compose letter content..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Card 3: Embedded Quotation Schedule */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    className={styles.checkboxInput}
                    checked={includeQuotation}
                    onChange={(e) => setIncludeQuotation(e.target.checked)}
                  />
                  Include Itemized Commercial Quotation Schedule
                </label>
              </div>

              {includeQuotation && existingQuotations.length > 0 && (
                <div style={{ minWidth: 220 }}>
                  <select
                    className={adminStyles.selectField}
                    value={quotationRefId}
                    onChange={(e) =>
                      handleSelectExistingQuotation(e.target.value)
                    }
                  >
                    <option value="">-- Import Existing Quotation --</option>
                    {existingQuotations.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.quote_number} — {formatRand(q.total_amount)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {includeQuotation && (
              <div className={adminStyles.formStackCompact}>
                <div className={adminStyles.grid2equal}>
                  <div>
                    <label className={adminStyles.formLabel}>
                      Quotation Schedule Heading
                    </label>
                    <input
                      type="text"
                      className={adminStyles.inputField}
                      value={quotationTitle}
                      onChange={(e) => setQuotationTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={adminStyles.formLabel}>
                      Quotation Notes / Terms
                    </label>
                    <input
                      type="text"
                      className={adminStyles.inputField}
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
                        <th className={styles.th} style={{ width: "45%" }}>
                          Description
                        </th>
                        <th className={styles.th} style={{ width: "15%" }}>
                          Qty
                        </th>
                        <th className={styles.th} style={{ width: "20%" }}>
                          Unit Price (R)
                        </th>
                        <th className={styles.th} style={{ width: "15%" }}>
                          Total
                        </th>
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
                              value={item.item_title}
                              onChange={(e) =>
                                handleUpdateQuoteItem(
                                  idx,
                                  "item_title",
                                  e.target.value,
                                )
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
                                handleUpdateQuoteItem(
                                  idx,
                                  "quantity",
                                  parseInt(e.target.value, 10) || 1,
                                )
                              }
                            />
                          </td>
                          <td className={styles.td}>
                            <input
                              type="number"
                              className={styles.tableInput}
                              value={item.unit_price}
                              step={0.01}
                              min={0}
                              onChange={(e) =>
                                handleUpdateQuoteItem(
                                  idx,
                                  "unit_price",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                            />
                          </td>
                          <td className={styles.td} style={{ fontWeight: 600 }}>
                            {formatRand(
                              item.total_price || computeLineTotal(item),
                            )}
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

                <div className={adminStyles.sidebarFlexBetween}>
                  <AdminButton
                    variant="secondary"
                    icon={<Plus size={14} />}
                    onClick={handleAddQuoteItem}
                  >
                    Add Quotation Line
                  </AdminButton>

                  <div className={styles.quoteSummary}>
                    <div className={styles.summaryRow}>
                      <span>Subtotal (Excl. VAT):</span>
                      <span>{formatRand(quoteSubtotal)}</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>VAT (15%):</span>
                      <span>{formatRand(quoteVat)}</span>
                    </div>
                    <div className={styles.summaryTotal}>
                      <span>Quotation Total:</span>
                      <span>{formatRand(quoteTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel: Signatory & Multi-Channel Actions */}
        <aside className={adminStyles.sidebarColumn}>
          {/* Card: Document Meta */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <span>Document Metadata</span>
              </div>
            </div>
            <div className={styles.specList}>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>Reference</span>
                <span className={styles.specValue}>
                  {initialLetter?.reference_number || "AUTO-GENERATED"}
                </span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>Status</span>
                <span
                  className={styles.specValue}
                  style={{ textTransform: "uppercase" }}
                >
                  {initialLetter?.status || "DRAFT"}
                </span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>Recipient Type</span>
                <span
                  className={styles.specValue}
                  style={{ textTransform: "capitalize" }}
                >
                  {recipientMode}
                </span>
              </div>
            </div>
          </div>

          {/* Card: Signatory Controls */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <span>Authorized Signatory</span>
              </div>
            </div>
            <div className={adminStyles.formStackCompact}>
              <div>
                <label className={adminStyles.formLabel}>Signatory Name</label>
                <input
                  type="text"
                  className={adminStyles.inputField}
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                />
              </div>
              <div>
                <label className={adminStyles.formLabel}>
                  Signatory Designation
                </label>
                <input
                  type="text"
                  className={adminStyles.inputField}
                  value={signatoryTitle}
                  onChange={(e) => setSignatoryTitle(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Card: Multi-Channel Distribution */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <span>Distribution &amp; Output</span>
              </div>
            </div>

            <div className={adminStyles.formStackCompact}>
              {initialLetter?.id ? (
                <>
                  <a
                    href={`/api/admin/letters/${initialLetter.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="db-btn db-btn-secondary"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Download size={16} /> Download PDF
                  </a>

                  <button
                    type="button"
                    onClick={() => setPreviewOpen(true)}
                    className="db-btn db-btn-secondary"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Eye size={16} /> Live PDF Preview
                  </button>

                  <button
                    type="button"
                    onClick={() => setEmailModalOpen(true)}
                    className="db-btn db-btn-primary"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Send size={16} /> Dispatch via Email
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenMailto}
                    className="db-btn db-btn-secondary"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Mail size={16} /> Open Mail Client (mailto:)
                  </button>
                </>
              ) : (
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--db-text-muted)",
                    margin: 0,
                    textAlign: "center",
                  }}
                >
                  Save document draft to enable PDF download, live preview, and
                  direct email distribution.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* PDF Live Preview Modal */}
      {previewOpen && initialLetter?.id && (
        <div
          className={styles.modalOverlay}
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className={styles.modalContent}
            style={{
              maxWidth: 900,
              height: "85vh",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                PDF Preview: {initialLetter.reference_number}
              </h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setPreviewOpen(false)}
              >
                ✕
              </button>
            </div>
            <div style={{ flex: 1, padding: 16, background: "#1e293b" }}>
              <iframe
                src={`/api/admin/letters/${initialLetter.id}/pdf`}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  borderRadius: 8,
                }}
                title="Letter PDF Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* Email Dispatch Modal */}
      {emailModalOpen && initialLetter?.id && (
        <div
          className={styles.modalOverlay}
          onClick={() => setEmailModalOpen(false)}
        >
          <div
            className={styles.modalContent}
            style={{ maxWidth: 580 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                Dispatch Document via Resend
              </h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setEmailModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={adminStyles.formField}>
                <div>
                  <label className={adminStyles.formLabel}>
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    className={adminStyles.inputField}
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className={adminStyles.formField}>
                <div>
                  <label className={adminStyles.formLabel}>Email Subject</label>
                  <input
                    type="text"
                    className={adminStyles.inputField}
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                </div>
              </div>

              <div className={adminStyles.formField}>
                <div>
                  <label className={adminStyles.formLabel}>
                    Email Message Body
                  </label>
                  <textarea
                    className={adminStyles.textareaField}
                    style={{ minHeight: 140 }}
                    value={emailBodyMessage}
                    onChange={(e) => setEmailBodyMessage(e.target.value)}
                  />
                </div>
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
                📎 <strong>Attachment:</strong> {initialLetter.reference_number}
                .pdf (Rendered official letterhead document)
              </div>
            </div>

            <div className={styles.modalFooter}>
              <AdminButton
                variant="secondary"
                onClick={() => setEmailModalOpen(false)}
                disabled={isPending}
              >
                Cancel
              </AdminButton>
              <AdminButton
                variant="primary"
                icon={<Send size={16} />}
                onClick={handleSendEmail}
                disabled={isPending || !recipientEmail}
              >
                {isPending ? "Sending..." : "Send Email"}
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
