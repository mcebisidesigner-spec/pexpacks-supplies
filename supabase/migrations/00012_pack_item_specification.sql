-- ===================================================
-- 00012 PACK ITEM SPECIFICATION
-- Add a per-item "Specification" column shown on the
-- public complete-list drawer and the downloadable
-- stationery-list PDF.
-- ===================================================

alter table public.stationery_items add column if not exists specification text;
