# ✅ ReviewIntel MVP — Ready for Launch

## Current Status
- **Landing Page:** ✅ Built & tested locally
- **API Routes:** ✅ All functional (generate-sample, generate-report, webhook, dashboard)
- **Database:** ✅ Supabase connected (reports, subscriptions, analytics tables)
- **Payments:** ✅ Stripe configured
- **Email:** ✅ Brevo ready
- **Deployment:** ✅ GitHub Actions + Fly.io auto-deploy configured

---

## What You Need to Do (5 minutes)

### 1. Create Fly.io Account
https://fly.io/app/sign-up (sign up with GitHub)

### 2. Get API Token
- Go to https://fly.io/app/account/tokens
- Click "Create Deployment Token"
- Copy token

### 3. Add to GitHub Secrets
- Repo Settings → Secrets and variables → Actions
- New secret: `FLY_API_TOKEN` = (paste your token)
- Save

### 4. Test Deploy
```bash
cd ~/ReviewIntel
git log --oneline | head -3  # Verify latest commits
```

Then in GitHub → Actions tab, you should see:
- ✅ "Deploy to Fly.io" workflow (running or completed)

### 5. Check Live URL
Once workflow completes (green checkmark):
```
https://reviewintel.fly.dev
```

---

## Post-Deployment: Set Production Env Vars

After Fly.io deployment succeeds, set your credentials:

```bash
flyctl secrets set \
  STRIPE_SECRET_KEY="sk_live_..." \
  STRIPE_WEBHOOK_SECRET="whsec_..." \
  SUPABASE_URL="https://feesmokjbrhgltguokpi.supabase.co" \
  SUPABASE_ANON_KEY="sb_publishable_q_v1PDLqx1fPQhecCKEipw_S0eDm5cI" \
  APIFY_TOKEN="apify_api_..." \
  CLAUDE_API_KEY="sk_..." \
  GA_MEASUREMENT_ID="G_..." \
  NODE_ENV="production" \
  --app reviewintel
```

---

## Auto-Deploy How-It-Works

**From now on:**
```bash
git add .
git commit -m "your change"
git push origin main
```

→ GitHub Actions auto-triggers
→ Deploys to Fly.io (2-3 min)
→ reviewintel.fly.dev updates automatically

---

## Custom Domain (Optional)

Point review-intel.com → Fly.io:
1. Get Fly.io IP: `flyctl ips list --app reviewintel`
2. Add CNAME in Cloudflare DNS: review-intel.com → reviewintel.fly.dev

---

## Next Steps
1. ✅ Complete 5-minute setup above
2. ✅ Verify live at reviewintel.fly.dev
3. ✅ Set env vars via flyctl secrets
4. ✅ Test free sample endpoint
5. **Then:** OMT backlink blitz (12 platforms, ~135 min total)

---

## Repo Structure
```
ReviewIntel/
├── server.js                 # Express entry point
├── package.json             # Dependencies
├── fly.toml                 # Fly.io config
├── .github/workflows/deploy.yml  # Auto-deploy
├── landing-template.js      # Landing page HTML
├── api/
│   ├── generate-sample.js   # Free report endpoint
│   ├── generate-report.js   # Paid report endpoint
│   ├── checkout-webhook.js  # Stripe webhook
│   ├── dashboard.js         # User dashboard
│   └── utils/               # Helpers (PDF, email, DB, etc.)
└── FLY_SETUP.md            # Detailed setup guide
```

---

**Status: READY FOR PRODUCTION** 🚀
