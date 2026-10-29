import {
  Category,
  Product,
  Order,
  OrderItem,
  StoreSettings,
  CartItem,
  CustomerOrderForm,
  ContactMessage,
  InventoryMovement,
} from '../types';
import { DEMO_CATEGORIES, DEMO_PRODUCTS, DEFAULT_STORE_SETTINGS } from '../data/demoProducts';
import { generateOrderReference } from './formatters';

export interface ProductFilters {
  category?: string;
  search?: string;
  color?: string;
  minPricePesewas?: number;
  maxPricePesewas?: number;
  inStockOnly?: boolean;
  sortBy?: 'newest' | 'price-asc' | 'price-desc';
  includeDemo?: boolean;
}

export interface OrderSubmissionResponse {
  success: boolean;
  order?: Order;
  items?: OrderItem[];
  priceDiscrepancy?: boolean;
  revisedTotalPesewas?: number;
  error?: string;
}

// In-memory preview order store for preview mode
let previewOrders: Order[] = [];
let previewMessages: ContactMessage[] = [];
let previewProducts: Product[] = [...DEMO_PRODUCTS];

/**
 * Fetch all categories
 */
export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch('/api/categories');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {
    // Fall back to demo categories
  }
  return DEMO_CATEGORIES;
}

/**
 * Fetch filtered products
 */
export async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
  try {
    const query = new URLSearchParams();
    if (filters.category) query.set('category', filters.category);
    if (filters.search) query.set('search', filters.search);
    if (filters.color) query.set('color', filters.color);
    if (filters.minPricePesewas) query.set('minPrice', filters.minPricePesewas.toString());
    if (filters.maxPricePesewas) query.set('maxPrice', filters.maxPricePesewas.toString());
    if (filters.inStockOnly) query.set('inStock', 'true');
    if (filters.sortBy) query.set('sortBy', filters.sortBy);
    if (filters.includeDemo) query.set('includeDemo', 'true');

    const res = await fetch(`/api/products?${query.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch {
    // Fall back to local filtering
  }

  // Local filter for preview mode or server fallback
  let list = [...previewProducts];

  // In production, only published non-demo products show
  if (!filters.includeDemo) {
    list = list.filter((p) => p.is_published && !p.is_demo && !p.is_archived);
  } else {
    list = list.filter((p) => !p.is_archived);
  }

  // Category filter
  if (filters.category && filters.category !== 'all') {
    list = list.filter((p) => {
      const catSlug = p.category?.slug || DEMO_CATEGORIES.find((c) => c.id === p.category_id)?.slug;
      return catSlug === filters.category;
    });
  }

  // Search filter
  if (filters.search && filters.search.trim()) {
    const s = filters.search.toLowerCase().trim();
    list = list.filter(
      (p) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s)
    );
  }

  // Color filter
  if (filters.color && filters.color !== 'all') {
    list = list.filter((p) =>
      p.variants.some((v) => v.color_name.toLowerCase() === filters.color?.toLowerCase())
    );
  }

  // Price filter (pesewas)
  if (filters.minPricePesewas !== undefined) {
    list = list.filter((p) => p.base_price_pesewas >= filters.minPricePesewas!);
  }
  if (filters.maxPricePesewas !== undefined) {
    list = list.filter((p) => p.base_price_pesewas <= filters.maxPricePesewas!);
  }

  // Availability filter
  if (filters.inStockOnly) {
    list = list.filter((p) =>
      p.variants.some((v) => v.is_available && v.stock_quantity > 0)
    );
  }

  // Sorting
  if (filters.sortBy === 'price-asc') {
    list.sort((a, b) => a.base_price_pesewas - b.base_price_pesewas);
  } else if (filters.sortBy === 'price-desc') {
    list.sort((a, b) => b.base_price_pesewas - a.base_price_pesewas);
  } else {
    // Newest / default
    list.sort((a, b) => ((b.created_at || '0') > (a.created_at || '0') ? 1 : -1));
  }

  return list;
}

/**
 * Fetch a single product by slug or id
 */
export async function fetchProductBySlug(
  slugOrId: string,
  includeDemo = false
): Promise<Product | null> {
  try {
    const res = await fetch(`/api/products/${slugOrId}${includeDemo ? '?includeDemo=true' : ''}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.id) return data;
    }
  } catch {
    // Fall back to demo list
  }

  const found = previewProducts.find(
    (p) => p.slug === slugOrId || p.id === slugOrId
  );

  if (found) {
    if (!includeDemo && (!found.is_published || found.is_demo)) {
      return null;
    }
    return found;
  }
  return null;
}

/**
 * Fetch public store settings
 */
export async function fetchStoreSettings(): Promise<StoreSettings> {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data?.brand_info) return data;
    }
  } catch {}
  return DEFAULT_STORE_SETTINGS;
}

/**
 * Submit Customer Order Request
 * Strictly validates, calculates price on server/trusted DB values, and enforces idempotency
 */
export async function submitOrderRequest(
  customer: CustomerOrderForm,
  cartItems: CartItem[],
  clientAcceptedTotalPesewas?: number,
  isPreviewMode = false
): Promise<OrderSubmissionResponse> {
  if (!cartItems.length) {
    return { success: false, error: 'Order selection is empty. Please select a handbag first.' };
  }

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer,
        cartItems,
        clientAcceptedTotalPesewas,
        isPreviewMode,
      }),
    });

    const data = await response.json();
    if (response.ok && data.success) {
      return data;
    }
    if (data.priceDiscrepancy) {
      return data;
    }
    return {
      success: false,
      error: data.error || 'Failed to submit order request. Please review your details and try again.',
    };
  } catch (err: any) {
    // If running in local client-only preview mode without server
    if (isPreviewMode) {
      return handlePreviewOrderSubmission(customer, cartItems);
    }
    return {
      success: false,
      error: 'Unable to connect to order server. Please ensure you have network connectivity or contact us via WhatsApp directly.',
    };
  }
}

