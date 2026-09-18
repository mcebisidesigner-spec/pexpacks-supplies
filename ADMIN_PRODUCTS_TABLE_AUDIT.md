# ADMIN_PRODUCTS_TABLE_AUDIT.md

**Project:** pexpacks-supplies
**Phase:** B1 — audit only (no implementation)
**Scope:** `/admin/products` master-products table + current Supabase typing architecture
**Rule:** TanStack Table is NOT installed and `/admin/products` is NOT modified. This document records the audit only.

---

## Current data source

The products page is a **server component**:

```text
app/admin/products/page.tsx
```

which:

1. calls `requireAdmin({ permission: "admin_products.view" })` (admin RBAC guard);
2. reads `searchParams` for `page`, `pageSize`, `q`, `category`, `sort`, `order`;
3. runs two data operations in parallel via `Promise.all`:
   * `listMasterProducts({ page, pageSize, query, category, sort, order })`;
   * `getSupplierCostStats()`;
4. renders `<MasterProductsPageView initialData={data} supplierStats={supplierStats} />`.

The authoritative data store is **Supabase** (local + remote). No client-side copy of the catalogue is maintained; the component is `force-dynamic`.

---

## Current query strategy

* `listMasterProducts` (in `lib/admin/operations`) performs the server-side listing with **server-side pagination**, filtering (query + category), sorting and ordering, and returns `{ products, total, page }`.
* `getSupplierCostStats` supplies aggregate supplier-cost statistics used by the metrics strip and the supplier column.
* `initialData` (server payload) is passed to the client **view** component — the client receives one snapshot, not the full catalogue.
* The catalogue is **not** loaded in its entirety into the browser (matches the "do not download the whole DB" directive).

**Implication for Phase B:** the data layer is already server-cursor/count based. A TanStack Table layer here would consume the existing server payload and keep pagination server-side; it should not replace `listMasterProducts`.

---

## Current table architecture

The client render path is:

```text
components/admin/views/MasterProductsPageView.tsx
  ├─ DataTableToolbar  (search box, category <AdminSelect>)
  ├─ QuickMetricsGrid  (TOTAL PRODUCTS / ACTIVE IN PACKS / AVG SELLING PRICE / SUPPLIER)
  ├─ DataTable         (headless-ish generic table with column defs)
  │    ├─ columns: SKU / Product Name / Category / Cost price / Selling price / Status / Actions
  │    ├─ sorting (per `sort`/`order` params)
  │    ├─ pagination via DataTablePagination
  │    └─ row click → navigate to `/admin/products/[slug]`
  ├─ CSV importer: <CSVStationeryImporter>
  └─ ConfirmModal for "Clear all products"
```

Key architectural facts (verified):

* The existing `DataTable` (`components/admin/shared/DataTable`) is a **generic, Tailwind-based table abstraction** already providing stable tooling: `DataTable`, `DataTableToolbar`, `DataTablePagination`, plus `useTableParams` hook and `ColumnDef` type. It does **not** depend on TanStack Table.
* Columns are declared as a local `columns: ColumnDef<MasterProductRow>[]` array inside `MasterProductsPageView`, with `key`, `header`, `sortable`, `render`, `align`, `width`.
* The view imports styling from the migrated design system `corePages` (Tailwind object, no CSS module) — this was completed and verified (`tsc` clean, retired `CorePagesView.module.css` deleted).

---

## Current sorting behaviour

* Server-side sorting driven by `sort` / `order` search params passed to `listMasterProducts`.
* Columns declare `sortable: true` (SKU, Product Name, Category, Cost price, Selling price, Status); the toolbar reacts and reloads the route with updated params.
* `useTableParams` (`components/admin/shared/DataTable`) serialises table params into the URL and back.

---

## Current filtering behaviour

* **Query** search (`q`) — free-text server search (uses DB search fields/SQL `ILIKE`/search indexes in `master_products`).
* **Category** filter via `<AdminSelect>` feeding `category` param (`Category: All` + `MASTER_PRODUCT_CATEGORIES`).
* Status is inherently represented by the `Status` column (Active/Draft via `StatusBadge`), not as a separate filter control.
* No price-range, supplier or other filters currently surfaced on this page.

---

## Current pagination behaviour

* Server-side page/pageSize cursors from `searchParams`.
* `DataTablePagination` renders the page controls; default page size is clamped (min 10, max 100).
* `listMasterProducts` returns `total` used to derive page count.

---

## Current editing behaviour

Editing is **detail-route based**:

