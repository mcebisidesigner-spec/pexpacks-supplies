"use client";

import React, { useState, useTransition } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  HelpCircle,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { CmsFaqRow } from "@/lib/admin/content";
import {
  saveCmsFaqAction,
  deleteCmsFaqAction,
  toggleCmsFaqPublishedAction,
} from "@/app/admin/content/actions";
import styles from "./CmsContentManager.module.css";

type FaqPageKey =
  | "all"
  | "homepage"
  | "schools"
  | "track_order"
  | "happy_pay"
  | "add_your_school"
  | "partnership";

const FAQ_APP_PAGES: { id: FaqPageKey; label: string }[] = [
  { id: "all", label: "All Pages" },
  { id: "homepage", label: "Homepage" },
  { id: "schools", label: "Schools Directory" },
  { id: "track_order", label: "Track Order" },
  { id: "happy_pay", label: "Happy Pay" },
  { id: "add_your_school", label: "Add Your School" },
  { id: "partnership", label: "Partnerships" },
];

const PAGE_BADGE_CONFIG: Record<
  FaqPageKey,
  { bg: string; color: string; label: string }
> = {
  all: {
    bg: "rgba(245, 158, 11, 0.15)",
    color: "#fbbf24",
    label: "All Pages",
  },
  homepage: {
    bg: "rgba(56, 189, 248, 0.15)",
    color: "#38bdf8",
    label: "Homepage",
  },
  schools: {
    bg: "rgba(168, 85, 247, 0.15)",
    color: "#a855f7",
    label: "Schools Directory",
  },
  track_order: {
    bg: "rgba(16, 185, 129, 0.15)",
    color: "#10b981",
    label: "Track Order",
  },
  happy_pay: {
    bg: "rgba(236, 72, 153, 0.15)",
    color: "#ec4899",
    label: "Happy Pay",
  },
  add_your_school: {
    bg: "rgba(99, 102, 241, 0.15)",
    color: "#818cf8",
    label: "Add Your School",
  },
  partnership: {
    bg: "rgba(20, 184, 166, 0.15)",
    color: "#2dd4bf",
    label: "Partnerships",
  },
};

interface FaqsTabProps {
  initialFaqs: CmsFaqRow[];
}

