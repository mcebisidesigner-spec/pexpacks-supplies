-- ============================================================================
-- 00062: Public Publication State Model & Readiness Validation Architecture
-- ============================================================================
-- Purpose:
--   1. Implements explicit public publication lifecycles for Schools and School Packs.
--   2. Adds canonical status columns (publication_status, directory_status, stationery_list_status).
--   3. Adds pack publication metadata (published_at, published_by, version).
--   4. Performs non-destructive backfill from existing boolean flags.
--   5. Provides server-side readiness validation and atomic publishing RPC.
--   6. Updates public read RPCs to respect publication_status = 'published'.
-- ============================================================================

-- 1. Extend Schools Schema ---------------------------------------------------

ALTER TABLE public.schools 
  ADD COLUMN IF NOT EXISTS publication_status varchar(32) DEFAULT 'published' 
    CHECK (publication_status IN ('draft', 'ready_for_review', 'published', 'archived')),
  ADD COLUMN IF NOT EXISTS directory_status varchar(32) DEFAULT 'listed'
    CHECK (directory_status IN ('listed', 'hidden', 'archived')),
  ADD COLUMN IF NOT EXISTS stationery_list_status varchar(32) DEFAULT 'verified'
    CHECK (stationery_list_status IN ('not_received', 'received', 'being_digitised', 'verified'));

-- 2. Extend School Packs Schema ----------------------------------------------

ALTER TABLE public.school_packs
  ADD COLUMN IF NOT EXISTS publication_status varchar(32) DEFAULT 'published'
    CHECK (publication_status IN ('draft', 'ready_for_review', 'published', 'archived')),
  ADD COLUMN IF NOT EXISTS published_at timestamptz DEFAULT timezone('utc'::text, now()),
  ADD COLUMN IF NOT EXISTS published_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS version integer DEFAULT 1 CHECK (version >= 1);

-- 3. Non-Destructive Data Backfill -------------------------------------------

-- Backfill Schools
UPDATE public.schools
SET 
  publication_status = CASE 
    WHEN published IS FALSE THEN 'draft'
    ELSE 'published'
  END,
  directory_status = 'listed',
  stationery_list_status = CASE
    WHEN refused_partnership IS TRUE THEN 'not_received'
    ELSE 'verified'
  END
WHERE publication_status IS NULL OR publication_status = 'published';

-- Backfill School Packs
UPDATE public.school_packs
SET 
  publication_status = CASE 
    WHEN visible IS FALSE THEN 'draft'
    ELSE 'published'
  END,
  version = coalesce(list_version, 1),
  published_at = coalesce(updated_at, created_at, now())
WHERE publication_status IS NULL OR publication_status = 'published';

-- 4. Publication Performance Indexes -----------------------------------------

CREATE INDEX IF NOT EXISTS idx_schools_publication_status 
  ON public.schools(publication_status);

CREATE INDEX IF NOT EXISTS idx_school_packs_publication_status 
  ON public.school_packs(publication_status, season_id);

CREATE INDEX IF NOT EXISTS idx_school_packs_school_pub 
  ON public.school_packs(school_id, publication_status);

-- 5. Pack Publication Readiness Validation Function --------------------------

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
  v_item_count integer := 0;
  v_unpriced_count integer := 0;
  v_reasons text[] := ARRAY[]::text[];
