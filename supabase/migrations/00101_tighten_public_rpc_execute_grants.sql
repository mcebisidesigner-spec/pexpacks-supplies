-- ==============================================================================
-- Pexpacks Supplies - Public RPC Execute Grant Hardening
-- Migration 00101: Remove default PUBLIC/authenticated execute from storefront RPCs
-- ==============================================================================
-- Storefront RPCs are intentionally callable by anon for public pages and by
-- service_role for server-side rendering. Authenticated users should not receive
-- a separate broad execute grant through PostgreSQL's default PUBLIC privilege.
-- ==============================================================================

BEGIN;

REVOKE EXECUTE ON FUNCTION public.get_public_cms_announcements(text) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_cms_faqs(text) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_cms_resources() FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_cms_testimonials() FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_featured_schools(integer) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_nearby_schools(double precision, double precision, integer) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_school_pack(text) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_school_visibility(text[]) FROM PUBLIC, authenticated;
REVOKE EXECUTE ON FUNCTION public.search_public_schools(text, text, text, text, integer, integer) FROM PUBLIC, authenticated;

GRANT EXECUTE ON FUNCTION public.get_public_cms_announcements(text) TO anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_cms_faqs(text) TO anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_cms_resources() TO anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_cms_testimonials() TO anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_featured_schools(integer) TO anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_nearby_schools(double precision, double precision, integer) TO anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_school_pack(text) TO anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_school_visibility(text[]) TO anon, service_role;
GRANT EXECUTE ON FUNCTION public.search_public_schools(text, text, text, text, integer, integer) TO anon, service_role;

COMMIT;