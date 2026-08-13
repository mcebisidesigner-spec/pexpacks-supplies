# PexPacks Supplies — Database-First Audit Report

**Date**: August 14, 2026  
**Target Platform**: Next.js 16.3.0 (App Router, Turbopack) + Supabase (PostgreSQL 17, `eu-west-1` Dublin, ref `rjuvicgqwryztwytnauo`) + Vercel (functions pinned to `dub1`)  
**Architectural Goal**: High-concurrency scaling (1,500+ active users), 3-layer architecture separation, sub-5ms metric reads, and zero-downtime mobile administration.

---

## 1. Current Database Structure (Section A)

### Core Schema & Entity Inventory
- **`schools`**: South African school directory records (`id`, `name`, `slug`, `city`, `metro`, `logo`, `is_featured`, `is_partner`, `status`, `created_at`).
- **`stationery_packs`**: Grade-specific stationery packages linked to schools (`id`, `school_id`, `title`, `slug`, `price`, `grade_level`, `visible`, `created_at`).
- **`stationery_items`**: Individual items within grade packs (`id`, `pack_id`, `name`, `title`, `description`, `unit_price`, `price`, `sku`, `sort_order`, `visible`, `icon`, `specification`).
- **`orders`**: Customer order headers (`id`, `order_reference`, `buyer_name`, `buyer_email`, `buyer_phone`, `school_slug`, `school_name`, `grade`, `pack_type`, `estimated_total`, `status`, `payment_gateway`, `paid_at`, `created_at`).
- **`dashboard_summaries`**: Single-row pre-aggregated summary table with operational + trading metrics (see §2).
- **`audit_logs`**: Immutable admin mutation trail (`actor_id`, `actor_name`, `action`, `entity_type`, `entity_id`, `summary`, `created_at`).
- **`payments`**, **`lay_by_applications`**, **`waitlist_entries`**, **`form_submissions`**, **`user_roles`**, **`roles`**, **`permissions`**, **`app_settings`**, **`website_content`**, **`blog_posts`**, **`assets`**.

### Migration History (00001–00023)
- `00001`–`00016`: initial schema, RLS, CMS, scale hardening, blog, tracking, idempotency, performance indexes.
- `00017_dashboard_aggregates.sql`: SQL aggregate functions for dashboard metrics.
- `00018_rls_concurrency_hardening.sql`: `STABLE` role-validation functions + scalar-subquery RLS checks.
- `00019_preaggregated_dashboard_summaries.sql`: `dashboard_summaries` single-row table + `refresh_all_dashboard_summaries()` batch procedure.
- `00020_reconcile_live_schema.sql`: reconciles live schema drift against migration history.
- `00021_admin_search_indexes.sql`: `pg_trgm` GIN indexes on item/school search columns.
- `00022_pack_subtotal.sql`: pack subtotal view + RPC.
- `00023_dashboard_summary_operational_metrics.sql`: additive operational metric columns + replaced refresh procedure (status semantics aligned with `lib/admin/order-constants.ts`).

### Database Functions & Triggers
- `is_admin()`, `is_staff()`: `STABLE SECURITY DEFINER` role-validation functions (InitPlan-cached inside RLS).
- `refresh_all_dashboard_summaries()`: pre-aggregates trading + operational metrics; invoked on order payment and available for 5-min scheduled refresh.
- `get_revenue_total()`, `get_assets_size()`, `get_order_pack_types()`: SQL aggregates.
- `pg_trgm` GIN indexes on `stationery_items(name, description)` and `schools(name)`.

---

## 2. Dashboard Summary Schema (as of 00023)

Single `id = 'global'` row:

| Column | Meaning |
|---|---|
| `total_orders`, `paid_orders`, `pending_orders` | Trading counts (pending = `pending_payment`, `pending`, `layby_active`) |
| `total_revenue` | Paid revenue (ZAR) |
| `total_schools`, `total_packs` | Catalogue counts |
| `orders_today`, `orders_this_week` | Operational order volume windows |
| `awaiting_fulfilment` | Orders at `paid`/`packing` (ready to pack/ship) |
| `completed_orders` | Orders at `delivered` |
| `active_packs` | Packs with `visible = true` |
| `last_updated_at` | Refresh timestamp (also enforces 10-min freshness guard) |

**Live verification (post-00023 apply, 2026-08-13T22:22 UTC)**: `total_orders=11`, `paid_orders=1`, `pending_orders=9`, `total_revenue=849.00`, `total_schools=3342`, `total_packs=23646`, `orders_today=2`, `orders_this_week=8`, `awaiting_fulfilment=1`, `completed_orders=0`, `active_packs=23646`.

---

