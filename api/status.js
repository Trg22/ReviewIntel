/**
 * Health Check - Status Endpoint
 * 
 * GET /api/status
 * 
 * Simple health check endpoint to verify service is running
 * No dependencies - always returns 200
 * 
 * Response:
 * {
 *   "status": "ok",
 *   "service": "ReviewIntel API",
 *   "version": "1.0.0",
 *   "timestamp": "2026-05-21T20:45:00Z",
 *   "environment": "production|development"
 * }
 */

export default function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS, HEAD");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS" || req.method === "HEAD") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const statusData = {
      status: "ok",
      service: "ReviewIntel API",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      uptime: process.uptime && Math.floor(process.uptime()),
      supabaseConfigured: !!(
        process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
      ),
      stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
      brevoConfigured: !!process.env.BREVO_API_KEY,
    };

    return res.status(200).json(statusData);
  } catch (error) {
    console.error("Status check error:", error);
    return res.status(500).json({
      status: "error",
      error: "Status check failed",
      timestamp: new Date().toISOString(),
    });
  }
}
