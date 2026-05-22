# Cloud Storage Integration Guide

## Recommendation: Cloudflare R2 vs Supabase

### **Choose Cloudflare R2 (Recommended)** ✅
Your project already uses:
- Cloudflare Workers with Wrangler
- TanStack Start (serverless-first framework)
- Cloudflare deployment pipeline

**R2 Advantages:**
- Native Cloudflare Workers integration (no auth layer needed)
- Seamless wrangler.jsonc configuration
- Automatic CDN caching via Cloudflare edge
- S3-compatible API (drop-in replacement)
- Simple cost model: ~$0.015/GB stored
- **All uploads instantly globally cached** without extra configuration
- Environment variables automatically injected into Workers

**R2 Setup Cost:** Free tier includes 10GB storage + free egress within Cloudflare

---

### Alternative: Supabase Storage
**Only choose if:** You need a full backend database alongside files, or prefer SQL + auth in one platform.
- Adds dependency on external service
- Requires Auth token management
- Slightly more setup overhead

---

## Implementation: Cloudflare R2 Setup

### Step 1: Create R2 Bucket in Cloudflare Dashboard
1. Go to https://dash.cloudflare.com → R2
2. Click "Create Bucket"
3. Name it: `portfolio-files`
4. Leave CORS settings default for now
5. Note the **Bucket Name** and **Account ID** (visible in URLs)

### Step 2: Generate R2 API Token
1. In Cloudflare Dashboard → Account settings → API Tokens
2. Create token with permissions:
   - **Object Storage** → Edit (all buckets)
3. Copy:
   - `API_TOKEN_ID` (Access Key ID)
   - `API_TOKEN_SECRET` (Secret Access Key)

### Step 3: Update wrangler.jsonc
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "tanstack-start-app",
  "compatibility_date": "2025-09-24",
  "compatibility_flags": ["nodejs_compat"],
  "main": "src/server.ts",
  // Add R2 binding:
  "r2": {
    "bindings": [
      {
        "bucket_name": "portfolio-files",
        "preview_bucket_name": "portfolio-files-preview",
        "binding": "R2_BUCKET"
      }
    ]
  },
  // Add environment variables:
  "vars": {
    "R2_ACCOUNT_ID": "YOUR_CLOUDFLARE_ACCOUNT_ID",
    "R2_BUCKET_NAME": "portfolio-files"
  },
  "env": {
    "production": {
      "vars": {
        "R2_ACCOUNT_ID": "YOUR_CLOUDFLARE_ACCOUNT_ID",
        "R2_BUCKET_NAME": "portfolio-files"
      }
    }
  }
}
```

### Step 4: Add Secrets to .env.local (dev only)
```bash
R2_API_TOKEN_ID=your_access_key_id
R2_API_TOKEN_SECRET=your_secret_access_key
```

### Step 5: Implement R2 Upload Service
See `src/lib/r2-storage.ts` (created below)

### Step 6: Update FileUploader to use R2
See `src/components/portfolio/FileUploader.tsx` (updated below)

### Step 7: Deploy & Test
```bash
git add .
git commit -m "feat: integrate Cloudflare R2 for persistent file storage"
git push origin main
# Cloudflare auto-deploys; monitor Dashboard
```

---

## File URL Format
Once uploaded, files are accessible at:
```
https://pub-{account-id}.r2.dev/portfolio-files/{file-id}
```

Example: `https://pub-abc123.r2.dev/portfolio-files/hero-logo.png`

---

## Cost Estimate
- **Storage:** $0.015/GB/month
- **Egress:** Free within Cloudflare (cached by edge)
- **API Calls:** $4.50/million requests (negligible for portfolio)

For a typical portfolio: ~$0.30–$1/month
