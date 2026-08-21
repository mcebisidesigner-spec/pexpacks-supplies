-- ============================================================================
-- 00041: Dedicated 2FA OTP Tokens Table
-- ============================================================================

create table if not exists public.auth_otp_tokens (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  otp_code text not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.auth_otp_tokens enable row level security;

drop policy if exists "Service role manage auth_otp_tokens" on public.auth_otp_tokens;
create policy "Service role manage auth_otp_tokens"
  on public.auth_otp_tokens
  for all
  to service_role
  using (true)
  with check (true);

create index if not exists idx_auth_otp_tokens_lookup
  on public.auth_otp_tokens (email, otp_code, used, expires_at desc);

comment on table public.auth_otp_tokens is
  'Stores 6-digit administrative 2FA security tokens for physical email OTP verification.';