BEGIN
  -- 1. Verify Pack Exists
  SELECT * INTO v_pack FROM public.school_packs WHERE id = p_pack_id;
  IF v_pack IS NULL THEN
    RETURN jsonb_build_object(
      'is_ready', false,
      'reasons', ARRAY['School pack record does not exist.']
    );
  END IF;

  -- 2. Verify Associated School
  IF v_pack.school_id IS NOT NULL THEN
    SELECT * INTO v_school FROM public.schools WHERE id = v_pack.school_id;
    IF v_school IS NULL THEN
      v_reasons := array_append(v_reasons, 'Referenced school not found.');
    ELSIF v_school.publication_status NOT IN ('published', 'ready_for_review') THEN
      v_reasons := array_append(v_reasons, 'Associated school is not currently published or ready for review.');
    END IF;
  END IF;

  -- 3. Verify Associated Season (if scoped)
  IF v_pack.season_id IS NOT NULL THEN
    SELECT * INTO v_season FROM public.seasons WHERE id = v_pack.season_id;
    IF v_season IS NULL THEN
      v_reasons := array_append(v_reasons, 'Referenced commercial season does not exist.');
    ELSIF v_season.status = 'archived' OR v_season.status = 'closed' THEN
      v_reasons := array_append(v_reasons, 'Cannot publish a pack into an archived or closed commercial season.');
    END IF;
  END IF;

  -- 4. Verify Items Count and Pricing
  SELECT 
    count(*),
    count(*) FILTER (WHERE coalesce(unit_price, 0) < 0)
  INTO v_item_count, v_unpriced_count
  FROM public.school_pack_items
  WHERE pack_id = p_pack_id;

  IF v_item_count = 0 THEN
    -- Also check legacy/view table just in case
    SELECT count(*) INTO v_item_count FROM public.public_pack_items_view WHERE pack_id = p_pack_id;
  END IF;

  IF v_item_count = 0 THEN
    v_reasons := array_append(v_reasons, 'Pack must contain at least 1 stationery item before publishing.');
  END IF;

  IF v_unpriced_count > 0 THEN
    v_reasons := array_append(v_reasons, v_unpriced_count || ' item(s) carry invalid negative unit pricing.');
  END IF;

  IF v_pack.price < 0 THEN
    v_reasons := array_append(v_reasons, 'Pack total price cannot be negative.');
  END IF;

  RETURN jsonb_build_object(
    'is_ready', (coalesce(array_length(v_reasons, 1), 0) = 0),
    'reasons', v_reasons,
    'pack_id', p_pack_id,
    'item_count', v_item_count,
    'price', v_pack.price
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_pack_for_publication(uuid) TO authenticated, service_role;

-- 6. Atomic Pack Publishing RPC ----------------------------------------------

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
  -- Perform deterministic readiness validation
  v_validation := public.validate_pack_for_publication(p_pack_id);

  IF (v_validation->>'is_ready')::boolean IS NOT TRUE THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Publication validation failed.',
      'reasons', v_validation->'reasons'
    );
  END IF;

  -- Atomic transition to published
  UPDATE public.school_packs
  SET 
    publication_status = 'published',
    visible = true,
    published_at = timezone('utc'::text, now()),
    published_by = coalesce(p_user_id, auth.uid()),
    version = coalesce(version, 0) + 1,
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

GRANT EXECUTE ON FUNCTION public.publish_school_pack(uuid, uuid) TO authenticated, service_role;

-- 7. Update Public School Pack RPC to Respect Publication Status -------------

CREATE OR REPLACE FUNCTION public.get_public_school_pack(school_slug text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select jsonb_build_object(
    'school', jsonb_build_object(
      'id', s.id,
      'name', s.name,
      'slug', s.slug,
      'city', s.city,
      'district', s.district,
      'province', s.province,
      'logo', s.logo,
      'is_partner', coalesce(s.is_partner, false),
      'is_featured', coalesce(s.is_featured, false),
      'principal', s.principal,
      'custom_badge', s.custom_badge,
      'publication_status', coalesce(s.publication_status, 'published'),
      'stationery_list_status', coalesce(s.stationery_list_status, 'verified')
    ),
    'packs', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'title', p.title,
            'slug', p.slug,
            'price', p.price,
            'description', p.description,
            'stock', p.stock,
            'sort_order', p.sort_order,
            'publication_status', coalesce(p.publication_status, 'published'),
            'version', coalesce(p.version, 1),
            'items', coalesce(
              (
                select jsonb_agg(
                  jsonb_build_object(
                    'name', i.name,
                    'quantity', i.quantity,
                    'unit_price', i.unit_price,
                    'icon', i.icon,
                    'description', i.description,
                    'specification', i.specification
                  )
                  order by i.sort_order, i.name
                )
                from public.public_pack_items_view i
                where i.pack_id = p.id
              ),
              '[]'::jsonb
            )
          )
          order by p.sort_order, p.title
        )
        from public.school_packs p
        where (p.school_id = s.id or p.slug ilike s.slug || '-%')
          and (
            p.publication_status = 'published' 
            or (p.publication_status is null and p.visible is true)
          )
      ),
      '[]'::jsonb
    )
  )
  from public.schools s
  where s.slug = school_slug
    and (
      s.publication_status = 'published'
      or (s.publication_status is null and s.published is not false and s.status = 'active')
    )
  limit 1
$$;

GRANT EXECUTE ON FUNCTION public.get_public_school_pack(text) TO anon, authenticated, service_role;
