-- ====================================================================
-- ESTCHAY LUX LADY’S BAGS - Idempotent Seed Data
-- ====================================================================

-- 1. Insert Categories
INSERT INTO public.categories (id, name, slug, description, display_order, is_active)
VALUES 
  ('11111111-1111-1111-1111-111111111101', 'Tote Bags', 'tote-bags', 'Spacious and elegant everyday totes designed with refined structure and durable handles.', 1, true),
  ('11111111-1111-1111-1111-111111111102', 'Handbags', 'handbags', 'Distinctive daytime and evening handbags featuring polished hardware and shoulder straps.', 2, true),
  ('11111111-1111-1111-1111-111111111103', 'Handbag Sets', 'handbag-sets', 'Harmonious multi-piece sets including primary handbags, matching pouches, and coordinated wallets.', 3, true),
  ('11111111-1111-1111-1111-111111111104', 'Purses & Pouches', 'purses-pouches', 'Compact zip pouches, clutches, and wallets crafted for everyday organisation.', 4, true)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- 2. Insert The 7 Initial Products (Seeded as demo records, unpublished by default)
-- In production, the storefront displays only owner-published non-demo products.
-- In labelled Preview Mode, demo records are displayed with explicit badges.

-- Product 1: Black Tote with Lavender Pouch
INSERT INTO public.products (id, category_id, name, slug, description, base_price_pesewas, is_published, is_demo, is_featured, is_new, dimensions, material)
VALUES (
  '22222222-2222-2222-2222-222222222201',
  '11111111-1111-1111-1111-111111111101',
  'Black Tote with Lavender Pouch',
  'black-tote-with-lavender-pouch',
  'A wide black tote with long handles, a subtly textured finish and silver-tone detailing, accompanied by a lavender zip pouch.',
  45000, -- GH₵450
  false, true, true, false,
  NULL, NULL
)
ON CONFLICT (slug) DO UPDATE
SET base_price_pesewas = EXCLUDED.base_price_pesewas,
    description = EXCLUDED.description;

-- Product 2: Cognac Tote with Gold-Tone Detail
INSERT INTO public.products (id, category_id, name, slug, description, base_price_pesewas, is_published, is_demo, is_featured, is_new, dimensions, material)
VALUES (
  '22222222-2222-2222-2222-222222222202',
  '11111111-1111-1111-1111-111111111101',
  'Cognac Tote with Gold-Tone Detail',
  'cognac-tote-with-gold-tone-detail',
  'A structured cognac-brown tote with a pebbled finish, rounded handles, a curved opening, and a prominent gold-tone front ornament.',
  35000, -- GH₵350
  false, true, true, false,
  NULL, NULL
)
ON CONFLICT (slug) DO UPDATE
SET base_price_pesewas = EXCLUDED.base_price_pesewas,
    description = EXCLUDED.description;

-- Product 3: Burgundy Three-Piece Handbag Set
INSERT INTO public.products (id, category_id, name, slug, description, base_price_pesewas, is_published, is_demo, is_featured, is_new, dimensions, material)
VALUES (
  '22222222-2222-2222-2222-222222222203',
  '11111111-1111-1111-1111-111111111103',
  'Burgundy Three-Piece Handbag Set',
  'burgundy-three-piece-handbag-set',
  'A glossy wine-coloured handbag with top handles and a long shoulder strap, paired with a matching envelope pouch and small wallet.',
  50000, -- GH₵500
  false, true, true, true,
  NULL, NULL
)
ON CONFLICT (slug) DO UPDATE
SET base_price_pesewas = EXCLUDED.base_price_pesewas,
    description = EXCLUDED.description;

-- Product 4: Tan Tote with Bow Detail
INSERT INTO public.products (id, category_id, name, slug, description, base_price_pesewas, is_published, is_demo, is_featured, is_new, dimensions, material)
VALUES (
  '22222222-2222-2222-2222-222222222204',
  '11111111-1111-1111-1111-111111111101',
  'Tan Tote with Bow Detail',
  'tan-tote-with-bow-detail',
  'A tan tote with slim shoulder handles, a darker base band, gold-tone rivets and a small bow emblem.',
  90000, -- GH₵900
  false, true, false, false,
  NULL, NULL
)
ON CONFLICT (slug) DO UPDATE
SET base_price_pesewas = EXCLUDED.base_price_pesewas,
    description = EXCLUDED.description;

-- Product 5: Taupe Tote with Brown Trim
INSERT INTO public.products (id, category_id, name, slug, description, base_price_pesewas, is_published, is_demo, is_featured, is_new, dimensions, material)
VALUES (
  '22222222-2222-2222-2222-222222222205',
  '11111111-1111-1111-1111-111111111101',
  'Taupe Tote with Brown Trim',
  'taupe-tote-with-brown-trim',
  'A structured taupe tote with long brown handles, vertical brown trim and small buckle accents.',
  80000, -- GH₵800
  false, true, false, true,
  NULL, NULL
)
ON CONFLICT (slug) DO UPDATE
SET base_price_pesewas = EXCLUDED.base_price_pesewas,
    description = EXCLUDED.description;

