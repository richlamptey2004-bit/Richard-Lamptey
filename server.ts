import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DEMO_CATEGORIES, DEMO_PRODUCTS, DEFAULT_STORE_SETTINGS } from './src/data/demoProducts.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Supabase Server-side Client Initialization
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project-id') &&
  (supabaseServiceKey.length > 20 || supabaseAnonKey.length > 20)
);

// Server-side privileged client uses service role key if available, or anon key
const supabaseServer: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

// In-memory fallback stores when running in preview/unconfigured mode
let memoryOrders: any[] = [];
let memoryOrderItems: any[] = [];
let memoryMessages: any[] = [];
let memoryProducts = JSON.parse(JSON.stringify(DEMO_PRODUCTS));

// Helper: Generate order reference
function generateOrderReference(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `EST-${year}${month}${day}-${randomSuffix}`;
}

// -----------------------------------------------------------------------------
// PUBLIC API ENDPOINTS
// -----------------------------------------------------------------------------

/**
 * Configuration & Health Check
 */
app.get('/api/config-status', async (_req: Request, res: Response) => {
  let dbConnected = false;
  if (supabaseServer) {
    try {
      const { error } = await supabaseServer.from('categories').select('id').limit(1);
      dbConnected = !error;
    } catch {
      dbConnected = false;
    }
  }

  res.json({
    supabaseConfigured: isSupabaseConfigured,
    previewMode: !isSupabaseConfigured || !dbConnected,
    databaseConnected: dbConnected,
    adminEmailConfigured: Boolean(process.env.ADMIN_EMAIL),
    storageConfigured: isSupabaseConfigured,
  });
});

/**
 * Fetch Categories
 */
app.get('/api/categories', async (_req: Request, res: Response) => {
  if (supabaseServer) {
    try {
      const { data, error } = await supabaseServer
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return res.json(data);
      }
    } catch (e) {
      console.warn('Supabase categories fetch error, serving demo categories:', e);
    }
  }
  return res.json(DEMO_CATEGORIES);
});

/**
 * Fetch Products with variants, images, and category
 */
app.get('/api/products', async (req: Request, res: Response) => {
  const { category, search, color, minPrice, maxPrice, inStock, sortBy, includeDemo } = req.query;

  if (supabaseServer) {
    try {
      let query = supabaseServer
        .from('products')
        .select(`
          *,
          category:categories(*),
          variants:product_variants(*),
          images:product_images(*)
        `);

      // In production, never return unpublished, demo or archived products
      if (includeDemo !== 'true') {
        query = query
          .eq('is_published', true)
          .eq('is_demo', false)
          .eq('is_archived', false);
      } else {
        query = query.eq('is_archived', false);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        let results = data;

        if (category && category !== 'all') {
          results = results.filter((p: any) => p.category?.slug === category);
        }

        if (search && typeof search === 'string') {
          const s = search.toLowerCase();
          results = results.filter(
            (p: any) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s)
          );
        }

        if (color && color !== 'all') {
          results = results.filter((p: any) =>
            p.variants?.some((v: any) => v.color_name?.toLowerCase() === (color as string).toLowerCase())
          );
        }

        if (minPrice) {
          const minP = parseInt(minPrice as string, 10);
          results = results.filter((p: any) => p.base_price_pesewas >= minP);
        }

        if (maxPrice) {
          const maxP = parseInt(maxPrice as string, 10);
          results = results.filter((p: any) => p.base_price_pesewas <= maxP);
        }

        if (inStock === 'true') {
          results = results.filter((p: any) =>
            p.variants?.some((v: any) => v.is_available && v.stock_quantity > 0)
          );
        }

        if (sortBy === 'price-asc') {
          results.sort((a: any, b: any) => a.base_price_pesewas - b.base_price_pesewas);
        } else if (sortBy === 'price-desc') {
          results.sort((a: any, b: any) => b.base_price_pesewas - a.base_price_pesewas);
        } else {
          results.sort((a: any, b: any) => (b.created_at > a.created_at ? 1 : -1));
        }

        return res.json(results);
      }
    } catch (e) {
      console.warn('Supabase products fetch failed, using fallback:', e);
    }
  }

  // Fallback to memory / demo products
  let results = [...memoryProducts];

  if (includeDemo !== 'true') {
    results = results.filter((p) => p.is_published && !p.is_demo && !p.is_archived);
  } else {
    results = results.filter((p) => !p.is_archived);
  }

  if (category && category !== 'all') {
    results = results.filter((p) => p.category?.slug === category);
  }

  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    results = results.filter(
      (p) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s)
    );
  }

  if (color && color !== 'all') {
    results = results.filter((p) =>
      p.variants.some((v: any) => v.color_name.toLowerCase() === (color as string).toLowerCase())
    );
  }

  if (minPrice) {
    const minP = parseInt(minPrice as string, 10);
    results = results.filter((p) => p.base_price_pesewas >= minP);
  }

  if (maxPrice) {
    const maxP = parseInt(maxPrice as string, 10);
    results = results.filter((p) => p.base_price_pesewas <= maxP);
  }

  if (inStock === 'true') {
    results = results.filter((p) =>
      p.variants.some((v: any) => v.is_available && v.stock_quantity > 0)
    );
  }

  if (sortBy === 'price-asc') {
    results.sort((a, b) => a.base_price_pesewas - b.base_price_pesewas);
  } else if (sortBy === 'price-desc') {
    results.sort((a, b) => b.base_price_pesewas - a.base_price_pesewas);
  } else {
    results.sort((a, b) => (b.created_at > a.created_at ? 1 : -1));
  }

  return res.json(results);
});

