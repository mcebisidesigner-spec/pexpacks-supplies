-- ===================================================
-- Pexpacks Supplies — Enterprise Admin & Headless CMS
-- Migration 00008: App settings + audit indexes
-- ===================================================

-- ===================================================
-- 1. APP SETTINGS (system-wide configuration)
-- ===================================================

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.app_settings enable row level security;

drop policy if exists "Staff read app_settings" on public.app_settings;
create policy "Staff read app_settings"
  on public.app_settings
  for select to authenticated
  using (public.is_staff());

drop policy if exists "Staff write app_settings" on public.app_settings;
create policy "Staff write app_settings"
  on public.app_settings
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

insert into public.app_settings (key, value) values
  (
    'general',
    '{"site_name":"Pexpacks","support_email":"helpme@pexpacks.co.za","support_phone":"","site_url":"https://pexpacks.co.za"}'::jsonb
  ),
  (
    'ordering',
    '{"default_fulfilment_option":"School collection","pexcover_enabled":true,"currency":"ZAR"}'::jsonb
  )
on conflict (key) do nothing;

-- ===================================================
-- 2. AUDIT LOG — extra filter indexes
-- ===================================================

create index if not exists idx_audit_logs_action on public.audit_logs (action);
