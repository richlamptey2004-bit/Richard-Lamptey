# Vercel Deployment Guide — ESTCHAY LUX LADY’S BAGS

This guide outlines how to deploy ESTCHAY LUX LADY’S BAGS to Vercel with zero breaking changes.

---

## 1. Architecture Overview on Vercel

- **Frontend**: React 19 SPA built via Vite into `dist/`.
- **Routing**: `vercel.json` rewrites all non-asset requests to `/index.html` to allow direct URL visits to `/shop`, `/about`, `/order`, `/contact`, `/privacy`, and `/admin/*`.
- **API Serverless Endpoints**: Mounted at `/api/*` via `api/index.ts`.

---

## 2. Prerequisites & Project Settings in Vercel

1. Push your code to GitHub, GitLab, or Bitbucket.
2. Log in to [Vercel](https://vercel.com) and click **Add New...** → **Project**.
3. Import your repository.
4. Set the build and development settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

---

## 3. Configure Environment Variables in Vercel

In the Vercel project configuration, add:

| Variable Name | Environment | Description |
| :--- | :--- | :--- |
| `SUPABASE_URL` | Production, Preview | Your Supabase project URL (`https://xyz.supabase.co`) |
| `SUPABASE_ANON_KEY` | Production, Preview | Public Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | Secret service-role key (server-side only) |
| `ADMIN_EMAIL` | Production, Preview | Owner administrator email |
| `VITE_STORE_PHONE` | Production, Preview | `0548003400` |
| `VITE_WHATSAPP_NUMBER` | Production, Preview | `233548003400` |

*Security Warning:* Never prefix `SUPABASE_SERVICE_ROLE_KEY` with `VITE_`. Vercel serverless functions access it securely on the server side without exposing it to the browser bundle.

---

## 4. Verification After Deployment

Once deployed:
1. Verify that visiting `/` loads the homepage.
2. Verify that visiting `/shop` directly via browser address bar or refresh works without 404 errors (handled by `vercel.json` rewrites).
3. Test adding an item to the bag and visiting `/order`.
4. Test submitting an order request and verify that the pre-formatted WhatsApp link opens with target `233548003400`.
5. Access `/admin/login` and verify administrative authentication.
