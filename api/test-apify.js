/**
 * Direct Apify test endpoint
 * GET /api/test-apify?asin=B0C5X3RD3H
 */

import { scrapeAmazonReviews } from "./utils/apify-service.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { asin } = req.query;
  if (!asin) {
    return res.status(400).json({ error: "ASIN required" });
  }

  try {
    console.log(`[TEST-APIFY] Testing scrape for ASIN: ${asin}`);
    const data = await scrapeAmazonReviews(asin, 50);
    
    return res.status(200).json({
      success: true,
      asin: data.asin,
      reviewCount: data.reviewCount,
      source: data.source,
      sampleReviews: data.reviews.slice(0, 3),
      firstReviewTitle: data.reviews[0]?.title,
      averageRating: (data.reviews.reduce((sum, r) => sum + r.rating, 0) / data.reviews.length).toFixed(1)
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}
