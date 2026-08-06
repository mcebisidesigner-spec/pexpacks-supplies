-- ===================================================
-- Pexpacks Supplies — Enterprise Admin & Headless CMS
-- Migration 00009: Growth — Website Content, Assets, Reports
-- ===================================================
-- Adds CMS columns + seed data for testimonials/FAQs, seeds
-- website_content defaults, and adds report RPCs.

-- ===================================================
-- 1. TESTIMONIALS — preserve data/ shape (context, avatar)
-- ===================================================

alter table public.testimonials add column if not exists context text not null default '';
alter table public.testimonials add column if not exists avatar text;

insert into public.testimonials (name, role, context, quote, rating, visible, sort_order)
select v.name, v.role, v.context, v.quote, v.rating, v.visible, v.sort_order
from (values
  ('Mbuso Dlamini', 'Parent', 'Grade 01 learner', 'Pexpacks made back-to-school preparation simple. Everything was packed clearly and ready before the first day of school.', 5, true, 1),
  ('Sarah van der Merwe', 'Teacher', 'Primary school educator', 'When learners arrive with the correct stationery, teaching can begin immediately. Pexpacks helps remove that first-week stress.', 5, true, 2),
  ('Riya Patel', 'Parent', 'Grade 10 learner', 'Pexpacks is a game changer for parents. I was able to order everything my daughter needed for school from the comfort of my home and everything was packed clearly and ready before the first day of school.', 5, true, 3),
  ('Mpoh Pitso', 'School Administrator', 'School Support Team', 'A structured stationery pack system reduces confusion for parents and helps learners start the year prepared.', 5, true, 4)
) as v(name, role, context, quote, rating, visible, sort_order)
where not exists (
  select 1 from public.testimonials t where t.name = v.name and t.quote = v.quote
);

-- ===================================================
-- 2. FAQS — add slug (stable public key) + links jsonb
-- ===================================================

alter table public.faqs add column if not exists slug text;
alter table public.faqs add column if not exists links jsonb not null default '[]'::jsonb;
create unique index if not exists idx_faqs_slug on public.faqs (slug);

