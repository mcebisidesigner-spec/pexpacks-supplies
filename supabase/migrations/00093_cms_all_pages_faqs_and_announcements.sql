-- Migration 00093: CMS All Pages FAQs and Announcement Placements
-- ============================================================================
-- 1. Expands target_page on cms_faqs to support all app pages with FAQs:
--    'all', 'homepage', 'schools', 'track_order', 'happy_pay', 'add_your_school', 'partnership'
-- 2. Seeds initial FAQs for Happy Pay, Partnerships, Track Order, and Add Your School
-- 3. Updates get_public_cms_faqs(p_page text) to query any target page
-- 4. Ensures unique index for hero_banner announcements
-- 5. Updates get_public_cms_announcements(p_location text) for exact placement matching
-- ============================================================================

-- Expand check constraint on cms_faqs
ALTER TABLE public.cms_faqs DROP CONSTRAINT IF EXISTS cms_faqs_target_page_check;
ALTER TABLE public.cms_faqs
  ADD CONSTRAINT cms_faqs_target_page_check
  CHECK (target_page IN (
    'all',
    'homepage',
    'schools',
    'track_order',
    'happy_pay',
    'add_your_school',
    'partnership'
  ));

-- Seed Happy Pay FAQs (9 items)
INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'Payments', 'What is Happy Pay?', 'Happy Pay is a South African Buy Now Pay Later (BNPL) provider. With Pexpacks, it lets you split your order total into 2 equal, interest-free payments — 50% today and 50% in 30 days.', 1, true, 'published', 'happy_pay'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'What is Happy Pay?');

INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'Payments', 'How do the two payments work?', 'At checkout you pay your first 50%. Happy Pay settles your full order with Pexpacks immediately, so your packs are dispatched right away. Your second 50% is collected automatically 30 days later.', 2, true, 'published', 'happy_pay'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'How do the two payments work?');

INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'Payments', 'Are there any interest charges or fees?', 'No. There is 0% interest and no application fee. If a scheduled payment is ever missed, a late fee may apply in line with Happy Pay’s terms — but the price you pay for your packs never increases.', 3, true, 'published', 'happy_pay'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'Are there any interest charges or fees?');

INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'Payments', 'Will using Happy Pay affect my credit score?', 'No. Checking your eligibility and splitting your payment with Happy Pay does not impact your credit score.', 4, true, 'published', 'happy_pay'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'Will using Happy Pay affect my credit score?');

INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'Payments', 'How long does approval take?', 'Approval typically takes under 60 seconds. You’ll receive an instant decision at checkout, and if approved, your first instalment is paid immediately.', 5, true, 'published', 'happy_pay'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'How long does approval take?');

INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'Payments', 'Who can use Happy Pay?', 'You need to be 18 years or older, a South African resident, and pay with a South African bank card. Eligibility is determined by Happy Pay at checkout.', 6, true, 'published', 'happy_pay'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'Who can use Happy Pay?');

INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'Payments', 'What happens if my second payment cannot be processed?', 'Happy Pay will attempt to collect the instalment again and may charge a late fee if it remains unpaid. Your order is never affected — your packs have already been dispatched to you.', 7, true, 'published', 'happy_pay'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'What happens if my second payment cannot be processed?');

INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'Delivery & Pickup', 'When will I receive my packs with Happy Pay?', 'Right away. Because Happy Pay settles your full order with Pexpacks today, your pack is prepared and dispatched as soon as packing is complete — you don’t wait for the second payment.', 8, true, 'published', 'happy_pay'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'When will I receive my packs with Happy Pay?');

INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'Payments', 'Is my card and personal information safe?', 'Completely. Happy Pay uses bank-grade 256-bit SSL encryption and complies with the Protection of Personal Information Act (POPIA). Pexpacks never sees or stores your card details.', 9, true, 'published', 'happy_pay'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'Is my card and personal information safe?');

-- Seed Partnerships FAQs (5 items)
INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'School Packs', 'Is the website and hosting really 100% free?', 'Yes. Zero setup costs, monthly fees, or hidden charges. Pexpacks covers all development and hosting costs out of our standard stationery margins.', 1, true, 'published', 'partnership'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'Is the website and hosting really 100% free?');

INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'School Packs', 'How does the 1.5% rebate work?', 'Every time a parent orders through your school portal, 1.5% of the pack cost goes to your school’s development fund. We transfer it annually.', 2, true, 'published', 'partnership'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'How does the 1.5% rebate work?');

INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'Ordering', 'Does this create admin work for my staff?', 'None. We handle packing, delivery, payments, and parent support. Your staff do nothing after sharing the link.', 3, true, 'published', 'partnership'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'Does this create admin work for my staff?');

INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'Ordering', 'How long does it take to go live?', 'Once we receive your grade lists, we typically launch your school portal within 96 hours.', 4, true, 'published', 'partnership'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'How long does it take to go live?');

INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'Ordering', 'What happens after I apply?', 'We review your enquiry and get in touch to confirm your grade lists and launch your school portal. There is nothing to pay at any point.', 5, true, 'published', 'partnership'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'What happens after I apply?');

-- Seed Track Order FAQs (4 items)
INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'Delivery & Pickup', 'How do I track my order delivery?', 'Enter your order number or phone number in the search bar above to see live updates on your pack preparation and delivery status.', 1, true, 'published', 'track_order'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'How do I track my order delivery?');

INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'Delivery & Pickup', 'What do the different order statuses mean?', 'Processing means your pack is being picked and checked. Dispatched means it is with the courier. Delivered means it has arrived at your address or school.', 2, true, 'published', 'track_order'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'What do the different order statuses mean?');

INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'Delivery & Pickup', 'Can I change my delivery address after ordering?', 'If your order is still in processing, contact support immediately at support@pexpacks.co.za with your order number to update your address.', 3, true, 'published', 'track_order'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'Can I change my delivery address after ordering?');

INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'Delivery & Pickup', 'What if I am not home when the courier arrives?', 'The courier will call you and attempt delivery again the next business day, or arrange a convenient collection point.', 4, true, 'published', 'track_order'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'What if I am not home when the courier arrives?');

-- Seed Add Your School FAQs (5 items)
INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'School Packs', 'What if my school is not listed yet?', 'You can submit your school name and official stationery list right here. We will review and set up your school pack within 48 hours.', 1, true, 'published', 'add_your_school'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'What if my school is not listed yet?');

INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'School Packs', 'How do I send my child’s stationery list?', 'Upload a photo or PDF of the school list using the form on this page, or email it to lists@pexpacks.co.za.', 2, true, 'published', 'add_your_school'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'How do I send my child’s stationery list?');

INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'School Packs', 'Can any parent request a new school?', 'Yes! Any parent, teacher, or PTA member can submit their school stationery list to make ordering easy for the whole school.', 3, true, 'published', 'add_your_school'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'Can any parent request a new school?');

INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'Delivery & Pickup', 'How quickly will the pack be available for purchase?', 'Once our team verifies the list against teacher requirements, the grade pack goes live on our website in 24 to 48 hours.', 4, true, 'published', 'add_your_school'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'How quickly will the pack be available for purchase?');

INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published, status, target_page)
SELECT 'School Packs', 'Does the school need to approve the pack?', 'We cross-reference every item directly with the official school booklist to ensure 100% compliance with teacher guidelines.', 5, true, 'published', 'add_your_school'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question = 'Does the school need to approve the pack?');

-- Replace RPC to accept any target page
DROP FUNCTION IF EXISTS public.get_public_cms_faqs();
DROP FUNCTION IF EXISTS public.get_public_cms_faqs(text);

CREATE OR REPLACE FUNCTION public.get_public_cms_faqs(p_page text DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  category text,
  question text,
  answer text,
  sort_order integer,
  target_page text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    f.id,
    f.category,
    f.question,
    f.answer,
    COALESCE(f.sort_order, 0) AS sort_order,
    f.target_page
  FROM public.cms_faqs f
  WHERE f.status = 'published'
    AND f.is_published = true
    AND f.published_at <= timezone('utc', now())
    AND (f.expires_at IS NULL OR f.expires_at > timezone('utc', now()))
    AND (
      p_page IS NULL
      OR p_page = 'all'
      OR f.target_page = 'all'
      OR f.target_page = p_page
    )
  ORDER BY COALESCE(f.sort_order, 0), f.created_at;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_cms_faqs(text) TO anon, authenticated, service_role;

-- Announcement unique index for hero_banner
DROP INDEX IF EXISTS idx_cms_announcements_one_active_hero_banner;
CREATE UNIQUE INDEX idx_cms_announcements_one_active_hero_banner
  ON public.cms_announcements (display_location)
  WHERE display_location = 'hero_banner' AND is_active = true AND status = 'published';

-- Replace get_public_cms_announcements to ensure exact placement mapping
DROP FUNCTION IF EXISTS public.get_public_cms_announcements();
DROP FUNCTION IF EXISTS public.get_public_cms_announcements(text);

CREATE OR REPLACE FUNCTION public.get_public_cms_announcements(p_location text DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  badge_text text,
  message text,
  link_url text,
  link_label text,
  display_location text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.id, a.badge_text, a.message, a.link_url, a.link_label, a.display_location
  FROM public.cms_announcements a
  WHERE a.status = 'published'
    AND a.is_active = true
    AND a.published_at <= timezone('utc', now())
    AND (a.expires_at IS NULL OR a.expires_at > timezone('utc', now()))
    AND (
      p_location IS NULL
      OR p_location = 'all'
      OR (p_location = 'site_header' AND a.display_location = 'global_top')
      OR a.display_location = p_location
    )
  ORDER BY a.updated_at DESC, a.created_at DESC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_cms_announcements(text) TO anon, authenticated, service_role;
