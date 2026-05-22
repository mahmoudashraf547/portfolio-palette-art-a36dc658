# Cloudflare Pages: Persistent Storage & Cache Fix Guide

## Problem Summary
Files, images, and edits only appear for the uploader and disappear after redeployment because:
1. Files stored in IndexedDB (browser-local, not shared)
2. Files stored in local JSON (lost on deploy)
3. Cloudflare cache obscuring new uploads
4. No persistent cloud storage integration

**Solution**: Use Cloudflare R2 + proper cache configuration

---

## Part 1: Cloudflare Pages Deployment Setup

### Step 1.1: Connect Your GitHub Repository
1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Click **Create project** → **Connect to Git**
3. Select your repository
4. Configuration:
   - **Framework**: None (custom)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (default)
5. Click **Save and Deploy**

### Step 1.2: Environment Variables
1. In Pages project → **Settings** → **Environment variables**
2. Add these for **Production**:
   ```
   NODE_VERSION=20.x
   R2_API_TOKEN_ID=xxxxx
   R2_API_TOKEN_SECRET=xxxxx
   R2_ACCOUNT_ID=xxxxx
   R2_BUCKET_NAME=portfolio-files
   ```
3. For **Preview** (staging):
   ```
   NODE_VERSION=20.x
   R2_API_TOKEN_ID=xxxxx
   R2_API_TOKEN_SECRET=xxxxx
   R2_ACCOUNT_ID=xxxxx
   R2_BUCKET_NAME=portfolio-files-preview
   ```
4. Click **Save**

### Step 1.3: Build Configuration
1. Pages → **Settings** → **Build settings**
2. Verify:
   - Build command: `npm run build`
   - Build output: `dist`
3. **Build caching**: ✅ Enable (faster rebuilds)

---

## Part 2: Cache Control Headers & Rules

### Step 2.1: Create `_headers` File for Cache Rules
Create `public/_headers`:
```
# HTML - No cache (always fresh)
/index.html
  Cache-Control: no-cache, no-store, must-revalidate
  Content-Type: text/html; charset=utf-8

# API Routes - No cache (always fresh)
/api/*
  Cache-Control: no-cache, no-store, must-revalidate

# Static assets - Cache forever (content-hashed)
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# Images - Cache 30 days
/images/*
  Cache-Control: public, max-age=2592000

# Fonts - Cache 1 year
/fonts/*
  Cache-Control: public, max-age=31536000, immutable
```

### Step 2.2: Create `_redirects` File (Optional)
Create `public/_redirects`:
```
# Redirect trailing slashes
/* /:splat 200
```

### Step 2.3: Configure Cloudflare Cache Rules
1. Go to **Cloudflare Dashboard** → **Caching**
2. Click **Rules** → **Cache Rules**
3. Create rule for API:
   ```
   Condition: (cf.request.uri.path contains "/api/")
   Cache: Bypass Cache
   ```
4. Create rule for HTML:
   ```
   Condition: (cf.request.uri.path eq "/index.html")
   Cache: Bypass Cache
   ```
5. Create rule for R2 files:
   ```
   Condition: (cf.request.uri.path contains "/api/r2/")
   Cache: Bypass Cache
   ```

---

## Part 3: Purge Cache After Deployments

### Option A: Automatic Purge via API
Create `.github/workflows/purge-cache.yml`:
```yaml
name: Purge Cloudflare Cache

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  purge:
    runs-on: ubuntu-latest
    steps:
      - name: Purge Cloudflare Cache
        env:
          CF_ZONE_ID: ${{ secrets.CF_ZONE_ID }}
          CF_API_KEY: ${{ secrets.CF_API_KEY }}
          CF_ACCOUNT_EMAIL: ${{ secrets.CF_ACCOUNT_EMAIL }}
        run: |
          curl -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
            -H "X-Auth-Email: $CF_ACCOUNT_EMAIL" \
            -H "X-Auth-Key: $CF_API_KEY" \
            -H "Content-Type: application/json" \
            --data '{"files":["*"]}'
```

Get secrets from:
1. **Zone ID**: Cloudflare dashboard → Overview → Copy Zone ID
2. **API Key**: Cloudflare dashboard → Profile → API Tokens → Create token
3. **Account Email**: Your Cloudflare account email

### Option B: Manual Purge
1. Cloudflare Dashboard → **Caching** → **Configuration**
2. Click **Purge Everything**
3. Confirm

### Option C: Purge Specific Files
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "X-Auth-Email: your@email.com" \
  -H "X-Auth-Key: your_api_key" \
  -H "Content-Type: application/json" \
  --data '{
    "files": [
      "https://yourdomain.com/index.html",
      "https://yourdomain.com/api/*"
    ]
  }'
```

---

## Part 4: Prevent Browser Caching

### Step 4.1: Server-Side Headers (Already Configured)
The API endpoints automatically set:
```
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
```

### Step 4.2: HTML Meta Tags
Ensure `public/index.html` includes:
```html
<head>
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
</head>
```

### Step 4.3: Client-Side JavaScript
Add to `src/start.tsx` or main app entry:
```javascript
// Prevent browser cache of dynamic content
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
  });
}