insert into public.faqs (slug, category, question, answer, links, visible, sort_order) values
  ('school-not-listed', 'School packs', 'What if my child''s school is not listed?', 'You can request the school and grade through the enquiry flow. Pexpacks will follow up and help prepare the closest correct stationery pack option.', '[{"label":"Search listed schools","href":"/schools"},{"label":"Contact Pexpacks","href":"/contact"}]', true, 1),
  ('delivery-timing', 'Delivery', 'How long does delivery take?', 'Delivery timing depends on the school season, pack availability and delivery area. Pexpacks confirms delivery or collection details during order follow-up.', '[{"label":"Delivery policy","href":"/delivery-policy"},{"label":"Track an order","href":"/track-order"}]', true, 2),
  ('exercise-books', 'School packs', 'Are exercise books included?', 'Yes, where the school or grade stationery list requires exercise books, they are included in the relevant pack contents.', '[{"label":"Find your school pack","href":"/schools"},{"label":"Learn about Pexcover","href":"/blog/what-is-pexcover-book-covering"}]', true, 3),
  ('stationery-quality', 'School packs', 'Are the stationery brands good quality?', 'Pexpacks focuses on practical, school-ready stationery that matches the agreed list requirements and is packed clearly for learners.', '[{"label":"Returns and refunds","href":"/returns-refunds-policy"},{"label":"Terms of use","href":"/terms"}]', true, 4),
  ('multiple-learners', 'Orders', 'Can I order for more than one learner?', 'Yes. You can submit the learners'' school, grade and pack details, and Pexpacks will follow up to confirm the combined order.', '[{"label":"Start an order","href":"/order"},{"label":"Find school packs","href":"/schools"}]', true, 5),
  ('school-list-submission', 'Schools', 'Can schools send Pexpacks their stationery lists?', 'Yes. Schools can use the partnership enquiry route to share grade lists so parents can order clearer, grade-specific stationery packs.', '[{"label":"School partnership","href":"/partnership"},{"label":"School partnership terms","href":"/school-partnership-terms"}]', true, 6),
  ('payment-flow', 'Payment', 'How does payment work?', 'The website currently captures an enquiry order. Pexpacks confirms availability, pricing, delivery details and payment instructions during follow-up.', '[{"label":"Start an order","href":"/order"},{"label":"Terms of use","href":"/terms"}]', true, 7),
  ('list-updates', 'School packs', 'Can items change if the school updates the list?', 'Yes. If the school updates its stationery list, Pexpacks can confirm the latest requirements before finalising the pack.', '[{"label":"Find your school","href":"/schools"},{"label":"Contact support","href":"/contact"}]', true, 8),
  ('find-grade-pack', 'School packs', 'How do I find the correct grade pack?', 'Search for your school, choose the learner''s grade, and review the pack details before submitting your order enquiry. If anything is unclear, Pexpacks can confirm the list before the order is finalised.', '[{"label":"Find your school","href":"/schools"},{"label":"Start an order","href":"/order"}]', true, 9),
  ('customise-pack', 'Orders', 'Can I customise a school pack?', 'Yes. If you only need selected items or want to adjust the pack, submit the enquiry with the details you need and Pexpacks will confirm availability and pricing.', '[{"label":"Custom order","href":"/order"},{"label":"Contact support","href":"/contact"}]', true, 10),
  ('delivery-areas', 'Delivery', 'Which areas do you deliver to?', 'Delivery depends on the school, area, order size, and seasonal availability. Pexpacks confirms the best delivery or collection option during order follow-up.', '[{"label":"Delivery policy","href":"/delivery-policy"},{"label":"Contact Pexpacks","href":"/contact"}]', true, 11),
  ('order-changes', 'Orders', 'Can I change an order after submitting it?', 'If the order has not yet been finalised or packed, Pexpacks can usually help update learner details, grade selection, quantities, or contact information.', '[{"label":"Contact support","href":"/contact"},{"label":"Returns and refunds","href":"/returns-refunds-policy"}]', true, 12),
  ('payment-before-packing', 'Payment', 'Do I pay before the pack is prepared?', 'Pexpacks confirms the order details, availability, delivery path, and payment instructions before finalising the pack preparation.', '[{"label":"Terms of use","href":"/terms"},{"label":"Start an order","href":"/order"}]', true, 13),
  ('proof-of-payment', 'Payment', 'Where do I send proof of payment?', 'Use the payment instructions provided during order follow-up. Include the learner or order reference where possible so the payment can be matched quickly.', '[{"label":"Track an order","href":"/track-order"},{"label":"Contact support","href":"/contact"}]', true, 14),
  ('book-covering-service', 'School packs', 'Can books be covered before delivery?', 'Where Pexcover is available, Pexpacks can help with book-covering support so learners receive neater, school-ready books.', '[{"label":"Learn about Pexcover","href":"/blog/what-is-pexcover-book-covering"},{"label":"Find your pack","href":"/schools"}]', true, 15),
  ('savings-plan-basics', 'Savings Plan', 'What is the Pexpacks Savings Plan?', 'The Savings Plan is a non-interest-bearing programme that lets you contribute money toward a future stationery pack order over time. Once your saved amount matches the order value, Pexpacks will pack and dispatch the order. It gives you more flexibility than paying the full amount upfront.', '[{"label":"Contact us","href":"/contact?topic=savings-plan"}]', true, 16),
  ('savings-plan-vs-layby', 'Savings Plan', 'How is this different from lay-by?', 'Unlike a traditional lay-by, goods in the Savings Plan are not reserved or packed until the balance is fully settled. This keeps things flexible: you can change your order, pause contributions, or request a full refund at any time before value match.', '[]', true, 17),
  ('savings-plan-start', 'Savings Plan', 'How do I start saving?', 'You can register interest during checkout or by contacting Pexpacks. Once enrolled, you will receive instructions on how to make deposits and track your savings balance.', '[{"label":"Contact us","href":"/contact?topic=savings-plan"}]', true, 18),
  ('savings-plan-refund', 'Savings Plan', 'Can I get my money back?', 'Yes. You can request a full refund of all deposits at any time before the order is value-matched or fulfilled. Refunds are processed within 14 business days to the original payment method where possible.', '[]', true, 19),
  ('savings-plan-value-match', 'Savings Plan', 'What happens when I reach the full order value?', 'Once your deposits match or exceed the order amount (value match), Pexpacks will contact you to confirm the order and begin packing and delivery. You can also choose to pay the outstanding balance early to speed things up.', '[{"label":"Delivery policy","href":"/delivery-policy"}]', true, 20),
  ('savings-plan-price-change', 'Savings Plan', 'What if the price changes while I am saving?', 'Prices are not locked in while you save. If the price changes before your order is settled, Pexpacks will notify you. You can then choose to pay the difference or receive a full refund of your deposits.', '[]', true, 21),
  ('school-rebate', 'Schools', 'How does the school partnership benefit schools?', 'The partnership model can reduce stationery admin for schools, give parents a clearer ordering path, and create a managed online experience around school lists and pack orders.', '[{"label":"School partnership","href":"/partnership"},{"label":"Partnership terms","href":"/school-partnership-terms"}]', true, 22)
