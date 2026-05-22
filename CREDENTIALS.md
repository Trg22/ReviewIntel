# ReviewIntel Deployment Credentials Reference

## GitHub
- **Repo:** https://github.com/Trg22/ReviewIntel
- **Branch:** main
- **Settings:** Secrets and variables → Actions

---

## Fly.io (Create Account)
- **Sign up:** https://fly.io/app/sign-up
- **API Token location:** https://fly.io/app/account/tokens
- **Add to GitHub secret:** `FLY_API_TOKEN`

---

## Production Env Vars (Set After Deploy)

After Fly.io deployment succeeds, set these via:
```bash
flyctl secrets set KEY=VALUE --app reviewintel
```

| Key | Value | Source |
|-----|-------|--------|
| `STRIPE_SECRET_KEY` | [Your Stripe Secret Key] | Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | [Your Stripe Webhook Secret] | Stripe webhooks |
| `SUPABASE_URL` | https://feesmokjbrhgltguokpi.supabase.co | Set in .env.local |
| `SUPABASE_ANON_KEY` | [Set in .env.local] | Set in .env.local |
| `APIFY_TOKEN` | [Set in .env.local] | Set in .env.local |
| `CLAUDE_API_KEY` | [Your Claude API Key] | Claude dashboard |
| `GA_MEASUREMENT_ID` | [Your GA ID] | Google Analytics |
| `NODE_ENV` | production | Set to "production" |

**Note:** Sensitive values are stored in `.env.local` (git-ignored). Use those values when setting flyctl secrets.

---

## Domain
- **Domain:** review-intel.com (registered via Cloudflare)
- **DNS:** Cloudflare
- **Post-deploy:** Add CNAME record pointing to reviewintel.fly.dev

---

## Live URLs
- **After deploy:** https://reviewintel.fly.dev
- **With custom domain:** https://review-intel.com (after CNAME setup)

---

## Notes
- Fly.io auto-deploys on every `git push origin main`
- First deploy takes ~2-3 minutes
- Subsequent deploys faster
- Monitor at: https://fly.io/app/reviewintel
- View deployment logs: `flyctl logs --app reviewintel`
