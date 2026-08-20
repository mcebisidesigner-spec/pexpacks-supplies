# Admin Database Integrity and Security Audit

Date: 2026-08-20

## Scope

This audit covers the local Supabase database after a clean `supabase db reset`, the admin-facing database paths in the app, and the current migration chain through `00038_admin_data_quality_and_security_hardening.sql`.

The local database was reset from migrations, so business tables are structurally present but mostly empty. This validates schema integrity and policy behavior, but it is not a production-record audit unless the same checks are run against the live database.

## Does the Legacy Schema Still Exist?

Yes. The legacy schema still exists intentionally:

- `stationery_items`
- `app_settings`
- `orders.items`
- legacy school-pack header table `stationery_packs`

Current canonical source of truth:

- Products: `master_products`
- Pack composition: `school_pack_items`
- Order lines: `order_items`
- Settings: `system_settings`

Compatibility views now bridge old and new models:

- `canonical_pack_items_view`
- `public_pack_items_view`
- `admin_pack_items_view`
- `order_line_summary_view`
- `settings_effective_view`
- `pack_subtotals`

## Current Local Data Audit Result

After local reset:

- `master_products`: 0 rows
- `school_pack_items`: 0 rows
- `order_items`: 0 rows
- `system_settings`: 21 rows
- `stationery_items`: 0 rows
- `app_settings`: 2 rows
- `orders`: 0 rows
- `schools`: 0 rows
- `stationery_packs`: 0 rows

The new `admin_data_quality_issues_view` returned zero issue counts for:

- missing school names/slugs
- duplicate school slugs
- missing pack titles/slugs
- negative pack/product pricing
- missing product SKUs/names
- duplicate product SKUs
- missing pack/product references in `school_pack_items`
- invalid pack quantities
- unbridged legacy items
- orders without normalized `order_items`
- invalid order item quantity/totals

## Security Audit Result

RLS is enabled on key admin and operational tables.

Implemented in `00038`:

- Public school reads now expose only `status = active` and `published = true`.
- Public pack reads now expose only visible packs attached to public schools.
- Public legacy item reads now expose only visible items in visible/public packs.
- `app_settings` is no longer writable by ordinary authenticated staff.
- `system_settings` writes now require `settings.manage`.
- `system_settings_audit` access now requires `settings.manage` or service role.
- Added `admin_data_quality_issues_view` for count-only integrity monitoring.

Remaining security considerations:

- PII exists in `orders`, `customers`, `form_submissions`, `payments`, `payment_events`, `schools`, `suppliers`, and related admin tables.
- Server-side admin clients use service role, so route-level RBAC remains critical.
- Encryption at rest is managed by Supabase/Postgres hosting. Application-level encryption is not currently visible for individual PII fields.
- Payment/provider payloads should be reviewed before production to ensure no card data or unnecessary sensitive metadata is stored.

## Recommended Incremental Migration Strategy

### Phase 1: Freeze Legacy Writes

Keep legacy tables physically present, but stop app code from writing them.

Current status:

- Admin item/product writes are moved to `master_products`.
- Pack composition writes are moved to `school_pack_items`.
- Settings writes are moved to `system_settings`.
- Orders write normalized `order_items`; `orders.items` is display/cache only.

Next step:

- Add monitoring for direct writes to `stationery_items`, `app_settings`, and `orders.items` if live data import or external integrations are added.

### Phase 2: Backfill and Reconcile

Before production cutover, run reconciliation jobs:

- Every `stationery_items` row should have a `master_product_id`.
- Every legacy item should have exactly one `school_pack_items.legacy_item_id`.
- Every order used for fulfilment/reporting should have `order_items`.
- Every legacy setting should be represented in `system_settings`.

Use `admin_data_quality_issues_view` after every import and before every release.

### Phase 3: Read From Canonical Views Only

Use compatibility views while migrating screens:

- Public pack UI reads `public_pack_items_view`.
- Admin pack UI reads `admin_pack_items_view`.
- Reporting reads `order_line_summary_view`.
- Settings reads `system_settings` with `settings_effective_view` fallback.

Avoid adding new app code that reads `stationery_items`, `app_settings`, or `orders.items` directly.

### Phase 4: Security Tightening

Before production data goes live:

- Confirm all admin routes use `requireAdmin()` with the correct permission.
- Keep direct public reads limited to active/published/visible records.
- Keep PII access server-side.
- Avoid storing unnecessary payment gateway payload data.
- Add audit logs for bulk imports, settings changes, order status changes, refunds, and permission changes.

### Phase 5: Archive or Drop Later

Only consider archiving/dropping legacy tables after:

- no app code depends on them,
- no RPC depends on them,
- no external integration writes them,
- reconciliation views report zero legacy drift for a sustained period,
- a full backup/export exists.

Do not drop migration history.

## Recommended Tooling

- `supabase db reset`: validates a fresh database can be built from migrations.
- `supabase db lint --local --schema public --level warning --fail-on error`: lints project-owned schema only.
- `admin_data_quality_issues_view`: ongoing integrity dashboard/query source.
- CI duplicate migration prefix check.
- Supabase backups before production data migrations.
- Optional future tools: pgTAP for SQL regression tests, seed scripts for realistic fixtures, and a scheduled data-quality job that records audit counts over time.

## Commands Verified

```powershell
supabase.cmd db reset
supabase.cmd db lint --local --schema public --level warning --fail-on error
```

Result:

```text
No schema errors found
```
