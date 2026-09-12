-- Capture reviewed remote compatibility behavior without importing broad grants
-- or unrelated schema changes.
BEGIN;

ALTER TABLE public.cms_testimonials
  ADD COLUMN IF NOT EXISTS school_name text;

DROP FUNCTION IF EXISTS public.get_public_cms_testimonials();
CREATE FUNCTION public.get_public_cms_testimonials()
RETURNS TABLE (
  id uuid,
  author_name text,
  author_role text,
  school_name text,
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
  SELECT
    t.id,
    t.author_name,
    t.author_role,
    COALESCE(t.school_name, s.name) AS school_name,
    t.quote,
    t.rating,
    t.avatar_url,
    t.school_id
  FROM public.cms_testimonials t
  LEFT JOIN public.schools s ON s.id = t.school_id
  WHERE t.status = 'published'
    AND t.is_featured = true
    AND t.published_at <= timezone('utc', now())
    AND (t.expires_at IS NULL OR t.expires_at > timezone('utc', now()))
  ORDER BY COALESCE(t.sort_order, 0), t.created_at;
$$;
REVOKE ALL ON FUNCTION public.get_public_cms_testimonials() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_cms_testimonials() TO service_role;

-- The legacy grouping RPC depends on deleted stationery_packs. The admin UI
-- no longer calls it, so remove the stale remote-only entry point instead of
-- reintroducing legacy schema dependencies.
DROP FUNCTION IF EXISTS public.get_admin_pack_school_groups(text, text, integer, integer);
COMMIT;