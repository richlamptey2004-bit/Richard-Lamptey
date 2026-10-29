-- ====================================================================
-- ESTCHAY LUX LADY’S BAGS - Supabase PostgreSQL Database Schema
-- Version: 20261029000000_initial_schema.sql
-- Description: Complete schema for products, variants, images, categories,
--              orders, order items, inventory movements, status audit,
--              contact messages, and store settings with Row Level Security.
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles and Role-Based Access Control
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public users can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins have full access to categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')));

-- 4. Products Table
-- Prices stored in integer pesewas (100 pesewas = 1 GHS)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  base_price_pesewas INTEGER NOT NULL CHECK (base_price_pesewas >= 0),
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_new BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  dimensions TEXT,
  material TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(is_published, is_demo, is_archived);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public users can view published non-demo non-archived products"
  ON public.products FOR SELECT
  USING (is_published = true AND is_demo = false AND is_archived = false);

CREATE POLICY "Admins have full access to products"
  ON public.products FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')));

-- 5. Product Variants (Color, SKU, and Stock Management)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Standard',
  color_name TEXT,
  color_hex TEXT,
  sku TEXT,
  price_pesewas INTEGER CHECK (price_pesewas IS NULL OR price_pesewas >= 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public users can view variants of published products"
  ON public.product_variants FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = product_variants.product_id
      AND products.is_published = true
      AND products.is_demo = false
      AND products.is_archived = false
  ));

CREATE POLICY "Admins have full access to variants"
  ON public.product_variants FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')));

-- 6. Product Images Table
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_images_product ON public.product_images(product_id);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public users can view images of published products"
  ON public.product_images FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = product_images.product_id
      AND products.is_published = true
      AND products.is_demo = false
      AND products.is_archived = false
  ));

CREATE POLICY "Admins have full access to images"
  ON public.product_images FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')));

