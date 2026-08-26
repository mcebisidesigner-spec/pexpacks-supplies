-- Migration 00047: Discontinue lay-by and waitlist features
-- 1. Drop unused lay_by_applications and waitlist_entries tables
DROP TABLE IF EXISTS public.lay_by_applications CASCADE;
DROP TABLE IF EXISTS public.waitlist_entries CASCADE;

-- 2. Remove discontinued savings plan & lay-by FAQs from active CMS knowledge base
DELETE FROM public.faqs WHERE category = 'Savings Plan' OR slug LIKE 'savings-plan%';
