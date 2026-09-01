"use client";

import React, { useState, useTransition } from "react";
import { Plus, Trash2, Edit2, Star, Check, X, MessageSquareQuote } from "lucide-react";
import type { CmsTestimonialRow } from "@/lib/admin/content";
import {
  saveCmsTestimonialAction,
  deleteCmsTestimonialAction,
  toggleCmsTestimonialFeaturedAction,
} from "@/app/admin/content/actions";
import styles from "./CmsContentManager.module.css";

interface TestimonialsTabProps {
  initialTestimonials: CmsTestimonialRow[];
}

export function TestimonialsTab({ initialTestimonials }: TestimonialsTabProps) {
  const [items, setItems] = useState<CmsTestimonialRow[]>(initialTestimonials);
  const [editingItem, setEditingItem] = useState<CmsTestimonialRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  const openCreateModal = () => {
    setEditingItem(null);
    setAuthorName("");
    setAuthorRole("Parent at Primrose Hill Primary");
    setQuote("");
    setRating(5);
    setAvatarUrl("");
    setIsFeatured(true);
    setSortOrder(items.length + 1);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: CmsTestimonialRow) => {
    setEditingItem(item);
    setAuthorName(item.author_name);
    setAuthorRole(item.author_role);
    setQuote(item.quote);
    setRating(item.rating);
    setAvatarUrl(item.avatar_url || "");
    setIsFeatured(item.is_featured);
    setSortOrder(item.sort_order);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleToggleFeatured = (id: string, current: boolean) => {
    startTransition(async () => {
      const res = await toggleCmsTestimonialFeaturedAction(id, !current);
      if (res.ok) {
        setItems((prev) =>
          prev.map((it) => (it.id === id ? { ...it, is_featured: !current } : it))
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    startTransition(async () => {
      const res = await deleteCmsTestimonialAction(id);
      if (res.ok) {
        setItems((prev) => prev.filter((it) => it.id !== id));
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData();
    formData.set("author_name", authorName);
    formData.set("author_role", authorRole);
    formData.set("quote", quote);
    formData.set("rating", String(rating));
    formData.set("avatar_url", avatarUrl);
    formData.set("sort_order", String(sortOrder));
    formData.set("is_featured", isFeatured ? "true" : "false");

    startTransition(async () => {
      const res = await saveCmsTestimonialAction(editingItem ? editingItem.id : null, {}, formData);
      if (res.ok) {
        setIsModalOpen(false);
        if (editingItem) {
          setItems((prev) =>
            prev.map((it) =>
              it.id === editingItem.id
                ? {
                    ...it,
                    author_name: authorName,
                    author_role: authorRole,
                    quote,
                    rating,
                    avatar_url: avatarUrl || null,
                    sort_order: sortOrder,
                    is_featured: isFeatured,
                  }
                : it
            )
          );
        } else {
          setItems((prev) => [
            ...prev,
            {
              id: Math.random().toString(),
              author_name: authorName,
              author_role: authorRole,
              quote,
              rating,
              avatar_url: avatarUrl || null,
              school_id: null,
              sort_order: sortOrder,
              is_featured: isFeatured,
              created_at: new Date().toISOString(),
            },
          ]);
        }
      } else {
        setErrorMsg(res.message || "Failed to save testimonial.");
      }
    });
  };

  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <h3 className={styles.sectionTitle}>
            <MessageSquareQuote size={20} color="#10b981" />
            Parent & School Testimonials (Social Proof)
          </h3>
          <p className={styles.sectionSubtitle}>
            Highlight positive feedback from parents, teachers, and school governing bodies.
          </p>
        </div>
        <button className={styles.primaryBtn} onClick={openCreateModal}>
          <Plus size={16} /> New Testimonial
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Author</th>
              <th>Role & Affiliation</th>
              <th>Rating</th>
              <th>Quote</th>
              <th>Social Proof</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className={styles.emptyState}>No testimonials found. Click New Testimonial to add one!</div>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 700, color: "#f8fafc" }}>{item.author_name}</td>
                  <td>
                    <span className={`${styles.badge} ${styles.badgeSlate}`}>{item.author_role}</span>
                  </td>
                  <td>
                    <div className={styles.stars}>
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                  </td>
                  <td style={{ maxWidth: 320, color: "#94a3b8", fontStyle: "italic" }}>
                    &ldquo;{item.quote.slice(0, 110)}&hellip;&rdquo;
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`${styles.badge} ${item.is_featured ? styles.badgeEmerald : styles.badgeSlate}`}
                      onClick={() => handleToggleFeatured(item.id, item.is_featured)}
                      style={{ cursor: "pointer" }}
                    >
                      {item.is_featured ? <Check size={12} /> : <X size={12} />}
                      {item.is_featured ? "Featured Marquee" : "Archived"}
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h4 className={styles.modalTitle}>
                {editingItem ? "Edit Testimonial" : "Create New Testimonial"}
              </h4>
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Author Name *</label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className={styles.textInput}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Role & Affiliation *</label>
                    <input
                      type="text"
                      required
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value)}
                      placeholder="e.g. Parent at Primrose Hill Primary"
                      className={styles.textInput}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Star Rating (1–5)</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(parseInt(e.target.value, 10) || 5)}
                      className={styles.selectInput}
                    >
                      <option value="5">★★★★★ (5 Stars)</option>
                      <option value="4">★★★★☆ (4 Stars)</option>
                      <option value="3">★★★☆☆ (3 Stars)</option>
                      <option value="2">★★☆☆☆ (2 Stars)</option>
                      <option value="1">★☆☆☆☆ (1 Star)</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Display Status</label>
                    <select
                      value={isFeatured ? "featured" : "archived"}
                      onChange={(e) => setIsFeatured(e.target.value === "featured")}
                      className={styles.selectInput}
                    >
                      <option value="featured">Featured in Marquee</option>
                      <option value="archived">Archived / Hidden</option>
                    </select>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Quote / Feedback *</label>
                  <textarea
                    required
                    rows={4}
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    placeholder="Saved me days of running around stationery shops..."
                    className={styles.textareaInput}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Avatar Image URL (Optional)</label>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className={styles.textInput}
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn} disabled={isPending}>
                  {isPending ? "Saving..." : editingItem ? "Update Testimonial" : "Create Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
