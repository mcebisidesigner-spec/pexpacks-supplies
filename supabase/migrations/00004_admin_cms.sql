-- ===================================================
-- Pexpacks Supplies — Enterprise Admin & Headless CMS
-- Migration 00004: RBAC, Website Content, Assets, Audit
-- ===================================================
-- Run in Supabase SQL Editor. Super admin for the current user:
--   select public.grant_role('<USER-UUID>', 'super_admin');
-- then sign out / sign back in so the session JWT picks up the roles claim.

create extension if not exists "pgcrypto";

-- ===================================================
-- 1. ROLES & PERMISSIONS (dynamic RBAC — never hardcoded)
-- ===================================================

create table if not exists public.roles (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.permissions (
  id uuid default gen_random_uuid() primary key,
  key text not null unique,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, role_id)
);

create table if not exists public.user_permissions (
  user_id uuid not null references auth.users(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  granted boolean not null default true,     -- true = explicit grant, false = explicit deny override
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, permission_id)
);

create table if not exists public.assigned_forms (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  form_key text not null,
  label text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, form_key)
);

-- ---- Seed roles ----
insert into public.roles (name, slug, description) values
  ('Super Admin',       'super_admin',       'Full access to every module including role management'),
  ('Administrator',     'administrator',     'Manage most modules and staff'),
  ('Content Manager',   'content_manager',   'Website content, testimonials, FAQs and assets'),
  ('School Manager',    'school_manager',    'Manage schools, school packs and items'),
  ('Office Manager',    'office_manager',    'Manage office/SME packs and items'),
  ('Order Manager',     'order_manager',     'Manage orders and payments'),
  ('Viewer',            'viewer',            'Read-only access to the dashboard')
on conflict (slug) do nothing;

-- ---- Seed permissions ----
insert into public.permissions (key, name, description) values
  ('dashboard.view',      'View Dashboard',        'See dashboard statistics and charts'),
  ('schools.view',        'View Schools',          'View the school directory'),
  ('schools.create',      'Create Schools',        'Add new schools'),
  ('schools.edit',        'Edit Schools',          'Edit school details'),
  ('schools.delete',      'Delete Schools',        'Permanently delete schools'),
  ('schools.archive',     'Archive Schools',       'Archive and restore schools'),
  ('schools.restore',     'Restore Schools',       'Restore archived schools'),
  ('schools.import',      'Import Schools',        'Bulk CSV import of schools'),
  ('packs.view',          'View Packs',            'View stationery packs'),
  ('packs.create',        'Create Packs',          'Add new packs'),
  ('packs.edit',          'Edit Packs',            'Edit pack details'),
  ('packs.delete',        'Delete Packs',          'Delete packs'),
  ('packs.duplicate',     'Duplicate Packs',       'Duplicate packs'),
  ('packs.import',        'Import Packs',          'Bulk CSV import of packs'),
  ('items.view',          'View Items',            'View stationery items'),
  ('items.create',        'Create Items',          'Add items to a pack'),
  ('items.edit',          'Edit Items',            'Edit item details'),
  ('items.delete',        'Delete Items',          'Delete items'),
  ('items.reorder',       'Reorder Items',         'Reorder items within a pack'),
  ('items.import',        'Import Items',          'Bulk CSV/Excel import of items'),
  ('orders.view',         'View Orders',           'View customer orders'),
  ('orders.edit',         'Edit Orders',           'Update order status and details'),
  ('orders.export',       'Export Orders',         'Export orders to CSV and PDF'),
  ('orders.refund',       'Refund Orders',         'Process order refunds'),
  ('payments.view',       'View Payments',         'View payments and failures'),
  ('payments.refund',     'Process Refunds',       'Process payment refunds'),
  ('users.view',          'View Users',            'View staff and customers'),
  ('users.create',        'Invite Users',          'Invite new staff users'),
  ('users.edit',          'Edit Users',            'Edit user details'),
  ('users.deactivate',    'Deactivate Users',      'Deactivate or reactivate users'),
  ('users.delete',        'Delete Users',          'Delete users'),
  ('roles.manage',        'Manage Roles',          'Assign roles and permissions'),
  ('forms.assign',        'Assign Forms',          'Assign forms to users'),
  ('content.view',        'View Website Content',  'View website content'),
  ('content.manage',      'Manage Website Content','Edit website content, FAQs and testimonials'),
  ('assets.view',         'View Assets',           'View the media library'),
  ('assets.upload',       'Upload Assets',         'Upload files to the media library'),
  ('assets.manage',       'Manage Assets',         'Rename, delete and replace assets'),
  ('reports.view',        'View Reports',          'View and export reports'),
  ('settings.manage',     'Manage Settings',       'Edit system settings'),
  ('audit.view',          'View Audit Logs',       'View audit history'),
  ('audit.export',        'Export Audit Logs',     'Export audit history')
