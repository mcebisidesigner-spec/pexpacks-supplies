-- Migration 00067: Standardize custom_badge search pill across all schools
-- Maps to the DB "Search Pill Badge" input field
UPDATE public.schools
SET custom_badge = '2026 Packs'
WHERE custom_badge IS NULL OR trim(custom_badge) = '' OR custom_badge = 'Awaiting List';

ALTER TABLE public.schools
ALTER COLUMN custom_badge SET DEFAULT '2026 Packs';
