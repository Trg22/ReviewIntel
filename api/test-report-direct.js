/**
 * TEST ENDPOINT for manual report generation
 * POST /api/test-report-direct
 * 
 * Body: { email, asin, tier }
 * 
 * This bypasses Stripe webhooks for local testing
 */

import { saveReport } from "./utils/database.js";
import { generatePdfReport } from "./utils/pdf-generator.js";
import { analyzeReviews } from "./utils/claude-analyzer.js";
import { scrapeAmazonReviews } from "./utils/apify-service.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, asin, tier } = req.body;

    if (!email || !asin || !tier) {
      return res.status(400).json({
        error: "Missing required fields: email, asin, tier"
      });
    }

    console.log(`[TEST-REPORT] 🚀 Generating test report for ${email}, ASIN: ${asin}, Tier: ${tier}`);

    // Step 1: Scrape reviews (will use mock if Apify token missing)
    console.log(`[TEST-REPORT] Step 1: Scraping reviews for ASIN ${asin}...`);
    const reviewsData = await scrapeAmazonReviews(asin, 200);
    console.log(`[TEST-REPORT] ✓ Got ${reviewsData.reviews.length} reviews, source: ${reviewsData.source}`);

    // Step 2: Analyze with Claude
    console.log(`[TEST-REPORT] Step 2: Analyzing reviews...`);
    const analysis = await analyzeReviews(reviewsData.reviews, true);

    // Step 3: Generate PDF
    console.log(`[TEST-REPORT] Step 3: Generating PDF...`);
    const pdfBuffer = await generatePdfReport(analysis, reviewsData.title || asin, asin);

    // Step 4: Save to database with YOUR ASIN
    console.log(`[TEST-REPORT] Step 4: Saving report with ASIN: ${asin}...`);
    const savedReport = await saveReport({
      userEmail: email,
      asin: asin,  // YOUR ACTUAL ASIN
      productName: reviewsData.title || asin,
      analysis,
      tier,
      stripeSessionId: `test-${Date.now()}`,
      pdfUrl: `https://reviewintels.com/api/reports/${Date.now()}`
    });

    console.log(`[TEST-REPORT] ✅ Report saved with ID: ${savedReport.id}, ASIN in DB: ${savedReport.product_asin}`);

    return res.status(200).json({
      success: true,
      reportId: savedReport.id,
      asin: savedReport.product_asin,
      email: savedReport.user_email,
      message: "Test report generated successfully",
      viewUrl: `/api/reports/${savedReport.id}`
    });

  } catch (error) {
    console.error("[TEST-REPORT] Error:", error.message);
    return res.status(500).json({
      error: "Failed to generate test report",
      details: error.message
    });
  }
}
