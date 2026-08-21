-- ============================================================================
-- 00040: Security Audit Logs & Back-Office RLS Security Hardening
-- ============================================================================

-- 1. Security Audit Logs Table -----------------------------------------------

create table if not exists public.security_audit_logs (
  id uuid primary key default gen_random_uuid(),
  ip_address text not null,
  user_agent text,
  event_type text not null check (event_type in ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'OTP_FAILED', 'RATE_LIMITED', 'PASSWORD_VERIFIED', 'UNAUTHORIZED_ACCESS', 'OTP_RESENT')),
  email_masked text,
  user_id uuid references auth.users(id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.security_audit_logs enable row level security;

drop policy if exists "Staff read security_audit_logs" on public.security_audit_logs;
create policy "Staff read security_audit_logs"
  on public.security_audit_logs
  for select
  to authenticated
  using (public.has_permission('audit.view'));

drop policy if exists "Service role manage security_audit_logs" on public.security_audit_logs;
create policy "Service role manage security_audit_logs"
  on public.security_audit_logs
  for all
  to service_role
  using (true)
  with check (true);

create index if not exists idx_security_audit_logs_ip_created
  on public.security_audit_logs (ip_address, created_at desc);

create index if not exists idx_security_audit_logs_event
  on public.security_audit_logs (event_type, created_at desc);

-- 2. Scalar RLS Policy Enforcement for Back-Office Data ----------------------

alter table public.orders enable row level security;

drop policy if exists "Admin full access for orders" on public.orders;
create policy "Admin full access for orders"
  on public.orders
  for all
  to authenticated
  using (
    (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'super_admin')
    or public.has_permission('orders.view')
  )
  with check (
    (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'super_admin')
    or public.has_permission('orders.edit')
  );

drop policy if exists "Service role full access for orders" on public.orders;
create policy "Service role full access for orders"
  on public.orders
  for all
  to service_role
  using (true)
  with check (true);

comment on table public.security_audit_logs is
  'Tracks authentication attempts, 2FA failures, rate limit events, and security audit metrics for administrative routes.';
