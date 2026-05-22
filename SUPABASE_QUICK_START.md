# Supabase Storage Setup - Quick Start (5 minutes)

## ✅ What Changed

Your project **automatically switched from Cloudflare R2 to Supabase Storage**:
- ❌ No more R2 requirement
- ❌ No credit card needed
- ✅ Same functionality (file storage + public URLs)
- ✅ Free tier available
- ✅ No configuration hassles

---

## 🚀 Quick Start (5 minutes)

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Sign up (free, no credit card)
3. Create project named `portfolio-palette`
4. Wait 2-3 minutes

### Step 2: Get Credentials
In Supabase dashboard:
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL**
   - **Anon Public Key**

### Step 3: Create Storage Bucket
In Supabase:
1. Go to **Storage**
2. Click **"Create a new bucket"**
3. Name: `portfolio-files`
4. Toggle **"Public bucket"** ON
5. Create

### Step 4: Add Environment Variables

Create `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 5: Test Locally
```bash
npm run dev
```
- Visit http://localhost:5173
- Upload a test file
- Should work immediately!

### Step 6: Deploy
1. Set same environment variables in **Cloudflare Pages** settings
2. Push code: `git add -A && git commit -m "Supabase storage" && git push`
3. Wait 2-5 minutes for deployment
4. Test on deployed site

---

## 📋 Checklist

- [ ] Supabase account created
- [ ] Storage bucket created (`portfolio-files`, Public)
- [ ] `.env.local` file created with credentials
- [ ] `npm run dev` works without errors
- [ ] Test file uploads successfully
- [ ] Environment variables added to Cloudflare Pages
- [ ] Code deployed to Pages
- [ ] Production uploads work

---

## 🔑 Environment Variables Needed

**Local Development** (`.env.local`):
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_ANON_KEY=eyJhbGc...
```

**Cloudflare Pages** (Settings → Environment variables):
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
NODE_VERSION=20.x
```

---

## ✅ Endpoints

**Upload**: `POST /api/storage/upload`
**Delete**: `POST /api/storage/delete`

Both handle Supabase automatically!

---

## 🎯 You're All Set!

The code is ready. Just:
1. Set up Supabase (5 min)
2. Add credentials
3. Deploy

Your portfolio will have **free, permanent file storage**! 🚀

For detailed setup, see: [SUPABASE_STORAGE_SETUP.md](./SUPABASE_STORAGE_SETUP.md)