/**
 * Internal helper for client preview order submission
 */
function handlePreviewOrderSubmission(
  customer: CustomerOrderForm,
  cartItems: CartItem[]
): OrderSubmissionResponse {
  let totalPesewas = 0;
  const orderItems: OrderItem[] = [];
  const orderId = `preview-ord-${Date.now()}`;
  const orderRef = generateOrderReference();

  for (const item of cartItems) {
    const prod = previewProducts.find((p) => p.id === item.productId);
    const variant = prod?.variants.find((v) => v.id === item.variantId);

    if (!prod || !variant) {
      return { success: false, error: 'One or more selected products are no longer available.' };
    }

    const unitPrice = variant.price_pesewas ?? prod.base_price_pesewas;
    const itemTotal = unitPrice * item.quantity;
    totalPesewas += itemTotal;

    orderItems.push({
      id: `ord-item-${Date.now()}-${item.variantId}`,
      order_id: orderId,
      product_id: prod.id,
      variant_id: variant.id,
      product_name_snapshot: prod.name,
      variant_name_snapshot: variant.name,
      unit_price_pesewas_snapshot: unitPrice,
      quantity: item.quantity,
      total_pesewas_snapshot: itemTotal,
    });
  }

  const newOrder: Order = {
    id: orderId,
    order_reference: orderRef,
    idempotency_key: customer.idempotencyKey || `idem-${Date.now()}`,
    customer_name: customer.fullName,
    customer_phone: customer.phone,
    customer_alt_phone: customer.altPhone || null,
    region: customer.region,
    city: customer.city,
    delivery_address: customer.deliveryAddress,
    delivery_notes: customer.deliveryNotes || null,
    status: 'pending_confirmation',
    total_pesewas: totalPesewas,
    inventory_deducted: false,
    inventory_restored: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: orderItems,
  };

  previewOrders.unshift(newOrder);

  return {
    success: true,
    order: newOrder,
    items: orderItems,
  };
}

/**
 * Submit Contact Form Message
 */
export async function submitContactMessage(payload: {
  name: string;
  email?: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true };
    }
    return { success: false, error: data.error || 'Failed to submit message' };
  } catch {
    // Preview store
    previewMessages.unshift({
      id: `msg-${Date.now()}`,
      name: payload.name,
      email: payload.email || null,
      phone: payload.phone || null,
      subject: payload.subject,
      message: payload.message,
      status: 'unread',
      created_at: new Date().toISOString(),
    });
    return { success: true };
  }
}

/**
 * Admin API: Fetch Overview Stats
 */
export async function fetchAdminOverview(): Promise<{
  orderCount: number;
  pendingCount: number;
  confirmedCount: number;
  dispatchedCount: number;
  confirmedOrderValuePesewas: number;
  pendingRequestValuePesewas: number;
  productCount: number;
  unreadMessageCount: number;
}> {
  try {
    const res = await fetch('/api/admin/overview');
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  // Local calculation from preview state
  const confirmed = previewOrders.filter(
    (o) => o.status === 'confirmed' || o.status === 'processing' || o.status === 'dispatched' || o.status === 'delivered'
  );
  const pending = previewOrders.filter((o) => o.status === 'pending_confirmation');

  return {
    orderCount: previewOrders.length,
    pendingCount: pending.length,
    confirmedCount: confirmed.length,
    dispatchedCount: previewOrders.filter((o) => o.status === 'dispatched').length,
    confirmedOrderValuePesewas: confirmed.reduce((sum, o) => sum + o.total_pesewas, 0),
    pendingRequestValuePesewas: pending.reduce((sum, o) => sum + o.total_pesewas, 0),
    productCount: previewProducts.length,
    unreadMessageCount: previewMessages.filter((m) => m.status === 'unread').length,
  };
}

/**
 * Admin API: Fetch all orders
 */
export async function fetchAdminOrders(): Promise<Order[]> {
  try {
    const res = await fetch('/api/admin/orders');
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return previewOrders;
}

/**
 * Admin API: Update order status (with atomic stock deduction & restoration)
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: Order['status'],
  note?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, note }),
    });
    const data = await res.json();
    if (res.ok && data.success) return { success: true };
    return { success: false, error: data.error || 'Failed to update order status' };
  } catch {
    // Preview mode update
    const ord = previewOrders.find((o) => o.id === orderId);
    if (!ord) return { success: false, error: 'Order not found' };

    // Stock rules
    if (newStatus === 'confirmed' && !ord.inventory_deducted) {
      ord.inventory_deducted = true;
    } else if (newStatus === 'cancelled' && ord.inventory_deducted && !ord.inventory_restored) {
      ord.inventory_restored = true;
    }

    ord.status = newStatus;
    ord.updated_at = new Date().toISOString();
    return { success: true };
  }
}

/**
 * Admin API: Fetch all contact messages
 */
export async function fetchAdminMessages(): Promise<ContactMessage[]> {
  try {
    const res = await fetch('/api/admin/messages');
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return previewMessages;
}
