-- ============================================================================
-- 00059: Canonical Pack Group Metric Names
-- ============================================================================
-- Replaces legacy-named JSON metric keys with canonical pack item terminology.

CREATE OR REPLACE FUNCTION public.get_all_pack_school_groups_json(
  q text DEFAULT NULL::text,
  visible_filter text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  WITH pack_item_counts AS (
    SELECT
      p.id AS pack_id,
      p.school_id,
      p.visible,
      p.updated_at,
      count(spi.id)::bigint AS item_count
    FROM public.school_packs p
    LEFT JOIN public.school_pack_items spi ON spi.pack_id = p.id
    GROUP BY p.id, p.school_id, p.visible, p.updated_at
  ),
  school_pack_aggs AS (
    SELECT
      s.id AS school_id,
      s.name AS school_name,
      s.slug AS school_slug,
      s.updated_at AS school_updated_at,
      s.is_partner,
      s.refused_partnership,
      count(pic.pack_id)::bigint AS grade_packs_count,
      count(CASE WHEN pic.visible AND pic.item_count > 0 THEN 1 END)::bigint AS active_packs_with_items_count,
      coalesce(sum(CASE WHEN pic.visible THEN pic.item_count ELSE 0 END), 0)::bigint AS pack_items_count,
      greatest(
        coalesce(max(pic.updated_at), s.updated_at),
        coalesce(s.updated_at, max(pic.updated_at))
      ) AS last_edited,
      CASE
        WHEN coalesce(s.refused_partnership, false) THEN false
        WHEN count(pic.pack_id) > 0 THEN coalesce(bool_or(pic.visible), true)
        ELSE coalesce(s.is_partner, true)
      END AS visible
    FROM public.schools s
    LEFT JOIN pack_item_counts pic ON pic.school_id = s.id
    WHERE (
      coalesce(trim(q), '') = ''
      OR s.name ILIKE '%' || trim(q) || '%'
      OR s.slug ILIKE '%' || trim(q) || '%'
    )
    GROUP BY s.id, s.name, s.slug, s.updated_at, s.is_partner, s.refused_partnership
  ),
  visible_filtered AS (
    SELECT *
    FROM school_pack_aggs
    WHERE (
      visible_filter IS NULL
      OR visible_filter = ''
      OR (visible_filter = 'true' AND visible)
      OR (visible_filter = 'false' AND NOT visible)
    )
  ),
  totals AS (
    SELECT
      count(*)::bigint AS total_schools,
      coalesce(sum(grade_packs_count), 0)::bigint AS total_grade_packs,
      coalesce(sum(active_packs_with_items_count), 0)::bigint AS active_packs_count,
      coalesce(sum(pack_items_count), 0)::bigint AS total_pack_items
    FROM visible_filtered
  )
  SELECT jsonb_build_object(
    'total_schools', (SELECT total_schools FROM totals),
    'total_grade_packs', (SELECT total_grade_packs FROM totals),
    'active_packs_count', (SELECT active_packs_count FROM totals),
    'total_pack_items', (SELECT total_pack_items FROM totals),
    'schools', coalesce(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'school_id', vf.school_id,
            'school_name', vf.school_name,
            'school_slug', vf.school_slug,
            'grade_packs_count', vf.grade_packs_count,
            'active_packs_count', vf.active_packs_with_items_count,
            'pack_items_count', vf.pack_items_count,
            'last_edited', vf.last_edited,
            'visible', vf.visible
          )
          ORDER BY vf.school_name ASC
        )
        FROM visible_filtered vf
      ),
      '[]'::jsonb
    )
  );
$function$;