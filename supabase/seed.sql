-- Local verification seed for public catalogue flows.
-- Runs after migrations during `supabase db reset`.

INSERT INTO public.schools (
  id,
  name,
  slug,
  city,
  province,
  district,
  is_partner,
  is_featured,
  refused_partnership,
  lowest_price,
  grades,
  status,
  published,
  publication_status,
  partnership,
  feature_status,
  directory_status,
  stationery_list_status,
  custom_badge
) VALUES (
  '11111111-1111-4111-8111-111111111111',
  'Local Verification Primary School',
  'local-verification-primary-school',
  'Johannesburg',
  'Gauteng',
  'Johannesburg North',
  true,
  true,
  false,
  0,
  '[{"id":"22222222-2222-4222-8222-222222222222","grade":"Grade R","gradeSlug":"grade-r","price":0,"contents":["A4 Exercise Book","HB Pencil"],"deliveryNote":"Local verification pack","availability":"in-stock"}]'::jsonb,
  'active',
  true,
  'published',
  'partner',
  'featured',
  'listed',
  'verified',
  'Local Test'
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  city = EXCLUDED.city,
  province = EXCLUDED.province,
  district = EXCLUDED.district,
  is_partner = EXCLUDED.is_partner,
  is_featured = EXCLUDED.is_featured,
  refused_partnership = EXCLUDED.refused_partnership,
  grades = EXCLUDED.grades,
  status = EXCLUDED.status,
  published = EXCLUDED.published,
  publication_status = EXCLUDED.publication_status,
  partnership = EXCLUDED.partnership,
  feature_status = EXCLUDED.feature_status,
  directory_status = EXCLUDED.directory_status,
  stationery_list_status = EXCLUDED.stationery_list_status,
  custom_badge = EXCLUDED.custom_badge,
  updated_at = now();

INSERT INTO public.master_products (
  id,
  sku,
  name,
  description,
  category,
  unit,
  specification,
  icon,
  visibility,
  availability,
  current_selling_price,
  latest_verified_cost,
  pricing_status,
  active,
  requires_pexcover,
  pexco_code
) VALUES
  (
    '33333333-3333-4333-8333-333333333333',
    'LOCAL-A4-BOOK-001',
    'A4 Exercise Book',
    'Local seed exercise book for public pack verification.',
    'Books',
    'each',
    'A4 72 page',
    'book',
    'public',
    'available',
    24.99,
    12.50,
    'current',
    true,
    true,
    'PEXCO01'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'LOCAL-HB-PENCIL-001',
    'HB Pencil',
    'Local seed pencil for public pack verification.',
    'Writing',
    'each',
    'HB graphite pencil',
    'pencil',
    'public',
    'available',
    5.99,
    2.50,
    'current',
    true,
    false,
    null
  )
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  unit = EXCLUDED.unit,
  specification = EXCLUDED.specification,
  icon = EXCLUDED.icon,
  visibility = EXCLUDED.visibility,
  availability = EXCLUDED.availability,
  current_selling_price = EXCLUDED.current_selling_price,
  latest_verified_cost = EXCLUDED.latest_verified_cost,
  pricing_status = EXCLUDED.pricing_status,
  active = EXCLUDED.active,
  requires_pexcover = EXCLUDED.requires_pexcover,
  pexco_code = EXCLUDED.pexco_code,
  updated_at = now();

INSERT INTO public.school_packs (
  id,
  school_id,
  title,
  slug,
  description,
  price,
  stock,
  featured,
  visible,
  academic_year,
  delivery_type,
  sort_order,
  list_version,
  pricing_status,
  publication_status,
  published_at,
  version
) VALUES (
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  'Grade R Stationery Pack',
  'local-verification-primary-school-grade-r',
  'Published local seed pack used to verify public school catalogue rendering.',
  0,
  50,
  true,
  true,
  '2027',
  'school_collection',
  1,
  1,
  'ready',
  'published',
  now(),
  1
) ON CONFLICT (id) DO UPDATE SET
  school_id = EXCLUDED.school_id,
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  stock = EXCLUDED.stock,
  featured = EXCLUDED.featured,
  visible = EXCLUDED.visible,
  academic_year = EXCLUDED.academic_year,
  delivery_type = EXCLUDED.delivery_type,
  sort_order = EXCLUDED.sort_order,
  list_version = EXCLUDED.list_version,
  pricing_status = EXCLUDED.pricing_status,
  publication_status = EXCLUDED.publication_status,
  published_at = EXCLUDED.published_at,
  version = EXCLUDED.version,
  updated_at = now();

INSERT INTO public.school_pack_items (
  pack_id,
  product_id,
  pack_quantity,
  school_wording,
  substitution_policy,
  sort_order,
  active
) VALUES
  (
    '22222222-2222-4222-8222-222222222222',
    '33333333-3333-4333-8333-333333333333',
    2,
    'A4 Exercise Book',
    'not_allowed',
    1,
    true
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '44444444-4444-4444-8444-444444444444',
    4,
    'HB Pencil',
    'allowed',
    2,
    true
  )
ON CONFLICT (pack_id, product_id, school_wording) DO UPDATE SET
  pack_quantity = EXCLUDED.pack_quantity,
  substitution_policy = EXCLUDED.substitution_policy,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active,
  updated_at = now();

SELECT public.recalculate_all_grade_pack_prices();

UPDATE public.schools s
SET
  lowest_price = p.price,
  grades = jsonb_build_array(
    jsonb_build_object(
      'id', p.id,
      'grade', 'Grade R',
      'gradeSlug', 'grade-r',
      'price', p.price,
      'contents', jsonb_build_array('A4 Exercise Book', 'HB Pencil'),
      'deliveryNote', 'Local verification pack',
      'availability', 'in-stock'
    )
  ),
  updated_at = now()
FROM public.school_packs p
WHERE s.id = p.school_id
  AND s.slug = 'local-verification-primary-school'
  AND p.id = '22222222-2222-4222-8222-222222222222';

