"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Eye, MapPin, User, X } from "lucide-react";
import styles from "./SchoolOverview.module.css";
import adminStyles from "@/app/admin/admin.module.css";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { formatDate, money } from "@/lib/admin/ui-utils";
import type { SchoolRow } from "@/lib/admin/schools";

interface SchoolOverviewModalProps {
  school: SchoolRow | null;
  onClose: () => void;
}

function formatGrades(grades: SchoolRow["grades"]): string {
  if (Array.isArray(grades)) return grades.join(", ");
  if (grades) return String(grades);
  return "—";
}

function formatSku(school: SchoolRow): string {
  return `SCH-${school.slug ? school.slug.slice(0, 10).toUpperCase() : school.id.slice(0, 8).toUpperCase()}`;
}

export function SchoolOverviewModal({
  school,
  onClose,
}: SchoolOverviewModalProps) {
  useEffect(() => {
    if (!school) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [school, onClose]);

  if (!school) return null;

  const isPartner = school.is_partner === true;
  const isOnline = school.published !== false;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="school-overview-title"
      onClick={onClose}
    >
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <Eye size={18} aria-hidden="true" />
          </div>
          <div className={styles.titleBlock}>
            <h2 id="school-overview-title" className={styles.title}>
              {school.name}
            </h2>
            <p className={styles.subtitle}>
              <MapPin size={12} aria-hidden="true" />
              {school.city || "City"} &bull; {school.province || "Province"}
            </p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close overview"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.chipRow}>
          <StatusBadge
            status={isPartner ? "Partner" : "Non-partner"}
            tone={isPartner ? "emerald" : "slate"}
            showDot
          />
          <StatusBadge
            status={isOnline ? "Active" : "Inactive"}
            tone={isOnline ? "emerald" : "slate"}
            showDot
          />
          {school.is_featured && (
            <StatusBadge status="Featured" tone="amber" showDot />
          )}
        </div>

        <div className={styles.body}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <span className={adminStyles.sidebarHeaderTitle}>
                <Building2 size={14} className={adminStyles.iconTeal} />
                Record Overview
              </span>
            </div>
            <div className={adminStyles["grid-2equal"]}>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>SKU</span>
                <span className={adminStyles.sidebarStatVal}>
                  {formatSku(school)}
                </span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>District</span>
                <span className={adminStyles.sidebarStatVal}>
                  {school.district || "—"}
                </span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Grades</span>
                <span className={adminStyles.sidebarStatVal}>
                  {formatGrades(school.grades)}
                </span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>
                  Partner since
                </span>
                <span className={adminStyles.sidebarStatVal}>
                  {formatDate(school.partner_since)}
                </span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Principal</span>
                <span className={adminStyles.sidebarStatVal}>
                  {school.principal || "—"}
                </span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>
                  Lowest price
                </span>
                <span className={adminStyles.sidebarStatVal}>
                  {school.lowest_price != null
                    ? money(school.lowest_price)
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <span className={adminStyles.sidebarHeaderTitle}>
                <User size={14} className={adminStyles.iconTeal} />
                Contact &amp; Collection
              </span>
            </div>
            <div className={adminStyles["grid-2equal"]}>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Address</span>
                <span className={adminStyles.sidebarStatVal}>
                  {school.address || "—"}
                </span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>
                  Parent collection
                </span>
                <span className={adminStyles.sidebarStatVal}>
                  {school.parent_collection_accepted
                    ? "Accepted"
                    : "Direct delivery"}
                </span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Email</span>
                <span className={adminStyles.sidebarStatVal}>
                  {school.email || "—"}
                </span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Telephone</span>
                <span className={adminStyles.sidebarStatVal}>
                  {school.telephone || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <Link
            href={`/admin/schools/${school.slug || school.id}`}
            className={styles.fullLink}
            onClick={onClose}
          >
            Manage full record <ArrowRight size={13} aria-hidden="true" />
          </Link>
          <button
            type="button"
            className={styles.closeAction}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
