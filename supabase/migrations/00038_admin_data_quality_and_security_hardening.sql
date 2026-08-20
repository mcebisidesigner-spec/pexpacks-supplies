-- ============================================================================
-- 00038: Admin data-quality audit and public policy hardening
-- ============================================================================
-- Keep legacy objects available, but reduce their direct public/admin exposure.
-- Add a count-only audit view for ongoing admin data integrity checks.

-- 1. Public catalogue policies ------------------------------------------------

drop policy if exists "Public read schools" on public.schools;
create policy "Public read schools"
  on public.schools
  for select
  to anon
  using (
    coalesce(status, 'active') = 'active'
    and coalesce(published, true) = true
  );

drop policy if exists "Public read stationery_packs" on public.stationery_packs;
create policy "Public read stationery_packs"
  on public.stationery_packs
  for select
  to anon
  using (
    visible = true
    and (
      school_id is null
      or exists (
        select 1
        from public.schools s
        where s.id = stationery_packs.school_id
          and coalesce(s.status, 'active') = 'active'
          and coalesce(s.published, true) = true
      )
    )
  );

drop policy if exists "Public read stationery_items" on public.stationery_items;
create policy "Public read stationery_items"
  on public.stationery_items
  for select
  to anon
  using (
    visible = true
    and exists (
      select 1
      from public.stationery_packs p
      left join public.schools s on s.id = p.school_id
      where p.id = stationery_items.pack_id
        and p.visible = true
        and (
          p.school_id is null
          or (
            coalesce(s.status, 'active') = 'active'
            and coalesce(s.published, true) = true
          )
        )
    )
  );

-- 2. Settings policies --------------------------------------------------------

drop policy if exists "Staff write app_settings" on public.app_settings;
drop policy if exists "Service role manage app_settings" on public.app_settings;
create policy "Service role manage app_settings"
  on public.app_settings
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Admin full access for system settings" on public.system_settings;
drop policy if exists "Public read for public system settings" on public.system_settings;
drop policy if exists "Staff manage system settings" on public.system_settings;
drop policy if exists "Service role manage system settings" on public.system_settings;

create policy "Public read for public system settings"
  on public.system_settings
  for select
  to anon, authenticated
  using (is_public = true and is_sensitive = false);

create policy "Staff manage system settings"
  on public.system_settings
  for all
  to authenticated
  using (public.has_permission('settings.manage'))
  with check (public.has_permission('settings.manage'));

create policy "Service role manage system settings"
  on public.system_settings
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Admin full access for system settings audit" on public.system_settings_audit;
drop policy if exists "Staff manage system settings audit" on public.system_settings_audit;
drop policy if exists "Service role manage system settings audit" on public.system_settings_audit;

create policy "Staff manage system settings audit"
  on public.system_settings_audit
  for all
  to authenticated
  using (public.has_permission('settings.manage'))
  with check (public.has_permission('settings.manage'));

create policy "Service role manage system settings audit"
  on public.system_settings_audit
  for all
  to service_role
  using (true)
  with check (true);

-- 3. Count-only admin data-quality view --------------------------------------

drop view if exists public.admin_data_quality_issues_view;
create view public.admin_data_quality_issues_view
with (security_invoker = true)
as
select 'schools'::text as area, 'missing_name_or_slug'::text as issue, count(*)::bigint as issue_count
from public.schools
where nullif(trim(name), '') is null or nullif(trim(slug), '') is null

union all
select 'schools', 'duplicate_slug', count(*)::bigint
from (
  select lower(slug)
  from public.schools
  where slug is not null
  group by lower(slug)
  having count(*) > 1
) d

union all
select 'packs', 'missing_title_or_slug', count(*)::bigint
from public.stationery_packs
where nullif(trim(title), '') is null or nullif(trim(slug), '') is null

union all
select 'packs', 'negative_price', count(*)::bigint
from public.stationery_packs
where price < 0

union all
select 'products', 'missing_sku_or_name', count(*)::bigint
from public.master_products
where nullif(trim(sku), '') is null or nullif(trim(name), '') is null

union all
select 'products', 'duplicate_sku', count(*)::bigint
from (
  select upper(sku)
  from public.master_products
  where sku is not null
  group by upper(sku)
  having count(*) > 1
) d

union all
select 'products', 'negative_price', count(*)::bigint
from public.master_products
where current_selling_price < 0 or coalesce(selling_price_override, 0) < 0

union all
select 'pack_composition', 'missing_pack_or_product_reference', count(*)::bigint
from public.school_pack_items spi
left join public.stationery_packs p on p.id = spi.pack_id
left join public.master_products mp on mp.id = spi.product_id
where p.id is null or mp.id is null

union all
select 'pack_composition', 'bad_quantity_or_price', count(*)::bigint
from public.school_pack_items
where pack_quantity <= 0 or coalesce(selling_price_override, 0) < 0

union all
select 'legacy_compatibility', 'legacy_items_not_bridged', count(*)::bigint
from public.stationery_items si
where not exists (
  select 1
  from public.school_pack_items spi
  where spi.legacy_item_id = si.id
)

union all
select 'orders', 'orders_without_order_items', count(*)::bigint
from public.orders o
where not exists (
  select 1
  from public.order_items oi
  where oi.order_id = o.id
)

union all
select 'orders', 'bad_order_item_quantity_or_total', count(*)::bigint
from public.order_items
where quantity <= 0 or unit_selling_price < 0 or line_total < 0;

grant select on public.admin_data_quality_issues_view to authenticated, service_role;

comment on view public.admin_data_quality_issues_view is
  'Count-only operational data quality checks for admin review. Canonical checks use master_products, school_pack_items, and order_items.';
