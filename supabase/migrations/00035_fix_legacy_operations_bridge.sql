-- ============================================================================
-- 00035: Fix legacy ↔ operations data bridge gaps
-- ============================================================================
-- Gap 1: Auto-populate stationery_items.master_product_id on INSERT/UPDATE
-- Gap 2: Keep school_pack_items in sync when items are created/updated/deleted
-- Gap 3: Sync school_pack_items.selling_price_override when unit_price changes
-- ============================================================================
-- stationery_items columns: id, pack_id, name, description, quantity, unit_price,
--   image, visible, sort_order, created_by, created_at, updated_at, master_product_id
-- school_pack_items columns: id, pack_id, product_id, legacy_item_id (unique),
--   pack_quantity, school_wording, prescribed_brand, substitution_policy,
--   school_notes, selling_price_override, sort_order, active, created_at, updated_at
-- ============================================================================

-- ─── Gap 1: Auto-link new stationery_items to master_products ──────────────

create or replace function public.fn_auto_link_master_product()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.master_product_id is null then
    select p.id into new.master_product_id
    from public.master_products p
    where lower(trim(p.name)) = lower(trim(new.name))
    limit 1;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_auto_link_master_product on public.stationery_items;
create trigger trg_auto_link_master_product
  before insert or update of name
  on public.stationery_items
  for each row
  execute function public.fn_auto_link_master_product();

-- ─── Gap 2: Sync school_pack_items on item INSERT ──────────────────────────

create or replace function public.fn_sync_school_pack_item_on_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.master_product_id is not null and new.pack_id is not null then
    insert into public.school_pack_items (
      pack_id, product_id, legacy_item_id, pack_quantity,
      school_wording, prescribed_brand, substitution_policy, school_notes
    ) values (
      new.pack_id, new.master_product_id, new.id, new.quantity,
      new.name, null, 'allowed', null
    )
    on conflict (pack_id, product_id, school_wording) do update set
      legacy_item_id = excluded.legacy_item_id,
      pack_quantity = excluded.pack_quantity;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_school_pack_item_insert on public.stationery_items;
create trigger trg_sync_school_pack_item_insert
  after insert
  on public.stationery_items
  for each row
  execute function public.fn_sync_school_pack_item_on_insert();

-- ─── Gap 2 cont: Sync school_pack_items on item UPDATE ─────────────────────

create or replace function public.fn_sync_school_pack_item_on_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.master_product_id is not null then
    update public.school_pack_items set
      pack_quantity = new.quantity,
      school_wording = new.name,
      product_id = coalesce(new.master_product_id, old.master_product_id),
      selling_price_override = new.unit_price
    where legacy_item_id = new.id;
  end if;

  if new.master_product_id is distinct from old.master_product_id and new.master_product_id is not null then
    update public.school_pack_items set
      product_id = new.master_product_id
    where legacy_item_id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_sync_school_pack_item_update on public.stationery_items;
create trigger trg_sync_school_pack_item_update
  after update of name, quantity, unit_price, master_product_id
  on public.stationery_items
  for each row
  execute function public.fn_sync_school_pack_item_on_update();

-- ─── Gap 2 cont: Sync school_pack_items on item DELETE ─────────────────────

create or replace function public.fn_sync_school_pack_item_on_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.school_pack_items
  where legacy_item_id = old.id;
  return old;
end;
$$;

drop trigger if exists trg_sync_school_pack_item_delete on public.stationery_items;
create trigger trg_sync_school_pack_item_delete
  after delete
  on public.stationery_items
  for each row
  execute function public.fn_sync_school_pack_item_on_delete();

-- ─── Gap 3: Backfill any existing orphaned master_product_id values ────────

update public.stationery_items i
set master_product_id = p.id
from public.master_products p
where i.master_product_id is null
  and lower(trim(i.name)) = lower(trim(p.name));

insert into public.school_pack_items (
  pack_id, product_id, legacy_item_id, pack_quantity,
  school_wording, prescribed_brand, substitution_policy, school_notes
)
select distinct on (i.pack_id, i.master_product_id, trim(i.name))
  i.pack_id, i.master_product_id, i.id, i.quantity,
  trim(i.name), null, 'allowed', null
from public.stationery_items i
where i.master_product_id is not null
  and not exists (
    select 1 from public.school_pack_items spi
    where spi.legacy_item_id = i.id
  )
on conflict (pack_id, product_id, school_wording) do update set
  legacy_item_id = excluded.legacy_item_id,
  pack_quantity = excluded.pack_quantity,
  prescribed_brand = excluded.prescribed_brand;
