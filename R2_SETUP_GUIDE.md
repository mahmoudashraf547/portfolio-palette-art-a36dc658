# Cloudflare R2 Setup Checklist

Follow this step-by-step guide to enable cloud file storage for your portfolio.

## ✅ Prerequisites
- [ ] Cloudflare account (free tier eligible)
- [ ] Access to https://dash.cloudflare.com
- [ ] Local environment with Git

---

## 🪣 Step 1: Create R2 Bucket

1. Go to **Cloudflare Dashboard** → **R2**
2. Click **"Create Bucket"**
3. **Bucket Name:** `portfolio-files`
4. **Region:** Select your closest region (or Auto)
5. **CORS Settings:** Leave default (or adjust if needed)
6. Click **"Create Bucket"**

**Note:** Save the bucket name and your Account ID (visible in URLs like `https://pub-{ACCOUNT_ID}.r2.dev/...`)

---

## 🔑 Step 2: Generate R2 API Token

1. Go to **Cloudflare Dashboard** → **Account Settings**
2. Navigate to **API Tokens**
3. Click **"Create Token"**
4. Fill in:
   - **Token name:** `Portfolio R2 Access`
   - **Permissions:** Object Storage → All buckets → Edit
5. Click **"Create Token"**

**CRITICAL:** Copy these values immediately (they appear only once):
- **Access Key ID** → Set as `R2_API_TOKEN_ID`
- **Secret Access Key** → Set as `R2_API_TOKEN_SECRET`

---

## 🛠️ Step 3: Configure Local Environment

Create `.env.local` in the project root:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Edit `.env.local` and add your values:

```env
R2_ACCOUNT_ID=abc123xyz (found in R2 URLs)
R2_API_TOKEN_ID=your_access_key_id
R2_API_TOKEN_SECRET=your_secret_key
R2_BUCKET_NAME=portfolio-files
```

---

## 📦 Step 4: Install Dependencies

```bash
npm install
# or
bun install
```

This adds `@aws-sdk/client-s3` for R2 uploads.

---

## 🧪 Step 5: Test Locally

1. Start the dev server:
```bash
npm run dev
# or
bun dev
```

2. Go to the Admin Panel (login required)
3. Upload a test PDF or image
4. Verify upload succeeds and displays a progress bar
5. Confirm file persists after browser refresh

---

## 🚀 Step 6: Deploy to Cloudflare

1. Add Cloudflare secrets:
```bash
wrangler secret put R2_API_TOKEN_ID
# Paste: your_access_key_id

wrangler secret put R2_API_TOKEN_SECRET
# Paste: your_secret_key

wrangler secret put R2_ACCOUNT_ID
# Paste: your_account_id
```

2. Update `wrangler.jsonc` with your values:
```jsonc
"vars": {
  "R2_ACCOUNT_ID": "abc123xyz",
  "R2_BUCKET_NAME": "portfolio-files"
}
```

3. Commit and push:
```bash
git add .
git commit -m "feat: configure Cloudflare R2 cloud storage"
git push origin main
```

4. Monitor deployment in **Cloudflare Dashboard** → **Workers & Pages**

---

## 📊 Verify R2 Upload

After deployment, verify files are stored in R2:

1. Go to **Cloudflare Dashboard** → **R2** → **portfolio-files**
2. You should see uploaded files with timestamps
3. Each file has a public URL like:
   ```
   https://pub-abc123.r2.dev/portfolio-files/{fileId}/{fileName}
   ```

---

## 💾 File URLs Are Permanent

Once uploaded to R2:
- ✅ Files are globally accessible via CDN
- ✅ URLs persist across browser cache clears
- ✅ Admin can delete files, but URLs remain unique per file ID
- ✅ All files cached at Cloudflare edge for instant delivery

---

## 🔒 Security Notes

- **API tokens** are stored as Cloudflare Secrets (never in code)
- **Bucket is private** by default; files served via CDN
- **CORS** can be configured if needed for third-party access
- **Access Control:** Only your Workers can write to R2

---

## 💰 Pricing (As of 2026)

| Item | Cost |
|------|------|
| Storage (first 10 GB/month) | Free |
| Storage (over 10 GB) | $0.015/GB |
| Requests | $4.50/million |
| Egress (via Cloudflare) | Free |

**Typical portfolio cost:** $0–$1/month

---

## ❓ Troubleshooting

### "Upload fails with 500 error"
- Check `.env.local` has all four variables
- Verify API token has Object Storage permissions
- Check bucket name matches in `wrangler.jsonc`

### "Files don't persist after refresh"
- Ensure R2 credentials are correct
- Check Cloudflare Dashboard → R2 bucket for files
- Test with `curl` to confirm API works

### "Public URL 404s"
- Confirm bucket is set to public (or custom domain)
- Check URL format: `https://pub-{ACCOUNT_ID}.r2.dev/portfolio-files/...`
- Verify file ID and bucket name in URL

---

## 📚 Next Steps

1. ✅ Complete steps 1–3 above
2. ✅ Test locally (step 5)
3. ✅ Deploy (step 6)
4. ✅ Verify in R2 dashboard (step 7)
5. Share portfolio with confidence—files won't disappear!

**Questions?** Check the [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/api/s3/).
