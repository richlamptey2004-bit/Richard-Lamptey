import { createClient } from '@supabase/supabase-js';
import { DEMO_CATEGORIES, DEMO_PRODUCTS, DEFAULT_STORE_SETTINGS } from '../src/data/demoProducts.js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

const isConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project-id') &&
  (supabaseServiceKey.length > 20 || supabaseAnonKey.length > 20)
);

const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

export default async function handler(req: any, res: any) {
  const urlPath = req.url || '';

  // Config Status
  if (urlPath.includes('/api/config-status')) {
    return res.status(200).json({
      supabaseConfigured: isConfigured,
      previewMode: !isConfigured,
      databaseConnected: isConfigured,
      adminEmailConfigured: Boolean(process.env.ADMIN_EMAIL),
      storageConfigured: isConfigured,
    });
  }

  // Categories
  if (urlPath.includes('/api/categories')) {
    if (supabase) {
      const { data, error } = await supabase.from('categories').select('*').eq('is_active', true);
      if (!error && data) return res.status(200).json(data);
    }
    return res.status(200).json(DEMO_CATEGORIES);
  }

  // Products
  if (urlPath.includes('/api/products')) {
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*), variants:product_variants(*), images:product_images(*)')
        .eq('is_published', true)
        .eq('is_demo', false)
        .eq('is_archived', false);
      if (!error && data) return res.status(200).json(data);
    }
    return res.status(200).json(DEMO_PRODUCTS);
  }

  // Settings
  if (urlPath.includes('/api/settings')) {
    return res.status(200).json(DEFAULT_STORE_SETTINGS);
  }

  return res.status(200).json({ status: 'ok', boutique: 'ESTCHAY LUX LADY’S BAGS' });
}
