-- Migration 00082: Restore Pexcover Fields to get_public_school_pack RPC
--
-- Restores required Pexcover item metadata (requires_pexcover, pexco_code, pexco_title,
-- pexco_rate_cents, pexco_rate_active) and pack landed cost attributes to the high-performance
-- get_public_school_pack aggregate RPC.

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
            'items_cost', p.items_cost,
            'total_landed_cost', p.total_landed_cost,
            'margin_rate_used', p.margin_rate_used,
            'pricing_status', p.pricing_status,
            'items', COALESCE(
              (
                SELECT jsonb_agg(
                  jsonb_build_object(
                    'id', i.id,
                    'pack_id', i.pack_id,
                    'product_id', i.product_id,
                    'name', i.name,
                    'quantity', i.quantity,
                    'unit_price', i.unit_price,
                    'icon', i.icon,
                    'description', i.description,
                    'specification', i.specification,
                    'category', i.category,
                    'sku', i.sku,
                    'brand', i.brand,
                    'requires_pexcover', COALESCE(i.requires_pexcover, false),
                    'pexco_code', i.pexco_code,
                    'pexco_title', i.pexco_title,
                    'pexco_rate_cents', i.pexco_rate_cents,
                    'pexco_rate_active', COALESCE(i.pexco_rate_active, false)
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
