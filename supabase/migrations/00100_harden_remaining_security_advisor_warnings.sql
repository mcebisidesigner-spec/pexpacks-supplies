-- ==============================================================================
-- Pexpacks Supplies - Remaining Security Advisor Hardening
-- Migration 00100: Lock down internal/admin DB surfaces exposed in public schema
-- ==============================================================================
-- Keeps public storefront RPCs available where intentionally required, while
-- removing direct anon/authenticated access from internal admin functions,
-- trigger helpers, admin materialized views, and the pack_subtotals helper view.
-- ==============================================================================

BEGIN;

-- The helper view is consumed server-side and by SECURITY DEFINER public read RPCs.
-- It should not run as a security-definer view or be directly exposed through API roles.
ALTER VIEW IF EXISTS public.pack_subtotals SET (security_invoker = true);
REVOKE ALL ON public.pack_subtotals FROM anon, authenticated;
GRANT SELECT ON public.pack_subtotals TO service_role;

-- Admin materialized views should be read through server-side admin code only.
REVOKE ALL ON public.admin_quote_pipeline_mv FROM anon, authenticated;
REVOKE ALL ON public.admin_product_margin_mv FROM anon, authenticated;
REVOKE ALL ON public.admin_school_pack_health_mv FROM anon, authenticated;
REVOKE ALL ON public.admin_supplier_demand_mv FROM anon, authenticated;
GRANT SELECT ON public.admin_quote_pipeline_mv TO service_role;
GRANT SELECT ON public.admin_product_margin_mv TO service_role;
GRANT SELECT ON public.admin_school_pack_health_mv TO service_role;
GRANT SELECT ON public.admin_supplier_demand_mv TO service_role;

-- Search/vector and trigger helpers need stable search paths and should not be callable over REST.
ALTER FUNCTION public.sync_school_status_fields() SET search_path = public;
ALTER FUNCTION public.recalculate_quotation_totals_trigger() SET search_path = public;
ALTER FUNCTION public.maintain_orders_search_vector() SET search_path = public;
ALTER FUNCTION public.maintain_quotation_item_totals() SET search_path = public;
ALTER FUNCTION public.maintain_quotations_search_vector() SET search_path = public;
ALTER FUNCTION public.maintain_school_packs_search_vector() SET search_path = public;

REVOKE ALL ON FUNCTION public.sync_school_status_fields() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recalculate_quotation_totals_trigger() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.maintain_orders_search_vector() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.maintain_quotation_item_totals() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.maintain_quotations_search_vector() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.maintain_school_packs_search_vector() FROM PUBLIC, anon, authenticated;

-- Internal/admin SECURITY DEFINER functions are executed by server-side service-role code.
-- Do not expose them directly to browser/API roles.
REVOKE ALL ON FUNCTION public.admin_orders_dashboard(text, text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_packs_dashboard(text, uuid, boolean, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_quotations_dashboard(text, text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_global_omnibar_search(text, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.archive_operational_history(integer, boolean) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.auto_expire_quotations() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.convert_quotation_to_order(jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_quotation_with_items(jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.explain_public_read_paths(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_trg_pack_item_pricing_sync() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_trg_pricing_settings_sync() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_trg_product_cost_pricing_sync() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_trg_supplier_offer_pricing_sync() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_admin_executive_dashboard() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_admin_procurement_forecast() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.next_quotation_number() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.publish_school_pack(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recalculate_quotation_totals(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.refresh_admin_operational_summaries() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.refresh_all_dashboard_summaries() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_pack_for_publication(uuid) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.admin_orders_dashboard(text, text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_packs_dashboard(text, uuid, boolean, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_quotations_dashboard(text, text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_global_omnibar_search(text, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.archive_operational_history(integer, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.auto_expire_quotations() TO service_role;
GRANT EXECUTE ON FUNCTION public.convert_quotation_to_order(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_quotation_with_items(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.explain_public_read_paths(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_trg_pack_item_pricing_sync() TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_trg_pricing_settings_sync() TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_trg_product_cost_pricing_sync() TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_trg_supplier_offer_pricing_sync() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_admin_executive_dashboard() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_admin_procurement_forecast() TO service_role;
GRANT EXECUTE ON FUNCTION public.next_quotation_number() TO service_role;
GRANT EXECUTE ON FUNCTION public.publish_school_pack(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.recalculate_quotation_totals(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.refresh_admin_operational_summaries() TO service_role;
GRANT EXECUTE ON FUNCTION public.refresh_all_dashboard_summaries() TO service_role;
GRANT EXECUTE ON FUNCTION public.validate_pack_for_publication(uuid) TO service_role;

-- Public CMS/school read RPCs are intentionally callable by anon, but authenticated
-- browser users do not need separate direct EXECUTE grants for the public website.
REVOKE EXECUTE ON FUNCTION public.get_public_cms_announcements(text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_cms_faqs(text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_cms_resources() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_cms_testimonials() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_featured_schools(integer) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_nearby_schools(double precision, double precision, integer) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_school_pack(text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_school_visibility(text[]) FROM authenticated;

COMMIT;