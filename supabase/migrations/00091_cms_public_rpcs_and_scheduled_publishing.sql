-- Migration 00091: CMS public RPCs and scheduled publishing
-- ============================================================================
-- Public web pages read slim scheduled CMS rows through RPCs only. Direct CMS
-- table reads are reserved for authenticated users with content.view, and
-- writes remain limited to content.manage.
-- ============================================================================

ALTER TABLE public.cms_announcements
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS published_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_by uuid;

ALTER TABLE public.cms_faqs
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS published_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_by uuid;

ALTER TABLE public.cms_testimonials
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS published_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  ADD COLUMN IF NOT EXISTS updated_by uuid;

ALTER TABLE public.cms_resources
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS published_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_by uuid;

ALTER TABLE public.cms_announcements DROP CONSTRAINT IF EXISTS cms_announcements_status_check;
ALTER TABLE public.cms_announcements
  ADD CONSTRAINT cms_announcements_status_check CHECK (status IN ('draft', 'published', 'archived'));

ALTER TABLE public.cms_faqs DROP CONSTRAINT IF EXISTS cms_faqs_status_check;
ALTER TABLE public.cms_faqs
  ADD CONSTRAINT cms_faqs_status_check CHECK (status IN ('draft', 'published', 'archived'));

ALTER TABLE public.cms_testimonials DROP CONSTRAINT IF EXISTS cms_testimonials_status_check;
ALTER TABLE public.cms_testimonials
  ADD CONSTRAINT cms_testimonials_status_check CHECK (status IN ('draft', 'published', 'archived'));

ALTER TABLE public.cms_resources DROP CONSTRAINT IF EXISTS cms_resources_status_check;
ALTER TABLE public.cms_resources
  ADD CONSTRAINT cms_resources_status_check CHECK (status IN ('draft', 'published', 'archived'));

UPDATE public.cms_announcements
SET status = CASE WHEN is_active THEN 'published' ELSE 'draft' END,
    published_at = COALESCE(published_at, created_at, timezone('utc', now())),
    updated_at = COALESCE(updated_at, timezone('utc', now()));

UPDATE public.cms_faqs
SET status = CASE WHEN is_published THEN 'published' ELSE 'draft' END,
    published_at = COALESCE(published_at, created_at, timezone('utc', now())),
    updated_at = COALESCE(updated_at, timezone('utc', now()));

UPDATE public.cms_testimonials
SET status = CASE WHEN is_featured THEN 'published' ELSE 'draft' END,
    published_at = COALESCE(published_at, created_at, timezone('utc', now())),
    updated_at = COALESCE(updated_at, created_at, timezone('utc', now()));

UPDATE public.cms_resources
SET status = CASE WHEN is_public THEN 'published' ELSE 'draft' END,
    published_at = COALESCE(published_at, created_at, timezone('utc', now())),
    updated_at = COALESCE(updated_at, timezone('utc', now()));

DROP INDEX IF EXISTS idx_cms_announcements_active;
DROP INDEX IF EXISTS idx_cms_faqs_published;
DROP INDEX IF EXISTS idx_cms_testimonials_featured;
DROP INDEX IF EXISTS idx_cms_resources_public;
DROP INDEX IF EXISTS idx_cms_announcements_public_schedule;
DROP INDEX IF EXISTS idx_cms_faqs_public_schedule;
DROP INDEX IF EXISTS idx_cms_testimonials_public_schedule;
DROP INDEX IF EXISTS idx_cms_resources_public_schedule;
DROP INDEX IF EXISTS idx_cms_announcements_one_active_global_top;
DROP INDEX IF EXISTS idx_cms_announcements_one_active_schools_page;

CREATE INDEX idx_cms_announcements_public_schedule
  ON public.cms_announcements (display_location, published_at DESC, updated_at DESC)
  WHERE status = 'published' AND is_active = true;

CREATE INDEX idx_cms_faqs_public_schedule
  ON public.cms_faqs (category, sort_order, created_at)
  WHERE status = 'published' AND is_published = true;

CREATE INDEX idx_cms_testimonials_public_schedule
  ON public.cms_testimonials (sort_order, created_at)
  WHERE status = 'published' AND is_featured = true;

CREATE INDEX idx_cms_resources_public_schedule
  ON public.cms_resources (category, sort_order, created_at)
  WHERE status = 'published' AND is_public = true;

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY display_location
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id
    ) AS rn
  FROM public.cms_announcements
  WHERE display_location IN ('global_top', 'schools_page')
    AND is_active = true
    AND status = 'published'
)
UPDATE public.cms_announcements a
SET is_active = false,
    status = 'draft',
    updated_at = timezone('utc', now())
FROM ranked r
WHERE a.id = r.id
  AND r.rn > 1;