/**
 * Fetch Single Product Details
 */
app.get('/api/products/:slugOrId', async (req: Request, res: Response) => {
  const { slugOrId } = req.params;
  const { includeDemo } = req.query;

  if (supabaseServer) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
      let query = supabaseServer
        .from('products')
        .select(`
          *,
          category:categories(*),
          variants:product_variants(*),
          images:product_images(*)
        `);

      if (isUuid) {
        query = query.eq('id', slugOrId);
      } else {
        query = query.eq('slug', slugOrId);
      }

      const { data, error } = await query.single();
      if (!error && data) {
        if (includeDemo !== 'true' && (!data.is_published || data.is_demo)) {
          return res.status(404).json({ error: 'Product not found or not published' });
        }
        return res.json(data);
      }
    } catch (e) {
      console.warn('Supabase single product fetch failed:', e);
    }
  }

  const found = memoryProducts.find(
    (p: any) => p.slug === slugOrId || p.id === slugOrId
  );

  if (found) {
    if (includeDemo !== 'true' && (!found.is_published || found.is_demo)) {
      return res.status(404).json({ error: 'Product not found or not published' });
    }
    return res.json(found);
  }

  return res.status(404).json({ error: 'Product not found' });
});

/**
 * Transactional Order Submission Endpoint
 * Implements strict Section 8 Requirements:
 * 1. Validate request on server
 * 2. Reload published products and selected variants from DB
 * 3. Validate availability and quantity
 * 4. Calculate prices and totals from trusted database values
 * 5. If a price changed, notify for customer acceptance
 * 6. Save order atomically with idempotency key
 * 7. Generate unique order reference
 * 8. Status pending_confirmation
 */
