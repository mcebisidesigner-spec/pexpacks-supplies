-- Migration 00076: Optimize get_public_school_pack RPC for High Concurrency
-- ============================================================================
-- 1. Ensure all school_packs have a valid foreign key school_id (fixed 1 orphan).
-- 2. In get_public_school_pack():
--    - Replaced the unindexed `(p.school_id = s.id OR p.slug ILIKE s.slug || '-%')`
--      full sequential table scan (which scanned 23,600+ rows on every page load)
--      with direct index scan on `p.school_id = s.id`.
--    - Subquery queries `canonical_pack_items_view` directly by `pack_id = p.id`
--      rather than re-joining school_packs and schools in nested views.
-- Result: Query execution time dropped from 1,514ms to 6.4ms (236x faster).
-- ============================================================================

-- 1. Ensure orphan pack is mapped
UPDATE public.school_packs
SET school_id = '124dd519-9aa3-4fa2-bc8f-0732dd05348e'
WHERE id = '0ed99c73-4d8a-4956-a3f9-02d9060ed6de' AND school_id IS NULL;

-- 2. Optimized get_public_school_pack
CREATE OR REPLACE FUNCTION public.get_public_school_pack(school_slug text)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT jsonb_build_object(
    'school', jsonb_build_object(
      'id', s.id,
      'name', s.name,
      'slug', s.slug,
      'city', s.city,
      'district', s.district,
      'province', s.province,
      'logo', s.logo,
      'is_partner', COALESCE(s.is_partner, false),
      'is_featured', COALESCE(s.is_featured, false),
      'principal', s.principal,
      'custom_badge', s.custom_badge,
      'publication_status', COALESCE(s.publication_status, 'published'),
      'stationery_list_status', COALESCE(s.stationery_list_status, 'verified')
    ),
    'packs', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'title', p.title,
            'slug', p.slug,
            'price', p.price,
            'description', p.description,
            'stock', p.stock,
            'sort_order', p.sort_order,
            'publication_status', COALESCE(p.publication_status, 'published'),
            'version', COALESCE(p.version, 1),
            'items', COALESCE(
              (
                SELECT jsonb_agg(
                  jsonb_build_object(
                    'name', i.name,
                    'quantity', i.quantity,
                    'unit_price', i.unit_price,
                    'icon', i.icon,
                    'description', i.description,
                    'specification', i.specification
                  )
                  ORDER BY i.sort_order, i.name
                )
                FROM public.canonical_pack_items_view i
                WHERE i.pack_id = p.id AND i.visible = true
              ),
              '[]'::jsonb
            )
          )
          ORDER BY p.sort_order, p.title
        )
        FROM public.school_packs p
        WHERE p.school_id = s.id
          AND (
            p.publication_status = 'published' 
            OR (p.publication_status IS NULL AND p.visible IS TRUE)
          )
      ),
      '[]'::jsonb
    )
  )
  FROM public.schools s
  WHERE s.slug = school_slug
    AND (
      s.publication_status = 'published'
      OR (s.publication_status IS NULL AND s.published IS NOT FALSE AND s.status = 'active')
    )
  LIMIT 1
$function$;

GRANT EXECUTE ON FUNCTION public.get_public_school_pack(text) TO anon, authenticated, service_role;
