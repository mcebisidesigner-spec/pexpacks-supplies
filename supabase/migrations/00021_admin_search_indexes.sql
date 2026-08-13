-- ===================================================
-- Pexpacks Supplies — Admin Search & Filter Indexes
-- Migration 00021: pg_trgm substring indexes for the admin
-- inventory typeahead + school search, and targeted indexes
-- for the audit-log and payments filters.
--
-- SAFETY: purely additive. No drops, no data changes.
-- ===================================================

-- Substring / contains search (ILIKE '%…%') support
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Stationery inventory typeahead (name + description substring).
-- Backs the admin inventory search and the grade-pack item selector
-- (lib/admin/items.ts listStationeryInventory).
CREATE INDEX IF NOT EXISTS idx_stationery_items_search_trgm
  ON public.stationery_items USING gin (name gin_trgm_ops, description gin_trgm_ops);

-- School admin search (name substring)
CREATE INDEX IF NOT EXISTS idx_schools_name_trgm
  ON public.schools USING gin (name gin_trgm_ops);

-- Audit-log filtering (time, entity type, actor)
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
  ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type_created
  ON public.audit_logs (entity_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id_created
  ON public.audit_logs (actor_id, created_at DESC);

-- Payments ledger lookups by order reference (admin payments filter)
CREATE INDEX IF NOT EXISTS idx_payments_order_reference
  ON public.payments (order_reference);
