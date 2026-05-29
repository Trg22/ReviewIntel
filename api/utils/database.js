/**
 * Supabase Database Helper
 * 
 * Handles all database operations for ReviewIntel including user records,
 * report storage, and analytics
 */

import { createClient } from "@supabase/supabase-js";

/**
 * Initialize Supabase client
 * Uses SERVICE_ROLE_KEY for server-side operations (bypasses RLS)
 */
function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || "https://your-project.supabase.co";
  // Use SERVICE_ROLE_KEY for server-side writes (bypasses RLS)
  // Fall back to ANON_KEY if SERVICE_ROLE_KEY not available
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "your-key";

  if (!url || !key) {
    console.warn("Supabase credentials not configured - using mock mode");
    return null;
  }

  // Log which key is being used (ONLY on startup/first call)
  const keyType = process.env.SUPABASE_SERVICE_ROLE_KEY ? "SERVICE_ROLE_KEY" : "ANON_KEY";
  console.log(`[getSupabaseClient] Using ${keyType} for Supabase operations`);

  return createClient(url, key);
}

/**
 * Save report to database
 * 
 * @param {Object} report - Report data
 * @returns {Promise<Object>} Saved report
 */
export async function saveReport(report) {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    console.log("Mock: Saving report to database");
    return getMockReport(report);
  }

  try {
    console.log("[saveReport] Attempting to save report with ASIN:", report.asin);
    const { data, error } = await supabase.from("reports").insert([
      {
        user_email: report.userEmail,
        product_asin: report.asin,
        product_name: report.productName,
        analysis_results: report.analysis,
        stripe_session_id: report.stripeSessionId,
        pdf_url: report.pdfUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]).select(); // THIS IS THE FIX: .select() returns the inserted row with ID

    if (error) {
      console.error("[saveReport] Supabase insert error:", error.message, "Code:", error.code);
      throw error;
    }
    console.log("[saveReport] Inserted report with ID:", data?.[0]?.id, "ASIN:", data?.[0]?.product_asin);
    return data?.[0] || report;
  } catch (error) {
    console.error("[saveReport] Failed - falling back to mock mode. Error:", error.message);
    return getMockReport(report);
  }
}

/**
 * Get user's reports
 * 
 * @param {string} userEmail - User email
 * @returns {Promise<Array>} User's reports
 */
export async function getUserReports(userEmail) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    console.log(`Mock: Fetching reports for ${userEmail}`);
    return [getMockReport({ userEmail })];
  }

  try {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("user_email", userEmail)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Database error:", error.message);
    return [];
  }
}

/**
 * Get count of user's reports (for tier limit checking)
 * 
 * @param {string} userEmail - User email
 * @returns {Promise<number>} Number of reports generated
 */
export async function getUserReportCount(userEmail) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    console.log(`Mock: Counting reports for ${userEmail}`);
    return 0; // No reports in mock mode
  }

  try {
    const { count, error } = await supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("user_email", userEmail);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error("Database error:", error.message);
    return 0;
  }
}

/**
 * Save user subscription
 * 
 * @param {Object} subscription - Subscription data
 * @returns {Promise<Object>} Saved subscription
 */
export async function saveSubscription(subscription) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    console.log("Mock: Saving subscription");
    return getMockSubscription(subscription);
  }

  try {
    const { data, error } = await supabase.from("subscriptions").upsert([
      {
        user_email: subscription.userEmail,
        stripe_customer_id: subscription.stripeCustomerId,
        stripe_subscription_id: subscription.stripeSubscriptionId,
        plan_type: subscription.planType,
        status: subscription.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);

    if (error) throw error;
    return data?.[0] || subscription;
  } catch (error) {
    console.error("Database error:", error.message);
    return getMockSubscription(subscription);
  }
}

/**
 * Get user subscription
 * 
 * @param {string} userEmail - User email
 * @returns {Promise<Object>} User subscription
 */
export async function getSubscription(userEmail) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    console.log(`Mock: Fetching subscription for ${userEmail}`);
    return getMockSubscription({ userEmail });
  }

  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_email", userEmail)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
    return data || null;
  } catch (error) {
    console.error("Database error:", error.message);
    return null;
  }
}

/**
 * Log analytics event
 * 
 * @param {Object} event - Event data
 * @returns {Promise<Object>} Logged event
 */
export async function logAnalyticsEvent(event) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    console.log("Mock: Logging analytics event:", event.name);
    return { success: true, mock: true };
  }

  try {
    const { data, error } = await supabase.from("analytics").insert([
      {
        event_name: event.name,
        event_data: event.data,
        user_email: event.userEmail,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        created_at: new Date().toISOString()
      }
    ]);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Analytics logging error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Mock report for testing
 */
function getMockReport(baseData) {
  return {
    id: `report-${Date.now()}`,
    user_email: baseData.userEmail || "test@example.com",
    product_asin: baseData.asin || "B0EXAMPLE",
    product_name: baseData.productName || "Example Product",
    analysis_results: baseData.analysis || {},
    pdf_url: baseData.pdfUrl || "https://example.com/report.pdf",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Mock subscription for testing
 */
function getMockSubscription(baseData) {
  return {
    id: `sub-${Date.now()}`,
    user_email: baseData.userEmail || "test@example.com",
    stripe_customer_id: baseData.stripeCustomerId || "cus_mock",
    stripe_subscription_id: baseData.stripeSubscriptionId || "sub_mock",
    plan_type: baseData.planType || "monthly",
    status: baseData.status || "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export default {
  saveReport,
  getUserReports,
  getUserReportCount,
  saveSubscription,
  getSubscription,
  logAnalyticsEvent
};
