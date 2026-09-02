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

const FAQ_CATEGORIES = [
  "All",
  "General",
  "Ordering",
  "Delivery & Pickup",
  "School Packs",
  "Payments",
];

interface FaqsTabProps {
  initialFaqs: CmsFaqRow[];
}

export function FaqsTab({ initialFaqs }: FaqsTabProps) {
  const [items, setItems] = useState<CmsFaqRow[]>(initialFaqs);
  const [selectedPage, setSelectedPage] = useState<
    "All" | "Homepage" | "Schools"
  >("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingItem, setEditingItem] = useState<CmsFaqRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [targetPage, setTargetPage] = useState<"all" | "homepage" | "schools">(
    "all",
  );
  const [category, setCategory] = useState("General");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(true);

  const openCreateModal = () => {
    setEditingItem(null);
    setTargetPage(
      selectedPage === "Homepage"
        ? "homepage"
        : selectedPage === "Schools"
          ? "schools"
          : "all",
    );
    setCategory(selectedCategory !== "All" ? selectedCategory : "General");
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
    const matchCategory =
      selectedCategory === "All" ||
      it.category.toLowerCase() === selectedCategory.toLowerCase();
    const itemTarget = it.target_page || "all";
    const matchPage =
      selectedPage === "All" ||
      itemTarget === selectedPage.toLowerCase() ||
      itemTarget === "all";
    return matchCategory && matchPage;
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

      {/* Page Filter Pills */}
      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}
      >
        {[
          { id: "All", label: "All FAQs", count: items.length },
          {
            id: "Homepage",
            label: "Homepage FAQs",
            count: items.filter(
              (it) => it.target_page === "homepage" || it.target_page === "all",
            ).length,
          },
          {
            id: "Schools",
            label: "Schools Page FAQs",
            count: items.filter(
              (it) => it.target_page === "schools" || it.target_page === "all",
            ).length,
          },
        ].map((pt) => (
          <button
            key={pt.id}
            type="button"
            className={`${styles.tabButton} ${selectedPage === pt.id ? styles.tabButtonActive : ""}`}
            onClick={() =>
              setSelectedPage(pt.id as "All" | "Homepage" | "Schools")
            }
            style={{ padding: "6px 14px", fontSize: 13 }}
          >
            {pt.label} ({pt.count})
          </button>
        ))}
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {FAQ_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`${styles.tabButton} ${selectedCategory === cat ? styles.tabButtonActive : ""}`}
            onClick={() => setSelectedCategory(cat)}
            style={{ padding: "6px 14px", fontSize: 13 }}
          >
            {cat}
          </button>
        ))}
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
                    No FAQs in this category. Click New FAQ to create one!
                  </div>
                </td>
              </tr>
            ) : (
              filteredItems.map((item, idx) => {
                const isExpanded = expandedId === item.id;
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
                            background:
                              item.target_page === "homepage"
                                ? "rgba(56, 189, 248, 0.15)"
                                : item.target_page === "schools"
                                  ? "rgba(168, 85, 247, 0.15)"
                                  : "rgba(245, 158, 11, 0.15)",
                            color:
                              item.target_page === "homepage"
                                ? "#38bdf8"
                                : item.target_page === "schools"
                                  ? "#a855f7"
                                  : "#f59e0b",
                            fontWeight: 700,
                            fontSize: 11,
                            textTransform: "uppercase",
                          }}
                        >
                          {item.target_page === "homepage"
                            ? "Homepage"
                            : item.target_page === "schools"
                              ? "Schools Page"
                              : "All FAQs"}
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
                          e.target.value as "all" | "homepage" | "schools",
                        )
                      }
                      className={styles.selectInput}
                    >
                      <option value="all">All FAQs (Everywhere)</option>
                      <option value="homepage">Homepage FAQs</option>
                      <option value="schools">Schools Page FAQs</option>
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
