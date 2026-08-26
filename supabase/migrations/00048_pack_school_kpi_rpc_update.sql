-- Migration 00048: Update get_all_pack_school_groups_json to calculate active packs with items and total stationery items

CREATE OR REPLACE FUNCTION public.get_all_pack_school_groups_json(q text DEFAULT NULL::text, visible_filter text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  with pack_item_counts as (
    select
      p.id as pack_id,
      p.school_id,
      p.visible,
      p.updated_at,
      count(spi.id)::bigint as item_count
    from public.school_packs p
    left join public.school_pack_items spi on spi.pack_id = p.id
    group by p.id, p.school_id, p.visible, p.updated_at
  ),
  school_pack_aggs as (
    select
      s.id as school_id,
      s.name as school_name,
      s.slug as school_slug,
      s.updated_at as school_updated_at,
      s.is_partner,
      s.refused_partnership,
      count(pic.pack_id)::bigint as grade_packs_count,
      count(case when pic.visible and pic.item_count > 0 then 1 end)::bigint as active_packs_with_items_count,
      coalesce(sum(case when pic.visible then pic.item_count else 0 end), 0)::bigint as stationery_items_count,
      greatest(
        coalesce(max(pic.updated_at), s.updated_at),
        coalesce(s.updated_at, max(pic.updated_at))
      ) as last_edited,
      case
        when coalesce(s.refused_partnership, false) then false
        when count(pic.pack_id) > 0 then coalesce(bool_or(pic.visible), true)
        else coalesce(s.is_partner, true)
      end as visible
    from public.schools s
    left join pack_item_counts pic on pic.school_id = s.id
    where (
      coalesce(trim(q), '') = ''
      or s.name ilike '%' || trim(q) || '%'
      or s.slug ilike '%' || trim(q) || '%'
    )
    group by s.id, s.name, s.slug, s.updated_at, s.is_partner, s.refused_partnership
  ),
  visible_filtered as (
    select *
    from school_pack_aggs
    where (
      visible_filter is null
      or visible_filter = ''
      or (visible_filter = 'true' and visible)
      or (visible_filter = 'false' and not visible)
    )
  ),
  totals as (
    select
      count(*)::bigint as total_schools,
      coalesce(sum(grade_packs_count), 0)::bigint as total_grade_packs,
      coalesce(sum(active_packs_with_items_count), 0)::bigint as active_packs_count,
      coalesce(sum(stationery_items_count), 0)::bigint as total_stationery_items
    from visible_filtered
  )
  select jsonb_build_object(
    'total_schools', (select total_schools from totals),
    'total_grade_packs', (select total_grade_packs from totals),
    'active_packs_count', (select active_packs_count from totals),
    'total_stationery_items', (select total_stationery_items from totals),
    'schools', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'school_id', vf.school_id,
            'school_name', vf.school_name,
            'school_slug', vf.school_slug,
            'grade_packs_count', vf.grade_packs_count,
            'last_edited', vf.last_edited,
            'visible', vf.visible
          )
          order by vf.school_name asc
        )
        from visible_filtered vf
      ),
      '[]'::jsonb
    )
  );
$function$;
