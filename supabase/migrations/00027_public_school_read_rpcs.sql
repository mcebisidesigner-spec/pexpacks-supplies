-- ===================================================
-- PUBLIC SCHOOL READ RPCS
-- Indexed, bounded reads for search and school packs.
-- ===================================================

create or replace function public.school_search_query(input text)
returns tsquery
language sql
immutable
set search_path = public
as $$
  select to_tsquery(
    'english',
    coalesce(
      nullif(
        string_agg(quote_literal(token) || ':*', ' & '),
        ''
      ),
      quote_literal('__no_school_search_match__')
    )
  )
  from regexp_split_to_table(lower(trim(coalesce(input, ''))), E'\\s+') as token
  where token ~ '[a-z0-9]'
$$;

create or replace function public.search_public_schools(
  search_query text default '',
  grade_filter text default '',
  phase_filter text default '',
  region_filter text default '',
  result_limit integer default 12,
  result_offset integer default 0
)
returns table (
  id uuid,
  name text,
  slug text,
  city text,
  district text,
  province text,
  logo text,
  is_partner boolean,
  is_featured boolean,
  lowest_price numeric,
  grades jsonb,
  custom_badge text,
  total_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with visible_schools as (
    select s.*
    from public.schools s
    where s.status = 'active'
      and s.published is not false
      and (
        nullif(trim(search_query), '') is null
        or s.search_vector @@ public.school_search_query(search_query)
      )
      and (
        nullif(trim(grade_filter), '') is null
        or exists (
          select 1
          from jsonb_array_elements(coalesce(s.grades, '[]'::jsonb)) grade
          where lower(grade ->> 'grade') = lower(trim(grade_filter))
        )
      )
      and (
        nullif(trim(region_filter), '') is null
        or lower(coalesce(s.city, '')) = lower(trim(region_filter))
        or lower(coalesce(s.province, '')) = lower(trim(region_filter))
        or lower(coalesce(s.district, '')) = lower(trim(region_filter))
      )
      and (
        nullif(trim(phase_filter), '') is null
        or (
          phase_filter = 'pre-schools'
          and lower(s.name) ~ '(creche|pre-school|preschool|pre school|nursery|playschool|play school|early childhood|kindergarten|ecd)'
        )
        or (
          phase_filter = 'primary-schools'
          and exists (
            select 1
            from jsonb_array_elements(coalesce(s.grades, '[]'::jsonb)) grade
            where lower(grade ->> 'grade') in (
              'grade r', 'grade 1', 'grade 2', 'grade 3',
              'grade 4', 'grade 5', 'grade 6', 'grade 7'
            )
          )
        )
        or (
          phase_filter = 'high-schools'
          and exists (
            select 1
            from jsonb_array_elements(coalesce(s.grades, '[]'::jsonb)) grade
            where lower(grade ->> 'grade') in (
              'grade 8', 'grade 9', 'grade 10', 'grade 11', 'grade 12'
            )
          )
        )
      )
  )
  select
    s.id,
    s.name,
    s.slug,
    s.city,
    s.district,
    s.province,
    s.logo,
    s.is_partner,
    s.is_featured,
    s.lowest_price,
    coalesce(s.grades, '[]'::jsonb),
    s.custom_badge,
    count(*) over () as total_count
  from visible_schools s
  order by
    case
      when nullif(trim(search_query), '') is null then 0
      else ts_rank_cd(s.search_vector, public.school_search_query(search_query))
    end desc,
    s.is_featured desc,
    s.is_partner desc,
    s.name asc
  limit least(greatest(result_limit, 1), 24)
  offset greatest(result_offset, 0)
$$;

create or replace function public.get_featured_public_schools(
  result_limit integer default 4
)
returns table (
  id uuid,
  name text,
  slug text,
  city text,
  district text,
  province text,
  logo text,
  is_partner boolean,
  is_featured boolean,
  lowest_price numeric,
  grades jsonb,
  custom_badge text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    s.id,
    s.name,
    s.slug,
    s.city,
    s.district,
    s.province,
    s.logo,
    s.is_partner,
    s.is_featured,
    s.lowest_price,
    coalesce(s.grades, '[]'::jsonb),
    s.custom_badge
  from public.schools s
  where s.status = 'active'
    and s.published is not false
  order by s.is_featured desc, s.is_partner desc, s.name asc
  limit least(greatest(result_limit, 1), 12)
$$;

create or replace function public.get_public_school_pack(school_slug text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'school', jsonb_build_object(
      'id', s.id,
      'name', s.name,
      'slug', s.slug,
      'city', s.city,
      'district', s.district,
      'province', s.province,
      'logo', s.logo,
      'is_partner', s.is_partner
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
                from public.stationery_items i
                where i.pack_id = p.id and i.visible = true
              ),
              '[]'::jsonb
            )
          )
          order by p.sort_order, p.title
        )
        from public.stationery_packs p
        where (p.school_id = s.id or p.slug ilike s.slug || '-%')
          and p.visible = true
      ),
      '[]'::jsonb
    )
  )
  from public.schools s
  where s.slug = school_slug
    and s.status = 'active'
    and s.published is not false
  limit 1
$$;

grant execute on function public.school_search_query(text) to anon, authenticated, service_role;
grant execute on function public.search_public_schools(text, text, text, text, integer, integer) to anon, authenticated, service_role;
grant execute on function public.get_featured_public_schools(integer) to anon, authenticated, service_role;
grant execute on function public.get_public_school_pack(text) to anon, authenticated, service_role;
