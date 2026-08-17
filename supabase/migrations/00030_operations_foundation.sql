-- ===================================================
-- Pexpacks Supplies - Operations System Foundation
-- Migration 00029
--
-- Additive migration. Existing school, pack, item and order records remain
-- available while the application moves to normalized operational data.
-- Happy Pay is represented as a payment method processed by Ozow.
-- No lay-by or savings-plan domain is introduced.
-- ===================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ---------------------------------------------------
-- Seasons and people
-- ---------------------------------------------------

create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  academic_year integer not null unique,
  starts_on date,
  ordering_closes_on date,
  fulfilment_starts_on date,
  fulfilment_ends_on date,
  status text not null default 'planning' check (status in ('planning','active','closed','archived')),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists seasons_one_default_idx
  on public.seasons (is_default) where is_default;

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  telephone text,
  job_title text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  email text,
  phone text,
  full_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists customers_email_unique_idx
  on public.customers (lower(email)) where email is not null and email <> '';

create table if not exists public.learners (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  school_id uuid references public.schools(id) on delete set null,
  full_name text not null,
  grade text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------
-- Master catalogue and school pack composition
-- ---------------------------------------------------

create table if not exists public.master_products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  description text,
  category text,
  brand text,
  unit text,
  packaging text,
  specification text,
  visibility text not null default 'internal' check (visibility in ('internal','public','hidden')),
  availability text not null default 'unverified' check (availability in ('available','limited','unavailable','unverified')),
  calculated_selling_price numeric(12,2),
  selling_price_override numeric(12,2),
  current_selling_price numeric(12,2) not null default 0,
  latest_verified_cost numeric(12,2),
  target_markup numeric(8,4),
  target_margin numeric(8,4),
  pricing_status text not null default 'unpriced' check (pricing_status in ('unpriced','current','stale','review','approved')),
  preferred_supplier_id uuid,
  last_verified_at timestamptz,
  active boolean not null default true,
  search_vector tsvector,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists master_products_sku_unique_idx on public.master_products (upper(sku));
create index if not exists master_products_name_trgm_idx on public.master_products using gin (name gin_trgm_ops);
create index if not exists master_products_search_idx on public.master_products using gin (search_vector);
create index if not exists master_products_pricing_status_idx on public.master_products (pricing_status, active);

create or replace function public.master_products_search_vector_set()
returns trigger language plpgsql as $$
begin
  new.search_vector := to_tsvector('english', concat_ws(' ', new.sku, new.name, new.description, new.category, new.brand, new.specification));
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists master_products_search_vector_trg on public.master_products;
create trigger master_products_search_vector_trg before insert or update on public.master_products
for each row execute function public.master_products_search_vector_set();

alter table public.stationery_items add column if not exists master_product_id uuid;
alter table public.stationery_items drop constraint if exists stationery_items_master_product_id_fkey;
alter table public.stationery_items add constraint stationery_items_master_product_id_fkey
  foreign key (master_product_id) references public.master_products(id) on delete set null;
create index if not exists stationery_items_master_product_idx on public.stationery_items(master_product_id);

create table if not exists public.school_pack_items (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references public.stationery_packs(id) on delete cascade,
  product_id uuid not null references public.master_products(id) on delete restrict,
  legacy_item_id uuid unique references public.stationery_items(id) on delete set null,
  pack_quantity integer not null default 1 check (pack_quantity > 0),
  school_wording text,
  prescribed_brand text,
  substitution_policy text not null default 'approval_required' check (substitution_policy in ('allowed','approval_required','not_allowed')),
  school_notes text,
  selling_price_override numeric(12,2),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(pack_id, product_id, school_wording)
);

create index if not exists school_pack_items_pack_idx on public.school_pack_items(pack_id, active, sort_order);
create index if not exists school_pack_items_product_idx on public.school_pack_items(product_id, active);

alter table public.stationery_packs add column if not exists season_id uuid references public.seasons(id) on delete set null;
alter table public.stationery_packs add column if not exists list_version integer not null default 1;
alter table public.stationery_packs add column if not exists pricing_status text not null default 'legacy';
alter table public.stationery_packs add column if not exists fulfilment_deadline date;

-- Seed the next operational season without making assumptions about activation.
insert into public.seasons (name, academic_year, status)
values ('2027 Back-to-School', 2027, 'planning')
on conflict (academic_year) do nothing;

update public.seasons
set is_default = true
where academic_year = 2027
  and not exists (select 1 from public.seasons where is_default);

create or replace function public.current_operational_season_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.seasons
  order by is_default desc, (status = 'active') desc, academic_year desc
  limit 1
$$;

-- Create one canonical product for each normalized legacy item name.
insert into public.master_products (
  sku, name, description, unit, packaging, specification,
  current_selling_price, calculated_selling_price, pricing_status, visibility
)
select
  'PEX-' || upper(substr(md5(lower(trim(i.name))), 1, 10)),
  min(trim(i.name)),
  max(nullif(trim(i.description), '')),
  max(nullif(trim(i.specification), '')),
  max(nullif(trim(i.specification), '')),
  max(nullif(trim(i.specification), '')),
  coalesce(max(i.unit_price), 0),
  coalesce(max(i.unit_price), 0),
  case when max(i.unit_price) is null then 'unpriced' else 'review' end,
  'internal'
from public.stationery_items i
where nullif(trim(i.name), '') is not null
group by lower(trim(i.name))
on conflict do nothing;

update public.stationery_items i
set master_product_id = p.id
from public.master_products p
where i.master_product_id is null
  and lower(trim(i.name)) = lower(trim(p.name));

insert into public.school_pack_items (
  pack_id, product_id, legacy_item_id, pack_quantity, school_wording,
  school_notes, selling_price_override, sort_order, active
)
select
  i.pack_id, i.master_product_id, i.id, greatest(i.quantity, 1), i.name,
  i.description, i.unit_price, i.sort_order, i.visible
from public.stationery_items i
where i.master_product_id is not null
on conflict (legacy_item_id) do nothing;

-- ---------------------------------------------------
-- Suppliers, offers, quotations and pricing
-- ---------------------------------------------------

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  contact_name text,
  email text,
  telephone text,
  address text,
  payment_terms text,
  lead_time_days integer,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.master_products drop constraint if exists master_products_preferred_supplier_id_fkey;
alter table public.master_products add constraint master_products_preferred_supplier_id_fkey
  foreign key (preferred_supplier_id) references public.suppliers(id) on delete set null;

create table if not exists public.supplier_quote_imports (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  source_file_name text,
  storage_path text,
  status text not null default 'processing' check (status in ('processing','review','completed','failed')),
  imported_rows integer not null default 0,
  rejected_rows integer not null default 0,
  errors jsonb not null default '[]'::jsonb,
  imported_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.supplier_offers (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  product_id uuid not null references public.master_products(id) on delete cascade,
  quote_import_id uuid references public.supplier_quote_imports(id) on delete set null,
  supplier_sku text,
  unit_cost numeric(12,2) not null check (unit_cost >= 0),
  currency text not null default 'ZAR',
  minimum_order_quantity integer not null default 1 check (minimum_order_quantity > 0),
  available_quantity integer,
  lead_time_days integer,
  valid_from date not null default current_date,
  valid_until date,
  verified_at timestamptz,
  is_preferred boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists supplier_offers_product_idx on public.supplier_offers(product_id, active, unit_cost);
create unique index if not exists supplier_offers_one_preferred_idx
  on public.supplier_offers(product_id) where is_preferred and active;

create table if not exists public.pricing_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  scope text not null check (scope in ('global','category','brand','product')),
  scope_value text,
  method text not null check (method in ('markup','margin')),
  rate numeric(8,4) not null check (rate >= 0 and rate < 1),
  rounding_increment numeric(8,2) not null default 0.01 check (rounding_increment > 0),
  priority integer not null default 100,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.price_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.master_products(id) on delete cascade,
  supplier_id uuid references public.suppliers(id) on delete set null,
  previous_cost numeric(12,2),
  new_cost numeric(12,2),
  previous_selling_price numeric(12,2),
  new_selling_price numeric(12,2),
  previous_margin numeric(8,4),
  new_margin numeric(8,4),
  reason text,
  source text,
  changed_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists price_history_product_created_idx on public.price_history(product_id, created_at desc);

-- ---------------------------------------------------
-- Immutable order snapshots and payment events
-- ---------------------------------------------------

alter table public.orders add column if not exists customer_id uuid references public.customers(id) on delete set null;
alter table public.orders add column if not exists learner_id uuid references public.learners(id) on delete set null;
alter table public.orders add column if not exists season_id uuid references public.seasons(id) on delete set null;
alter table public.orders add column if not exists commercial_snapshot_locked_at timestamptz;
alter table public.orders alter column season_id set default public.current_operational_season_id();
update public.orders set season_id = public.current_operational_season_id() where season_id is null;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.master_products(id) on delete set null,
  pack_id uuid references public.stationery_packs(id) on delete set null,
  sku_snapshot text not null,
  product_name_snapshot text not null,
  description_snapshot text,
  quantity integer not null check (quantity > 0),
  unit_selling_price numeric(12,2) not null check (unit_selling_price >= 0),
  line_total numeric(12,2) generated always as (quantity * unit_selling_price) stored,
  estimated_unit_cost numeric(12,2),
  expected_margin numeric(8,4),
  pricing_version text,
  school_name_snapshot text,
  grade_snapshot text,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists order_items_product_idx on public.order_items(product_id);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'ozow',
  payment_method text not null default 'Ozow',
  gateway_reference text,
  event_key text not null,
  status text not null,
  amount numeric(12,2),
  currency text not null default 'ZAR',
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(provider, event_key)
);

create unique index if not exists payments_gateway_reference_unique_idx
  on public.payments(payment_gateway, gateway_reference)
  where gateway_reference is not null;
create unique index if not exists payments_order_complete_unique_idx
  on public.payments(order_reference)
  where status = 'Complete';

alter table public.payments enable row level security;

-- Make the existing unique idempotency constraint effective for new writes.
with ranked_keys as (
  select id, metadata ->> 'idempotency_key' as key,
         row_number() over (partition by metadata ->> 'idempotency_key' order by created_at, id) as position
  from public.orders
  where idempotency_key is null and nullif(metadata ->> 'idempotency_key', '') is not null
)
update public.orders o
set idempotency_key = ranked_keys.key
from ranked_keys
where o.id = ranked_keys.id and ranked_keys.position = 1;

-- ---------------------------------------------------
-- Procurement and allocation
-- ---------------------------------------------------

create table if not exists public.procurement_requirements (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null default public.current_operational_season_id() references public.seasons(id) on delete restrict,
  product_id uuid not null references public.master_products(id) on delete restrict,
  required_quantity integer not null default 0 check (required_quantity >= 0),
  requested_quantity integer not null default 0 check (requested_quantity >= 0),
  supplier_confirmed_quantity integer not null default 0 check (supplier_confirmed_quantity >= 0),
  secured_quantity integer not null default 0 check (secured_quantity >= 0),
  received_quantity integer not null default 0 check (received_quantity >= 0),
  allocated_quantity integer not null default 0 check (allocated_quantity >= 0),
  status text not null default 'open' check (status in ('open','requested','partially_secured','secured','closed','cancelled')),
  updated_at timestamptz not null default now(),
  unique(season_id, product_id)
);

create index if not exists procurement_requirements_status_idx on public.procurement_requirements(status, updated_at desc);

create table if not exists public.procurement_requirement_orders (
  id uuid primary key default gen_random_uuid(),
  requirement_id uuid not null references public.procurement_requirements(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  required_quantity integer not null check (required_quantity > 0),
  created_at timestamptz not null default now(),
  unique(order_item_id)
);

create table if not exists public.supplier_purchase_orders (
  id uuid primary key default gen_random_uuid(),
  purchase_order_number text not null unique,
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  season_id uuid references public.seasons(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','sent','confirmed','partially_received','received','cancelled')),
  currency text not null default 'ZAR',
  expected_on date,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.supplier_purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.supplier_purchase_orders(id) on delete cascade,
  requirement_id uuid references public.procurement_requirements(id) on delete set null,
  product_id uuid not null references public.master_products(id) on delete restrict,
  ordered_quantity integer not null check (ordered_quantity > 0),
  confirmed_quantity integer not null default 0 check (confirmed_quantity >= 0),
  received_quantity integer not null default 0 check (received_quantity >= 0),
  unit_cost numeric(12,2) not null check (unit_cost >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.supplier_receipts (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.supplier_purchase_orders(id) on delete cascade,
  reference text,
  received_by uuid references auth.users(id) on delete set null,
  received_at timestamptz not null default now(),
  notes text
);

create table if not exists public.order_product_allocations (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  purchase_item_id uuid references public.supplier_purchase_items(id) on delete set null,
  quantity integer not null check (quantity > 0),
  allocated_by uuid references auth.users(id) on delete set null,
  allocated_at timestamptz not null default now()
);

create index if not exists order_product_allocations_order_item_idx on public.order_product_allocations(order_item_id);

create table if not exists public.substitutions (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  original_product_id uuid references public.master_products(id) on delete set null,
  replacement_product_id uuid not null references public.master_products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  reason text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected','applied')),
  requested_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- ---------------------------------------------------
-- Packing, fulfilment and collaboration
-- ---------------------------------------------------

create table if not exists public.packing_records (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  status text not null default 'not_ready' check (status in ('not_ready','ready','packing','quality_check','packed','exception')),
  started_by uuid references auth.users(id) on delete set null,
  checked_by uuid references auth.users(id) on delete set null,
  started_at timestamptz,
  checked_at timestamptz,
  packed_at timestamptz,
  notes text,
  updated_at timestamptz not null default now()
);

create table if not exists public.fulfilment_records (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  method text not null check (method in ('school_collection','collection_point','delivery')),
  status text not null default 'pending' check (status in ('pending','scheduled','ready','dispatched','collected','delivered','failed','cancelled')),
  target_date date,
  school_open_day date,
  courier_name text,
  waybill_number text,
  completed_at timestamptz,
  notes text,
  updated_at timestamptz not null default now()
);

create table if not exists public.operational_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  entity_type text,
  entity_id text,
  status text not null default 'open' check (status in ('open','in_progress','blocked','completed','cancelled')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  assigned_to uuid references auth.users(id) on delete set null,
  due_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists operational_tasks_assignee_status_idx on public.operational_tasks(assigned_to, status, due_at);

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.operational_tasks(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_mentions (
  comment_id uuid not null references public.task_comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(comment_id, user_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  permission_key text,
  type text not null,
  title text not null,
  body text,
  entity_type text,
  entity_id text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_unread_idx on public.notifications(user_id, created_at desc) where read_at is null;

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id text not null,
  approval_type text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  requested_by uuid references auth.users(id) on delete set null,
  decided_by uuid references auth.users(id) on delete set null,
  reason text,
  decision_notes text,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create table if not exists public.operational_events (
  id uuid primary key default gen_random_uuid(),
  event_key text unique,
  event_type text not null,
  entity_type text not null,
  entity_id text not null,
  actor_id uuid references auth.users(id) on delete set null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists operational_events_entity_idx on public.operational_events(entity_type, entity_id, created_at desc);

-- ---------------------------------------------------
-- Operational views and transactional payment RPC
-- ---------------------------------------------------

create or replace view public.procurement_command_view
with (security_invoker = true) as
select
  pr.id,
  pr.season_id,
  pr.product_id,
  mp.sku,
  mp.name as product_name,
  mp.category,
  pr.required_quantity,
  pr.requested_quantity,
  pr.supplier_confirmed_quantity,
  pr.secured_quantity,
  pr.received_quantity,
  pr.allocated_quantity,
  greatest(pr.required_quantity - pr.secured_quantity, 0) as outstanding_quantity,
  case when pr.required_quantity = 0 then 100
       else round((least(pr.secured_quantity, pr.required_quantity)::numeric / pr.required_quantity) * 100, 1)
  end as procurement_coverage_percent,
  pr.status,
  pr.updated_at
from public.procurement_requirements pr
join public.master_products mp on mp.id = pr.product_id;

create or replace view public.order_readiness_view
with (security_invoker = true) as
select
  o.id as order_id,
  o.order_reference,
  o.status as order_status,
  count(oi.id) as line_count,
  coalesce(sum(oi.quantity), 0) as required_units,
  coalesce(sum(least(oi.quantity, coalesce(a.allocated_quantity, 0))), 0) as allocated_units,
  case when coalesce(sum(oi.quantity), 0) = 0 then 0
       else round((coalesce(sum(least(oi.quantity, coalesce(a.allocated_quantity, 0))), 0)::numeric / sum(oi.quantity)) * 100, 1)
  end as readiness_percent
from public.orders o
left join public.order_items oi on oi.order_id = o.id
left join (
  select order_item_id, sum(quantity) as allocated_quantity
  from public.order_product_allocations group by order_item_id
) a on a.order_item_id = oi.id
group by o.id, o.order_reference, o.status;

create or replace function public.complete_order_payment(
  p_order_reference text,
  p_gateway_reference text,
  p_amount numeric,
  p_currency text default 'ZAR',
  p_provider text default 'ozow',
  p_payment_method text default 'Ozow',
  p_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_event_key text;
  v_requirement_id uuid;
  v_link_id uuid;
  v_item record;
begin
  select * into v_order
  from public.orders
  where order_reference = p_order_reference
  for update;

  if not found then
    raise exception 'Order % was not found', p_order_reference using errcode = 'P0002';
  end if;
  if upper(coalesce(p_currency, '')) <> 'ZAR' then
    raise exception 'Unsupported payment currency %', p_currency using errcode = '22023';
  end if;
  if p_amount is null or abs(p_amount - coalesce(v_order.estimated_total, 0)) > 0.01 then
    raise exception 'Payment amount does not match the order total' using errcode = '22023';
  end if;

  v_event_key := coalesce(nullif(p_gateway_reference, ''), p_order_reference || ':complete');

  insert into public.payment_events (
    order_id, provider, payment_method, gateway_reference, event_key,
    status, amount, currency, payload, processed_at
  ) values (
    v_order.id, lower(p_provider), p_payment_method, p_gateway_reference, v_event_key,
    'Complete', p_amount, upper(p_currency), coalesce(p_payload, '{}'::jsonb), now()
  ) on conflict (provider, event_key) do nothing;

  if v_order.status = 'paid' then
    return jsonb_build_object('success', true, 'already_paid', true, 'order_id', v_order.id);
  end if;

  update public.orders
  set status = 'paid',
      paid_at = now(),
      payment_gateway = lower(p_provider),
      gateway_reference = p_gateway_reference,
      commercial_snapshot_locked_at = coalesce(commercial_snapshot_locked_at, now()),
      metadata = coalesce(metadata, '{}'::jsonb) || coalesce(p_payload, '{}'::jsonb)
  where id = v_order.id;

  insert into public.payments (
    order_reference, gateway_reference, amount, currency, payment_gateway, status, metadata
  ) values (
    p_order_reference, p_gateway_reference, p_amount, upper(p_currency), lower(p_provider), 'Complete', p_payload
  ) on conflict do nothing;

  for v_item in
    select oi.* from public.order_items oi where oi.order_id = v_order.id and oi.product_id is not null
  loop
    insert into public.procurement_requirements (season_id, product_id)
    values (coalesce(v_order.season_id, public.current_operational_season_id()), v_item.product_id)
    on conflict (season_id, product_id) do update set updated_at = now()
    returning id into v_requirement_id;

    insert into public.procurement_requirement_orders (
      requirement_id, order_id, order_item_id, required_quantity
    ) values (
      v_requirement_id, v_order.id, v_item.id, v_item.quantity
    ) on conflict (order_item_id) do nothing
    returning id into v_link_id;

    if v_link_id is not null then
      update public.procurement_requirements
      set required_quantity = required_quantity + v_item.quantity,
          status = case when secured_quantity >= required_quantity + v_item.quantity then 'secured'
                        when secured_quantity > 0 then 'partially_secured'
                        else 'open' end,
          updated_at = now()
      where id = v_requirement_id;
    end if;
    v_link_id := null;
  end loop;

  insert into public.packing_records(order_id, status)
  values (v_order.id, 'not_ready') on conflict (order_id) do nothing;

  insert into public.fulfilment_records(order_id, method, status)
  values (
    v_order.id,
    case
      when lower(coalesce(v_order.fulfilment_option, '')) like '%school%' then 'school_collection'
      when lower(coalesce(v_order.fulfilment_option, '')) like '%delivery%' then 'delivery'
      else 'collection_point'
    end,
    'pending'
  ) on conflict (order_id) do nothing;

  insert into public.operational_events(event_key, event_type, entity_type, entity_id, data)
  values (
    'order-paid:' || v_order.id,
    'order.paid', 'order', v_order.id::text,
    jsonb_build_object('order_reference', p_order_reference, 'amount', p_amount, 'payment_method', p_payment_method)
  ) on conflict (event_key) do nothing;

  insert into public.audit_logs(actor_id, actor_name, action, entity_type, entity_id, summary, details)
  values (
    null, 'Ozow Webhook Pipeline', 'payment.completed', 'order', v_order.id::text,
    'Verified payment confirmed for ' || p_order_reference,
    jsonb_build_object('amount', p_amount, 'currency', upper(p_currency), 'provider', lower(p_provider), 'payment_method', p_payment_method)
  );

  insert into public.notifications(permission_key, type, title, body, entity_type, entity_id)
  values (
    'procurement.view', 'order_paid', 'Paid order requires procurement',
    p_order_reference || ' has been paid and added to committed demand.', 'order', v_order.id::text
  );

  insert into public.operational_tasks(title, description, entity_type, entity_id, priority, created_by)
  values (
    'Secure products for ' || p_order_reference,
    'Review the committed demand generated by this verified paid order.',
    'order', v_order.id::text, 'high', null
  );

  return jsonb_build_object('success', true, 'already_paid', false, 'order_id', v_order.id);
end;
$$;

revoke all on function public.complete_order_payment(text,text,numeric,text,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.complete_order_payment(text,text,numeric,text,text,text,jsonb) to service_role;

create or replace function public.record_order_payment_status(
  p_order_reference text,
  p_gateway_reference text,
  p_status text,
  p_amount numeric,
  p_currency text default 'ZAR',
  p_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_order public.orders%rowtype; v_event_key text; v_order_status text;
begin
  select * into v_order from public.orders where order_reference = p_order_reference for update;
  if not found then raise exception 'Order % was not found', p_order_reference using errcode = 'P0002'; end if;
  if v_order.status = 'paid' then return jsonb_build_object('success', true, 'ignored', true); end if;
  v_event_key := coalesce(nullif(p_gateway_reference, ''), p_order_reference) || ':' || lower(p_status);
  insert into public.payment_events(order_id,provider,payment_method,gateway_reference,event_key,status,amount,currency,payload,processed_at)
  values(v_order.id,'ozow','Ozow',p_gateway_reference,v_event_key,p_status,p_amount,upper(coalesce(p_currency,'ZAR')),coalesce(p_payload,'{}'::jsonb),now())
  on conflict(provider,event_key) do nothing;
  v_order_status := case
    when lower(p_status) in ('cancelled','abandoned') then 'cancelled'
    when lower(p_status) in ('pending','pendinginvestigation') then 'pending_payment'
    else 'payment_failed'
  end;
  update public.orders set status = v_order_status, gateway_reference = coalesce(p_gateway_reference,gateway_reference), metadata = coalesce(metadata,'{}'::jsonb) || coalesce(p_payload,'{}'::jsonb)
  where id = v_order.id and status in ('pending','pending_payment','payment_failed','cancelled');
  insert into public.operational_events(event_key,event_type,entity_type,entity_id,data)
  values('payment-status:' || v_event_key,'payment.' || lower(p_status),'order',v_order.id::text,jsonb_build_object('status',p_status))
  on conflict(event_key) do nothing;
  return jsonb_build_object('success', true, 'ignored', false, 'order_status', v_order_status);
end;
$$;

revoke all on function public.record_order_payment_status(text,text,text,numeric,text,jsonb) from public, anon, authenticated;
grant execute on function public.record_order_payment_status(text,text,text,numeric,text,jsonb) to service_role;

create or replace function public.allocate_secured_demand(p_requirement_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_requirement public.procurement_requirements%rowtype;
  v_available integer;
  v_needed integer;
  v_allocate integer;
  v_total integer := 0;
  v_line record;
begin
  select * into v_requirement
  from public.procurement_requirements
  where id = p_requirement_id
  for update;
  if not found then raise exception 'Procurement requirement not found' using errcode = 'P0002'; end if;

  v_available := greatest(v_requirement.secured_quantity - v_requirement.allocated_quantity, 0);
  if v_available = 0 then return 0; end if;

  for v_line in
    select
      oi.id as order_item_id,
      oi.quantity,
      coalesce((select sum(a.quantity) from public.order_product_allocations a where a.order_item_id = oi.id), 0) as already_allocated
    from public.procurement_requirement_orders pro
    join public.order_items oi on oi.id = pro.order_item_id
    join public.orders o on o.id = pro.order_id
    where pro.requirement_id = p_requirement_id and o.status = 'paid'
    order by coalesce((select fr.target_date from public.fulfilment_records fr where fr.order_id = o.id), '9999-12-31'::date), o.paid_at, o.created_at
  loop
    exit when v_available <= 0;
    v_needed := greatest(v_line.quantity - v_line.already_allocated, 0);
    if v_needed > 0 then
      v_allocate := least(v_available, v_needed);
      insert into public.order_product_allocations(order_item_id, quantity)
      values (v_line.order_item_id, v_allocate);
      v_available := v_available - v_allocate;
      v_total := v_total + v_allocate;
    end if;
  end loop;

  update public.procurement_requirements
  set allocated_quantity = allocated_quantity + v_total, updated_at = now()
  where id = p_requirement_id;

  update public.packing_records pr
  set status = 'ready', updated_at = now()
  from public.order_readiness_view readiness
  where readiness.order_id = pr.order_id
    and readiness.readiness_percent >= 100
    and pr.status = 'not_ready';

  return v_total;
end;
$$;

revoke all on function public.allocate_secured_demand(uuid) from public, anon, authenticated;
grant execute on function public.allocate_secured_demand(uuid) to service_role;

-- ---------------------------------------------------
-- Permissions and RLS
-- ---------------------------------------------------

insert into public.permissions(key, name, description) values
  ('catalogue.view', 'View Master Catalogue', 'View canonical stationery products'),
  ('catalogue.manage', 'Manage Master Catalogue', 'Create and update canonical products'),
  ('suppliers.view', 'View Suppliers', 'View suppliers and offers'),
  ('suppliers.manage', 'Manage Suppliers', 'Manage suppliers, quotations and offers'),
  ('pricing.view', 'View Pricing', 'View costs, prices and margins'),
  ('pricing.manage', 'Manage Pricing', 'Manage pricing rules and approve prices'),
  ('procurement.view', 'View Procurement', 'View committed demand and purchases'),
  ('procurement.manage', 'Manage Procurement', 'Manage requirements, purchases and allocations'),
  ('fulfilment.view', 'View Fulfilment', 'View packing and fulfilment'),
  ('fulfilment.manage', 'Manage Fulfilment', 'Manage packing, QA and delivery'),
  ('tasks.view', 'View Tasks', 'View operational tasks and comments'),
  ('tasks.manage', 'Manage Tasks', 'Create, assign and complete operational tasks'),
  ('approvals.manage', 'Manage Approvals', 'Approve pricing, substitutions and purchases')
on conflict (key) do nothing;

insert into public.roles(name, slug, description) values
  ('Operations Manager', 'operations_manager', 'Manage procurement, fulfilment, tasks and operational exceptions'),
  ('Catalogue and Pricing', 'catalogue_pricing', 'Manage products, supplier pricing and selling prices'),
  ('Procurement', 'procurement', 'Manage supplier requirements, purchases and allocations'),
  ('Fulfilment', 'fulfilment', 'Manage packing, quality checks and delivery or collection'),
  ('Finance', 'finance', 'Review payments, revenue, refunds and commercial reporting'),
  ('Management Read Only', 'management_viewer', 'Read-only access to operational and commercial reporting')
on conflict (slug) do nothing;

insert into public.role_permissions(role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.slug = 'super_admin' and p.key in (
  'catalogue.view','catalogue.manage','suppliers.view','suppliers.manage','pricing.view','pricing.manage',
  'procurement.view','procurement.manage','fulfilment.view','fulfilment.manage','tasks.view','tasks.manage','approvals.manage'
) on conflict do nothing;

insert into public.role_permissions(role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.slug = 'administrator' and p.key in (
  'catalogue.view','catalogue.manage','suppliers.view','suppliers.manage','pricing.view','pricing.manage',
  'procurement.view','procurement.manage','fulfilment.view','fulfilment.manage','tasks.view','tasks.manage','approvals.manage'
) on conflict do nothing;

insert into public.role_permissions(role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.slug in ('school_manager','office_manager') and p.key in ('catalogue.view','catalogue.manage','pricing.view')
on conflict do nothing;

insert into public.role_permissions(role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.slug = 'order_manager' and p.key in ('procurement.view','fulfilment.view','fulfilment.manage','tasks.view','tasks.manage')
on conflict do nothing;

insert into public.role_permissions(role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where
  (r.slug = 'operations_manager' and p.key in ('dashboard.view','orders.view','payments.view','catalogue.view','suppliers.view','pricing.view','procurement.view','procurement.manage','fulfilment.view','fulfilment.manage','tasks.view','tasks.manage','approvals.manage','reports.view'))
  or (r.slug = 'catalogue_pricing' and p.key in ('dashboard.view','items.view','items.import','catalogue.view','catalogue.manage','suppliers.view','suppliers.manage','pricing.view','pricing.manage','packs.view','reports.view'))
  or (r.slug = 'procurement' and p.key in ('dashboard.view','orders.view','catalogue.view','suppliers.view','suppliers.manage','pricing.view','procurement.view','procurement.manage','tasks.view','tasks.manage','reports.view'))
  or (r.slug = 'fulfilment' and p.key in ('dashboard.view','orders.view','catalogue.view','procurement.view','fulfilment.view','fulfilment.manage','tasks.view','tasks.manage','reports.view'))
  or (r.slug = 'finance' and p.key in ('dashboard.view','orders.view','orders.export','orders.refund','payments.view','payments.refund','pricing.view','procurement.view','reports.view','reports.export','audit.view'))
  or (r.slug = 'management_viewer' and p.key in ('dashboard.view','schools.view','packs.view','items.view','catalogue.view','suppliers.view','pricing.view','orders.view','payments.view','procurement.view','fulfilment.view','tasks.view','reports.view','audit.view'))
on conflict do nothing;

do $$
declare t text;
begin
  foreach t in array array[
    'seasons','user_profiles','customers','learners','master_products','school_pack_items',
    'suppliers','supplier_quote_imports','supplier_offers','pricing_rules','price_history','order_items',
    'payment_events','procurement_requirements','procurement_requirement_orders','supplier_purchase_orders',
    'supplier_purchase_items','supplier_receipts','order_product_allocations','substitutions','packing_records',
    'fulfilment_records','operational_tasks','task_comments','task_mentions','notifications','approvals','operational_events'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Read access is restricted by domain. Writes use authenticated permission
-- policies or server-side service-role operations for transactional workflows.
create policy "Staff read seasons" on public.seasons for select to authenticated using (public.is_staff());
create policy "Staff manage seasons" on public.seasons for all to authenticated using (public.has_permission('settings.manage')) with check (public.has_permission('settings.manage'));
create policy "Users read own profile" on public.user_profiles for select to authenticated using (user_id = auth.uid() or public.has_permission('users.view'));
create policy "Users update own profile" on public.user_profiles for update to authenticated using (user_id = auth.uid() or public.has_permission('users.edit')) with check (user_id = auth.uid() or public.has_permission('users.edit'));

create policy "Catalogue readers" on public.master_products for select to authenticated using (public.has_permission('catalogue.view'));
create policy "Catalogue managers" on public.master_products for all to authenticated using (public.has_permission('catalogue.manage')) with check (public.has_permission('catalogue.manage'));
create policy "Pack item readers" on public.school_pack_items for select to authenticated using (public.has_permission('packs.view'));
create policy "Pack item managers" on public.school_pack_items for all to authenticated using (public.has_permission('packs.edit')) with check (public.has_permission('packs.edit'));

create policy "Supplier readers" on public.suppliers for select to authenticated using (public.has_permission('suppliers.view'));
create policy "Supplier managers" on public.suppliers for all to authenticated using (public.has_permission('suppliers.manage')) with check (public.has_permission('suppliers.manage'));
create policy "Supplier offer readers" on public.supplier_offers for select to authenticated using (public.has_permission('suppliers.view'));
create policy "Supplier offer managers" on public.supplier_offers for all to authenticated using (public.has_permission('suppliers.manage')) with check (public.has_permission('suppliers.manage'));
create policy "Quote import readers" on public.supplier_quote_imports for select to authenticated using (public.has_permission('suppliers.view'));
create policy "Quote import managers" on public.supplier_quote_imports for all to authenticated using (public.has_permission('suppliers.manage')) with check (public.has_permission('suppliers.manage'));
create policy "Pricing readers" on public.pricing_rules for select to authenticated using (public.has_permission('pricing.view'));
create policy "Pricing managers" on public.pricing_rules for all to authenticated using (public.has_permission('pricing.manage')) with check (public.has_permission('pricing.manage'));
create policy "Price history readers" on public.price_history for select to authenticated using (public.has_permission('pricing.view'));
create policy "Price history managers" on public.price_history for insert to authenticated with check (public.has_permission('pricing.manage'));

create policy "Operations read customers" on public.customers for select to authenticated using (public.has_permission('orders.view'));
create policy "Operations read learners" on public.learners for select to authenticated using (public.has_permission('orders.view'));
create policy "Operations read order items" on public.order_items for select to authenticated using (public.has_permission('orders.view'));
create policy "Finance read payment events" on public.payment_events for select to authenticated using (public.has_permission('payments.view'));
create policy "Finance read payments ledger" on public.payments for select to authenticated using (public.has_permission('payments.view'));

create policy "Procurement readers" on public.procurement_requirements for select to authenticated using (public.has_permission('procurement.view'));
create policy "Procurement managers" on public.procurement_requirements for all to authenticated using (public.has_permission('procurement.manage')) with check (public.has_permission('procurement.manage'));
create policy "Procurement order readers" on public.procurement_requirement_orders for select to authenticated using (public.has_permission('procurement.view'));
create policy "Procurement order managers" on public.procurement_requirement_orders for all to authenticated using (public.has_permission('procurement.manage')) with check (public.has_permission('procurement.manage'));
create policy "Purchase order readers" on public.supplier_purchase_orders for select to authenticated using (public.has_permission('procurement.view'));
create policy "Purchase order managers" on public.supplier_purchase_orders for all to authenticated using (public.has_permission('procurement.manage')) with check (public.has_permission('procurement.manage'));
create policy "Purchase item readers" on public.supplier_purchase_items for select to authenticated using (public.has_permission('procurement.view'));
create policy "Purchase item managers" on public.supplier_purchase_items for all to authenticated using (public.has_permission('procurement.manage')) with check (public.has_permission('procurement.manage'));
create policy "Receipt readers" on public.supplier_receipts for select to authenticated using (public.has_permission('procurement.view'));
create policy "Receipt managers" on public.supplier_receipts for all to authenticated using (public.has_permission('procurement.manage')) with check (public.has_permission('procurement.manage'));
create policy "Allocation readers" on public.order_product_allocations for select to authenticated using (public.has_permission('procurement.view'));
create policy "Allocation managers" on public.order_product_allocations for all to authenticated using (public.has_permission('procurement.manage')) with check (public.has_permission('procurement.manage'));
create policy "Substitution readers" on public.substitutions for select to authenticated using (public.has_permission('fulfilment.view'));
create policy "Substitution managers" on public.substitutions for all to authenticated using (public.has_permission('fulfilment.manage')) with check (public.has_permission('fulfilment.manage'));

create policy "Fulfilment readers packing" on public.packing_records for select to authenticated using (public.has_permission('fulfilment.view'));
create policy "Fulfilment managers packing" on public.packing_records for all to authenticated using (public.has_permission('fulfilment.manage')) with check (public.has_permission('fulfilment.manage'));
create policy "Fulfilment readers records" on public.fulfilment_records for select to authenticated using (public.has_permission('fulfilment.view'));
create policy "Fulfilment managers records" on public.fulfilment_records for all to authenticated using (public.has_permission('fulfilment.manage')) with check (public.has_permission('fulfilment.manage'));

create policy "Task readers" on public.operational_tasks for select to authenticated using (public.has_permission('tasks.view'));
create policy "Task managers" on public.operational_tasks for all to authenticated using (public.has_permission('tasks.manage')) with check (public.has_permission('tasks.manage'));
create policy "Comment readers" on public.task_comments for select to authenticated using (public.has_permission('tasks.view'));
create policy "Comment writers" on public.task_comments for insert to authenticated with check (public.has_permission('tasks.manage'));
create policy "Mention readers" on public.task_mentions for select to authenticated using (public.has_permission('tasks.view'));
create policy "Mention writers" on public.task_mentions for insert to authenticated with check (public.has_permission('tasks.manage'));
create policy "Users read notifications" on public.notifications for select to authenticated using (user_id is null and (permission_key is null or public.has_permission(permission_key)) or user_id = auth.uid());
create policy "Users mark notifications" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Approval readers" on public.approvals for select to authenticated using (public.is_staff());
create policy "Approval managers" on public.approvals for all to authenticated using (public.has_permission('approvals.manage')) with check (public.has_permission('approvals.manage'));
create policy "Event readers" on public.operational_events for select to authenticated using (public.is_staff());

-- Allow staff Realtime subscriptions only after RLS has filtered rows.
do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.operational_tasks;
exception when duplicate_object then null;
end $$;

comment on table public.master_products is 'Canonical digital stationery catalogue. One row per real product/SKU.';
comment on table public.procurement_requirements is 'Committed demand created only from fully paid orders.';
comment on column public.procurement_requirements.secured_quantity is 'Purchased or otherwise secured quantity; not speculative warehouse stock.';
