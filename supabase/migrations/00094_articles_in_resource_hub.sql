-- ==============================================================================
-- Pexpacks Supplies — Content CMS Migration
-- Migration 00094: Unify blog articles into the Resource Hub (cms_resources)
-- ==============================================================================
-- The Resource Hub now holds BOTH downloadable files (kind = 'file') and
-- blog articles (kind = 'article'). Existing blog_posts rows are backfilled
-- into cms_resources as articles, and the public RPC is updated to expose the
-- article-friendly columns so /blog and /blog/[slug] can be fed from a single
-- source of truth.
-- ==============================================================================

BEGIN;

-- 1. Add article-supporting columns to cms_resources
ALTER TABLE public.cms_resources
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'file'
    CHECK (kind IN ('file', 'article'));
ALTER TABLE public.cms_resources
  ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.cms_resources
  ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE public.cms_resources
  ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.cms_resources
  ADD COLUMN IF NOT EXISTS content JSONB;
ALTER TABLE public.cms_resources
  ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false;

-- Articles (kind = 'article') have no downloadable file, so allow file_url to be NULL
ALTER TABLE public.cms_resources
  ALTER COLUMN file_url DROP NOT NULL;

-- Article slugs must be unique (only enforced where kind = 'article')
DROP INDEX IF EXISTS idx_cms_resources_article_slug;
CREATE UNIQUE INDEX IF NOT EXISTS idx_cms_resources_article_slug
  ON public.cms_resources (slug)
  WHERE kind = 'article' AND slug IS NOT NULL;

-- Backfill: migrate published blog_posts into cms_resources as articles.
-- category is mapped through to keep the existing blog card format tags working.
INSERT INTO public.cms_resources (
  kind, title, description, category, slug, author, image, content,
  is_public, sort_order, published_at, created_at, updated_at, status
)
SELECT
  'article',
  bp.title,
  bp.excerpt,
  COALESCE(bp.category, 'Guides'),
  bp.slug,
  bp.author,
  bp.image,
  bp.content,
  bp.published,
  10,  -- place articles above downloadable files in default ordering
  bp.created_at,
  bp.created_at,
  bp.updated_at,
  CASE WHEN bp.published THEN 'published' ELSE 'draft' END
FROM public.blog_posts bp
ON CONFLICT DO NOTHING;

-- 2. Rewrite the public resources RPC to expose article fields.
-- The public storefront now returns every published resource; downstream code
-- separates kind = 'article' (blog cards) from kind = 'file' (downloads).
DROP FUNCTION IF EXISTS public.get_public_cms_resources();
CREATE OR REPLACE FUNCTION public.get_public_cms_resources()
RETURNS TABLE (
  id uuid,
  kind text,
  title text,
  description text,
  category text,
  file_url text,
  file_type text,
  file_size_label text,
  download_count integer,
  slug text,
  author text,
  image text,
  content jsonb,
  published_at timestamptz,
  sort_order integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.id, r.kind, r.title, r.description, r.category, r.file_url, r.file_type,
    r.file_size_label, COALESCE(r.download_count, 0) AS download_count,
    r.slug, r.author, r.image, r.content, r.published_at, r.sort_order
  FROM public.cms_resources r
  WHERE r.status = 'published'
    AND r.is_public = true
    AND r.published_at <= timezone('utc', now())
    AND (r.expires_at IS NULL OR r.expires_at > timezone('utc', now()))
  ORDER BY COALESCE(r.sort_order, 0), r.created_at;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_cms_resources() TO anon, authenticated, service_role;

COMMIT;
