-- Migration 00066: Update get_public_school_pack and search_public_schools RPCs
-- 1. get_public_school_pack: returns partnership, refused_partnership, and parent_collection_accepted
-- 2. search_public_schools: includes refused partnership schools, strictly sets is_partner = (partnership = 'partner')

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
      'partnership', coalesce(s.partnership, case when s.is_partner is true then 'partner' when s.refused_partnership is true then 'refused_partner' else 'non_partner' end),
      'is_partner', coalesce(s.partnership = 'partner', s.is_partner, false),
      'refused_partnership', coalesce(s.partnership = 'refused_partner', s.refused_partnership, false),
      'is_featured', coalesce(s.feature_status = 'featured', s.is_featured, false),
      'parent_collection_accepted', coalesce(s.parent_collection_accepted, true),
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
  where lower(s.slug) = lower(school_slug)
    and (
      s.publication_status = 'published'
      or (s.publication_status is null and s.published is not false and s.status = 'active')
    )
  limit 1
$$;

GRANT EXECUTE ON FUNCTION public.get_public_school_pack(text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.search_public_schools(
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
security invoker
set search_path = public
as $$
  with visible_schools as (
    select s.*
    from public.schools s
    where s.publication_status = 'published'
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
    (coalesce(s.partnership = 'partner', s.is_partner, false)) as is_partner,
    (coalesce(s.feature_status = 'featured', s.is_featured, false)) as is_featured,
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
    (coalesce(s.feature_status = 'featured', s.is_featured, false)) desc,
    (coalesce(s.partnership = 'partner', s.is_partner, false)) desc,
    s.name asc
  limit least(greatest(result_limit, 1), 24)
  offset greatest(result_offset, 0)
$$;

GRANT EXECUTE ON FUNCTION public.search_public_schools(text, text, text, text, integer, integer) TO anon, authenticated, service_role;
