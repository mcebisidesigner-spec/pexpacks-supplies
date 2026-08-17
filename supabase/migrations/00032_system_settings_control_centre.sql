-- 00032_system_settings_control_centre.sql
-- Creates system_settings and system_settings_audit tables for Pexpacks System Control Centre

CREATE TYPE public.setting_scope AS ENUM ('global', 'season', 'school', 'category', 'product');
CREATE TYPE public.setting_value_type AS ENUM ('string', 'number', 'boolean', 'json', 'email', 'percentage', 'currency');

-- 1. Main System Settings Registry Table
CREATE TABLE IF NOT EXISTS public.system_settings (
  key VARCHAR(120) PRIMARY KEY,
  category VARCHAR(60) NOT NULL,
  value JSONB NOT NULL,
  value_type public.setting_value_type NOT NULL DEFAULT 'string',
  scope public.setting_scope NOT NULL DEFAULT 'global',
  scope_id VARCHAR(100) NULL,
  description TEXT NOT NULL,
  is_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INT NOT NULL DEFAULT 1
);

-- 2. Audit Trail Table for Settings Modifications
CREATE TABLE IF NOT EXISTS public.system_settings_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(120) NOT NULL REFERENCES public.system_settings(key) ON DELETE CASCADE,
  old_value JSONB,
  new_value JSONB NOT NULL,
  change_reason TEXT,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast category lookups, public settings fetching, and audit histories
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON public.system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_public ON public.system_settings(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_system_settings_audit_key ON public.system_settings_audit(setting_key, created_at DESC);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public read access for public settings only
CREATE POLICY "Public read for public system settings"
  ON public.system_settings FOR SELECT
  USING (is_public = TRUE);

-- RLS Policy: Full access for service role and authorized admins
CREATE POLICY "Admin full access for system settings"
  ON public.system_settings FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Admin full access for system settings audit"
  ON public.system_settings_audit FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'authenticated');

-- Seed Initial Default System Settings
INSERT INTO public.system_settings (key, category, value, value_type, scope, description, is_sensitive, is_public, requires_approval) VALUES
  ('general.site_name', 'general', '"Pexpacks"'::jsonb, 'string', 'global', 'Primary customer-facing brand name', false, true, false),
  ('general.site_url', 'general', '"https://pexpacks.co.za"'::jsonb, 'string', 'global', 'Official web application canonical URL', false, true, false),
  ('general.locale', 'general', '"en-ZA"'::jsonb, 'string', 'global', 'Default application locale', false, true, false),
  ('general.timezone', 'general', '"Africa/Johannesburg"'::jsonb, 'string', 'global', 'Default application timezone', false, false, false),
  ('business.trading_name', 'business', '"Pexpacks Supplies (Pty) Ltd"'::jsonb, 'string', 'global', 'Official legal trading entity name', false, true, false),
  ('business.support_email', 'business', '"helpme@pexpacks.co.za"'::jsonb, 'email', 'global', 'Primary customer support contact email', false, true, false),
  ('business.legal_email', 'business', '"care@pexpacks.co.za"'::jsonb, 'email', 'global', 'POPIA & legal compliance contact email', false, true, false),
  ('business.support_phone', 'business', '"0780036048"'::jsonb, 'string', 'global', 'Customer support helpline telephone number', false, true, false),
  ('business.whatsapp_number', 'business', '"27780036048"'::jsonb, 'string', 'global', 'WhatsApp customer support channel number', false, true, false),
  ('pricing.default_method', 'pricing', '"margin"'::jsonb, 'string', 'global', 'Default pricing calculation method (markup vs gross margin)', true, false, true),
  ('pricing.target_margin_pct', 'pricing', '32.0'::jsonb, 'percentage', 'global', 'Target gross margin percentage for suggested selling prices', true, false, true),
  ('pricing.low_margin_warning_pct', 'pricing', '20.0'::jsonb, 'percentage', 'global', 'Threshold percentage below which items trigger low-margin alerts', false, false, false),
  ('pricing.critical_margin_pct', 'pricing', '10.0'::jsonb, 'percentage', 'global', 'Critical margin floor requiring superuser approval', true, false, true),
  ('pricing.verify_days', 'pricing', '90'::jsonb, 'number', 'global', 'Number of days before supplier quotes are flagged as stale', false, false, false),
  ('pricing.pexcover_price', 'pricing', '350.00'::jsonb, 'currency', 'global', 'PexCover insurance protection item price in Rands', false, true, false),
  ('seasons.active_season', 'seasons', '"2027 Back-to-School"'::jsonb, 'string', 'global', 'Default active commercial & back-to-school season', false, true, true),
  ('orders.default_fulfilment', 'orders', '"School collection"'::jsonb, 'string', 'global', 'Default selected fulfilment method at checkout', false, true, false),
  ('orders.idle_timeout_mins', 'orders', '20'::jsonb, 'number', 'global', 'Inactivity timeout in minutes before admin session logout', false, false, false),
  ('procurement.payment_required', 'procurement', 'true'::jsonb, 'boolean', 'global', 'Enforce full order payment before generating procurement demands', true, false, true)
ON CONFLICT (key) DO NOTHING;
