# POST-TAILWIND ADMIN & PLATFORM MODERNISATION AUDIT
**Document:** `POST_TAILWIND_ADMIN_PLATFORM_AUDIT.md`  
**Execution Date:** September 2026  
**Auditor:** Principal Full-Stack Architect & Admin UX / Supabase Systems Specialist  
**Status:** Complete — Baseline Established  

---

## 1. Executive Summary & Precondition Verification

### Precondition Assessment
The Pexpacks application has undergone a structured migration to **Tailwind CSS v4** with a semantic design token system, `shadcn/ui` primitives, and Pexpacks-specific domain components.
* **Customer-Facing Foundation:** 100% of customer routes (`/`, `/schools`, `/schools/[schoolSlug]`, `/order`, `/cart/review`, `/checkout`, `/checkout/happypay`, `/blog`, `/contact`, `/terms`, etc.) have been migrated to Tailwind CSS v4.
* **Admin Primitives:** Batch 5.1 (Admin UI primitives: `AdminButton`, `AdminCard`, `AdminInput`, `AdminSelect`, `AdminDropdown`, `AdminDialog`, `AdminPageHeader`, `StatusBadge`, `QuickMetricsGrid`, `StickyFormBar`, `DbTooltip`, `PhysicalEyeToggle`, `WarningBannerModal`, `AdminDesignSystem`) and Batch 5.2 (`AdminShell`, `DataTable`, `DataTablePagination`, `DataTableToolbar`) have established the base admin primitives.
* **Build & Tests:** TypeScript (`tsc --noEmit`) passes cleanly with zero errors. 65 of 66 vitest suites pass (303 tests passing). Next.js 16.3.5 webpack build and dev server are stable.

### Tailwind Migration Gate Classification
```text
Classification: C / B (Substantially Complete Customer-Facing; Admin Modernisation In-Progress)
```
* **Customer-facing application:** Complete and verified (zero customer-facing `.module.css` files remain).
* **Admin platform:** Primitives and core shell migrated; isolated legacy CSS modules remain in secondary admin views (quotations, letters, CMS, blog, settings, assets, tasks, audit).
* **Gate Decision:** Cleared for Phase A audit and structured admin modernisation.

---

## 2. Admin Route Inventory & Information Architecture Matrix

The Pexpacks `/admin` platform comprises **22 distinct functional routes** across 7 primary operational pillars.