on conflict (key) do nothing;

-- ---- Seed role permissions ----
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.slug = 'super_admin'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.slug = 'administrator'
  and p.key not in ('roles.manage', 'users.delete', 'settings.manage')
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.slug = 'content_manager'
  and p.key in ('dashboard.view','schools.view','packs.view','items.view',
    'content.view','content.manage','assets.view','assets.upload','assets.manage',
    'reports.view')
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.slug = 'school_manager'
  and p.key in ('dashboard.view','schools.view','schools.create','schools.edit',
    'schools.archive','schools.restore','schools.import','packs.view','packs.create',
    'packs.edit','packs.delete','packs.duplicate','packs.import','items.view',
    'items.create','items.edit','items.delete','items.reorder','items.import',
    'assets.view','assets.upload','orders.view','reports.view')
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.slug = 'office_manager'
  and p.key in ('dashboard.view','schools.view','packs.view','packs.create',
    'packs.edit','packs.delete','packs.duplicate','packs.import','items.view',
    'items.create','items.edit','items.delete','items.reorder','items.import',
    'assets.view','assets.upload','orders.view','reports.view')
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.slug = 'order_manager'
  and p.key in ('dashboard.view','orders.view','orders.edit','orders.export',
    'orders.refund','payments.view','payments.refund','reports.view')
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.slug = 'viewer'
  and p.key in ('dashboard.view','schools.view','packs.view','items.view',
    'orders.view','payments.view','content.view','assets.view','reports.view')
on conflict do nothing;

-- ===================================================
-- 2. RBAC HELPER FUNCTIONS
-- ===================================================

