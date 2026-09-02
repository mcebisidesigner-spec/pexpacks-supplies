-- Migration 00096: Link public CMS announcements to storefront placements
-- Allows site_header to serve both global_top and hero_banner, ensuring banners created in DB Content CMS link properly to public.

DROP FUNCTION IF EXISTS public.get_public_cms_announcements(text);

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
      OR p_location = 'all'
      OR (p_location = 'site_header' AND a.display_location IN ('global_top', 'hero_banner'))
      OR a.display_location = p_location
    )
  ORDER BY 
    CASE 
      WHEN p_location = 'site_header' AND a.display_location = 'global_top' THEN 1
      WHEN p_location = 'site_header' AND a.display_location = 'hero_banner' THEN 2
      ELSE 3
    END,
    a.updated_at DESC, a.created_at DESC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_cms_announcements(text) TO anon, authenticated, service_role;
