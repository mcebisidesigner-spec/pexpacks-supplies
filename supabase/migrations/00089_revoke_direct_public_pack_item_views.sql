-- Migration 00087: Revoke direct public access to pack item views
-- ============================================================================
-- Public pages should use the slim get_public_school_pack RPC. Direct view access
-- exposes more operational metadata than the browser needs, even though supplier
-- costs are not selected by these views.
-- ============================================================================

REVOKE SELECT ON public.canonical_pack_items_view FROM anon, authenticated;
REVOKE SELECT ON public.public_pack_items_view FROM anon, authenticated;
REVOKE SELECT ON public.admin_pack_items_view FROM anon, authenticated;

GRANT SELECT ON public.canonical_pack_items_view TO service_role;
GRANT SELECT ON public.public_pack_items_view TO service_role;
GRANT SELECT ON public.admin_pack_items_view TO service_role;

GRANT EXECUTE ON FUNCTION public.get_public_school_pack(text) TO anon, authenticated, service_role;
