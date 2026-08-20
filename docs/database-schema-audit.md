# Pexpacks Database Schema Audit

Date: 2026-08-20
Implementation status: initial cleanup implemented in migrations `00036` and `00037`.

## Verdict

The database is useful and recoverable, but it is messy. The mess is mostly from a valid transition: the app started with simple public checkout/catalogue tables, then added a normalized operations platform on top. The migration history should be kept. Cleanup should happen through new forward-only migrations and app code changes, not by deleting or rewriting old migrations.

Because this project is still being built from scratch, unifying the schema is highly practical. The clean target is not to physically remove every legacy table immediately, but to make the normalized operations model the only business source of truth and keep legacy tables as compatibility surfaces until the app no longer imports them.

Practical feasibility: high. The largest remaining effort is updating admin pack/item screens that still write `stationery_items`; the database now has canonical views and sync bridges to support that migration in smaller steps.

## Current Shape

The repo has these main database layers:

- Public checkout foundation: `orders`, `form_submissions`.
- Admin/CMS layer: `roles`, `permissions`, `user_roles`, `website_content`, `testimonials`, `faqs`, `assets`, `audit_logs`.
- Legacy school catalogue: `schools`, `stationery_packs`, `stationery_items`.
- Normalized operations platform: `seasons`, `customers`, `learners`, `master_products`, `school_pack_items`, `order_items`, `payment_events`, suppliers, pricing, procurement, packing, fulfilment, tasks, approvals, notifications.
- Settings layer: older `app_settings` plus newer `system_settings` and `system_settings_audit`.

## Main Findings

### 1. Duplicate Migration Number

There are two migration files with the same `00035` prefix:

- `supabase/migrations/00035_add_refused_partnership.sql`
- `supabase/migrations/00035_fix_legacy_operations_bridge.sql`

Risk: Supabase migration tooling commonly treats the leading version as the migration identity. Duplicate versions can cause ordering or application failures, depending on the tool path.

Implemented: the untracked refused-partnership migration was renumbered to `00036_add_refused_partnership.sql`, leaving existing migration history intact.

### 2. Legacy and Canonical Product Models Coexist

The app still reads and writes `stationery_items` heavily, while the operations layer introduced:

- `master_products`
- `school_pack_items`
- `stationery_items.master_product_id`

There is a bridge migration that syncs legacy `stationery_items` into `school_pack_items`. That is useful during transition, but it confirms there are two competing sources for pack composition.

Risk: product price, quantity, wording, visibility, and pack contents can drift between `stationery_items` and `school_pack_items` if writes bypass triggers or if business logic reads one table while admin edits another.

Target direction: `master_products` should be the canonical product catalogue; `school_pack_items` should be the canonical pack composition table. `stationery_items` should become a compatibility table or view until all app code is migrated.

Implemented: `00037_canonical_schema_unification_views.sql` adds `canonical_pack_items_view`, `public_pack_items_view`, and `admin_pack_items_view`. These views prefer `school_pack_items + master_products` and include legacy `stationery_items` only when a row has not been bridged.

### 3. Orders Have Both JSON Summary and Normalized Line Items

The original `orders` table stores summary fields and `items` JSON. The operations layer added `order_items` as immutable line snapshots.

Risk: reports, receipts, procurement, and fulfilment can disagree if they read from different shapes. `orders.items` is useful for display/backward compatibility, but it should not drive stock, procurement, margin, or fulfilment logic.

Target direction: `orders` stores header/customer/payment summary; `order_items` stores purchased line truth.

Implemented: `00037_canonical_schema_unification_views.sql` adds `order_line_summary_view` and comments `orders.items` as a legacy display/cache summary.

### 4. Settings Are Split

The repo has both:

- `app_settings`
- `system_settings`

Risk: admins may update one settings area while runtime code reads another. This is especially risky for business settings such as pricing, contact details, fulfilment defaults, and idle timeout.

Target direction: migrate all active keys into `system_settings`, then make `app_settings` read-only compatibility or remove app reads from it.

Implemented: `00037_canonical_schema_unification_views.sql` adds `settings_effective_view` and seeds missing canonical settings for checkout currency and PexCover. `lib/admin/settings.ts` now reads and writes `system_settings`, falling back to `app_settings` only for older deployments.