export function FaqsTab({ initialFaqs }: FaqsTabProps) {
  const [items, setItems] = useState<CmsFaqRow[]>(initialFaqs);
  const [selectedPage, setSelectedPage] = useState<FaqPageKey>("all");
  const [editingItem, setEditingItem] = useState<CmsFaqRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [targetPage, setTargetPage] = useState<
    NonNullable<CmsFaqRow["target_page"]>
  >("all");
  const [category, setCategory] = useState("General");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(true);

  const openCreateModal = () => {
    setEditingItem(null);
    setTargetPage(selectedPage !== "all" ? selectedPage : "all");
    setCategory("General");
    setQuestion("");
    setAnswer("");
    setSortOrder(items.length + 1);
    setIsPublished(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: CmsFaqRow) => {
    setEditingItem(item);
    setTargetPage(item.target_page ?? "all");
    setCategory(item.category);
    setQuestion(item.question);
    setAnswer(item.answer);
    setSortOrder(item.sort_order);
    setIsPublished(item.is_published);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleTogglePublished = (id: string, current: boolean) => {
    startTransition(async () => {
      const res = await toggleCmsFaqPublishedAction(id, !current);
      if (res.ok) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === id ? { ...it, is_published: !current } : it,
          ),
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteCmsFaqAction(id);
      if (res.ok) {
        setItems((prev) => prev.filter((it) => it.id !== id));
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData();
    formData.set("target_page", targetPage);
    formData.set("category", category);
    formData.set("question", question);
    formData.set("answer", answer);
    formData.set("sort_order", String(sortOrder));
    formData.set("is_published", isPublished ? "true" : "false");

    startTransition(async () => {
      const res = await saveCmsFaqAction(
        editingItem ? editingItem.id : null,
        {},
        formData,
      );
      if (res.ok) {
        setIsModalOpen(false);
        if (editingItem) {
          setItems((prev) =>
            prev.map((it) =>
              it.id === editingItem.id
                ? {
                    ...it,
                    target_page: targetPage,
                    category,
                    question,
                    answer,
                    sort_order: sortOrder,
                    is_published: isPublished,
                  }
                : it,
            ),
          );
        } else {
          setItems((prev) => [
            ...prev,
            {
              id: Math.random().toString(),
              target_page: targetPage,
              category,
              question,
              answer,
              sort_order: sortOrder,
              is_published: isPublished,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);
        }
      } else {
        setErrorMsg(res.message || "Failed to save FAQ.");
      }
    });
  };

  const filteredItems = items.filter((it) => {
    const itemTarget = it.target_page || "all";
    if (selectedPage === "all") return true;
    return itemTarget === selectedPage || itemTarget === "all";
  });

  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <h3 className={styles.sectionTitle}>
            <HelpCircle size={20} color="#10b981" />
            Frequently Asked Questions (Storefront FAQs)
          </h3>
          <p className={styles.sectionSubtitle}>
            Clarify ordering instructions, delivery windows, payment methods,
            and Pexcover details.
          </p>
        </div>
        <button className={styles.primaryBtn} onClick={openCreateModal}>
          <Plus size={16} /> New FAQ
        </button>
      </div>

      {/* App Page Filter Tabs */}
      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}
      >
        {FAQ_APP_PAGES.map((pt) => {
          const count =
            pt.id === "all"
              ? items.length
              : items.filter(
                  (it) => it.target_page === pt.id || it.target_page === "all",
                ).length;

          return (
            <button
              key={pt.id}
              type="button"
              className={`${styles.tabButton} ${selectedPage === pt.id ? styles.tabButtonActive : ""}`}
              onClick={() => setSelectedPage(pt.id)}
              style={{ padding: "6px 14px", fontSize: 13 }}
            >
              {pt.label} ({count})
            </button>
          );
        })}
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: "40px" }}>#</th>
              <th>Page & Category</th>
              <th>Question & Answer Preview</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className={styles.emptyState}>
                    No FAQs found for this page. Click New FAQ to create one!
                  </div>
                </td>
              </tr>
            ) : (
              filteredItems.map((item, idx) => {
                const isExpanded = expandedId === item.id;
                const pageCfg =
                  PAGE_BADGE_CONFIG[
                    (item.target_page as FaqPageKey) || "all"
                  ] || PAGE_BADGE_CONFIG.all;

                return (
                  <tr key={item.id}>
                    <td style={{ color: "#64748b", fontWeight: 600 }}>
                      {item.sort_order || idx + 1}
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <span
                          className={styles.badge}
                          style={{
                            width: "fit-content",
                            background: pageCfg.bg,
                            color: pageCfg.color,
                            fontWeight: 700,
                            fontSize: 11,
                            textTransform: "uppercase",
                          }}
                        >
                          {pageCfg.label}
                        </span>
                        <span
                          className={`${styles.badge} ${styles.badgeBlue}`}
                          style={{ width: "fit-content" }}
                        >
                          {item.category}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                        onClick={() =>
                          setExpandedId(isExpanded ? null : item.id)
                        }
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            color: "#f8fafc",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          {item.question}
                          {isExpanded ? (
                            <ChevronUp size={14} color="#10b981" />
                          ) : (
                            <ChevronDown size={14} color="#64748b" />
                          )}
                        </span>
                        {isExpanded ? (
                          <p
                            style={{
                              margin: "6px 0 0",
                              color: "#94a3b8",
                              lineHeight: 1.5,
                              fontSize: 13,
                            }}
                          >
                            {item.answer}
                          </p>
                        ) : (
                          <span style={{ color: "#64748b", fontSize: 12 }}>
                            {item.answer.slice(0, 90)}...
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`${styles.badge} ${item.is_published ? styles.badgeEmerald : styles.badgeSlate}`}
                        onClick={() =>
                          handleTogglePublished(item.id, item.is_published)
                        }
                        style={{ cursor: "pointer" }}
                      >
                        {item.is_published ? (
                          <Check size={12} />
                        ) : (
                          <X size={12} />
                        )}
                        {item.is_published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div
                        className={styles.actionBtnGroup}
                        style={{ justifyContent: "flex-end" }}
                      >
                        <button
                          className={styles.iconBtn}
                          onClick={() => openEditModal(item)}
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsModalOpen(false)}
        >
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h4 className={styles.modalTitle}>
                {editingItem ? "Edit FAQ" : "Create New FAQ"}
              </h4>
              <button
                className={styles.iconBtn}
                onClick={() => setIsModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                {errorMsg && (
                  <div
                    style={{
                      color: "#ef4444",
                      fontSize: 13,
                      background: "rgba(239, 68, 68, 0.1)",
                      padding: 10,
                      borderRadius: 8,
                    }}
                  >
                    {errorMsg}
                  </div>
                )}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 90px",
                    gap: 14,
                  }}
                >
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                      Target Page / Placement *
                    </label>
                    <select
                      value={targetPage}
                      onChange={(e) =>
                        setTargetPage(
                          e.target.value as NonNullable<
                            CmsFaqRow["target_page"]
                          >,
                        )
                      }
                      className={styles.selectInput}
                    >
                      <option value="all">
                        All Pages (Everywhere / Global)
                      </option>
                      <option value="homepage">Homepage</option>
                      <option value="schools">Schools Directory</option>
                      <option value="track_order">Track Order</option>
                      <option value="happy_pay">Happy Pay</option>
                      <option value="add_your_school">
                        Add Your School
                      </option>
                      <option value="partnership">Partnerships</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Category *</label>
                    <input
                      type="text"
                      required
                      list="faqCategoriesList"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Ordering"
                      className={styles.textInput}
                    />
                    <datalist id="faqCategoriesList">
                      <option value="General" />
                      <option value="Ordering" />
                      <option value="Delivery & Pickup" />
                      <option value="School Packs" />
                      <option value="Payments" />
                    </datalist>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Sort Order</label>
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={(e) =>
                        setSortOrder(parseInt(e.target.value, 10) || 0)
                      }
                      className={styles.textInput}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Question *</label>
                  <input
                    type="text"
                    required
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g. How do I order my child's official grade stationery pack?"
                    className={styles.textInput}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Answer *</label>
                  <textarea
                    required
                    rows={4}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Detailed explanation..."
                    className={styles.textareaInput}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Status</label>
                  <select
                    value={isPublished ? "published" : "draft"}
                    onChange={(e) =>
                      setIsPublished(e.target.value === "published")
                    }
                    className={styles.selectInput}
                  >
                    <option value="published">
                      Published (Visible on site)
                    </option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={isPending}
                >
                  {isPending
                    ? "Saving..."
                    : editingItem
                      ? "Update FAQ"
                      : "Create FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
