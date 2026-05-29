/**
 * Apify Amazon Reviews Scraper Service
 * 
 * Fetches real Amazon reviews for a given ASIN using Apify
 * Replaces mock data for production reports
 */

import axios from "axios";

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_ACTOR_ID = "junglee_com_actor"; // Apify's Amazon reviews actor

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

    // Build Apify input
    const apifyInput = {
      asin: [asin],
      maxReviews: Math.min(maxReviews, 200), // Apify limit
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

    // Transform Apify response to ReviewIntel format
    const reviews = reviewsData.map((review, index) => ({
      id: String(index + 1),
      title: review.reviewTitle || "",
      text: review.reviewText || "",
      rating: parseInt(review.rating) || 3,
      author: review.reviewerName || "Anonymous",
      date: review.reviewDate || new Date().toISOString().split('T')[0],
      helpful: parseInt(review.helpfulCount) || 0,
      verified: review.isVerified === true,
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

/**
 * Mock Apify response as fallback
 * @param {string} asin - Amazon product ASIN
 * @returns {Object} Mock reviews data
 */
function getMockApifyResponse(asin) {
  const mockReviews = [
    {
      id: "1",
      title: "Excellent quality and fast shipping!",
      text: "This product exceeded my expectations. The build quality is outstanding and it arrived faster than expected. Highly recommend!",
      rating: 5,
      author: "Sarah M.",
      date: "2024-05-15",
      helpful: 234,
      verified: true
    },
    {
      id: "2",
      title: "Great value for money",
      text: "Amazing product for the price. Works exactly as described. Will definitely purchase again.",
      rating: 5,
      author: "John D.",
      date: "2024-05-14",
      helpful: 156,
      verified: true
    },
    {
      id: "3",
      title: "Packaging could be better",
      text: "Good product but the packaging was damaged on arrival. Item was fine though. Customer service was helpful.",
      rating: 4,
      author: "Maria K.",
      date: "2024-05-13",
      helpful: 89,
      verified: true
    },
    {
      id: "4",
      title: "Disappointed with durability",
      text: "Stopped working after 3 weeks. Tried to get a refund but process was slow. Not worth the money.",
      rating: 2,
      author: "Alex T.",
      date: "2024-05-12",
      helpful: 567,
      verified: true
    },
    {
      id: "5",
      title: "Outstanding customer service!",
      text: "Had a problem with my order and the support team was incredibly responsive and helpful. Product quality is also top-notch.",
      rating: 5,
      author: "Emma W.",
      date: "2024-05-11",
      helpful: 345,
      verified: true
    }
  ];

  return {
    asin,
    title: `Product ${asin}`,
    rating: 4.2,
    reviewCount: mockReviews.length,
    reviews: mockReviews,
    timestamp: new Date().toISOString(),
    source: "mock"
  };
}

export default {
  scrapeAmazonReviews,
  getMockApifyResponse
};