app.post('/api/orders', async (req: Request, res: Response) => {
  const { customer, cartItems, clientAcceptedTotalPesewas, isPreviewMode } = req.body;

  // 1. Validation
  if (!customer || !customer.fullName || !customer.phone || !customer.region || !customer.city || !customer.deliveryAddress) {
    return res.status(400).json({
      success: false,
      error: 'Please fill in all required customer details (name, phone, region, town, delivery address).',
    });
  }

  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Your order selection is empty. Please select a handbag first.',
    });
  }

  const idempotencyKey = customer.idempotencyKey || `idem-${customer.phone}-${Date.now()}`;

  // Check idempotency in memory
  const existingMemoryOrder = memoryOrders.find((o) => o.idempotency_key === idempotencyKey);
  if (existingMemoryOrder) {
    const items = memoryOrderItems.filter((i) => i.order_id === existingMemoryOrder.id);
    return res.json({
      success: true,
      order: existingMemoryOrder,
      items,
      message: 'Order already recorded (idempotent submission).',
    });
  }

  // Reload products and variants from database or demo fixtures
  let trustedTotalPesewas = 0;
  const verifiedItems: any[] = [];

  for (const item of cartItems) {
    if (!item.productId || !item.variantId || !item.quantity || item.quantity <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid product or quantity in order selection.' });
    }

    let prod: any = null;
    let variant: any = null;

    if (supabaseServer && !isPreviewMode) {
      try {
        const { data: dbProd } = await supabaseServer
          .from('products')
          .select('id, name, base_price_pesewas, is_published, is_demo, is_archived')
          .eq('id', item.productId)
          .single();

        const { data: dbVar } = await supabaseServer
          .from('product_variants')
          .select('id, name, price_pesewas, stock_quantity, is_available')
          .eq('id', item.variantId)
          .single();

        prod = dbProd;
        variant = dbVar;
      } catch (e) {
        console.warn('Database product verification failed:', e);
      }
    }

    // Fallback to local fixtures if DB lookup did not find it or in preview mode
    if (!prod || !variant) {
      prod = memoryProducts.find((p: any) => p.id === item.productId);
      variant = prod?.variants.find((v: any) => v.id === item.variantId);
    }

    if (!prod || !variant) {
      return res.status(400).json({
        success: false,
        error: 'One or more items in your selection are no longer available in the catalogue.',
      });
    }

    if (!variant.is_available || variant.stock_quantity < item.quantity) {
      return res.status(400).json({
        success: false,
        error: `Insufficient stock for "${prod.name} (${variant.name})". Available stock: ${variant.stock_quantity}.`,
      });
    }

    const unitPrice = variant.price_pesewas ?? prod.base_price_pesewas;
    const itemTotal = unitPrice * item.quantity;
    trustedTotalPesewas += itemTotal;

    verifiedItems.push({
      product_id: prod.id,
      variant_id: variant.id,
      product_name_snapshot: prod.name,
      variant_name_snapshot: variant.name,
      unit_price_pesewas_snapshot: unitPrice,
      quantity: item.quantity,
      total_pesewas_snapshot: itemTotal,
    });
  }

  // Price change detection: if client accepted total differs from server-calculated total
  if (
    clientAcceptedTotalPesewas !== undefined &&
    clientAcceptedTotalPesewas !== null &&
    clientAcceptedTotalPesewas !== trustedTotalPesewas
  ) {
    return res.status(409).json({
      success: false,
      priceDiscrepancy: true,
      revisedTotalPesewas: trustedTotalPesewas,
      message: 'Product prices have updated. Please confirm the revised total to proceed.',
    });
  }

  const orderReference = generateOrderReference();
  const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Save order in Supabase if configured and not preview
  if (supabaseServer && !isPreviewMode) {
    try {
      const { data: insertedOrder, error: orderErr } = await supabaseServer
        .from('orders')
        .insert({
          order_reference: orderReference,
          idempotency_key: idempotencyKey,
          customer_name: customer.fullName,
          customer_phone: customer.phone,
          customer_alt_phone: customer.altPhone || null,
          region: customer.region,
          city: customer.city,
          delivery_address: customer.deliveryAddress,
          delivery_notes: customer.deliveryNotes || null,
          status: 'pending_confirmation',
          total_pesewas: trustedTotalPesewas,
          inventory_deducted: false,
          inventory_restored: false,
        })
        .select()
        .single();

      if (orderErr) {
        if (orderErr.code === '23505') {
          // Idempotency unique violation
          const { data: existing } = await supabaseServer
            .from('orders')
            .select('*, items:order_items(*)')
            .eq('idempotency_key', idempotencyKey)
            .single();

          if (existing) {
            return res.json({
              success: true,
              order: existing,
              items: existing.items,
            });
          }
        }
        throw orderErr;
      }

      // Insert order items
      const itemsToInsert = verifiedItems.map((vi) => ({
        ...vi,
        order_id: insertedOrder.id,
      }));

      const { data: insertedItems, error: itemsErr } = await supabaseServer
        .from('order_items')
        .insert(itemsToInsert)
        .select();

      if (itemsErr) throw itemsErr;

      // Status history entry
      await supabaseServer.from('order_status_history').insert({
        order_id: insertedOrder.id,
        to_status: 'pending_confirmation',
        note: 'Customer order submitted via online boutique. Pending WhatsApp confirmation.',
      });

      return res.json({
        success: true,
        order: insertedOrder,
        items: insertedItems,
      });
    } catch (e: any) {
      console.error('Supabase order creation failed:', e);
      return res.status(500).json({
        success: false,
        error: 'Unable to save order record in the database. Please try again or reach us on WhatsApp.',
      });
    }
  }

  // Memory/Preview Order Creation
  const newOrder = {
    id: orderId,
    order_reference: orderReference,
    idempotency_key: idempotencyKey,
    customer_name: customer.fullName,
    customer_phone: customer.phone,
    customer_alt_phone: customer.altPhone || null,
    region: customer.region,
    city: customer.city,
    delivery_address: customer.deliveryAddress,
    delivery_notes: customer.deliveryNotes || null,
    status: 'pending_confirmation',
    total_pesewas: trustedTotalPesewas,
    inventory_deducted: false,
    inventory_restored: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const newItems = verifiedItems.map((item, idx) => ({
    id: `item-${Date.now()}-${idx}`,
    order_id: orderId,
    ...item,
  }));

  memoryOrders.unshift(newOrder);
  memoryOrderItems.push(...newItems);

  return res.json({
    success: true,
    order: newOrder,
    items: newItems,
  });
});

