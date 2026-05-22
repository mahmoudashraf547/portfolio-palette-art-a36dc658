# Supabase Storage Setup Guide (No Credit Card Required)

## Overview
Your portfolio now uses **Supabase Storage** instead of Cloudflare R2. Supabase is free, requires no credit card, and includes:
- ✅ 2GB free storage
- ✅ Unlimited API requests
- ✅ PostgreSQL database included
- ✅ Built-in authentication
- ✅ Real-time subscriptions
- ✅ Public file URLs
- ✅ No credit card required (free tier)

---

## Part 1: Create Supabase Account (2 minutes)

### Step 1.1: Sign Up
1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign up with GitHub, Google, or email
4. Verify your email

### Step 1.2: Create Project
1. Click **"New Project"**
2. Enter:
   - **Project name**: `portfolio-palette`
   - **Database password**: Strong password (save it!)
   - **Region**: Choose closest to you
3. Click **"Create new project"**
4. Wait 2-3 minutes for project to initialize

---

## Part 2: Get API Credentials (2 minutes)

### Step 2.1: Find API Keys
1. Open your Supabase project
2. Click **Settings** (gear icon) → **API**
3. You'll see:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (safe to use in browser)
   - **service_role secret** (keep this secret)

### Step 2.2: Copy Credentials
```
Project URL:        https://xxxxx.supabase.co
Anon Public Key:    eyJhbGc...
Service Role Key:   eyJhbGc...
```

---

## Part 3: Create Storage Bucket (1 minute)

### Step 3.1: Create Bucket
1. In Supabase, click **Storage** (left sidebar)
2. Click **"Create a new bucket"**
3. Enter name: `portfolio-files`
4. Toggle **"Public bucket"** ON (so files are accessible without auth)
5. Click **"Create bucket"**

### Step 3.2: Verify Public Access
1. In Storage, click bucket **"portfolio-files"**
2. Verify it shows **"Public"** status
3. Files uploaded here will have public URLs automatically

---

## Part 4: Configure Environment Variables (2 minutes)

### Step 4.1: Create `.env.local` File
In your project root, create `.env.local`:

```bash
# From Supabase Settings → API
VITE_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your_anon_key
SUPABASE_ANON_KEY=eyJhbGc...your_anon_key

# Optional: For server-side operations
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your_service_role_key
```

Replace:
- `xxxxx.supabase.co` with your actual project URL
- `eyJhbGc...` with your actual API keys

