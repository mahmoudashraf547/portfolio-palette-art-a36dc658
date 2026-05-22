# Quick Reference: R2 + Cloudflare Pages Setup

## 5-Minute Summary
Your project now uses **Cloudflare R2** instead of IndexedDB for file storage. Files are permanent, public, and visible worldwide.

---

## Setup Checklist (30 minutes total)

### Phase 1: Cloudflare R2 Setup (10 min)
- [ ] Create R2 bucket: `portfolio-files`
- [ ] Generate API credentials (Access Key ID + Secret)
- [ ] Copy Account ID
- [ ] Create `.env.local` with credentials
- [ ] Enable R2 CORS settings

### Phase 2: Cloudflare Pages Setup (10 min)
- [ ] Add R2 credentials to Pages environment variables
- [ ] Verify build command: `npm run build`
- [ ] Verify build output: `dist`
- [ ] Enable cache rules

### Phase 3: Deploy & Test (10 min)
- [ ] Push code to GitHub
- [ ] Wait for Cloudflare Pages deployment
- [ ] Test file upload
- [ ] Verify file accessible from R2 URL
- [ ] Test from incognito window (no cache)

---

## Environment Variables

### `.env.local` (Development)
```
R2_API_TOKEN_ID=xxxxx
R2_API_TOKEN_SECRET=xxxxx
R2_ACCOUNT_ID=xxxxx
R2_BUCKET_NAME=portfolio-files
```

### Cloudflare Pages (Production)
```
Same 4 variables as above, plus:
NODE_VERSION=20.x
```

---

## Key URLs & Files

| Item | Value |
|------|-------|
| R2 Bucket | `portfolio-files` |
| Upload endpoint | `/api/r2/upload` |
| Delete endpoint | `/api/r2/delete` |
| Public URL format | `https://pub-{accountId}.r2.dev/{key}` |
| Config file | `wrangler.jsonc` |
| Cache headers | `public/_headers` |

---

## Data Storage Now

| Data | Storage | Persistent? |
|------|---------|------------|
| Files (PDF, images) | Cloudflare R2 | ✅ Yes |
| Portfolio structure | Git (portfolio-data.json) | ✅ Yes |
| Cache | Cloudflare CDN | ✅ Yes |

---

## Critical Credentials

| Credential | Where to Find | Example |
|-----------|---------------|---------|
| Access Key ID | R2 → Settings → R2 API Token | `d1234567890abcdef` |
| Secret Key | R2 → Settings → R2 API Token | `abcd1234...xyz` |
| Account ID | R2 dashboard top-right or URL | `12ab34cd56ef` |
| Zone ID | Cloudflare → Overview | `zone123456` |

---

## Testing Commands

### Test Upload
```bash
curl -X POST http://localhost:5173/api/r2/upload \
  -F "fileId=test" \
  -F "file=@myfile.pdf"
```

### Test API Headers
```bash
curl -I http://localhost:5173/api/r2/upload
# Should show: Cache-Control: no-cache...
```

### Check Cache Headers (Production)
```bash
curl -I https://yourdomain.com | grep -i cache
```

---

## Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| "R2 credentials not configured" | Check Pages environment variables (Settings → Environment variables) |
| Upload works locally, fails in production | Verify env vars copied exactly (no spaces) to Pages Settings |
| File 404 after upload | Check R2 bucket exists, CORS enabled, file in dashboard |
| Old files showing | Purge cache: Cloudflare Dashboard → Caching → Purge Everything |
| Upload timeout | Check file size (<200MB), network connection |
| Mixed content error | Use HTTPS in API URLs (already configured) |

---

## Deployment Steps

```bash
# 1. Update code locally
npm run dev  # Test locally

# 2. Commit and push
git add -A
git commit -m "Implement R2 storage"
git push origin main

# 3. Cloudflare Pages auto-deploys
# Wait 2-5 minutes...

# 4. Test
curl https://yourdomain.com  # Should work

# 5. Purge cache if needed
# Cloudflare Dashboard → Caching → Purge Everything
```

---

## File Structure Changes

### New Files
- `public/_headers` - Cache control
- `public/_routes.json` - Route config
- `.env.local` - Dev credentials (not committed)

### Updated Files
- `src/lib/r2-storage.ts` - Complete R2 implementation
- `src/routes/api/r2.tsx` - Upload/delete endpoints
- `src/components/portfolio/FileUploader.tsx` - Uses R2
- `wrangler.jsonc` - R2 config

### New Documentation
- `IMPLEMENTATION_GUIDE.md` - Full implementation guide
- `R2_PERMANENT_STORAGE_SETUP.md` - R2 setup
- `CLOUDFLARE_PAGES_CACHE_FIX.md` - Cache configuration

---

## Security Reminders

✅ Never commit `.env.local` (in `.gitignore`)
✅ Keep API credentials secret
✅ Only expose public R2 URLs
✅ Use HTTPS for all requests
✅ Validate files on backend (type/size)
✅ Monitor R2 dashboard for usage

---

## Cost Estimate

- **Storage**: $0.015/GB per month
- **Requests**: $0.36/million reads, $4.50/million writes
- **Example**: 1000 portfolio files (5MB each) = ~$75/month + request costs

First 10GB egress free, then $0.02/GB

---

## Verification Steps

1. **Local test**: `npm run dev` → Upload file → Check console
2. **Build test**: `npm run build` → Verify dist/ created
3. **Production test**: 
   - Upload file
   - Copy R2 URL
   - Open in incognito window
   - File should be accessible
4. **Team test**:
   - Share URL with someone else
   - They should see your files
   - Should be immediately visible

---

## Useful Cloudflare URLs

- **Dashboard**: https://dash.cloudflare.com
- **R2**: https://dash.cloudflare.com/r2
- **Pages**: https://pages.cloudflare.com
- **API Tokens**: https://dash.cloudflare.com/profile/api-tokens
- **Zone Settings**: https://dash.cloudflare.com/zones/yourdomain.com

---

## Support Contacts

- **Cloudflare Support**: support@cloudflare.com
- **Discord Community**: https://discord.gg/cloudflaredev
- **Docs**: https://developers.cloudflare.com

---

## What's Actually Happening Now

### User Uploads File
```
File → /api/r2/upload → S3Client → R2 Bucket
       ↓
  Returns: https://pub-xxx.r2.dev/fileId/timestamp-filename
```

### File is Saved in Portfolio
```
R2 URL → portfolio-data.json → Git → Deployed
```

### User Visits Site (Any Browser)
```
Visits site → Loads portfolio-data.json → Gets R2 URLs
           ↓
       Displays files from R2 (public, shared, permanent)
```

### User Edits Portfolio
```
Edit → API call → Update portfolio-data.json → Commit to Git
    ↓
  Changes live for all users
```

---

## Performance Timeline

| Step | Time |
|------|------|
| File upload | 1-5s |
| Availability | <100ms (CDN cached) |
| Visibility to others | <1s |
| Cache update | <30s (with cache rules) |

---

## Next Actions

1. ✅ Read full guides (30 min)
2. ✅ Set up R2 bucket (10 min)
3. ✅ Add env vars to Pages (5 min)
4. ✅ Deploy code (5 min)
5. ✅ Test (10 min)
6. ✅ Celebrate! 🎉

**Total: ~1 hour to permanent, global file storage!**

---

## One-Line Summary

📁 → ☁️ (R2) → 🌍 (CDN) → 👥 (Everyone, forever)

Your files are now permanent and worldwide!