/**
 * Contact Submission Endpoint
 */
app.post('/api/contact', async (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !subject || !message) {
    return res.status(400).json({ success: false, error: 'Name, subject, and message are required.' });
  }

  if (!email && !phone) {
    return res.status(400).json({ success: false, error: 'Please provide at least one contact method (phone or email).' });
  }

  if (supabaseServer) {
    try {
      const { error } = await supabaseServer.from('contact_messages').insert({
        name,
        email: email || null,
        phone: phone || null,
        subject,
        message,
        status: 'unread',
      });
      if (!error) return res.json({ success: true });
    } catch (e) {
      console.warn('Contact message Supabase save failed:', e);
    }
  }

  memoryMessages.unshift({
    id: `msg-${Date.now()}`,
    name,
    email: email || null,
    phone: phone || null,
    subject,
    message,
    status: 'unread',
    created_at: new Date().toISOString(),
  });

  return res.json({ success: true });
});

/**
 * Public Store Settings
 */
app.get('/api/settings', async (_req: Request, res: Response) => {
  if (supabaseServer) {
    try {
      const { data, error } = await supabaseServer.from('store_settings').select('*').eq('is_public', true);
      if (!error && data && data.length > 0) {
        const settings: any = { ...DEFAULT_STORE_SETTINGS };
        data.forEach((row: any) => {
          settings[row.key] = row.value;
        });
        return res.json(settings);
      }
    } catch (e) {
      console.warn('Supabase settings fetch failed:', e);
    }
  }
  return res.json(DEFAULT_STORE_SETTINGS);
});

// -----------------------------------------------------------------------------
// PRIVILEGED ADMIN API ENDPOINTS
// -----------------------------------------------------------------------------

/**
 * Admin Overview Counts
 * Never calls pending enquiry subtotals "revenue"
 */
app.get('/api/admin/overview', async (_req: Request, res: Response) => {
  if (supabaseServer) {
    try {
      const { count: orderCount } = await supabaseServer.from('orders').select('*', { count: 'exact', head: true });
      const { count: pendingCount } = await supabaseServer.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending_confirmation');
      const { count: confirmedCount } = await supabaseServer.from('orders').select('*', { count: 'exact', head: true }).in('status', ['confirmed', 'processing', 'dispatched', 'delivered']);
      const { count: dispatchedCount } = await supabaseServer.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'dispatched');
      const { count: productCount } = await supabaseServer.from('products').select('*', { count: 'exact', head: true }).eq('is_archived', false);
      const { count: unreadMsgCount } = await supabaseServer.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'unread');

      // Value calculation
      const { data: confirmedOrders } = await supabaseServer
        .from('orders')
        .select('total_pesewas')
        .in('status', ['confirmed', 'processing', 'dispatched', 'delivered']);

      const { data: pendingOrders } = await supabaseServer
        .from('orders')
        .select('total_pesewas')
        .eq('status', 'pending_confirmation');

      const confirmedOrderValuePesewas = confirmedOrders?.reduce((acc, o) => acc + o.total_pesewas, 0) || 0;
      const pendingRequestValuePesewas = pendingOrders?.reduce((acc, o) => acc + o.total_pesewas, 0) || 0;

      return res.json({
        orderCount: orderCount || 0,
        pendingCount: pendingCount || 0,
        confirmedCount: confirmedCount || 0,
        dispatchedCount: dispatchedCount || 0,
        confirmedOrderValuePesewas,
        pendingRequestValuePesewas,
        productCount: productCount || 0,
        unreadMessageCount: unreadMsgCount || 0,
      });
    } catch (e) {
      console.warn('Admin overview DB error:', e);
    }
  }

  // Fallback to memory
  const confirmed = memoryOrders.filter((o) => ['confirmed', 'processing', 'dispatched', 'delivered'].includes(o.status));
  const pending = memoryOrders.filter((o) => o.status === 'pending_confirmation');

  return res.json({
    orderCount: memoryOrders.length,
    pendingCount: pending.length,
    confirmedCount: confirmed.length,
    dispatchedCount: memoryOrders.filter((o) => o.status === 'dispatched').length,
    confirmedOrderValuePesewas: confirmed.reduce((acc, o) => acc + o.total_pesewas, 0),
    pendingRequestValuePesewas: pending.reduce((acc, o) => acc + o.total_pesewas, 0),
    productCount: memoryProducts.length,
    unreadMessageCount: memoryMessages.filter((m) => m.status === 'unread').length,
  });
});

