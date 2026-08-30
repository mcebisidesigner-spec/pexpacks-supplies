-- Migration 00071: Drop obsolete legacy governance objects
-- Legacy stationery/settings tables have been removed from public and legacy_archive,
-- so the legacy deletion simulation view and write-blocker/audit helpers are no longer used.

DROP VIEW IF EXISTS public.legacy_deletion_blockers_view;
DROP FUNCTION IF EXISTS public.log_legacy_table_write();
DROP FUNCTION IF EXISTS public.prevent_legacy_table_write();