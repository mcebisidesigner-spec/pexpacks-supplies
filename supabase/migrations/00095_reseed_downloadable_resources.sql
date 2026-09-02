-- ==============================================================================
-- Pexpacks Supplies — Content CMS Migration
-- Migration 00095: Re-seed downloadable file resources into the unified hub
-- ==============================================================================
-- After migration 00094 backfilled blog articles into cms_resources as
-- kind = 'article', the original downloadable file resources (kind = 'file')
-- were found missing from the remote database. This idempotent migration
-- re-seeds the two default parent/school guide downloads so the public
-- Resource Hub sidebar (listPublicCmsFiles) has content.
-- ==============================================================================

BEGIN;

INSERT INTO public.cms_resources (kind, title, description, category, file_url, file_type, file_size_label, is_public, sort_order, status, published_at, created_at, updated_at)
SELECT 'file', '2027 Back-to-School Readiness Checklist', 'Essential checklist for parents covering stationery, uniform prep, and term calendar dates.', 'Parent Guides', '/assets/guides/back-to-school-checklist.pdf', 'PDF', '1.2 MB', true, 2, 'published', timezone('utc', now()), timezone('utc', now()), timezone('utc', now())
WHERE NOT EXISTS (SELECT 1 FROM public.cms_resources WHERE title LIKE '%Readiness Checklist%');

INSERT INTO public.cms_resources (kind, title, description, category, file_url, file_type, file_size_label, is_public, sort_order, status, published_at, created_at, updated_at)
SELECT 'file', 'School Partnership Kit & Stationery Pack Agreement', 'Comprehensive onboarding guide for school administrators and SGBs interested in partnering with Pexpacks.', 'School Partnership Kits', '/assets/guides/school-partnership-kit.pdf', 'PDF', '2.8 MB', true, 3, 'published', timezone('utc', now()), timezone('utc', now()), timezone('utc', now())
WHERE NOT EXISTS (SELECT 1 FROM public.cms_resources WHERE title LIKE '%Partnership Kit%');

COMMIT;
