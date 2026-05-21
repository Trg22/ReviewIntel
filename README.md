# ReviewIntel MVP - Complete Setup & Deployment Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Local Development](#local-development)
5. [Deployment to Vercel](#deployment-to-vercel)
6. [Setting Up Supabase](#setting-up-supabase)
7. [Configuring Environment Variables](#configuring-environment-variables)
8. [Testing the Application](#testing-the-application)
9. [Troubleshooting](#troubleshooting)
10. [Next Steps](#next-steps)

---

## Project Overview

**ReviewIntel MVP** is a production-ready Amazon review analysis platform that:
- Analyzes customer reviews using AI (Claude 3.5 Sonnet)
- Generates professional PDF reports with actionable insights
- Integrates with Stripe for payments
- Sends reports via email using Brevo
- Stores user data in Supabase
- Deploys to Vercel for instant scalability

### Key Features
- ⚡ 60-90 second report generation
- 🤖 AI-powered sentiment analysis and theme extraction
- 📊 Professional PDF reports
- 💳 Stripe payment integration
- 📧 Brevo email delivery
- 💾 Supabase backend storage
- 📈 Google Analytics tracking
- 🎯 Mock data for testing (no real API calls yet)

---

## Quick Start

### Prerequisites
- Node.js 18+ installed ([download](https://nodejs.org/))
- Git installed ([download](https://git-scm.com/))
- npm or yarn package manager
- Vercel account ([create free account](https://vercel.com/signup))
- Supabase account ([create free account](https://supabase.com/))

### 5-Minute Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/review-intel.git
   cd ReviewIntel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```

4. **Update `.env.local` with your credentials** (see section below)

5. **Test locally**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 in your browser

6. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

---

## Architecture

### System Overview
```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Landing Page)              │
│                    (HTML/CSS/JS - Static)               │
└──────────────────────┬──────────────────────────────────┘
                       │ AJAX/Fetch Requests
┌──────────────────────▼──────────────────────────────────┐
│              Vercel Functions (Node.js Backend)         │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │ /api/generate-   │  │ /api/checkout-   │            │
│  │ sample           │  │ webhook          │            │
│  └──────────────────┘  └──────────────────┘            │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │ /api/generate-   │  │ /api/dashboard   │            │
│  │ report           │  │                  │            │
│  └──────────────────┘  └──────────────────┘            │
└──────────┬──────────────┬───────────┬───────────────────┘
           │              │           │
           ▼              ▼           ▼
      ┌─────────────┐ ┌────────────┐ ┌──────────────┐
      │   Claude    │ │  Supabase  │ │    Brevo     │
      │   API       │ │  Database  │ │   Email API  │
      │ (Analysis)  │ │            │ │              │
      └─────────────┘ └────────────┘ └──────────────┘

Mock Layer (MVP):
- Apify: Mock reviews data (hardcoded JSON)
- Claude: Mock analysis responses
- Brevo: Mock email sending (real API available)
```

### File Structure
```
ReviewIntel/
├── api/
│   ├── generate-sample.js          # Free sample report endpoint
│   ├── generate-report.js          # Full report generation endpoint
│   ├── checkout-webhook.js         # Stripe webhook handler
│   ├── dashboard.js                # User dashboard data endpoint
│   └── utils/
│       ├── mock-data.js            # Mock Amazon reviews
│       ├── claude-analyzer.js      # AI analysis engine
│       ├── pdf-generator.js        # PDF report creation
│       ├── email-service.js        # Email delivery
│       └── database.js             # Supabase operations
├── public/
│   └── index.html                  # Landing page
├── tests/
│   └── mock-test.js                # Integration tests
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore rules
├── vercel.json                     # Vercel configuration
├── package.json                    # Dependencies
└── README.md                       # This file
```

---

## Local Development

### 1. Install Dependencies
```bash
npm install
```

This installs all required packages:
- `stripe` - Payment processing
- `axios` - HTTP client
- `pdf-lib` - PDF generation
- `@anthropic-ai/sdk` - Claude AI API
- `@supabase/supabase-js` - Database client
- `brevo` - Email API
- `dotenv` - Environment variable loading

### 2. Set Up Environment Variables

Copy the template and edit with your credentials:
```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your API keys (detailed instructions below).

### 3. Run Local Development Server

```bash
npm run dev
```

This starts a local Vercel development server at:
- **Frontend**: http://localhost:3000
- **API Functions**: http://localhost:3000/api/*

### 4. Test the Landing Page

1. Open http://localhost:3000 in your browser
2. Click "Get Free Sample"
3. Enter your email and name
4. Submit the form

The frontend will call `/api/generate-sample` which will:
- Generate mock reviews
- Analyze with Claude (or mock)
- Generate a PDF
- Send via Brevo (or mock)
- Save to Supabase (or mock)

**Note**: All external API calls will use mock data/responses if credentials aren't configured.

---

## Setting Up Supabase

### 1. Create a Supabase Project

1. Go to https://supabase.com/ and sign up/login
2. Click "New Project"
3. Select your organization (or create one)
4. Fill in:
   - **Project Name**: `review-intel`
   - **Database Password**: Save this securely!
   - **Region**: Choose closest to your users
5. Click "Create new project" (takes ~5 minutes)

### 2. Get Your Credentials

After project creation:
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **Anon Public Key** → `SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 3. Create Database Tables

Go to **SQL Editor** and run these queries:

**1. Reports Table**
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR(255) NOT NULL,
  product_asin VARCHAR(20) NOT NULL,
  product_name TEXT NOT NULL,
  analysis_results JSONB,
  pdf_url TEXT,
  payment_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_email ON reports(user_email);
CREATE INDEX idx_reports_asin ON reports(product_asin);
```

**2. Subscriptions Table**
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  plan_type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subs_email ON subscriptions(user_email);
```

**3. Analytics Table**
```sql
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name VARCHAR(100) NOT NULL,
  event_data JSONB,
  user_email VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_event ON analytics(event_name);
CREATE INDEX idx_analytics_email ON analytics(user_email);
```

### 4. Enable RLS (Row Level Security)

For each table, enable RLS to ensure users can only access their own data:

```sql
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
```

---

## Configuring Environment Variables

### Get Your API Keys

#### 1. **Stripe** (Payment Processing)
- Go to https://dashboard.stripe.com
- Login or create account
- Go to **Developers** → **API Keys**
- Copy:
  - **Secret Key** → `STRIPE_SECRET_KEY`
  - **Publishable Key** → `STRIPE_PUBLISHABLE_KEY`
  - For webhook: **Webhooks** → Create webhook → Copy secret → `STRIPE_WEBHOOK_SECRET`

#### 2. **Brevo** (Email Service)
- Go to https://app.brevo.com/ and sign up/login
- Go to **Settings** → **API & SMTP**
- Copy:
  - **API Key** → `BREVO_API_KEY`
  - Set sender email: `BREVO_SENDER_EMAIL`
  - Set sender name: `BREVO_SENDER_NAME`

#### 3. **Claude AI** (Anthropic)
- Go to https://console.anthropic.com/
- Sign up or login with Google
- Create an API key in **Account** → **API Keys**
- Copy the key → `CLAUDE_API_KEY`

#### 4. **Apify** (Web Scraper)
- Go to https://console.apify.com/
- Sign up with email
- Go to **Settings** → **API Tokens**
- Copy token → `APIFY_TOKEN`

#### 5. **Google Analytics**
- Go to https://analytics.google.com/
- Create new property for your domain
- Get **Measurement ID** (G-XXXXXXXXXX) → `GA_MEASUREMENT_ID`

### Create `.env.local` File

```bash
# Create file
nano .env.local

# Paste this and fill in your credentials:
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_test_YOUR_SECRET_HERE

BREVO_API_KEY=xkeysib-YOUR_KEY_HERE
BREVO_SENDER_EMAIL=no-reply@reviewintel.com
BREVO_SENDER_NAME=ReviewIntel

CLAUDE_API_KEY=sk-ant-YOUR_KEY_HERE

APIFY_TOKEN=apify_api_YOUR_TOKEN_HERE
APIFY_AMAZON_SCRAPER_ACTOR_ID=axesso_data~amazon-reviews-scraper

SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE

GA_MEASUREMENT_ID=G-YM50G5CSSC

NODE_ENV=development
USE_MOCK_DATA=true
```

### Save the file
- Press `Ctrl+X` then `Y` then `Enter` (in nano)

---

## Deployment to Vercel

### 1. Push Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial ReviewIntel MVP deployment"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/review-intel.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
npm install -g vercel
vercel
```

Follow the prompts:
- Link to existing GitHub project
- Select your GitHub repo
- Confirm project settings
- Deploy

**Option B: Using Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure environment variables (see below)
5. Click "Deploy"

### 3. Add Environment Variables to Vercel

1. Go to your project in Vercel dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable from your `.env.local` file:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `BREVO_API_KEY`
   - `CLAUDE_API_KEY`
   - `APIFY_TOKEN`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `GA_MEASUREMENT_ID`
   - `USE_MOCK_DATA=true`

4. Click **Save**
5. Redeploy for changes to take effect

### 4. Configure Stripe Webhook (Important!)

Stripe needs to send webhook events to your Vercel URL:

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Paste your Vercel URL: `https://your-project.vercel.app/api/checkout-webhook`
4. Select events: `payment_intent.succeeded`, `customer.subscription.created`
5. Copy **Signing Secret** → Add as `STRIPE_WEBHOOK_SECRET` to Vercel

### 5. Get Your Live URL

After deployment:
- Your site: `https://your-project.vercel.app`
- API endpoints: `https://your-project.vercel.app/api/*`

---

## Testing the Application

### 1. Test Landing Page
```
https://your-project.vercel.app
```
- Should display beautiful landing page
- Try clicking CTAs and FAQ items
- Counter should update every 3 seconds

### 2. Test Free Sample Report
```bash
curl -X POST https://your-project.vercel.app/api/generate-sample \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

**Expected response**:
```json
{
  "success": true,
  "message": "Sample report generated and sent to your email",
  "email": "test@example.com",
  "messageId": "..."
}
```

### 3. Test Full Report Generation
```bash
curl -X POST https://your-project.vercel.app/api/generate-report \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "name":"Test User",
    "asin":"B0EXAMPLE123",
    "productName":"Test Product",
    "paymentId":"pi_1234567890"
  }'
```

### 4. Test Dashboard API
```bash
curl "https://your-project.vercel.app/api/dashboard?email=test@example.com"
```

**Expected response**:
```json
{
  "success": true,
  "email": "test@example.com",
  "reports": [...],
  "subscription": null,
  "reportCount": 0,
  "hasActiveSubscription": false
}
```

### 5. Manual Testing Checklist
- [ ] Landing page loads and is responsive
- [ ] Email capture form works
- [ ] Sample report email received
- [ ] PDF attachment opens correctly
- [ ] Dashboard shows reports
- [ ] Google Analytics events are tracked
- [ ] Counter updates automatically

---

## Troubleshooting

### Common Issues

#### 1. "Module not found" errors
**Solution**: Reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

#### 2. Environment variables not loading
**Solution**: 
- Ensure `.env.local` file exists in project root
- Restart dev server after changing env vars
- For Vercel: redeploy after adding env vars

#### 3. Brevo email not sending
**Solution**:
- Check API key is correct
- Verify sender email is registered in Brevo
- Check spam/junk folders
- Test with mock mode first: `USE_MOCK_DATA=true`

#### 4. Supabase connection errors
**Solution**:
- Verify URL and key are correct
- Check database tables exist
- Enable RLS if needed
- Verify network access (Supabase allows all IPs by default)

#### 5. Claude API errors
**Solution**:
- Verify API key is valid
- Check you have API credits
- Use mock mode for testing: `USE_MOCK_DATA=true`

#### 6. PDF generation fails
**Solution**:
- Verify pdf-lib is installed: `npm install pdf-lib`
- Check Node version is 18+: `node --version`
- Try generating sample report first

### Enable Debug Logging

Add to your code:
```javascript
console.log('Debug info:', data);
// Will appear in:
// - Terminal (local dev)
// - Vercel Logs (production)
```

View Vercel logs:
```bash
vercel logs --tail
```

---

## Next Steps

### Phase 1: MVP Validation (Current)
✅ Static landing page with CTAs
✅ Mock report generation pipeline
✅ Email integration (Brevo)
✅ Database setup (Supabase)
✅ Stripe payment hooks
✅ Google Analytics tracking
✅ Deployed to Vercel

### Phase 2: Real Data Integration (Days 6-7)
- [ ] Connect to real Apify API
- [ ] Replace mock reviews with actual Amazon data
- [ ] Test with real products (limit to 5-10 to save credits)
- [ ] Optimize performance for real data

### Phase 3: Production Launch
- [ ] Connect custom domain (review-intel.com)
- [ ] Set up real Stripe account (not test mode)
- [ ] Configure email from your domain
- [ ] Add analytics dashboard
- [ ] User authentication system
- [ ] Payment tracking and reporting

### Phase 4: Growth
- [ ] Add more product categories
- [ ] Implement user accounts with login
- [ ] Add report scheduling
- [ ] Create API for integrations
- [ ] Build marketplace integrations

---

## Key URLs & Resources

### Deployed Application
- **Landing Page**: `https://your-project.vercel.app`
- **API Dashboard**: `https://your-project.vercel.app/api/dashboard`

### Admin Dashboards
- **Vercel**: https://vercel.com/dashboard
- **Supabase**: https://app.supabase.com/
- **Stripe**: https://dashboard.stripe.com
- **Brevo**: https://app.brevo.com/
- **Google Analytics**: https://analytics.google.com/

### Documentation
- **Node.js**: https://nodejs.org/docs/
- **Vercel Functions**: https://vercel.com/docs/functions/serverless-functions
- **Claude API**: https://docs.anthropic.com/
- **Supabase**: https://supabase.com/docs/
- **Stripe**: https://stripe.com/docs/

---

## Support & Questions

If you encounter issues:

1. **Check the logs**:
   ```bash
   vercel logs --tail
   ```

2. **Review environment variables**:
   ```bash
   vercel env pull .env.local
   ```

3. **Test API endpoints**:
   ```bash
   curl -X GET your-vercel-url/api/dashboard?email=test@test.com
   ```

4. **Check database**:
   - Go to Supabase dashboard
   - Click "SQL Editor"
   - Query tables to verify data is saving

---

## Deployment Checklist

Before going live, verify:

- [ ] All environment variables set in Vercel
- [ ] Supabase tables created and RLS enabled
- [ ] Stripe webhook configured
- [ ] Email template tested
- [ ] PDF generation working
- [ ] Google Analytics ID correct
- [ ] Landing page is responsive
- [ ] All links are working
- [ ] Error handling is in place
- [ ] Documentation updated

---

**Last Updated**: May 20, 2024
**Version**: 1.0.0-MVP
**Status**: Ready for Testing

For the next steps on Days 6-7 (real Apify integration), see the `PHASE2_INTEGRATION.md` file.
