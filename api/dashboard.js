/**
 * Dashboard API - User Reports History & Stats
 * 
 * GET /api/dashboard?email=user@example.com
 * 
 * Retrieves user's:
 * - Report history from Supabase
 * - Subscription status
 * - Dashboard statistics
 * 
 * Query parameters:
 *   - email: User email (required)
 * 
 * Response includes:
 * - Count of total reviews analyzed
 * - Average rating from all reviews
 * - Subscription count
 * - Report list with metadata
 */

import {
  getUserReports,
  getSubscription,
  logAnalyticsEvent,
} from "./utils/database.js";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        error: "Missing email parameter",
        example: "/api/dashboard?email=user@example.com",
      });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    console.log(`[dashboard] Fetching dashboard data for ${email}`);

    // Log analytics event
    await logAnalyticsEvent({
      name: "dashboard_accessed",
      userEmail: email,
      ipAddress: req.headers["x-forwarded-for"] || "unknown",
      userAgent: req.headers["user-agent"],
    });

    // Fetch user's reports
    const reports = (await getUserReports(email)) || [];

    // Fetch subscription info
    const subscription = await getSubscription(email);

    // Calculate dashboard statistics
    const stats = calculateDashboardStats(reports);

    const dashboardData = {
      success: true,
      email,
      stats: {
        reviewsCount: stats.totalReviews,
        averageRating: stats.averageRating,
        reportsCount: reports.length,
        subscriptionCount: subscription ? 1 : 0,
      },
      subscription: subscription
        ? {
            id: subscription.id,
            status: subscription.status,
            planType: subscription.plan_type,
            stripeCustomerId: subscription.stripe_customer_id,
            createdAt: subscription.created_at,
            updatedAt: subscription.updated_at,
          }
        : null,
      reports: reports.map((report) => ({
        id: report.id,
        asin: report.product_asin,
        productName: report.product_name,
        createdAt: report.created_at,
        updatedAt: report.updated_at,
        pdfUrl: report.pdf_url,
        analysisResults: report.analysis_results,
      })),
      metadata: {
        hasActiveSubscription: subscription?.status === "active",
        lastReportDate: reports.length > 0 ? reports[0].created_at : null,
        accountCreatedAt: reports.length > 0 ? reports[reports.length - 1].created_at : null,
      },
      timestamp: new Date().toISOString(),
    };

    return res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return res.status(500).json({
      error: "Failed to fetch dashboard data",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Calculate dashboard statistics from reports
 * @param {Array} reports - Array of report objects
 * @returns {Object} Aggregated statistics
 */
function calculateDashboardStats(reports) {
  if (!reports || reports.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      totalReports: 0,
    };
  }

  let totalReviews = 0;
  let sumRatings = 0;
  let ratingCount = 0;

  reports.forEach((report) => {
    if (report.analysis_results) {
      // Count reviews if available in analysis
      if (report.analysis_results.total_reviews) {
        totalReviews += report.analysis_results.total_reviews;
      }

      // Calculate average rating
      if (report.analysis_results.average_rating) {
        sumRatings += report.analysis_results.average_rating;
        ratingCount++;
      }
    }
  });

  const averageRating =
    ratingCount > 0 ? (sumRatings / ratingCount).toFixed(2) : 0;

  return {
    totalReviews: totalReviews,
    averageRating: parseFloat(averageRating),
    totalReports: reports.length,
  };
}
