# Remote Schema Reconciliation Inventory

Status: staged, not replayed automatically
Date: 2026-09-10

The linked database contains historical changes that were made outside the tracked migration chain. A schema-only snapshot is retained under `supabase/schema-snapshots`; this document is the review queue for converting that state into small, reproducible migrations.

## Guardrails Already Applied

- `00108_revoke_direct_sensitive_access.sql` removes direct browser grants from sensitive existing relations and internal functions.
- `00109_secure_public_schema_default_privileges.sql` prevents future `public` tables and functions from receiving automatic `anon` or `authenticated` access.
- Do not replay a whole-schema `db pull` output. It contains broad grants and drop/recreate operations unsuitable for a live database.

## Stage 1: Compatibility Functions

Captured in `00111_capture_cms_and_bounded_admin_rpc.sql`: the public testimonial `school_name` shape. The stale `get_admin_pack_school_groups` function was retired because it depends on deleted legacy tables.

Review, test against application routes, then capture individually:

- `update_dashboard_summary_on_order`: retired in `00112_retire_redundant_dashboard_summary_trigger.sql`; the tracked statement-level recalculation trigger remains authoritative.

## Stage 2: Data Compatibility

Captured in `00114_normalize_payment_and_quotation_contract.sql`: payment amount, currency, gateway, status, and creation timestamp are mandatory; payment amount and quotation delivery/discount values use `numeric(12,2)`. The migration validates data first and aborts instead of silently rounding historical money values.

Read-only audit results before capture: 0 payment rows, 2 quotations with complete two-decimal fees/discounts, and 6 testimonials with school context.

- `orders`: retain the nullable gateway at order creation. The payment RPC supplies the final gateway only after verified payment.

## Stage 3: Read Models and Indexes

Capture only objects confirmed by `EXPLAIN ANALYZE` and application usage:

- Admin report materialized views and reporting views.
- Trigram/location/search indexes on schools and products.
- Additional order and payment lookup indexes.

Do not copy duplicate search indexes or replace a btree index with GIN until a production query plan proves it is required.

## Completion Criteria

1. Each stage is represented by a focused reviewed migration.
2. A clean local database can apply all migrations without the recovery snapshot.
3. Local and remote schema dumps differ only in expected operational metadata.
4. The schema snapshot can be retired after a disposable restore drill succeeds.