-- Product 6: Beige Tote with Teddy Charm
INSERT INTO public.products (id, category_id, name, slug, description, base_price_pesewas, is_published, is_demo, is_featured, is_new, dimensions, material)
VALUES (
  '22222222-2222-2222-2222-222222222206',
  '11111111-1111-1111-1111-111111111101',
  'Beige Tote with Teddy Charm',
  'beige-tote-with-teddy-charm',
  'A tall beige tote with matching shoulder handles, gold-tone fittings, a narrow fastening strap and a teddy-bear charm.',
  60000, -- GH₵600
  false, true, true, true,
  NULL, NULL
)
ON CONFLICT (slug) DO UPDATE
SET base_price_pesewas = EXCLUDED.base_price_pesewas,
    description = EXCLUDED.description;

-- Product 7: Classic Tote Collection (Multi-variant)
INSERT INTO public.products (id, category_id, name, slug, description, base_price_pesewas, is_published, is_demo, is_featured, is_new, dimensions, material)
VALUES (
  '22222222-2222-2222-2222-222222222207',
  '11111111-1111-1111-1111-111111111101',
  'Classic Tote Collection',
  'classic-tote-collection',
  'A rectangular tote with a pebbled finish, slim shoulder handles and a defined front panel. Available in five signature colour options.',
  45000, -- GH₵450
  false, true, true, true,
  NULL, NULL
)
ON CONFLICT (slug) DO UPDATE
SET base_price_pesewas = EXCLUDED.base_price_pesewas,
    description = EXCLUDED.description;

-- 3. Product Variants
-- Single-option products have a default 'Standard' variant.
INSERT INTO public.product_variants (id, product_id, name, color_name, color_hex, sku, price_pesewas, stock_quantity, is_available)
VALUES
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', 'Black / Lavender', 'Black', '#1C1C1E', 'EST-BLK-LAV', 45000, 10, true),
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222202', 'Cognac Brown', 'Cognac', '#9A5B32', 'EST-COG-GLD', 35000, 8, true),
  ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222203', 'Glossy Wine', 'Burgundy', '#6D2638', 'EST-BUR-SET', 50000, 6, true),
  ('33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222204', 'Warm Tan', 'Tan', '#C29B68', 'EST-TAN-BOW', 90000, 5, true),
  ('33333333-3333-3333-3333-333333333305', '22222222-2222-2222-2222-222222222205', 'Taupe / Brown', 'Taupe', '#A89F91', 'EST-TAU-BRN', 80000, 7, true),
  ('33333333-3333-3333-3333-333333333306', '22222222-2222-2222-2222-222222222206', 'Soft Beige', 'Beige', '#E6DEC9', 'EST-BGE-CHM', 60000, 9, true),
  -- Classic Tote Collection Variants: Green, Blue, Brown, Wine, Black
  ('33333333-3333-3333-3333-333333333371', '22222222-2222-2222-2222-222222222207', 'Emerald Green', 'Green', '#2D5A43', 'EST-CLS-GRN', 45000, 6, true),
  ('33333333-3333-3333-3333-333333333372', '22222222-2222-2222-2222-222222222207', 'Midnight Blue', 'Blue', '#243A5E', 'EST-CLS-BLU', 45000, 5, true),
  ('33333333-3333-3333-3333-333333333373', '22222222-2222-2222-2222-222222222207', 'Rich Brown', 'Brown', '#5D4037', 'EST-CLS-BRN', 45000, 8, true),
  ('33333333-3333-3333-3333-333333333374', '22222222-2222-2222-2222-222222222207', 'Deep Wine', 'Wine', '#6D2638', 'EST-CLS-WIN', 45000, 6, true),
  ('33333333-3333-3333-3333-333333333375', '22222222-2222-2222-2222-222222222207', 'Classic Black', 'Black', '#1C1C1E', 'EST-CLS-BLK', 45000, 10, true)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Default Store Settings
INSERT INTO public.store_settings (key, value, is_public)
VALUES
  ('brand_info', jsonb_build_object(
    'name', 'ESTCHAY LUX LADY’S BAGS',
    'phone', '0548003400',
    'whatsapp', '233548003400',
    'email', 'info@estchaybags.com',
    'market', 'Ghana',
    'currency_symbol', 'GH₵',
    'currency_code', 'GHS',
    'introduction', 'Find a bag that fits your day. ESTCHAY LUX LADY’S BAGS brings together practical totes, distinctive handbags and coordinated sets, with clear product information and convenient WhatsApp ordering.'
  ), true),
  ('hero_content', jsonb_build_object(
    'eyebrow', 'EVERYDAY STYLE. DISTINCTIVE DETAILS.',
    'heading', 'Carry Your Confidence.',
    'supporting_text', 'Discover handbags, totes and matching sets for workdays, weekends and special occasions.',
    'primary_cta_label', 'Shop the Collection',
    'secondary_cta_label', 'About ESTCHAY'
  ), true),
  ('order_steps', jsonb_build_array(
    jsonb_build_object('step', '01', 'title', 'Select Your Pieces', 'description', 'Browse the curated collection of handbags, totes and sets. Add your chosen bag and preferred colour to your order selection.'),
    jsonb_build_object('step', '02', 'title', 'Review & Submit Request', 'description', 'Provide your name, phone number, and delivery region or town. Your request is safely recorded with a unique reference.'),
    jsonb_build_object('step', '03', 'title', 'Confirm via WhatsApp', 'description', 'Click to open WhatsApp with your pre-formatted order summary to discuss availability, delivery details, and payment directly.')
  ), true),
  ('social_links', jsonb_build_object(
    'instagram', null,
    'facebook', null,
    'tiktok', null
  ), true)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value;