// Force fetch without cache
fetch('/index.html', { 
  cache: 'no-store',
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  }
});
```

---

## Part 5: Ensure Files Survive Redeployments

### Current Solution: Cloudflare R2
✅ All files uploaded to R2 (not local)
✅ R2 URLs are permanent and globally distributed
✅ Files persist across redeployments
✅ Portfolio data stored in JSON (backed by R2 references)

### Step 5.1: Verify Portfolio Data Persistence
Portfolio state (which files are in sections) is still stored in `src/data/portfolio-data.json`. This file:
- Contains references to R2 URLs (not the actual file content)
- Can be committed to Git for version control
- Or backed up to separate persistent storage if needed

### Step 5.2: Backup Portfolio Data (Optional)
If you want automatic backups of `portfolio-data.json`:

Option A: Commit to Git (recommended)
```bash
git add src/data/portfolio-data.json
git commit -m "Update portfolio data"
git push
```

Option B: Backup to R2
Create an API endpoint `/api/backup` that copies `portfolio-data.json` to R2 as backup.

---

## Part 6: Configure CDN & Performance

### Step 6.1: Enable Brotli Compression
1. Cloudflare Dashboard → **Speed** → **Optimization**
2. ✅ **Brotli**: On
3. ✅ **Minify CSS**: On
4. ✅ **Minify JavaScript**: On
5. ✅ **Minify HTML**: On

### Step 6.2: Enable HTTP/3 (QUIC)
1. Cloudflare Dashboard → **Network** 
2. ✅ **HTTP/3 (with QUIC)**: On
3. ✅ **IPv6**: On

### Step 6.3: Configure TLS
1. Cloudflare Dashboard → **SSL/TLS** → **Overview**
2. Mode: **Full (strict)** recommended
3. Minimum TLS Version: **1.2**

---

## Part 7: Monitor Uploads & Performance

### Step 7.1: Check Cloudflare Pages Logs
1. Pages → Your project → **Deployments**
2. Click latest deployment
3. View **Deployment log** for build errors
4. View **Functions log** for API errors

### Step 7.2: Monitor R2 Bucket
1. Cloudflare Dashboard → **R2** → **portfolio-files**
2. Check uploaded files appear in dashboard
3. Monitor usage/costs

### Step 7.3: Test Upload Performance
```bash
# Upload test file and measure time
time curl -X POST https://yourdomain.com/api/r2/upload \
  -F "fileId=test-$(date +%s)" \
  -F "file=@large-file.pdf"
```

---

## Part 8: Troubleshooting Cache Issues

### Issue: Old file versions still showing
**Solution 1**: Purge cache immediately
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "X-Auth-Email: your@email.com" \
  -H "X-Auth-Key: your_api_key" \
  -H "Content-Type: application/json" \
  --data '{"files":["*"]}'
```

**Solution 2**: Hard refresh browser
- Windows: `Ctrl+Shift+Delete`
- Mac: `Cmd+Shift+Delete`

**Solution 3**: Check cache control headers
```bash
curl -I https://yourdomain.com/index.html | grep -i cache
```

Should show: `Cache-Control: no-cache, no-store, must-revalidate`

### Issue: Uploads working locally, not in production
**Solution**:
1. Check env vars in Pages Settings
2. Check build logs: Pages → Deployments → View build log
3. Verify R2 bucket exists and has correct name
4. Test API endpoint: `curl https://yourdomain.com/api/r2/upload`

### Issue: "Mixed Content" error
**Solution**: 
1. Ensure API calls use `https://` (not `http://`)
2. R2 URLs are already `https://`
3. Check browser console for mixed content warnings

### Issue: CORS errors on file upload
**Solution**:
1. Check R2 CORS configuration (see R2 setup guide)
2. Verify API endpoint `/api/r2/upload` is accessible
3. Check request headers in browser DevTools

---

## Part 9: Production Checklist

- [ ] R2 bucket created and configured
- [ ] Environment variables set in Pages settings
- [ ] `_headers` file in `public/` directory
- [ ] Cache rules configured in Cloudflare dashboard
- [ ] GitHub workflow for cache purge set up (optional)
- [ ] Test file upload works
- [ ] Verify file accessible from R2 URL
- [ ] Test from incognito window (no browser cache)
- [ ] Purge cache after deployment
- [ ] Verify `/api/r2/*` endpoints return correct cache headers
- [ ] Monitor Pages logs for errors

---

## Part 10: Performance Metrics

### Current Bottlenecks (Before)
- ❌ IndexedDB: User-specific, not shared
- ❌ Local JSON: Lost on deploy
- ❌ No cache control: Stale content served

### After Implementation
- ✅ R2: Global, permanent, user-agnostic
- ✅ Cloudflare CDN: Files cached globally
- ✅ Cache headers: API always fresh
- ✅ Immutable files: Timestamp-based cache busting

### Expected Performance
- Upload: 1-5 seconds (depending on file size)
- Availability: <100ms (cached globally)
- Cache time: HTML: fresh, Assets: 1 year
- Cost: ~$0.015/GB storage + requests

---

## Summary: What Was Changed

### Files Modified:
1. ✅ `src/lib/r2-storage.ts` - Complete R2 implementation
2. ✅ `src/routes/api/r2.tsx` - API endpoints with cache headers
3. ✅ `src/components/portfolio/FileUploader.tsx` - Upload to R2
4. ✅ `wrangler.jsonc` - R2 bucket configuration

### What's Now Permanent:
- ✅ Uploaded files (R2)
- ✅ Portfolio data (JSON + Git)
- ✅ Images, PDFs, documents (R2 + CDN)
- ✅ All user edits (JSON)

### What's Not Permanent (and shouldn't be):
- ❌ IndexedDB (now only used for temporary preview)
- ❌ Local storage (cleared on deploy)
- ❌ Blob URLs (runtime-only)

---

## Next Deployment Steps

1. Push code changes to main branch
2. Cloudflare Pages auto-deploys
3. Add R2 environment variables in Pages settings
4. Test upload on new deployment
5. Verify file accessible via R2 URL
6. Purge Cloudflare cache
7. Test from different browser/device

**Your portfolio is now permanent and world-accessible! 🎉**