### 5. RLS Policy Maturity Is Uneven

Early migrations use broad authenticated/admin policies. Later operations migrations use permission-specific policies such as `orders.view`, `procurement.manage`, `pricing.view`.

Risk: older public/admin tables may be more permissive than newer operations tables. The app often uses service-role admin clients server-side, so RLS mistakes might not show immediately in local testing.

Target direction: keep service-role operations server-side, but standardize RLS policy intent by table category: public read, staff read, permission-managed writes, service-role-only workflows.

### 6. Business Logic Lives in Large SQL Functions

Important business events are inside SQL functions, especially payment completion:

- `complete_order_payment`
- `record_order_payment_status`
- `allocate_secured_demand`

This is good for atomic workflows, but the functions have grown to include payments, procurement, fulfilment, notifications, tasks, and audit logs.

Risk: function changes become high-blast-radius. A small payment change can affect procurement and fulfilment.

Target direction: keep atomic DB functions, but split internal responsibilities into smaller helper functions where practical and add regression tests or SQL smoke checks for the payment-to-fulfilment chain.

## Cleanup Plan

### Phase 1: Stabilize Migration Hygiene

1. Resolve the duplicate `00035` situation without deleting history. Done for the untracked refused-partnership migration.
2. Adopt a strict migration naming rule: one unique increasing version per file. Documented in `supabase/migrations/README.md`.
3. Add a simple CI/local check that fails on duplicate migration prefixes. Still recommended.
4. Add a short `supabase/migrations/README.md` explaining that old migrations are append-only. Done.

### Phase 2: Pick Canonical Tables

Use this canonical model:

- Products: `master_products`
- Pack composition: `school_pack_items`
- School pack headers: `stationery_packs`
- Orders: `orders`
- Order lines: `order_items`
- Settings: `system_settings`

Compatibility only:

- `stationery_items`
- `orders.items`
- `app_settings`

### Phase 3: Move Reads First

1. Public school pack pages should read from `school_pack_items + master_products`, with fallback to `stationery_items`. Started via `public_pack_items_view` and the updated public school pack RPC/fallback.
2. Admin items should manage `master_products`.
3. Admin pack composition should manage `school_pack_items`.
4. Reports and procurement should read only `order_items`, not `orders.items`.

### Phase 4: Then Move Writes

1. New item creation writes to `master_products`.
2. Pack editing writes to `school_pack_items`.
3. Checkout writes `orders` and `order_items`; `orders.items` becomes summary/cache only.
4. Settings forms write to `system_settings`.

### Phase 5: Add Safety Views

Create compatibility views so old UI code can be migrated gradually:

- `public_pack_items_view`
- `admin_pack_items_view`
- `order_line_summary_view`
- `settings_effective_view`

Views make the app simpler while preserving current tables until cleanup is complete.

### Phase 6: Deprecate, Then Remove App Dependencies

Do not drop old tables immediately. First:

1. Stop direct writes to legacy tables.
2. Add comments marking compatibility-only tables/columns.
3. Log or audit any remaining legacy writes.
4. Remove app reads after all screens are migrated.
5. Only then consider a future archival/drop migration.

## Suggested Next Migrations

Do not edit old applied migrations. Add new ones like:

- `00037_canonical_schema_unification_views.sql` was added and combines canonical pack item, order line, settings, subtotal, and public pack RPC cleanup.
- `00038_legacy_write_audit.sql` is still recommended if you want to log remaining direct writes into compatibility tables.

The refused-partnership migration is now `00036_add_refused_partnership.sql`.

## Practical Priority

Highest priority:

1. Fix duplicate migration numbering before next DB push.
2. Decide that `master_products + school_pack_items` is the canonical item model.
3. Move public pack reads to a compatibility view backed by canonical tables.
4. Migrate `app_settings` reads/writes into `system_settings`.
5. Add smoke tests for payment completion creating payment event, procurement demand, packing record, and fulfilment record.

## What Not To Do

- Do not delete migration history.
- Do not rewrite old migrations already applied to any database.
- Do not drop `stationery_items`, `orders.items`, or `app_settings` until app code no longer depends on them.
- Do not rely on the homepage working as proof that operations/payment/procurement schema is healthy.