-- 7. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_reference TEXT NOT NULL UNIQUE,
  idempotency_key TEXT UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_alt_phone TEXT,
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending_confirmation'
    CHECK (status IN ('pending_confirmation', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled')),
  total_pesewas INTEGER NOT NULL CHECK (total_pesewas >= 0),
  inventory_deducted BOOLEAN NOT NULL DEFAULT false,
  inventory_restored BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_reference ON public.orders(order_reference);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Note: Customer orders are strictly private. Public users may NOT list or retrieve orders.
-- Orders are written and queried via server endpoints or privileged admin access.
CREATE POLICY "Admins have full access to orders"
  ON public.orders FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')));

-- 8. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name_snapshot TEXT NOT NULL,
  variant_name_snapshot TEXT NOT NULL,
  unit_price_pesewas_snapshot INTEGER NOT NULL CHECK (unit_price_pesewas_snapshot >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_pesewas_snapshot INTEGER NOT NULL CHECK (total_pesewas_snapshot >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to order items"
  ON public.order_items FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')));

-- 9. Order Status History (Audit Trail)
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_status_history_order ON public.order_status_history(order_id);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to status history"
  ON public.order_status_history FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')));

-- 10. Inventory Movements (Stock Adjustments & Audit Trail)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  change_amount INTEGER NOT NULL, -- Negative for deduction, positive for addition
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reason TEXT NOT NULL, -- e.g. 'order_confirmed', 'order_cancelled', 'manual_adjustment', 'restock'
  reference TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_variant ON public.inventory_movements(variant_id);

ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to inventory movements"
  ON public.inventory_movements FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')));

-- 11. Contact Messages Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to contact messages"
  ON public.contact_messages FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')));

-- 12. Public & Operational Store Settings Table
CREATE TABLE IF NOT EXISTS public.store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public users can view public store settings"
  ON public.store_settings FOR SELECT
  USING (is_public = true);

CREATE POLICY "Admins have full access to store settings"
  ON public.store_settings FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')));

-- ====================================================================
-- ATOMIC INVENTORY & ORDER TRANSITION FUNCTIONS
-- ====================================================================

-- Function: Confirm order and deduct stock atomically
CREATE OR REPLACE FUNCTION public.confirm_order_stock(p_order_id UUID, p_admin_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_current_stock INTEGER;
  v_res JSONB;
BEGIN
  -- 1. Fetch and lock order
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  -- 2. Verify status and idempotency
  IF v_order.inventory_deducted THEN
    RETURN jsonb_build_object('success', false, 'error', 'Stock has already been deducted for this order');
  END IF;

  IF v_order.status = 'cancelled' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot confirm a cancelled order');
  END IF;

  -- 3. Check availability for all items
  FOR v_item IN SELECT * FROM public.order_items WHERE order_id = p_order_id LOOP
    IF v_item.variant_id IS NOT NULL THEN
      SELECT stock_quantity INTO v_current_stock
      FROM public.product_variants
      WHERE id = v_item.variant_id
      FOR UPDATE;

      IF v_current_stock < v_item.quantity THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', format('Insufficient stock for %s. Available: %s, Requested: %s', v_item.product_name_snapshot, v_current_stock, v_item.quantity)
        );
      END IF;
    END IF;
  END LOOP;

  -- 4. Deduct stock and record movements
  FOR v_item IN SELECT * FROM public.order_items WHERE order_id = p_order_id LOOP
    IF v_item.variant_id IS NOT NULL THEN
      SELECT stock_quantity INTO v_current_stock
      FROM public.product_variants
      WHERE id = v_item.variant_id;

      UPDATE public.product_variants
      SET stock_quantity = stock_quantity - v_item.quantity
      WHERE id = v_item.variant_id;

      INSERT INTO public.inventory_movements (
        variant_id, order_id, change_amount, previous_stock, new_stock, reason, reference, created_by
      ) VALUES (
        v_item.variant_id, p_order_id, -v_item.quantity, v_current_stock, v_current_stock - v_item.quantity,
        'order_confirmed', v_order.order_reference, p_admin_id
      );
    END IF;
  END LOOP;

  -- 5. Update order state
  UPDATE public.orders
  SET status = 'confirmed',
      inventory_deducted = true,
      updated_at = timezone('utc'::text, now())
  WHERE id = p_order_id;

  INSERT INTO public.order_status_history (
    order_id, from_status, to_status, changed_by, note
  ) VALUES (
    p_order_id, v_order.status, 'confirmed', p_admin_id, 'Stock checked and deducted on order confirmation'
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Function: Cancel order and restore stock atomically (pre-dispatch only)
CREATE OR REPLACE FUNCTION public.cancel_order_stock(p_order_id UUID, p_admin_id UUID, p_note TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_current_stock INTEGER;
BEGIN
  -- 1. Fetch and lock order
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  IF v_order.status IN ('dispatched', 'delivered') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Orders already dispatched or delivered cannot be auto-restocked via simple cancellation');
  END IF;

  IF v_order.status = 'cancelled' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order is already cancelled');
  END IF;

  -- 2. Restore stock only if previously deducted and not yet restored
  IF v_order.inventory_deducted AND NOT v_order.inventory_restored THEN
    FOR v_item IN SELECT * FROM public.order_items WHERE order_id = p_order_id LOOP
      IF v_item.variant_id IS NOT NULL THEN
        SELECT stock_quantity INTO v_current_stock
        FROM public.product_variants
        WHERE id = v_item.variant_id
        FOR UPDATE;

        UPDATE public.product_variants
        SET stock_quantity = stock_quantity + v_item.quantity
        WHERE id = v_item.variant_id;

        INSERT INTO public.inventory_movements (
          variant_id, order_id, change_amount, previous_stock, new_stock, reason, reference, created_by
        ) VALUES (
          v_item.variant_id, p_order_id, v_item.quantity, v_current_stock, v_current_stock + v_item.quantity,
          'order_cancelled', v_order.order_reference, p_admin_id
        );
      END IF;
    END LOOP;
  END IF;

  -- 3. Update order state
  UPDATE public.orders
  SET status = 'cancelled',
      inventory_restored = CASE WHEN v_order.inventory_deducted THEN true ELSE v_order.inventory_restored END,
      updated_at = timezone('utc'::text, now())
  WHERE id = p_order_id;

  INSERT INTO public.order_status_history (
    order_id, from_status, to_status, changed_by, note
  ) VALUES (
    p_order_id, v_order.status, 'cancelled', p_admin_id, COALESCE(p_note, 'Order cancelled by admin')
  );

  RETURN jsonb_build_object('success', true);
END;
$$;
