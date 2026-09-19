"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Eye, MapPin, User, X } from "lucide-react";
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
      className="fixed inset-0 z-[950] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="school-overview-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[88vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 p-4 border-b border-slate-800">
          <div className="flex-none w-8.5 h-8.5 flex items-center justify-center rounded-lg bg-emerald-500/12 text-emerald-400">
            <Eye size={18} aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="school-overview-title" className="text-base font-bold text-slate-100 leading-tight truncate">
              {school.name}
            </h2>
            <p className="flex items-center gap-1 text-xs text-slate-400 mt-1">
              <MapPin size={12} aria-hidden="true" />
              {school.city || "City"} &bull; {school.province || "Province"}
            </p>
          </div>
          <button
            type="button"
            className="flex-none flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer border-0 bg-transparent transition-colors"
            onClick={onClose}
            aria-label="Close overview"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-950/50 border-b border-slate-800/80">
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

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 border-b border-slate-800/60 pb-2">
              <Building2 size={14} className="text-emerald-400" />
              Record Overview
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-400 font-medium">SKU</span>
                <span className="text-xs font-semibold text-slate-100 truncate">
                  {formatSku(school)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-400 font-medium">District</span>
                <span className="text-xs font-semibold text-slate-100 truncate">
                  {school.district || "—"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-400 font-medium">Grades</span>
                <span className="text-xs font-semibold text-slate-100 truncate">
                  {formatGrades(school.grades)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-400 font-medium">Partner since</span>
                <span className="text-xs font-semibold text-slate-100 truncate">
                  {formatDate(school.partner_since)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-400 font-medium">Principal</span>
                <span className="text-xs font-semibold text-slate-100 truncate">
                  {school.principal || "—"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-400 font-medium">Lowest price</span>
                <span className="text-xs font-semibold text-slate-100 truncate">
                  {school.lowest_price != null ? money(school.lowest_price) : "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 border-b border-slate-800/60 pb-2">
              <User size={14} className="text-emerald-400" />
              Contact &amp; Collection
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-400 font-medium">Address</span>
                <span className="text-xs font-semibold text-slate-100 truncate">
                  {school.address || "—"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-400 font-medium">Parent collection</span>
                <span className="text-xs font-semibold text-slate-100 truncate">
                  {school.parent_collection_accepted
                    ? "Accepted"
                    : "Direct delivery"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-400 font-medium">Email</span>
                <span className="text-xs font-semibold text-slate-100 truncate">
                  {school.email || "—"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-400 font-medium">Telephone</span>
                <span className="text-xs font-semibold text-slate-100 truncate">
                  {school.telephone || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3.5 px-4 bg-slate-950 border-t border-slate-800">
          <Link
            href={`/admin/schools/${school.slug || school.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 no-underline transition-colors"
            onClick={onClose}
          >
            Manage full record <ArrowRight size={13} aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer border-0 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
