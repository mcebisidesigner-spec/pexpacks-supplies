import React from "react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { AdminInfoPanel } from "@/components/admin/ui/AdminInfoPanel";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { OrderStatusBadge } from "@/components/admin/orders/OrderStatusBadge";
import { DbNotice } from "@/components/admin/ui/DbNotice";
import { CheckCircle2, AlertTriangle, ShieldCheck, ShoppingCart } from "lucide-react";

export const metadata: Metadata = {
  title: "Design System Visual Baseline Preview | Pexpacks",
  description: "Deterministic visual regression test harness for Pexpacks design system primitives and admin components.",
  robots: { index: false, follow: false },
};

export default function DesignSystemPreviewPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 space-y-12 font-sans selection:bg-teal-500 selection:text-slate-950">
      <header className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-950 text-teal-300 border border-teal-800 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          Deterministic Visual Baseline Harness
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Pexpacks Design System Primitives
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
          Standardized visual regression targets. All states, variants, and tones are fixed and isolated from dynamic database or runtime noise.
        </p>
      </header>

      {/* 1. BUTTONS */}
      <section
        id="visual-buttons"
        data-testid="visual-buttons"
        className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6"
      >
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Buttons & Action Primitives
          </h2>
          <p className="text-xs text-slate-400">Storefront and Admin variant matrix</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Storefront Buttons (Light Canvas Context)</h3>
          <div className="p-4 rounded-xl bg-slate-100 flex flex-wrap items-center gap-3">
            <Button variant="primary" size="sm">Primary SM</Button>
            <Button variant="primary" size="md">Primary MD</Button>
            <Button variant="primary" size="lg">Primary LG</Button>
            <Button variant="secondary" size="md">Secondary</Button>
            <Button variant="navy" size="md">Navy Action</Button>
            <Button variant="outline" size="md">Outline</Button>
            <Button variant="white" size="md">White Surface</Button>
            <Button variant="tertiary" size="md">Tertiary Link</Button>
            <Button variant="primary" size="md" disabled>Disabled</Button>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Admin Buttons</h3>
          <div className="flex flex-wrap items-center gap-3">
            <AdminButton variant="primary" size="sm">Admin Primary</AdminButton>
            <AdminButton variant="primary" size="md">Primary MD</AdminButton>
            <AdminButton variant="secondary" size="md">Secondary</AdminButton>
            <AdminButton variant="outline" size="md">Outline</AdminButton>
            <AdminButton variant="teal" size="md">Teal Tone</AdminButton>
            <AdminButton variant="danger" size="md">Danger Tone</AdminButton>
            <AdminButton variant="ghost" size="md">Ghost Action</AdminButton>
            <AdminButton variant="primary" size="md" disabled>Admin Disabled</AdminButton>
          </div>
        </div>
      </section>

      {/* 2. BADGES & STATUS INDICATORS */}
      <section
        id="visual-badges"
        data-testid="visual-badges"
        className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6"
      >
        <div>
          <h2 className="text-xl font-bold text-white">Badges & Status Indicators</h2>
          <p className="text-xs text-slate-400">shadcn/ui badges, CVA status badges, and order workflow states</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">shadcn/ui Canonical Badges</h3>
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="default">Default Badge</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="muted">Muted</Badge>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">CVA StatusBadges (Tones & States)</h3>
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge status="active" label="Active" showDot />
            <StatusBadge status="draft" label="Draft" showDot />
            <StatusBadge status="archived" label="Archived" showDot />
            <StatusBadge status="published" label="Published" showDot />
            <StatusBadge status="in_stock" label="In Stock" showDot />
            <StatusBadge status="low_stock" label="Low Stock" showDot />
            <StatusBadge status="out_of_stock" label="Out of Stock" showDot />
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Order Lifecycle Badges</h3>
          <div className="flex flex-wrap items-center gap-2.5">
            <OrderStatusBadge status="draft" />
            <OrderStatusBadge status="submitted" />
            <OrderStatusBadge status="processing" />
            <OrderStatusBadge status="packed" />
            <OrderStatusBadge status="delivered" />
            <OrderStatusBadge status="cancelled" />
          </div>
        </div>
      </section>

      {/* 3. CARDS & PANELS */}
      <section
        id="visual-cards"
        data-testid="visual-cards"
        className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6"
      >
        <div>
          <h2 className="text-xl font-bold text-white">Cards, Panels & Notices</h2>
          <p className="text-xs text-slate-400">Structural content framing primitives with semantic tones</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminCard variant="default">
            <h4 className="text-sm font-semibold text-white">Default Admin Card</h4>
            <p className="text-xs text-slate-400 mt-1">Standard elevated surface with subtle border.</p>
          </AdminCard>
          <AdminCard variant="surface">
            <h4 className="text-sm font-semibold text-white">Surface Inner Card</h4>
            <p className="text-xs text-slate-400 mt-1">Nested surface container with muted border.</p>
          </AdminCard>
          <AdminCard variant="interactive">
            <h4 className="text-sm font-semibold text-white">Interactive Card</h4>
            <p className="text-xs text-slate-400 mt-1">Hoverable card target with transition states.</p>
          </AdminCard>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Admin Info Panels</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AdminInfoPanel tone="info" title="System Information">
              Routine background sync completed with zero warnings.
            </AdminInfoPanel>
            <AdminInfoPanel tone="warning" title="Attention Required">
              Catalog synchronization contains 3 items requiring review.
            </AdminInfoPanel>
            <AdminInfoPanel tone="success" title="Verification Passed">
              All runtime validation contracts verified successfully.
            </AdminInfoPanel>
            <AdminInfoPanel tone="danger" title="Discrepancy Detected">
              Ledger discrepancy detected on sandbox mock invoice.
            </AdminInfoPanel>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Database Notices</h3>
          <div className="space-y-2">
            <DbNotice type="success" message="Database schema migration applied with zero downtime." />
            <DbNotice type="warning" message="Distributed Redis memory usage reached 42% threshold." />
            <DbNotice type="error" message="Remote endpoint handshake timeout after 5000ms." />
          </div>
        </div>
      </section>

      {/* 4. FORM INPUTS & FIELD CONTROLS */}
      <section
        id="visual-inputs"
        data-testid="visual-inputs"
        className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6"
      >
        <div>
          <h2 className="text-xl font-bold text-white">Forms & Controls</h2>
          <p className="text-xs text-slate-400">Standard input fields, helper captions, and validation states</p>
        </div>

        <div className="p-6 rounded-xl bg-white text-slate-900 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="School Name"
              placeholder="e.g. Dawnview High School"
              helper="Enter registered school name"
              defaultValue=""
            />
            <Input
              label="Verified Grade Pack"
              placeholder="e.g. Grade 10 Stationery Pack"
              defaultValue="Grade 10 General Stationery"
              showValid
            />
            <Input
              label="Supplier Email"
              placeholder="orders@supplier.co.za"
              error="Please enter a valid business email address"
              defaultValue="invalid-email-format"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            <Textarea
              label="Packing Instructions"
              placeholder="Specific packaging or handling details..."
              helper="Include learner name or grade section notes"
              rows={3}
              defaultValue="Pack labelled in heavy-duty waterproof sleeve."
            />
            <Select
              label="Delivery Region"
              placeholder="Choose province"
              defaultValue="gauteng"
              options={[
                { value: "gauteng", label: "Gauteng (Standard Delivery)" },
                { value: "western-cape", label: "Western Cape" },
                { value: "kwazulu-natal", label: "KwaZulu-Natal" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* 5. FEEDBACK & SKELETONS */}
      <section
        id="visual-skeletons"
        data-testid="visual-skeletons"
        className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6"
      >
        <div>
          <h2 className="text-xl font-bold text-white">Loading & Skeleton Primitives</h2>
          <p className="text-xs text-slate-400">Placeholder surfaces used during data hydration</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4 max-w-md">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-20 w-full rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>
      </section>
    </main>
  );
}