on conflict (slug) do nothing;

-- ===================================================
-- 3. WEBSITE CONTENT — seed default section values
-- ===================================================

insert into public.website_content (key, title, value) values
  (
    'homepage.hero',
    'Homepage hero',
    '{"eyebrow":"School stationery made simple","title":"Your school stationery list, perfectly packed.","lead":"Your official school stationery list, perfectly packed and delivered."}'::jsonb
  ),
  (
    'homepage.announcement',
    'Announcement bar',
    '{"enabled":false,"text":""}'::jsonb
  ),
  (
    'company_info',
    'Company information',
    '{"site_name":"Pexpacks","support_email":"hello@pexpacks.co.za","support_phone":"","site_url":"https://pexpacks.co.za"}'::jsonb
  ),
  (
    'footer',
    'Footer',
    '{"about_text":"School stationery, packed and delivered.","copyright_text":"Pexpacks Supplies. All rights reserved."}'::jsonb
  ),
  (
    'seo_defaults',
    'SEO defaults',
    '{"default_title":"Pexpacks Supplies","default_description":"School stationery packs, listed and delivered."}'::jsonb
  )
on conflict (key) do nothing;

-- ===================================================
-- 4. REPORTS — aggregate RPCs (date ranged)
-- ===================================================

create or replace function public.get_orders_summary(from_date date, to_date date)
returns table (total_orders bigint, paid_orders bigint, refunded_orders bigint, cancelled_orders bigint, revenue numeric, avg_order_value numeric)
language sql stable security definer
as $$
  select
    count(*)::bigint as total_orders,
    count(*) filter (where status = 'paid')::bigint as paid_orders,
    count(*) filter (where status = 'refunded')::bigint as refunded_orders,
    count(*) filter (where status = 'cancelled')::bigint as cancelled_orders,
    coalesce(sum(estimated_total) filter (where status = 'paid'), 0)::numeric as revenue,
    coalesce(round(avg(estimated_total) filter (where status = 'paid'), 2), 0)::numeric as avg_order_value
  from public.orders
  where created_at >= from_date
    and created_at < (to_date + interval '1 day');
$$;

create or replace function public.get_orders_by_status_range(from_date date, to_date date)
returns table (status text, order_count bigint, revenue numeric)
language sql stable security definer
as $$
  select coalesce(nullif(status, ''), 'unknown') as status,
         count(*)::bigint as order_count,
         coalesce(sum(estimated_total) filter (where status = 'paid'), 0)::numeric as revenue
  from public.orders
  where created_at >= from_date
    and created_at < (to_date + interval '1 day')
  group by 1
  order by 2 desc;
$$;

create or replace function public.get_orders_by_pack_type_range(from_date date, to_date date)
returns table (pack_type text, order_count bigint)
language sql stable security definer
as $$
  select coalesce(nullif(pack_type, ''), 'custom') as pack_type,
         count(*)::bigint as order_count
  from public.orders
  where created_at >= from_date
    and created_at < (to_date + interval '1 day')
  group by 1
  order by 2 desc;
$$;

create or replace function public.get_top_schools(from_date date, to_date date, result_limit integer default 10)
returns table (school_name text, order_count bigint, revenue numeric)
language sql stable security definer
as $$
  select nullif(school_name, '') as school_name,
         count(*)::bigint as order_count,
         coalesce(sum(estimated_total) filter (where status = 'paid'), 0)::numeric as revenue
  from public.orders
  where created_at >= from_date
    and created_at < (to_date + interval '1 day')
    and school_name is not null
    and school_name <> ''
  group by 1
  order by 2 desc, 1 asc
  limit result_limit;
$$;
