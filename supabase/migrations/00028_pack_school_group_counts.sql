-- Keep the grouped admin pack count aligned with each school's pack page.
-- Pack rows count even when they do not have any stationery item rows.

create or replace function public.get_admin_pack_school_groups(
  q text default null,
  visible_filter text default null,
  page_size integer default 20,
  page_number integer default 1
)
returns table (
  school_id uuid,
  school_name text,
  school_slug text,
  grade_packs_count bigint,
  last_edited timestamptz,
  visible boolean,
  total_schools bigint,
  total_grade_packs bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with filtered as (
    select
      s.id as school_id,
      s.name as school_name,
      s.slug as school_slug,
      count(p.id)::bigint as grade_packs_count,
      greatest(
        coalesce(max(p.updated_at), s.updated_at),
        coalesce(s.updated_at, max(p.updated_at))
      ) as last_edited,
      bool_or(coalesce(p.visible, false)) as visible
    from public.schools s
    join public.stationery_packs p on p.school_id = s.id
    where (
      coalesce(trim(q), '') = ''
      or s.name ilike '%' || trim(q) || '%'
      or s.slug ilike '%' || trim(q) || '%'
    )
    group by s.id, s.name, s.slug, s.updated_at
  ),
  visible_filtered as (
    select *
    from filtered
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
      coalesce(sum(grade_packs_count), 0)::bigint as total_grade_packs
    from visible_filtered
  )
  select
    vf.school_id,
    vf.school_name,
    vf.school_slug,
    vf.grade_packs_count,
    vf.last_edited,
    vf.visible,
    totals.total_schools,
    totals.total_grade_packs
  from visible_filtered vf
  cross join totals
  order by vf.school_name asc
  limit greatest(1, least(coalesce(page_size, 20), 50))
  offset greatest(0, coalesce(page_number, 1) - 1)
    * greatest(1, least(coalesce(page_size, 20), 50));
$$;