* Row click / view action → `/admin/products/[slug]` (per-product edit interaction lives on the detail page, not inline in the table).
* This audit does not modify: product creation (`add-product`), editing, archive, delete, bulk actions, SKU pricing overrides or margin snapshots. Those live behind the existing admin operations layer and remain untouched.

---

## Current bulk actions

A single destructive bulk action exists and is already well-guarded:

* **"Clear all products"** — opens a `ConfirmModal`, calls `clearMasterProductsAction()` (server action), shows catalogue progress messaging. This is a deliberately destructive operation with confirmation; any Phase B work must preserve its confirmation + server-action semantics exactly.

No other bulk actions (bulk archive/price/move) are currently present on this page.

---

## Current product type definitions

The authoritative types are the **generated Supabase types**:

```text
lib/supabase/types.ts          → Database type (Row/Insert/Update + Relationships) for public + internal
```

tables include (non-exhaustive verification): `orders`, `order_items`, `order_events`, `fulfilment_records`, `admin_letters`, `cms_*`, `blog_posts`, `master_products`, `learners`, `customers`, `notifications`, `operational_tasks`, `brand_package_claims`, `legacy_write_audit_log`, `quotation*`, `faqs`, `form_submissions` and others.

The view uses `MasterProductRow` / `SupplierCostStats` types from `lib/admin/operations`. These derive from the generated database types / operation-layer projections.

---

## Current visual architecture

* 100% **Tailwind** — the codesheet migration phase completed the retirement of `CorePagesView.module.css` (698 lines) and all consumers now use the `corePages` Tailwind design object (verified: retired CSS deleted, `tsc` clean, no live imports).
* shadcn/ui primitives and a local `ui/` component set are present (`components/admin/ui/*`, `components/ui/*` — Card, Button, Input, Select, Dialog, Tooltip, Badge, etc.).
* The DataTable sits on Tailwind utility classes + design tokens.

---

## Current performance concerns

* Pagination and filtering are already **server-side**, which is the correct pattern for a growing master catalogue — good baseline.
* Search relies on `master_products` search fields/SQL search; worth confirming index coverage for the `q` filter at scale (DB already has dedicated search indexes from migrations 00076/00077 era — see `supabase/migrations/00076_optimize_search_and_partial_indexes.sql`).
* The metrics strip (`QuickMetricsGrid`) plus `getSupplierCostStats()` run on every products-page load. Hardcoded example figures exist in the view (e.g. "R 48.50", "+14 this month") — these are placeholder/static and should be reviewed as a data-accuracy item, not a table concern.

---

## Current test tooling (verified)

* **TypeScript** — `tsc --noEmit` runs clean on the current codebase (verified this session).
* **Vitest** — unit test runner configured (`vitest run`); existing DB tests: `tests/supabase-connection-pooling.test.ts`, `tests/db-schema-preflight.test.ts`.
* **Playwright** — configured (`playwright.config.ts`, `@playwright/test`, `@axe-core/playwright`); script `admin-browser-smoke-test.cjs` present.
* **Storybook** — not dependency-listed (no `storybook` in devDependencies); not present. (Storybook is a later-phase candidate, not Phase B.)
* **Supabase** — `supabase/config.toml` present; full migration history under `supabase/migrations/` (00001–00101); `@supabase/supabase-js` and `@supabase/ssr` in use.
* **Dev/scratch scripts** — scratch migration drivers from prior work were removed from the project root (only the retained `scripts/` dir remains for operational tooling).

---

## Migration risks (B2 TanStack Table)

1. **Bulk "Clear all products"** is destructive — must keep current ConfirmModal + server-action confirmation flow. Never auto-test destructive clear in E2E against production.
2. **Server-side pagination is already correct** — a full-screen re-architecture to client-side would regress catalogue scale. TanStack Table must be a presentation/state layer over the existing `listMasterProducts` server payload (per the objective).
3. **Do not duplicate the database into client state** — keep Supabase as source of truth; table is view-only state.
4. **No Zod/RHF/TanStack Query** present — that is a Phase D consideration (assessment only, not implemented).
5. Preserve: sorting/filtering/pagination semantics, row-click navigation, supplier column + metrics, search, CSV importer, ConfirmModal, pricing/margin snapshot behaviour untouched.
6. The retired CSS module is gone; any new table wiring must consume the `corePages` design system (and Tailwind only) — no reintroducing `module.css`.

---

**Phase B1 audit complete — no functional or database changes were made. TanStack Table was not installed; `/admin/products` was not modified; Supabase types were not regenerated; Phase C was not started.**
