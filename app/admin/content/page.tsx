"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
import {
  Megaphone,
  HelpCircle,
  MessageSquareQuote,
  FolderDown,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Star,
  Download,
  Eye,
  EyeOff,
  X,
  ChevronDown,
  ChevronUp,
  Save,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { useAdminDialog } from "@/components/admin/ui/AdminDialogContext";
import { DataTable, type ColumnDef } from "@/components/admin/shared/DataTable";
import {
  fetchCmsDataAction,
  saveAnnouncementAction,
  deleteAnnouncementAction,
  toggleAnnouncementActiveAction,
  saveFaqAction,
  deleteFaqAction,
  toggleFaqPublishedAction,
  saveTestimonialAction,
  deleteTestimonialAction,
  toggleTestimonialFeaturedAction,
  saveResourceAction,
  deleteResourceAction,
  toggleResourcePublicAction,
  saveHeroEyebrowAction,
} from "@/actions/cms";
import { PAGE_HERO_SECTIONS } from "@/lib/admin/content-constants";
import styles from "./content.module.css";
import coreStyles from "@/components/admin/views/CorePagesView.module.css";

type ContentTab = "eyebrows" | "faqs" | "testimonials" | "resources";

interface Announcement {
  id: string;
  badge_text: string;
  message: string;
  link_url?: string | null;
  link_label?: string | null;
  is_active: boolean;
  display_location: "global_top" | "hero_banner" | "schools_page";
}

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  is_published: boolean;
  sort_order: number;
}

interface Testimonial {
  id: string;
  author_name: string;
  author_role: string;
  school_name?: string | null;
  quote: string;
  rating: number;
  is_featured: boolean;
}

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  file_type: string;
  file_size_label: string;
  file_url?: string;
  download_count: number;
  is_public: boolean;
}

