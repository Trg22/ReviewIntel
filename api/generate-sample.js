/**
 * Generate Sample Report - API Endpoint
 * 
 * POST /api/generate-sample
 * 
 * Accepts email capture and generates a free sample report PDF
 * Sends via Brevo email service
 * 
 * This endpoint demonstrates the full report generation pipeline
 */

import { getMockApifyResponse, generateMockReviews } from "./utils/mock-data.js";
import { analyzeReviews } from "./utils/claude-analyzer.js";
import { generatePdfReport } from "./utils/pdf-generator.js";
import { sendEmail, getReportEmailTemplate } from "./utils/email-service.js";
import { saveReport, logAnalyticsEvent } from "./utils/database.js";

export default async function handler(req, res) {
  // Enable CORS
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
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: "Missing email or name" });
    }

    console.log(`Generating sample report for ${email}`);

    // Log analytics event
    await logAnalyticsEvent({
      name: "sample_requested",
      userEmail: email,
      data: { name },
      ipAddress: req.headers["x-forwarded-for"] || "unknown",
      userAgent: req.headers["user-agent"]
    });

    // Generate mock reviews
    const reviews = generateMockReviews(50);

    // Analyze with Claude (or mock)
    const analysis = await analyzeReviews(reviews, true); // Use mock for MVP

    // Generate PDF
    const pdfBuffer = await generatePdfReport(
      analysis,
      "Example Amazon Product",
      "B0SAMPLE123"
    );

    // Send email with PDF attachment
    const emailTemplate = getReportEmailTemplate(
      name,
      "Example Amazon Product",
      "https://review-intel.com/dashboard"
    );

    const emailResult = await sendEmail({
      to: email,
      subject: "Your Free ReviewIntel Sample Report 📊",
      html: emailTemplate,
      attachment: pdfBuffer,
      attachmentName: "ReviewIntel-Sample-Report.pdf"
    });

    // Save to database
    await saveReport({
      userEmail: email,
      asin: "B0SAMPLE123",
      productName: "Example Product",
      analysis,
      pdfUrl: "https://review-intel.com/reports/sample",
      isSampleReport: true
    });

    return res.status(200).json({
      success: true,
      message: "Sample report generated and sent to your email",
      email,
      messageId: emailResult.messageId
    });
  } catch (error) {
    console.error("Error generating sample report:", error);
    return res.status(500).json({
      error: "Failed to generate sample report",
      details: error.message
    });
  }
}
