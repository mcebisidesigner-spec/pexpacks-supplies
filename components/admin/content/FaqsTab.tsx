"use client";

import React, { useState, useTransition } from "react";
import { Plus, Trash2, Edit2, HelpCircle, Check, X, ChevronDown, ChevronUp } from "lucide-react";
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
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingItem, setEditingItem] = useState<CmsFaqRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [category, setCategory] = useState("General");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(true);

  const openCreateModal = () => {
    setEditingItem(null);
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
          prev.map((it) => (it.id === id ? { ...it, is_published: !current } : it))
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
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
    formData.set("category", category);
    formData.set("question", question);
    formData.set("answer", answer);
    formData.set("sort_order", String(sortOrder));
    formData.set("is_published", isPublished ? "true" : "false");

    startTransition(async () => {
      const res = await saveCmsFaqAction(editingItem ? editingItem.id : null, {}, formData);
      if (res.ok) {
        setIsModalOpen(false);
        if (editingItem) {
          setItems((prev) =>
            prev.map((it) =>
              it.id === editingItem.id
                ? {
                    ...it,
                    category,
                    question,
                    answer,
                    sort_order: sortOrder,
                    is_published: isPublished,
                  }
                : it
            )
          );
        } else {
          setItems((prev) => [
            ...prev,
            {
              id: Math.random().toString(),
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

  const filteredItems = selectedCategory === "All"
    ? items
    : items.filter((it) => it.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <h3 className={styles.sectionTitle}>
            <HelpCircle size={20} color="#10b981" />
            Frequently Asked Questions (Storefront FAQs)
          </h3>
          <p className={styles.sectionSubtitle}>
            Clarify ordering instructions, delivery windows, payment methods, and Pexcover details.
          </p>
        </div>
        <button className={styles.primaryBtn} onClick={openCreateModal}>
          <Plus size={16} /> New FAQ
        </button>
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
              <th>Category</th>
              <th>Question & Answer Preview</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className={styles.emptyState}>No FAQs in this category. Click New FAQ to create one!</div>
                </td>
              </tr>
            ) : (
              filteredItems.map((item, idx) => {
                const isExpanded = expandedId === item.id;
                return (
                  <tr key={item.id}>
                    <td style={{ color: "#64748b", fontWeight: 600 }}>{item.sort_order || idx + 1}</td>
                    <td>
                      <span className={`${styles.badge} ${styles.badgeBlue}`}>{item.category}</span>
                    </td>
                    <td>
                      <div
                        style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: 4 }}
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      >
                        <span style={{ fontWeight: 600, color: "#f8fafc", display: "flex", alignItems: "center", gap: 6 }}>
                          {item.question}
                          {isExpanded ? <ChevronUp size={14} color="#10b981" /> : <ChevronDown size={14} color="#64748b" />}
                        </span>
                        {isExpanded ? (
                          <p style={{ margin: "6px 0 0", color: "#94a3b8", lineHeight: 1.5, fontSize: 13 }}>
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
                        onClick={() => handleTogglePublished(item.id, item.is_published)}
                        style={{ cursor: "pointer" }}
                      >
                        {item.is_published ? <Check size={12} /> : <X size={12} />}
                        {item.is_published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className={styles.actionBtnGroup} style={{ justifyContent: "flex-end" }}>
                        <button className={styles.iconBtn} onClick={() => openEditModal(item)} title="Edit">
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
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h4 className={styles.modalTitle}>{editingItem ? "Edit FAQ" : "Create New FAQ"}</h4>
              <button className={styles.iconBtn} onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                {errorMsg && (
                  <div style={{ color: "#ef4444", fontSize: 13, background: "rgba(239, 68, 68, 0.1)", padding: 10, borderRadius: 8 }}>
                    {errorMsg}
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
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
                      onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
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
                    onChange={(e) => setIsPublished(e.target.value === "published")}
                    className={styles.selectInput}
                  >
                    <option value="published">Published (Visible on site)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn} disabled={isPending}>
                  {isPending ? "Saving..." : editingItem ? "Update FAQ" : "Create FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
