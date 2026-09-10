# Remote Schema Reconciliation Inventory

Status: staged, not replayed automatically
Date: 2026-09-10

The linked database contains historical changes that were made outside the tracked migration chain. A schema-only snapshot is retained under `supabase/schema-snapshots`; this document is the review queue for converting that state into small, reproducible migrations.

## Guardrails Already Applied

- `00108_revoke_direct_sensitive_access.sql` removes direct browser grants from sensitive existing relations and internal functions.
- `00109_secure_public_schema_default_privileges.sql` prevents future `public` tables and functions from receiving automatic `anon` or `authenticated` access.
- Do not replay a whole-schema `db pull` output. It contains broad grants and drop/recreate operations unsuitable for a live database.

## Stage 1: Compatibility Functions

Review, test against application routes, then capture individually:

- `get_admin_pack_school_groups`: remote uses a larger default page size.
- `get_public_cms_testimonials`: remote returns `school_name` in addition to the tracked result shape.
- `update_dashboard_summary_on_order`: remote has an order-summary trigger function not in the tracked schema.

## Stage 2: Data Compatibility

Review existing data before any `ALTER TABLE` migration:

- `payments`: precision/default/nullability and `updated_at` differences.
- `quotations`: numeric delivery and discount values.
- `orders`: payment gateway default.
- `schools`: nullable slug behavior.
- `cms_testimonials`: `school_name` column.

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