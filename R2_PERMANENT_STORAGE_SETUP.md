# Cloudflare R2 Permanent Storage Setup Guide

## Overview
This guide configures Cloudflare R2 as permanent, publicly-accessible storage for your portfolio files. Files uploaded to R2 are globally distributed, survive redeployments, and are visible to all users immediately.

## Why R2?
- ✅ **Permanent**: Files survive redeployments and Cloudflare Pages rebuilds
- ✅ **Public**: All users worldwide can access uploaded files instantly
- ✅ **Cache-controlled**: Files are immutable once uploaded (no stale cache issues)
- ✅ **Scalable**: Handles large files, PDFs, images efficiently
- ✅ **No local storage**: Files not stored in JSON/IndexedDB (which disappear after deployment)

---

## Part 1: Create Cloudflare R2 Bucket

### Step 1.1: Create R2 API Token
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Account Home**
2. Click **R2** in the left sidebar
3. Click **Create bucket**
4. Name: `portfolio-files`
5. Location: Choose nearest region (or auto)
6. Click **Create bucket**

### Step 1.2: Generate R2 API Credentials
1. In R2, click **Settings** (gear icon)
2. Go to **R2 API Token** section
3. Click **Create API Token**
4. Name: `portfolio-uploader`
5. Permissions: 
   - ✅ **Object** → Admin
   - ✅ **Account** → (optional, uncheck if not needed)
6. TTL: Set to 1 year or "Never expires"
7. Click **Create API Token**

### Step 1.3: Copy API Credentials
You'll see:
- `Access Key ID` → Copy this to `R2_API_TOKEN_ID`
- `Secret Access Key` → Copy this to `R2_API_TOKEN_SECRET`

Also copy your **Account ID** (visible at top of R2 dashboard)

---

## Part 2: Environment Variables Setup

### For Development (`dev` mode)

Create `.env.local` file in project root:
```bash
# R2 API Credentials
R2_API_TOKEN_ID=your_access_key_id_here
R2_API_TOKEN_SECRET=your_secret_access_key_here
R2_ACCOUNT_ID=your_account_id_here
R2_BUCKET_NAME=portfolio-files

# Optional: Custom domain (if you set one up)
R2_PUBLIC_DOMAIN=
```

### For Production (Cloudflare Pages)

1. Go to your Cloudflare Pages project → **Settings**
2. Click **Environment variables**
3. Add environment variables for **Production**:

| Key | Value |
|-----|-------|
| `R2_API_TOKEN_ID` | your_access_key_id |
| `R2_API_TOKEN_SECRET` | your_secret_access_key |
| `R2_ACCOUNT_ID` | your_account_id |
| `R2_BUCKET_NAME` | portfolio-files |
| `R2_PUBLIC_DOMAIN` | (leave blank or add custom domain) |

⚠️ **IMPORTANT**: These are sensitive credentials. Never commit `.env.local` to Git.

---

## Part 3: R2 Public Access Configuration

### Step 3.1: Allow Public Read Access
1. Go to Cloudflare **R2** → **portfolio-files** bucket
2. Click **Settings** tab
3. Scroll to **CORS** section
4. Click **Add CORS policy**
5. Configure:
   ```json
   {
     "AllowedOrigins": ["https://yourdomain.com"],
     "AllowedMethods": ["GET", "HEAD"],
     "AllowedHeaders": ["*"]
   }
   ```
6. Click **Save**

### Step 3.2: Set Bucket Public Read Policy (OPTIONAL - for direct public access)
1. In R2 bucket → **Settings** → **Bucket details**
2. Look for **Bucket access** option
3. To enable public access without requiring authentication:
   - Click **Make public** (if available)
   - Or configure **Bucket policy** to allow public `s3:GetObject`

**OR use public R2 URL format** (no additional config needed):
```
https://pub-{accountId}.r2.dev/{bucketName}/{key}
```

---

## Part 4: Custom Domain (Optional but Recommended)

### Option A: Cloudflare Domain
1. Go to R2 bucket → **Settings**
2. Look for **Public R2 URL** or **Custom Domain**
3. Enter: `files.yourdomain.com` (where yourdomain.com is registered with Cloudflare)
4. Update `.env` files:
   ```
   R2_PUBLIC_DOMAIN=files.yourdomain.com
   ```

### Option B: Use Default Public R2 URL
If no custom domain, files are served from:
```
https://pub-{R2_ACCOUNT_ID}.r2.dev/{BUCKET_NAME}/{key}
```

This is automatically used in the code if `R2_PUBLIC_DOMAIN` is empty.

---

## Part 5: Cloudflare Pages Cache Configuration

### Step 5.1: Create `_routes.json` for Cache Rules
Create `public/_routes.json`:
```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": [
    "/api/*",
    "*.css",
    "*.js",
    "*.png",
    "*.jpg",
    "*.gif",
    "*.svg"
  ]
}
```

