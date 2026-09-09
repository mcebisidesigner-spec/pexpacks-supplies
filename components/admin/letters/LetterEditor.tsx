"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
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
  Loader2,
  X,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading2,
  Minus,
  Edit3,
  RotateCcw,
  FolderEdit,
  Bookmark,
  Check,
} from "lucide-react";
import {
  saveLetterAction,
  sendLetterEmailAction,
  searchSchoolsForLetterAction,
  searchQuotationsForLetterAction,
  listLetterTemplatesAction,
  saveLetterTemplateAction,
  deleteLetterTemplateAction,
  type SchoolOption,
} from "@/app/admin/letters/actions";
import {
  type AdminLetterRecord,
  type LetterQuotationItem,
  type LetterQuotationData,
  type SaveLetterInput,
  type AdminLetterTemplate,
  DEFAULT_LETTER_TEMPLATES,
} from "@/lib/admin/letters";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "./LetterEditor.module.css";

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
  const [isLoadingSchools, setIsLoadingSchools] = useState<boolean>(true);
  const [isSearchingLive, setIsSearchingLive] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(60);
  const schoolSearchContainerRef = useRef<HTMLDivElement>(null);
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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        schoolSearchContainerRef.current &&
        !schoolSearchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSchoolDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Rich Text Editor State & Formatting
  const [editorTab, setEditorTab] = useState<"write" | "preview">("write");
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  type FormatType =
    | "bold"
    | "italic"
    | "underline"
    | "bullet"
    | "numbered"
    | "heading"
    | "divider"
    | "uppercase"
    | "lowercase"
    | "titlecase";

  function applyFormatting(type: FormatType) {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);

    let replacement = "";
    let newCursorStart = start;
    let newCursorEnd = end;

    switch (type) {
      case "bold": {
        if (!selectedText) {
          replacement = "**bold text**";
          newCursorStart = start + 2;
          newCursorEnd = start + 11;
        } else if (
          selectedText.startsWith("**") &&
          selectedText.endsWith("**") &&
          selectedText.length >= 4
        ) {
          replacement = selectedText.slice(2, -2);
          newCursorStart = start;
          newCursorEnd = start + replacement.length;
        } else {
          replacement = `**${selectedText}**`;
          newCursorStart = start;
          newCursorEnd = start + replacement.length;
        }
        break;
      }
      case "italic": {
        if (!selectedText) {
          replacement = "*italic text*";
          newCursorStart = start + 1;
          newCursorEnd = start + 12;
        } else if (
          selectedText.startsWith("*") &&
          selectedText.endsWith("*") &&
          selectedText.length >= 2
        ) {
          replacement = selectedText.slice(1, -1);
          newCursorStart = start;
          newCursorEnd = start + replacement.length;
        } else {
          replacement = `*${selectedText}*`;
          newCursorStart = start;
          newCursorEnd = start + replacement.length;
        }
        break;
      }
      case "underline": {
        if (!selectedText) {
          replacement = "<u>underlined text</u>";
          newCursorStart = start + 3;
          newCursorEnd = start + 18;
        } else if (
          selectedText.startsWith("<u>") &&
          selectedText.endsWith("</u>") &&
          selectedText.length >= 7
        ) {
          replacement = selectedText.slice(3, -4);
          newCursorStart = start;
          newCursorEnd = start + replacement.length;
        } else {
          replacement = `<u>${selectedText}</u>`;
          newCursorStart = start;
          newCursorEnd = start + replacement.length;
        }
        break;
      }
      case "bullet": {
        if (!selectedText) {
          replacement = "• ";
          newCursorStart = start + 2;
          newCursorEnd = start + 2;
        } else {
          const lines = selectedText.split("\n");
          const allBulleted = lines.every((line) =>
            /^(\s*)(•|-|\*)\s+/.test(line),
          );
          if (allBulleted) {
            replacement = lines
              .map((l) => l.replace(/^(\s*)(•|-|\*)\s+/, "$1"))
              .join("\n");
          } else {
            replacement = lines
              .map((l) =>
                l.trim().length > 0
                  ? `• ${l.replace(/^(\s*)(•|-|\*)\s+/, "$1")}`
                  : l,
              )
              .join("\n");
          }
          newCursorStart = start;
          newCursorEnd = start + replacement.length;
        }
        break;
      }
      case "numbered": {
        if (!selectedText) {
          replacement = "1. ";
          newCursorStart = start + 3;
          newCursorEnd = start + 3;
        } else {
          const lines = selectedText.split("\n");
          let counter = 1;
          replacement = lines
            .map((l) => {
              if (l.trim().length === 0) return l;
              const cleaned = l.replace(/^(\s*)(\d+\.|\•|\-|\*)\s+/, "$1");
              return `${counter++}. ${cleaned}`;
            })
            .join("\n");
          newCursorStart = start;
          newCursorEnd = start + replacement.length;
        }
        break;
      }
      case "heading": {
        if (!selectedText) {
          replacement = "## ";
          newCursorStart = start + 3;
          newCursorEnd = start + 3;
        } else if (selectedText.startsWith("## ")) {
          replacement = selectedText.slice(3);
          newCursorStart = start;
          newCursorEnd = start + replacement.length;
        } else {
          replacement = `## ${selectedText}`;
          newCursorStart = start;
          newCursorEnd = start + replacement.length;
        }
        break;
      }
      case "divider": {
        replacement = "\n---\n";
        newCursorStart = start + replacement.length;
        newCursorEnd = start + replacement.length;
        break;
      }
      case "uppercase": {
        if (!selectedText) return;
        replacement = selectedText.toUpperCase();
        newCursorStart = start;
        newCursorEnd = start + replacement.length;
        break;
      }
      case "lowercase": {
        if (!selectedText) return;
        replacement = selectedText.toLowerCase();
        newCursorStart = start;
        newCursorEnd = start + replacement.length;
        break;
      }
      case "titlecase": {
        if (!selectedText) return;
        replacement = selectedText.replace(
          /\w\S*/g,
          (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
        );
        newCursorStart = start;
        newCursorEnd = start + replacement.length;
        break;
      }
    }

    const updatedContent = beforeText + replacement + afterText;
    setContent(updatedContent);

    // Maintain focus and update selection range
    requestAnimationFrame(() => {
      if (contentTextareaRef.current) {
        contentTextareaRef.current.focus();
        contentTextareaRef.current.setSelectionRange(
          newCursorStart,
          newCursorEnd,
        );
      }
    });
  }

  function handleTextareaKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        applyFormatting("bold");
      } else if (e.key === "u" || e.key === "U") {
        e.preventDefault();
        applyFormatting("underline");
      } else if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        applyFormatting("italic");
      }
    }
  }

  function renderPreviewContent(text: string) {
    if (!text || !text.trim()) {
      return (
        <div className={styles.previewEmpty}>
          No letter body content yet. Switch to <strong>Write</strong> mode to
          draft your letter.
        </div>
      );
    }

    const paragraphs = text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    function parseInline(inlineText: string) {
      const parts = inlineText.split(
        /(\*\*[^*]+\*\*|<u>[\s\S]*?<\/u>|\*[^*]+\*)/g,
      );
      return parts.map((part, idx) => {
        if (!part) return null;
        if (
          part.startsWith("**") &&
          part.endsWith("**") &&
          part.length >= 4
        ) {
          return (
            <strong key={idx} className={styles.previewStrong}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (
          part.startsWith("<u>") &&
          part.endsWith("</u>") &&
          part.length >= 7
        ) {
          return (
            <span key={idx} className={styles.previewUnderline}>
              {part.slice(3, -4)}
            </span>
          );
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
          return (
            <em key={idx} className={styles.previewEm}>
              {part.slice(1, -1)}
            </em>
          );
        }
        return part;
      });
    }

    return paragraphs.map((block, pIdx) => {
      // Heading
      if (block.startsWith("## ") || block.startsWith("# ")) {
        const headingText = block.replace(/^#+\s*/, "");
        return (
          <h3 key={pIdx} className={styles.previewHeading}>
            {parseInline(headingText)}
          </h3>
        );
      }

      // Divider
      if (block === "---" || block === "***" || block === "___") {
        return <hr key={pIdx} className={styles.previewHr} />;
      }

      // Bullet list
      const isBulletBlock =
        block.includes("\n* ") ||
        block.includes("\n- ") ||
        block.includes("\n• ") ||
        block.startsWith("* ") ||
        block.startsWith("- ") ||
        block.startsWith("• ");

      if (isBulletBlock) {
        const items = block.split("\n").map((l) => l.trim()).filter(Boolean);
        return (
          <ul key={pIdx} className={styles.previewBulletList}>
            {items.map((item, iIdx) => {
              const clean = item.replace(/^(\*|\-|•)\s*/, "");
              return <li key={iIdx}>{parseInline(clean)}</li>;
            })}
          </ul>
        );
      }

      // Numbered list
      const isNumberedBlock =
        /^\d+\.\s+/.test(block) || block.includes("\n1. ");
      if (isNumberedBlock) {
        const items = block.split("\n").map((l) => l.trim()).filter(Boolean);
        return (
          <ol key={pIdx} className={styles.previewNumberedList}>
            {items.map((item, iIdx) => {
              const clean = item.replace(/^\d+\.\s*/, "");
              return <li key={iIdx}>{parseInline(clean)}</li>;
            })}
          </ol>
        );
      }

      // Salutation
      if (pIdx === 0 && /^dear/i.test(block)) {
        return (
          <div key={pIdx} className={styles.previewSalutation}>
            {parseInline(block)}
          </div>
        );
      }

      // Standard paragraph
      return (
        <p key={pIdx} className={styles.previewParagraph}>
          {parseInline(block)}
        </p>
      );
    });
  }

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

  // Dynamic Templates & UI state
  const [templates, setTemplates] =
    useState<AdminLetterTemplate[]>(DEFAULT_LETTER_TEMPLATES);
  const [activeTemplate, setActiveTemplate] = useState<string>(
    initialLetter ? "" : "new_letter",
  );
  const [originalTemplateSnapshot, setOriginalTemplateSnapshot] = useState<{
    id: string;
    name: string;
    subject: string;
    content: string;
  } | null>(null);

  // Template Modals state
  const [showSaveTemplateModal, setShowSaveTemplateModal] =
    useState<boolean>(false);
  const [newTemplateName, setNewTemplateName] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<AdminLetterTemplate | null>(null);
  const [showManageTemplatesModal, setShowManageTemplatesModal] =
    useState<boolean>(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState<boolean>(false);
  const [isDeletingTemplate, setIsDeletingTemplate] = useState<boolean>(false);

  // Load persistent templates from Supabase
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await listLetterTemplatesAction();
        if (!active) return;
        if (res.ok && res.data && res.data.length > 0) {
          setTemplates(res.data);
        }
      } catch (e) {
        console.error("Failed to load letter templates:", e);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const currentLoadedTemplate = templates.find((t) => t.id === activeTemplate);
  const isTemplateModified =
    Boolean(currentLoadedTemplate) &&
    activeTemplate !== "new_letter" &&
    originalTemplateSnapshot !== null &&
    originalTemplateSnapshot.id === activeTemplate &&
    (subject !== originalTemplateSnapshot.subject ||
      content !== originalTemplateSnapshot.content);
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

  // Load all 3,342+ schools & quotations for the pickers
  useEffect(() => {
    let active = true;
    (async () => {
      setIsLoadingSchools(true);
      try {
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
      } catch (err) {
        console.error("Failed to load initial schools:", err);
      } finally {
        if (active) setIsLoadingSchools(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Real-time live database search: queries Supabase directly on typing to capture any newly added or updated schools
  useEffect(() => {
    const q = schoolSearchQuery.trim();
    if (!q || q.length < 2) return;
    const timer = setTimeout(async () => {
      setIsSearchingLive(true);
      try {
        const res = await searchSchoolsForLetterAction(q, 100);
        if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
          // Merge newly returned live DB schools into local schools state
          setSchools((prev) => {
            const existingMap = new Map(prev.map((s) => [s.id, s]));
            for (const item of res.data as SchoolOption[]) {
              existingMap.set(item.id, { ...existingMap.get(item.id), ...item });
            }
            return Array.from(existingMap.values()).sort((a, b) =>
              a.name.localeCompare(b.name),
            );
          });
        }
      } catch (err) {
        console.error("Live school search error:", err);
      } finally {
        setIsSearchingLive(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [schoolSearchQuery]);

  // Reset pagination limit when search query changes
  useEffect(() => {
    setVisibleCount(60);
  }, [schoolSearchQuery]);

  // Progressive scroll handler to render all matched schools smoothly
  const handleDropdownScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 40) {
      setVisibleCount((prev) => Math.min(prev + 60, filteredSchools.length));
    }
  };

  // Filter schools across full 3,342+ dataset
  const filteredSchools = schools.filter(
    (s) =>
      s.name.toLowerCase().includes(schoolSearchQuery.toLowerCase()) ||
      (s.city &&
        s.city.toLowerCase().includes(schoolSearchQuery.toLowerCase())) ||
      (s.province &&
        s.province.toLowerCase().includes(schoolSearchQuery.toLowerCase())) ||
      (s.address &&
        s.address.toLowerCase().includes(schoolSearchQuery.toLowerCase())),
  );

  const displayedSchools = filteredSchools.slice(0, visibleCount);

  // On school select
  function handleSelectSchool(school: SchoolOption) {
    setSelectedSchoolId(school.id);
    setRecipientOrg(school.name);
    if (school.principal) {
      setRecipientName(school.principal);
    } else {
      setRecipientName("The Principal / School Governing Body");
    }
    if (!recipientTitle) {
      setRecipientTitle("Head of School / Principal");
    }
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

  // Template Handlers
  function handleApplyTemplate(tmpl: {
    id: string;
    name: string;
    subject: string;
    body_markdown?: string;
    content?: string;
  }) {
    setActiveTemplate(tmpl.id);
    const tmplSubject = tmpl.subject || "";
    const tmplContent = tmpl.body_markdown ?? tmpl.content ?? "";
    setSubject(tmplSubject);
    setContent(tmplContent);
    if (tmpl.id === "new_letter") {
      setOriginalTemplateSnapshot(null);
      setIncludeQuotation(false);
    } else {
      setOriginalTemplateSnapshot({
        id: tmpl.id,
        name: tmpl.name,
        subject: tmplSubject,
        content: tmplContent,
      });
      if (
        tmpl.id === "quotation_transmittal" ||
        tmpl.name.toLowerCase().includes("quotation")
      ) {
        setIncludeQuotation(true);
      }
    }
  }

  // Update current loaded template permanently in database
  async function handleUpdateCurrentTemplate() {
    if (!currentLoadedTemplate || activeTemplate === "new_letter") return;
    setIsSavingTemplate(true);
    try {
      const res = await saveLetterTemplateAction({
        id: currentLoadedTemplate.id,
        name: currentLoadedTemplate.name,
        subject,
        body_markdown: content,
      });
      if (res.ok && res.data) {
        const updated = res.data;
        setTemplates((prev) =>
          prev.map((t) =>
            t.id === updated.id ||
            t.id === currentLoadedTemplate.id ||
            t.name.toLowerCase() === updated.name.toLowerCase()
              ? updated
              : t,
          ),
        );
        setActiveTemplate(updated.id);
        setOriginalTemplateSnapshot({
          id: updated.id,
          name: updated.name,
          subject: updated.subject,
          content: updated.body_markdown,
        });
        setFeedback({
          type: "success",
          message: `Template "${updated.name}" updated successfully with current opened letter.`,
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to update template.",
        });
      }
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to update template.",
      });
    } finally {
      setIsSavingTemplate(false);
    }
  }

  // Revert changes back to template default content
  function handleRevertTemplate() {
    if (!originalTemplateSnapshot) return;
    setSubject(originalTemplateSnapshot.subject);
    setContent(originalTemplateSnapshot.content);
  }

  // Save as permanent template
  async function handleSaveNewTemplateSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const name = newTemplateName.trim();
    if (!name) {
      setFeedback({
        type: "error",
        message: "Please enter a template display name.",
      });
      return;
    }
    setIsSavingTemplate(true);
    try {
      const res = await saveLetterTemplateAction({
        name,
        subject,
        body_markdown: content,
      });
      if (res.ok && res.data) {
        const created = res.data;
        setTemplates((prev) => [...prev, created]);
        setActiveTemplate(created.id);
        setOriginalTemplateSnapshot({
          id: created.id,
          name: created.name,
          subject: created.subject,
          content: created.body_markdown,
        });
        setShowSaveTemplateModal(false);
        setNewTemplateName("");
        setFeedback({
          type: "success",
          message: `Permanent template "${created.name}" created successfully.`,
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to create template.",
        });
      }
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to create template.",
      });
    } finally {
      setIsSavingTemplate(false);
    }
  }

  // Delete permanent template
  async function handleDeleteTemplateSubmit() {
    if (!templateToDelete) return;
    setIsDeletingTemplate(true);
    try {
      const res = await deleteLetterTemplateAction(templateToDelete.id);
      if (res.ok) {
        const deletedId = templateToDelete.id;
        const deletedName = templateToDelete.name;
        setTemplates((prev) => prev.filter((t) => t.id !== deletedId));
        if (activeTemplate === deletedId) {
          setActiveTemplate("new_letter");
          setOriginalTemplateSnapshot(null);
        }
        setShowDeleteModal(false);
        setTemplateToDelete(null);
        setFeedback({
          type: "success",
          message: `Template "${deletedName}" deleted permanently.`,
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to delete template.",
        });
      }
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to delete template.",
      });
    } finally {
      setIsDeletingTemplate(false);
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
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <label className={adminStyles.formLabel} style={{ marginBottom: 0 }}>
                      Search Registered School *
                    </label>
                    {schools.length > 0 && (
                      <span style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", color: "var(--a-accent)", fontWeight: 600 }}>
                        {schools.length.toLocaleString()} schools in database
                      </span>
                    )}
                  </div>
                  <div className={styles.searchWrapper} ref={schoolSearchContainerRef}>
                    <input
                      type="text"
                      className={adminStyles.inputField}
                      placeholder={
                        isLoadingSchools
                          ? "Loading 3,342 registered schools from database..."
                          : "Search by school name, town, or province..."
                      }
                      value={schoolSearchQuery}
                      onChange={(e) => {
                        setSchoolSearchQuery(e.target.value);
                        setShowSchoolDropdown(true);
                      }}
                      onFocus={() => setShowSchoolDropdown(true)}
                    />
                    {schoolSearchQuery && (
                      <button
                        type="button"
                        className={styles.clearSearchButton}
                        onClick={() => {
                          setSchoolSearchQuery("");
                          setSelectedSchoolId("");
                          setShowSchoolDropdown(true);
                        }}
                        title="Clear search"
                        aria-label="Clear search"
                      >
                        <X size={13} />
                      </button>
                    )}
                    {showSchoolDropdown && (
                      <div
                        className={styles.searchResultsDropdown}
                        onScroll={handleDropdownScroll}
                      >
                        <div className={styles.searchSummaryBadge}>
                          <span>
                            {schoolSearchQuery.trim()
                              ? `Found ${filteredSchools.length.toLocaleString()} matching school${
                                  filteredSchools.length === 1 ? "" : "s"
                                }`
                              : `All ${schools.length.toLocaleString()} Registered Schools in Database`}
                          </span>
                          {isSearchingLive && (
                            <span className={styles.searchingLiveIndicator}>
                              <Loader2 size={11} className={styles.spinIcon} /> Live DB Search
                            </span>
                          )}
                        </div>

                        {displayedSchools.length > 0 ? (
                          <>
                            {displayedSchools.map((school) => (
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
                            {displayedSchools.length < filteredSchools.length && (
                              <div className={styles.dropdownScrollHint}>
                                Scroll to load more ({displayedSchools.length} of{" "}
                                {filteredSchools.length.toLocaleString()})
                              </div>
                            )}
                          </>
                        ) : (
                          <div className={styles.noResultsText}>
                            {isLoadingSchools
                              ? "Loading schools from database..."
                              : isSearchingLive
                              ? "Searching live database..."
                              : `No registered schools found matching "${schoolSearchQuery}"`}
                          </div>
                        )}
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
              <div className={styles.headerActions}>
                <button
                  type="button"
                  onClick={() => handleSave("draft")}
                  disabled={isPending}
                  className={styles.cardActionBtn}
                  title="Save current letter as a draft"
                >
                  <Save size={13} />
                  Save Letter Draft
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewTemplateName(subject.trim() || "");
                    setShowSaveTemplateModal(true);
                  }}
                  disabled={!subject.trim() && !content.trim()}
                  className={`${styles.cardActionBtn} ${styles.cardActionBtnBrand}`}
                  title="Save current letter content as a permanent reusable template"
                >
                  <Bookmark size={13} />
                  + Save as Template
                </button>
                <button
                  type="button"
                  onClick={() => setShowManageTemplatesModal(true)}
                  className={styles.cardActionBtn}
                  title="Manage, view, and delete saved templates"
                >
                  <FolderEdit size={13} />
                  Manage Templates
                </button>
              </div>
            </div>

            {/* Template Picker Container with Active Status & Actions */}
            <div className={styles.templatePickerContainer}>
              <div className={styles.templatePillsRow}>
                <span className={styles.templateLabel}>
                  <Sparkles
                    size={12}
                    style={{ display: "inline", marginRight: 4 }}
                  />{" "}
                  Presets:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleApplyTemplate({
                      id: "new_letter",
                      name: "New Letter",
                      subject: "",
                      content: "",
                    })
                  }
                  className={`${styles.templatePill} ${
                    activeTemplate === "new_letter"
                      ? styles.templatePillActive
                      : ""
                  }`}
                >
                  New Letter
                </button>
                {templates.map((tmpl) => {
                  const isCurrentActive = activeTemplate === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl)}
                      className={`${styles.templatePill} ${
                        isCurrentActive ? styles.templatePillActive : ""
                      }`}
                    >
                      {tmpl.name}
                      {isCurrentActive && isTemplateModified && (
                        <span
                          className={styles.templatePillModifiedDot}
                          title="Modified from saved template"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Contextual Action Bar when a template is active */}
              {activeTemplate !== "new_letter" && currentLoadedTemplate && (
                <div className={styles.templateActionBar}>
                  <div className={styles.templateActiveMeta}>
                    <span>
                      Active Template:{" "}
                      <strong>{currentLoadedTemplate.name}</strong>
                    </span>
                    {isTemplateModified ? (
                      <span className={styles.templateModifiedAlert}>
                        <AlertTriangle size={12} />
                        Unsaved Edits to Template
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--db-text-muted, #94a3b8)",
                        }}
                      >
                        Loaded from template library
                      </span>
                    )}
                  </div>

                  <div className={styles.templateControlBtns}>
                    {isTemplateModified && (
                      <button
                        type="button"
                        onClick={handleRevertTemplate}
                        className={styles.templateRevertBtn}
                        title="Revert subject and body back to template defaults"
                      >
                        <RotateCcw size={12} />
                        Revert
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleUpdateCurrentTemplate}
                      disabled={isSavingTemplate}
                      className={styles.templateUpdateBtn}
                      title={`Save current opened letter over "${currentLoadedTemplate.name}" template`}
                    >
                      <Save size={12} />
                      {isSavingTemplate ? "Updating..." : "Update Template"}
                    </button>
                  </div>
                </div>
              )}
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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <label
                    className={adminStyles.formLabel}
                    style={{ marginBottom: 0 }}
                  >
                    Formal Body Content *
                  </label>
                  <div className={styles.viewToggleWrap}>
                    <button
                      type="button"
                      onClick={() => setEditorTab("write")}
                      className={`${styles.viewToggleBtn} ${
                        editorTab === "write" ? styles.viewToggleBtnActive : ""
                      }`}
                    >
                      <Edit3 size={12} />
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab("preview")}
                      className={`${styles.viewToggleBtn} ${
                        editorTab === "preview"
                          ? styles.viewToggleBtnActive
                          : ""
                      }`}
                    >
                      <Eye size={12} />
                      Formatted Preview
                    </button>
                  </div>
                </div>

                <div className={styles.editorContainer}>
                  {/* Rich Text Format Toolbar */}
                  <div className={styles.editorToolbar}>
                    {/* Text Styling: Bold, Italic, Underline */}
                    <div className={styles.toolbarGroup}>
                      <button
                        type="button"
                        onClick={() => applyFormatting("bold")}
                        className={styles.toolbarBtn}
                        title="Bold (Ctrl+B) — **text**"
                      >
                        <Bold size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatting("italic")}
                        className={styles.toolbarBtn}
                        title="Italic (Ctrl+I) — *text*"
                      >
                        <Italic size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatting("underline")}
                        className={styles.toolbarBtn}
                        title="Underline (Ctrl+U) — <u>text</u>"
                      >
                        <Underline size={14} />
                      </button>
                    </div>

                    <div className={styles.toolbarDivider} />

                    {/* Capitalization / Small Letters */}
                    <div className={styles.toolbarGroup}>
                      <button
                        type="button"
                        onClick={() => applyFormatting("uppercase")}
                        className={`${styles.toolbarBtn} ${styles.casePill}`}
                        title="UPPERCASE — Make selected text capital letters"
                      >
                        AA
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatting("lowercase")}
                        className={`${styles.toolbarBtn} ${styles.casePill}`}
                        title="lowercase — Make selected text small letters"
                      >
                        aa
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatting("titlecase")}
                        className={`${styles.toolbarBtn} ${styles.casePill}`}
                        title="Title Case — Capitalize first letter of each word"
                      >
                        Aa
                      </button>
                    </div>

                    <div className={styles.toolbarDivider} />

                    {/* Structure: Bullet points, Numbered list, Heading, Divider line */}
                    <div className={styles.toolbarGroup}>
                      <button
                        type="button"
                        onClick={() => applyFormatting("bullet")}
                        className={styles.toolbarBtn}
                        title="Bullet Points (• List)"
                      >
                        <List size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatting("numbered")}
                        className={styles.toolbarBtn}
                        title="Numbered List (1. List)"
                      >
                        <ListOrdered size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatting("heading")}
                        className={styles.toolbarBtn}
                        title="Heading (## Section Heading)"
                      >
                        <Heading2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatting("divider")}
                        className={styles.toolbarBtn}
                        title="Divider Line (---)"
                      >
                        <Minus size={14} />
                      </button>
                    </div>

                    <div
                      style={{
                        marginLeft: "auto",
                        fontSize: 11,
                        color: "var(--a-text-3, #94a3b8)",
                      }}
                    >
                      {content.length} chars •{" "}
                      {content.trim() ? content.trim().split(/\s+/).length : 0}{" "}
                      words
                    </div>
                  </div>

                  {editorTab === "write" ? (
                    <textarea
                      ref={contentTextareaRef}
                      className={`${adminStyles.textareaField} ${adminStyles.textareaFieldMd} ${styles.editorTextareaAttached}`}
                      style={{ minHeight: 320 }}
                      placeholder="Compose letter content (supports **bold**, <u>underline</u>, *italic*, bullet points •)..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onKeyDown={handleTextareaKeyDown}
                    />
                  ) : (
                    <div className={styles.previewPaper}>
                      {renderPreviewContent(content)}
                    </div>
                  )}
                </div>
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

      {/* Modal: Save as Permanent Template */}
      {showSaveTemplateModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowSaveTemplateModal(false)}
        >
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <Bookmark
                  size={16}
                  style={{ color: "var(--db-brand, #10b981)" }}
                />
                Save as Permanent Letter Template
              </h3>
              <button
                type="button"
                onClick={() => setShowSaveTemplateModal(false)}
                className={styles.modalCloseBtn}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveNewTemplateSubmit}>
              <div className={styles.modalBody}>
                <p
                  style={{
                    fontSize: 12.5,
                    color: "var(--db-text-muted, #94a3b8)",
                    margin: 0,
                  }}
                >
                  Save your current subject and body content as a permanent
                  template in the database. All team members can select and
                  reuse it from the Presets bar.
                </p>

                <div>
                  <label className={adminStyles.formLabel}>
                    Template Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    className={adminStyles.inputField}
                    placeholder="e.g. Term 3 Re-Opening & Procurement Brief"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div
                  style={{
                    padding: 10,
                    background: "var(--db-surface-inner, #111a2e)",
                    borderRadius: 6,
                    border: "1px solid var(--db-border, rgba(30, 41, 59, 0.7))",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--db-text-muted, #94a3b8)",
                      textTransform: "uppercase",
                      marginBottom: 4,
                    }}
                  >
                    Subject Line Preview:
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "var(--db-text-primary, #ffffff)",
                      fontWeight: 600,
                    }}
                  >
                    {subject || "(No subject line entered)"}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--db-text-muted, #94a3b8)",
                      marginTop: 6,
                    }}
                  >
                    Body content: {content.length} characters (
                    {content.trim() ? content.trim().split(/\s+/).length : 0}{" "}
                    words)
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <AdminButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveTemplateModal(false)}
                >
                  Cancel
                </AdminButton>
                <AdminButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSavingTemplate || !newTemplateName.trim()}
                  loading={isSavingTemplate}
                >
                  <Save size={13} />
                  Save Permanent Template
                </AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Template Confirmation */}
      {showDeleteModal && templateToDelete && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className={styles.modalCard}
            style={{ maxWidth: 460 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle} style={{ color: "#ef4444" }}>
                <Trash2 size={16} />
                Delete Letter Template
              </h3>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className={styles.modalCloseBtn}
              >
                <X size={16} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--db-text-primary, #ffffff)",
                  margin: 0,
                }}
              >
                Are you sure you want to permanently delete the template{" "}
                <strong>&quot;{templateToDelete.name}&quot;</strong>?
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--db-text-muted, #94a3b8)",
                  margin: 0,
                }}
              >
                Existing letters already created with this template will not be
                altered, but this template will be removed from future presets.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <AdminButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </AdminButton>
              <button
                type="button"
                onClick={handleDeleteTemplateSubmit}
                disabled={isDeletingTemplate}
                className={styles.templateDeleteBtn}
                style={{ padding: "7px 14px", fontSize: 12 }}
              >
                {isDeletingTemplate ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Manage All Templates */}
      {showManageTemplatesModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowManageTemplatesModal(false)}
        >
          <div
            className={styles.modalCard}
            style={{ maxWidth: 580 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <FolderEdit
                  size={16}
                  style={{ color: "var(--db-brand, #10b981)" }}
                />
                Manage Official Letter Templates ({templates.length})
              </h3>
              <button
                type="button"
                onClick={() => setShowManageTemplatesModal(false)}
                className={styles.modalCloseBtn}
              >
                <X size={16} />
              </button>
            </div>
            <div
              className={styles.modalBody}
              style={{ maxHeight: 380, overflowY: "auto" }}
            >
              {templates.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px 0",
                    color: "var(--db-text-muted, #94a3b8)",
                    fontSize: 13,
                  }}
                >
                  No saved templates found.
                </div>
              ) : (
                templates.map((tmpl) => (
                  <div key={tmpl.id} className={styles.templateListCard}>
                    <div className={styles.templateListInfo}>
                      <span className={styles.templateListName}>
                        {tmpl.name}
                      </span>
                      <span className={styles.templateListSubject}>
                        {tmpl.subject}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => {
                          handleApplyTemplate(tmpl);
                          setShowManageTemplatesModal(false);
                        }}
                        className={styles.cardActionBtn}
                        style={{ padding: "4px 8px", fontSize: 11 }}
                        title="Load this template into the editor"
                      >
                        <Check size={12} />
                        Use
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTemplateToDelete(tmpl);
                          setShowDeleteModal(true);
                        }}
                        className={styles.templateDeleteBtn}
                        style={{ padding: "4px 8px" }}
                        title="Delete template"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className={styles.modalFooter}>
              <AdminButton
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  setShowManageTemplatesModal(false);
                  setNewTemplateName(subject.trim() || "");
                  setShowSaveTemplateModal(true);
                }}
              >
                <Plus size={13} />
                + Add Current as New Template
              </AdminButton>
              <AdminButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowManageTemplatesModal(false)}
              >
                Close
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
