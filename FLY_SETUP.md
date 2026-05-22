# ReviewIntel → Fly.io Auto-Deploy Setup

## What This Does
Every time you push to GitHub (main branch), ReviewIntel automatically deploys to Fly.io.

---

## Step 1: Create Fly.io Account (1 min)

1. Go to **https://fly.io/app/sign-up**
2. Sign up with GitHub (easiest)
3. Verify email

---

## Step 2: Get Your Fly.io API Token (2 min)

1. Go to **https://fly.io/app/account/tokens**
2. Click **"Create Deployment Token"**
3. Name it: `github-actions-reviewintel`
4. **Copy the token** (you'll only see it once)

Example token looks like: `FlyV1 ...long string...`

---

## Step 3: Add Token to GitHub Secrets (2 min)

1. Go to your GitHub repo: **https://github.com/Trg22/ReviewIntel**
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `FLY_API_TOKEN`
5. Value: Paste your token from Step 2
6. Click **"Add secret"**

---

## Step 4: Verify Setup (1 min)

1. Return to ReviewIntel repo
2. Click **Actions** tab
3. You should see workflows available
4. Make a test commit: `git push origin main`
5. Watch deployment in Actions tab

Expected workflow status: ✅ **Deploy to Fly.io** (green checkmark)

---

## Step 5: Test Live Deployment (1 min)

Once workflow succeeds:

```bash
# Check your Fly.io app status
flyctl status --app reviewintel

# Get your live URL
flyctl info --app reviewintel
```

Or visit: **https://reviewintel.fly.dev**

---

## How to Deploy Changes

**After this setup, just push to GitHub:**

```bash
cd ~/ReviewIntel
git add .
git commit -m "feature: your change"
git push origin main
```

Fly.io auto-deploys in ~2 minutes. Done! 🚀

---

## Troubleshooting

### ❌ "Actions not running"
- Check GitHub token has repo access
- Check FLY_API_TOKEN is set in GitHub Secrets
- Commit and push again

### ❌ "Deployment failed"
- Check Actions tab for error logs
- Common: env vars not set in Fly.io

### ✅ "Deployment succeeded but site won't load"
- Wait 30 seconds for DNS propagation
- Check: `flyctl logs --app reviewintel`

---

## Environment Variables in Fly.io

Once deployed, you need to set production env vars:

```bash
flyctl secrets set \
  STRIPE_SECRET_KEY="your-key" \
  STRIPE_WEBHOOK_SECRET="your-secret" \
  SUPABASE_URL="your-url" \
  SUPABASE_ANON_KEY="your-key" \
  --app reviewintel
```

---

## Production Domain

Once live, you can:
- Use **reviewintel.fly.dev** (free Fly.io domain)
- Or point **review-intel.com** → Fly.io (via Cloudflare DNS CNAME)

---

Done! ReviewIntel now auto-deploys on every git push. 🎉
