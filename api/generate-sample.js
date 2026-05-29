/**
 * Generate Sample Report - API Endpoint
 * ⚠️ REBUILT: Using PDFKit instead of pdf-lib for full Unicode support
 * Deployment timestamp: Wed May 22 2026 (Force rebuild)
 * 
 * POST /api/generate-sample
 * GET  /api/generate-sample?page=1&limit=10 (for paginated sample reviews)
 * 
 * POST: Accepts email capture and generates a free sample report PDF
 * Sends via Brevo email service
 * 
 * GET: Returns paginated sample reviews from Supabase
 * Query params:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 10, max: 100)
 *   - asin: Optional ASIN filter
 * 
 * This endpoint demonstrates the full report generation pipeline
 */

import { getMockApifyResponse, generateMockReviews } from "./utils/mock-data.js";
import { scrapeAmazonReviews } from "./utils/apify-service.js";
import { analyzeReviews } from "./utils/claude-analyzer.js";
import { generatePdfReport } from "./utils/pdf-generator.js";
import { sendEmail, getReportEmailTemplate } from "./utils/email-service.js";
import { saveReport, logAnalyticsEvent } from "./utils/database.js";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method === "GET") {
      return await handleGetSampleReviews(req, res);
    } else if (req.method === "POST") {
      return await handleGenerateSample(req, res);
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error in generate-sample endpoint:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}

/**
 * Handle GET request - return paginated sample reviews
 */
async function handleGetSampleReviews(req, res) {
  const page = Math.max(1, parseInt(req.query.page || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "10")));
  const offset = (page - 1) * limit;

  try {
    // Generate mock reviews for demonstration
    const allReviews = generateMockReviews(100); // Generate more reviews for pagination

    // Apply ASIN filter if provided
    const asin = req.query.asin;
    let filteredReviews = allReviews;
    if (asin) {
      filteredReviews = allReviews.filter((r) => r.asin === asin);
    }

    // Apply pagination
    const paginatedReviews = filteredReviews.slice(offset, offset + limit);

    // Calculate pagination metadata
    const totalCount = filteredReviews.length;
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return res.status(200).json({
      success: true,
      data: paginatedReviews,
      pagination: {
        page,
        limit,
        offset,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching sample reviews:", error);
    return res.status(500).json({
      error: "Failed to fetch sample reviews",
      details: error.message,
    });
  }
}

/**
 * Handle POST request - generate and send sample report
 */
async function handleGenerateSample(req, res) {
  const { email, name, asin } = req.body;

  if (!email || !name) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["email", "name"],
    });
  }

  // Use provided ASIN or generate a random one for sample
  const finalAsin = asin || `BSAMPLE${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    console.log(`[generate-sample] Generating sample report for ${email}`);

    // Log analytics event
    await logAnalyticsEvent({
      name: "sample_requested",
      userEmail: email,
      data: { name },
      ipAddress: req.headers["x-forwarded-for"] || "unknown",
      userAgent: req.headers["user-agent"],
    });

    // Generate real reviews from Apify
    console.log(`[generate-sample] Scraping real reviews for ASIN ${finalAsin}...`);
    const reviewsData = await scrapeAmazonReviews(finalAsin, 100);
    const reviews = reviewsData.reviews;

    // Analyze with Claude
    console.log(`[generate-sample] Analyzing ${reviews.length} reviews with Claude...`);
    const analysis = await analyzeReviews(reviews, false); // Use real Claude

    // Generate PDF
    const pdfBuffer = await generatePdfReport(
      analysis,
      reviewsData.title,
      finalAsin
    );

    // Save to database FIRST to get the report ID
    const savedReport = await saveReport({
      userEmail: email,
      asin: finalAsin,
      productName: reviewsData.title,
      analysis,
      pdfUrl: "https://reviewintels.com/reports/sample",
      isSampleReport: true,
    });

    // Get the report ID from the saved report
    const reportId = savedReport?.id || "sample";
    const reportUrl = `https://reviewintel.onrender.com/api/reports/${reportId}`;

    // Send email with PDF attachment and correct report URL
    const emailTemplate = getReportEmailTemplate(
      name,
      reviewsData.title,
      reportUrl
    );

    const emailResult = await sendEmail({
      to: email,
      subject: "Your Free ReviewIntel Sample Report",
      html: emailTemplate,
      attachment: pdfBuffer,
      attachmentName: "ReviewIntel-Sample-Report.pdf",
    });

    if (!emailResult.success) {
      console.warn(`[generate-sample] Email send failed: ${emailResult.error}`);
      return res.status(500).json({
        success: false,
        error: "Email service not available",
        details: emailResult.details || "Could not send sample report to your email",
        advice: "The sample PDF was generated but email sending is not configured. Please contact support or check your email settings."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sample report generated and sent to your email",
      email,
      messageId: emailResult?.messageId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating sample report:", error);
    return res.status(500).json({
      error: "Failed to generate sample report",
      details: error.message,
    });
  }
}
