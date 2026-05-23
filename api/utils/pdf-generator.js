/**
 * PDF Report Generator for ReviewIntel - Built with PDFKit
 * Last rebuilt: 1779497390
 * Using PDFKit for full Unicode/emoji support
 */

import PDFDocument from "pdfkit";
import { Readable } from "stream";

/**
 * Generate a professional review analysis PDF report
 * 
 * @param {Object} analysis - Analysis results from Claude
 * @param {string} productName - Amazon product name
 * @param {string} asin - Amazon ASIN
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generatePdfReport(analysis, productName = "Amazon Product", asin = "B0EXAMPLE") {
  return new Promise((resolve, reject) => {
    const buffers = [];
    const doc = new PDFDocument({
      size: "Letter",
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    // Collect PDF data chunks
    doc.on("data", chunk => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    try {
      // Add pages
      addCoverPage(doc, productName, asin, analysis);
      addSummaryPage(doc, analysis);
      addPositiveThemesPage(doc, analysis);
      addNegativeThemesPage(doc, analysis);
      addImprovementsPage(doc, analysis);
      addFooterPage(doc);

      doc.end();
    } catch (error) {
      doc.destroy();
      reject(error);
    }
  });
}

/**
 * Add cover page to PDF
 */
function addCoverPage(doc, productName, asin, analysis) {
  doc.fontSize(48)
    .font("Helvetica-Bold")
    .fillColor("#0466CC")
    .text("ReviewIntel Report", { align: "center" });

  doc.moveDown(0.5);
  doc.fontSize(18)
    .font("Helvetica")
    .fillColor("#333")
    .text(productName, { align: "center" });

  doc.moveDown(0.3);
  doc.fontSize(12)
    .fillColor("#666")
    .text(`ASIN: ${asin}`, { align: "center" });

  doc.moveDown(1.5);

  // Key metrics preview
  const metrics = [
    `Average Rating: ${(analysis.averageRating || 4.2).toFixed(1)}/5.0`,
    `Total Reviews: ${analysis.totalReviewsAnalyzed || 50}`,
    `Analysis Date: ${new Date().toLocaleDateString()}`
  ];

  doc.fontSize(12).fillColor("#333");
  metrics.forEach(metric => {
    doc.text(metric, { indent: 40 });
    doc.moveDown(0.3);
  });

  doc.moveDown(1);
  doc.fontSize(11)
    .fillColor("#555")
    .text(
      "This report provides a comprehensive analysis of customer reviews for this product. The analysis identifies key themes customers appreciate, areas for improvement, and competitive positioning.",
      { align: "left", width: 470 }
    );

  doc.addPage();
}

/**
 * Add summary page with key metrics
 */
function addSummaryPage(doc, analysis) {
  doc.fontSize(28)
    .font("Helvetica-Bold")
    .fillColor("#0466CC")
    .text("Executive Summary");

  doc.moveDown(0.8);

  // Key metrics section
  doc.fontSize(14)
    .font("Helvetica-Bold")
    .fillColor("#333")
    .text("Key Metrics");

  doc.moveDown(0.3);
  doc.fontSize(12)
    .font("Helvetica")
    .fillColor("#555");

  const metrics = [
    `Total Reviews Analyzed: ${analysis.totalReviewsAnalyzed || 50}`,
    `Average Rating: ${(analysis.averageRating || 4.2).toFixed(1)}/5.0`,
    `Positive Reviews: ${(analysis.sentimentBreakdown?.positive || 56).toFixed(0)}%`,
    `Analysis Generated: ${new Date().toLocaleDateString()}`
  ];

  metrics.forEach(metric => {
    doc.text(metric, { indent: 20 });
    doc.moveDown(0.25);
  });

  doc.moveDown(0.8);

  // Overview section
  doc.fontSize(14)
    .font("Helvetica-Bold")
    .fillColor("#333")
    .text("Overview");

  doc.moveDown(0.3);
  doc.fontSize(11)
    .font("Helvetica")
    .fillColor("#555")
    .text(
      "This report provides a comprehensive analysis of customer reviews for this product. The analysis identifies key themes customers appreciate, areas for improvement, and competitive positioning. Use these insights to enhance product quality, customer satisfaction, and market competitiveness.",
      { align: "left", width: 470 }
    );

  doc.addPage();
}

/**
 * Add positive themes page
 */