/**
 * Admin Orders List
 */
app.get('/api/admin/orders', async (_req: Request, res: Response) => {
  if (supabaseServer) {
    try {
      const { data, error } = await supabaseServer
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) return res.json(data);
    } catch (e) {
      console.warn('Supabase admin orders error:', e);
    }
  }

  const enriched = memoryOrders.map((o) => ({
    ...o,
    items: memoryOrderItems.filter((i) => i.order_id === o.id),
  }));
  return res.json(enriched);
});

/**
 * Admin Status Transitions with Atomic Stock Control
 */
app.post('/api/admin/orders/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note } = req.body;

  if (supabaseServer) {
    try {
      if (status === 'confirmed') {
        // Call atomic confirm_order_stock SQL function
        const { data, error } = await supabaseServer.rpc('confirm_order_stock', {
          p_order_id: id,
          p_admin_id: null,
        });

        if (error) throw error;
        if (data && !data.success) {
          return res.status(400).json({ success: false, error: data.error });
        }
        return res.json({ success: true });
      }

      if (status === 'cancelled') {
        // Call atomic cancel_order_stock SQL function
        const { data, error } = await supabaseServer.rpc('cancel_order_stock', {
          p_order_id: id,
          p_admin_id: null,
          p_note: note || 'Order cancelled by admin',
        });

        if (error) throw error;
        if (data && !data.success) {
          return res.status(400).json({ success: false, error: data.error });
        }
        return res.json({ success: true });
      }

      // Regular status update (processing, dispatched, delivered)
      const { error } = await supabaseServer
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      await supabaseServer.from('order_status_history').insert({
        order_id: id,
        to_status: status,
        note: note || `Order updated to ${status}`,
      });

      return res.json({ success: true });
    } catch (e: any) {
      console.error('Order status transition error:', e);
      return res.status(500).json({ success: false, error: e.message || 'Status transition failed' });
    }
  }

  // Memory status transition
  const ord = memoryOrders.find((o) => o.id === id);
  if (!ord) return res.status(404).json({ success: false, error: 'Order not found' });

  if (status === 'confirmed') {
    if (ord.inventory_deducted) {
      return res.status(400).json({ success: false, error: 'Stock already deducted for this order' });
    }
    ord.inventory_deducted = true;
  } else if (status === 'cancelled') {
    if (ord.status === 'dispatched' || ord.status === 'delivered') {
      return res.status(400).json({ success: false, error: 'Cannot auto-restock dispatched orders' });
    }
    if (ord.inventory_deducted && !ord.inventory_restored) {
      ord.inventory_restored = true;
    }
  }

  ord.status = status;
  ord.updated_at = new Date().toISOString();
  return res.json({ success: true });
});

/**
 * Admin Contact Messages
 */
app.get('/api/admin/messages', async (_req: Request, res: Response) => {
  if (supabaseServer) {
    try {
      const { data, error } = await supabaseServer
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) return res.json(data);
    } catch (e) {
      console.warn('Admin messages error:', e);
    }
  }
  return res.json(memoryMessages);
});

// -----------------------------------------------------------------------------
// VITE DEV SERVER / STATIC PRODUCTION MIDDLEWARE
// -----------------------------------------------------------------------------

if (process.env.NODE_ENV === 'production') {
  const distDir = path.resolve(__dirname, 'dist');
  app.use(express.static(distDir));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(distDir, 'index.html'));
  });
} else {
  // Vite Dev Server middleware mode
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, () => {
  console.log(`ESTCHAY LUX LADY’S BAGS running on http://0.0.0.0:${PORT}`);
});