export default function ContentCMSPage() {
  const dialog = useAdminDialog();
  const [activeTab, setActiveTab] = useState<ContentTab>("eyebrows");
  const [isPending, startTransition] = useTransition();
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<string>("all");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // Data state
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: "1",
      badge_text: "Pre-Orders Open",
      message: "Save up to 15% on 2027 Grade Stationery Packs until Sept 30",
      link_url: "/schools",
      link_label: "Find Your School",
      is_active: true,
      display_location: "global_top",
    },
  ]);

  const [faqs, setFaqs] = useState<FAQItem[]>([
    {
      id: "1",
      category: "Ordering",
      question:
        "How do I know my pack contains the exact items requested by the school?",
      answer:
        "Every Pexpacks Grade Pack is compiled directly from the verified official school stationery list supplied by partner schools.",
      is_published: true,
      sort_order: 1,
    },
    {
      id: "2",
      category: "Delivery & Pickup",
      question: "Can I choose between home delivery and school collection?",
      answer:
        "Yes. During checkout, you can select direct home delivery or free bulk delivery to the school before term starts.",
      is_published: true,
      sort_order: 2,
    },
  ]);

  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: "1",
      author_name: "Sarah M.",
      author_role: "Parent of Grade 4 Learner",
      school_name: "Primrose Hill Primary",
      quote:
        "Saved us hours of shopping in crowded malls. Everything was pre-covered and labeled to exact school requirements.",
      rating: 5,
      is_featured: true,
    },
    {
      id: "2",
      author_name: "David K.",
      author_role: "Head of Department",
      school_name: "St Andrews College",
      quote:
        "The stationery arrived on day one with 100% accuracy. Pexpacks made stationery list distribution seamless.",
      rating: 5,
      is_featured: true,
    },
  ]);

  const [resources, setResources] = useState<ResourceItem[]>([
    {
      id: "1",
      title: "2027 Back-to-School Stationery Checklist",
      description:
        "Official printable guide for parents covering essential requirements per phase.",
      category: "Parent Guides",
      file_type: "PDF",
      file_size_label: "1.2 MB",
      file_url: "/assets/guides/stationery-checklist.pdf",
      download_count: 342,
      is_public: true,
    },
    {
      id: "2",
      title: "School Stationery Partnership Guide",
      description:
        "Information pack for principals and bursars detailing our consignment and packaging model.",
      category: "School Packs",
      file_type: "PDF",
      file_size_label: "2.8 MB",
      file_url: "/assets/guides/school-partnership-handbook.pdf",
      download_count: 118,
      is_public: true,
    },
  ]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form Fields - Announcement
  const [annBadge, setAnnBadge] = useState("");
  const [annMessage, setAnnMessage] = useState("");
  const [annLinkUrl, setAnnLinkUrl] = useState("");
  const [annLinkLabel, setAnnLinkLabel] = useState("");
  const [annLocation, setAnnLocation] = useState<
    "global_top" | "hero_banner" | "schools_page"
  >("global_top");
  const [annActive, setAnnActive] = useState(true);

  // Form Fields - FAQ
  const [faqCategory, setFaqCategory] = useState("Ordering");
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqPublished, setFaqPublished] = useState(true);

  // Form Fields - Testimonial
  const [testAuthor, setTestAuthor] = useState("");
  const [testRole, setTestRole] = useState("");
  const [testSchool, setTestSchool] = useState("");
  const [testQuote, setTestQuote] = useState("");
  const [testRating, setTestRating] = useState(5);
  const [testFeatured, setTestFeatured] = useState(true);

  // Form Fields - Resource
  const [resTitle, setResTitle] = useState("");
  const [resDesc, setResDesc] = useState("");
  const [resCat, setResCat] = useState("Parent Guides");
  const [resUrl, setResUrl] = useState("");
  const [resType, setResType] = useState("PDF");
  const [resSize, setResSize] = useState("1.5 MB");
  const [resPublic, setResPublic] = useState(true);

  const [eyebrows, setEyebrows] = useState<Record<string, string>>({});
  const [eyebrowSaving, setEyebrowSaving] = useState<string | null>(null);
  const [eyebrowFeedback, setEyebrowFeedback] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);

  // Hydrate from live DB via Server Action
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchCmsDataAction();
        if (cancelled) return;
        if (data) {
          if (data.announcements && data.announcements.length > 0) {
            setAnnouncements(
              data.announcements.map((a) => ({
                id: a.id,
                badge_text: a.badge_text,
                message: a.message,
                link_url: a.link_url,
                link_label: a.link_label,
                is_active: a.is_active,
                display_location: a.display_location,
              })),
            );
          }
          if (data.faqs && data.faqs.length > 0) {
            setFaqs(
              data.faqs.map((f) => ({
                id: f.id,
                category: f.category,
                question: f.question,
                answer: f.answer,
                is_published: f.is_published,
                sort_order: f.sort_order,
              })),
            );
          }
          if (data.testimonials && data.testimonials.length > 0) {
            setTestimonials(
              data.testimonials.map((t) => ({
                id: t.id,
                author_name: t.author_name,
                author_role: t.author_role,
                school_name: null,
                quote: t.quote,
                rating: t.rating,
                is_featured: t.is_featured,
              })),
            );
          }
          if (data.resources && data.resources.length > 0) {
            setResources(
              data.resources.map((r) => ({
                id: r.id,
                title: r.title,
                description: r.description || "",
                category: r.category,
                file_type: r.file_type,
                file_size_label: r.file_size_label || "",
                file_url: r.file_url,
                download_count: r.download_count,
                is_public: r.is_public,
              })),
            );
          }
          if (data.eyebrows) {
            setEyebrows((prev) => ({ ...prev, ...data.eyebrows }));
          }
        }
      } catch (err) {
        console.warn("[cms-page] using fallback seeds:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openNewModal = () => {
    setEditingId(null);
    setModalError(null);
    if (activeTab === "eyebrows") {
      setAnnBadge("Pre-Orders Open");
      setAnnMessage(
        "Save up to 15% on 2027 Grade Stationery Packs until Sept 30",
      );
      setAnnLinkUrl("/schools");
      setAnnLinkLabel("Find Your School");
      setAnnLocation("global_top");
      setAnnActive(true);
    } else if (activeTab === "faqs") {
      setFaqCategory("Ordering");
      setFaqQuestion("");
      setFaqAnswer("");
      setFaqPublished(true);
    } else if (activeTab === "testimonials") {
      setTestAuthor("");
      setTestRole("Parent of Grade 4 Learner");
      setTestSchool("Primrose Hill Primary");
      setTestQuote("");
      setTestRating(5);
      setTestFeatured(true);
    } else if (activeTab === "resources") {
      setResTitle("");
      setResDesc("");
      setResCat("Parent Guides");
      setResUrl("/assets/guides/stationery-checklist.pdf");
      setResType("PDF");
      setResSize("1.5 MB");
      setResPublic(true);
    }
    setIsModalOpen(true);
  };

  // Handlers for Announcements
  const handleToggleAnnouncement = (id: string, current: boolean) => {
    startTransition(async () => {
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_active: !current } : a)),
      );
      await toggleAnnouncementActiveAction(id, !current);
    });
  };

  const handleSaveEyebrow = async (key: string) => {
    const value = (eyebrows[key] ?? "").trim();
    setEyebrowSaving(key);
    setEyebrowFeedback(null);
    try {
      const res = await saveHeroEyebrowAction(key, value);
      if (res.ok) {
        setEyebrows((prev) => ({ ...prev, [key]: value }));
        setEyebrowFeedback({
          tone: "success",
          text: res.message || "Eyebrow saved and live.",
        });
      } else {
        setEyebrowFeedback({
          tone: "error",
          text: res.message || "Failed to save eyebrow.",
        });
      }
    } catch {
      setEyebrowFeedback({ tone: "error", text: "Failed to save eyebrow." });
    } finally {
      setEyebrowSaving(null);
    }
  };

  const handleDeleteAnnouncement = async (item: Announcement) => {
    const confirmed = await dialog.confirm({
      title: "Delete Announcement Banner",
      message: `Are you sure you want to delete "${item.badge_text}"? This will immediately remove it from all storefront banner displays.`,
      confirmLabel: "Delete Banner",
      cancelLabel: "Cancel",
      variant: "danger",
    });
    if (!confirmed) return;
    startTransition(async () => {
      setAnnouncements((prev) => prev.filter((a) => a.id !== item.id));
      await deleteAnnouncementAction(item.id);
    });
  };

  const handleEditAnnouncement = (item: Announcement) => {
    setEditingId(item.id);
    setAnnBadge(item.badge_text);
    setAnnMessage(item.message);
    setAnnLinkUrl(item.link_url || "");
    setAnnLinkLabel(item.link_label || "");
    setAnnLocation(item.display_location);
    setAnnActive(item.is_active);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Handlers for FAQs
  const handleToggleFaq = (id: string, current: boolean) => {
    startTransition(async () => {
      setFaqs((prev) =>
        prev.map((f) => (f.id === id ? { ...f, is_published: !current } : f)),
      );
      await toggleFaqPublishedAction(id, !current);
    });
  };

  const handleDeleteFaq = async (faq: FAQItem) => {
    const confirmed = await dialog.confirm({
      title: "Delete FAQ Entry",
      message: `Are you sure you want to delete "${faq.question}"? This will remove it from the customer help centre.`,
      confirmLabel: "Delete Question",
      cancelLabel: "Cancel",
      variant: "danger",
    });
    if (!confirmed) return;
    startTransition(async () => {
      setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
      await deleteFaqAction(faq.id);
    });
  };

  const handleEditFaq = (item: FAQItem) => {
    setEditingId(item.id);
    setFaqCategory(item.category);
    setFaqQuestion(item.question);
    setFaqAnswer(item.answer);
    setFaqPublished(item.is_published);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Handlers for Testimonials
  const handleToggleTestimonial = (id: string, current: boolean) => {
    startTransition(async () => {
      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_featured: !current } : t)),
      );
      await toggleTestimonialFeaturedAction(id, !current);
    });
  };

  const handleDeleteTestimonial = async (test: Testimonial) => {
    const confirmed = await dialog.confirm({
      title: "Delete Testimonial",
      message: `Are you sure you want to delete the review by ${test.author_name}? It will be removed from customer reviews and homepage highlights.`,
      confirmLabel: "Delete Testimonial",
      cancelLabel: "Cancel",
      variant: "danger",
    });
    if (!confirmed) return;
    startTransition(async () => {
      setTestimonials((prev) => prev.filter((t) => t.id !== test.id));
      await deleteTestimonialAction(test.id);
    });
  };

  const handleEditTestimonial = (item: Testimonial) => {
    setEditingId(item.id);
    setTestAuthor(item.author_name);
    setTestRole(item.author_role);
    setTestSchool(item.school_name || "");
    setTestQuote(item.quote);
    setTestRating(item.rating);
    setTestFeatured(item.is_featured);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Handlers for Resources
  const handleToggleResource = (id: string, current: boolean) => {
    startTransition(async () => {
      setResources((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_public: !current } : r)),
      );
      await toggleResourcePublicAction(id, !current);
    });
  };

  const handleDeleteResource = async (row: ResourceItem) => {
    const confirmed = await dialog.confirm({
      title: "Delete Resource Document",
      message: `Are you sure you want to delete "${row.title}"? Any existing download links will be deactivated.`,
      confirmLabel: "Delete Resource",
      cancelLabel: "Cancel",
      variant: "danger",
    });
    if (!confirmed) return;
    startTransition(async () => {
      setResources((prev) => prev.filter((r) => r.id !== row.id));
      await deleteResourceAction(row.id);
    });
  };

  const handleEditResource = (item: ResourceItem) => {
    setEditingId(item.id);
    setResTitle(item.title);
    setResDesc(item.description);
    setResCat(item.category);
    setResUrl(item.file_url || "");
    setResType(item.file_type);
    setResSize(item.file_size_label);
    setResPublic(item.is_public);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Modal Submit
  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    startTransition(async () => {
      if (activeTab === "eyebrows") {
        const res = await saveAnnouncementAction(editingId, {
          badge_text: annBadge,
          message: annMessage,
          link_url: annLinkUrl || undefined,
          link_label: annLinkLabel || undefined,
          display_location: annLocation,
          is_active: annActive,
        });
        if (res.ok) {
          setIsModalOpen(false);
          const data = await fetchCmsDataAction();
          setAnnouncements(
            data.announcements.map((a) => ({
              id: a.id,
              badge_text: a.badge_text,
              message: a.message,
              link_url: a.link_url,
              link_label: a.link_label,
              is_active: a.is_active,
              display_location: a.display_location,
            })),
          );
        } else {
          setModalError(res.message || "Failed to save announcement");
        }
      } else if (activeTab === "faqs") {
        const res = await saveFaqAction(editingId, {
          category: faqCategory,
          question: faqQuestion,
          answer: faqAnswer,
          is_published: faqPublished,
          sort_order: 1,
        });
        if (res.ok) {
          setIsModalOpen(false);
          const data = await fetchCmsDataAction();
          setFaqs(
            data.faqs.map((f) => ({
              id: f.id,
              category: f.category,
              question: f.question,
              answer: f.answer,
              is_published: f.is_published,
              sort_order: f.sort_order,
            })),
          );
        } else {
          setModalError(res.message || "Failed to save FAQ");
        }
      } else if (activeTab === "testimonials") {
        const res = await saveTestimonialAction(editingId, {
          author_name: testAuthor,
          author_role: testRole,
          quote: testQuote,
          rating: testRating,
          is_featured: testFeatured,
        });
        if (res.ok) {
          setIsModalOpen(false);
          const data = await fetchCmsDataAction();
          setTestimonials(
            data.testimonials.map((t) => ({
              id: t.id,
              author_name: t.author_name,
              author_role: t.author_role,
              school_name: null,
              quote: t.quote,
              rating: t.rating,
              is_featured: t.is_featured,
            })),
          );
        } else {
          setModalError(res.message || "Failed to save testimonial");
        }
      } else if (activeTab === "resources") {
        const res = await saveResourceAction(editingId, {
          title: resTitle,
          description: resDesc,
          category: resCat,
          file_url: resUrl || "/assets/guides/stationery-checklist.pdf",
          file_type: resType,
          file_size_label: resSize,
          is_public: resPublic,
        });
        if (res.ok) {
          setIsModalOpen(false);
          const data = await fetchCmsDataAction();
          setResources(
            data.resources.map((r) => ({
              id: r.id,
              title: r.title,
              description: r.description || "",
              category: r.category,
              file_type: r.file_type,
              file_size_label: r.file_size_label || "",
              file_url: r.file_url,
              download_count: r.download_count,
              is_public: r.is_public,
            })),
          );
        } else {
          setModalError(res.message || "Failed to save resource");
        }
      }
    });
  };

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    if (faqCategoryFilter === "all") return faqs;
    return faqs.filter((f) => f.category === faqCategoryFilter);
  }, [faqs, faqCategoryFilter]);

  // Resource DataTable Columns
  const resourceColumns: ColumnDef<ResourceItem>[] = [
    {
      key: "file_type",
      header: "TYPE",
      width: "90px",
      align: "center",
      render: (row) => (
        <span className={styles.badgeFormat}>{row.file_type}</span>
      ),
    },
    {
      key: "title",
      header: "DOCUMENT TITLE & DESCRIPTION",
      sortable: true,
      render: (row) => (
        <div className={coreStyles.productCell}>
          <span className={coreStyles.schoolNameTitle}>{row.title}</span>
          <span className={coreStyles.productBrand}>{row.description}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "CATEGORY",
      width: "140px",
      render: (row) => (
        <span className={styles.badgeCategory}>{row.category}</span>
      ),
    },
    {
      key: "file_size_label",
      header: "FILE SIZE",
      width: "110px",
      align: "center",
      render: (row) => (
        <span className={coreStyles.textMuted}>{row.file_size_label}</span>
      ),
    },
    {
      key: "download_count",
      header: "DOWNLOADS",
      width: "110px",
      align: "center",
      render: (row) => (
        <span className={coreStyles.skuBadge}>
          {row.download_count.toLocaleString()}
        </span>
      ),
    },
    {
      key: "is_public",
      header: "VISIBILITY",
      width: "120px",
      align: "center",
      render: (row) => (
        <StatusBadge
          status={row.is_public ? "Public" : "Internal"}
          tone={row.is_public ? "emerald" : "amber"}
          showDot
        />
      ),
    },
    {
      key: "actions",
      header: "ACTIONS",
      width: "120px",
      align: "right",
      sticky: "right",
      render: (row) => (
        <div
          className={styles.cardActions}
          onClick={(e) => e.stopPropagation()}
        >
          {row.file_url && (
            <a
              href={row.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.iconBtn}
              data-db-tooltip="Download File"
              aria-label="Download File"
            >
              <Download size={14} />
            </a>
          )}
          <button
            type="button"
            className={styles.iconBtn}
            data-db-tooltip="Edit Resource"
            aria-label="Edit Resource"
            onClick={() => handleEditResource(row)}
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            className={styles.iconBtnDanger}
            data-db-tooltip="Delete Resource"
            aria-label="Delete Resource"
            onClick={() => handleDeleteResource(row)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const totalItemCount =
    announcements.length + faqs.length + testimonials.length + resources.length;

  return (
    <div className={styles.container}>
      {/* 1. Page Header */}
      <AdminPageHeader
        title="Site Content CMS"
        count={totalItemCount}
        subtitle="Manage storefront announcement banners, FAQs, parent testimonials, and resource downloads."
        actions={
          <AdminButton
            variant="primary"
            icon={<Plus size={15} />}
            onClick={openNewModal}
          >
            {activeTab === "eyebrows" && "New Announcement"}
            {activeTab === "faqs" && "New FAQ Item"}
            {activeTab === "testimonials" && "New Testimonial"}
            {activeTab === "resources" && "Upload Resource"}
          </AdminButton>
        }
      />

      {/* 2. Responsive Segmented Tab Bar */}
      <div className={styles.tabBar} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "eyebrows"}
          className={`${styles.tabBtn} ${activeTab === "eyebrows" ? styles.tabBtnActive : styles.tabBtnInactive}`}
          onClick={() => setActiveTab("eyebrows")}
        >
          <Megaphone size={15} />
          <span>Eyebrows & Banners</span>
          <span className={styles.tabCount}>{announcements.length}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "faqs"}
          className={`${styles.tabBtn} ${activeTab === "faqs" ? styles.tabBtnActive : styles.tabBtnInactive}`}
          onClick={() => setActiveTab("faqs")}
        >
          <HelpCircle size={15} />
          <span>FAQs</span>
          <span className={styles.tabCount}>{faqs.length}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "testimonials"}
          className={`${styles.tabBtn} ${activeTab === "testimonials" ? styles.tabBtnActive : styles.tabBtnInactive}`}
          onClick={() => setActiveTab("testimonials")}
        >
          <MessageSquareQuote size={15} />
          <span>Testimonials</span>
          <span className={styles.tabCount}>{testimonials.length}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "resources"}
          className={`${styles.tabBtn} ${activeTab === "resources" ? styles.tabBtnActive : styles.tabBtnInactive}`}
          onClick={() => setActiveTab("resources")}
        >
          <FolderDown size={15} />
          <span>Resources Hub</span>
          <span className={styles.tabCount}>{resources.length}</span>
        </button>
      </div>

      {/* 3. Tab Panels */}

      {/* ── TAB 1: EYEBROWS & ANNOUNCEMENTS ── */}
      {activeTab === "eyebrows" && (
        <>
          <div className={styles.eyebrowPanel}>
            <div className={styles.eyebrowPanelHeader}>
              <h2 className={styles.cardTitle}>Page hero eyebrows</h2>
              <p>
                The short label shown above the title in each page&rsquo;s hero
                section. Save updates the live site immediately.
              </p>
            </div>
            {eyebrowFeedback ? (
              <p
                role="status"
                className={`${styles.eyebrowFeedback} ${
                  eyebrowFeedback.tone === "success"
                    ? styles.eyebrowFeedbackSuccess
                    : styles.eyebrowFeedbackError
                }`}
              >
                {eyebrowFeedback.text}
              </p>
            ) : null}
            <div className={styles.eyebrowRows}>
              {PAGE_HERO_SECTIONS.map((section) => (
                <div key={section.key} className={styles.eyebrowRow}>
                  <div className={styles.eyebrowRowMeta}>
                    <span className={styles.eyebrowRowLabel}>
                      {section.label}
                    </span>
                    <a
                      href={section.route}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.cardLinkRow}
                    >
                      <span>View page</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={eyebrows[section.key] ?? ""}
                    onChange={(e) =>
                      setEyebrows((prev) => ({
                        ...prev,
                        [section.key]: e.target.value,
                      }))
                    }
                    placeholder="Page eyebrow text"
                    aria-label={`${section.label} eyebrow`}
                  />
                  <button
                    type="button"
                    className={styles.eyebrowSaveBtn}
                    disabled={eyebrowSaving === section.key}
                    onClick={() => handleSaveEyebrow(section.key)}
                  >
                    <Save size={14} />
                    {eyebrowSaving === section.key ? "Saving…" : "Save"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.grid1}>
            {announcements.length === 0 ? (
              <div className={styles.emptyState}>
                <Megaphone size={32} />
                <div className={styles.emptyTitle}>No announcements found</div>
                <div className={styles.emptySubtitle}>
                  Create an announcement banner to display discounts or notices
                  to visitors.
                </div>
                <AdminButton
                  variant="primary"
                  icon={<Plus size={14} />}
                  onClick={openNewModal}
                >
                  Create Announcement
                </AdminButton>
              </div>
            ) : (
              announcements.map((item) => (
                <div key={item.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardBadges}>
                      <span className={styles.badgeLocation}>
                        {item.display_location}
                      </span>
                      <span className={styles.badgeCategory}>
                        {item.badge_text}
                      </span>
                    </div>
                    <StatusBadge
                      status={item.is_active ? "Live" : "Hidden"}
                      tone={item.is_active ? "emerald" : "slate"}
                      showDot
                    />
                  </div>

                  <p className={styles.cardMessage}>{item.message}</p>

                  {item.link_url && (
                    <a
                      href={item.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.cardLinkRow}
                    >
                      <span>{item.link_label || "View Destination"}</span>
                      <ExternalLink size={13} />
                    </a>
                  )}

                  <div className={styles.cardFooter}>
                    <AdminButton
                      variant="outline"
                      size="sm"
                      icon={
                        item.is_active ? (
                          <EyeOff size={13} />
                        ) : (
                          <Eye size={13} />
                        )
                      }
                      onClick={() =>
                        handleToggleAnnouncement(item.id, item.is_active)
                      }
                    >
                      {item.is_active ? "Deactivate" : "Activate"}
                    </AdminButton>

                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        data-db-tooltip="Edit Banner"
                        aria-label="Edit Banner"
                        onClick={() => handleEditAnnouncement(item)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        className={styles.iconBtnDanger}
                        data-db-tooltip="Delete Banner"
                        aria-label="Delete Banner"
                        onClick={() => handleDeleteAnnouncement(item)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ── TAB 2: FAQs ── */}
      {activeTab === "faqs" && (
        <div>
          {/* Category Filter Pills */}
          <div className={styles.filterBar}>
            {[
              "all",
              "Ordering",
              "Delivery & Pickup",
              "School Packs",
              "Payments",
            ].map((cat) => (
              <button
                key={cat}
                type="button"
                className={`${styles.filterPill} ${faqCategoryFilter === cat ? styles.filterPillActive : styles.filterPillInactive}`}
                onClick={() => setFaqCategoryFilter(cat)}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>

          <div className={styles.grid1}>
            {filteredFaqs.length === 0 ? (
              <div className={styles.emptyState}>
                <HelpCircle size={32} />
                <div className={styles.emptyTitle}>
                  No FAQs found in this category
                </div>
                <div className={styles.emptySubtitle}>
                  Add common customer questions and clear answers for the
                  storefront.
                </div>
                <AdminButton
                  variant="primary"
                  icon={<Plus size={14} />}
                  onClick={openNewModal}
                >
                  New FAQ
                </AdminButton>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;
                return (
                  <div key={faq.id} className={styles.card}>
                    <div
                      className={styles.faqHeader}
                      onClick={() =>
                        setExpandedFaqId(isExpanded ? null : faq.id)
                      }
                    >
                      <div className={styles.faqQuestion}>
                        <span className={styles.badgeCategory}>
                          {faq.category}
                        </span>
                        <span>{faq.question}</span>
                      </div>
                      <div className={styles.cardActions}>
                        <StatusBadge
                          status={faq.is_published ? "Published" : "Draft"}
                          tone={faq.is_published ? "emerald" : "slate"}
                          showDot
                        />
                        <button
                          type="button"
                          className={styles.iconBtn}
                          aria-label={
                            isExpanded ? "Collapse Answer" : "Expand Answer"
                          }
                        >
                          {isExpanded ? (
                            <ChevronUp size={15} />
                          ) : (
                            <ChevronDown size={15} />
                          )}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className={styles.faqAnswer}>{faq.answer}</div>
                    )}

                    <div className={styles.cardFooter}>
                      <AdminButton
                        variant="outline"
                        size="sm"
                        icon={
                          faq.is_published ? (
                            <EyeOff size={13} />
                          ) : (
                            <Eye size={13} />
                          )
                        }
                        onClick={() =>
                          handleToggleFaq(faq.id, faq.is_published)
                        }
                      >
                        {faq.is_published ? "Unpublish" : "Publish"}
                      </AdminButton>

                      <div className={styles.cardActions}>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          data-db-tooltip="Edit FAQ"
                          aria-label="Edit FAQ"
                          onClick={() => handleEditFaq(faq)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className={styles.iconBtnDanger}
                          data-db-tooltip="Delete FAQ"
                          aria-label="Delete FAQ"
                          onClick={() => handleDeleteFaq(faq)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: TESTIMONIALS ── */}
      {activeTab === "testimonials" && (
        <div className={styles.grid2}>
          {testimonials.length === 0 ? (
            <div className={styles.emptyState} style={{ gridColumn: "1 / -1" }}>
              <MessageSquareQuote size={32} />
              <div className={styles.emptyTitle}>No testimonials yet</div>
              <div className={styles.emptySubtitle}>
                Add verified quotes from parents, teachers, and school heads.
              </div>
              <AdminButton
                variant="primary"
                icon={<Plus size={14} />}
                onClick={openNewModal}
              >
                Add Testimonial
              </AdminButton>
            </div>
          ) : (
            testimonials.map((test) => (
              <div key={test.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.starRow}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < test.rating ? "#eab308" : "none"}
                        stroke={i < test.rating ? "#eab308" : "#64748b"}
                      />
                    ))}
                  </div>
                  <StatusBadge
                    status={test.is_featured ? "Featured" : "Standard"}
                    tone={test.is_featured ? "emerald" : "slate"}
                    showDot
                  />
                </div>

                <p className={styles.quoteText}>&ldquo;{test.quote}&rdquo;</p>

                <div className={styles.authorRow}>
                  <span className={styles.authorName}>{test.author_name}</span>
                  <span className={styles.authorRole}>{test.author_role}</span>
                </div>

                {test.school_name && (
                  <div>
                    <span className={styles.badgeSchool}>
                      {test.school_name}
                    </span>
                  </div>
                )}

                <div className={styles.cardFooter}>
                  <AdminButton
                    variant="outline"
                    size="sm"
                    icon={
                      test.is_featured ? (
                        <EyeOff size={13} />
                      ) : (
                        <Eye size={13} />
                      )
                    }
                    onClick={() =>
                      handleToggleTestimonial(test.id, test.is_featured)
                    }
                  >
                    {test.is_featured ? "Unfeature" : "Feature"}
                  </AdminButton>

                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      data-db-tooltip="Edit Testimonial"
                      aria-label="Edit Testimonial"
                      onClick={() => handleEditTestimonial(test)}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      className={styles.iconBtnDanger}
                      data-db-tooltip="Delete Testimonial"
                      aria-label="Delete Testimonial"
                      onClick={() => handleDeleteTestimonial(test)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TAB 4: RESOURCES HUB (DATA TABLE) ── */}
      {activeTab === "resources" && (
        <DataTable
          data={resources}
          columns={resourceColumns}
          keyExtractor={(row) => row.id}
          emptyTitle="No resource documents uploaded"
          emptySubtitle="Upload stationery checklists, packaging policies, or parent guides."
        />
      )}

      {/* ── 4. Add / Edit Modal Dialog ── */}
      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className={styles.modalDialog}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingId ? "Edit Item" : "Create New Item"} —{" "}
                {activeTab === "eyebrows" && "Announcement Banner"}
                {activeTab === "faqs" && "FAQ Entry"}
                {activeTab === "testimonials" && "Parent Testimonial"}
                {activeTab === "resources" && "Resource Document"}
              </h2>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit}>
              <div className={styles.modalBody}>
                {modalError && (
                  <div className={styles.errorMessage}>{modalError}</div>
                )}

                {/* Eyebrow Form */}
                {activeTab === "eyebrows" && (
                  <>
                    <div className={styles.formGrid2}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Badge Tag</label>
                        <input
                          type="text"
                          required
                          value={annBadge}
                          onChange={(e) => setAnnBadge(e.target.value)}
                          placeholder="e.g. Back-to-School 2027"
                          className={styles.formInput}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          Display Placement
                        </label>
                        <select
                          value={annLocation}
                          onChange={(e) =>
                            setAnnLocation(
                              e.target.value as
                                | "global_top"
                                | "hero_banner"
                                | "schools_page",
                            )
                          }
                          className={styles.formSelect}
                        >
                          <option value="global_top">Global Top Bar</option>
                          <option value="hero_banner">
                            Storefront Hero Banner
                          </option>
                          <option value="schools_page">
                            Schools Directory Page
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Banner Message</label>
                      <textarea
                        required
                        value={annMessage}
                        onChange={(e) => setAnnMessage(e.target.value)}
                        placeholder="e.g. Save 15% on official stationery packs before term begins!"
                        className={styles.formTextarea}
                      />
                    </div>

                    <div className={styles.formGrid2}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          Destination URL (Optional)
                        </label>
                        <input
                          type="text"
                          value={annLinkUrl}
                          onChange={(e) => setAnnLinkUrl(e.target.value)}
                          placeholder="/schools or https://..."
                          className={styles.formInput}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          Link Label (Optional)
                        </label>
                        <input
                          type="text"
                          value={annLinkLabel}
                          onChange={(e) => setAnnLinkLabel(e.target.value)}
                          placeholder="e.g. View Packs"
                          className={styles.formInput}
                        />
                      </div>
                    </div>

                    <label className={styles.checkboxWrap}>
                      <input
                        type="checkbox"
                        checked={annActive}
                        onChange={(e) => setAnnActive(e.target.checked)}
                        className={styles.checkbox}
                      />
                      <span>Active on storefront immediately</span>
                    </label>
                  </>
                )}

                {/* FAQ Form */}
                {activeTab === "faqs" && (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Category</label>
                      <select
                        value={faqCategory}
                        onChange={(e) => setFaqCategory(e.target.value)}
                        className={styles.formSelect}
                      >
                        <option value="Ordering">Ordering</option>
                        <option value="Delivery & Pickup">
                          Delivery & Pickup
                        </option>
                        <option value="School Packs">School Packs</option>
                        <option value="Payments">Payments</option>
                        <option value="Returns & Policies">
                          Returns & Policies
                        </option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Question</label>
                      <input
                        type="text"
                        required
                        value={faqQuestion}
                        onChange={(e) => setFaqQuestion(e.target.value)}
                        placeholder="e.g. Can I order for multiple children in different grades?"
                        className={styles.formInput}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Answer</label>
                      <textarea
                        required
                        value={faqAnswer}
                        onChange={(e) => setFaqAnswer(e.target.value)}
                        placeholder="Detailed answer explaining procedure or policy..."
                        className={styles.formTextarea}
                      />
                    </div>

                    <label className={styles.checkboxWrap}>
                      <input
                        type="checkbox"
                        checked={faqPublished}
                        onChange={(e) => setFaqPublished(e.target.checked)}
                        className={styles.checkbox}
                      />
                      <span>Publish on storefront FAQ page</span>
                    </label>
                  </>
                )}

                {/* Testimonial Form */}
                {activeTab === "testimonials" && (
                  <>
                    <div className={styles.formGrid2}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Author Name</label>
                        <input
                          type="text"
                          required
                          value={testAuthor}
                          onChange={(e) => setTestAuthor(e.target.value)}
                          placeholder="e.g. Amanda Khumalo"
                          className={styles.formInput}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          Role / Association
                        </label>
                        <input
                          type="text"
                          required
                          value={testRole}
                          onChange={(e) => setTestRole(e.target.value)}
                          placeholder="e.g. Parent of Grade 2 Learner"
                          className={styles.formInput}
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        School Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={testSchool}
                        onChange={(e) => setTestSchool(e.target.value)}
                        placeholder="e.g. Primrose Hill Primary"
                        className={styles.formInput}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        Rating (1 to 5 Stars)
                      </label>
                      <div className={styles.starRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setTestRating(star)}
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              padding: "4px",
                            }}
                          >
                            <Star
                              size={20}
                              fill={star <= testRating ? "#eab308" : "none"}
                              stroke={
                                star <= testRating ? "#eab308" : "#64748b"
                              }
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Quote Text</label>
                      <textarea
                        required
                        value={testQuote}
                        onChange={(e) => setTestQuote(e.target.value)}
                        placeholder="Customer review or recommendation quote..."
                        className={styles.formTextarea}
                      />
                    </div>

                    <label className={styles.checkboxWrap}>
                      <input
                        type="checkbox"
                        checked={testFeatured}
                        onChange={(e) => setTestFeatured(e.target.checked)}
                        className={styles.checkbox}
                      />
                      <span>Feature in storefront homepage marquee</span>
                    </label>
                  </>
                )}

                {/* Resource Form */}
                {activeTab === "resources" && (
                  <>
                    <div className={styles.formGrid2}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          Document Title
                        </label>
                        <input
                          type="text"
                          required
                          value={resTitle}
                          onChange={(e) => setResTitle(e.target.value)}
                          placeholder="e.g. 2027 Stationery List"
                          className={styles.formInput}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Category</label>
                        <select
                          value={resCat}
                          onChange={(e) => setResCat(e.target.value)}
                          className={styles.formSelect}
                        >
                          <option value="Parent Guides">Parent Guides</option>
                          <option value="School Packs">School Packs</option>
                          <option value="Policies">
                            Policies & Guidelines
                          </option>
                          <option value="Forms">Order Forms</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Description</label>
                      <textarea
                        value={resDesc}
                        onChange={(e) => setResDesc(e.target.value)}
                        placeholder="Brief summary of document contents..."
                        className={styles.formTextarea}
                      />
                    </div>

                    <div className={styles.formGrid2}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>File Format</label>
                        <select
                          value={resType}
                          onChange={(e) => setResType(e.target.value)}
                          className={styles.formSelect}
                        >
                          <option value="PDF">PDF</option>
                          <option value="DOCX">DOCX</option>
                          <option value="XLSX">XLSX</option>
                          <option value="ZIP">ZIP</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>File Size</label>
                        <input
                          type="text"
                          value={resSize}
                          onChange={(e) => setResSize(e.target.value)}
                          placeholder="e.g. 1.5 MB"
                          className={styles.formInput}
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        File Storage Path or URL
                      </label>
                      <input
                        type="text"
                        value={resUrl}
                        onChange={(e) => setResUrl(e.target.value)}
                        placeholder="/assets/guides/... or Supabase storage URL"
                        className={styles.formInput}
                      />
                    </div>

                    <label className={styles.checkboxWrap}>
                      <input
                        type="checkbox"
                        checked={resPublic}
                        onChange={(e) => setResPublic(e.target.checked)}
                        className={styles.checkbox}
                      />
                      <span>Make available for public parent downloads</span>
                    </label>
                  </>
                )}
              </div>

              <div className={styles.modalFooter}>
                <AdminButton
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </AdminButton>
                <AdminButton
                  variant="primary"
                  type="submit"
                  disabled={isPending}
                >
                  {isPending
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Create Item"}
                </AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
