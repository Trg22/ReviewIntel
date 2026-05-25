/**
 * Get Report by Session ID
 * 
 * GET /api/get-report?session_id=XXX
 * 
 * Polls for report by Stripe session ID
 * Returns 404 if not ready yet (frontend will retry)
 * Returns report data when ready
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase credentials missing");
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({
        error: "Missing session_id parameter"
      });
    }

    // Query Supabase for report with this session_id
    const { data, error } = await supabase
      .from("reports")
      .select("id, asin, tier, email, status, created_at")
      .eq("stripe_session_id", session_id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found = report not ready yet
        return res.status(404).json({
          error: "Report not ready yet",
          message: "Still generating your report. Please wait..."
        });
      }
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        error: "Report not found"
      });
    }

    return res.status(200).json({
      reportId: data.id,
      report: data
    });
  } catch (error) {
    console.error("Get report error:", error);
    return res.status(500).json({
      error: "Failed to retrieve report",
      details: error.message
    });
  }
}
