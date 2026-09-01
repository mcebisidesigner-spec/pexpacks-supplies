-- ===================================================
-- 00088_remove_reports.sql
-- Remove the discontinued /admin/reports feature from the database.
--
-- The application code (routes, page view, data lib, nav, RBAC catalog keys,
-- dashboard links) was removed separately. This migration cleans up the now
-- unused database objects:
--   * role_permissions grants for reports.view / reports.export
--   * the reports.view permission row (reports.export was never seeded)
--   * the read-only reporting RPC functions spawned by 00009 / 00037 / 00043
--
-- Order is FK-safe: grants are deleted before their permission rows, and the
-- functions are dropped last (nothing else in the DB references them).
-- ===================================================

-- 1. Remove reports.* grants from role_permissions (join to permissions by key)
delete from public.role_permissions rp
using public.permissions p
where rp.permission_id = p.id
  and p.key in ('reports.view', 'reports.export');

-- 2. Remove the permission rows themselves
delete from public.permissions
where key in ('reports.view', 'reports.export');

-- 3. Drop the reporting RPC functions
drop function if exists public.get_orders_summary(date, date);
drop function if exists public.get_orders_by_status_range(date, date);
drop function if exists public.get_orders_by_pack_type_range(date, date);
drop function if exists public.get_top_schools(date, date, integer);