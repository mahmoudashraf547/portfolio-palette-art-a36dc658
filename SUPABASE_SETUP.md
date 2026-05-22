# Supabase Integration Guide

## Why Supabase + R2?

You have two options:

### Option 1: **Supabase Only** (Recommended)
- PostgreSQL database + Storage bucket in one
- Real-time file tracking
- Auth built-in
- Free tier: 2GB storage, unlimited API calls
- Perfect for portfolio apps

### Option 2: **Cloudflare R2** (Already Set Up)
- Pure object storage
- Cheaper long-term
- Better CDN integration
- No database

**This guide covers Supabase.** R2 is your fallback if you prefer simpler setup.

---

## 🚀 Supabase Setup (5 minutes)

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Sign up (free tier)
3. Create new project:
   - **Organization:** Create new (or use existing)
   - **Project name:** `portfolio-palette`
   - **Region:** Choose closest to you
   - **Password:** Strong password (save it)
4. Wait for project initialization (~2 min)

### Step 2: Get API Keys
1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role secret** (for server) → `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Create Storage Bucket
1. Go to **Storage** in sidebar
2. Click **"New Bucket"** → Name: `portfolio-files`
3. Make it **Public** (toggle on)
4. Click **Create**

### Step 4: Create Database Table
Run this SQL in **SQL Editor**:

```sql
-- Create table to track uploaded files
CREATE TABLE uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  file_kind TEXT NOT NULL DEFAULT 'other',
  file_size INTEGER NOT NULL,
  storage_url TEXT NOT NULL,
  bucket_key TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  content_type TEXT NOT NULL DEFAULT 'application/octet-stream'
);

-- Create index for faster queries
CREATE INDEX idx_uploaded_files_file_id ON uploaded_files(file_id);

-- Enable RLS if needed (optional, for security)
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
```

### Step 5: Add to Project
Create `.env.local`:
```env
SUPABASE_URL=https://xxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

---

## 📦 Implementation Files

### New Dependencies
```bash
npm install @supabase/supabase-js
```

### Files to Create
- `src/lib/supabase-client.ts` — Client-side Supabase setup
- `src/lib/supabase-storage.ts` — Upload/delete logic
- `src/routes/api/supabase.tsx` — Server-side API endpoints

### Files to Update
- `src/components/portfolio/FileUploader.tsx` — Use Supabase uploads
- `src/lib/portfolio-store.tsx` — Load from Supabase on startup
- `package.json` — Add `@supabase/supabase-js`
- `.env.example` — Document credentials
- `wrangler.jsonc` — Add Supabase env vars

---

## 🔑 Where to Paste Credentials

### Local Development (`.env.local`)
```
SUPABASE_URL=https://...supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Cloudflare Deployment
```bash
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

### VS Code Environment Variables Panel
1. Create `.env.local` in project root
2. Paste values from Supabase dashboard
3. Restart dev server to pick up changes

---

## ✅ How It Works

1. **User uploads file** in Admin panel
2. **FileUploader** sends to `/api/supabase/upload`
3. **Server converts blob** to base64
4. **Supabase Storage** stores file in `portfolio-files` bucket
5. **Database entry** created with file metadata
6. **Permanent URL** returned: `https://...supabase.co/storage/v1/object/public/portfolio-files/...`
7. **All visitors** see the file immediately (no login needed)
8. **Incognito mode** works (data is server-side)

---

## 📊 File Structure in Supabase

**Storage bucket:** `portfolio-files`
```
portfolio-files/
  ├── {fileId}_{fileName}
  ├── hero-logo_2026.png
  ├── cv_rayyan.pdf
  └── ...
```

**Database table:** `uploaded_files`
```
id              | file_id | file_name    | storage_url       | uploaded_at
UUID            | TEXT    | TEXT         | TEXT              | TIMESTAMP
abc123...       | xyz789  | hero.png     | https://...       | 2026-05-22
def456...       | rst101  | cv_rayyan.pdf | https://...      | 2026-05-22
```

---

## 🔐 Security Notes

- **Storage is public** (files visible to everyone)
- **Database is private** (only your app queries it via API)
- **RLS disabled** for simplicity (enable if multi-tenant later)
- **API keys scoped:** anon for client, service_role for server

---

## 💰 Pricing

| Feature | Free Tier |
|---------|-----------|
| Storage | 2 GB |
| Database | Unlimited |
| API Calls | Unlimited |
| Egress | 2 GB/month |
| Realtime | Included |

**Cost for portfolio:** Completely free 🎉

---

## 🚨 Next Steps

1. ✅ Create Supabase account (step 1)
2. ✅ Get API keys (step 2)
3. ✅ Create storage bucket (step 3)
4. ✅ Create database table (step 4)
5. ✅ Add to `.env.local` (step 5)
6. Continue to implementation files below...
