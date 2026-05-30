# ReviewIntels - Amazon Review Analysis Platform

Production-ready API for analyzing Amazon customer reviews with AI.

## Quick Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Trg22/ReviewIntel)

## Local Development

\`\`\`bash
npm install
npm start
\`\`\`

Server runs on `http://localhost:3000`

## API Endpoints

- `GET  /api/health` - Health check
- `GET  /api/status` - Service status
- `GET  /api/dashboard?email=<email>` - User dashboard
- `POST /api/generate-sample` - Generate sample report
- `POST /api/generate-report` - Generate full paid report
- `GET  /api/reviews` - Fetch reviews
- `POST /api/checkout` - Checkout

## Environment Variables

\`\`\`
SUPABASE_URL=https://feesmokjbrhgltguokpi.supabase.co
SUPABASE_ANON_KEY=sb_publishable_q_v1PDLqx1fPQhecCKEipw_S0eDm5cI
SUPABASE_SERVICE_ROLE_KEY=<from dashboard>
APIFY_TOKEN=<from Apify>
BREVO_API_KEY=<from Brevo>
CLAUDE_API_KEY=<from Anthropic>
PORT=3000
NODE_ENV=production
\`\`\`

## Docker

\`\`\`bash
docker build -t reviewintels .
docker run -p 3000:3000 reviewintels
\`\`\`

## Deployment Platforms

- Railway: `railway deploy`
- Render: Use deploy button above
- Vercel: `vercel deploy --prod`
- Docker: See docker section

---

**Status:** ✅ Production Ready | 🟢 All Tests Passing | 📦 Ready to Ship
