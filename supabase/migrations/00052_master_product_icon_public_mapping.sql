-- ============================================================================
-- 00052: Master product icon public mapping
-- ============================================================================
-- Purpose:
--   Store item icon selections on canonical master_products and expose them
--   through public/admin pack item views so school pages update when a master
--   product icon changes.
-- ============================================================================

alter table public.master_products
  add column if not exists icon text;

-- Preserve any existing legacy icon choices as the starting canonical icon.
update public.master_products mp
set icon = si.icon
from public.stationery_items si
where mp.icon is null
  and si.icon is not null
  and si.master_product_id = mp.id;

-- Rebuild canonical/public/admin pack item views to source icons from the
-- canonical product first, falling back to legacy linked item icons only for
-- archived rows that have not yet been given a canonical icon.
create or replace view public.canonical_pack_items_view
with (security_invoker = true)
as
select
  spi.id as id,
  spi.pack_id,
  spi.product_id,
  spi.legacy_item_id,
  coalesce(nullif(spi.school_wording, ''), mp.name) as name,
  coalesce(spi.pack_quantity, 1)::integer as quantity,
  coalesce(spi.selling_price_override, mp.current_selling_price, 0)::numeric(12,2) as unit_price,
  coalesce(nullif(mp.icon, ''), nullif(li.icon, ''), 'box')::text as icon,
  coalesce(nullif(spi.school_notes, ''), mp.description) as description,
  coalesce(mp.specification, mp.packaging, mp.unit) as specification,
  mp.category,
  mp.sku,
  mp.brand,
  mp.availability,
  spi.substitution_policy,
  coalesce(spi.sort_order, 0)::integer as sort_order,
  spi.active as visible,
  'canonical'::text as source
from public.school_pack_items spi
join public.master_products mp on mp.id = spi.product_id
left join public.stationery_items li on li.id = spi.legacy_item_id;

create or replace view public.public_pack_items_view
with (security_invoker = true)
as
select c.*
from public.canonical_pack_items_view c
join public.school_packs p on p.id = c.pack_id
left join public.schools s on s.id = p.school_id
where c.visible = true
  and p.visible = true
  and coalesce(s.status, 'active') = 'active'
  and coalesce(s.published, true) = true;

create or replace view public.admin_pack_items_view
with (security_invoker = true)
as
select
  c.*,
  p.title as pack_title,
  p.slug as pack_slug,
  p.school_id,
  s.name as school_name,
  s.slug as school_slug
from public.canonical_pack_items_view c
join public.school_packs p on p.id = c.pack_id
left join public.schools s on s.id = p.school_id;

grant select on public.canonical_pack_items_view to anon, authenticated, service_role;
grant select on public.public_pack_items_view to anon, authenticated, service_role;
grant select on public.admin_pack_items_view to authenticated, service_role;

create or replace view public.pack_subtotals
with (security_invoker = true)
as
select
  p.id as pack_id,
  p.title,
  p.school_id,
  p.price,
  coalesce(sum(c.quantity * c.unit_price) filter (where c.visible), 0)::numeric(10,2) as subtotal,
  count(c.id) filter (where c.visible)::integer as item_count
from public.school_packs p
left join public.canonical_pack_items_view c on c.pack_id = p.id
group by p.id, p.title, p.school_id, p.price;

grant select on public.pack_subtotals to anon, authenticated, service_role;