## 3. Problems Discovered & Resolutions

1. **Direct `auth.uid()` / Un-cached RLS Volatility (Resolved in Migration 00018)**: RLS now evaluates `STABLE` functions inside scalar subqueries, enabling query-plan caching.
2. **Full Table Scans on High-Volume Item Search (Resolved in Migration 00021)**: GIN trigram indexes eliminate sequential scans on `ILIKE` searches.
3. **Direct Pooler Exhaustion (Mitigated)**: High-concurrency app reads use Supavisor poolers; dashboard reads are a single cached row rather than live aggregates.
4. **Dashboard Shown Static/Gaps in Trading Metrics (Resolved in Phase 1)**: `dashboard_summaries` lacked operational metrics and `refresh_all_dashboard_summaries()` used stale status semantics — fixed by `00023`, aligned to order-status constants.
5. **Public Pages Never Auto-Revalidated on Admin Edits (Resolved in Phase 2)**: `SCHOOL_DATA_TAG` was defined but never invalidated by admin mutations. Revalidation (`revalidateTag` + `revalidatePath`) is now wired into the `schools`/`packs`/`items` server-action and `lib` layers; the bulk CSV importer was also missing public revalidation and an audit entry — both added.

---

## 4. Dashboard & Public-Facing Data Flow

```
UI (DashboardClient, client)
   → /api/admin/dashboard/summary (route handler, RBAC: dashboard.view)
   → unstable_cache(SCHOOL_DATA_TAG-independent, DASHBOARD_SUMMARY_TAG, revalidate: 30s)
   → dashboard_summaries (single-row O(1) read, 10-min freshness guard)
   + /api/admin/dashboard/stats (unstable_cache, DASHBOARD_STATS_TAG) → charts

Mutations (orders.paid, schools/packs/items edits, bulk import)
   → refresh_all_dashboard_summaries() RPC  → DASHBOARD_SUMMARY_TAG revalidation
   → revalidateTag(SCHOOL_DATA_TAG)         → /schools, /schools/:slug, "/" revalidation
   → writeAuditLog(...)                     → audit_logs
```

- **Latency**: single-row summary reads are O(1); 30s global dedup means concurrent admins share one read.
- **Cache invalidation on sale**: `markOrderPaid` revalidates `DASHBOARD_STATS_TAG` + `DASHBOARD_SUMMARY_TAG` and triggers the refresh RPC.
- **Scheduled refresh**: optional pg_cron 5-min refresh of `refresh_all_dashboard_summaries()` (SQL provided; not yet enabled by the operator).

---

## 5. Security Implications

- **RLS**: Admin/summary reads gated by `(SELECT public.is_staff())`; service-role client confined to server (`lib/supabase/admin.ts`).
- **RBAC**: Central `PERMISSION_CATALOG` in `lib/admin/rbac.ts`; every admin module gates server actions/route handlers via `requireAdmin({ permission })`.
- **Audit logging**: `writeAuditLog` covers schools, packs, items (incl. bulk import), orders, payments, users, roles, settings, content, blog, assets — with `actor_id`/`actor_name` captured at the server boundary.
- **Cache partitioning**: admin API responses set `Cache-Control: private, no-store`; CDN cache keys are partitioned per session via `Vary: Cookie, Authorization`.

---

## 6. Performance Implications

- **Edge/ISR catalog pages**: `/schools` (5m revalidate) and `/schools/[schoolSlug]` + `/schools/[schoolSlug]/[gradeSlug]` (3600s revalidate) — instant on-demand refresh now that admin edits revalidate the `SCHOOL_DATA_TAG`.
- **Dashboard metric reads**: single-row `dashboard_summaries` read, `< 5ms`, 30s deduped, 10-min freshness guard.
- **Item typeahead search**: debounced (`150ms`), GIN `pg_trgm`-backed, `< 30ms`.
- **Regional latency**: Vercel functions pinned to `dub1` (Dublin) matching Supabase `eu-west-1`.

---

## 7. Migration Risk

- **Risk**: Low / Minimal.
- **Guardrails**: Migrations `00017`–`00023` are strictly **additive** (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`). No destructive drops or column alterations. `00023` was applied via `supabase db push --db-url` and verified live before shipping the new dashboard UI.

---

## 8. Verification Checklist

| Check | Result |
|---|---|
| Migration `00023` applied to remote | Applied + verified (REST read of new columns) |
| `npx tsc --noEmit` | 0 errors |
| `npx eslint` (changed files) | 0 errors (12 pre-existing warnings repo-wide) |
| `npm run build` (Turbopack) | Passed (~2303 pages) |
| Summary API fallback | Degrades gracefully to server-rendered stats if the summary row is absent/stale |
