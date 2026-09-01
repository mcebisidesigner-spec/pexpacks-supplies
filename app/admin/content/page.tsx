"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Megaphone,
  HelpCircle,
  MessageSquareQuote,
  FolderDown,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  ExternalLink,
  Star,
  UploadCloud,
  FileText,
  Search,
  Eye,
  EyeOff,
  X,
  Loader2,
} from "lucide-react";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { FloatingTextarea } from "@/components/ui/FloatingTextarea";
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
} from "@/actions/cms";

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
  const [activeTab, setActiveTab] = useState<ContentTab>("eyebrows");
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  // Seed / DB state
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
      question: "How do I know my pack contains the exact items requested by the school?",
      answer: "Every Pexpacks Grade Pack is compiled directly from the verified official school stationery list supplied by partner schools.",
      is_published: true,
      sort_order: 1,
    },
    {
      id: "2",
      category: "Delivery & Pickup",
      question: "Can I choose between home delivery and school collection?",
      answer: "Yes. During checkout, you can select direct home delivery or free bulk delivery to the school before term starts.",
      is_published: true,
      sort_order: 2,
    },
  ]);

  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: "1",
      author_name: "Nokuthula Dlamini",
      author_role: "Parent of Grade 4 Learner",
      school_name: "Primrose Hill Primary",
      quote: "Ordering stationery was effortless this year. Everything was labeled and packed according to the teacher’s exact requirements.",
      rating: 5,
      is_featured: true,
    },
  ]);

  const [resources, setResources] = useState<ResourceItem[]>([
    {
      id: "1",
      title: "2027 Back-to-School Stationery Parent Guide",
      description: "Comprehensive guide explaining stationery grades, item substitutions, and delivery deadlines.",
      category: "Parent Guides",
      file_type: "PDF",
      file_size_label: "1.8 MB",
      file_url: "/assets/guides/2027-guide.pdf",
      download_count: 142,
      is_public: true,
    },
  ]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form input fields
  const [annBadge, setAnnBadge] = useState("");
  const [annMessage, setAnnMessage] = useState("");
  const [annLinkUrl, setAnnLinkUrl] = useState("");
  const [annLinkLabel, setAnnLinkLabel] = useState("");
  const [annLocation, setAnnLocation] = useState<"global_top" | "hero_banner" | "schools_page">("global_top");
  const [annActive, setAnnActive] = useState(true);

  const [faqCategory, setFaqCategory] = useState("Ordering");
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqPublished, setFaqPublished] = useState(true);

  const [testAuthor, setTestAuthor] = useState("");
  const [testRole, setTestRole] = useState("");
  const [testSchool, setTestSchool] = useState("");
  const [testQuote, setTestQuote] = useState("");
  const [testRating, setTestRating] = useState(5);
  const [testFeatured, setTestFeatured] = useState(true);

  const [resTitle, setResTitle] = useState("");
  const [resDesc, setResDesc] = useState("");
  const [resCat, setResCat] = useState("Parent Guides");
  const [resUrl, setResUrl] = useState("");
  const [resType, setResType] = useState("PDF");
  const [resSize, setResSize] = useState("1.5 MB");
  const [resPublic, setResPublic] = useState(true);

  // Hydrate from database on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCmsDataAction();
        if (!cancelled && data) {
          if (data.announcements.length > 0) {
            setAnnouncements(
              data.announcements.map((a) => ({
                id: a.id,
                badge_text: a.badge_text,
                message: a.message,
                link_url: a.link_url,
                link_label: a.link_label,
                is_active: a.is_active,
                display_location: a.display_location,
              }))
            );
          }
          if (data.faqs.length > 0) {
            setFaqs(
              data.faqs.map((f) => ({
                id: f.id,
                category: f.category,
                question: f.question,
                answer: f.answer,
                is_published: f.is_published,
                sort_order: f.sort_order,
              }))
            );
          }
          if (data.testimonials.length > 0) {
            setTestimonials(
              data.testimonials.map((t) => ({
                id: t.id,
                author_name: t.author_name,
                author_role: t.author_role,
                school_name: null,
                quote: t.quote,
                rating: t.rating,
                is_featured: t.is_featured,
              }))
            );
          }
          if (data.resources.length > 0) {
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
              }))
            );
          }
        }
      } catch (err) {
        console.warn("[cms-page] using offline seeds:", err);
      } finally {
        if (!cancelled) setLoading(false);
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
      setAnnMessage("Save up to 15% on 2027 Grade Stationery Packs until Sept 30");
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
      setResUrl("/assets/guides/checklist.pdf");
      setResType("PDF");
      setResSize("1.5 MB");
      setResPublic(true);
    }
    setIsModalOpen(true);
  };

  // ------------------------------------------------------
  // Handlers for Eyebrows
  // ------------------------------------------------------
  const handleToggleAnnouncement = (id: string, current: boolean) => {
    startTransition(async () => {
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_active: !current } : a))
      );
      await toggleAnnouncementActiveAction(id, !current);
    });
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (!confirm("Delete this announcement banner?")) return;
    startTransition(async () => {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      await deleteAnnouncementAction(id);
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

  // ------------------------------------------------------
  // Handlers for FAQs
  // ------------------------------------------------------
  const handleToggleFaq = (id: string, current: boolean) => {
    startTransition(async () => {
      setFaqs((prev) =>
        prev.map((f) => (f.id === id ? { ...f, is_published: !current } : f))
      );
      await toggleFaqPublishedAction(id, !current);
    });
  };

  const handleDeleteFaq = (id: string) => {
    if (!confirm("Delete this FAQ item?")) return;
    startTransition(async () => {
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      await deleteFaqAction(id);
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

  // ------------------------------------------------------
  // Handlers for Testimonials
  // ------------------------------------------------------
  const handleToggleTestimonial = (id: string, current: boolean) => {
    startTransition(async () => {
      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_featured: !current } : t))
      );
      await toggleTestimonialFeaturedAction(id, !current);
    });
  };

  const handleDeleteTestimonial = (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    startTransition(async () => {
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      await deleteTestimonialAction(id);
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

  // ------------------------------------------------------
  // Handlers for Resources
  // ------------------------------------------------------
  const handleToggleResource = (id: string, current: boolean) => {
    startTransition(async () => {
      setResources((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_public: !current } : r))
      );
      await toggleResourcePublicAction(id, !current);
    });
  };

  const handleDeleteResource = (id: string) => {
    if (!confirm("Delete this resource guide?")) return;
    startTransition(async () => {
      setResources((prev) => prev.filter((r) => r.id !== id));
      await deleteResourceAction(id);
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

  // ------------------------------------------------------
  // Save Modal Submit Handler
  // ------------------------------------------------------
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
            }))
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
            }))
          );
        } else {
          setModalError(res.message || "Failed to save FAQ");
        }
      } else if (activeTab === "testimonials") {
        const res = await saveTestimonialAction(editingId, {
          author_name: testAuthor,
          author_role: testRole,
          school_name: testSchool || undefined,
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
              school_name: testSchool || null,
              quote: t.quote,
              rating: t.rating,
              is_featured: t.is_featured,
            }))
          );
        } else {
          setModalError(res.message || "Failed to save testimonial");
        }
      } else if (activeTab === "resources") {
        const res = await saveResourceAction(editingId, {
          title: resTitle,
          description: resDesc,
          category: resCat,
          file_url: resUrl || "/assets/guides/checklist.pdf",
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
            }))
          );
        } else {
          setModalError(res.message || "Failed to save resource");
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 p-6 lg:p-10">
      {/* Context Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Site Content & CMS Hub
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage public copy, FAQs, announcement banners, parent testimonials, and resource downloads.
            </p>
          </div>
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-semibold text-sm transition-all shadow-sm w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>
              {activeTab === "eyebrows" && "New Announcement"}
              {activeTab === "faqs" && "New FAQ Item"}
              {activeTab === "testimonials" && "New Testimonial"}
              {activeTab === "resources" && "Upload Resource"}
            </span>
          </button>
        </div>

        {/* Multi-Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 mt-8 overflow-x-auto">
          <TabButton
            active={activeTab === "eyebrows"}
            onClick={() => setActiveTab("eyebrows")}
            icon={<Megaphone className="w-4 h-4" />}
            label="Eyebrows & Banners"
            count={announcements.length}
          />
          <TabButton
            active={activeTab === "faqs"}
            onClick={() => setActiveTab("faqs")}
            icon={<HelpCircle className="w-4 h-4" />}
            label="FAQs"
            count={faqs.length}
          />
          <TabButton
            active={activeTab === "testimonials"}
            onClick={() => setActiveTab("testimonials")}
            icon={<MessageSquareQuote className="w-4 h-4" />}
            label="Testimonials"
            count={testimonials.length}
          />
          <TabButton
            active={activeTab === "resources"}
            onClick={() => setActiveTab("resources")}
            icon={<FolderDown className="w-4 h-4" />}
            label="Resources Hub"
            count={resources.length}
          />
        </div>
      </div>

      {/* Tab Panels */}
      <div className="max-w-7xl mx-auto">
        {activeTab === "eyebrows" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {announcements.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#0c1322] border border-slate-800/90 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-emerald-500/30 transition-all shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        {item.badge_text}
                      </span>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">
                        Location: {item.display_location}
                      </span>
                    </div>
                    <p className="text-base font-semibold text-white">{item.message}</p>
                    {item.link_url && (
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        Link:{" "}
                        <span className="text-emerald-400">
                          {item.link_label || item.link_url}
                        </span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                    <button
                      onClick={() => handleToggleAnnouncement(item.id, item.is_active)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                        item.is_active
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-slate-800/60 text-slate-400 border-slate-700/60"
                      }`}
                    >
                      {item.is_active ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                      {item.is_active ? "Live" : "Hidden"}
                    </button>
                    <button
                      onClick={() => handleEditAnnouncement(item)}
                      className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(item.id)}
                      className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "faqs" && (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-[#0c1322] border border-slate-800/90 rounded-2xl p-6 space-y-3 hover:border-emerald-500/30 transition-all shadow-sm"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                      {faq.category}
                    </span>
                    <h3 className="text-base font-semibold text-white pt-1">
                      {faq.question}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleFaq(faq.id, faq.is_published)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                        faq.is_published
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-slate-800/60 text-slate-400 border-slate-700/60"
                      }`}
                    >
                      {faq.is_published ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                      {faq.is_published ? "Published" : "Draft"}
                    </button>
                    <button
                      onClick={() => handleEditFaq(faq)}
                      className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(faq.id)}
                      className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed pt-2 border-t border-slate-800/60">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "testimonials" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="bg-[#0c1322] border border-slate-800/90 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex text-amber-400">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    {item.is_featured && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-200 italic mb-6">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>

                <div className="border-t border-slate-800/60 pt-4 flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      {item.author_name}
                    </h4>
                    <p className="text-xs text-slate-400">{item.author_role}</p>
                    {item.school_name && (
                      <p className="text-xs text-emerald-400 mt-0.5">
                        {item.school_name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleTestimonial(item.id, item.is_featured)}
                      className={`p-2 rounded-lg transition-all ${
                        item.is_featured
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-slate-800 text-slate-400"
                      }`}
                      title={item.is_featured ? "Featured in marquee" : "Hidden"}
                    >
                      {item.is_featured ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleEditTestimonial(item)}
                      className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTestimonial(item.id)}
                      className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "resources" && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-slate-800/90 bg-[#0c1322]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="p-4">Title & Details</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">File Type / Size</th>
                    <th className="p-4">Downloads</th>
                    <th className="p-4">Visibility</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {resources.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-white">{res.title}</div>
                        <div className="text-xs text-slate-400 truncate max-w-sm mt-0.5">
                          {res.description}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {res.category}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-300">
                        {res.file_type} • {res.file_size_label}
                      </td>
                      <td className="p-4 font-mono text-xs text-emerald-400">
                        {res.download_count}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleResource(res.id, res.is_public)}
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border ${
                            res.is_public
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-slate-800/60 text-slate-400 border-slate-700/60"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {res.is_public ? "Public" : "Draft"}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleEditResource(res)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteResource(res.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Creation / Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-[#0c1322] border border-slate-800/90 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingId ? "Edit" : "New"}{" "}
                {activeTab === "eyebrows" && "Announcement Banner"}
                {activeTab === "faqs" && "FAQ Item"}
                {activeTab === "testimonials" && "Testimonial"}
                {activeTab === "resources" && "Resource Document"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-400">
                {modalError}
              </div>
            )}

            <form onSubmit={handleModalSubmit} className="space-y-4">
              {activeTab === "eyebrows" && (
                <>
                  <FloatingInput
                    label="Badge Text (e.g. Pre-Orders Open)"
                    value={annBadge}
                    onChange={(e) => setAnnBadge(e.target.value)}
                    required
                  />
                  <FloatingTextarea
                    label="Announcement Message"
                    value={annMessage}
                    onChange={(e) => setAnnMessage(e.target.value)}
                    required
                    rows={3}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FloatingInput
                      label="Link URL (e.g. /schools)"
                      value={annLinkUrl}
                      onChange={(e) => setAnnLinkUrl(e.target.value)}
                    />
                    <FloatingInput
                      label="Link Label (e.g. Find Your School)"
                      value={annLinkLabel}
                      onChange={(e) => setAnnLinkLabel(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Display Slot
                      </label>
                      <select
                        value={annLocation}
                        onChange={(e) =>
                          setAnnLocation(
                            e.target.value as "global_top" | "hero_banner" | "schools_page"
                          )
                        }
                        className="w-full bg-[#090e17] border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-emerald-500"
                      >
                        <option value="global_top">Global Top Header</option>
                        <option value="hero_banner">Homepage Hero Banner</option>
                        <option value="schools_page">Schools Page</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "faqs" && (
                <>
                  <FloatingInput
                    label="Category (Ordering, Delivery & Pickup, etc.)"
                    value={faqCategory}
                    onChange={(e) => setFaqCategory(e.target.value)}
                    required
                  />
                  <FloatingInput
                    label="Question"
                    value={faqQuestion}
                    onChange={(e) => setFaqQuestion(e.target.value)}
                    required
                  />
                  <FloatingTextarea
                    label="Answer"
                    value={faqAnswer}
                    onChange={(e) => setFaqAnswer(e.target.value)}
                    required
                    rows={4}
                  />
                </>
              )}

              {activeTab === "testimonials" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FloatingInput
                      label="Author Name"
                      value={testAuthor}
                      onChange={(e) => setTestAuthor(e.target.value)}
                      required
                    />
                    <FloatingInput
                      label="Author Role"
                      value={testRole}
                      onChange={(e) => setTestRole(e.target.value)}
                      required
                    />
                  </div>
                  <FloatingInput
                    label="School Name (Optional association pill)"
                    value={testSchool}
                    onChange={(e) => setTestSchool(e.target.value)}
                  />
                  <FloatingTextarea
                    label="Testimonial Quote"
                    value={testQuote}
                    onChange={(e) => setTestQuote(e.target.value)}
                    required
                    rows={3}
                  />
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Rating
                    </label>
                    <select
                      value={testRating}
                      onChange={(e) => setTestRating(Number(e.target.value))}
                      className="w-full bg-[#090e17] border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-emerald-500"
                    >
                      <option value={5}>★★★★★ (5 Stars)</option>
                      <option value={4}>★★★★☆ (4 Stars)</option>
                      <option value={3}>★★★☆☆ (3 Stars)</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === "resources" && (
                <>
                  <FloatingInput
                    label="Resource Document Title"
                    value={resTitle}
                    onChange={(e) => setResTitle(e.target.value)}
                    required
                  />
                  <FloatingTextarea
                    label="Short Description"
                    value={resDesc}
                    onChange={(e) => setResDesc(e.target.value)}
                    rows={2}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FloatingInput
                      label="Category (e.g. Parent Guides)"
                      value={resCat}
                      onChange={(e) => setResCat(e.target.value)}
                      required
                    />
                    <FloatingInput
                      label="File Size (e.g. 1.8 MB)"
                      value={resSize}
                      onChange={(e) => setResSize(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FloatingInput
                      label="File URL / Storage Path"
                      value={resUrl}
                      onChange={(e) => setResUrl(e.target.value)}
                      required
                    />
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Format
                      </label>
                      <select
                        value={resType}
                        onChange={(e) => setResType(e.target.value)}
                        className="w-full bg-[#090e17] border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-emerald-500"
                      >
                        <option value="PDF">PDF Document</option>
                        <option value="DOCX">Word Document (.docx)</option>
                        <option value="XLSX">Excel Sheet (.xlsx)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-semibold text-sm transition-all shadow-sm disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingId ? "Update Record" : "Save Record"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
        active
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-sm"
          : "text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent"
      }`}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-mono ${
            active
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-slate-800 text-slate-400"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
