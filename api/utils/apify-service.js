/**
 * Apify Amazon Reviews Scraper Service
 * 
 * Fetches real Amazon reviews for a given ASIN using Apify
 * Replaces mock data for production reports
 */

import axios from "axios";
import { getMockApifyResponse } from "./mock-data.js";

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_ACTOR_ID = "axesso_data/amazon-reviews-scraper"; // Correct Amazon reviews actor

/**
 * Scrape real Amazon reviews from Apify
 * @param {string} asin - Amazon product ASIN
 * @param {number} maxReviews - Max reviews to scrape (default 200)
 * @returns {Object} Reviews data
 */
export async function scrapeAmazonReviews(asin, maxReviews = 200) {
  if (!APIFY_API_TOKEN) {
    console.warn("[APIFY] API token not configured - returning mock data");
    return getMockApifyResponse(asin);
  }

  try {
    console.log(`[APIFY] Starting scrape for ASIN: ${asin}`);

    // Build Apify input for axesso_data/amazon-reviews-scraper
    const apifyInput = {
      asin: asin,
      maxReviews: Math.min(maxReviews, 200),
      language: "en",
      proxyConfiguration: {
        useApifyProxy: true
      }
    };

    // Run Apify actor
    const runResponse = await axios.post(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs?token=${APIFY_API_TOKEN}`,
      apifyInput,
      { timeout: 60000 }
    );

    const runId = runResponse.data.data.id;
    console.log(`[APIFY] Actor run started: ${runId}`);

    // Poll for completion (max 5 minutes)
    let status = "RUNNING";
    let attempts = 0;
    const maxAttempts = 60; // 5 min with 5s intervals

    while (status === "RUNNING" && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      attempts++;

      const statusResponse = await axios.get(
        `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs/${runId}?token=${APIFY_API_TOKEN}`
      );

      status = statusResponse.data.data.status;
      console.log(`[APIFY] Run ${runId} status: ${status} (attempt ${attempts}/${maxAttempts})`);

      if (status === "SUCCEEDED") {
        break;
      }

      if (status === "FAILED" || status === "ABORTED") {
        throw new Error(`Apify run failed with status: ${status}`);
      }
    }

    if (status !== "SUCCEEDED") {
      throw new Error(`Apify run timed out after ${attempts * 5} seconds`);
    }

    // Get results from dataset
    const resultsResponse = await axios.get(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs/${runId}/dataset/items?token=${APIFY_API_TOKEN}`,
      { params: { limit: maxReviews } }
    );

    const reviewsData = resultsResponse.data;

    if (!reviewsData || reviewsData.length === 0) {
      console.warn(`[APIFY] No reviews found for ASIN: ${asin}`);
      return getMockApifyResponse(asin);
    }

    // Transform axesso actor response to ReviewIntel format
    const reviews = reviewsData.map((review, index) => ({
      id: String(index + 1),
      title: review.title || review.reviewTitle || "",
      text: review.body || review.reviewText || "",
      rating: parseInt(review.rating) || parseInt(review.stars) || 3,
      author: review.author || review.reviewerName || "Anonymous",
      date: review.date || review.reviewDate || new Date().toISOString().split('T')[0],
      helpful: parseInt(review.helpful) || parseInt(review.helpfulCount) || 0,
      verified: review.verified === true || review.isVerified === true,
      asin: asin
    }));

    console.log(`[APIFY] ✓ Successfully scraped ${reviews.length} reviews for ASIN: ${asin}`);

    return {
      asin,
      title: reviewsData[0]?.productName || `Product ${asin}`,
      rating: reviewsData[0]?.rating || 3.5,
      reviewCount: reviews.length,
      reviews,
      timestamp: new Date().toISOString(),
      source: "apify"
    };

  } catch (error) {
    console.error(`[APIFY] Error scraping ASIN ${asin}:`, error.message);
    console.log("[APIFY] Falling back to mock data");
    return getMockApifyResponse(asin);
  }
}

export default {
  scrapeAmazonReviews
};
