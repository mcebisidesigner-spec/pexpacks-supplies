import Link from "next/link";
import { requireAdmin } from "@/lib/admin/rbac";
import {
  FileSpreadsheet,
  Mail,
  Plus,
  ArrowRight,
  FileText,
} from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Documents | Admin | Pexpacks",
  description:
    "Unified Commercial Documents Engine: Official Letters, Proposals, and Quotations.",
};

export default async function AdminDocumentsHubPage() {
  await requireAdmin({ permission: "orders.view" });
  const supabase = createSupabaseAdminClient();

  // Quick stats
  const [lettersRes, quotesRes] = await Promise.all([
    supabase.from("admin_letters").select("id", { count: "exact", head: true }),
    supabase
      .from("quotations" as never)
      .select("id", { count: "exact", head: true }),
  ]);

  const totalLetters = lettersRes.count ?? 0;
  const totalQuotes = quotesRes.count ?? 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--a-border)] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--a-accent)]">
            <FileText size={14} />
            <span>Commercial Office</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--a-text)] mt-1">
            Commercial Documents Engine
          </h1>
          <p className="text-sm text-[var(--a-text-3)] mt-1">
            Author institutional correspondence, formal partnership proposals,
            and quotation-backed cover letters on official company letterhead.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/letters/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--a-accent)] text-black font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            <span>Draft Official Letter</span>
          </Link>
          <Link
            href="/admin/quotations/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--a-surface-2)] text-[var(--a-text)] border border-[var(--a-border)] font-medium text-sm hover:bg-[var(--a-surface)] transition-colors"
          >
            <Plus size={16} />
            <span>New Quotation</span>
          </Link>
        </div>
      </div>

      {/* Primary Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: Official Letters */}
        <div className="p-6 rounded-xl bg-[var(--a-surface)] border border-[var(--a-border)] flex flex-col justify-between hover:border-[var(--a-accent-subtle)] transition-all">
          <div>
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Mail size={24} />
            </div>
            <h2 className="text-lg font-bold text-[var(--a-text)]">
              Official Letters &amp; Proposals
            </h2>
            <p className="text-sm text-[var(--a-text-3)] mt-2 leading-relaxed">
              Draft formal institutional correspondence, partnership pitches,
              and quotation-backed cover letters with auto-flowing pagination
              and dual-mode recipient selection.
            </p>

            <div className="mt-6 flex items-center gap-4 text-xs text-[var(--a-text-3)]">
              <span className="font-semibold text-[var(--a-text)]">
                {totalLetters}
              </span>{" "}
              Letters registered
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--a-border)] flex items-center justify-between">
            <Link
              href="/admin/letters"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--a-accent)] hover:underline"
            >
              <span>View Letters Registry</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/admin/letters/new"
              className="text-xs px-3 py-1.5 rounded-md bg-[var(--a-surface-2)] text-[var(--a-text-2)] hover:text-white"
            >
              + Create New
            </Link>
          </div>
        </div>

        {/* Module 2: Quotations */}
        <div className="p-6 rounded-xl bg-[var(--a-surface)] border border-[var(--a-border)] flex flex-col justify-between hover:border-[var(--a-accent-subtle)] transition-all">
          <div>
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <FileSpreadsheet size={24} />
            </div>
            <h2 className="text-lg font-bold text-[var(--a-text)]">
              Commercial Quotations
            </h2>
            <p className="text-sm text-[var(--a-text-3)] mt-2 leading-relaxed">
              Build itemized stationery pricing schedules, calculate VAT and
              margins, and generate official Pexpacks quotations (`PX-QT-...`)
              for school principals and procurement boards.
            </p>

            <div className="mt-6 flex items-center gap-4 text-xs text-[var(--a-text-3)]">
              <span className="font-semibold text-[var(--a-text)]">
                {totalQuotes}
              </span>{" "}
              Quotations issued
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--a-border)] flex items-center justify-between">
            <Link
              href="/admin/quotations"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--a-accent)] hover:underline"
            >
              <span>View Quotations Registry</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/admin/quotations/new"
              className="text-xs px-3 py-1.5 rounded-md bg-[var(--a-surface-2)] text-[var(--a-text-2)] hover:text-white"
            >
              + Create New
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
