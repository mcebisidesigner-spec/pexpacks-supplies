-- Migration 00046: Revoke anon & public execution privileges on internal security & trigger functions

REVOKE EXECUTE ON FUNCTION public.set_user_as_admin(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.set_user_permission(uuid, text, boolean, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.grant_role(uuid, text, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.revoke_role(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.run_admin_data_quality_audit() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.log_legacy_table_write() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.prevent_legacy_table_write() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.reconcile_legacy_to_canonical() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.fn_auto_link_master_product() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.fn_sync_school_pack_item_on_delete() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.fn_sync_school_pack_item_on_insert() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.fn_sync_school_pack_item_on_update() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.update_dashboard_summary_on_order() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.refresh_all_dashboard_summaries() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.recalculate_dashboard_summaries() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_admin_filter_options() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_admin_pack_school_groups(text, text, integer, integer) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_all_pack_school_groups_json(text, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_assets_size() FROM anon, public;
