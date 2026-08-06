-- Add custom_badge column to schools table for custom search tray pill text
alter table public.schools add column if not exists custom_badge text default '2026 Packs';
