-- Migration 00086: Harden public pricing privacy contracts
-- ============================================================================
-- Public pages may receive final customer prices and Pexcover selling rates only.
-- Margin rates, pack cost components, supplier costs, and internal Pexcover cost
-- fields must stay server/admin-side.
-- ============================================================================

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

DROP POLICY IF EXISTS "Public read access for active pexco rates" ON public.pexco_rates;
REVOKE SELECT ON public.pexco_rates FROM anon, authenticated;
GRANT SELECT ON public.pexco_rates TO service_role;

REVOKE ALL ON FUNCTION public.calculate_grade_pack_price(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recalculate_grade_pack_price(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recalculate_all_grade_pack_prices() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_grade_pack_price(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.recalculate_grade_pack_price(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.recalculate_all_grade_pack_prices() TO service_role;

GRANT EXECUTE ON FUNCTION public.get_public_school_pack(text) TO anon, authenticated, service_role;
