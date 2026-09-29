-- ============================================================================
-- 00134: Enforce school-pack publication readiness
-- ============================================================================
-- Public policy: an incomplete pack is draft/invisible. A pack may be public
-- only when its school, items, products, quantities, and approved price are
-- all ready for ordering.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_pack_for_publication(p_pack_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pack record;
  v_school record;
  v_season record;
  v_active_items integer := 0;
  v_valid_items integer := 0;
  v_invalid_quantity_items integer := 0;
  v_non_public_product_items integer := 0;
  v_invalid_item_price_items integer := 0;
  v_reasons text[] := ARRAY[]::text[];
BEGIN
  SELECT * INTO v_pack
  FROM public.school_packs
  WHERE id = p_pack_id;

  IF v_pack IS NULL THEN
    RETURN jsonb_build_object(
      'is_ready', false,
      'reasons', ARRAY['School pack record does not exist.']::text[]
    );
  END IF;

  SELECT * INTO v_school
  FROM public.schools
  WHERE id = v_pack.school_id;

  IF v_school IS NULL THEN
    v_reasons := array_append(v_reasons, 'Associated school does not exist.');
  ELSIF v_school.status IS DISTINCT FROM 'active'
    OR v_school.published IS NOT TRUE
    OR COALESCE(v_school.publication_status, 'published') IS DISTINCT FROM 'published' THEN
    v_reasons := array_append(v_reasons, 'Associated school must be active and published.');
  END IF;

  IF v_pack.season_id IS NOT NULL THEN
    SELECT * INTO v_season
    FROM public.seasons
    WHERE id = v_pack.season_id;

    IF v_season IS NULL THEN
      v_reasons := array_append(v_reasons, 'Referenced commercial season does not exist.');
    ELSIF v_season.status IN ('archived', 'closed') THEN
      v_reasons := array_append(v_reasons, 'Cannot publish a pack into an archived or closed commercial season.');
    END IF;
  END IF;

  SELECT
    count(*) FILTER (WHERE spi.active IS TRUE),
    count(*) FILTER (
      WHERE spi.active IS TRUE
        AND (spi.pack_quantity IS NULL OR spi.pack_quantity < 1)
    ),
    count(*) FILTER (
      WHERE spi.active IS TRUE
        AND (
          mp.id IS NULL
          OR mp.active IS NOT TRUE
          OR mp.visibility IS DISTINCT FROM 'public'
        )
    ),
    count(*) FILTER (
      WHERE spi.active IS TRUE
        AND COALESCE(
          spi.selling_price_override,
          mp.current_selling_price,
          mp.calculated_selling_price,
          0
        ) <= 0
    ),
    count(*) FILTER (
      WHERE spi.active IS TRUE
        AND spi.pack_quantity IS NOT NULL
        AND spi.pack_quantity >= 1
        AND mp.id IS NOT NULL
        AND mp.active IS TRUE
        AND mp.visibility = 'public'
        AND COALESCE(
          spi.selling_price_override,
          mp.current_selling_price,
          mp.calculated_selling_price,
          0
        ) > 0
    )
  INTO
    v_active_items,
    v_invalid_quantity_items,
    v_non_public_product_items,
    v_invalid_item_price_items,
    v_valid_items
  FROM public.school_pack_items spi
  LEFT JOIN public.master_products mp ON mp.id = spi.product_id
  WHERE spi.pack_id = p_pack_id;

  IF v_active_items = 0 THEN
    v_reasons := array_append(v_reasons, 'Pack must contain at least one active stationery item.');
  END IF;

  IF v_invalid_quantity_items > 0 THEN
    v_reasons := array_append(v_reasons, v_invalid_quantity_items || ' active item(s) have an invalid quantity.');
  END IF;

  IF v_non_public_product_items > 0 THEN
    v_reasons := array_append(v_reasons, v_non_public_product_items || ' active item(s) reference a product that is not active and public.');
  END IF;

  IF v_invalid_item_price_items > 0 THEN
    v_reasons := array_append(v_reasons, v_invalid_item_price_items || ' active item(s) have no positive selling price.');
  END IF;

  IF COALESCE(v_pack.price, 0) <= 0 THEN
    v_reasons := array_append(v_reasons, 'Pack price must be greater than zero.');
  END IF;

  IF COALESCE(v_pack.pricing_status, '') IS DISTINCT FROM 'ready' THEN
    v_reasons := array_append(v_reasons, 'Pack price must have pricing status ready.');
  END IF;

  RETURN jsonb_build_object(
    'is_ready', (COALESCE(array_length(v_reasons, 1), 0) = 0 AND v_valid_items > 0),
    'reasons', v_reasons,
    'pack_id', p_pack_id,
    'active_item_count', v_active_items,
    'valid_item_count', v_valid_items,
    'price', v_pack.price,
    'pricing_status', v_pack.pricing_status
  );
END;
$$;

COMMENT ON FUNCTION public.validate_pack_for_publication(uuid) IS
  'Strict publication guard: active published school, valid active items, public products, positive item prices, and approved pack pricing.';

CREATE OR REPLACE FUNCTION public.publish_school_pack(
  p_pack_id uuid,
  p_user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_validation jsonb;
  v_new_version integer;
BEGIN
  v_validation := public.validate_pack_for_publication(p_pack_id);

  IF (v_validation->>'is_ready')::boolean IS NOT TRUE THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Publication validation failed.',
      'reasons', v_validation->'reasons',
      'validation', v_validation
    );
  END IF;

  UPDATE public.school_packs
  SET
    publication_status = 'published',
    visible = true,
    published_at = timezone('utc'::text, now()),
    published_by = COALESCE(p_user_id, auth.uid()),
    version = COALESCE(version, 0) + 1,
    updated_at = timezone('utc'::text, now())
  WHERE id = p_pack_id
  RETURNING version INTO v_new_version;

  RETURN jsonb_build_object(
    'success', true,
    'pack_id', p_pack_id,
    'version', v_new_version,
    'publication_status', 'published'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.publish_school_pack(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_pack_for_publication(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_school_pack(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.validate_pack_for_publication(uuid) TO service_role;

-- Demote every currently visible/published pack that fails the strict policy.
-- This is intentionally non-destructive: catalogue rows and items remain in
-- the admin database and can be completed and published later.
UPDATE public.school_packs p
SET
  visible = false,
  publication_status = 'draft',
  published_at = NULL,
  published_by = NULL,
  updated_at = timezone('utc'::text, now())
WHERE (p.visible IS TRUE OR p.publication_status = 'published')
  AND COALESCE((public.validate_pack_for_publication(p.id)->>'is_ready')::boolean, false) IS NOT TRUE;

-- Keep one public pack per school/grade while allowing draft copies in admin.
-- The normalization removes common copy suffixes from grade pack slugs.
WITH ranked AS (
  SELECT
    p.id,
    row_number() OVER (
      PARTITION BY
        p.school_id,
        regexp_replace(lower(COALESCE(p.slug, p.title)), '(-pack)?(-[0-9]+)?$', '')
      ORDER BY p.created_at ASC, p.id ASC
    ) AS row_number
  FROM public.school_packs p
  WHERE p.visible IS TRUE
    AND p.publication_status = 'published'
)
UPDATE public.school_packs p
SET
  visible = false,
  publication_status = 'draft',
  published_at = NULL,
  published_by = NULL,
  updated_at = timezone('utc'::text, now())
FROM ranked r
WHERE p.id = r.id
  AND r.row_number > 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_school_packs_one_public_grade
  ON public.school_packs (
    school_id,
    regexp_replace(lower(COALESCE(slug, title)), '(-pack)?(-[0-9]+)?$', '')
  )
  WHERE visible IS TRUE AND publication_status = 'published';

CREATE OR REPLACE FUNCTION public.enforce_school_pack_publication_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_validation jsonb;
BEGIN
  -- Moving a public pack back to draft is always allowed so invalid legacy
  -- rows can be repaired or safely hidden.
  IF NEW.visible IS TRUE OR NEW.publication_status = 'published' THEN
    IF COALESCE(NEW.price, 0) <= 0
      OR COALESCE(NEW.pricing_status, '') IS DISTINCT FROM 'ready' THEN
      RAISE EXCEPTION 'Pack % cannot be published without an approved positive price.', NEW.id
        USING ERRCODE = '23514';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.schools s
      WHERE s.id = NEW.school_id
        AND s.status = 'active'
        AND s.published IS TRUE
        AND COALESCE(s.publication_status, 'published') = 'published'
    ) THEN
      RAISE EXCEPTION 'Pack % cannot be published because its school is not active and published.', NEW.id
        USING ERRCODE = '23514';
    END IF;

    v_validation := public.validate_pack_for_publication(NEW.id);
    IF (v_validation->>'is_ready')::boolean IS NOT TRUE THEN
      RAISE EXCEPTION 'Pack % cannot be published: %', NEW.id, v_validation->'reasons'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_pack_item_publication_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pack_id uuid;
  v_pack record;
  v_validation jsonb;
BEGIN
  FOR v_pack_id IN
    SELECT DISTINCT id
    FROM (VALUES (CASE WHEN TG_OP = 'DELETE' THEN OLD.pack_id ELSE NEW.pack_id END),
                 (CASE WHEN TG_OP = 'UPDATE' THEN OLD.pack_id ELSE NULL END)) AS packs(id)
    WHERE id IS NOT NULL
  LOOP
    SELECT * INTO v_pack FROM public.school_packs WHERE id = v_pack_id;
    IF v_pack.visible IS TRUE OR v_pack.publication_status = 'published' THEN
      v_validation := public.validate_pack_for_publication(v_pack_id);
      IF (v_validation->>'is_ready')::boolean IS NOT TRUE THEN
        RAISE EXCEPTION 'Published pack % cannot lose readiness: %', v_pack_id, v_validation->'reasons'
          USING ERRCODE = '23514';
      END IF;
    END IF;
  END LOOP;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_product_publication_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pack_id uuid;
  v_pack record;
  v_validation jsonb;
BEGIN
  FOR v_pack_id IN
    SELECT DISTINCT spi.pack_id
    FROM public.school_pack_items spi
    WHERE spi.product_id = NEW.id
  LOOP
    SELECT * INTO v_pack FROM public.school_packs WHERE id = v_pack_id;
    IF v_pack.visible IS TRUE OR v_pack.publication_status = 'published' THEN
      v_validation := public.validate_pack_for_publication(v_pack_id);
      IF (v_validation->>'is_ready')::boolean IS NOT TRUE THEN
        RAISE EXCEPTION 'Product % would invalidate published pack %: %', NEW.id, v_pack_id, v_validation->'reasons'
          USING ERRCODE = '23514';
      END IF;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS school_packs_publication_guard ON public.school_packs;
CREATE TRIGGER school_packs_publication_guard
  BEFORE INSERT OR UPDATE ON public.school_packs
  FOR EACH ROW EXECUTE FUNCTION public.enforce_school_pack_publication_guard();

DROP TRIGGER IF EXISTS school_pack_items_publication_guard ON public.school_pack_items;
CREATE TRIGGER school_pack_items_publication_guard
  AFTER INSERT OR UPDATE OR DELETE ON public.school_pack_items
  FOR EACH ROW EXECUTE FUNCTION public.enforce_pack_item_publication_guard();

DROP TRIGGER IF EXISTS master_products_publication_guard ON public.master_products;
CREATE TRIGGER master_products_publication_guard
  AFTER UPDATE OF active, visibility, pricing_status, current_selling_price, calculated_selling_price
  ON public.master_products
  FOR EACH ROW EXECUTE FUNCTION public.enforce_product_publication_guard();

-- The public RPC is now strict; legacy visible=true fallback is removed.
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
          AND p.visible IS TRUE
          AND p.publication_status = 'published'
      ),
      '[]'::jsonb
    )
  )
  FROM public.schools s
  WHERE s.slug = lower(trim(school_slug))
    AND s.status = 'active'
    AND s.published IS TRUE
    AND COALESCE(s.publication_status, 'published') = 'published'
  LIMIT 1
$function$;

GRANT EXECUTE ON FUNCTION public.get_public_school_pack(text) TO anon, authenticated, service_role;

-- Public item reads follow the same strict publication predicates.
CREATE OR REPLACE VIEW public.public_pack_items_view AS
SELECT
  c.id,
  c.pack_id,
  c.product_id,
  c.name,
  c.quantity,
  c.unit_price,
  c.icon,
  c.description,
  c.specification,
  c.category,
  c.sku,
  c.brand,
  c.availability,
  c.substitution_policy,
  c.sort_order,
  c.visible,
  c.source,
  c.requires_pexcover,
  c.pexco_code,
  c.pexco_title,
  c.pexco_rate_cents,
  c.pexco_rate_active
FROM public.canonical_pack_items_view c
JOIN public.school_packs p ON p.id = c.pack_id
JOIN public.schools s ON s.id = p.school_id
WHERE c.visible IS TRUE
  AND p.visible IS TRUE
  AND p.publication_status = 'published'
  AND s.status = 'active'
  AND s.published IS TRUE
  AND COALESCE(s.publication_status, 'published') = 'published';

-- Deployment/CI can call this service-role-only function as a hard preflight.
CREATE OR REPLACE FUNCTION public.assert_public_catalogue_ready()
RETURNS void
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invalid_count bigint;
BEGIN
  SELECT count(*) INTO v_invalid_count
  FROM public.school_packs p
  WHERE p.visible IS TRUE
    AND p.publication_status = 'published'
    AND COALESCE((public.validate_pack_for_publication(p.id)->>'is_ready')::boolean, false) IS NOT TRUE;

  IF v_invalid_count > 0 THEN
    RAISE EXCEPTION 'Publication readiness preflight failed: % published pack(s) violate the publication policy.', v_invalid_count
      USING ERRCODE = '23514';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.assert_public_catalogue_ready() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.assert_public_catalogue_ready() TO service_role;