### Step 5.2: Create `wrangler.jsonc` Cache Settings
The project already includes proper cache configuration in `wrangler.jsonc`:
- R2 bucket bindings
- Environment variables
- Cache-control headers set via API responses

### Step 5.3: Purge Cache After Deployment
In Cloudflare dashboard:
1. Go to **Pages** → Your project
2. Click **Deployments**
3. On new deployment, click **Purge Everything** to clear cache
4. Or use API:
   ```bash
   curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
     -H "X-Auth-Email: YOUR_EMAIL" \
     -H "X-Auth-Key: YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     --data '{"files":["*"]}'
   ```

---

## Part 6: Verify R2 Upload Endpoint

### Test Upload (via API)
```bash
curl -X POST http://localhost:5173/api/r2/upload \
  -F "fileId=test-$(date +%s)" \
  -F "file=@path/to/file.pdf"
```

Expected response:
```json
{
  "success": true,
  "url": "https://pub-xxxxx.r2.dev/test-xxx/timestamp-file.pdf",
  "key": "test-xxx/timestamp-file.pdf"
}
```

### Files are now:
- ✅ Uploaded to Cloudflare R2
- ✅ Publicly accessible via URL
- ✅ Cached globally by Cloudflare CDN
- ✅ Survive redeployments
- ✅ Visible to all users immediately

---

## Part 7: Local Development Testing

### Start dev server with R2
```bash
npm run dev
```

### Upload a test file
1. Open http://localhost:5173
2. Upload a PDF or image via file uploader
3. Check browser console → Network tab
4. Verify upload request to `/api/r2/upload` returns R2 URL
5. File should be accessible at returned URL

---

## Part 8: Production Deployment Checklist

- [ ] Set all 4 environment variables in Cloudflare Pages settings
- [ ] Test upload on staging environment
- [ ] Verify files are accessible from public URLs
- [ ] Check R2 bucket in Cloudflare dashboard to see uploaded files
- [ ] Test from different browser/device to confirm not browser-cached
- [ ] Purge Cloudflare cache after deployment
- [ ] Monitor `api/r2/upload` errors in Cloudflare Pages logs

---

## Part 9: Troubleshooting

### Issue: "R2 credentials not configured"
**Solution**: Check environment variables are set in Cloudflare Pages dashboard (not just `.env.local`)

### Issue: Files upload but 404 after accessing URL
**Solution**: 
1. Check R2 bucket is created and has files
2. Verify CORS policy is configured
3. Check if bucket read access is enabled
4. Try accessing via `https://pub-{accountId}.r2.dev/` URL directly

### Issue: Files disappear after refresh
**Solution**: Old code was using IndexedDB. The new code uses R2 URLs which persist.

### Issue: Upload works locally but not in production
**Solution**:
1. Verify environment variables copied exactly (no extra spaces)
2. Check Cloudflare Pages build logs for errors
3. Ensure `wrangler.jsonc` has `r2_buckets` configuration
4. Test with `npm run build` locally first

### Issue: Cache issues - old files showing
**Solution**: 
1. Purge Cloudflare cache immediately after uploading
2. API endpoints use `Cache-Control: no-cache` headers
3. File keys include timestamps to prevent cache collisions

---

## Part 10: File Structure Reference

Uploaded files in R2 are stored as:
```
portfolio-files/
  ├── {fileId}/
  │   ├── {timestamp}-filename.pdf
  │   └── {timestamp}-filename.jpg
  └── {fileId2}/
      ├── {timestamp}-filename.docx
      └── ...
```

Each file gets a unique key with timestamp to ensure cache busting and prevent overwrites.

---

## Security Best Practices

1. **Never commit credentials**: `.env.local` is in `.gitignore`
2. **Rotate tokens**: Refresh API tokens periodically
3. **Limit permissions**: Use "Object → Admin" only, not account-level access
4. **Monitor uploads**: Check R2 dashboard for unexpected files
5. **CORS restrictions**: Only allow your domain
6. **File validation**: Backend validates file types and sizes

---

## Cost Estimation

Cloudflare R2 pricing (as of 2024):
- **Storage**: $0.015 per GB/month
- **Requests**: $0.36 per million read requests, $4.50 per million write requests
- **Data egress**: First 10GB free, then $0.02 per GB

Example for 1000 portfolio files at 5MB each:
- Storage: ~$75/month
- Requests: Negligible (unless thousands of visits)

**Tip**: Use free tier for testing, upgrade only if needed.

---

## Next Steps

1. ✅ Complete all 10 parts above
2. ✅ Test file upload/download locally
3. ✅ Deploy to Cloudflare Pages
4. ✅ Verify files accessible to public
5. ✅ Monitor R2 usage in Cloudflare dashboard
