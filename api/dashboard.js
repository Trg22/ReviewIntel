/**
 * Dashboard API - User Reports History
 * 
 * GET /api/dashboard?email=user@example.com
 * 
 * Retrieves user's report history from Supabase
 * Shows all previously generated reports and subscription status
 */

import { getUserReports, getSubscription } from "./utils/database.js";

export default async function handler(req, res) {
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
      return res.status(400).json({ error: "Missing email parameter" });
    }

    console.log(`Fetching dashboard data for ${email}`);

    // Fetch user's reports
    const reports = await getUserReports(email);

    // Fetch subscription info
    const subscription = await getSubscription(email);

    return res.status(200).json({
      success: true,
      email,
      reports: reports || [],
      subscription: subscription || null,
      reportCount: (reports || []).length,
      hasActiveSubscription: subscription?.status === "active"
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return res.status(500).json({
      error: "Failed to fetch dashboard data",
      details: error.message
    });
  }
}
