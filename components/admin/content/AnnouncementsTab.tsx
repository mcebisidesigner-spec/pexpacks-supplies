"use client";

import React, { useState, useTransition } from "react";
import { Plus, Trash2, Edit2, Megaphone, ExternalLink, Check, X } from "lucide-react";
import type { CmsAnnouncementRow } from "@/lib/admin/content";
import {
  saveCmsAnnouncementAction,
  deleteCmsAnnouncementAction,
  toggleCmsAnnouncementActiveAction,
} from "@/app/admin/content/actions";
import styles from "./CmsContentManager.module.css";

interface AnnouncementsTabProps {
  initialAnnouncements: CmsAnnouncementRow[];
}

export function AnnouncementsTab({ initialAnnouncements }: AnnouncementsTabProps) {
  const [items, setItems] = useState<CmsAnnouncementRow[]>(initialAnnouncements);
  const [editingItem, setEditingItem] = useState<CmsAnnouncementRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [badgeText, setBadgeText] = useState("");
  const [message, setMessage] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [displayLocation, setDisplayLocation] = useState<"global_top" | "hero_banner" | "schools_page">("global_top");
  const [isActive, setIsActive] = useState(true);

  const openCreateModal = () => {
    setEditingItem(null);
    setBadgeText("Back-to-School 2027");
    setMessage("Pre-orders open! Save up to 15% on grade packs.");
    setLinkUrl("/schools");
    setLinkLabel("Find Your School");
    setDisplayLocation("global_top");
    setIsActive(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: CmsAnnouncementRow) => {
    setEditingItem(item);
    setBadgeText(item.badge_text);
    setMessage(item.message);
    setLinkUrl(item.link_url || "");
    setLinkLabel(item.link_label || "");
    setDisplayLocation(item.display_location);
    setIsActive(item.is_active);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleToggleActive = (id: string, current: boolean) => {
    startTransition(async () => {
      const res = await toggleCmsAnnouncementActiveAction(id, !current);
      if (res.ok) {
        setItems((prev) =>
          prev.map((it) => (it.id === id ? { ...it, is_active: !current } : it))
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    startTransition(async () => {
      const res = await deleteCmsAnnouncementAction(id);
      if (res.ok) {
        setItems((prev) => prev.filter((it) => it.id !== id));
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData();
    formData.set("badge_text", badgeText);
    formData.set("message", message);
    formData.set("link_url", linkUrl);
    formData.set("link_label", linkLabel);
    formData.set("display_location", displayLocation);
    formData.set("is_active", isActive ? "true" : "false");

    startTransition(async () => {
      const res = await saveCmsAnnouncementAction(editingItem ? editingItem.id : null, {}, formData);
      if (res.ok) {
        setIsModalOpen(false);
        // Refresh local state
        if (editingItem) {
          setItems((prev) =>
            prev.map((it) =>
              it.id === editingItem.id
                ? {
                    ...it,
                    badge_text: badgeText,
                    message,
                    link_url: linkUrl || null,
                    link_label: linkLabel || null,
                    display_location: displayLocation,
                    is_active: isActive,
                  }
                : it
            )
          );
        } else {
          setItems((prev) => [
            {
              id: Math.random().toString(),
              badge_text: badgeText,
              message,
              link_url: linkUrl || null,
              link_label: linkLabel || null,
              display_location: displayLocation,
              is_active: isActive,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            ...prev,
          ]);
        }
      } else {
        setErrorMsg(res.message || "Failed to save announcement.");
      }
    });
  };

  const activeBanner = items.find((it) => it.is_active && it.display_location === "global_top");

  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <h3 className={styles.sectionTitle}>
            <Megaphone size={20} color="#10b981" />
            Top Eyebrow Banners & Announcements
          </h3>
          <p className={styles.sectionSubtitle}>
            Broadcast promotional alerts, pre-order timelines, and notices across the storefront.
          </p>
        </div>
        <button className={styles.primaryBtn} onClick={openCreateModal}>
          <Plus size={16} /> New Announcement
        </button>
      </div>

      {activeBanner && (
        <div className={styles.previewBannerBox}>
          <span className={styles.previewBannerLabel}>Live Storefront Preview (Global Top)</span>
          <div className={styles.bannerMock}>
            <span className={`${styles.badge} ${styles.badgeEmerald}`}>{activeBanner.badge_text}</span>
            <span>{activeBanner.message}</span>
            {activeBanner.link_label && (
              <span style={{ color: "#10b981", fontWeight: 700, textDecoration: "underline" }}>
                {activeBanner.link_label} →
              </span>
            )}
          </div>
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Badge</th>
              <th>Message</th>
              <th>Display Slot</th>
              <th>Action Link</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className={styles.emptyState}>No announcements found. Create one above!</div>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className={`${styles.badge} ${styles.badgeEmerald}`}>{item.badge_text}</span>
                  </td>
                  <td style={{ maxWidth: 320, fontWeight: 500 }}>{item.message}</td>
                  <td>
                    <span className={`${styles.badge} ${styles.badgeSlate}`}>{item.display_location}</span>
                  </td>
                  <td>
                    {item.link_url ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#60a5fa" }}>
                        {item.link_label || "Link"} <ExternalLink size={12} />
                      </span>
                    ) : (
                      <span style={{ color: "#64748b" }}>None</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`${styles.badge} ${item.is_active ? styles.badgeEmerald : styles.badgeSlate}`}
                      onClick={() => handleToggleActive(item.id, item.is_active)}
                      style={{ cursor: "pointer" }}
                    >
                      {item.is_active ? <Check size={12} /> : <X size={12} />}
                      {item.is_active ? "Active" : "Inactive"}
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
                {editingItem ? "Edit Announcement" : "Create New Announcement"}
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
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Badge Tag Text *</label>
                  <input
                    type="text"
                    required
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="e.g. Pre-Orders Open"
                    className={styles.textInput}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Announcement Message *</label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. Save up to 15% on 2027 Grade Stationery Packs until Sept 30"
                    className={styles.textareaInput}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Link URL (Optional)</label>
                    <input
                      type="text"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="e.g. /schools"
                      className={styles.textInput}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Link Label (Optional)</label>
                    <input
                      type="text"
                      value={linkLabel}
                      onChange={(e) => setLinkLabel(e.target.value)}
                      placeholder="e.g. Find Your School"
                      className={styles.textInput}
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Display Slot</label>
                    <select
                      value={displayLocation}
                      onChange={(e) => setDisplayLocation(e.target.value as "global_top" | "hero_banner" | "schools_page")}
                      className={styles.selectInput}
                    >
                      <option value="global_top">Global Top Header</option>
                      <option value="hero_banner">Homepage Hero Banner</option>
                      <option value="schools_page">Schools Directory Page</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Status</label>
                    <select
                      value={isActive ? "active" : "inactive"}
                      onChange={(e) => setIsActive(e.target.value === "active")}
                      className={styles.selectInput}
                    >
                      <option value="active">Active (Visible)</option>
                      <option value="inactive">Inactive (Hidden)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn} disabled={isPending}>
                  {isPending ? "Saving..." : editingItem ? "Update Announcement" : "Create Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
