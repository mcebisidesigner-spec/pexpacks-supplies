-- ==============================================================================
-- Pexpacks Supplies — Content CMS Migration
-- Migration 00087: cms_announcements, cms_faqs, cms_testimonials, cms_resources
-- ==============================================================================

BEGIN;

-- 1. Eyebrow Banners & Announcements
CREATE TABLE IF NOT EXISTS public.cms_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_text TEXT NOT NULL, -- e.g. "Pre-Orders Open"
  message TEXT NOT NULL,    -- e.g. "Save up to 15% on 2027 Grade Stationery Packs until Sept 30"
  link_url TEXT,
  link_label TEXT,
  is_active BOOLEAN DEFAULT true,
  display_location TEXT DEFAULT 'global_top' CHECK (display_location IN ('global_top', 'hero_banner', 'schools_page')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 2. Frequently Asked Questions (FAQs)
CREATE TABLE IF NOT EXISTS public.cms_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL DEFAULT 'General', -- 'Ordering', 'Delivery & Pickup', 'School Packs', 'Payments'
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 3. Testimonials & Social Proof
CREATE TABLE IF NOT EXISTS public.cms_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL, -- e.g. "Parent at Primrose Hill Primary", "SGB Chairperson"
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  quote TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  avatar_url TEXT,
  is_featured BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 4. Resource Hub (Guides, Downloads, Parent Checklists)
CREATE TABLE IF NOT EXISTS public.cms_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Parent Guides', -- 'Parent Guides', 'School Partnership Kits', 'Stationery Checklists'
  file_url TEXT NOT NULL,
  file_type TEXT DEFAULT 'PDF', -- 'PDF', 'DOCX', 'XLSX'
  file_size_label TEXT,         -- e.g. "1.4 MB"
  download_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_cms_announcements_active ON public.cms_announcements (display_location) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_cms_faqs_published ON public.cms_faqs (category, sort_order) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_cms_testimonials_featured ON public.cms_testimonials (sort_order) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_cms_resources_public ON public.cms_resources (category, sort_order) WHERE is_public = true;

-- Enable RLS
ALTER TABLE public.cms_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_resources ENABLE ROW LEVEL SECURITY;

-- Drop prior policies if exist
DROP POLICY IF EXISTS "Public read active CMS content" ON public.cms_announcements;
DROP POLICY IF EXISTS "Public read published FAQs" ON public.cms_faqs;
DROP POLICY IF EXISTS "Public read featured testimonials" ON public.cms_testimonials;
DROP POLICY IF EXISTS "Public read active resources" ON public.cms_resources;

DROP POLICY IF EXISTS "Admin full CMS access" ON public.cms_announcements;
DROP POLICY IF EXISTS "Admin full FAQ access" ON public.cms_faqs;
DROP POLICY IF EXISTS "Admin full Testimonial access" ON public.cms_testimonials;
DROP POLICY IF EXISTS "Admin full Resource access" ON public.cms_resources;

-- RLS Read Policies
CREATE POLICY "Public read active CMS content" ON public.cms_announcements FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Public read published FAQs" ON public.cms_faqs FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Public read featured testimonials" ON public.cms_testimonials FOR SELECT TO anon, authenticated USING (is_featured = true);
CREATE POLICY "Public read active resources" ON public.cms_resources FOR SELECT TO anon, authenticated USING (is_public = true);

-- RLS Admin Policies
CREATE POLICY "Admin full CMS access" ON public.cms_announcements FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full FAQ access" ON public.cms_faqs FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full Testimonial access" ON public.cms_testimonials FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full Resource access" ON public.cms_resources FOR ALL TO authenticated USING (true);

-- Seed Initial Announcement
INSERT INTO public.cms_announcements (badge_text, message, link_url, link_label, is_active, display_location)
SELECT 'Back-to-School 2027', 'Pre-orders are open! Complete grade stationery packs packed to official school specifications.', '/schools', 'Find Your School', true, 'global_top'
WHERE NOT EXISTS (SELECT 1 FROM public.cms_announcements LIMIT 1);

-- Seed Initial FAQs (migrating from existing or default if empty)
INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published)
SELECT 'Ordering', 'How do I order my child''s official grade stationery pack?', 'Simply select your school, choose your learner''s grade, review the teacher-approved stationery items, and click Add Pack to Tray or customize items before checkout.', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question LIKE '%stationery pack%');

INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published)
SELECT 'Delivery & Pickup', 'When and where will the packs be delivered?', 'Packs are delivered directly to your doorstep or available for coordinated collection at your participating partner school before the first day of term.', 2, true
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question LIKE '%delivered%');

INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published)
SELECT 'School Packs', 'What is Pexcover book covering?', 'Pexcover is our premium machine-fitted protective book covering service. Select Pexcover on eligible exercise books to receive them fully covered, protected, and labeled.', 3, true
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question LIKE '%Pexcover%');

INSERT INTO public.cms_faqs (category, question, answer, sort_order, is_published)
SELECT 'Payments', 'What payment methods do you accept?', 'We accept secure instant EFT via Ozow, Visa/Mastercard credit and debit cards, and interest-free BNPL split payments with Happy Pay.', 4, true
WHERE NOT EXISTS (SELECT 1 FROM public.cms_faqs WHERE question LIKE '%payment methods%');

-- Seed Initial Testimonials
INSERT INTO public.cms_testimonials (author_name, author_role, quote, rating, is_featured, sort_order)
SELECT 'Sarah Jenkins', 'Parent at Primrose Hill Primary', 'Saved me 3 days of running between stationery shops in January. Every single item matched the school list exactly!', 5, true, 1
WHERE NOT EXISTS (SELECT 1 FROM public.cms_testimonials WHERE author_name = 'Sarah Jenkins');

INSERT INTO public.cms_testimonials (author_name, author_role, quote, rating, is_featured, sort_order)
SELECT 'David Khumalo', 'SGB Chairperson', 'Partnering with Pexpacks streamlined our school''s stationery requirements. Parents love the convenience and transparent pricing.', 5, true, 2
WHERE NOT EXISTS (SELECT 1 FROM public.cms_testimonials WHERE author_name = 'David Khumalo');

-- Seed Initial Resources
INSERT INTO public.cms_resources (title, description, category, file_url, file_type, file_size_label, is_public, sort_order)
SELECT '2027 Back-to-School Readiness Checklist', 'Essential checklist for parents covering stationery, uniform prep, and term calendar dates.', 'Parent Guides', '/assets/guides/back-to-school-checklist.pdf', 'PDF', '1.2 MB', true, 1
WHERE NOT EXISTS (SELECT 1 FROM public.cms_resources WHERE title LIKE '%Readiness Checklist%');

INSERT INTO public.cms_resources (title, description, category, file_url, file_type, file_size_label, is_public, sort_order)
SELECT 'School Partnership Kit & Stationery Pack Agreement', 'Comprehensive onboarding guide for school administrators and SGBs interested in partnering with Pexpacks.', 'School Partnership Kits', '/assets/guides/school-partnership-kit.pdf', 'PDF', '2.8 MB', true, 2
WHERE NOT EXISTS (SELECT 1 FROM public.cms_resources WHERE title LIKE '%Partnership Kit%');

COMMIT;