-- Is the current JWT user part of Pexpacks staff?
-- Legacy admins (app_metadata.role = 'admin') remain staff until migrated.
create or replace function public.is_staff()
returns boolean
language sql stable security definer
as $$
  select (coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin')
      or exists (select 1 from public.user_roles where user_id = auth.uid())
$$;

-- Effective permission check with explicit deny overrides.
create or replace function public.has_permission(p_key text)
returns boolean
language sql stable security definer
as $$
  select case
    when exists (
      select 1 from public.user_permissions up
      join public.permissions p on p.id = up.permission_id
      where up.user_id = auth.uid() and p.key = p_key
    ) then coalesce((
      select up.granted from public.user_permissions up
      join public.permissions p on p.id = up.permission_id
      where up.user_id = auth.uid() and p.key = p_key
      limit 1
    ), false)
    else exists (
      select 1 from public.user_roles ur
      join public.role_permissions rp on rp.role_id = ur.role_id
      join public.permissions p on p.id = rp.permission_id
      where ur.user_id = auth.uid() and p.key = p_key
    )
  end
$$;

-- Grant a role to a user and keep the auth.users JWT claim in sync.
create or replace function public.grant_role(target_user_id uuid, role_slug text, granted_by uuid default null)
returns void
language plpgsql security definer
as $$
declare v_role_id uuid;
begin
  select id into v_role_id from public.roles where slug = role_slug;
  if v_role_id is null then
    raise exception 'Unknown role: %', role_slug;
  end if;
  insert into public.user_roles (user_id, role_id, created_by)
  values (target_user_id, v_role_id, granted_by)
  on conflict (user_id, role_id) do nothing;
  update auth.users set raw_app_meta_data =
    raw_app_meta_data || jsonb_build_object('roles',
      coalesce(raw_app_meta_data -> 'roles', '[]'::jsonb) || jsonb_build_array(role_slug))
  where id = target_user_id;
end;
$$;

create or replace function public.revoke_role(target_user_id uuid, role_slug text)
returns void
language plpgsql security definer
as $$
declare v_role_id uuid;
begin
  select id into v_role_id from public.roles where slug = role_slug;
  if v_role_id is not null then
    delete from public.user_roles where user_id = target_user_id and role_id = v_role_id;
  end if;
  update auth.users set raw_app_meta_data =
    raw_app_meta_data || jsonb_build_object('roles',
      coalesce(raw_app_meta_data -> 'roles', '[]'::jsonb) - role_slug)
  where id = target_user_id;
end;
$$;

-- Explicit per-user permission override (granted = true | false).
create or replace function public.set_user_permission(target_user_id uuid, permission_key text, granted boolean, granted_by uuid default null)
returns void
language plpgsql security definer
as $$
declare v_permission_id uuid;
begin
  select id into v_permission_id from public.permissions where key = permission_key;
  if v_permission_id is null then
    raise exception 'Unknown permission: %', permission_key;
  end if;
  insert into public.user_permissions (user_id, permission_id, granted, created_by)
  values (target_user_id, v_permission_id, granted, granted_by)
  on conflict (user_id, permission_id)
  do update set granted = excluded.granted, created_by = excluded.created_by,
                created_at = timezone('utc'::text, now());
end;
$$;

-- ===================================================
-- 3. WEBSITE CONTENT (Headless CMS)
-- ===================================================

create table if not exists public.website_content (
  id uuid default gen_random_uuid() primary key,
  key text not null unique,                 -- 'hero', 'cta', 'footer', 'navigation', 'seo_defaults', 'company_info', 'contact_details', ...
  title text not null default '',
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.testimonials (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null default '',
  quote text not null,
  rating smallint not null default 5 check (rating between 1 and 5),
  visible boolean not null default true,
  sort_order integer not null default 0,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.faqs (
  id uuid default gen_random_uuid() primary key,
  question text not null,
  answer text not null,
  category text not null default 'general',
  visible boolean not null default true,
  sort_order integer not null default 0,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ===================================================
-- 4. ASSET LIBRARY
-- ===================================================

create table if not exists public.assets (
  id uuid default gen_random_uuid() primary key,
  name text not null,                       -- human friendly name
  bucket text not null default 'school-assets',
  folder text not null default 'misc',      -- 'logos' | 'school-pdfs' | 'gallery' | 'documents' | 'pack-images' | 'hero' | ...
  path text not null unique,                -- 'logos/<filename>'
  public_url text,
  mime_type text,
  size_bytes bigint not null default 0,
  width integer,
  height integer,
  alt_text text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ===================================================
-- 5. AUDIT LOGS
-- ===================================================

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  actor_id uuid references auth.users(id) on delete set null,
  actor_name text,
  action text not null,                     -- 'create'|'update'|'delete'|'login'|'permission_change'|'upload'|'csv_import'|'export'|...
  entity_type text not null,                -- 'school'|'pack'|'item'|'order'|'user'|'asset'|'content'|'role'|'settings'|...
  entity_id text,
  summary text not null,
  details jsonb,
  ip text,
  user_agent text
);

create index if not exists idx_audit_logs_created_at on public.audit_logs (created_at desc);
create index if not exists idx_audit_logs_entity on public.audit_logs (entity_type, entity_id);
create index if not exists idx_audit_logs_actor on public.audit_logs (actor_id);

-- ===================================================
-- 6. SCHOOLS — extend existing table with CMS fields
-- ===================================================

alter table public.schools add column if not exists district text;
alter table public.schools add column if not exists address text;
alter table public.schools add column if not exists email text;
alter table public.schools add column if not exists telephone text;
alter table public.schools add column if not exists principal text;
alter table public.schools add column if not exists description text;
alter table public.schools add column if not exists status text not null default 'active'; -- 'active'|'archived'|'pending'
alter table public.schools add column if not exists partner_since date;
alter table public.schools add column if not exists latitude double precision;
alter table public.schools add column if not exists longitude double precision;
alter table public.schools add column if not exists published boolean not null default true;
alter table public.schools add column if not exists updated_by uuid references auth.users(id) on delete set null;

-- ===================================================
-- 7. STATIONERY PACKS & ITEMS
-- ===================================================

create table if not exists public.stationery_packs (
  id uuid default gen_random_uuid() primary key,
  school_id uuid references public.schools(id) on delete cascade,
  title text not null,
  slug text unique,
  description text,
  price numeric(10,2) not null default 0,
  stock integer not null default 0,
  featured boolean not null default false,
  visible boolean not null default true,
  academic_year text,
  delivery_type text not null default 'School collection',
  pack_image text,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.stationery_items (
  id uuid default gen_random_uuid() primary key,
  pack_id uuid not null references public.stationery_packs(id) on delete cascade,
  name text not null,
  description text,
  quantity integer not null default 1,
  unit_price numeric(10,2),
  image text,
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_stationery_packs_school on public.stationery_packs (school_id);
create index if not exists idx_stationery_items_pack on public.stationery_items (pack_id);
create index if not exists idx_schools_slug on public.schools (slug);
create index if not exists idx_schools_status on public.schools (status);

-- ===================================================
-- 8. AGGREGATE RPCs (server-side, avoid shipping whole tables)
-- ===================================================

create or replace function public.get_orders_daily(from_date date, to_date date)
returns table (day date, order_count bigint, revenue numeric)
language sql stable security definer
as $$
  select date_trunc('day', created_at)::date as day,
         count(*)::bigint as order_count,
         coalesce(sum(case when status = 'paid' then estimated_total else 0 end), 0)::numeric as revenue
  from public.orders
  where created_at >= from_date
    and created_at < (to_date + interval '1 day')
  group by 1
  order by 1
$$;

create or replace function public.get_orders_by_pack_type()
returns table (pack_type text, order_count bigint)
language sql stable security definer
as $$
  select coalesce(nullif(pack_type, ''), 'custom') as pack_type,
         count(*)::bigint as order_count
  from public.orders
  group by 1
  order by 2 desc
$$;

create or replace function public.get_schools_by_city()
returns table (city text, school_count bigint)
language sql stable security definer
as $$
  select nullif(city, '') as city,
         count(*)::bigint as school_count
  from public.schools
  group by 1
  order by 2 desc
$$;

-- ===================================================
-- 9. ROW LEVEL SECURITY
-- ===================================================

-- roles / permissions: staff can read; management goes through service-role
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.user_permissions enable row level security;
alter table public.assigned_forms enable row level security;

drop policy if exists "Staff read roles" on public.roles;
create policy "Staff read roles" on public.roles for select to authenticated using (public.is_staff());
drop policy if exists "Staff read permissions" on public.permissions;
create policy "Staff read permissions" on public.permissions for select to authenticated using (public.is_staff());
drop policy if exists "Staff read role_permissions" on public.role_permissions;
create policy "Staff read role_permissions" on public.role_permissions for select to authenticated using (public.is_staff());

drop policy if exists "Staff read user_roles" on public.user_roles;
create policy "Staff read user_roles" on public.user_roles for select to authenticated using (public.is_staff());
drop policy if exists "Role managers write user_roles" on public.user_roles;
create policy "Role managers write user_roles" on public.user_roles
  for all to authenticated using (public.has_permission('users.edit')) with check (public.has_permission('users.edit'));

drop policy if exists "Staff read user_permissions" on public.user_permissions;
create policy "Staff read user_permissions" on public.user_permissions for select to authenticated using (public.is_staff());
drop policy if exists "Role managers write user_permissions" on public.user_permissions;
create policy "Role managers write user_permissions" on public.user_permissions
  for all to authenticated using (public.has_permission('users.edit')) with check (public.has_permission('users.edit'));

drop policy if exists "Staff read assigned_forms" on public.assigned_forms;
create policy "Staff read assigned_forms" on public.assigned_forms for select to authenticated using (public.is_staff());
drop policy if exists "Role managers write assigned_forms" on public.assigned_forms;
create policy "Role managers write assigned_forms" on public.assigned_forms
  for all to authenticated using (public.has_permission('forms.assign')) with check (public.has_permission('forms.assign'));

-- Public content: anyone can read; staff can write (server actions enforce granular permissions)
alter table public.website_content enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.assets enable row level security;
alter table public.schools enable row level security;
alter table public.stationery_packs enable row level security;
alter table public.stationery_items enable row level security;

drop policy if exists "Public read website_content" on public.website_content;
create policy "Public read website_content" on public.website_content for select to anon using (true);
drop policy if exists "Public read testimonials" on public.testimonials;
create policy "Public read testimonials" on public.testimonials for select to anon using (true);
drop policy if exists "Public read faqs" on public.faqs;
create policy "Public read faqs" on public.faqs for select to anon using (true);
drop policy if exists "Public read assets" on public.assets;
create policy "Public read assets" on public.assets for select to anon using (true);
drop policy if exists "Public read schools" on public.schools;
create policy "Public read schools" on public.schools for select to anon using (true);
drop policy if exists "Public read stationery_packs" on public.stationery_packs;
create policy "Public read stationery_packs" on public.stationery_packs for select to anon using (true);
drop policy if exists "Public read stationery_items" on public.stationery_items;
create policy "Public read stationery_items" on public.stationery_items for select to anon using (true);

-- Staff write policies (granular permission enforcement lives in server actions)
create policy "Staff write website_content" on public.website_content
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "Staff write testimonials" on public.testimonials
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "Staff write faqs" on public.faqs
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "Staff write assets" on public.assets
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "Staff write schools" on public.schools
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "Staff write stationery_packs" on public.stationery_packs
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "Staff write stationery_items" on public.stationery_items
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- audit_logs: staff read only (writes happen through service-role server actions)
alter table public.audit_logs enable row level security;
drop policy if exists "Staff read audit_logs" on public.audit_logs;
create policy "Staff read audit_logs" on public.audit_logs for select to authenticated using (public.is_staff());

-- orders & form_submissions: keep public insert; broaden admin-only access to all staff
drop policy if exists "Admins have full access to orders" on public.orders;
drop policy if exists "Admin full access to orders" on public.orders;
drop policy if exists "Staff have full access to orders" on public.orders;
create policy "Staff have full access to orders" on public.orders
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Admins have full access to submissions" on public.form_submissions;
drop policy if exists "Admin full access to submissions" on public.form_submissions;
drop policy if exists "Staff have full access to submissions" on public.form_submissions;
create policy "Staff have full access to submissions" on public.form_submissions
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ===================================================
-- 10. STORAGE — school-assets bucket + tightened staff access
-- ===================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'school-assets',
  'school-assets',
  true,
  10485760, -- 10 MB
  '{image/png,image/webp,image/svg+xml,image/jpeg,application/pdf}'
)
on conflict (id) do nothing;

-- Replace the previous "any authenticated user, all buckets" policy with staff-only access.
drop policy if exists "Admin all storage access" on storage.objects;
drop policy if exists "Staff access all storage" on storage.objects;
create policy "Staff access all storage"
  on storage.objects for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Public read for the new bucket (existing public-read policies for blog-images/school-logos remain).
drop policy if exists "Public read school-assets" on storage.objects;
create policy "Public read school-assets"
  on storage.objects for select to anon using (bucket_id = 'school-assets');