CREATE UNIQUE INDEX idx_cms_announcements_one_active_global_top
  ON public.cms_announcements (display_location)
  WHERE display_location = 'global_top' AND is_active = true AND status = 'published';

CREATE UNIQUE INDEX idx_cms_announcements_one_active_schools_page
  ON public.cms_announcements (display_location)
  WHERE display_location = 'schools_page' AND is_active = true AND status = 'published';

DROP POLICY IF EXISTS "Public read active CMS content" ON public.cms_announcements;
DROP POLICY IF EXISTS "Public read published FAQs" ON public.cms_faqs;
DROP POLICY IF EXISTS "Public read featured testimonials" ON public.cms_testimonials;
DROP POLICY IF EXISTS "Public read active resources" ON public.cms_resources;
DROP POLICY IF EXISTS "CMS viewers read announcements" ON public.cms_announcements;
DROP POLICY IF EXISTS "CMS viewers read FAQs" ON public.cms_faqs;
DROP POLICY IF EXISTS "CMS viewers read testimonials" ON public.cms_testimonials;
DROP POLICY IF EXISTS "CMS viewers read resources" ON public.cms_resources;

CREATE POLICY "CMS viewers read announcements"
  ON public.cms_announcements
  FOR SELECT
  TO authenticated
  USING (public.has_permission('content.view'));

CREATE POLICY "CMS viewers read FAQs"
  ON public.cms_faqs
  FOR SELECT
  TO authenticated
  USING (public.has_permission('content.view'));

CREATE POLICY "CMS viewers read testimonials"
  ON public.cms_testimonials
  FOR SELECT
  TO authenticated
  USING (public.has_permission('content.view'));

CREATE POLICY "CMS viewers read resources"
  ON public.cms_resources
  FOR SELECT
  TO authenticated
  USING (public.has_permission('content.view'));

CREATE OR REPLACE FUNCTION public.get_public_cms_announcements(p_location text DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  badge_text text,
  message text,
  link_url text,
  link_label text,
  display_location text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.id, a.badge_text, a.message, a.link_url, a.link_label, a.display_location
  FROM public.cms_announcements a
  WHERE a.status = 'published'
    AND a.is_active = true
    AND a.published_at <= timezone('utc', now())
    AND (a.expires_at IS NULL OR a.expires_at > timezone('utc', now()))
    AND (
      p_location IS NULL
      OR (p_location = 'site_header' AND a.display_location IN ('global_top', 'hero_banner'))
      OR a.display_location = p_location
    )
  ORDER BY a.updated_at DESC, a.created_at DESC
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_public_cms_faqs()
RETURNS TABLE (
  id uuid,
  category text,
  question text,
  answer text,
  sort_order integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.id, f.category, f.question, f.answer, COALESCE(f.sort_order, 0) AS sort_order
  FROM public.cms_faqs f
  WHERE f.status = 'published'
    AND f.is_published = true
    AND f.published_at <= timezone('utc', now())
    AND (f.expires_at IS NULL OR f.expires_at > timezone('utc', now()))
  ORDER BY COALESCE(f.sort_order, 0), f.created_at;
$$;

CREATE OR REPLACE FUNCTION public.get_public_cms_testimonials()
RETURNS TABLE (
  id uuid,
  author_name text,
  author_role text,
  quote text,
  rating integer,
  avatar_url text,
  school_id uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.id, t.author_name, t.author_role, t.quote, t.rating, t.avatar_url, t.school_id
  FROM public.cms_testimonials t
  WHERE t.status = 'published'
    AND t.is_featured = true
    AND t.published_at <= timezone('utc', now())
    AND (t.expires_at IS NULL OR t.expires_at > timezone('utc', now()))
  ORDER BY COALESCE(t.sort_order, 0), t.created_at;
$$;

CREATE OR REPLACE FUNCTION public.get_public_cms_resources()
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  category text,
  file_url text,
  file_type text,
  file_size_label text,
  download_count integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id, r.title, r.description, r.category, r.file_url, r.file_type, r.file_size_label, COALESCE(r.download_count, 0) AS download_count
  FROM public.cms_resources r
  WHERE r.status = 'published'
    AND r.is_public = true
    AND r.published_at <= timezone('utc', now())
    AND (r.expires_at IS NULL OR r.expires_at > timezone('utc', now()))
  ORDER BY COALESCE(r.sort_order, 0), r.created_at;
$$;

REVOKE SELECT ON public.cms_announcements FROM anon;
REVOKE SELECT ON public.cms_faqs FROM anon;
REVOKE SELECT ON public.cms_testimonials FROM anon;
REVOKE SELECT ON public.cms_resources FROM anon;

GRANT EXECUTE ON FUNCTION public.get_public_cms_announcements(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_cms_faqs() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_cms_testimonials() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_cms_resources() TO anon, authenticated, service_role;