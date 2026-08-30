-- Migration 00046: Revoke anon & public execution privileges on internal security & trigger functions

DO $$
DECLARE
  fn text;
  functions text[] := ARRAY[
    'public.set_user_as_admin(uuid)',
    'public.set_user_permission(uuid, text, boolean, uuid)',
    'public.grant_role(uuid, text, uuid)',
    'public.revoke_role(uuid, text)',
    'public.run_admin_data_quality_audit()',
    'public.log_legacy_table_write()',
    'public.prevent_legacy_table_write()',
    'public.reconcile_legacy_to_canonical()',
    'public.fn_auto_link_master_product()',
    'public.fn_sync_school_pack_item_on_delete()',
    'public.fn_sync_school_pack_item_on_insert()',
    'public.fn_sync_school_pack_item_on_update()',
    'public.update_dashboard_summary_on_order()',
    'public.refresh_all_dashboard_summaries()',
    'public.recalculate_dashboard_summaries()',
    'public.get_admin_filter_options()',
    'public.get_admin_pack_school_groups(text, text, integer, integer)',
    'public.get_all_pack_school_groups_json(text, text)',
    'public.get_assets_size()'
  ];
BEGIN
  FOREACH fn IN ARRAY functions LOOP
    IF to_regprocedure(fn) IS NOT NULL THEN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon, public', fn);
    END IF;
  END LOOP;
END $$;