### Step 4.2: Keep `.env.local` Secret
- ✅ Already in `.gitignore` (won't be committed)
- ✅ Never share these credentials
- ✅ Anon key is safe for browser (limited permissions)
- ✅ Service role key is secret (never expose)

---

## Part 5: Configure Cloudflare Pages (3 minutes)

### Step 5.1: Add Environment Variables to Pages
1. Go to Cloudflare Pages → Your project → **Settings**
2. Click **Environment variables**
3. Select **Production** environment
4. Add these variables:

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_ANON_KEY` | Your anon public key |
| `NODE_VERSION` | `20.x` |

### Step 5.2: Save Variables
1. Click **Save**
2. These are now available to your deployed app

---

## Part 6: Test Locally (2 minutes)

### Step 6.1: Start Dev Server
```bash
npm run dev
```

### Step 6.2: Test Upload
1. Open http://localhost:5173
2. Try uploading a test file (PDF, image, etc.)
3. File should upload successfully
4. Check browser console for success message
5. File should show in Supabase dashboard → Storage

### Step 6.3: Verify File
1. Go to Supabase dashboard → Storage → **portfolio-files**
2. You should see your uploaded file
3. Click file to get public URL
4. Open URL in new browser tab
5. ✅ File should be publicly accessible!

---

## Part 7: Deploy to Cloudflare Pages (5 minutes)

### Step 7.1: Push Code
```bash
git add -A
git commit -m "Switch from R2 to Supabase Storage"
git push origin main
```

### Step 7.2: Wait for Deployment
1. Go to Cloudflare Pages → Your project → **Deployments**
2. Wait 2-5 minutes for deployment
3. Should show green checkmark ✅ when complete

### Step 7.3: Test Production
1. Visit your deployed site: `https://yourdomain.com`
2. Upload test file
3. File should work same as development
4. Verify in Supabase dashboard

---

## Part 8: API Endpoints Reference

### Upload Endpoint
```
POST /api/storage/upload

Request:
  - FormData with:
    - fileId: string (UUID)
    - file: File object

Response:
  {
    "success": true,
    "url": "https://xxxxx.supabase.co/storage/v1/object/public/portfolio-files/...",
    "key": "fileId/timestamp-filename.pdf"
  }
```

### Delete Endpoint
```
POST /api/storage/delete

Request:
  {
    "key": "fileId/timestamp-filename.pdf"
  }

Response:
  {
    "success": true
  }
```

---

## Part 9: Public URL Format

All uploaded files get public URLs like:
```
https://YOUR_SUPABASE_URL.supabase.co/storage/v1/object/public/portfolio-files/fileId/timestamp-filename.pdf
```

These URLs are:
- ✅ Public (no authentication needed)
- ✅ Permanent (files never deleted automatically)
- ✅ Globally accessible (Supabase CDN)
- ✅ Shareable (anyone can access)

---

## Part 10: Troubleshooting

### Issue: "Supabase credentials not configured"
**Solution**:
1. Check `.env.local` has all variables
2. Verify no typos in variable names
3. Restart dev server: `npm run dev`

### Issue: Upload fails with error
**Solution**:
1. Check Supabase credentials are correct
2. Verify `portfolio-files` bucket exists
3. Check bucket is set to **Public**
4. Check file size < 100MB

### Issue: File 404 after upload
**Solution**:
1. Check file appears in Supabase Storage dashboard
2. Verify bucket is public (not private)
3. Try copying URL directly from Supabase
4. File URL should work in browser

### Issue: CORS errors
**Solution**:
1. Supabase handles CORS automatically
2. Public buckets don't need special config
3. Error usually means wrong credentials
4. Check env vars in Pages settings

### Issue: Files not visible on production
**Solution**:
1. Verify env vars set in Cloudflare Pages
2. Rebuild/redeploy: `git push origin main`
3. Check Pages build logs (Deployments → View logs)
4. Verify same bucket name on production

---

## Security Checklist

✅ **Credentials Protected**:
- `.env.local` in `.gitignore` (not committed)
- Anon key is safe for browser (read-only)
- Service role key never exposed in code

✅ **File Access**:
- Bucket is public (files accessible)
- Files can't be deleted from browser (API-only)
- Timestamps prevent accidental overwrites

✅ **Data Validation**:
- File size checked (100MB max)
- File type validated
- Backend validates all uploads

---

## Cost

Supabase free tier includes:
- ✅ **2GB storage** (upgrade as needed)
- ✅ **Unlimited API requests**
- ✅ **1GB bandwidth**
- ✅ **No credit card required**

For larger projects:
- Pay-as-you-go starting at $25/month
- Per-GB pricing transparent
- Easy to scale up

---

## What Changed from R2 to Supabase

| Feature | R2 | Supabase |
|---------|----|-----------| 
| Credit Card | ✅ Required | ❌ Not required |
| Setup Time | 15 min | 5 min |
| Cost | From day 1 | Free forever tier |
| Storage | Unlimited | 2GB free |
| API Requests | Pay-per-use | Unlimited free |
| Database | Not included | Included |
| Auth | Not included | Included |
| Real-time | Not included | Included |

**Result**: Same functionality, free, no credit card needed! 🎉

---

## Next Steps

1. ✅ Create Supabase account
2. ✅ Create storage bucket
3. ✅ Add environment variables
4. ✅ Test locally (`npm run dev`)
5. ✅ Set Pages environment variables
6. ✅ Deploy to Pages
7. ✅ Test on production
8. ✅ Share your portfolio! 🚀

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Storage Docs**: https://supabase.com/docs/guides/storage
- **Discord Community**: https://discord.supabase.com

---

## Summary

Your portfolio now has:
✅ Free file storage (Supabase)
✅ No credit card required
✅ Permanent, public files
✅ Global CDN distribution
✅ Professional infrastructure
✅ Backup and recovery included
✅ Easy to scale up

**Everything is configured. You just need to add your Supabase credentials and deploy!** 🎊
