-- Migration 00084: Slim public payloads and add performance smoke helpers
-- ============================================================================
-- Keeps public reads lightweight for serverless deployment:
-- - get_public_school_pack returns only public/customer-safe pack fields.
-- - visibility checks use a small RPC instead of ad hoc view reads.
-- - critical public lookup indexes are present.
-- - service-role-only EXPLAIN helper supports CI/local smoke tests.
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_schools_public_slug_lookup
ON public.schools (slug)
WHERE publication_status = 'published'
   OR (publication_status IS NULL AND published IS NOT FALSE AND status = 'active');

CREATE INDEX IF NOT EXISTS idx_school_packs_public_slug_lookup
ON public.school_packs (slug)
WHERE publication_status = 'published'
   OR (publication_status IS NULL AND visible IS TRUE);

CREATE INDEX IF NOT EXISTS idx_school_pack_items_active_pack_order
ON public.school_pack_items (pack_id, sort_order, id)
WHERE active IS TRUE;

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
      'partnership', COALESCE(s.partnership, CASE WHEN s.is_partner IS TRUE THEN 'partner' WHEN s.refused_partnership IS TRUE THEN 'refused_partner' ELSE 'non_partner' END),
      'refused_partnership', COALESCE(s.partnership = 'refused_partner', s.refused_partnership, false),
      'is_featured', COALESCE(s.feature_status = 'featured', s.is_featured, false),
      'parent_collection_accepted', COALESCE(s.parent_collection_accepted, true),
      'principal', s.principal,
      'custom_badge', s.custom_badge,
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
            'items_cost', p.items_cost,
            'packaging_cost', p.packaging_cost,
            'assembly_cost', p.assembly_cost,
            'freight_cost', p.freight_cost,
            'total_landed_cost', p.total_landed_cost,
            'margin_rate_used', p.margin_rate_used,
            'pricing_status', p.pricing_status,
            'items', COALESCE(
              (
                SELECT jsonb_agg(
                  jsonb_build_object(
                    'id', i.id,
                    'pack_id', i.pack_id,
                    'name', i.name,
                    'quantity', i.quantity,
                    'unit_price', i.unit_price,
                    'icon', i.icon,
                    'description', i.description,
                    'specification', i.specification,
                    'category', i.category,
                    'requires_pexcover', COALESCE(i.requires_pexcover, false),
                    'pexco_code', i.pexco_code,
                    'pexco_rate_cents', i.pexco_rate_cents,
                    'pexco_rate_active', COALESCE(i.pexco_rate_active, false)
                  )
                  ORDER BY i.sort_order, i.name
                )
                FROM public.public_pack_items_view i
                WHERE i.pack_id = p.id
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
  WHERE s.slug = lower(trim(school_slug))
    AND (
      s.publication_status = 'published'
      OR (s.publication_status IS NULL AND s.published IS NOT FALSE AND s.status = 'active')
    )
  LIMIT 1
$function$;

CREATE OR REPLACE FUNCTION public.get_public_school_visibility(school_slugs text[] DEFAULT NULL)
RETURNS TABLE(slug text, parent_collection_accepted boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT
    s.slug,
    COALESCE(s.parent_collection_accepted, true) AS parent_collection_accepted
  FROM public.schools s
  WHERE (
      s.publication_status = 'published'
      OR (s.publication_status IS NULL AND s.published IS NOT FALSE AND s.status = 'active')
    )
    AND (
      school_slugs IS NULL
      OR cardinality(school_slugs) = 0
      OR s.slug = ANY(school_slugs)
    )
  ORDER BY s.slug
$function$;

CREATE OR REPLACE FUNCTION public.explain_public_read_paths(
  school_slug text DEFAULT 'primrose-hill-primary-school',
  search_query text DEFAULT 'primrose'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_plan jsonb;
  v_search_plan jsonb;
BEGIN
  EXECUTE 'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT public.get_public_school_pack($1)'
    USING school_slug
    INTO v_school_plan;

  EXECUTE 'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM public.search_public_schools($1, $2, $3, $4, $5, $6)'
    USING search_query, '', '', '', 12, 0
    INTO v_search_plan;

  RETURN jsonb_build_object(
    'get_public_school_pack', v_school_plan,
    'search_public_schools', v_search_plan
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_school_pack(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_school_visibility(text[]) TO anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.explain_public_read_paths(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.explain_public_read_paths(text, text) TO service_role;