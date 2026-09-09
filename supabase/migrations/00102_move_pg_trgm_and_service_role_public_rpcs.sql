-- ==============================================================================
-- Pexpacks Supplies - Final Advisor Cleanup for Public Schema Exposure
-- Migration 00102: Move pg_trgm and make storefront RPCs server-only
-- ==============================================================================
-- Public pages call these RPCs from Next.js server code through the Supabase
-- service role client. Removing anon EXECUTE prevents the RPC endpoints from
-- being callable directly over PostgREST while preserving the website pipeline.
-- ==============================================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

REVOKE EXECUTE ON FUNCTION public.get_public_cms_announcements(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_cms_faqs(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_cms_resources() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_cms_testimonials() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_featured_schools(integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_nearby_schools(double precision, double precision, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_school_pack(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_school_visibility(text[]) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.search_public_schools(text, text, text, text, integer, integer) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_public_cms_announcements(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_public_cms_faqs(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_public_cms_resources() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_public_cms_testimonials() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_public_featured_schools(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_public_nearby_schools(double precision, double precision, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_public_school_pack(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_public_school_visibility(text[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.search_public_schools(text, text, text, text, integer, integer) TO service_role;

COMMIT;