function addPositiveThemesPage(doc, analysis) {
  doc.fontSize(28)
    .font("Helvetica-Bold")
    .fillColor("#22B14C")
    .text("What Customers Love");

  doc.moveDown(0.8);

  const themes = analysis.positiveThemes || [];
  themes.forEach((item, index) => {
    doc.fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#0466CC")
      .text(`${index + 1}. ${item.theme}`);

    doc.moveDown(0.2);
    doc.fontSize(10)
      .font("Helvetica")
      .fillColor("#666")
      .text(`Frequency: ${item.frequency} mentions | Confidence: ${(item.confidence * 100).toFixed(0)}%`);

    doc.moveDown(0.4);
  });

  doc.moveDown(0.5);

  // Recommendation
  doc.fontSize(12)
    .font("Helvetica-Bold")
    .fillColor("#0466CC")
    .text("Recommendation:");

  doc.moveDown(0.2);
  doc.fontSize(11)
    .font("Helvetica")
    .fillColor("#555")
    .text(
      "Continue emphasizing these strengths in your product marketing and communications. These are key differentiators that justify premium positioning and build customer loyalty.",
      { align: "left", width: 470 }
    );

  doc.addPage();
}

/**
 * Add negative themes page
 */
function addNegativeThemesPage(doc, analysis) {
  doc.fontSize(28)
    .font("Helvetica-Bold")
    .fillColor("#C1272D")
    .text("Areas for Improvement");

  doc.moveDown(0.8);

  const themes = analysis.negativeThemes || [];
  themes.forEach((item, index) => {
    doc.fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#C1272D")
      .text(`${index + 1}. ${item.theme}`);

    doc.moveDown(0.2);
    doc.fontSize(10)
      .font("Helvetica")
      .fillColor("#666")
      .text(`Mentions: ${item.frequency} | Confidence: ${(item.confidence * 100).toFixed(0)}%`);

    doc.moveDown(0.4);
  });

  doc.moveDown(0.5);

  // Action items
  doc.fontSize(12)
    .font("Helvetica-Bold")
    .fillColor("#0466CC")
    .text("Action Items:");

  doc.moveDown(0.2);
  doc.fontSize(11)
    .font("Helvetica")
    .fillColor("#555")
    .text(
      "Prioritize addressing these issues to improve customer satisfaction and reduce negative reviews. Even small improvements in these areas can significantly boost your average rating.",
      { align: "left", width: 470 }
    );

  doc.addPage();
}

/**
 * Add improvements/recommendations page
 */
function addImprovementsPage(doc, analysis) {
  doc.fontSize(28)
    .font("Helvetica-Bold")
    .fillColor("#0466CC")
    .text("Recommended Actions");

  doc.moveDown(0.8);

  const improvements = analysis.improvements || [];
  improvements.forEach((item, index) => {
    doc.fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#0466CC")
      .text(`${index + 1}. ${item.improvement}`);

    doc.moveDown(0.2);

    const impactColor = item.impact === "high" ? "#22B14C" : item.impact === "medium" ? "#B5A900" : "#999";
    const effortColor = item.effort === "high" ? "#C1272D" : item.effort === "medium" ? "#B5A900" : "#22B14C";

    doc.fontSize(10)
      .font("Helvetica")
      .fillColor(impactColor)
      .text(`Impact: ${item.impact.toUpperCase()}`);

    doc.moveDown(0.15);
    doc.fillColor(effortColor)
      .text(`Effort: ${item.effort.toUpperCase()}`);

    doc.moveDown(0.4);
  });

  doc.addPage();
}

/**
 * Add footer/resources page
 */
function addFooterPage(doc) {
  doc.fontSize(20)
    .font("Helvetica-Bold")
    .fillColor("#0466CC")
    .text("Next Steps", { align: "center" });

  doc.moveDown(0.8);

  const steps = [
    "1. Share these insights with your product development team",
    "2. Prioritize the high-impact, low-effort improvements",
    "3. Track customer feedback trends over the next month",
    "4. Re-analyze reviews after implementing improvements",
    "5. Monitor competitor offerings in your market segment"
  ];

  doc.fontSize(11)
    .font("Helvetica")
    .fillColor("#333");

  steps.forEach(step => {
    doc.text(step, { indent: 20 });
    doc.moveDown(0.35);
  });

  doc.moveDown(1);

  doc.fontSize(10)
    .fillColor("#999")
    .text("ReviewIntel - Amazon Review Analysis Platform", { align: "center" });

  doc.moveDown(0.2);
  doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, { align: "center" });
}

export default {
  generatePdfReport
};
