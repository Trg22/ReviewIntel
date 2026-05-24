/**
 * Generate Full Report - API Endpoint
 * 
 * POST /api/generate-report
 * 
 * Main report generation pipeline:
 * 1. Check tier limits
 * 2. Scrape reviews via Apify (mock for MVP)
 * 3. Analyze with Claude AI
 * 4. Generate PDF report
 * 5. Email to user
 * 6. Save to Supabase
 * 
 */

import { getMockApifyResponse, generateMockReviews } from "./utils/mock-data.js";
import { analyzeReviews } from "./utils/claude-analyzer.js";
import { generatePdfReport } from "./utils/pdf-generator.js";
import { sendEmail, getReportEmailTemplate } from "./utils/email-service.js";
import { saveReport, logAnalyticsEvent, getUserReportCount } from "./utils/database.js";

// Tier configuration
const TIER_LIMITS = {
  'early_bird': 5,
  'pro': 20,
  'professional': 50
};

/**
 * Main handler for report generation
 */
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
    const {
      email,
      asin,
      tier,
      productName,
      paymentId,
      orderTimestamp
    } = req.body;

    // Validate required fields
    if (!email || !asin || !tier) {
      return res.status(400).json({
        error: "Missing required fields: email, asin, tier"
      });
    }

    // Validate tier
    if (!TIER_LIMITS[tier]) {
      return res.status(400).json({
        error: "Invalid tier. Must be: early_bird, pro, or professional"
      });
    }

    console.log(`Starting report generation for ASIN: ${asin}, Email: ${email}, Tier: ${tier}`);

    // Check user's report count against tier limit
    const userReportCount = await getUserReportCount(email);
    const tierLimit = TIER_LIMITS[tier];

    if (userReportCount >= tierLimit) {
      console.warn(`User ${email} has reached tier limit (${tierLimit} reports)`);
      return res.status(429).json({
        error: `Report limit reached for ${tier} tier (${tierLimit} reports)`,
        used: userReportCount,
        limit: tierLimit
      });
    }

    // Log analytics event
    await logAnalyticsEvent({
      name: "report_generation_started",
      userEmail: email,
      data: { asin, tier, reportsUsed: userReportCount, tierLimit },
      ipAddress: req.headers["x-forwarded-for"] || "unknown",
      userAgent: req.headers["user-agent"]
    });

    // Step 1: Scrape reviews (mock for MVP)
    console.log("Step 1: Scraping reviews...");
    const reviewsData = await scrapeReviews(asin);

    // Step 2: Analyze with Claude
    console.log("Step 2: Analyzing with Claude...");
    const analysis = await analyzeReviews(reviewsData.reviews, true);

    // Step 3: Generate PDF
    console.log("Step 3: Generating PDF...");
    const pdfBuffer = await generatePdfReport(
      analysis,
      asin,
      asin
    );

    // Step 4: Save to database FIRST (to get reportId)
    console.log("Step 4: Saving to database...");
    const savedReport = await saveReport({
      userEmail: email,
      asin,
      productName: asin,
      analysis,
      tier,
      pdfUrl: `https://reviewintels.com/api/reports/${asin}`,
      paymentId,
      orderTimestamp
    });

    // Step 5: Send email with correct report link
    console.log("Step 5: Sending email...");
    const reportUrl = `https://reviewintels.com/api/reports/${savedReport.id}`;
    
    const emailTemplate = getReportEmailTemplate(
      "Valued Customer",
      asin,
      reportUrl
    );

    const emailResult = await sendEmail({
      to: email,
      subject: `Your ReviewIntel Report for ${asin}`,
      html: emailTemplate,
      attachment: pdfBuffer,
      attachmentName: `ReviewIntel-Report-${asin}.pdf`
    });

    // Log success
    await logAnalyticsEvent({
      name: "report_generation_completed",
      userEmail: email,
      data: { asin, tier, success: true, reviewCount: reviewsData.reviews.length, reportId: savedReport.id },
      ipAddress: req.headers["x-forwarded-for"] || "unknown",
      userAgent: req.headers["user-agent"]
    });

    return res.status(200).json({
      success: true,
      message: "Report generated and sent successfully",
      report: {
        reportId: savedReport.id,
        email,
        asin,
        tier,
        reportsUsed: userReportCount + 1,
        tierLimit,
        analysisTimestamp: analysis.analysisTimestamp,
        reviewsAnalyzed: analysis.totalReviewsAnalyzed
      }
    });
  } catch (error) {
    console.error("Error in report generation:", error);

    // Log error event
    const email = req.body?.email;
    if (email) {
      await logAnalyticsEvent({
        name: "report_generation_failed",
        userEmail: email,
        data: { error: error.message, tier: req.body?.tier },
        ipAddress: req.headers["x-forwarded-for"] || "unknown",
        userAgent: req.headers["user-agent"]
      });
    }

    return res.status(500).json({
      error: "Failed to generate report",
      details: error.message
    });
  }
}

/**
 * Scrape reviews from Amazon via Apify
 * Uses mock data for MVP testing
 * 
 * @param {string} asin - Amazon product ASIN
 * @returns {Promise<Object>} Reviews data
 */
async function scrapeReviews(asin) {
  try {
    // For MVP, use mock data - no real Apify calls
    if (process.env.USE_MOCK_DATA !== "false") {
      console.log(`Using mock reviews for ASIN: ${asin}`);
      const mockData = getMockApifyResponse(asin);
      return {
        asin,
        reviews: mockData.reviews,
        totalReviews: mockData.reviewCount,
        dataSource: "mock"
      };
    }

    // Future: Real Apify integration
    // const apifyToken = process.env.APIFY_TOKEN;
    // const actorId = process.env.APIFY_AMAZON_SCRAPER_ACTOR_ID;
    // ...

    return getMockApifyResponse(asin);
  } catch (error) {
    console.error("Error scraping reviews:", error.message);
    // Fallback to mock data on error
    const mockData = getMockApifyResponse(asin);
    return {
      asin,
      reviews: mockData.reviews,
      totalReviews: mockData.reviewCount,
      dataSource: "mock"
    };
  }
}
