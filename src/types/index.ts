/**
 * ESTCHAY LUX LADY’S BAGS - Data Models & Types
 */

export type OrderStatus =
  | 'pending_confirmation'
  | 'confirmed'
  | 'processing'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  color_name: string;
  color_hex?: string | null;
  sku?: string | null;
  price_pesewas?: number | null; // Optional override; defaults to product base_price_pesewas
  stock_quantity: number;
  is_available: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string | null;
  display_order: number;
  is_primary: boolean;
}

export interface Product {
  id: string;
  category_id?: string | null;
  category?: Category | null;
  name: string;
  slug: string;
  description: string;
  base_price_pesewas: number; // 1 GHS = 100 pesewas
  is_published: boolean;
  is_demo: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_archived?: boolean;
  dimensions?: string | null;
  material?: string | null;
  created_at?: string;
  updated_at?: string;
  variants: ProductVariant[];
  images: ProductImage[];
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  variant_id?: string | null;
  product_name_snapshot: string;
  variant_name_snapshot: string;
  unit_price_pesewas_snapshot: number;
  quantity: number;
  total_pesewas_snapshot: number;
}

export interface Order {
  id: string;
  order_reference: string;
  idempotency_key?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_alt_phone?: string | null;
  region: string;
  city: string;
  delivery_address: string;
  delivery_notes?: string | null;
  status: OrderStatus;
  total_pesewas: number;
  inventory_deducted: boolean;
  inventory_restored: boolean;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  from_status?: string | null;
  to_status: string;
  changed_by?: string | null;
  note?: string | null;
  created_at: string;
}

export interface InventoryMovement {
  id: string;
  variant_id: string;
  order_id?: string | null;
  change_amount: number;
  previous_stock: number;
  new_stock: number;
  reason: string;
  reference?: string | null;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  created_at: string;
}

export interface StoreSettings {
  brand_info: {
    name: string;
    phone: string;
    whatsapp: string;
    email: string;
    market: string;
    currency_symbol: string;
    currency_code: string;
    introduction: string;
  };
  hero_content: {
    eyebrow: string;
    heading: string;
    supporting_text: string;
    primary_cta_label: string;
    secondary_cta_label: string;
  };
  order_steps: Array<{
    step: string;
    title: string;
    description: string;
  }>;
  social_links: {
    instagram: string | null;
    facebook: string | null;
    tiktok: string | null;
  };
}

export interface CustomerOrderForm {
  fullName: string;
  phone: string;
  altPhone?: string;
  region: string;
  city: string;
  deliveryAddress: string;
  deliveryNotes?: string;
  idempotencyKey?: string;
}

export interface ServerConfigStatus {
  supabaseConfigured: boolean;
  previewMode: boolean;
  databaseConnected: boolean;
  adminEmailConfigured: boolean;
  storageConfigured: boolean;
}
