-- ============================================================================
-- 00039: Legacy Table Governance, Write Monitoring, and Reconciliation
-- ============================================================================
-- Enforces data strategy:
-- 1. Keep legacy tables physically present for compatibility.
-- 2. Monitor and audit any direct writes to legacy tables.
-- 3. Provide automated reconciliation routines to backfill legacy rows to canonical.
-- 4. Expose automated data quality checks via admin_data_quality_issues_view.
-- 5. Require zero dependency verification before any eventual legacy deprecation.

-- 1. Legacy Write Monitoring Audit Log ----------------------------------------

create table if not exists public.legacy_write_audit_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  operation text not null,
  record_id text,
  payload jsonb,
  written_at timestamptz not null default now(),
  written_by uuid default auth.uid()
);

alter table public.legacy_write_audit_log enable row level security;

drop policy if exists "Staff read legacy_write_audit_log" on public.legacy_write_audit_log;
create policy "Staff read legacy_write_audit_log"
  on public.legacy_write_audit_log
  for select
  to authenticated
  using (public.has_permission('settings.manage'));

drop policy if exists "Service role manage legacy_write_audit_log" on public.legacy_write_audit_log;
create policy "Service role manage legacy_write_audit_log"
  on public.legacy_write_audit_log
  for all
  to service_role
  using (true)
  with check (true);

-- Trigger function for monitoring legacy writes
create or replace function public.log_legacy_table_write()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.legacy_write_audit_log (table_name, operation, record_id, payload)
  values (
    TG_TABLE_NAME::text,
    TG_OP::text,
    coalesce(new.id::text, old.id::text),
    to_jsonb(coalesce(new, old))
  );
  return coalesce(new, old);
end;
$$;

-- Attach monitoring triggers to legacy tables
drop trigger if exists monitor_stationery_items_writes on public.stationery_items;
create trigger monitor_stationery_items_writes
  after insert or update or delete on public.stationery_items
  for each row execute function public.log_legacy_table_write();

drop trigger if exists monitor_app_settings_writes on public.app_settings;
create trigger monitor_app_settings_writes
  after insert or update or delete on public.app_settings
  for each row execute function public.log_legacy_table_write();


-- 2. Legacy to Canonical Reconciliation Routine -------------------------------

create or replace function public.reconcile_legacy_to_canonical()
returns table (
  reconciled_master_products bigint,
  reconciled_pack_items bigint,
  reconciled_system_settings bigint
)
language plpgsql
security definer
as $$
declare
  v_prod_count bigint := 0;
  v_pack_item_count bigint := 0;
  v_settings_count bigint := 0;
begin
  -- A. Backfill master_products from unbridged stationery_items
  with inserted_products as (
    insert into public.master_products (
      sku,
      name,
      description,
      category,
      brand,
      current_selling_price,
      active
    )
    select distinct
      'LEGACY-ITEM-' || left(si.id::text, 8) as sku,
      coalesce(nullif(trim(si.name), ''), 'Legacy Product ' || left(si.id::text, 8)) as name,
      si.description,
      coalesce(nullif(trim(si.category), ''), 'General Stationery') as category,
      'Generic' as brand,
      coalesce(si.unit_price, 0) as current_selling_price,
      coalesce(si.visible, true) as active
    from public.stationery_items si
    left join public.master_products mp
      on lower(mp.sku) = lower('LEGACY-ITEM-' || left(si.id::text, 8))
    where mp.id is null
    on conflict (sku) do nothing
    returning id
  )
  select count(*) into v_prod_count from inserted_products;

  -- B. Backfill school_pack_items from unbridged stationery_items
  with inserted_pack_items as (
    insert into public.school_pack_items (
      pack_id,
      product_id,
      pack_quantity,
      selling_price_override,
      legacy_item_id,
      sort_order
    )
    select
      si.pack_id,
      mp.id as product_id,
      greatest(1, coalesce(si.quantity, 1)) as pack_quantity,
      si.unit_price as selling_price_override,
      si.id as legacy_item_id,
      coalesce(si.sort_order, 0) as sort_order
    from public.stationery_items si
    join public.master_products mp
      on lower(mp.sku) = lower('LEGACY-ITEM-' || left(si.id::text, 8))
    left join public.school_pack_items spi
      on spi.legacy_item_id = si.id
    where spi.id is null
    on conflict (legacy_item_id) do nothing
    returning id
  )
  select count(*) into v_pack_item_count from inserted_pack_items;

  -- C. Backfill system_settings from legacy app_settings
  with inserted_settings as (
    insert into public.system_settings (
      key,
      category,
      value,
      value_type,
      scope,
      description,
      is_public
    )
    select
      aset.key,
      'legacy' as category,
      coalesce(aset.value, 'null'::jsonb) as value,
      'string'::public.setting_value_type as value_type,
      'global'::public.setting_scope as scope,
      'Migrated from legacy app_settings' as description,
      true as is_public
    from public.app_settings aset
    left join public.system_settings sset on sset.key = aset.key
    where sset.key is null
    on conflict (key) do nothing
    returning key
  )
  select count(*) into v_settings_count from inserted_settings;

  return query select v_prod_count, v_pack_item_count, v_settings_count;
end;
$$;

grant execute on function public.reconcile_legacy_to_canonical to authenticated, service_role;


-- 3. Data Quality Audit Execution Function -----------------------------------

create or replace function public.run_admin_data_quality_audit()
returns table (
  area text,
  issue text,
  issue_count bigint
)
language sql
security definer
stable
as $$
  select area, issue, issue_count
  from public.admin_data_quality_issues_view
  order by area, issue;
$$;

grant execute on function public.run_admin_data_quality_audit to authenticated, service_role;

comment on function public.reconcile_legacy_to_canonical is
  'Reconciles any unbridged legacy rows in stationery_items or app_settings into canonical master_products, school_pack_items, and system_settings.';
comment on function public.run_admin_data_quality_audit is
  'Runs operational data quality audit across canonical and legacy tables. Should be executed after bulk imports and before production releases.';
