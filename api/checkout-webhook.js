/**
 * Stripe Webhook Handler
 * 
 * POST /api/checkout-webhook
 * 
 * Handles Stripe events:
 * - checkout.session.completed: Trigger report generation
 * - payment_intent.succeeded: Confirm payment
 */

import Stripe from "stripe";
import { saveReport, logAnalyticsEvent } from "./utils/database.js";
import { generatePdfReport } from "./utils/pdf-generator.js";
import { sendEmail, getReportEmailTemplate } from "./utils/email-service.js";
import { analyzeReviews } from "./utils/claude-analyzer.js";
import { getMockApifyResponse } from "./utils/mock-data.js";

const TIER_LIMITS = {
  'early_bird': 5,
  'pro': 20,
  'professional': 50
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sig = req.headers["stripe-signature"];
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    console.warn("Stripe credentials not configured for webhook");
    // Still return 200 to avoid Stripe retries, but log the issue
    return res.status(200).json({ received: true, warning: "webhook secret not configured" });
  }

  let event;
  try {
    const stripe = new Stripe(stripeKey);
    event = stripe.webhooks.constructEvent(
      req.rawBody || req.body,
      sig,
      webhookSecret
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).json({ error: "Invalid signature" });
  }

  try {
    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log(`[WEBHOOK] Payment completed: ${session.id}`);

      const tier = session.metadata?.tier;
      const email = session.customer_email;
      const asin = session.metadata?.asin; // Will be stored by frontend

      if (!tier || !email || !asin) {
        console.warn("Missing metadata in session:", session.metadata);
        return res.status(400).json({ error: "Missing required metadata" });
      }

      // Log payment event
      await logAnalyticsEvent({
        name: "payment_completed",
        userEmail: email,
        data: {
          tier,
          asin,
          sessionId: session.id,
          amount: session.amount_total / 100,
          currency: session.currency
        },
        ipAddress: req.headers["x-forwarded-for"] || "unknown",
        userAgent: req.headers["user-agent"]
      });

      // Generate report asynchronously (don't wait)
      generateReportAsync(email, asin, tier, session.id).catch(error => {
        console.error("Error generating report after payment:", error);
      });

      return res.status(200).json({ received: true });
    }

    // Handle other events
    console.log(`[WEBHOOK] Received event type: ${event.type}`);
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ error: "Internal error" });
  }
}

/**
 * Generate report after successful payment
 * Runs asynchronously to keep webhook response fast
 */
async function generateReportAsync(email, asin, tier, stripeSessionId) {
  try {
    console.log(`[REPORT] 🚀 Generating report for ${email}, ASIN: ${asin}, Tier: ${tier}, Session: ${stripeSessionId}`);

    // Step 1: Scrape reviews
    console.log(`[REPORT] Step 1: Scraping reviews for ASIN ${asin}...`);
    const reviewsData = getMockApifyResponse(asin);
    console.log(`[REPORT] ✓ Got ${reviewsData.reviews.length} mock reviews for ASIN: ${reviewsData.asin}`);

    // Step 2: Analyze with Claude
    console.log(`[REPORT] Step 2: Analyzing with Claude...`);
    const analysis = await analyzeReviews(reviewsData.reviews, true);

    // Step 3: Generate PDF
    console.log(`[REPORT] Step 3: Generating PDF...`);
    const pdfBuffer = await generatePdfReport(analysis, asin, asin);

    // Step 4: Save to database
    console.log(`[REPORT] Step 4: Saving report to database with ASIN: ${asin}...`);
    const savedReport = await saveReport({
      userEmail: email,
      asin,
      productName: asin,
      analysis,
      tier,
      stripeSessionId,
      pdfUrl: `https://reviewintels.com/api/reports/${asin}`
    });
    console.log(`[REPORT] ✓ Saved report ID: ${savedReport.id}, ASIN in DB: ${savedReport.product_asin || 'NOT SET'}`);

    // Step 5: Send email
    console.log(`[REPORT] Step 5: Sending email to ${email}...`);
    const reportUrl = `https://reviewintels.com/api/reports/${savedReport.id}`;
    const emailTemplate = getReportEmailTemplate(
      "Valued Customer",
      asin,
      reportUrl
    );

    await sendEmail({
      to: email,
      subject: `Your ReviewIntel Report for ${asin}`,
      html: emailTemplate,
      attachment: pdfBuffer,
      attachmentName: `ReviewIntel-Report-${asin}.pdf`
    });

    console.log(`[REPORT] ✅ Report generated and sent to ${email}`);

    // Log success
    await logAnalyticsEvent({
      name: "report_generated_from_webhook",
      userEmail: email,
      data: { asin, tier, reportId: savedReport.id }
    });

  } catch (error) {
    console.error(`[REPORT] ❌ Failed to generate report:`, error);
    await logAnalyticsEvent({
      name: "report_generation_failed_webhook",
      userEmail: email,
      data: { asin, tier, error: error.message }
    });
  }
}
