# Supabase Setup Guide — ESTCHAY LUX LADY’S BAGS

This guide details the complete configuration required to connect Supabase PostgreSQL persistence, Supabase Auth (admin login), and Supabase Storage (product photography).

---

## 1. Create a Supabase Project

1. Navigate to [Supabase](https://supabase.com) and sign in.
2. Click **New project**, choose an organization, and name your project `estchay-lux-bags`.
3. Set a strong database password and choose the closest cloud region (e.g. `eu-west-1` or `eu-central-1`).
4. Wait approximately 1–2 minutes for the database instance to provision.

---

## 2. Execute SQL Migrations & Schema

1. Open your Supabase project dashboard and click on the **SQL Editor** in the left navigation.
2. Click **New query**.
3. Copy and paste the entire contents of `supabase/migrations/20261029000000_initial_schema.sql` into the SQL Editor.
4. Click **Run**.
   - This creates all tables: `profiles`, `categories`, `products`, `product_variants`, `product_images`, `orders`, `order_items`, `order_status_history`, `inventory_movements`, `contact_messages`, and `store_settings`.
   - It sets up complete Row Level Security (RLS) policies.
   - It compiles the atomic inventory functions `confirm_order_stock` and `cancel_order_stock`.

---

## 3. Seed Initial Demo Products and Categories

1. Open a new query in the **SQL Editor**.
2. Copy and paste the contents of `supabase/seed.sql`.
3. Click **Run**.
   - This seeds the 4 primary categories (`Tote Bags`, `Handbags`, `Handbag Sets`, `Purses & Pouches`).
   - This seeds the initial 7 demo handbag records (as `is_demo = true`, `is_published = false` so that production only exposes owner-published inventory).
   - This seeds default store settings with verified Ghana phone (`0548003400`) and WhatsApp (`233548003400`).

---

## 4. Setup Supabase Storage for Product Images

1. Click on **Storage** in the Supabase left navigation.
2. Click **New bucket**.
3. Bucket configuration:
   - **Bucket Name**: `product-images`
   - **Public bucket**: Checked (ON) — this allows public visitors to see handbag photography on the storefront.
   - **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`.
   - **Maximum file size limit**: `5 MB`.
4. Click **Create bucket**.
5. Under **Storage Policies**:
   - Allow `SELECT` for public (unauthenticated users).
   - Allow `INSERT`, `UPDATE`, `DELETE` only for authenticated users with role `admin` in `profiles`.

---

## 5. Provision Administrator Account (Supabase Auth)

Public registration is disabled. Administrator access is strictly provisioned by the owner:

1. In Supabase, navigate to **Authentication** → **Users**.
2. Click **Add user** → **Create user**.
3. Enter the store owner email (e.g. `owner@estchaybags.com`) and a temporary secure password.
4. Check **Auto Confirm User?** to mark the email as verified immediately.
5. In the **SQL Editor**, grant this user the administrator role in `public.profiles`:
   ```sql
   INSERT INTO public.profiles (id, email, role)
   SELECT id, email, 'admin'
   FROM auth.users
   WHERE email = 'owner@estchaybags.com'
   ON CONFLICT (id) DO UPDATE SET role = 'admin';
   ```
6. The administrator can now log in at `/admin/login` and reset their password anytime using the "Forgot password?" link.

---

## 6. Configure Environment Variables

Retrieve your project keys from **Project Settings** → **API**:

```env
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOi..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..." # NEVER share publicly; server-side only
ADMIN_EMAIL="owner@estchaybags.com"
```

Add these variables to your AI Studio Secrets panel or local `.env` file. Once detected, the application automatically transitions from labelled preview mode to live Supabase persistence.
