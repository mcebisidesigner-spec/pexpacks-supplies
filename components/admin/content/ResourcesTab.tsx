"use client";

import React, { useState, useTransition } from "react";
import { Plus, Trash2, Edit2, FileText, Download, Check, X, ExternalLink } from "lucide-react";
import type { CmsResourceRow } from "@/lib/admin/content";
import {
  saveCmsResourceAction,
  deleteCmsResourceAction,
  toggleCmsResourcePublicAction,
} from "@/app/admin/content/actions";
import styles from "./CmsContentManager.module.css";

interface ResourcesTabProps {
  initialResources: CmsResourceRow[];
}

export function ResourcesTab({ initialResources }: ResourcesTabProps) {
  const [items, setItems] = useState<CmsResourceRow[]>(initialResources);
  const [editingItem, setEditingItem] = useState<CmsResourceRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Parent Guides");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("PDF");
  const [fileSizeLabel, setFileSizeLabel] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isPublic, setIsPublic] = useState(true);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle("");
    setDescription("");
    setCategory("Parent Guides");
    setFileUrl("/assets/guides/2027-stationery-guide.pdf");
    setFileType("PDF");
    setFileSizeLabel("1.2 MB");
    setSortOrder(items.length + 1);
    setIsPublic(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: CmsResourceRow) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description || "");
    setCategory(item.category);
    setFileUrl(item.file_url);
    setFileType(item.file_type);
    setFileSizeLabel(item.file_size_label || "");
    setSortOrder(item.sort_order);
    setIsPublic(item.is_public);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleTogglePublic = (id: string, current: boolean) => {
    startTransition(async () => {
      const res = await toggleCmsResourcePublicAction(id, !current);
      if (res.ok) {
        setItems((prev) =>
          prev.map((it) => (it.id === id ? { ...it, is_public: !current } : it))
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    startTransition(async () => {
      const res = await deleteCmsResourceAction(id);
      if (res.ok) {
        setItems((prev) => prev.filter((it) => it.id !== id));
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("description", description);
    formData.set("category", category);
    formData.set("file_url", fileUrl);
    formData.set("file_type", fileType);
    formData.set("file_size_label", fileSizeLabel);
    formData.set("sort_order", String(sortOrder));
    formData.set("is_public", isPublic ? "true" : "false");

    startTransition(async () => {
      const res = await saveCmsResourceAction(editingItem ? editingItem.id : null, {}, formData);
      if (res.ok) {
        setIsModalOpen(false);
        if (editingItem) {
          setItems((prev) =>
            prev.map((it) =>
              it.id === editingItem.id
                ? {
                    ...it,
                    title,
                    description: description || null,
                    category,
                    file_url: fileUrl,
                    file_type: fileType,
                    file_size_label: fileSizeLabel || null,
                    sort_order: sortOrder,
                    is_public: isPublic,
                  }
                : it
            )
          );
        } else {
          setItems((prev) => [
            ...prev,
            {
              id: Math.random().toString(),
              title,
              description: description || null,
              category,
              file_url: fileUrl,
              file_type: fileType,
              file_size_label: fileSizeLabel || null,
              download_count: 0,
              sort_order: sortOrder,
              is_public: isPublic,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);
        }
      } else {
        setErrorMsg(res.message || "Failed to save resource.");
      }
    });
  };

  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <h3 className={styles.sectionTitle}>
            <FileText size={20} color="#10b981" />
            Resource Download Hub (Guides & Checklists)
          </h3>
          <p className={styles.sectionSubtitle}>
            Distribute downloadable PDF checklists, school partnership kits, and stationery guides.
          </p>
        </div>
        <button className={styles.primaryBtn} onClick={openCreateModal}>
          <Plus size={16} /> New Resource
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Document Title</th>
              <th>Category</th>
              <th>Format</th>
              <th>Downloads</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className={styles.emptyState}>No downloadable resources yet. Add your first guide!</div>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontWeight: 700, color: "#f8fafc" }}>{item.title}</span>
                      {item.description && (
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>{item.description}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles.badgeSlate}`}>{item.category}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className={`${styles.badge} ${styles.badgeEmerald}`}>{item.file_type}</span>
                      {item.file_size_label && (
                        <span style={{ fontSize: 11, color: "#64748b" }}>{item.file_size_label}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#94a3b8" }}>
                      <Download size={13} color="#10b981" /> {item.download_count}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`${styles.badge} ${item.is_public ? styles.badgeEmerald : styles.badgeSlate}`}
                      onClick={() => handleTogglePublic(item.id, item.is_public)}
                      style={{ cursor: "pointer" }}
                    >
                      {item.is_public ? <Check size={12} /> : <X size={12} />}
                      {item.is_public ? "Public" : "Draft"}
                    </button>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className={styles.actionBtnGroup} style={{ justifyContent: "flex-end" }}>
                      <a
                        href={item.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.iconBtn}
                        title="View File"
                      >
                        <ExternalLink size={14} />
                      </a>
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
              <h4 className={styles.modalTitle}>{editingItem ? "Edit Resource" : "Add New Resource"}</h4>
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
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Document Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 2027 Back-to-School Stationery Checklist"
                    className={styles.textInput}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Short Description (Optional)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Essential guide for parents preparing for the upcoming term."
                    className={styles.textInput}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Category *</label>
                    <input
                      type="text"
                      required
                      list="resourceCategoriesList"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Parent Guides"
                      className={styles.textInput}
                    />
                    <datalist id="resourceCategoriesList">
                      <option value="Parent Guides" />
                      <option value="School Partnership Kits" />
                      <option value="Stationery Checklists" />
                    </datalist>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>File Format</label>
                    <select
                      value={fileType}
                      onChange={(e) => setFileType(e.target.value)}
                      className={styles.selectInput}
                    >
                      <option value="PDF">PDF Document</option>
                      <option value="DOCX">Word Document (.docx)</option>
                      <option value="XLSX">Excel Sheet (.xlsx)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>File URL / Path *</label>
                    <input
                      type="text"
                      required
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      placeholder="/assets/guides/checklist.pdf"
                      className={styles.textInput}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Size Label</label>
                    <input
                      type="text"
                      value={fileSizeLabel}
                      onChange={(e) => setFileSizeLabel(e.target.value)}
                      placeholder="e.g. 1.4 MB"
                      className={styles.textInput}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Visibility</label>
                  <select
                    value={isPublic ? "public" : "draft"}
                    onChange={(e) => setIsPublic(e.target.value === "public")}
                    className={styles.selectInput}
                  >
                    <option value="public">Public (Downloadable on storefront)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn} disabled={isPending}>
                  {isPending ? "Saving..." : editingItem ? "Update Resource" : "Create Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