| Route | Functional Domain | Primary Data Source | Capabilities (CRUD) | Current Layout / View Pattern | Legacy CSS Remaining | Business Risk Level | Recommended Migration Order |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/admin` | Dashboard & Health | `dashboard_summaries`, RPC `get_dashboard_aggregates` | Read summaries, trigger recalculations | `AdminShell` + `DashboardClient` + `DashboardWidgets` | None (`DashboardClient.module.css` retired) | Low | 1 |
| `/admin/products` | Master Catalogue | `master_products`, `suppliers`, `brands` | Full CRUD, variant generation, SKU linking | `MasterProductsPageView` + `TanStackProductsTable` | `TanStackProductsTable.module.css` (temporary) | High | 2 (Reference) |
| `/admin/products/add-product` | Catalogue Ingestion | `master_products`, `suppliers` | Create product, auto-assign SKU | `ProductEditForm` | None (Tailwind migrated) | High | 3 |
| `/admin/products/[productId]` | Product Detail & Edit | `master_products`, `supplier_product_costs` | Update pricing, brand, supplier link | `ProductEditForm` + `ItemForm` | None (Tailwind migrated) | High | 4 |
| `/admin/items` | Pack Items Catalogue | `pack_items`, `master_products` | Search, filter, pack-item linking | Legacy item catalogue view | None | Medium | 5 |
| `/admin/packs` | School Stationery Packs | `school_packs`, `pack_items`, `schools` | Full CRUD, clone pack, bulk items | `PacksPageView` + `SchoolPacksView` | `packs.module.css` | High | 6 |
| `/admin/packs/builder` | Pack Builder Studio | `school_packs`, `pack_items`, `master_products` | Dynamic tray composition, item add/remove | `SchoolPackCreateForm` + `ItemsManager` | None | High | 7 |
| `/admin/schools` | Schools Directory | `schools`, `school_grades`, `school_partnerships` | Full CRUD, rebate config, status toggle | `SchoolsPageView` + `SchoolForm` | None (`SchoolForm.module.css` retired) | Medium | 8 |
| `/admin/schools/[id]/profile` | School Identity & Assets | `schools`, `school_assets` | Logo upload, parent collection links | `SchoolProfile` | `SchoolProfile.module.css` | Low | 9 |
| `/admin/orders` | Commerce & Fulfilment | `orders`, `order_items`, `payment_transactions` | Read, status workflow, refund trigger | `OrdersPageView` + `OrderStatusForm` | None (`orders.module.css` retired) | Critical | 10 |
| `/admin/fulfilment` | Operational Packing Queue | `orders`, `fulfilment_batches` | Batch queue, packing slip generation | `FulfilmentPageView` | None | High | 11 |
| `/admin/procurement` | Stock & Supplier Orders | `supplier_product_costs`, `procurement_batches` | PO generation, receiving verification | `ProcurementPageView` | None (`ProcurementPageView.module.css` retired) | High | 12 |
| `/admin/payments` | Financial Reconciliation | `payment_transactions`, `orders` | Transaction search, manual reconcile | `PaymentsPageView` | None | Critical | 13 |
| `/admin/pricing` | Margin & Cost Rules | `system_settings`, `pricing_rules` | Target margin, Pexcover fee, tier config | Form / settings layout | None | Critical | 14 |
| `/admin/quotations` | Institutional Quotations | `quotations`, `schools`, `master_products` | Quote generator, discount, PDF export | `QuotationsListView` + `QuotationBuilderForm` | `Quotations.module.css`, `PexpacksDetails.module.css` | High | 15 |
| `/admin/letters` | Partner Outreach Letters | `admin_letters`, `admin_letter_templates` | Letter generator, Markdown editor, PDF | `LettersListView` + `LetterEditor` | `LetterEditor.module.css`, `LetterActionWorkbench.module.css` | Medium | 16 |
| `/admin/suppliers` | Supplier Directory | `suppliers`, `supplier_product_costs` | Create/edit supplier, lead time | `SuppliersPageView` + `SupplierEditForm` | None (`supplier-form.module.css` retired) | Medium | 17 |
| `/admin/content` | Website Content / CMS | `cms_content`, `cms_faqs`, `cms_testimonials` | FAQ/Announcements CRUD, reordering | `UnifiedCmsView` + `CmsContentManager` | `CmsContentManager.module.css`, `content-form.module.css`, `reorder.module.css` | Low | 18 |
| `/admin/blog` | Articles & Publishing | `blog_posts`, `cms_articles` | Markdown editor, cover asset upload | `BlogForm` + `ContentBlocks` | `blog-form.module.css`, `content-blocks.module.css`, `blog.module.css` | Low | 19 |
| `/admin/assets` | Media Storage Manager | Supabase Storage (`school-assets`, `logos`) | Upload, replace, CDN URL generation | `AssetUploadForm` + `AssetEditForm` | `assets-form.module.css`, `assets.module.css` | Low | 20 |
| `/admin/tasks` | Internal Operations Tasks | `admin_tasks`, `users` | Task creation, status transition | `TasksPageView` + `TaskDrawer` | `TaskDrawer.module.css` | Low | 21 |
| `/admin/users` & `/admin/roles` | RBAC & Security | `users`, `user_roles`, `security_audit_logs` | User invites, role grants, audit log | `UserRolesForm` + `UserPermissionsForm` | `users.module.css`, `roles.module.css`, `audit.module.css` | Critical | 22 |

---

## 3. Admin Component Duplication & Patterns Audit

### Reusable Admin Primitives (Batch 5.1 & 5.2)
The repository has already created standard UI primitives in `components/admin/ui/`:
1. `AdminButton.tsx` (supports `primary`, `secondary`, `danger`, `ghost`, `link` with icon slots)
2. `AdminCard.tsx` (standard surface, header, content, footer)
3. `AdminInput.tsx` (accessible form input with floating label & error states)
4. `AdminSelect.tsx` (themed selection input)
5. `AdminDropdown.tsx` (accessible context dropdown)
6. `AdminDialogContext.tsx` / `AdminDialog` (accessible modal/dialog with ESC and focus trapping)
7. `AdminPageHeader.tsx` (title, description, breadcrumbs, action slots)
8. `StatusBadge.tsx` (semantic status badges: `emerald`, `amber`, `rose`, `slate`, `blue`)
9. `QuickMetricsGrid.tsx` (KPI stat card container)
10. `StickyFormBar.tsx` (fixed bottom action bar for long forms)
11. `DbTooltip.tsx` (lightweight portal tooltip)
12. `PhysicalEyeToggle.tsx` (visual catalog toggle)
13. `WarningBannerModal.tsx` (destructive action confirmation)

### Duplication & Anti-Patterns Identified
* **Dual Data Table Implementations:** The admin currently has **two competing table patterns**:
  1. `components/admin/shared/DataTable/DataTable.tsx`: Lightweight, custom HTML table bound to URL query params via `useTableParams.ts`. Used by 10 views (`OrdersPageView`, `SchoolsPageView`, `SuppliersPageView`, etc.).
  2. `components/admin/shared/TanStackProductsTable.tsx`: Full TanStack Table v9 implementation with modular feature composition (`columnVisibilityFeature`, `rowPaginationFeature`, etc.) and client-side sorting/filtering. Currently used exclusively by `MasterProductsPageView.tsx`.
* **Disparate Pagination Controls:** `Pagination.tsx` (classic page pills) vs `DataTablePagination.tsx` (button + page input) vs `TanStackProductsTable.tsx` internal pagination controls.
* **Repeated Filter Bars:** Individual views (`OrdersPageView`, `SchoolsPageView`, `SuppliersPageView`) implement ad-hoc search and filter controls rather than a unified `AdminFilterBar` / `AdminSearch` compound component.
* **Form Action Bars:** Some forms use `StickyFormBar`, others use inline flex rows with hardcoded buttons.
* **Legacy CSS Retained:** 12 module CSS files remain in sub-domains (`letters`, `quotations`, `content`, `blog`, `assets`, `tasks`, `settings`).

---

## 4. Supabase Integration & Type Safety Audit

### Current Supabase Schema
* **Migration Baseline:** 130 sequential SQL migrations located in `supabase/migrations/` (`00001_...` to `00130_harden_ai_list_converter_matching.sql`).
* **Authoritative Remote Project:** `rjuvicgqwryztwytnauo.supabase.co` linked via `.env.local` and `scripts/ensure-supabase-linked.cjs`.
* **Schema Audit:** 42 public tables, 28 views/materialized views, 64 custom PostgreSQL functions/RPCs.

### Type Safety Status
* **Generated File:** `lib/supabase/types.ts` is generated via Supabase CLI (5,154 lines) and contains complete schema definitions for all public tables, views, and RPC return types.
* **Type Gaps & Untyped Boundaries:**
  1. In `lib/admin/operations.ts`, data queries use an untyped dynamic client (`createSupabaseAdminClient() as unknown as DynamicClient`) with manual type assertions (`as MasterProductRow[]`).
  2. In `lib/admin/items.ts`, several operations cast Supabase query returns with `as MasterProductRow` without runtime validation.
  3. `MasterProductRow` in `lib/admin/operations.ts` defines joined fields (such as `supplier: { id: string; name: string; code: string }`) that do not exist directly on the base table `Database["public"]["Tables"]["master_products"]["Row"]`.
* **Resolution Strategy:** Establish formal domain row projections using TypeScript utility types (`type MasterProductRow = Database["public"]["Tables"]["master_products"]["Row"] & { supplier?: ... }`).

---

## 5. Automated Test Infrastructure & Quality Gates

### Test Coverage Assessment
* **Unit & Integration Tests (Vitest):**
  * **Test Files:** 66 test files in `tests/`.
  * **Total Tests:** 304 automated tests (303 passing, 1 minor assertion in `brand-variant-workflow.test.ts` regarding a deleted CSS class name).
  * **Coverage Areas:** Pricing engine calculations, gross margin formulas, Pexcover add-on pricing, distributed Redis locking, edge rate limiting, admin RBAC session policies, database reconciliation audits, and password leak prevention.
* **End-to-End Tests (Playwright):**
  * **Configuration:** `playwright.config.ts` configured for Chromium on port 3000.
  * **Existing Specs (e2e/):** `home.spec.ts`, `order.spec.ts`, `a11y.spec.ts`.
  * **Admin Coverage:** Currently **0%** Playwright E2E coverage for `/admin/*` workflows.
* **Database Testing (pgTAP):**
  * Currently **not configured** in `supabase/tests`.
* **Design System (Storybook):**
  * Currently **not installed**.

---

## 6. Business Logic Protection Matrix

The following modules contain mission-critical business logic that must remain protected and unaltered throughout all admin modernization phases:

| System / Module | File Path | Protected Invariants |
| :--- | :--- | :--- |
| **Pricing Engine** | `lib/operations/pricing.ts` | Target gross margin formula: `sellingPrice = cost / (1 - targetMargin)`. Rounding rules. |
| **Pexcover Fee Calculation** | `lib/pricing/` & `00068_automated_pricing_engine_and_pexcover.sql` | Fixed cover fee tiers per pack item count. Add-on line item creation. |
| **Edge Rate Limiter** | `proxy.ts` | Upstash sliding window rate limiters (auth gate 5/10min, admin gate 60/1min). |
| **Sliding Admin Session Policy** | `lib/admin/session-policy.ts` | Redis session token hashing (`SHA-256`), 20-minute idle eviction, signed HMAC cookie. |
| **Distributed Inventory Lock** | `lib/inventory/distributed-lock.ts` | Atomic Redis locking for cart checkout inventory reservation. |
| **Payment Gateway Integration** | `lib/payments/` & `app/api/webhooks/` | Ozow, HappyPay, and PayFast webhook HMAC verification and idempotent order state transition. |
| **AI List Converter** | `lib/ai/` & `app/api/ai/` | Structured prompt schema, fuzzy product matching heuristics, draft cart creation. |
| **Row Level Security (RLS)** | `supabase/migrations/` | Customer order isolation, anon read boundaries, admin role-based mutations. |

---

## 7. Technical Debt & Modernisation Opportunities

1. **Table Architecture Consolidation:**
   * `/admin/products` has been migrated to TanStack Table v9 (`TanStackProductsTable.tsx`), solving high-density catalogue performance.
   * Other admin tables (`/admin/orders`, `/admin/schools`, `/admin/suppliers`, `/admin/payments`) still use the legacy custom `DataTable.tsx`. They should gradually adopt a unified `AdminDataTable` architecture based on TanStack Table.
2. **Elimination of Remaining 12 Legacy CSS Modules:**
   * Letters, Quotations, Content, and Blog views still import `.module.css` files. Migrating these to Tailwind v4 will achieve 100% legacy CSS retirement.
3. **Database Change Governance:**
   * Supabase migration files exist up to migration `00130`. A formalized CI preflight script and pgTAP database testing suite will prevent schema drift and protect RLS policies.
4. **Playwright Admin Journey Protection:**
   * Introducing Playwright journeys for admin authentication and product management will protect commercial workflows against regression.

---

## 8. Proposed Programme Roadmap & Approval Gates

```text
[CURRENT] PHASE A: Complete Admin & Platform Audit (Approved Baseline)
    ↓ (Gate 1 Approval)
PHASE B: Admin Design System & AdminShell Standardisation
         - Unify AdminShell layout & navigation
         - Standardise AdminPage, AdminToolbar, AdminSearch, AdminFilterBar
         - Retire residual admin-dark.css and db-tokens.css in favor of Tailwind @theme tokens
    ↓ (Gate 2 Approval)
PHASE C: Master Products Reference Implementation Review
         - Audit TanStackProductsTable v9 integration
         - Establish typed domain row helpers from generated lib/supabase/types.ts
         - Verify zero pricing deviation
    ↓ (Gate 3 Approval)
PHASE D: Extend Admin Architecture Across Existing Admin Domains
         - Migrate Orders, Schools, Suppliers, Packs to shared AdminDataTable
         - Migrate Quotations, Letters, Blog, Content to standard Tailwind composition
         - Retire remaining 12 .module.css files
    ↓ (Gate 4 Approval)
PHASE E: Supabase Migration Baseline & Database Governance
         - Formalize migration preflight and remote drift verification
         - Define deployment classification (LOW / MEDIUM / HIGH / CRITICAL)
    ↓ (Gate 5 Approval)
PHASE F: pgTAP Database Testing
         - Implement schema integrity, RLS policy, and function tests in supabase/tests/
    ↓ (Gate 6 Approval)
PHASE G: Playwright End-to-End Protection
         - Implement critical customer journey (Discovery → Cart → Checkout)
         - Implement admin journey (Login → Products Search/Filter/Edit)
    ↓ (Gate 7 Approval)
PHASE H: Storybook Design-System Catalogue
         - Setup modern Storybook for Next.js
         - Document Foundations, UI Primitives, Pexpacks domain components, and Admin primitives
    ↓ (Gate 8 Approval)
PHASE I: CI / Quality-Gate Readiness
         - Integrate lint, tsc, vitest, pgTAP, build, and playwright into unified CI pipeline
    ↓ (Gate 9 Approval)
PHASE J: Architecture Assessment Only (RHF, Zod, TanStack Query)
         - Deliver POST_HARDENING_ARCHITECTURE_ASSESSMENT.md with trade-offs
```

---

## 9. Phase A Sign-Off

**POST-TAILWIND PHASE A AUDIT COMPLETE. No Admin architecture, database, pricing, Supabase, checkout or business-logic changes have been implemented. Awaiting approval to begin Phase B — Admin Design System & AdminShell.**
